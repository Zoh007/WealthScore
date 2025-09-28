import { FinancialData } from "@/hooks/use-financial-data";
import { useMemo, useState } from "react";
import { AccordionItem } from "./AccordionItem";

export const ScoreBreakdownAccordion = ({ data }: { data: FinancialData }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const monthlyIncome = data.deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    const discretionarySpending = data.purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
    const billSpendings = data.bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const monthlySavings = monthlyIncome - discretionarySpending - billSpendings;
    const discretionaryBudget = monthlyIncome - billSpendings;
    const availableBalance = data.accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalBills = (data.bills.filter(transaction => {
      if (transaction.type !== 'bill' || !transaction.date) {
        return false;
      }
      const transactionDate = new Date(transaction.date);
      // Return true only if the transaction date is before today
      return transactionDate < today;
    })).length

    const billsOnTime = (data.bills.filter(transaction => {
      if (transaction.type !== 'bill' || !transaction.date) {
        return false;
      }
      const transactionDate = new Date(transaction.date);
      // Return true only if the transaction date is before today
      return transactionDate < today && transaction.status === "executed";
    })).length

    const upcomingBills = data.bills.filter(transaction => {
        // Must be a bill and have a date
        if (transaction.type !== 'bill' || !transaction.date) {
            return false;
        }
        const transactionDate = new Date(transaction.date);
        // The transaction date must be after today
        return transactionDate > today;
    }).reduce((sum, bill) => sum + bill.amount, 0)

    const outstandingDebt = data.bills.filter(transaction => {
        // Must be a bill, have a date, and not be paid yet.
        if (transaction.type !== 'bill' || !transaction.date || transaction.status === 'executed') {
            return false;
        }

        const transactionDate = new Date(transaction.date);
        
        // The transaction date must be on or before today.
        return transactionDate <= today;
    }).reduce((sum, bill) => sum + bill.amount, 0);


    const scoreCalculations = useMemo(() => {
        // --- Calculation Logic ---
        const calculateSavingsScore = () => {
            if (monthlyIncome === 0) return 0;
            const savingsRatio = monthlySavings / monthlyIncome;
            // Assumes 30% savings rate is ideal (100 points)
            return Math.min((savingsRatio < 0 ? 0 : savingsRatio) * 100 / 0.3, 100);
        };

        const calculateSpendingScore = () => {
            if (discretionaryBudget === 0) return 100;
            return Math.max(0, 100 - (discretionarySpending / discretionaryBudget) * 100);
        };

        const calculateBillsScore = () => {
            if (totalBills === 0) return 100;
            return (billsOnTime / totalBills) * 100;
        };

        const calculateLiquidityScore = () => {
            if (upcomingBills === 0) return 100;
            return Math.min((availableBalance / upcomingBills) * 100, 100);
        };

        const calculateDebtScore = () => {
            if (monthlyIncome === 0) return 0;
            return Math.max(0, 100 - (outstandingDebt / monthlyIncome) * 100);
        };

        // --- Generate Status & Content ---
        const getStatus = (score: number): { status: string; color: string } => {
            if (score >= 90) return { status: 'Excellent', color: 'green' };
            if (score >= 75) return { status: 'Good', color: 'green' };
            if (score >= 60) return { status: 'Fair', color: 'yellow' };
            return { status: 'Needs Improvement', color: 'red' };
        };

        const scores = {
            savings: calculateSavingsScore(),
            spending: calculateSpendingScore(),
            bills: calculateBillsScore(),
            liquidity: calculateLiquidityScore(),
            debt: calculateDebtScore(),
        };

        return [
            {
                title: 'Savings Ratio',
                score: scores.savings,
                ...getStatus(scores.savings),
                content: `Based on your income of $${monthlyIncome.toFixed(2)} and savings of $${monthlySavings.toFixed(2)}, your savings rate is ${((monthlySavings / monthlyIncome) * 100 || 0).toFixed(1)}%. We recommend a target of 30% for an excellent score.`
            },
            {
                title: 'Spending Balance',
                score: scores.spending,
                ...getStatus(scores.spending),
                content: `You've spent $${discretionarySpending.toFixed(2)} out of your $${discretionaryBudget.toFixed(2)} discretionary budget. Staying within your budget is key to a high score.`
            },
            {
                title: 'Bill Timeliness',
                score: scores.bills,
                ...getStatus(scores.bills),
                content: `You've paid ${billsOnTime} out of ${totalBills} bills on time. Punctual payments have a very strong positive impact on your financial health.`
            },
            {
                title: 'Emergency Cushion (Liquidity)',
                score: scores.liquidity,
                ...getStatus(scores.liquidity),
                content: `With $${availableBalance.toFixed(2)} available and $${upcomingBills.toFixed(2)} in upcoming bills, your liquidity is being assessed. Having a balance that covers upcoming expenses is crucial.`
            },
            {
                title: 'Debt / Risk Management',
                score: scores.debt,
                ...getStatus(scores.debt),
                content: `Your outstanding debt is $${outstandingDebt.toFixed(2)} relative to your monthly income of $${monthlyIncome.toFixed(2)}. Keeping debt low compared to income is a sign of good risk management.`
            },
        ];
    }, [data]);

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg">
            <h3 className="font-bold text-xl text-gray-800 p-5">Score Breakdown</h3>
            <div className="divide-y divide-gray-200">
                {scoreCalculations.map((item, index) => (
                    <AccordionItem
                        key={index}
                        title={item.title}
                        status={item.status}
                        color={item.color}
                        content={item.content}
                        score={item.score}
                        isOpen={openIndex === index}
                        onClick={() => handleItemClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};