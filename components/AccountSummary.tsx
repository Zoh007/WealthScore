import React from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';

interface Account {
  _id: string;
  balance: number;
  type: string;
  nickname?: string;
}

interface AccountSummaryProps {
  accounts: Account[];
  deposits: any[];
  purchases: any[];
  bills: any[];
  isLoading?: boolean;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  accounts,
  deposits,
  purchases,
  bills,
  isLoading = false,
}) => {
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const totalDeposits = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
  const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
  const totalBills = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="w-full">
            <CardTitle>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardTitle>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Total Balance */}
      <Card className="w-full">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Total Balance
        </CardTitle>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${totalBalance.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Total Deposits */}
      <Card className="w-full">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💵</span>
          Deposits
        </CardTitle>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${totalDeposits.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {deposits.length} transaction{deposits.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Total Purchases */}
      <Card className="w-full">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          Purchases
        </CardTitle>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {purchases.length} transaction{purchases.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Total Bills */}
      <Card className="w-full">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Bills
        </CardTitle>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">
            ${totalBills.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {bills.length} bill{bills.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
