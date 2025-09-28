import { format, parseISO, startOfDay } from "date-fns";

export type TTransaction = {
  _id?: string;
  amount: number;
  date?: string; // ISO date string (optional)
  description?: string;
  merchant_id?: string;
  type?: "deposit" | "purchase" | "bill";
};

export type TTransactionsByDate = Record<string, TTransaction[]>;

export function toDateKey(d: Date) {
  return format(startOfDay(d), "yyyy-MM-dd");
}

export function groupTransactionsByDate(transactions: TTransaction[] = []): TTransactionsByDate {
  const map: TTransactionsByDate = {};

  for (const tx of transactions) {
    if (!tx || !tx.date) continue;
    const dateStr = String(tx.date);
    // normalize using parseISO then format
    let key = dateStr.slice(0, 10);
    try {
      key = format(startOfDay(parseISO(dateStr)), "yyyy-MM-dd");
    } catch (e) {
      // ignore parse errors and fallback to substring
    }

    if (!map[key]) map[key] = [];
    map[key].push(tx);
  }

  return map;
}

export function aggregateTransactions(transactions: TTransaction[] = []) {
  // Filter deposits and payments
  const deposits = transactions.filter(t => t.type === "deposit");
  const payments = transactions.filter(t => t.type === "purchase" || t.type === "bill");
  
  // Calculate totals
  const totalDeposits = deposits.reduce((s, t) => s + (t.amount || 0), 0);
  // Make totalPayments a positive number (absolute value of the sum)
  const rawPaymentsSum = payments.reduce((s, t) => s + (t.amount || 0), 0);
  const totalPayments = Math.abs(rawPaymentsSum);
  
  // Calculate transaction counts
  const depositCount = deposits.length;
  const paymentCount = payments.length;
  const count = transactions.length;
  
  // Calculate averages (all are positive numbers for better UI interpretation)
  const avgDeposit = depositCount > 0 ? totalDeposits / depositCount : 0;
  const avgPayment = paymentCount > 0 ? totalPayments / paymentCount : 0;
  
  // Net average per transaction (can be positive or negative)
  const netTotal = totalDeposits - totalPayments;
  const netAvgPerTransaction = count > 0 ? netTotal / count : 0;
  
  // Keep the original avg for backwards compatibility, but it's confusing so we add better metrics
  const avg = count > 0 ? (transactions.reduce((s, t) => s + (t.amount || 0), 0) / count) : 0;

  // top merchants
  const merchantCount: Record<string, { count: number; total: number }> = {};
  transactions.forEach(t => {
    const mid = (t as any).merchant_name || t.merchant_id || t.description || "unknown";
    if (!merchantCount[mid]) merchantCount[mid] = { count: 0, total: 0 };
    merchantCount[mid].count += 1;
    merchantCount[mid].total += t.amount || 0;
  });

  const topMerchants = Object.entries(merchantCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([name, stats]) => ({ name, ...stats }));

  return { 
    totalDeposits,
    totalPayments,
    count,
    depositCount, 
    paymentCount,
    avgDeposit,
    avgPayment,
    netAvgPerTransaction,
    avg, // kept for backwards compatibility
    topMerchants 
  };
}
