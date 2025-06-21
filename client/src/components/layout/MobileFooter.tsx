import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface MobileFooterItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

function MobileFooterItem({ href, icon, label, isActive }: MobileFooterItemProps) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex flex-col items-center",
        isActive ? "text-primary" : "text-foreground/70 hover:text-primary transition-colors duration-200"
      )}>
        <i className={`ri-${icon}-line text-xl`}></i>
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  );
}

export function MobileFooter() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/loans", icon: "exchange-dollar", label: "Loans" },
    { href: "/marketplace", icon: "store-2", label: "Market" },
    { href: "/wallet", icon: "wallet-3", label: "Wallet" },
    { href: "/settings", icon: "user", label: "Profile" },
  ];

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-3 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <MobileFooterItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={location === item.href}
          />
        ))}
      </div>
    </footer>
  );
}
