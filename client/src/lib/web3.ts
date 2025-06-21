import { ethers } from "ethers";

export interface WalletProvider {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

// Mock Bitcoin price for converting ETH to BTC
const MOCK_BTC_ETH_RATE = 15; // 1 ETH = 1/15 BTC

export async function connectWallet(): Promise<WalletProvider> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
  }

  try {
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Create a provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get the signer
    const signer = await provider.getSigner();
    
    // Get the address
    const address = await signer.getAddress();
    
    // Get the chain ID
    const { chainId } = await provider.getNetwork();
    
    // Get the ETH balance and convert to BTC (mocked)
    const balance = await provider.getBalance(address);
    const ethBalance = parseFloat(ethers.formatEther(balance));
    const btcBalance = (ethBalance / MOCK_BTC_ETH_RATE).toFixed(8);
    
    return {
      provider,
      signer,
      address,
      chainId: Number(chainId),
      balance: btcBalance,
      isConnected: true,
      isConnecting: false,
      error: null,
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    return {
      provider: null,
      signer: null,
      address: null,
      chainId: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function disconnectWallet(): Promise<void> {
  // MetaMask doesn't have a direct disconnect method
  // This is a client-side disconnect only
  return Promise.resolve();
}

export async function getBalance(address: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    const ethBalance = parseFloat(ethers.formatEther(balance));
    const btcBalance = (ethBalance / MOCK_BTC_ETH_RATE).toFixed(8);
    return btcBalance;
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
}

export async function sendTransaction(to: string, amount: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Convert BTC amount to ETH
    const ethAmount = parseFloat(amount) * MOCK_BTC_ETH_RATE;
    const ethAmountInWei = ethers.parseEther(ethAmount.toString());
    
    // Create the transaction
    const tx = await signer.sendTransaction({
      to,
      value: ethAmountInWei,
    });
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    return tx.hash;
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
}
