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
  const totalDeposits = transactions.filter(t => t.type === "deposit").reduce((s, t) => s + (t.amount || 0), 0);
  const totalPayments = transactions.filter(t => t.type === "purchase" || t.type === "bill").reduce((s, t) => s + (t.amount || 0), 0);
  const count = transactions.length;
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

  return { totalDeposits, totalPayments, count, avg, topMerchants };
}
