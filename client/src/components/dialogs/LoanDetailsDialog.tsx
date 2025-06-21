import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loan } from '@shared/schema';
import { formatBTC, formatDateRelative, getLoanStatusBadgeClass, calculateRepaymentAmount } from '@/lib/utils';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';

interface LoanDetailsDialogProps {
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
  onRepay?: () => void;
}

export function LoanDetailsDialog({ loan, isOpen, onClose, onRepay }: LoanDetailsDialogProps) {
  const isBorrowing = loan.type === 'request';
  const statusClass = getLoanStatusBadgeClass(loan.status);
  
  // Calculate loan financials
  const totalRepayment = calculateRepaymentAmount(loan.amount, loan.interest, loan.durationMonths);
  const interestAmount = totalRepayment - loan.amount;
  
  // For demo purposes, assume 50% has been paid if the loan is active
  const paymentProgress = loan.status === 'active' ? 50 : loan.status === 'completed' ? 100 : 0;
  const remainingAmount = totalRepayment * (1 - paymentProgress / 100);
  
  // Calculate monthly payment
  const monthlyPayment = totalRepayment / loan.durationMonths;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Loan Details</DialogTitle>
          <DialogDescription>
            View details and status of your {isBorrowing ? "borrowed" : "lent"} loan
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Loan Amount</p>
              <p className="text-2xl font-bold flex items-center">
                <BitcoinIcon className="text-primary mr-1" size={20} />
                {formatBTC(loan.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`text-sm py-1 px-3 rounded-full font-medium inline-block ${statusClass}`}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="font-medium">{loan.interest}% APR</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{loan.durationMonths} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collateral Required</p>
              <p className="font-medium">{loan.hasCollateral ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDateRelative(loan.createdAt)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Principal</p>
              <p className="font-medium">{formatBTC(loan.amount)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Interest</p>
              <p className="font-medium">{formatBTC(interestAmount)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium">Total Repayment</p>
              <p className="font-medium">{formatBTC(totalRepayment)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
              <p className="font-medium">{formatBTC(monthlyPayment)}</p>
            </div>
          </div>
          
          {loan.status === 'active' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Repayment Progress</span>
                <span>{paymentProgress}%</span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{formatBTC(remainingAmount)}</span>
              </div>
            </div>
          )}
          
          {isBorrowing && loan.status === 'active' && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Payment Instructions</p>
              <p className="text-muted-foreground">
                Please make your monthly payments on time to maintain a good borrower rating
                and avoid any penalties.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {isBorrowing && loan.status === 'active' && onRepay && (
            <Button onClick={onRepay}>
              Make Repayment
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
