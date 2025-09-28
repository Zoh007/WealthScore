import { useState, useEffect, useCallback } from 'react';

interface Account {
  _id: string;
  balance: number;
  type: string;
  nickname?: string;
}

interface Transaction {
  _id: string;
  amount: number;
  description?: string;
  date?: string;
  type: 'deposit' | 'purchase' | 'bill' | 'merchant';
  status?: string;
  medium?: string;
  merchant_id?: string;
  payer_id?: string;
  payee_id?: string;
}

export interface FinancialData {
  accounts: Account[];
  deposits: Transaction[];
  purchases: Transaction[];
  bills: Transaction[];
  lastUpdated: Date | null;
}

interface UseFinancialDataReturn {
  data: FinancialData;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  refreshData: () => Promise<void>;
}

// Configuration
const API_BASE_URL = '/api';
const CUSTOMER_ID = '68d8200d9683f20dd5196758';
const CHECKING_ACCOUNT_ID = '68d8200d9683f20dd5196759';
const POLLING_INTERVAL = 60000; // 60 seconds - matching nessie-demo real-data-polling.js

export function useFinancialData(): UseFinancialDataReturn {
  const [data, setData] = useState<FinancialData>({
    accounts: [],
    deposits: [],
    purchases: [],
    bills: [],
    lastUpdated: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // API fetch functions
  const fetchAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${CUSTOMER_ID}/accounts`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }, []);

  const fetchDeposits = useCallback(async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${CHECKING_ACCOUNT_ID}/deposits`);
      if (!response.ok) throw new Error('Failed to fetch deposits');
      const deposits = await response.json();
      return deposits.map(({ transaction_date, ...rest }: any) => ({
        ...rest,
        date: transaction_date,
        type: 'deposit' as const
      }));
    } catch (error) {
      console.error('Error fetching deposits:', error);
      return [];
    }
  }, []);

  const fetchPurchases = useCallback(async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${CHECKING_ACCOUNT_ID}/purchases`);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const purchases = await response.json();
      return purchases.map(({ purchase_date, ...rest }: any) => ({
        ...rest,
        date: purchase_date,
        type: 'purchase' as const
      }));
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  }, []);

  const fetchBills = useCallback(async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${CHECKING_ACCOUNT_ID}/bills`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      const bills = await response.json();
      return bills.map((b: any) => ({ ...b, type: 'bill' as const }));
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  }, []);

  // Main data fetching function - matching nessie-demo approach
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Polling Financial Data`);
    console.log('=' .repeat(50));

    try {
      const [accounts, deposits, purchases, bills] = await Promise.all([
        fetchAccounts(),
        fetchDeposits(),
        fetchPurchases(),
        fetchBills(),
      ]);

      // Log summary like nessie-demo
      if (accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
        console.log(`💰 Total Balance: $${totalBalance.toLocaleString()}`);
        accounts.forEach(account => {
          console.log(`  - ${account.nickname || account._id}: $${account.balance?.toLocaleString() || 0} (${account.type})`);
        });
      }

      setData({
        accounts,
        deposits,
        purchases,
        bills,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('❌ Error in financial polling:', error instanceof Error ? error.message : 'Unknown error');
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccounts, fetchDeposits, fetchPurchases, fetchBills]);

  // Polling control functions - matching nessie-demo approach
  const startPolling = useCallback(() => {
    if (isPolling) {
      console.log('⚠️ Already polling financial data');
      return;
    }
    
    setIsPolling(true);
    console.log('🚀 Starting financial data polling...\n');
    
    fetchAllData(); // Initial fetch
    
    const interval = setInterval(fetchAllData, POLLING_INTERVAL);
    setPollingInterval(interval);
  }, [isPolling, fetchAllData]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
    console.log('🛑 Financial data polling stopped');
  }, [pollingInterval]);

  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    data,
    isLoading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refreshData,
  };
}
