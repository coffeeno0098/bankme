import { createClient } from "@/lib/supabase/server";
import { listActiveCategories } from "@/lib/categories";
import { getMonthRange } from "@/lib/month";
import { calculateMonthlySummary, groupExpensesByCategory, buildIncomeExpenseTrend } from "@/lib/finance";
import { DashboardClient } from "./dashboard-client";

interface SearchParams {
  month?: string;
  type?: string;
  category?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Parse selected month from URL or default to current
  const selectedMonth = params.month
    ? new Date(params.month + "-01")
    : new Date();

  // Parse filters
  const typeFilter = (params.type as "all" | "income" | "expense") || "all";
  const categoryFilter = params.category || "all";

  // Load data
  const supabase = await createClient();
  const { start, end } = getMonthRange(selectedMonth);

  let query = supabase
    .from("transactions")
    .select("*, categories!inner(id, name)")
    .gte("transaction_at", start.toISOString())
    .lt("transaction_at", end.toISOString())
    .order("transaction_at", { ascending: false });

  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
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
  const { data: trendTx } = await supabase
    .from("transactions")
    .select("type, amount, transaction_at, categories(name)")
    .gte("transaction_at", new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 5, 1).toISOString())
    .lt("transaction_at", new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1).toISOString())
    .order("transaction_at", { ascending: true });

  const trendData = buildIncomeExpenseTrend(
    (trendTx ?? []).map((tx: any) => ({
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
    />
  );
}
