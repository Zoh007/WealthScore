"use client"
import { useState } from "react";

export const AddGoalModal = ({ isOpen, onClose, onAddGoal }: { isOpen: boolean, onClose: () => void, onAddGoal: (goal: any) => void }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (name && amount && targetDate) {
            onAddGoal({
                name,
                amount: Number(amount),
                targetDate,
            });
            setName('');
            setAmount('');
            setTargetDate('');
            onClose();
        } else {
            // A more user-friendly validation would be ideal in a real app
            alert('Please fill out all fields.'); 
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Goal</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., New Car Down Payment"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Amount ($)</label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 5000"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Target Date</label>
                        <input 
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Add Goal
                    </button>
                </div>
            </div>
        </div>
    );
};