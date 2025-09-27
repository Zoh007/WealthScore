"use client"
import { Container } from "@/components/Container";
import { useState } from "react";
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

export default function Planning() {
  const [savingsRate, setSavingsRate] = useState(15);
  
  return (
    <Container className="flex flex-wrap flex-col w-full p-12">
      <div className="relative min-h-screen w-full font-sans p-4 sm:p-6 lg:p-8 overflow-hidden">       
            <div className="relative z-10">
                <header className="mb-8 max-w-2xl">
                    <h1 className="text-3xl font-bold text-gray-800">Financial Planner</h1>
                    <p className="text-gray-500 mt-1">Plan for your future by adjusting your goals and seeing the long-term impact.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 flex flex-col gap-8 justify-center">
                        <SavingsSlider savingsRate={savingsRate} setSavingsRate={setSavingsRate} />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                        <Goals savingsRate={savingsRate} />
                    </div>
                </div>
                <div className="mt-15">
                  <FutureProjectionChart savingsRate={savingsRate}/>
                </div>
            </div>
        </div>
    </Container>
  );
}