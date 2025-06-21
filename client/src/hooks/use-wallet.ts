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
    if (!wallet.balance || !user || !wallet.isConnected) return;
    
    try {
      setIsUpdatingBalance(true);
      const btcBalance = parseFloat(wallet.balance);
      
      // Only update if the balance is different
      if (btcBalance !== user.btcBalance) {
        await apiRequest('PUT', '/api/user/balance', { balance: btcBalance });
        toast({
          title: 'Balance updated',
          description: `Your balance has been updated to ${btcBalance.toFixed(8)} BTC`,
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
  }, [wallet.balance, wallet.isConnected, user, toast]);

  // Trigger balance update when wallet balance changes
  useEffect(() => {
    if (wallet.balance && user && wallet.isConnected) {
      updateBalance();
    }
  }, [wallet.balance, user, wallet.isConnected, updateBalance]);

  // Deposit funds
  const depositFunds = useCallback(async (amount: number) => {
    if (!wallet.isConnected || !user) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/transactions/deposit', { amount });
      toast({
        title: 'Deposit successful',
        description: `You have successfully deposited ${amount} BTC`,
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
