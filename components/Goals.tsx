import { useState } from "react";
import { AddGoalModal } from "./CreateGoalModal";
import { monitorEventLoopDelay } from "perf_hooks";

export const Goals = ({ savingsRate, monthlyIncome }: { savingsRate: number, monthlyIncome: number }) => {
    const [goals, setGoals] = useState([
        { name: 'Vacation to Italy', amount: 5000, targetDate: '2026-5-10' },
        { name: 'Car Upgrades', amount: 2500, targetDate: '2025-12-25' }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatus = (monthsToGoal: number, targetMonths: number) => {
        if (targetMonths <= 0) return { text: "Date is in the past", color: "text-gray-500", bg: "bg-gray-100" };
        if (monthsToGoal <= targetMonths) return { text: "On Track", color: "text-green-500", bg: "bg-green-50" };
        if (monthsToGoal <= targetMonths * 1.5) return { text: "Needs Attention", color: "text-yellow-500", bg: "bg-yellow-50" };
        return { text: "At Risk", color: "text-red-500", bg: "bg-red-50" };
    };

    const handleAddGoal = (newGoal: any) => {
        setGoals([...goals, newGoal]);
    };

    const handleDeleteGoal = (goalIndex: number) => {
        setGoals(goals.filter((_, index) => index !== goalIndex));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Goal Impact</h3>
                <button onClick={() => setIsModalOpen(true)} className="bg-purple-100 text-purple-600 p-2 rounded-full hover:bg-purple-200 focus:outline-none transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
            
            <ul className="space-y-3">
                {goals.length > 0 ? goals.map((goal, index) => {
                    const monthsToGoal = goal.amount / (monthlyIncome * savingsRate / 100);
                    const targetDate = new Date(goal.targetDate);
                    const now = new Date();
                    const targetMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
                    const status = getStatus(monthsToGoal, targetMonths);

                    return (
                        <li key={index} className="group p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                            <div className="w-full">
                                <div className="flex w-full items-center justify-between">
                                    <div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.color} ${status.bg} mr-3`}>
                                            {status.text}
                                        </span>
                                        <span className="font-medium text-gray-700 text-sm">{goal.name} - ${goal.amount}</span>
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm mr-4">{goal.targetDate}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 pl-1">
                                    Projected to reach in <span className="font-bold text-purple-600">~{Math.round(monthsToGoal)}</span> months.
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDeleteGoal(index)} 
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </li>
                    );
                }) : (
                     <p className="text-sm text-center text-gray-500 py-4">No goals yet. Add one to get started!</p>
                )}
            </ul>
             
             <AddGoalModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddGoal={handleAddGoal}
            />
        </div>
    );
}