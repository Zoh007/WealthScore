import { useState } from "react";
import { AddGoalModal } from "./CreateGoalModal";

export const Goals = ({ savingsRate }: { savingsRate: number }) => {
    const [goals, setGoals] = useState([
        { name: 'Vacation to Italy', amount: 5000, targetDate: '2026-12-31' }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const monthlySavings = (60000 / 12) * (savingsRate / 100);

    const getStatus = (monthsToGoal: number, targetMonths: number) => {
        if (targetMonths <= 0) return { text: "Date is in the past", color: "text-gray-500", bg: "bg-gray-100" };
        if (monthsToGoal <= targetMonths) return { text: "On Track", color: "text-green-500", bg: "bg-green-50" };
        if (monthsToGoal <= targetMonths * 1.5) return { text: "Needs Attention", color: "text-yellow-500", bg: "bg-yellow-50" };
        return { text: "At Risk", color: "text-red-500", bg: "bg-red-50" };
    };

    const handleAddGoal = (newGoal: any) => {
        setGoals([...goals, newGoal]);
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
                    const monthsToGoal = goal.amount / monthlySavings;
                    const targetDate = new Date(goal.targetDate);
                    const now = new Date();
                    const targetMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
                    const status = getStatus(monthsToGoal, targetMonths);

                    return (
                        <li key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700 text-sm">{goal.name}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.color} ${status.bg}`}>
                                    {status.text}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Projected to reach in <span className="font-bold text-purple-600">~{Math.round(monthsToGoal)}</span> months.
                            </p>
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