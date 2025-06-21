import { users, loans, transactions, stats, type User, type InsertUser, type Loan, type InsertLoan, type Transaction, type InsertTransaction, type Stats, type InsertStats } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<User | undefined>;
  
  // Loan operations
  getLoan(id: number): Promise<Loan | undefined>;
  getUserLoans(userId: number): Promise<Loan[]>;
  getActiveLoans(userId: number): Promise<Loan[]>;
  getMarketplaceLoans(): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoanStatus(id: number, status: string): Promise<Loan | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Stats operations
  getUserStats(userId: number): Promise<Stats | undefined>;
  createStats(stats: InsertStats): Promise<Stats>;
  updateStats(userId: number, updatedStats: Partial<InsertStats>): Promise<Stats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loans: Map<number, Loan>;
  private transactions: Map<number, Transaction>;
  private stats: Map<number, Stats>;
  
  currentUserId: number;
  currentLoanId: number;
  currentTransactionId: number;
  currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.loans = new Map();
    this.transactions = new Map();
    this.stats = new Map();
    
    this.currentUserId = 1;
    this.currentLoanId = 1;
    this.currentTransactionId = 1;
    this.currentStatsId = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "John Doe",
      email: "john@example.com",
      password: "password123",
      walletAddress: "0x71C...4E92",
      btcBalance: 0.45,
      avatarInitials: "JD",
      rating: 4.8,
    };
    
    const user = this.createUser(demoUser);
    
    // Create user stats
    this.createStats({
      userId: user.id,
      totalBorrowed: 1.25,
      totalLent: 2.75,
      activeLoans: 5,
      interestEarned: 0.12,
    });
    
    // Create some sample loans
    const loan1: InsertLoan = {
      borrowerId: user.id,
      lenderId: undefined,
      amount: 0.5,
      interest: 6.5,
      durationMonths: 3,
      status: "active",
      type: "request",
      hasCollateral: true,
    };
    
    const loan2: InsertLoan = {
      borrowerId: undefined,
      lenderId: user.id,
      amount: 0.75,
      interest: 5.2,
      durationMonths: 6,
      status: "active",
      type: "offer",
      hasCollateral: true,
    };
    
    const loan3: InsertLoan = {
      borrowerId: undefined,
      lenderId: user.id,
      amount: 1.2,
      interest: 4.8,
      durationMonths: 12,
      status: "pending",
      type: "offer",
      hasCollateral: true,
    };
    
    // Marketplace loans
    const loan4: InsertLoan = {
      borrowerId: 2,
      lenderId: undefined,
      amount: 0.35,
      interest: 7.2,
      durationMonths: 4,
      status: "pending",
      type: "request",
      hasCollateral: true,
    };
    
    const loan5: InsertLoan = {
      borrowerId: 3,
      lenderId: undefined,
      amount: 0.65,
      interest: 6.5,
      durationMonths: 6,
      status: "pending",
      type: "request",
      hasCollateral: true,
    };
    
    const loan6: InsertLoan = {
      borrowerId: undefined,
      lenderId: 4,
      amount: 1.0,
      interest: 5.0,
      durationMonths: 12,
      status: "pending",
      type: "offer",
      hasCollateral: true,
    };
    
    const loan7: InsertLoan = {
      borrowerId: undefined,
      lenderId: 5,
      amount: 0.5,
      interest: 4.8,
      durationMonths: 3,
      status: "pending",
      type: "offer",
      hasCollateral: false,
    };
    
    this.createLoan(loan1);
    this.createLoan(loan2);
    this.createLoan(loan3);
    this.createLoan(loan4);
    this.createLoan(loan5);
    this.createLoan(loan6);
    this.createLoan(loan7);
    
    // Create some sample transactions
    const transaction1: InsertTransaction = {
      userId: user.id,
      loanId: 1,
      amount: 0.12,
      type: "repayment",
      description: "Loan Repayment",
      txHash: "0x123",
      usdValue: 4245.00,
    };
    
    const transaction2: InsertTransaction = {
      userId: user.id,
      loanId: 2,
      amount: 0.75,
      type: "disbursement",
      description: "Loan Disbursed",
      txHash: "0x456",
      usdValue: 26531.25,
    };
    
    const transaction3: InsertTransaction = {
      userId: user.id,
      loanId: undefined,
      amount: 1.50,
      type: "deposit",
      description: "Deposit",
      txHash: "0x789",
      usdValue: 53062.50,
    };
    
    this.createTransaction(transaction1);
    this.createTransaction(transaction2);
    this.createTransaction(transaction3);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, btcBalance: balance };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Loan operations
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async getUserLoans(userId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.borrowerId === userId || loan.lenderId === userId,
    );
  }

  async getActiveLoans(userId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => 
        (loan.borrowerId === userId || loan.lenderId === userId) && 
        loan.status === "active"
    );
  }

  async getMarketplaceLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.status === "pending"
    );
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.currentLoanId++;
    const now = new Date();
    const loan: Loan = {
      ...insertLoan,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoanStatus(id: number, status: string): Promise<Loan | undefined> {
    const loan = await this.getLoan(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, status, updatedAt: new Date() };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    ).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Stats operations
  async getUserStats(userId: number): Promise<Stats | undefined> {
    return Array.from(this.stats.values()).find(
      (stat) => stat.userId === userId,
    );
  }

  async createStats(insertStats: InsertStats): Promise<Stats> {
    const id = this.currentStatsId++;
    const stats: Stats = {
      ...insertStats,
      id,
    };
    this.stats.set(id, stats);
    return stats;
  }

  async updateStats(userId: number, updatedStats: Partial<InsertStats>): Promise<Stats | undefined> {
    const stats = await this.getUserStats(userId);
    if (!stats) return undefined;
    
    const newStats = { ...stats, ...updatedStats };
    this.stats.set(stats.id, newStats);
    return newStats;
  }
}

export const storage = new MemStorage();
