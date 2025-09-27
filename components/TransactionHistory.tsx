import React from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';

interface Transaction {
  _id: string;
  amount: number;
  description?: string;
  date?: string;
  type: 'deposit' | 'purchase' | 'bill';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading = false,
}) => {
  // Sort transactions by date (most recent first) and limit to 10
  const sortedTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(a.date || Date.now());
      const dateB = new Date(b.date || Date.now());
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💵';
      case 'purchase':
        return '🛒';
      case 'bill':
        return '📋';
      default:
        return '💰';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'purchase':
        return 'Purchase';
      case 'bill':
        return 'Bill';
      default:
        return 'Transaction';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardTitle>Recent Transactions</CardTitle>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <Card className="w-full">
        <CardTitle>Recent Transactions</CardTitle>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No transactions available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardTitle>Recent Transactions</CardTitle>
      <CardContent>
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {transaction.description || getTransactionTypeLabel(transaction.type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getTransactionTypeLabel(transaction.type)} • {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
              <div
                className={`font-bold text-lg ${
                  transaction.type === 'deposit'
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {transaction.type === 'deposit' ? '+' : '-'}$
                {Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
