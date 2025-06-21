import React from 'react';
import { Transaction } from '@shared/schema';
import { formatBTC, formatUSD, formatDateRelative, getTransactionTypeIcon, getTransactionTypeColor, isPositiveTransaction } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const transactionIcon = getTransactionTypeIcon(transaction.type);
  const transactionIconColor = getTransactionTypeColor(transaction.type);
  const positive = isPositiveTransaction(transaction.type);

  return (
    <div className="flex items-center">
      <div className={`${transactionIconColor} bg-opacity-10 rounded-full p-2 mr-3`}>
        <i className={`ri-${transactionIcon}-line`}></i>
      </div>
      <div className="flex-1">
        <p className="font-medium">{transaction.description}</p>
        <p className="text-xs text-muted-foreground">{formatDateRelative(transaction.createdAt)}</p>
      </div>
      <div className="text-right">
        <p className={`font-medium ${positive ? 'text-success' : 'text-destructive'} flex items-center justify-end`}>
          <i className={`ri-${positive ? 'add' : 'subtract'}-line mr-1 text-xs`}></i>
          <span>{formatBTC(transaction.amount)}</span>
        </p>
        {transaction.usdValue && (
          <p className="text-xs text-muted-foreground">{formatUSD(transaction.usdValue)}</p>
        )}
      </div>
    </div>
  );
}
