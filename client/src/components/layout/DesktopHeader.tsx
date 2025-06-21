import React, { useState } from 'react';
import { UserProfileDropdown } from '@/components/shared/UserProfileDropdown';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from '@/components/shared/NotificationBadge';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

export function DesktopHeader() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Get page title based on location
  const getPageTitle = () => {
    switch (location) {
      case '/dashboard':
        return 'Dashboard';
      case '/loans':
        return 'My Loans';
      case '/marketplace':
        return 'Loan Marketplace';
      case '/transactions':
        return 'Transactions';
      case '/wallet':
        return 'Wallet';
      case '/settings':
        return 'Settings';
      default:
        return 'BitLend';
    }
  };

  return (
    <motion.header 
      className="hidden md:block bg-card/95 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-40 border-b"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {getPageTitle()}
        </motion.h1>
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search loans, transactions..."
              className="pl-10 pr-4 py-2 w-80 bg-muted/50 focus:bg-card border-border/50 focus:border-primary transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          </div>
          
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
            <motion.i 
              className="ri-notification-3-line text-2xl text-foreground"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <NotificationBadge count={2} />
          </Button>
          
          <ThemeToggle />
          
          <UserProfileDropdown />
        </motion.div>
      </div>
    </motion.header>
  );
}