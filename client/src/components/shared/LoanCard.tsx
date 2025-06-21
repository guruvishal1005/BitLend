import React from 'react';
import { Loan } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';
import { formatBTC, getLoanStatusBadgeClass, getLoanTypeClass } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoanCardProps {
  loan: Loan;
  onViewDetails?: (loan: Loan) => void;
  onRepay?: (loan: Loan) => void;
  showRepayButton?: boolean;
}

export function LoanCard({ 
  loan, 
  onViewDetails, 
  onRepay,
  showRepayButton = false
}: LoanCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(loan);
    }
  };

  const handleRepay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRepay) {
      onRepay(loan);
    }
  };

  const typeClass = getLoanTypeClass(loan.type);
  const statusClass = getLoanStatusBadgeClass(loan.status);
  const isBorrowing = loan.type === 'request';

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/30 bg-gradient-to-br from-card to-card/50" onClick={handleViewDetails}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <motion.span 
                className={`text-xs py-1.5 px-3 rounded-full font-medium ${typeClass} shadow-sm`}
                whileHover={{ scale: 1.05 }}
              >
                {isBorrowing ? 'Borrowed' : 'Lent'}
              </motion.span>
              <motion.h3 
                className="font-semibold mt-3 flex items-center text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <BitcoinIcon className="text-primary mr-2" size={20} />
                <span>{formatBTC(loan.amount)}</span>
              </motion.h3>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Status</p>
              <motion.p 
                className={`text-xs py-1.5 px-3 rounded-full font-medium inline-block ${statusClass} shadow-sm`}
                whileHover={{ scale: 1.05 }}
              >
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </motion.p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground mb-4">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{loan.interest}%</p>
              <p className="text-xs">Interest</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{loan.durationMonths}</p>
              <p className="text-xs">Months</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{loan.hasCollateral ? 'Yes' : 'No'}</p>
              <p className="text-xs">Collateral</p>
            </div>
          </div>
          
          {loan.createdAt && (
            <p className="text-xs text-muted-foreground flex items-center">
              <i className="ri-time-line mr-1"></i>
              Created on {new Date(loan.createdAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
        
        {(showRepayButton && loan.status === 'active' && isBorrowing) && (
          <CardFooter className="pt-0 pb-4 px-6">
            <motion.div className="w-full">
              <Button 
                onClick={handleRepay} 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200" 
                variant="default"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <i className="ri-money-dollar-circle-line mr-2"></i>
                Make Repayment
              </Button>
            </motion.div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}