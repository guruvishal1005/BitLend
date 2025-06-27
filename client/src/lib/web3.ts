import { ethers } from "ethers";

export interface WalletProvider {
  provider: ethers.BrowserProvider | any | null;
  signer: ethers.JsonRpcSigner | any | null;
  address: string | null;
  chainId: number | null;
  btcBalance: string | null;
  ethBalance: string | null;
  solBalance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  walletType: 'metamask' | 'phantom' | 'walletconnect' | null;
}

// Mock exchange rates
const MOCK_RATES = {
  BTC_USD: 35000,
  ETH_USD: 2000,
  SOL_USD: 100,
  ETH_BTC: 1/15, // 1 ETH = 1/15 BTC
  SOL_BTC: 1/350, // 1 SOL = 1/350 BTC
};

// Phantom Wallet (Solana) connection
export async function connectPhantomWallet(): Promise<WalletProvider> {
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error("Phantom wallet is not installed. Please install Phantom to use Solana features.");
  }

  try {
    const response = await window.solana.connect();
    const address = response.publicKey.toString();
    
    // Mock Solana balance (in a real app, you'd use @solana/web3.js)
    const solBalance = (Math.random() * 10).toFixed(4);
    const btcBalance = (parseFloat(solBalance) * MOCK_RATES.SOL_BTC).toFixed(8);
    
    return {
      provider: window.solana,
      signer: null,
      address,
      chainId: null, // Solana doesn't use chainId like Ethereum
      btcBalance,
      ethBalance: "0",
      solBalance,
      isConnected: true,
      isConnecting: false,
      error: null,
      walletType: 'phantom',
    };
  } catch (error) {
    console.error("Error connecting to Phantom wallet:", error);
    return {
      provider: null,
      signer: null,
      address: null,
      chainId: null,
      btcBalance: null,
      ethBalance: null,
      solBalance: null,
      isConnected: false,
      isConnecting: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
      walletType: null,
    };
  }
}

// MetaMask (Ethereum) connection
export async function connectMetaMaskWallet(): Promise<WalletProvider> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use Ethereum features.");
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const { chainId } = await provider.getNetwork();
    
    // Get ETH balance and convert to BTC equivalent
    const balance = await provider.getBalance(address);
    const ethBalance = parseFloat(ethers.formatEther(balance));
    const btcBalance = (ethBalance * MOCK_RATES.ETH_BTC).toFixed(8);
    
    return {
      provider,
      signer,
      address,
      chainId: Number(chainId),
      btcBalance,
      ethBalance: ethBalance.toFixed(4),
      solBalance: "0",
      isConnected: true,
      isConnecting: false,
      error: null,
      walletType: 'metamask',
    };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    return {
      provider: null,
      signer: null,
      address: null,
      chainId: null,
      btcBalance: null,
      ethBalance: null,
      solBalance: null,
      isConnected: false,
      isConnecting: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
      walletType: null,
    };
  }
}

// Generic wallet connection function
export async function connectWallet(walletType: 'metamask' | 'phantom' = 'metamask'): Promise<WalletProvider> {
  switch (walletType) {
    case 'phantom':
      return connectPhantomWallet();
    case 'metamask':
    default:
      return connectMetaMaskWallet();
  }
}

export async function disconnectWallet(): Promise<void> {
  // MetaMask doesn't have a direct disconnect method
  // Phantom wallet disconnect
  if (window.solana && window.solana.isPhantom) {
    try {
      await window.solana.disconnect();
    } catch (error) {
      console.error("Error disconnecting Phantom:", error);
    }
  }
  return Promise.resolve();
}

export async function getBalance(address: string, walletType: 'metamask' | 'phantom' = 'metamask'): Promise<{btc: string, eth: string, sol: string}> {
  try {
    if (walletType === 'phantom') {
      // Mock Solana balance fetch
      const solBalance = (Math.random() * 10).toFixed(4);
      const btcBalance = (parseFloat(solBalance) * MOCK_RATES.SOL_BTC).toFixed(8);
      return { btc: btcBalance, eth: "0", sol: solBalance };
    } else {
      // Ethereum balance fetch
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const ethBalance = parseFloat(ethers.formatEther(balance));
      const btcBalance = (ethBalance * MOCK_RATES.ETH_BTC).toFixed(8);
      
      return { btc: btcBalance, eth: ethBalance.toFixed(4), sol: "0" };
    }
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
}

export async function sendTransaction(to: string, amount: string, currency: 'BTC' | 'ETH' | 'SOL', walletType: 'metamask' | 'phantom'): Promise<string> {
  try {
    if (walletType === 'phantom' && currency === 'SOL') {
      // Mock Solana transaction
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error("Phantom wallet is not installed");
      }
      
      // In a real implementation, you'd use @solana/web3.js here
      const mockTxHash = `sol_${Math.random().toString(36).substring(2)}`;
      return mockTxHash;
    } else if (walletType === 'metamask' && currency === 'ETH') {
      // Ethereum transaction
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const ethAmountInWei = ethers.parseEther(amount);
      
      const tx = await signer.sendTransaction({
        to,
        value: ethAmountInWei,
      });
      
      await tx.wait();
      return tx.hash;
    } else {
      throw new Error(`Unsupported transaction: ${currency} with ${walletType}`);
    }
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}

// Listen for account changes
export function listenForAccountChanges(callback: (accounts: string[]) => void): void {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", callback);
  }
  
  if (window.solana && window.solana.isPhantom) {
    window.solana.on("accountChanged", (publicKey: any) => {
      if (publicKey) {
        callback([publicKey.toString()]);
      } else {
        callback([]);
      }
    });
  }
}

// Listen for network changes
export function listenForNetworkChanges(callback: (chainId: string) => void): void {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", callback);
  }
}

// Cleanup listeners
export function removeListeners(): void {
  if (window.ethereum) {
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
  }
  
  if (window.solana && window.solana.isPhantom) {
    window.solana.removeAllListeners("accountChanged");
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}