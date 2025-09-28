"use client"
import { Container } from "@/components/Container";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { SavingsSlider } from "@/components/SavingsSlider"
import { Goals } from "@/components/Goals"
import { FutureProjectionChart } from "@/components/FutureProjectionChart";
import { useFinancialData } from "@/hooks/use-financial-data";

export default function Planning() {
  const [savingsRate, setSavingsRate] = useState(15);
  const { data, isLoading = true, error, isPolling, startPolling, stopPolling, refreshData } = useFinancialData();
  const monthlyIncome = data.deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
  const totalBalance = data.accounts.reduce((sum, account) => sum + (account.balance || 0), 0);


  useEffect(() => {
      startPolling();
      
      // Cleanup on unmount
      return () => {
        stopPolling();
      };
    }, []);
  
  return (
    <Container className="flex flex-wrap flex-col w-full p-12">
      {(isLoading && data.accounts.length === 0) && (
        <div className="text-2xl fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50 font-semibold text-gray-600">Loading Financial Data..</div>
      )}
      <div className="relative min-h-screen w-full font-sans p-4 sm:p-6 lg:p-8 overflow-hidden">       
            <div className="relative z-10">
                <header className="mb-8 max-w-2xl">
                    <h1 className="text-3xl font-bold text-gray-800">Financial Planner</h1>
                    <p className="text-gray-500 mt-1">Plan for your future by adjusting your goals and seeing the long-term impact.</p>
                    <p className="text-gray-500 mt-1">Your current monthly income is <span className="font-bold">${monthlyIncome}</span></p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 flex flex-col gap-8 justify-center">
                        <SavingsSlider savingsRate={savingsRate} setSavingsRate={setSavingsRate} />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                        <Goals savingsRate={savingsRate} monthlyIncome={monthlyIncome} />
                    </div>
                </div>
                <div className="mt-15">
                  <FutureProjectionChart savingsRate={savingsRate} monthlyIncome={monthlyIncome} totalBalance={totalBalance}/>
                </div>
            </div>
        </div>
    </Container>
  );
}