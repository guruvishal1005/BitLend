import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBTC } from '@/lib/utils';
import { LoanTable } from '@/components/shared/LoanTable';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { MarketplaceLoanCard } from '@/components/shared/MarketplaceLoanCard';
import { GradientCard } from '@/components/shared/GradientCard';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@shared/schema';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Query user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
  });
  
  // Query active loans
  const { data: activeLoans, isLoading: loansLoading } = useQuery({
    queryKey: ['/api/loans/active'],
  });
  
  // Query recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  // Query marketplace loans
  const { data: marketplaceLoans, isLoading: marketplaceLoading } = useQuery({
    queryKey: ['/api/loans/marketplace'],
  });

  const handleViewLoanDetails = (loan: Loan) => {
    setLocation(`/loans/${loan.id}`);
  };

  const handleAcceptLoan = (loan: Loan) => {
    toast({
      title: 'Coming Soon',
      description: 'This feature is under development',
    });
  };

  const recentTransactions = transactions?.slice(0, 3) || [];
  const highlightedMarketplaceLoans = marketplaceLoans?.slice(0, 4) || [];
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GradientCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="relative flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-6 md:mb-0 z-10">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to BitLend
              </motion.h2>
              <motion.p 
                className="text-white/90 max-w-md mb-6 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Your secure platform for P2P Bitcoin lending. Browse the marketplace to find the perfect loan opportunities.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/marketplace">
                  <Button size="lg" variant="secondary" className="font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                    <i className="ri-store-2-line mr-2"></i> Visit Marketplace
                  </Button>
                </Link>
                <Link href="/wallet">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium backdrop-blur-sm">
                    <i className="ri-wallet-3-line mr-2"></i> Manage Wallet
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full bg-white/10 animate-ping" />
                <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/20 backdrop-blur-sm" />
                <i className="ri-bit-coin-line text-white text-6xl md:text-7xl relative z-10" />
              </div>
            </motion.div>
          </div>
        </GradientCard>
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <motion.h2 
            className="text-2xl font-bold mb-2 md:mb-0"
            variants={fadeIn}
          >
            Your Portfolio Overview
          </motion.h2>
          <motion.div 
            className="flex items-center bg-muted rounded-full px-4 py-2 text-sm"
            variants={fadeIn}
          >
            <span className="text-primary font-medium flex items-center">
              <i className="ri-time-line mr-2"></i> Last updated: Just now
            </span>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <SkeletonLoader type="metric" />
              </Card>
            ))
          ) : (
            <>
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-primary/10 p-3">
                          <i className="ri-arrow-down-line text-xl text-primary"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Total Borrowed</h3>
                          <div className="text-2xl font-bold mt-1">
                            <AnimatedCounter 
                              value={stats?.totalBorrowed || 0} 
                              formatter={(v) => formatBTC(v)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success flex items-center">
                        <i className="ri-arrow-up-line mr-1"></i> 12.3%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-accent/10 p-3">
                          <i className="ri-arrow-up-line text-xl text-accent"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Total Lent</h3>
                          <div className="text-2xl font-bold mt-1">
                            <AnimatedCounter 
                              value={stats?.totalLent || 0} 
                              formatter={(v) => formatBTC(v)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success flex items-center">
                        <i className="ri-arrow-up-line mr-1"></i> 8.7%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-success">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-success/10 p-3">
                          <i className="ri-time-line text-xl text-success"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Active Loans</h3>
                          <div className="text-2xl font-bold mt-1">
                            <AnimatedCounter value={stats?.activeLoans || 0} />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success flex items-center">
                        <i className="ri-add-line mr-1"></i> 2
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">new this week</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-warning">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-warning/10 p-3">
                          <i className="ri-percent-line text-xl text-warning"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Interest Earned</h3>
                          <div className="text-2xl font-bold mt-1">
                            <AnimatedCounter 
                              value={stats?.interestEarned || 0} 
                              formatter={(v) => formatBTC(v)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success flex items-center">
                        <i className="ri-arrow-up-line mr-1"></i> 5.2%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
      
      {/* Your Active Loans */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Your Active Loans</h2>
          <Link href="/loans">
            <Button variant="outline" className="text-primary hover:bg-primary/5 text-sm font-medium flex items-center group">
              View All Loans 
              <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
            </Button>
          </Link>
        </div>
        
        <Card className="border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          {loansLoading ? (
            <SkeletonLoader type="table" />
          ) : activeLoans && activeLoans.length === 0 ? (
            <EmptyState
              icon="inbox-line"
              title="No active loans"
              description="You don't have any active loans at the moment. Browse the marketplace to find opportunities."
              action={{
                label: "Browse Marketplace",
                onClick: () => setLocation('/marketplace')
              }}
            />
          ) : (
            <LoanTable 
              loans={activeLoans || []} 
              onViewDetails={handleViewLoanDetails} 
            />
          )}
        </Card>
      </motion.div>
      
      {/* Recent Transactions and Loan Marketplace */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Recent Transactions */}
        <motion.div className="lg:col-span-1" variants={fadeIn}>
          <Card className="h-full rounded-xl border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <i className="ri-exchange-funds-line text-lg text-primary"></i>
                  </div>
                  <h2 className="text-lg font-bold">Recent Transactions</h2>
                </div>
                <Link href="/transactions">
                  <Button variant="ghost" className="text-primary hover:bg-primary/5 text-sm font-medium group">
                    View All 
                    <i className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"></i>
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {transactionsLoading ? (
                  <SkeletonLoader type="transaction" count={3} />
                ) : recentTransactions.length === 0 ? (
                  <EmptyState
                    icon="file-list-line"
                    title="No transactions yet"
                    description="Your transaction history will appear here"
                  />
                ) : (
                  recentTransactions.map(transaction => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-muted/50 rounded-lg p-2 transition-colors"
                    >
                      <TransactionItem transaction={transaction} />
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Loan Marketplace */}
        <motion.div className="lg:col-span-2" variants={fadeIn}>
          <Card className="h-full rounded-xl border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="bg-accent/10 p-2 rounded-lg mr-3">
                    <i className="ri-store-2-line text-lg text-accent"></i>
                  </div>
                  <h2 className="text-lg font-bold">Marketplace Opportunities</h2>
                </div>
                <Link href="/marketplace">
                  <Button variant="outline" className="text-accent border-accent/30 hover:bg-accent/5 text-sm font-medium group">
                    Browse All 
                    <i className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"></i>
                  </Button>
                </Link>
              </div>
              
              {marketplaceLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <SkeletonLoader type="card" count={4} />
                </div>
              ) : highlightedMarketplaceLoans.length === 0 ? (
                <EmptyState
                  icon="store-2-line"
                  title="No loans available"
                  description="Check back later for new loan opportunities or visit the marketplace"
                  action={{
                    label: "Visit Marketplace",
                    onClick: () => setLocation('/marketplace')
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {highlightedMarketplaceLoans.map((loan, index) => (
                    <motion.div 
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <MarketplaceLoanCard 
                        loan={loan}
                        rating={4.5}
                        onAccept={handleAcceptLoan}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}