import { Container } from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { FinancialScoreDisplay } from "@/components/FinancialScoreDisplay";
import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { ScoreBreakdownAccordion } from "@/components/ScoreBreakdownAccordian";

let score = 67
let trend = 3
let status = "Good"
let name = "Nathan"
let earned = 2345
let spent = 1331
let saved = earned - spent > 0 ? earned - spent : 0
let actionItem1 = "You've saved an extra $150 this month. Great job!"
let actionItem2 = "'Dining Out' spending is 15\% higher than last month."
let actionItem3 = "Next bill: Internet ($60) is due in 3 days."

export default function Dashboard() {
  return (
    <Container className="flex flex-wrap flex-col w-full p-12">
      <header className="mb-8">
        <h1 className="text-5xl font-semibold text-indigo-600">Welcome back, <span className="text-gray-800">{name}</span></h1>
        <p className="mt-2 text-gray-600">Here's your financial wellness at a glance.</p>
      </header>
      <div className="flex items-center justify-around w-full">
        <Card className="w-1/5">
          <CardTitle>Cash Flow</CardTitle>
          <CardContent className="text-gray-600">So far this month, you have earned:</CardContent>
          <CardContent className="flex text-2xl font-bold text-green-600 justify-center">${earned}</CardContent>
          <CardContent className="text-gray-600">And have spent:</CardContent>
          <CardContent className="flex text-2xl font-bold text-red-400 justify-center">${spent}</CardContent>
          <CardContent className="text-gray-600">You are on track to save:</CardContent>
          <CardContent className="flex text-2xl font-bold text-blue-500 justify-center">${saved}</CardContent>
        </Card>
        <FinancialScoreDisplay score={score} trend={trend} status={status} />
        <Card className="w-1/5">
          <CardTitle>Action Items</CardTitle>
          <CardContent className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mx-3">{actionItem1}</CardContent>
          <CardContent className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm mx-3">{actionItem2}</CardContent>
          <CardContent className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm mx-3">{actionItem3}</CardContent>
        </Card>
      </div>
      <div className="mt-12 w-full px-6 mx-auto">
        <ScoreBreakdownAccordion />
      </div>
    </Container>
  );
}