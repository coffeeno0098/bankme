import type { MonthlySummary, CategoryGroup, TrendPoint } from "./database.types";

interface FinanceTransaction {
  type: "income" | "expense";
  amount: number;
  transaction_at: Date;
  category_name?: string | null;
}

export function calculateMonthlySummary(
  transactions: FinanceTransaction[],
  selectedMonth: Date
): MonthlySummary {
  const year = selectedMonth.getUTCFullYear();
  const month = selectedMonth.getUTCMonth();

  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    const txDate = new Date(tx.transaction_at);
    const txBkk = new Date(txDate.getTime() + 7 * 60 * 60 * 1000);
    if (txBkk.getUTCFullYear() !== year || txBkk.getUTCMonth() !== month) {
      continue;
    }
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  }

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    balance: Math.round((totalIncome - totalExpense) * 100) / 100,
  };
}

export function groupExpensesByCategory(
  transactions: FinanceTransaction[]
): CategoryGroup[] {
  const map = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;

    const name = tx.category_name || "ไม่มีหมวดหมู่";
    map.set(name, (map.get(name) || 0) + tx.amount);
  }

  return Array.from(map.entries())
    .map(([categoryName, total]) => ({
      categoryName,
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total);
}

export function buildIncomeExpenseTrend(
  transactions: FinanceTransaction[],
  referenceDate: Date,
  months: number
): TrendPoint[] {
  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth();

  // Build last N months starting from (refMonth - months + 1)
  const startMonth = refMonth - months + 1;
  const result: TrendPoint[] = [];

  for (let i = 0; i < months; i++) {
    const m = startMonth + i;
    const y = refYear + Math.floor((m < 0 ? m - 11 : m) / 12);
    const month = ((m % 12) + 12) % 12;

    result.push({
      monthLabel: `${y}-${String(month + 1).padStart(2, "0")}`,
      income: 0,
      expense: 0,
    });
  }

  // Fill in actual data
  for (const tx of transactions) {
    const txDate = new Date(tx.transaction_at);
    const txBkk = new Date(txDate.getTime() + 7 * 60 * 60 * 1000);
    const label = `${txBkk.getUTCFullYear()}-${String(txBkk.getUTCMonth() + 1).padStart(2, "0")}`;
    const point = result.find((r) => r.monthLabel === label);
    if (!point) continue;

    if (tx.type === "income") {
      point.income += tx.amount;
    } else {
      point.expense += tx.amount;
    }
  }

  // Round values
  for (const point of result) {
    point.income = Math.round(point.income * 100) / 100;
    point.expense = Math.round(point.expense * 100) / 100;
  }

  return result;
}
