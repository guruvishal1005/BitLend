import { useCallback } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function useAuth() {
  const auth = useAuthContext();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await auth.login(email, password);
      setLocation('/dashboard');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [auth.login, setLocation]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      setLocation('/login');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'An error occurred while logging out',
        variant: 'destructive',
      });
      return false;
    }
  }, [auth.logout, setLocation, toast]);

  const handleWalletConnect = useCallback(async (walletAddress: string) => {
    try {
      await auth.connectWithWallet(walletAddress);
      setLocation('/dashboard');
      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      return false;
    }
  }, [auth.connectWithWallet, setLocation]);

  return {
    ...auth,
    handleLogin,
    handleLogout,
    handleWalletConnect,
  };
}
