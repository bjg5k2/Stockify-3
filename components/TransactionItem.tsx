import React from 'react';
import { Transaction } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isInvest = transaction.type === 'invest';

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isInvest ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {isInvest ? <TrendUpIcon className="w-5 h-5 text-emerald-400" /> : <TrendDownIcon className="w-5 h-5 text-red-400" />}
        </div>
        <div>
          <p className="font-semibold text-white">
            {isInvest ? 'Invested in' : 'Sold'} {transaction.artistName}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(transaction.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      <p className={`font-bold ${isInvest ? 'text-red-400' : 'text-emerald-400'}`}>
        {isInvest ? '−' : '+'}{formatCurrency(transaction.amount)}
      </p>
    </div>
  );
};

export default TransactionItem;
