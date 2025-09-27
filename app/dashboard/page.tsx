import { Container } from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { FinancialScoreDisplay } from "@/components/FinancialScoreDisplay";

let score = 67
let trend = 3
let status = "Good"

export default function Dashboard() {
  return (
    <Container className="flex flex-wrap">
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <FinancialScoreDisplay score={78} trend={5} status="Good" />
      </div>
    </Container>
  );
}