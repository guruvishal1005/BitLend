import React from 'react';
import { Currency } from '@shared/schema';
import { getCurrencyIcon, getCurrencyColor } from '@/lib/utils';

interface CurrencyIconProps {
  currency: Currency;
  className?: string;
  size?: number;
}

export function CurrencyIcon({ currency, className = "", size = 24 }: CurrencyIconProps) {
  const iconClass = getCurrencyIcon(currency);
  const colorClass = getCurrencyColor(currency);
  
  return (
    <i 
      className={`${iconClass} ${colorClass} ${className}`}
      style={{ fontSize: `${size}px` }}
    />
  );
}

// Specific currency icons for convenience
export function BitcoinIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return <CurrencyIcon currency="BTC" className={className} size={size} />;
}

export function EthereumIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return <CurrencyIcon currency="ETH" className={className} size={size} />;
}

export function SolanaIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return <CurrencyIcon currency="SOL" className={className} size={size} />;
}