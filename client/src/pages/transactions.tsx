import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { motion } from 'framer-motion';
import { StatisticsChart } from '@/components/shared/StatisticsChart';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Transactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const transactionsByDate = transactions?.reduce((groups: any, transaction: any) => {
    const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(transaction);
    return groups;
  }, {}) || {};

  // Create data for transaction chart
  const chartData = transactions?.reduce((acc: any, transaction: any) => {
    const month = new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short' });
    
    if (!acc[month]) {
      acc[month] = { 
        month,
        deposits: 0,
        withdrawals: 0,
        repayments: 0,
        disbursements: 0
      };
    }
    
    switch(transaction.type) {
      case 'deposit':
        acc[month].deposits += transaction.amount;
        break;
      case 'withdrawal':
        acc[month].withdrawals += transaction.amount;
        break;
      case 'repayment':
        acc[month].repayments += transaction.amount;
        break;
      case 'disbursement':
        acc[month].disbursements += transaction.amount;
        break;
    }
    
    return acc;
  }, {});
  
  const chartDataArray = chartData ? Object.values(chartData) : [];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
        
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : chartDataArray.length > 0 ? (
                  <StatisticsChart data={chartDataArray} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No transaction data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <motion.div 
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transaction history...</p>
            </div>
          ) : transactions?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">You don't have any transactions yet.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(transactionsByDate).map(([date, dayTransactions]: [string, any]) => (
              <motion.div key={date} variants={fadeIn} className="mb-6">
                <h2 className="text-lg font-medium mb-3">{date}</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {dayTransactions.map((transaction: any) => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
