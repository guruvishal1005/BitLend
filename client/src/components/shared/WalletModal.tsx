import React from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUserWallet } from '@/hooks/use-wallet';
import { BitcoinIcon, EthereumIcon, SolanaIcon } from '@/components/ui/currency-icon';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isConnecting } = useUserWallet();
  const [, setLocation] = useLocation();

  const handleConnect = async (walletType: 'metamask' | 'phantom') => {
    try {
      await connect(walletType);
      onClose();
      setLocation('/dashboard');
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your crypto wallet to start lending and borrowing on BitLend.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 my-6">
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 text-base font-normal h-auto hover:bg-blue-50 hover:border-blue-300"
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <EthereumIcon className="text-blue-500 mr-3" size={24} />
              <div className="text-left">
                <div className="font-medium">MetaMask</div>
                <div className="text-xs text-muted-foreground">Connect with Ethereum</div>
              </div>
            </div>
            <i className="ri-arrow-right-line"></i>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 text-base font-normal h-auto hover:bg-purple-50 hover:border-purple-300"
            onClick={() => handleConnect('phantom')}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <SolanaIcon className="text-purple-500 mr-3" size={24} />
              <div className="text-left">
                <div className="font-medium">Phantom</div>
                <div className="text-xs text-muted-foreground">Connect with Solana</div>
              </div>
            </div>
            <i className="ri-arrow-right-line"></i>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 text-base font-normal h-auto opacity-50"
            disabled={true}
          >
            <div className="flex items-center">
              <BitcoinIcon className="text-orange-500 mr-3" size={24} />
              <div className="text-left">
                <div className="font-medium">Bitcoin Core</div>
                <div className="text-xs text-muted-foreground">Coming soon</div>
              </div>
            </div>
            <i className="ri-arrow-right-line"></i>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Don't have a wallet?</p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 text-sm"
            >
              Get MetaMask
            </a>
            <a 
              href="https://phantom.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-600 font-medium transition-colors duration-200 text-sm"
            >
              Get Phantom
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}