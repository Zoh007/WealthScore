import React, { useState, useMemo } from 'react';

export type Transaction = {
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
};

const useSortableData = (items: Transaction[], config = { key: 'date' as keyof Transaction, direction: 'descending' }) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Transaction];
        const bValue = b[sortConfig.key as keyof Transaction];

        // Handle null/undefined dates to always put them at the end
        if (sortConfig.key === 'date') {
            if (!a.date && b.date) return 1;
            if (a.date && !b.date) return -1;
            if (!a.date && !b.date) return 0;
        }

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof Transaction) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};


export const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction =>
            transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.amount.toString().includes(searchTerm)
        );
    }, [transactions, searchTerm]);
    
    const { items, requestSort, sortConfig } = useSortableData(filteredTransactions);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [items, currentPage]);

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

    const getSortIcon = (key: keyof Transaction) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        }
        if (sortConfig.direction === 'ascending') {
            return <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
        }
        return <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
    };

    const getTypePill = (type: Transaction['type']) => {
        const styles = {
            deposit: 'bg-green-100 text-green-800',
            purchase: 'bg-blue-100 text-blue-800',
            bill: 'bg-yellow-100 text-yellow-800',
            merchant: 'bg-indigo-100 text-indigo-800',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Recent Transactions</h3>
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('date')}>
                                <div className="flex items-center">Date {getSortIcon('date')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('type')}>
                                <div className="flex items-center">Type {getSortIcon('type')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer text-right" onClick={() => requestSort('amount')}>
                                <div className="flex items-center justify-end">Amount {getSortIcon('amount')}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((transaction) => (
                            <tr key={transaction._id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-600">{transaction.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{transaction.description}</td>
                                <td className="px-6 py-4">{getTypePill(transaction.type)}</td>
                                <td className={`px-6 py-4 font-medium text-right ${transaction.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-700">
                    Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
                <div className="inline-flex mt-2 xs:mt-0">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-l hover:bg-purple-700 disabled:bg-gray-300"
                    >
                        Prev
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-r border-0 border-l border-purple-700 hover:bg-purple-700 disabled:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
