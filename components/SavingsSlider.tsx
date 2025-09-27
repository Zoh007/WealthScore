export const SavingsSlider = ({ savingsRate, setSavingsRate }: { savingsRate: number, setSavingsRate: (rate: number) => void }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Adjust Your Savings Goal</h3>
            <p className="text-gray-500 text-sm mb-4">See how changing your monthly savings rate impacts your future.</p>
            
            <div className="text-center mb-4">
                <span className="text-5xl font-bold text-purple-600">{savingsRate}%</span>
                <span className="text-gray-500 ml-2">of income</span>
            </div>

            <input
                type="range"
                min="5"
                max="50"
                value={savingsRate}
                onChange={(e) => setSavingsRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-purple-500"
            />
             <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5%</span>
                <span>50%</span>
            </div>
        </div>
    );
};