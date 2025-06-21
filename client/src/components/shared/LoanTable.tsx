import React from 'react';
import { Loan } from '@shared/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBTC, getLoanStatusBadgeClass, getLoanTypeClass } from '@/lib/utils';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';
import { Button } from '@/components/ui/button';

interface LoanTableProps {
  loans: Loan[];
  onViewDetails: (loan: Loan) => void;
}

export function LoanTable({ loans, onViewDetails }: LoanTableProps) {
  if (!loans.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">You don't have any active loans yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interest</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell>
                <div className="flex items-center">
                  <span className={`text-xs py-1 px-2 rounded-full font-medium ${getLoanTypeClass(loan.type)}`}>
                    {loan.type === 'request' ? 'Borrowed' : 'Lent'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <BitcoinIcon className="text-primary mr-1" size={16} />
                  <span className="font-medium">{formatBTC(loan.amount)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{loan.interest}%</span>
              </TableCell>
              <TableCell>
                <span>{loan.durationMonths} months</span>
              </TableCell>
              <TableCell>
                <span className={`text-xs py-1 px-2 rounded-full font-medium ${getLoanStatusBadgeClass(loan.status)}`}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-primary-foreground hover:bg-primary"
                  onClick={() => onViewDetails(loan)}
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
