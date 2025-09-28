import { useMemo } from "react";

export const FutureProjectionChart = ({ savingsRate, monthlyIncome, totalBalance }: 
    { savingsRate: number, monthlyIncome: number, totalBalance: number}) => {    
    const projectionData = useMemo(() => {
        const data = [];
        const monthlyContribution = monthlyIncome * (savingsRate / 100);

        for (let i = 0; i <= 10; i++) { // Project 10 years
            data.push({ year: `Year ${i}`, value: totalBalance });
            totalBalance += monthlyContribution * 12 * 1.05; // Assuming 5% annual growth
        }
        return data;
    }, [savingsRate, monthlyIncome]);

    const maxValue = projectionData[projectionData.length - 1].value;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-2">10-Year Savings Projection</h3>
            <p className="text-gray-500 text-sm mb-6">Based on a <span className="font-semibold text-purple-600">{savingsRate}%</span> savings rate.</p>
            <div className="w-full h-64 flex items-end justify-around space-x-2">
                {projectionData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                        <div 
                            className="w-full bg-purple-400 rounded-t-md transition-all duration-300 ease-out flex justify-center items-center text-gray-100"
                            style={{ height: `${(d.value / maxValue) * 100}%` }}
                        >{Math.floor(d.value / 1000)}k</div>
                        <span className="text-xs text-gray-500 mt-2">{d.year}</span>
                    </div>
                ))}
            </div>
             <p className="text-center text-gray-700 mt-4">Projected balance in 10 years: <span className="font-bold text-xl text-purple-600">${Math.round(maxValue).toLocaleString()}</span></p>
        </div>
    );
};