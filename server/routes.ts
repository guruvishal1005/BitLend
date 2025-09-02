import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { log } from "./vite"; // Ensure log is imported
import { loginSchema, connectWalletSchema, loanRequestSchema, loanOfferSchema } from "@shared/schema";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// log is already imported at the top. This section cleans up the duplicate function definition.

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session
  const MemoryStoreSession = MemoryStore(session);
  let sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    if (process.env.NODE_ENV === "production") {
      // Using console.error directly as this is a critical startup issue
      console.error("FATAL ERROR: SESSION_SECRET is not set in production. Please set a strong, random secret.");
      // In a real production scenario, you might want to exit the process
      // process.exit(1);
      // For now, we'll generate one but strongly advise against it for production.
      sessionSecret = crypto.randomBytes(32).toString("hex");
      log("WARNING: SESSION_SECRET was not set in production. A temporary secret has been generated. THIS IS NOT SECURE FOR PRODUCTION DEPLOYMENTS AND WILL CAUSE ALL SESSIONS TO INVALIDATE ON RESTART.");
    } else {
      sessionSecret = crypto.randomBytes(32).toString("hex");
      log("SESSION_SECRET not set. Generating a random secret for development. All sessions will invalidate on restart.");
    }
  } else {
    log("SESSION_SECRET loaded from environment variable.");
  }

  app.use(
    session({
      secret: sessionSecret,
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
      
      if (!user) {
        // To prevent timing attacks, it's good practice to still run a hash comparison
        // even if the user is not found. We can use a dummy hash.
        // However, for simplicity here, we'll just return.
        // In a real app, consider `await bcrypt.compare(data.password, dummyHash);`
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(data.password, user.password);
      if (!passwordMatch) {
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
        const saltRounds = 10;
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

        user = await storage.createUser({
          username: `User-${Math.floor(Math.random() * 1000)}`,
          email: `${Math.random().toString(36).substring(2)}@wallet.user`,
          password: hashedPassword, // Store hashed password
          walletAddress: data.walletAddress,
          btcBalance: 0,
          ethBalance: 0,
          solBalance: 0,
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
    // CRITICAL NOTE: This endpoint allows direct modification of user balances stored
    // on the server. This is potentially very dangerous if these balances are intended
    // to reflect actual on-chain assets without proper verification against blockchain
    // transactions.
    // This endpoint should ideally be:
    // 1. Removed if balances are purely on-chain and managed by user wallets.
    // 2. Restricted to admin users or specific internal system processes.
    // 3. Used ONLY as part of a verified deposit/withdrawal flow where an actual
    //    on-chain transaction has been confirmed by other means.
    // For the current scope, leaving functional but highlighting the risk.
    try {
      const balances = req.body;
      
      // Validate balance updates
      const validBalances: any = {};
      if (typeof balances.btcBalance === "number" && balances.btcBalance >= 0) {
        validBalances.btcBalance = balances.btcBalance;
      }
      if (typeof balances.ethBalance === "number" && balances.ethBalance >= 0) {
        validBalances.ethBalance = balances.ethBalance;
      }
      if (typeof balances.solBalance === "number" && balances.solBalance >= 0) {
        validBalances.solBalance = balances.solBalance;
      }
      
      if (Object.keys(validBalances).length === 0) {
        return res.status(400).json({ message: "No valid balance updates provided" });
      }
      
      const updatedUser = await storage.updateUserBalance(req.session.userId as number, validBalances);
      
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
        currency: data.currency,
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
        currency: data.currency,
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
            const currentTotalLent = lenderStats.totalLent ?? 0;
            const currentActiveLoans = lenderStats.activeLoans ?? 0;
            await storage.updateStats(req.session.userId as number, {
              totalLent: currentTotalLent + loan.amount,
              activeLoans: currentActiveLoans + 1,
            });
          }
          
          const borrowerStats = await storage.getUserStats(loan.borrowerId as number);
          
          if (borrowerStats) {
            const currentTotalBorrowed = borrowerStats.totalBorrowed ?? 0;
            const currentActiveLoans = borrowerStats.activeLoans ?? 0;
            await storage.updateStats(loan.borrowerId as number, {
              totalBorrowed: currentTotalBorrowed + loan.amount,
              activeLoans: currentActiveLoans + 1,
            });
          }
          
          // Get USD rate based on currency
          const usdRates = { BTC: 35000, ETH: 2000, SOL: 100 };
          const usdValue = loan.amount * (usdRates[loan.currency as keyof typeof usdRates] || 1);
          
          // Client should ideally provide the actual on-chain transaction hash
          const clientTxHash = req.body.txHash;
          const finalTxHash = typeof clientTxHash === 'string' && clientTxHash.trim() !== ''
                              ? clientTxHash
                              : `mock_disburse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          if (!clientTxHash) {
            log(`WARNING: No txHash provided by client for loan ${loanId} acceptance (lender). Using mock hash: ${finalTxHash}`);
          }

          // Create transaction for loan disbursement
          await storage.createTransaction({
            userId: req.session.userId as number, // The user accepting (lender)
            loanId,
            amount: loan.amount,
            currency: loan.currency,
            type: "disbursement",
            description: `${loan.currency} Loan Disbursed`,
            txHash: finalTxHash,
            usdValue,
          });
          
          return res.status(200).json(updatedLoan);
        }
      }
      
      // If it's a loan offer, the current user becomes the borrower
      if (loan.type === "offer" && !loan.borrowerId) {
        // The borrower is accepting the offer. The LENDER would have initiated the on-chain transaction.
        // The client (borrower) should pass the txHash obtained from the lender or from observing the chain.
        const updatedLoan = await storage.updateLoanStatus(loanId, "active");
        
        if (updatedLoan) {
          const borrowerStats = await storage.getUserStats(req.session.userId as number);
          
          if (borrowerStats) {
            const currentTotalBorrowed = borrowerStats.totalBorrowed ?? 0;
            const currentActiveLoans = borrowerStats.activeLoans ?? 0;
            await storage.updateStats(req.session.userId as number, {
              totalBorrowed: currentTotalBorrowed + loan.amount,
              activeLoans: currentActiveLoans + 1,
            });
          }
          
          const lenderStats = await storage.getUserStats(loan.lenderId as number);
          
          if (lenderStats) {
            const currentTotalLent = lenderStats.totalLent ?? 0;
            const currentActiveLoans = lenderStats.activeLoans ?? 0;
            await storage.updateStats(loan.lenderId as number, {
              totalLent: currentTotalLent + loan.amount,
              activeLoans: currentActiveLoans + 1,
            });
          }
          
          // Get USD rate based on currency
          const usdRates = { BTC: 35000, ETH: 2000, SOL: 100 };
          const usdValue = loan.amount * (usdRates[loan.currency as keyof typeof usdRates] || 1);
          
          // Create transaction for loan disbursement
          await storage.createTransaction({
            userId: loan.lenderId as number,
            loanId,
            amount: loan.amount,
            currency: loan.currency,
            type: "disbursement",
            description: `${loan.currency} Loan Disbursed`,
            txHash: `tx_${Math.random().toString(36).substring(2)}`,
            usdValue,
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
      const { amount, currency } = req.body;
      
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
      
      // Get USD rate based on currency
      const usdRates = { BTC: 35000, ETH: 2000, SOL: 100 };
      const repaymentCurrency = currency || loan.currency;
      const usdValue = amount * (usdRates[repaymentCurrency as keyof typeof usdRates] || 1);

      // Client should ideally provide the actual on-chain transaction hash for the repayment
      const clientTxHash = req.body.txHash;
      const finalTxHash = typeof clientTxHash === 'string' && clientTxHash.trim() !== ''
                          ? clientTxHash
                          : `mock_repay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (!clientTxHash) {
        log(`WARNING: No txHash provided by client for loan ${loanId} repayment. Using mock hash: ${finalTxHash}`);
      }
      
      // Create transaction for loan repayment
      const transaction = await storage.createTransaction({
        userId: req.session.userId as number, // Borrower is making the repayment
        loanId,
        amount,
        currency: repaymentCurrency,
        type: "repayment",
        description: `${repaymentCurrency} Loan Repayment`,
        txHash: finalTxHash,
        usdValue,
      });
      
      // Update lender stats for interest earned
      const lenderStats = await storage.getUserStats(loan.lenderId as number);
      
      if (lenderStats) {
        const currentInterestEarned = lenderStats.interestEarned ?? 0;
        const interestAmount = amount * (loan.interest / 100); // Assuming loan.interest is non-null and valid percentage
        await storage.updateStats(loan.lenderId as number, {
          interestEarned: currentInterestEarned + interestAmount,
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
      const { amount, currency = "BTC" } = req.body;
      
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get current user
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user balance based on currency
      const balanceUpdate: any = {};
      const currentBtcBalance = user.btcBalance ?? 0;
      const currentEthBalance = user.ethBalance ?? 0;
      const currentSolBalance = user.solBalance ?? 0;

      switch (currency) {
        case "BTC":
          balanceUpdate.btcBalance = currentBtcBalance + amount;
          break;
        case "ETH":
          balanceUpdate.ethBalance = currentEthBalance + amount;
          break;
        case "SOL":
          balanceUpdate.solBalance = currentSolBalance + amount;
          break;
        default:
          return res.status(400).json({ message: "Unsupported currency" });
      }
      
      const updatedUser = await storage.updateUserBalance(user.id, balanceUpdate);
      
      // Get USD rate based on currency
      const usdRates = { BTC: 35000, ETH: 2000, SOL: 100 };
      const usdValue = amount * (usdRates[currency as keyof typeof usdRates] || 1);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId: req.session.userId as number,
        loanId: undefined,
        amount,
        currency,
        type: "deposit",
        description: `${currency} Deposit`,
        txHash: `tx_${Math.random().toString(36).substring(2)}`,
        usdValue,
      });
      
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}