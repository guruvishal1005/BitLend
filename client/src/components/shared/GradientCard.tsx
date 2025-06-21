import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

export function GradientCard({ children, gradient = 'primary', className }: GradientCardProps) {
  const gradientClasses = {
    primary: 'bg-gradient-to-br from-primary/90 to-primary',
    accent: 'bg-gradient-to-br from-accent/90 to-accent',
    success: 'bg-gradient-to-br from-success/90 to-success',
    warning: 'bg-gradient-to-br from-warning/90 to-warning'
  };

  return (
    <Card className={cn('border-none overflow-hidden', gradientClasses[gradient], className)}>
      <CardContent className="p-6 text-white">
        {children}
      </CardContent>
    </Card>
  );
}