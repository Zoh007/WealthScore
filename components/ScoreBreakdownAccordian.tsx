"use client"
import { AccordionItem } from "@/components/AccordionItem"
import { useState } from "react";

const accordionData = [
  { 
    title: 'Spending Balance', 
    status: 'Good', 
    color: 'green',
    content: 'Your spending is well-managed this month, staying 10% below your average. Keep an eye on the "Entertainment" category, which is slightly higher than usual.'
  },
  { 
    title: 'Savings Ratio', 
    status: 'Excellent', 
    color: 'green',
    content: 'You are on track to meet your savings goals, with a 18% savings rate this month. This is higher than your 15% target.'
  },
  { 
    title: 'Bill Timeliness', 
    status: 'Perfect', 
    color: 'green',
    content: '100% of your bills have been paid on time for the last 6 months. This has a strong positive impact on your score.'
  },
  { 
    title: 'Emergency Cushion (Liquidity)', 
    status: 'Fair', 
    color: 'yellow',
    content: 'A high percentage of your income is going towards non-essential spending. Consider allocating more to savings or investments.'
  },
  { 
    title: 'Debt/ Risk Management', 
    status: 'Good', 
    color: 'green',
    content: 'Your debt-to-income ratio is healthy at 25%. Continuing to pay down your existing credit card balance will improve this further.'
  },
];

export const ScoreBreakdownAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg">
            <h3 className="font-bold text-xl text-gray-800 p-5">Score Breakdown</h3>
            <div className="divide-y divide-gray-200">
                {accordionData.map((item, index) => (
                    <AccordionItem
                        key={index}
                        title={item.title}
                        status={item.status}
                        color={item.color}
                        content={item.content}
                        isOpen={openIndex === index}
                        onClick={() => handleItemClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};
