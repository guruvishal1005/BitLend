import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';
import { MobileFooter } from './MobileFooter';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted">
      <MobileHeader />
      <Sidebar />
      
      <main className="flex-1 pb-20 md:pb-6">
        <DesktopHeader />
        {children}
      </main>
      
      <MobileFooter />
    </div>
  );
}
