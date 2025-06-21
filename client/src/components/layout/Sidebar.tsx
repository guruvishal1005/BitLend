import React from 'react';
import { Link, useLocation } from 'wouter';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';
import { cn, formatBTC, shortenWalletAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useUserWallet } from '@/hooks/use-wallet';

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

function SidebarItem({ href, icon, label, isActive }: SidebarItemProps) {
  return (
    <li className="mb-2">
      <Link href={href}>
        <div
          className={cn(
            "flex items-center p-3 rounded-lg font-medium transition-colors duration-200",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-foreground/70 hover:bg-muted"
          )}
        >
          <i className={`ri-${icon}-line mr-3 text-lg`}></i>
          {label}
        </div>
      </Link>
    </li>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, handleLogout } = useAuth();
  const { wallet } = useUserWallet();

  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/loans", icon: "exchange-dollar", label: "My Loans" },
    { href: "/marketplace", icon: "store-2", label: "Marketplace" },
    { href: "/transactions", icon: "exchange-funds", label: "Transactions" },
    { href: "/wallet", icon: "wallet-3", label: "Wallet" },
    { href: "/settings", icon: "settings-3", label: "Settings" },
  ];

  const initials = user?.avatarInitials || "BT";
  const walletAddress = wallet.isConnected ? wallet.address : user?.walletAddress;
  const btcBalance = wallet.isConnected && wallet.balance 
    ? parseFloat(wallet.balance) 
    : user?.btcBalance || 0;

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r border-border p-5 h-screen sticky top-0 custom-scrollbar overflow-y-auto">
      <div className="flex items-center mb-8">
        <BitcoinIcon className="text-primary text-3xl mr-2" />
        <span className="font-bold text-2xl">BitLend</span>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center mr-3">
            <span className="font-semibold">{initials}</span>
          </div>
          <div>
            <p className="font-semibold">{user?.username || "Anonymous"}</p>
            <p className="text-sm text-muted-foreground truncate">
              {shortenWalletAddress(walletAddress || "")}
            </p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-primary font-semibold flex items-center">
              <BitcoinIcon className="mr-1" size={16} />
              <span>{formatBTC(btcBalance)}</span>
            </span>
          </div>
          <Button variant="default" size="sm" className="w-full">
            <i className="ri-add-line mr-1"></i> Deposit Funds
          </Button>
        </div>
      </div>
      
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={location === item.href}
            />
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-6 border-t border-border">
        <Link href="/help">
          <div className="flex items-center p-3 rounded-lg text-foreground/70 hover:bg-muted font-medium transition-colors duration-200">
            <i className="ri-question-line mr-3 text-lg"></i>
            Help & Support
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center p-3 w-full text-left rounded-lg text-destructive hover:bg-muted font-medium transition-colors duration-200"
        >
          <i className="ri-logout-box-line mr-3 text-lg"></i>
          Log Out
        </button>
      </div>
    </aside>
  );
}
