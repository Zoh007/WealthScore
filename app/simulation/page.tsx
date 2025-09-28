"use client";
import React, { useState } from 'react';
import { useSimulation } from "@/components/SimulationProvider"
import { Transaction } from '@/components/TransactionsTable';

const CreateTransactionCard = () => {
    const { isSimulationMode } = useSimulation();
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState("Mock Transaction 1");
    const [amount, setAmount] = useState(10);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [type, setType] = useState<'deposit' | 'purchase' | 'bill' | 'merchant'>('purchase');
    const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff';
    const BASE_URL = 'http://api.nessieisreal.com';
    const request = require('superagent');

    const handleSubmit = async (e: React.FormEvent) => {
      console.log("HELLO")
        e.preventDefault();
        if(!description || !amount || !date || !type ) return;
        
        const transactionPayload = {
          merchant_id: "68d757c99683f20dd5195f5b", // Example merchant ID
          medium: "balance",
          purchase_date: date,
          amount: amount,
          description: description,
          status: "pending",
        };

        try {
          console.log("before req")
          const response = await request
          .post(`${BASE_URL}/accounts/68d8200d9683f20dd5196759/purchases?key=${API_KEY}`)
          .send(transactionPayload)
          .timeout(10000);
          console.log("after req")
        } catch (error) {
          console.log("error")
          console.error(error);
        }


        setIsLoading(false);
        // Reset form
        setDescription("Mock Transaction 1");
        setAmount(10);
    }

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-lg transition-opacity ${isSimulationMode ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
             <h3 className="font-bold text-lg text-gray-800 mb-4">Create Mock Transaction</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-md" disabled={!isSimulationMode || isLoading} />
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(+e.target.value)} className="w-full p-2 border rounded-md" disabled={!isSimulationMode || isLoading} />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md" disabled={!isSimulationMode || isLoading} />
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md" disabled={!isSimulationMode || isLoading}>
                    <option value="purchase">Purchase</option>
                    <option value="deposit">Deposit</option>
                    <option value="bill">Bill</option>
                    <option value="merchant">Merchant</option>
                </select>
                <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded-md font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!isSimulationMode || isLoading}>
                    {isLoading ? 'Creating...' : 'Add Transaction'}
                </button>
             </form>
        </div>
    );
};

// const MockDataList = () => {
//     // This component now needs to get the simulated transactions directly
//     const { isSimulationMode, resetSimulation } = useSimulation();
    
//     // We only want to display transactions created during the simulation
//     const simulatedData = transactions.filter(t => !originalMockTransactions.some(orig => orig._id === t._id));

//     if(!isSimulationMode) return null;

//     return (
//         <div className="bg-white p-6 rounded-2xl shadow-lg mt-8">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-bold text-lg text-gray-800">Generated Mock Data</h3>
//                 <button onClick={resetSimulation} className="text-sm text-red-500 hover:text-red-700 font-semibold">Clear All</button>
//             </div>
//             <ul className="divide-y divide-gray-200">
//                 {simulatedData.map(t => (
//                     <li key={t._id} className="py-2 flex justify-between">
//                         <span>{t.description}</span>
//                         <span className={t.type === 'deposit' ? 'text-green-600' : 'text-gray-800'}>
//                             {t.type === 'deposit' ? '+' : '-'}${t.amount.toFixed(2)}
//                         </span>
//                     </li>
//                 ))}
//                 {simulatedData.length === 0 && <p className="text-gray-500 text-center py-4">No mock data created yet.</p>}
//             </ul>
//         </div>
//     )
// }

// This component contains the actual UI for the page and consumes the simulation context.
const Simulation = () => {
  const { isSimulationMode, toggleSimulationMode } = useSimulation();

  return (
    <div className="p-8 flex items-center justify-center w-full">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Simulation Mode</h2>
                    <p className="text-gray-600">Create mock data to see how your financial score might change.</p>
                </div>
                <label htmlFor="simulation-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input id="simulation-toggle" type="checkbox" className="sr-only" checked={isSimulationMode} onChange={() => toggleSimulationMode()} />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isSimulationMode ? 'transform translate-x-6 bg-purple-500' : ''}`}></div>
                    </div>
                </label>
            </div>
        </div>
        
        <CreateTransactionCard />

        {/* <MockDataList /> */}

      </div>
    </div>
  );
};

export default Simulation;

