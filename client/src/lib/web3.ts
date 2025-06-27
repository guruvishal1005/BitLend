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
  // Input Validation
  if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
    throw new Error("Transaction amount must be a positive number.");
  }

  try {
    if (walletType === 'phantom' && currency === 'SOL') {
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error("Phantom wallet is not installed. Please install Phantom to use Solana features.");
      }
      // Basic Solana address validation (length and base58 characters)
      // A more robust solution would involve a Solana-specific library.
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(to)) {
          throw new Error("Invalid Solana address format.");
      }
      
      console.log(`Mock Solana transaction to ${to} for ${amount} SOL`);
      // In a real implementation, you'd use @solana/web3.js here
      // For example:
      // const connection = new Connection(clusterApiUrl('devnet'));
      // const transaction = new Transaction().add(
      //   SystemProgram.transfer({
      //     fromPubkey: (window.solana.publicKey as PublicKey),
      //     toPubkey: new PublicKey(to),
      //     lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
      //   })
      // );
      // const { signature } = await window.solana.signAndSendTransaction(transaction);
      // await connection.confirmTransaction(signature);
      // return signature;
      const mockTxHash = `sol_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return mockTxHash;

    } else if (walletType === 'metamask' && currency === 'ETH') {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use Ethereum features.");
      }
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid Ethereum address format.");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const ethAmountInWei = ethers.parseEther(amount);
      
      console.log(`Sending ${ethers.formatEther(ethAmountInWei)} ETH to ${to}...`);
      const tx = await signer.sendTransaction({
        to,
        value: ethAmountInWei,
      });
      
      console.log(`Transaction submitted with hash: ${tx.hash}. Waiting for confirmation...`);
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        console.error("Transaction failed or was reverted.", receipt);
        throw new Error("Ethereum transaction failed. Check wallet for details.");
      }
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      return tx.hash;

    } else {
      throw new Error(`Unsupported transaction: ${currency} with ${walletType}.`);
    }
  } catch (error: any) {
    console.error("Error sending transaction:", error);
    if (error.code === 4001) { // MetaMask user rejected transaction
        throw new Error("Transaction rejected by user in wallet.");
    }
    if (error.message.includes("Invalid Solana address") || error.message.includes("Invalid Ethereum address")) {
        throw error; // Re-throw validation errors directly
    }
    // For other errors, provide a generic message or more specific ones if identifiable
    throw new Error(`Transaction failed: ${error.message || "An unknown error occurred."}`);
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