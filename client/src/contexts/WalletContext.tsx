import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { connectWallet, disconnectWallet, WalletProvider as Web3WalletProvider, listenForAccountChanges, listenForNetworkChanges, removeListeners } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: Web3WalletProvider;
  connect: () => Promise<Web3WalletProvider>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType>({
  wallet: {
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  },
  connect: async () => ({
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  }),
  disconnect: async () => {},
  isConnecting: false,
});

export const useWallet = () => useContext(WalletContext);

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<Web3WalletProvider>({
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { connectWithWallet } = useAuth();

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their account
      setWallet((prev: Web3WalletProvider) => ({
        ...prev,
        address: null,
        balance: null,
        isConnected: false,
      }));
      toast({
        title: 'Wallet disconnected',
        description: 'Your wallet is no longer connected',
      });
    } else if (accounts[0] !== wallet.address) {
      // User switched account
      const newAddress = accounts[0];
      setWallet((prev: Web3WalletProvider) => ({
        ...prev,
        address: newAddress,
      }));
      toast({
        title: 'Account changed',
        description: `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
      });
    }
  }, [wallet.address, toast]);

  const handleChainChanged = useCallback((chainId: string) => {
    // Convert from hex to decimal
    const newChainId = parseInt(chainId, 16);
    setWallet((prev: Web3WalletProvider) => ({
      ...prev,
      chainId: newChainId,
    }));
    toast({
      title: 'Network changed',
      description: `Switched to chain ID: ${newChainId}`,
    });
  }, [toast]);

  useEffect(() => {
    // Set up listeners when component mounts
    listenForAccountChanges(handleAccountsChanged);
    listenForNetworkChanges(handleChainChanged);

    // Clean up listeners when component unmounts
    return () => {
      removeListeners();
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const connect = async () => {
    try {
      setIsConnecting(true);
      const connectedWallet = await connectWallet();
      
      setWallet(connectedWallet);
      
      if (connectedWallet.address) {
        // Connect with backend
        await connectWithWallet(connectedWallet.address);
      }
      
      if (connectedWallet.error) {
        toast({
          title: 'Connection failed',
          description: connectedWallet.error.message,
          variant: 'destructive',
        });
      } else if (connectedWallet.isConnected) {
        toast({
          title: 'Wallet connected',
          description: `Connected to ${connectedWallet.address?.slice(0, 6)}...${connectedWallet.address?.slice(-4)}`,
        });
      }
      
      return connectedWallet;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Could not connect to MetaMask',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      setWallet({
        provider: null,
        signer: null,
        address: null,
        chainId: null,
        balance: null,
        isConnected: false,
        isConnecting: false,
        error: null,
      });
      toast({
        title: 'Wallet disconnected',
        description: 'Your wallet has been disconnected',
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Disconnection failed',
        description: error instanceof Error ? error.message : 'Could not disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, isConnecting }}>
      {children}
    </WalletContext.Provider>
  );
}
