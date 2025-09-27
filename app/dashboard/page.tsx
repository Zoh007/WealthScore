import { Container } from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { FinancialScoreDisplay } from "@/components/FinancialScoreDisplay";
import {
  Card,
  CardContent,
} from "@/components/ui/card"

let score = 67
let trend = 3
let status = "Good"
let name = "Nathan"

export default function Dashboard() {
  return (
    <Container className="flex flex-wrap min-h-screen w-full p-12">
      <header className="mb-8">
        <h1 className="text-5xl font-semibold text-gray-800">Good morning, {name}</h1>
        <p className="mt-2 text-gray-500">Here's your financial wellness at a glance.</p>
      </header>
      <main className="flex items-center justify-around w-full">
        <Card className="w-1/5">
        </Card>
        <FinancialScoreDisplay score={67} trend={3} status="Good" />
        <Card className="w-1/5">
        </Card>
      </main>
    </Container>
  );
}