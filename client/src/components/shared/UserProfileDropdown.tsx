import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn, shortenWalletAddress } from '@/lib/utils';

export function UserProfileDropdown() {
  const { user, handleLogout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center outline-none">
        <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center mr-2">
          <span className="font-semibold">{user?.avatarInitials || "BT"}</span>
        </div>
        <span className="font-medium mr-1">{user?.username || "Anonymous"}</span>
        <i className="ri-arrow-down-s-line"></i>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.username || "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">
              {shortenWalletAddress(user?.walletAddress || "")}
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <Link href="/wallet">
          <DropdownMenuItem className="cursor-pointer">
            <i className="ri-wallet-3-line mr-2"></i>
            <span>My Wallet</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <i className="ri-user-settings-line mr-2"></i>
            <span>Profile Settings</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/transactions">
          <DropdownMenuItem className="cursor-pointer">
            <i className="ri-exchange-funds-line mr-2"></i>
            <span>Transaction History</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <Link href="/help">
          <DropdownMenuItem className="cursor-pointer">
            <i className="ri-question-line mr-2"></i>
            <span>Help & Support</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem 
          className={cn("cursor-pointer text-destructive focus:text-destructive")}
          onClick={handleLogout}
        >
          <i className="ri-logout-box-line mr-2"></i>
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
