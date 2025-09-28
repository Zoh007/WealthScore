'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useFinancialData } from '@/hooks/use-financial-data';

interface FinancialDataContextType {
  data: any;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  refreshData: () => Promise<void>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const financialData = useFinancialData();

  // Start polling financial data when the provider mounts
  useEffect(() => {
    if (!financialData.isPolling) {
      financialData.startPolling();
    }
    
    // Cleanup polling when component unmounts
    return () => {
      if (financialData.isPolling) {
        financialData.stopPolling();
      }
    };
  }, [financialData.isPolling, financialData.startPolling, financialData.stopPolling]);

  return (
    <FinancialDataContext.Provider value={financialData}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialDataContext() {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialDataContext must be used within a FinancialDataProvider');
  }
  return context;
}
