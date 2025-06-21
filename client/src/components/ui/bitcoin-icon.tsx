import React from 'react';

interface BitcoinIconProps {
  className?: string;
  size?: number;
}

export function BitcoinIcon({ className = "", size = 24 }: BitcoinIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-5.907-1.042m5.907 1.042-.347 1.969" />
      <path d="M7.116 7.086 6.77 9.055m0-5.89-1.735-.306m9.122 2.118.347-1.97" />
    </svg>
  );
}
