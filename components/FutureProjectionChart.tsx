import { useMemo } from "react";

export const FutureProjectionChart = ({ savingsRate }: { savingsRate: number }) => {
    const income = 60000; // Example annual income
    
    const projectionData = useMemo(() => {
        const data = [];
        let currentValue = 5000; // Starting savings
        const monthlyContribution = (income / 12) * (savingsRate / 100);

        for (let i = 0; i <= 10; i++) { // Project 10 years
            data.push({ year: `Year ${i}`, value: currentValue });
            currentValue += monthlyContribution * 12 * 1.05; // Assuming 5% annual growth
        }
        return data;
    }, [savingsRate, income]);

    const maxValue = projectionData[projectionData.length - 1].value;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-2">10-Year Savings Projection</h3>
            <p className="text-gray-500 text-sm mb-6">Based on a <span className="font-semibold text-purple-600">{savingsRate}%</span> savings rate.</p>
            <div className="w-full h-64 flex items-end justify-around space-x-2">
                {projectionData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                        <div 
                            className="w-full bg-purple-400 rounded-t-md transition-all duration-300 ease-out"
                            style={{ height: `${(d.value / maxValue) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">{d.year}</span>
                    </div>
                ))}
            </div>
             <p className="text-center text-gray-700 mt-4">Projected balance in 10 years: <span className="font-bold text-xl text-purple-600">${Math.round(maxValue).toLocaleString()}</span></p>
        </div>
    );
};