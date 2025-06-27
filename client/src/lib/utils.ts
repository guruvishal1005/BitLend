import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting functions
export function formatCurrency(amount: number, currency: Currency): string {
  switch (currency) {
    case 'BTC':
      return `${amount.toFixed(8)} BTC`;
    case 'ETH':
      return `${amount.toFixed(6)} ETH`;
    case 'SOL':
      return `${amount.toFixed(4)} SOL`;
    default:
      return `${amount.toFixed(4)} ${currency}`;
  }
}

export function formatBTC(amount: number): string {
  return formatCurrency(amount, 'BTC');
}

export function formatETH(amount: number): string {
  return formatCurrency(amount, 'ETH');
}

export function formatSOL(amount: number): string {
  return formatCurrency(amount, 'SOL');
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getCurrencyIcon(currency: Currency): string {
  switch (currency) {
    case 'BTC':
      return 'ri-bit-coin-line';
    case 'ETH':
      return 'ri-ethereum-line';
    case 'SOL':
      return 'ri-sun-line'; // Using sun icon for Solana
    default:
      return 'ri-coin-line';
  }
}

export function getCurrencyColor(currency: Currency): string {
  switch (currency) {
    case 'BTC':
      return 'text-orange-500';
    case 'ETH':
      return 'text-blue-500';
    case 'SOL':
      return 'text-purple-500';
    default:
      return 'text-gray-500';
  }
}

export function getCurrencyUSDRate(currency: Currency): number {
  switch (currency) {
    case 'BTC':
      return 35000;
    case 'ETH':
      return 2000;
    case 'SOL':
      return 100;
    default:
      return 1;
  }
}

export function convertToUSD(amount: number, currency: Currency): number {
  return amount * getCurrencyUSDRate(currency);
}

export function shortenWalletAddress(address: string | undefined): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getInitials(name: string): string {
  if (!name) return 'BT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function calculateRepaymentAmount(amount: number, interest: number, durationMonths: number): number {
  // Simple interest calculation: P + (P * r * t)
  // P = principal, r = rate, t = time in years
  const timeInYears = durationMonths / 12;
  return amount + (amount * (interest / 100) * timeInYears);
}

export function calculateMonthlyPayment(amount: number, interest: number, durationMonths: number): number {
  const totalRepayment = calculateRepaymentAmount(amount, interest, durationMonths);
  return totalRepayment / durationMonths;
}

export function getLoanStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'status-active';
    case 'pending':
      return 'status-pending';
    case 'completed':
      return 'status-completed';
    case 'failed':
    case 'defaulted':
      return 'status-failed';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function getLoanTypeClass(type: string): string {
  return type === 'request' ? 'loan-request-badge' : 'loan-offer-badge';
}

export function formatDateRelative(date: Date | string | number): string {
  const now = new Date();
  const inputDate = new Date(date);
  
  const diffInMs = now.getTime() - inputDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 30) {
    return inputDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export function getTransactionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'wallet-3';
    case 'withdrawal':
      return 'wallet-3';
    case 'repayment':
      return 'arrow-left-down';
    case 'disbursement':
      return 'arrow-right-up';
    default:
      return 'exchange-funds';
  }
}

export function getTransactionTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'text-primary';
    case 'repayment':
      return 'text-primary';
    case 'withdrawal':
      return 'text-destructive';
    case 'disbursement':
      return 'text-accent';
    default:
      return 'text-muted-foreground';
  }
}

export function isPositiveTransaction(type: string): boolean {
  return ['deposit', 'repayment'].includes(type.toLowerCase());
}