import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  connectWithWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  connectWithWallet: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();
      setUser(data);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'An error occurred while logging out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectWithWallet = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/connect-wallet', { walletAddress });
      const data = await response.json();
      setUser(data);
      toast({
        title: 'Wallet connected',
        description: 'You are now signed in with your wallet',
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Could not connect your wallet',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        connectWithWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
