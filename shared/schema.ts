import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  btcBalance: doublePrecision("btc_balance").default(0),
  avatarInitials: text("avatar_initials"),
  rating: doublePrecision("rating").default(0),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id),
  borrowerId: integer("borrower_id").references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  interest: doublePrecision("interest").notNull(),
  durationMonths: integer("duration_months").notNull(),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull(), // 'request' or 'offer'
  hasCollateral: boolean("has_collateral").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  loanId: integer("loan_id").references(() => loans.id),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'repayment', 'disbursement', 'deposit', 'withdrawal'
  description: text("description").notNull(),
  txHash: text("tx_hash"),
  usdValue: doublePrecision("usd_value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalBorrowed: doublePrecision("total_borrowed").default(0),
  totalLent: doublePrecision("total_lent").default(0),
  activeLoans: integer("active_loans").default(0),
  interestEarned: doublePrecision("interest_earned").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  walletAddress: true,
  btcBalance: true,
  avatarInitials: true,
  rating: true,
});

export const insertLoanSchema = createInsertSchema(loans).pick({
  lenderId: true,
  borrowerId: true,
  amount: true,
  interest: true,
  durationMonths: true,
  status: true,
  type: true,
  hasCollateral: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  loanId: true,
  amount: true,
  type: true,
  description: true,
  txHash: true,
  usdValue: true,
});

export const insertStatsSchema = createInsertSchema(stats).pick({
  userId: true,
  totalBorrowed: true,
  totalLent: true,
  activeLoans: true,
  interestEarned: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

// Loan marketplace schema
export const loanOfferSchema = z.object({
  amount: z.number().min(0.01),
  interest: z.number().min(0).max(100),
  durationMonths: z.number().int().min(1),
  hasCollateral: z.boolean().default(false),
});

export const loanRequestSchema = z.object({
  amount: z.number().min(0.01),
  interest: z.number().min(0).max(100),
  durationMonths: z.number().int().min(1),
  hasCollateral: z.boolean().default(false),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Connect wallet schema
export const connectWalletSchema = z.object({
  walletAddress: z.string(),
});
