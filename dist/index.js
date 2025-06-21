// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  loans;
  transactions;
  stats;
  currentUserId;
  currentLoanId;
  currentTransactionId;
  currentStatsId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.loans = /* @__PURE__ */ new Map();
    this.transactions = /* @__PURE__ */ new Map();
    this.stats = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentLoanId = 1;
    this.currentTransactionId = 1;
    this.currentStatsId = 1;
    this.initializeDemoData();
  }
  initializeDemoData() {
    const demoUser = {
      username: "John Doe",
      email: "john@example.com",
      password: "password123",
      walletAddress: "0x71C...4E92",
      btcBalance: 0.45,
      avatarInitials: "JD",
      rating: 4.8
    };
    const user = this.createUser(demoUser);
    this.createStats({
      userId: user.id,
      totalBorrowed: 1.25,
      totalLent: 2.75,
      activeLoans: 5,
      interestEarned: 0.12
    });
    const loan1 = {
      borrowerId: user.id,
      lenderId: void 0,
      amount: 0.5,
      interest: 6.5,
      durationMonths: 3,
      status: "active",
      type: "request",
      hasCollateral: true
    };
    const loan2 = {
      borrowerId: void 0,
      lenderId: user.id,
      amount: 0.75,
      interest: 5.2,
      durationMonths: 6,
      status: "active",
      type: "offer",
      hasCollateral: true
    };
    const loan3 = {
      borrowerId: void 0,
      lenderId: user.id,
      amount: 1.2,
      interest: 4.8,
      durationMonths: 12,
      status: "pending",
      type: "offer",
      hasCollateral: true
    };
    const loan4 = {
      borrowerId: 2,
      lenderId: void 0,
      amount: 0.35,
      interest: 7.2,
      durationMonths: 4,
      status: "pending",
      type: "request",
      hasCollateral: true
    };
    const loan5 = {
      borrowerId: 3,
      lenderId: void 0,
      amount: 0.65,
      interest: 6.5,
      durationMonths: 6,
      status: "pending",
      type: "request",
      hasCollateral: true
    };
    const loan6 = {
      borrowerId: void 0,
      lenderId: 4,
      amount: 1,
      interest: 5,
      durationMonths: 12,
      status: "pending",
      type: "offer",
      hasCollateral: true
    };
    const loan7 = {
      borrowerId: void 0,
      lenderId: 5,
      amount: 0.5,
      interest: 4.8,
      durationMonths: 3,
      status: "pending",
      type: "offer",
      hasCollateral: false
    };
    this.createLoan(loan1);
    this.createLoan(loan2);
    this.createLoan(loan3);
    this.createLoan(loan4);
    this.createLoan(loan5);
    this.createLoan(loan6);
    this.createLoan(loan7);
    const transaction1 = {
      userId: user.id,
      loanId: 1,
      amount: 0.12,
      type: "repayment",
      description: "Loan Repayment",
      txHash: "0x123",
      usdValue: 4245
    };
    const transaction2 = {
      userId: user.id,
      loanId: 2,
      amount: 0.75,
      type: "disbursement",
      description: "Loan Disbursed",
      txHash: "0x456",
      usdValue: 26531.25
    };
    const transaction3 = {
      userId: user.id,
      loanId: void 0,
      amount: 1.5,
      type: "deposit",
      description: "Deposit",
      txHash: "0x789",
      usdValue: 53062.5
    };
    this.createTransaction(transaction1);
    this.createTransaction(transaction2);
    this.createTransaction(transaction3);
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async getUserByWalletAddress(walletAddress) {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const now = /* @__PURE__ */ new Date();
    const user = {
      ...insertUser,
      id
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserBalance(id, balance) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const updatedUser = { ...user, btcBalance: balance };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Loan operations
  async getLoan(id) {
    return this.loans.get(id);
  }
  async getUserLoans(userId) {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.borrowerId === userId || loan.lenderId === userId
    );
  }
  async getActiveLoans(userId) {
    return Array.from(this.loans.values()).filter(
      (loan) => (loan.borrowerId === userId || loan.lenderId === userId) && loan.status === "active"
    );
  }
  async getMarketplaceLoans() {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.status === "pending"
    );
  }
  async createLoan(insertLoan) {
    const id = this.currentLoanId++;
    const now = /* @__PURE__ */ new Date();
    const loan = {
      ...insertLoan,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.loans.set(id, loan);
    return loan;
  }
  async updateLoanStatus(id, status) {
    const loan = await this.getLoan(id);
    if (!loan) return void 0;
    const updatedLoan = { ...loan, status, updatedAt: /* @__PURE__ */ new Date() };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
  // Transaction operations
  async getTransaction(id) {
    return this.transactions.get(id);
  }
  async getUserTransactions(userId) {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    ).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async createTransaction(insertTransaction) {
    const id = this.currentTransactionId++;
    const now = /* @__PURE__ */ new Date();
    const transaction = {
      ...insertTransaction,
      id,
      createdAt: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  // Stats operations
  async getUserStats(userId) {
    return Array.from(this.stats.values()).find(
      (stat) => stat.userId === userId
    );
  }
  async createStats(insertStats) {
    const id = this.currentStatsId++;
    const stats2 = {
      ...insertStats,
      id
    };
    this.stats.set(id, stats2);
    return stats2;
  }
  async updateStats(userId, updatedStats) {
    const stats2 = await this.getUserStats(userId);
    if (!stats2) return void 0;
    const newStats = { ...stats2, ...updatedStats };
    this.stats.set(stats2.id, newStats);
    return newStats;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  btcBalance: doublePrecision("btc_balance").default(0),
  avatarInitials: text("avatar_initials"),
  rating: doublePrecision("rating").default(0)
});
var loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id),
  borrowerId: integer("borrower_id").references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  interest: doublePrecision("interest").notNull(),
  durationMonths: integer("duration_months").notNull(),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull(),
  // 'request' or 'offer'
  hasCollateral: boolean("has_collateral").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  loanId: integer("loan_id").references(() => loans.id),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(),
  // 'repayment', 'disbursement', 'deposit', 'withdrawal'
  description: text("description").notNull(),
  txHash: text("tx_hash"),
  usdValue: doublePrecision("usd_value"),
  createdAt: timestamp("created_at").defaultNow()
});
var stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalBorrowed: doublePrecision("total_borrowed").default(0),
  totalLent: doublePrecision("total_lent").default(0),
  activeLoans: integer("active_loans").default(0),
  interestEarned: doublePrecision("interest_earned").default(0)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  walletAddress: true,
  btcBalance: true,
  avatarInitials: true,
  rating: true
});
var insertLoanSchema = createInsertSchema(loans).pick({
  lenderId: true,
  borrowerId: true,
  amount: true,
  interest: true,
  durationMonths: true,
  status: true,
  type: true,
  hasCollateral: true
});
var insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  loanId: true,
  amount: true,
  type: true,
  description: true,
  txHash: true,
  usdValue: true
});
var insertStatsSchema = createInsertSchema(stats).pick({
  userId: true,
  totalBorrowed: true,
  totalLent: true,
  activeLoans: true,
  interestEarned: true
});
var loanOfferSchema = z.object({
  amount: z.number().min(0.01),
  interest: z.number().min(0).max(100),
  durationMonths: z.number().int().min(1),
  hasCollateral: z.boolean().default(false)
});
var loanRequestSchema = z.object({
  amount: z.number().min(0.01),
  interest: z.number().min(0).max(100),
  durationMonths: z.number().int().min(1),
  hasCollateral: z.boolean().default(false)
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
var connectWalletSchema = z.object({
  walletAddress: z.string()
});

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";
async function registerRoutes(app2) {
  const MemoryStoreSession = MemoryStore(session);
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 864e5 },
      // 1 day
      store: new MemoryStoreSession({
        checkPeriod: 864e5
        // prune expired entries every 24h
      })
    })
  );
  const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/connect-wallet", async (req, res) => {
    try {
      const data = connectWalletSchema.parse(req.body);
      let user = await storage.getUserByWalletAddress(data.walletAddress);
      if (!user) {
        const initials = "BT";
        user = await storage.createUser({
          username: `User-${Math.floor(Math.random() * 1e3)}`,
          email: `${Math.random().toString(36).substring(2)}@wallet.user`,
          password: crypto.randomBytes(16).toString("hex"),
          walletAddress: data.walletAddress,
          btcBalance: 0,
          avatarInitials: initials,
          rating: 0
        });
        await storage.createStats({
          userId: user.id,
          totalBorrowed: 0,
          totalLent: 0,
          activeLoans: 0,
          interestEarned: 0
        });
      }
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const stats2 = await storage.getUserStats(req.session.userId);
      if (!stats2) {
        return res.status(404).json({ message: "Stats not found" });
      }
      return res.status(200).json(stats2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/user/balance", isAuthenticated, async (req, res) => {
    try {
      const { balance } = req.body;
      if (typeof balance !== "number" || balance < 0) {
        return res.status(400).json({ message: "Invalid balance" });
      }
      const updatedUser = await storage.updateUserBalance(req.session.userId, balance);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/loans", isAuthenticated, async (req, res) => {
    try {
      const loans2 = await storage.getUserLoans(req.session.userId);
      return res.status(200).json(loans2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/loans/active", isAuthenticated, async (req, res) => {
    try {
      const loans2 = await storage.getActiveLoans(req.session.userId);
      return res.status(200).json(loans2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/loans/marketplace", isAuthenticated, async (req, res) => {
    try {
      const loans2 = await storage.getMarketplaceLoans();
      return res.status(200).json(loans2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/loans/request", isAuthenticated, async (req, res) => {
    try {
      const data = loanRequestSchema.parse(req.body);
      const loan = await storage.createLoan({
        borrowerId: req.session.userId,
        lenderId: void 0,
        amount: data.amount,
        interest: data.interest,
        durationMonths: data.durationMonths,
        status: "pending",
        type: "request",
        hasCollateral: data.hasCollateral
      });
      return res.status(201).json(loan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/loans/offer", isAuthenticated, async (req, res) => {
    try {
      const data = loanOfferSchema.parse(req.body);
      const loan = await storage.createLoan({
        borrowerId: void 0,
        lenderId: req.session.userId,
        amount: data.amount,
        interest: data.interest,
        durationMonths: data.durationMonths,
        status: "pending",
        type: "offer",
        hasCollateral: data.hasCollateral
      });
      return res.status(201).json(loan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/loans/:id/accept", isAuthenticated, async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      if (loan.status !== "pending") {
        return res.status(400).json({ message: "Loan is not in pending status" });
      }
      if (loan.type === "request" && !loan.lenderId) {
        const updatedLoan = await storage.updateLoanStatus(loanId, "active");
        if (updatedLoan) {
          const lenderStats = await storage.getUserStats(req.session.userId);
          if (lenderStats) {
            await storage.updateStats(req.session.userId, {
              totalLent: lenderStats.totalLent + loan.amount,
              activeLoans: lenderStats.activeLoans + 1
            });
          }
          const borrowerStats = await storage.getUserStats(loan.borrowerId);
          if (borrowerStats) {
            await storage.updateStats(loan.borrowerId, {
              totalBorrowed: borrowerStats.totalBorrowed + loan.amount,
              activeLoans: borrowerStats.activeLoans + 1
            });
          }
          await storage.createTransaction({
            userId: req.session.userId,
            loanId,
            amount: loan.amount,
            type: "disbursement",
            description: "Loan Disbursed",
            txHash: `tx_${Math.random().toString(36).substring(2)}`,
            usdValue: loan.amount * 35e3
            // Assuming $35k per BTC for simplicity
          });
          return res.status(200).json(updatedLoan);
        }
      }
      if (loan.type === "offer" && !loan.borrowerId) {
        const updatedLoan = await storage.updateLoanStatus(loanId, "active");
        if (updatedLoan) {
          const borrowerStats = await storage.getUserStats(req.session.userId);
          if (borrowerStats) {
            await storage.updateStats(req.session.userId, {
              totalBorrowed: borrowerStats.totalBorrowed + loan.amount,
              activeLoans: borrowerStats.activeLoans + 1
            });
          }
          const lenderStats = await storage.getUserStats(loan.lenderId);
          if (lenderStats) {
            await storage.updateStats(loan.lenderId, {
              totalLent: lenderStats.totalLent + loan.amount,
              activeLoans: lenderStats.activeLoans + 1
            });
          }
          await storage.createTransaction({
            userId: loan.lenderId,
            loanId,
            amount: loan.amount,
            type: "disbursement",
            description: "Loan Disbursed",
            txHash: `tx_${Math.random().toString(36).substring(2)}`,
            usdValue: loan.amount * 35e3
            // Assuming $35k per BTC for simplicity
          });
          return res.status(200).json(updatedLoan);
        }
      }
      return res.status(400).json({ message: "Cannot accept this loan" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/loans/:id/repay", isAuthenticated, async (req, res) => {
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
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        loanId,
        amount,
        type: "repayment",
        description: "Loan Repayment",
        txHash: `tx_${Math.random().toString(36).substring(2)}`,
        usdValue: amount * 35e3
        // Assuming $35k per BTC for simplicity
      });
      const lenderStats = await storage.getUserStats(loan.lenderId);
      if (lenderStats) {
        const interestAmount = amount * (loan.interest / 100);
        await storage.updateStats(loan.lenderId, {
          interestEarned: lenderStats.interestEarned + interestAmount
        });
      }
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions2 = await storage.getUserTransactions(req.session.userId);
      return res.status(200).json(transactions2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/transactions/deposit", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUserBalance(user.id, user.btcBalance + amount);
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        loanId: void 0,
        amount,
        type: "deposit",
        description: "Deposit",
        txHash: `tx_${Math.random().toString(36).substring(2)}`,
        usdValue: amount * 35e3
        // Assuming $35k per BTC for simplicity
      });
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
