"use client"
import { createContext, ReactNode, useContext, useState } from "react";
import { Transaction } from "./TransactionsTable";

// --- React Context for State Management ---
interface SimulationContextType {
  isSimulationMode: boolean;
  toggleSimulationMode: () => Promise<void>;
  addMockTransaction: (transaction: Omit<Transaction, '_id' | 'status'>) => Promise<void>;
  resetSimulation: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  // This state now stores the full transaction objects created via API during simulation
  const [simulatedTransactions, setSimulatedTransactions] = useState<Transaction[]>([]);

  // Function to delete simulated transactions from the API
  const deleteSimulatedTransactions = async () => {
    if (simulatedTransactions.length === 0) return;

    // Create an array of promises for each DELETE request
    const deletePromises = simulatedTransactions.map(transaction => {
      console.log(`[API Call] Deleting transaction with ID: ${transaction._id}`);
      // Replace with your actual API call
      // return fetch(`/api/nessie/transactions/${transaction._id}`, { method: 'DELETE' });
      return Promise.resolve(); // Mocking success
    });

    try {
      await Promise.all(deletePromises);
      console.log('All simulated transactions deleted successfully.');
    } catch (error) {
      console.error('Failed to delete one or more simulated transactions:', error);
    }
    
    // Clear the local state after deletion
    setSimulatedTransactions([]);
  };
  
  const toggleSimulationMode = async () => {
    if (isSimulationMode) {
      // If turning mode OFF, delete all simulated data first
      await deleteSimulatedTransactions();
    }
    setIsSimulationMode(prev => !prev);
  };
  
  const addMockTransaction = async (transactionData: Omit<Transaction, '_id' | 'status'>) => {
    if (!isSimulationMode) return;
    
    try {
      console.log('[API Call] Creating new transaction:', transactionData);
      // Replace with your actual API POST request to Nessie
      /*
      const response = await fetch('/api/nessie/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      const newTransactionFromApi: Transaction = await response.json();
      */

      // Mocking the API response for demonstration
      const newTransactionFromApi: Transaction = {
        ...transactionData,
        _id: `api_${Date.now()}`,
        status: 'pending'
      };

      // Add the newly created transaction to our state
      setSimulatedTransactions(prev => [...prev, newTransactionFromApi]);
      console.log('Successfully created and stored new transaction.');

    } catch (error) {
      console.error('Error creating mock transaction:', error);
    }
  };

  const resetSimulation = async () => {
    await deleteSimulatedTransactions();
  }

  return (
    <SimulationContext.Provider value={{ isSimulationMode, toggleSimulationMode, addMockTransaction, resetSimulation }}>
      {children}
    </SimulationContext.Provider>
  );
};

// --- Components ---

export const SimulationBanner = () => {
  const { isSimulationMode } = useSimulation();
  if (!isSimulationMode) return null;

  return (
    <div className="fixed bottom-0 z-50 w-full bg-purple-600 text-white text-center p-2 font-semibold shadow-lg">
      <p>You are currently in Simulation Mode. Mock data has been added to your profile.</p>
    </div>
  );
};