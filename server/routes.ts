import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, connectWalletSchema, loanRequestSchema, loanOfferSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Middleware to check authentication
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/connect-wallet", async (req, res) => {
    try {
      const data = connectWalletSchema.parse(req.body);
      
      // Check if user already exists with this wallet address
      let user = await storage.getUserByWalletAddress(data.walletAddress);
      
      if (!user) {
        // Create a new user with wallet address
        const initials = "BT"; // Default initials for Bitcoin user
        user = await storage.createUser({
          username: `User-${Math.floor(Math.random() * 1000)}`,
          email: `${Math.random().toString(36).substring(2)}@wallet.user`,
          password: crypto.randomBytes(16).toString("hex"),
          walletAddress: data.walletAddress,
          btcBalance: 0,
          avatarInitials: initials,
          rating: 0,
        });
        
        // Create initial stats for the user
        await storage.createStats({
          userId: user.id,
          totalBorrowed: 0,
          totalLent: 0,
          activeLoans: 0,
          interestEarned: 0,
        });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId as number);
      
      if (!stats) {
        return res.status(404).json({ message: "Stats not found" });
      }
      
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/balance", isAuthenticated, async (req, res) => {
    try {
      const { balance } = req.body;
      
      if (typeof balance !== "number" || balance < 0) {
        return res.status(400).json({ message: "Invalid balance" });
      }
      
      const updatedUser = await storage.updateUserBalance(req.session.userId as number, balance);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Loan routes
  app.get("/api/loans", isAuthenticated, async (req, res) => {
    try {
      const loans = await storage.getUserLoans(req.session.userId as number);
      return res.status(200).json(loans);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/loans/active", isAuthenticated, async (req, res) => {
    try {
      const loans = await storage.getActiveLoans(req.session.userId as number);
      return res.status(200).json(loans);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/loans/marketplace", isAuthenticated, async (req, res) => {
    try {
      const loans = await storage.getMarketplaceLoans();
      return res.status(200).json(loans);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/loans/request", isAuthenticated, async (req, res) => {
    try {
      const data = loanRequestSchema.parse(req.body);
      
      const loan = await storage.createLoan({
        borrowerId: req.session.userId as number,
        lenderId: undefined,
        amount: data.amount,
        interest: data.interest,
        durationMonths: data.durationMonths,
        status: "pending",
        type: "request",
        hasCollateral: data.hasCollateral,
      });
      
      return res.status(201).json(loan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/loans/offer", isAuthenticated, async (req, res) => {
    try {
      const data = loanOfferSchema.parse(req.body);
      
      const loan = await storage.createLoan({
        borrowerId: undefined,
        lenderId: req.session.userId as number,
        amount: data.amount,
        interest: data.interest,
        durationMonths: data.durationMonths,
        status: "pending",
        type: "offer",
        hasCollateral: data.hasCollateral,
      });
      
      return res.status(201).json(loan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/loans/:id/accept", isAuthenticated, async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      if (loan.status !== "pending") {
        return res.status(400).json({ message: "Loan is not in pending status" });
      }
      
      // If it's a loan request, the current user becomes the lender
      if (loan.type === "request" && !loan.lenderId) {
        const updatedLoan = await storage.updateLoanStatus(loanId, "active");
        
        if (updatedLoan) {
          const lenderStats = await storage.getUserStats(req.session.userId as number);
          
          if (lenderStats) {
            await storage.updateStats(req.session.userId as number, {
              totalLent: lenderStats.totalLent + loan.amount,
              activeLoans: lenderStats.activeLoans + 1,
            });
          }
          
          const borrowerStats = await storage.getUserStats(loan.borrowerId as number);
          
          if (borrowerStats) {
            await storage.updateStats(loan.borrowerId as number, {
              totalBorrowed: borrowerStats.totalBorrowed + loan.amount,
              activeLoans: borrowerStats.activeLoans + 1,
            });
          }
          
          // Create transaction for loan disbursement
          await storage.createTransaction({
            userId: req.session.userId as number,
            loanId,
            amount: loan.amount,
            type: "disbursement",
            description: "Loan Disbursed",
            txHash: `tx_${Math.random().toString(36).substring(2)}`,
            usdValue: loan.amount * 35000, // Assuming $35k per BTC for simplicity
          });
          
          return res.status(200).json(updatedLoan);
        }
      }
      
      // If it's a loan offer, the current user becomes the borrower
      if (loan.type === "offer" && !loan.borrowerId) {
        const updatedLoan = await storage.updateLoanStatus(loanId, "active");
        
        if (updatedLoan) {
          const borrowerStats = await storage.getUserStats(req.session.userId as number);
          
          if (borrowerStats) {
            await storage.updateStats(req.session.userId as number, {
              totalBorrowed: borrowerStats.totalBorrowed + loan.amount,
              activeLoans: borrowerStats.activeLoans + 1,
            });
          }
          
          const lenderStats = await storage.getUserStats(loan.lenderId as number);
          
          if (lenderStats) {
            await storage.updateStats(loan.lenderId as number, {
              totalLent: lenderStats.totalLent + loan.amount,
              activeLoans: lenderStats.activeLoans + 1,
            });
          }
          
          // Create transaction for loan disbursement
          await storage.createTransaction({
            userId: loan.lenderId as number,
            loanId,
            amount: loan.amount,
            type: "disbursement",
            description: "Loan Disbursed",
            txHash: `tx_${Math.random().toString(36).substring(2)}`,
            usdValue: loan.amount * 35000, // Assuming $35k per BTC for simplicity
          });
          
          return res.status(200).json(updatedLoan);
        }
      }
      
      return res.status(400).json({ message: "Cannot accept this loan" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/loans/:id/repay", isAuthenticated, async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      const { amount } = req.body;
      
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      if (loan.status !== "active") {
        return res.status(400).json({ message: "Loan is not active" });
      }
      
      if (loan.borrowerId !== req.session.userId) {
        return res.status(403).json({ message: "You are not the borrower of this loan" });
      }
      
      // Create transaction for loan repayment
      const transaction = await storage.createTransaction({
        userId: req.session.userId as number,
        loanId,
        amount,
        type: "repayment",
        description: "Loan Repayment",
        txHash: `tx_${Math.random().toString(36).substring(2)}`,
        usdValue: amount * 35000, // Assuming $35k per BTC for simplicity
      });
      
      // Update lender stats for interest earned
      const lenderStats = await storage.getUserStats(loan.lenderId as number);
      
      if (lenderStats) {
        const interestAmount = amount * (loan.interest / 100);
        await storage.updateStats(loan.lenderId as number, {
          interestEarned: lenderStats.interestEarned + interestAmount,
        });
      }
      
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.session.userId as number);
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/transactions/deposit", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get current user
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(user.id, user.btcBalance + amount);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId: req.session.userId as number,
        loanId: undefined,
        amount,
        type: "deposit",
        description: "Deposit",
        txHash: `tx_${Math.random().toString(36).substring(2)}`,
        usdValue: amount * 35000, // Assuming $35k per BTC for simplicity
      });
      
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
