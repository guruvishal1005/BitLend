import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';
import { formatBTC, formatUSD, shortenWalletAddress } from '@/lib/utils';
import { useUserWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { WalletModal } from '@/components/shared/WalletModal';
import { DepositForm } from '@/components/forms/DepositForm';
import { TransactionItem } from '@/components/shared/TransactionItem';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Wallet() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { wallet, connect, disconnect, isConnecting } = useUserWallet();
  const { user } = useAuth();
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const recentTransactions = transactions?.slice(0, 5) || [];

  const handleDeposit = () => {
    if (!wallet.isConnected) {
      setIsWalletModalOpen(true);
    } else {
      setIsDepositModalOpen(true);
    }
  };

  // Calculate total balance in USD (mock exchange rate: 1 BTC = $35,000)
  const btcBalance = wallet.isConnected && wallet.balance 
    ? parseFloat(wallet.balance) 
    : user?.btcBalance || 0;
  const usdBalance = btcBalance * 35000;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                <CardDescription>
                  Your available Bitcoin balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bitcoin-gradient text-white rounded-lg p-6 mb-4">
                  <div className="flex items-center mb-2">
                    <BitcoinIcon className="mr-2" size={24} />
                    <span className="text-sm">Available Balance</span>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {formatBTC(btcBalance)}
                  </div>
                  <div className="text-sm opacity-90">
                    {formatUSD(usdBalance)}
                  </div>
                </div>
                
                <div className="my-4">
                  {wallet.isConnected ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <div className="text-sm font-medium">Connected Wallet</div>
                        <div className="text-sm text-muted-foreground">{shortenWalletAddress(wallet.address || '')}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={disconnect}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setIsWalletModalOpen(true)}
                      disabled={isConnecting}
                    >
                      <i className="ri-wallet-3-line mr-2"></i>
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button className="w-full" onClick={handleDeposit}>
                    <i className="ri-add-line mr-2"></i> Deposit
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <i className="ri-arrow-left-right-line mr-2"></i> Transfer
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest wallet activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">No transaction history yet</p>
                    <Button variant="outline" onClick={handleDeposit}>Make Your First Deposit</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map(transaction => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/transactions">View All Transactions</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      
      <DepositForm
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}

// Quick fix for Link import
import { Link } from 'wouter';
