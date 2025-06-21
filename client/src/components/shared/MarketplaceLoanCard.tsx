import React from 'react';
import { Loan } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';
import { formatBTC, getLoanTypeClass } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MarketplaceLoanCardProps {
  loan: Loan;
  rating?: number;
  onAccept: (loan: Loan) => void;
}

export function MarketplaceLoanCard({ 
  loan, 
  rating = 4.5,
  onAccept 
}: MarketplaceLoanCardProps) {
  const typeClass = getLoanTypeClass(loan.type);
  const isRequest = loan.type === 'request';
  
  const handleAccept = () => {
    onAccept(loan);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <motion.span 
                className={`text-xs py-1.5 px-3 rounded-full font-medium ${typeClass} shadow-sm`}
                whileHover={{ scale: 1.05 }}
              >
                {isRequest ? 'Loan Request' : 'Loan Offer'}
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
              <p className="text-muted-foreground text-sm">Interest Rate</p>
              <motion.p 
                className={`font-bold text-lg ${isRequest ? 'text-primary' : 'text-accent'}`}
                whileHover={{ scale: 1.1 }}
              >
                {loan.interest}%
              </motion.p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{loan.durationMonths}</p>
              <p className="text-xs">months</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center">
                <i className="ri-star-fill text-warning mr-1"></i>
                <span className="font-medium text-foreground">{rating}</span>
              </div>
              <p className="text-xs">rating</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">{loan.hasCollateral ? 'Yes' : 'No'}</p>
              <p className="text-xs">collateral</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-0 pt-2">
          <motion.div className="w-full">
            <Button 
              className={`w-full font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                isRequest 
                  ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                  : "bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              }`}
              onClick={handleAccept}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className={`ri-${isRequest ? 'hand-coin' : 'money-dollar-circle'}-line mr-2`}></i>
              {isRequest ? 'Lend Now' : 'Borrow Now'}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}