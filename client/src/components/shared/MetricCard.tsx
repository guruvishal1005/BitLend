import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  changeValue?: string | number;
  changeText?: string;
  isPositive?: boolean;
  isBitcoin?: boolean;
}

export function MetricCard({
  title,
  value,
  icon,
  iconColor,
  changeValue,
  changeText,
  isPositive = true,
  isBitcoin = false,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-bold flex items-center mt-1">
              {isBitcoin && <BitcoinIcon className="text-primary mr-1" size={20} />}
              <span>{value}</span>
            </p>
          </div>
          <div className={cn(
            "rounded-full p-2",
            iconColor === 'primary' && "bg-primary/10 text-primary",
            iconColor === 'accent' && "bg-accent/10 text-accent",
            iconColor === 'success' && "bg-success/10 text-success",
            iconColor === 'warning' && "bg-warning/10 text-warning"
          )}>
            <i className={`ri-${icon}-line text-xl`}></i>
          </div>
        </div>
        
        {(changeValue || changeText) && (
          <div className="mt-3 flex items-center">
            <span className={cn(
              "text-sm font-medium flex items-center",
              isPositive ? "text-success" : "text-destructive"
            )}>
              <i className={`ri-arrow-${isPositive ? 'up' : 'down'}-line mr-1`}></i> 
              {changeValue}
            </span>
            {changeText && <span className="text-xs text-muted-foreground ml-2">{changeText}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
