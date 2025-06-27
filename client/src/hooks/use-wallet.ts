import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useUserWallet() {
  const { wallet, connect, disconnect, isConnecting } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  // Update user balance from wallet balance
  const updateBalance = useCallback(async () => {
    if (!user || !wallet.isConnected) return;
    
    try {
      setIsUpdatingBalance(true);
      
      // Update balances based on wallet type
      const balanceUpdates: any = {};
      
      if (wallet.btcBalance && parseFloat(wallet.btcBalance) !== user.btcBalance) {
        balanceUpdates.btcBalance = parseFloat(wallet.btcBalance);
      }
      
      if (wallet.ethBalance && parseFloat(wallet.ethBalance) !== user.ethBalance) {
        balanceUpdates.ethBalance = parseFloat(wallet.ethBalance);
      }
      
      if (wallet.solBalance && parseFloat(wallet.solBalance) !== user.solBalance) {
        balanceUpdates.solBalance = parseFloat(wallet.solBalance);
      }
      
      // Only update if there are changes
      if (Object.keys(balanceUpdates).length > 0) {
        await apiRequest('PUT', '/api/user/balance', balanceUpdates);
        toast({
          title: 'Balance updated',
          description: `Your wallet balances have been synchronized`,
        });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Balance update failed',
        description: error instanceof Error ? error.message : 'Could not update your balance',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingBalance(false);
    }
  }, [wallet, user, toast]);

  // Trigger balance update when wallet balance changes
  useEffect(() => {
    if (wallet.isConnected && user) {
      updateBalance();
    }
  }, [wallet.btcBalance, wallet.ethBalance, wallet.solBalance, user, wallet.isConnected, updateBalance]);

  // Deposit funds
  const depositFunds = useCallback(async (amount: number, currency: 'BTC' | 'ETH' | 'SOL' = 'BTC') => {
    if (!wallet.isConnected || !user) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await apiRequest('POST', '/api/transactions/deposit', { amount, currency });
      toast({
        title: 'Deposit successful',
        description: `You have successfully deposited ${amount} ${currency}`,
      });
      return true;
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast({
        title: 'Deposit failed',
        description: error instanceof Error ? error.message : 'Could not deposit funds',
        variant: 'destructive',
      });
      return false;
    }
  }, [wallet.isConnected, user, toast]);

  return {
    wallet,
    connect,
    disconnect,
    isConnecting,
    isUpdatingBalance,
    updateBalance,
    depositFunds,
  };
}