import { createClient } from "@/lib/supabase/server";
import { listActiveCategories } from "@/lib/categories";
import { getMonthRange, getDateRange } from "@/lib/month";
import { calculateMonthlySummary, groupExpensesByCategory, buildIncomeExpenseTrend } from "@/lib/finance";
import { DashboardClient } from "./dashboard-client";

interface SearchParams {
  month?: string;
  type?: string;
  category?: string;
  range?: string;
  startDate?: string;
  endDate?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Parse selected month from URL or default to current
  let selectedMonth: Date;
  if (params.month) {
    const [year, month] = params.month.split("-").map(Number);
    selectedMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  } else {
    const now = new Date();
    const bkkTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    selectedMonth = new Date(Date.UTC(bkkTime.getUTCFullYear(), bkkTime.getUTCMonth(), 1, 0, 0, 0));
  }

  // Parse filters
  const typeFilter = (params.type as "all" | "income" | "expense") || "all";
  const categoryFilter = params.category || "all";
  const rangeFilter = (params.range as "1m" | "3m" | "6m" | "custom") || "1m";
  const customStart = params.startDate || null;
  const customEnd = params.endDate || null;

  // Load data
  const supabase = await createClient();
  const { start, end } = getDateRange(rangeFilter, selectedMonth, customStart, customEnd);

  let query = supabase
    .from("transactions")
    .select("*, categories(id, name)")
    .gte("transaction_at", start.toISOString())
    .lt("transaction_at", end.toISOString())
    .order("transaction_at", { ascending: false });

  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }

  if (categoryFilter !== "all") {
    query = query.eq("category_id", categoryFilter);
  }

  const { data: transactions } = await query;
  const safeTransactions = (transactions ?? []) as unknown as Array<{
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string | null;
    transaction_at: string;
    category_id: string | null;
    categories: { id: string; name: string } | null;
    currency?: string;
    exchange_rate?: number;
    attachment_path?: string | null;
  }>;

  // Load all transactions for current month (unfiltered) for summary + charts
  const { data: allMonthTx } = await supabase
    .from("transactions")
    .select("*, categories(id, name)")
    .gte("transaction_at", start.toISOString())
    .lt("transaction_at", end.toISOString())
    .order("transaction_at", { ascending: false });

  const allTransactions = (allMonthTx ?? []) as unknown as typeof safeTransactions;

  // Calculate summary from ALL transactions (unfiltered)
  const summaryTransactions = allTransactions.map((tx) => ({
    type: tx.type,
    amount: tx.amount,
    transaction_at: new Date(tx.transaction_at),
    category_name: tx.categories?.name ?? null,
  }));

  const summary = calculateMonthlySummary(summaryTransactions, selectedMonth);

  // Pie chart data
  const pieData = groupExpensesByCategory(summaryTransactions);

  // Bar chart data (last 6 months)
  const trendStart = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() - 5, 1, 0, 0, 0) - 7 * 60 * 60 * 1000);
  const trendEnd = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() + 1, 1, 0, 0, 0) - 7 * 60 * 60 * 1000);

  const { data: trendTx } = await supabase
    .from("transactions")
    .select("type, amount, transaction_at, categories(name)")
    .gte("transaction_at", trendStart.toISOString())
    .lt("transaction_at", trendEnd.toISOString())
    .order("transaction_at", { ascending: true });

  const trendData = buildIncomeExpenseTrend(
    ((trendTx ?? []) as unknown as Array<{
      type: "income" | "expense";
      amount: number;
      transaction_at: string;
      categories: { name: string } | null;
    }>).map((tx) => ({
      type: tx.type,
      amount: tx.amount,
      transaction_at: new Date(tx.transaction_at),
      category_name: tx.categories?.name ?? null,
    })),
    selectedMonth,
    6
  );

  // Categories for filters
  const categories = await listActiveCategories();

  // Map transactions for table display
  const tableTransactions = safeTransactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    transaction_at: tx.transaction_at,
    category_name: tx.categories?.name ?? null,
    category_id: tx.category_id,
    currency: tx.currency || "THB",
    exchange_rate: tx.exchange_rate || 1.0,
    attachment_path: tx.attachment_path || null,
  }));

  return (
    <DashboardClient
      selectedMonth={selectedMonth}
      summary={summary}
      transactions={tableTransactions}
      pieData={pieData}
      trendData={trendData}
      categories={categories}
      typeFilter={typeFilter}
      categoryFilter={categoryFilter}
      rangeFilter={rangeFilter}
      customStart={customStart}
      customEnd={customEnd}
    />
  );
}
