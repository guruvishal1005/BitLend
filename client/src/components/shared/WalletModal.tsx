import React from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUserWallet } from '@/hooks/use-wallet';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isConnecting } = useUserWallet();
  const [, setLocation] = useLocation();

  const handleConnect = async (providerType: string) => {
    try {
      await connect();
      onClose();
      // Redirect to dashboard after successful connection
      setLocation('/dashboard');
    } catch (error) {
      console.error(`Error connecting to ${providerType}:`, error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your Bitcoin wallet to start lending and borrowing on BitLend.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 my-6">
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 text-base font-normal h-auto"
            onClick={() => handleConnect('MetaMask')}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <BitcoinIcon className="text-primary text-2xl mr-3" />
              <span className="font-medium">MetaMask</span>
            </div>
            <i className="ri-arrow-right-line"></i>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 text-base font-normal h-auto"
            disabled={true}
          >
            <div className="flex items-center">
              <i className="ri-wallet-3-line text-primary text-2xl mr-3"></i>
              <span className="font-medium">Bitcoin Core</span>
            </div>
            <i className="ri-arrow-right-line"></i>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 text-base font-normal h-auto"
            disabled={true}
          >
            <div className="flex items-center">
              <i className="ri-safe-2-line text-primary text-2xl mr-3"></i>
              <span className="font-medium">Hardware Wallet</span>
            </div>
            <i className="ri-arrow-right-line"></i>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Don't have a wallet?</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            Learn how to create one
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
