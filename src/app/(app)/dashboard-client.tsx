"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { IncomeExpenseBarChart } from "@/components/dashboard/income-expense-bar-chart";
import { MonthPicker } from "@/components/dashboard/month-picker";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { EmptyDashboardState } from "@/components/dashboard/empty-dashboard-state";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { formatMonthLabel } from "@/lib/month";
import type { Category } from "@/lib/database.types";

interface DashboardClientProps {
  selectedMonth: Date;
  summary: { totalIncome: number; totalExpense: number; balance: number };
  transactions: Array<{
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string | null;
    transaction_at: string;
    category_name: string | null;
  }>;
  pieData: Array<{ categoryName: string; total: number }>;
  trendData: Array<{ monthLabel: string; income: number; expense: number }>;
  categories: Category[];
  typeFilter: "all" | "income" | "expense";
  categoryFilter: string;
}

export function DashboardClient({
  selectedMonth,
  summary,
  transactions,
  pieData,
  trendData,
  categories,
  typeFilter,
  categoryFilter,
}: DashboardClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const descMatch = tx.description?.toLowerCase().includes(query) ?? false;
    const catMatch = tx.category_name?.toLowerCase().includes(query) ?? false;
    return descMatch || catMatch;
  });

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams();

      // Preserve current values, then override
      const month = formatMonthLabel(selectedMonth);
      params.set("month", month);

      const currentType = updates.type !== undefined ? updates.type : typeFilter;
      if (currentType && currentType !== "all") params.set("type", currentType);
      else params.delete("type");

      const currentCat = updates.category !== undefined ? updates.category : categoryFilter;
      if (currentCat && currentCat !== "all") params.set("category", currentCat);
      else params.delete("category");

      router.push(`?${params.toString()}`);
    },
    [router, selectedMonth, typeFilter, categoryFilter]
  );

  const handleMonthChange = useCallback(
    (month: Date) => {
      const params = new URLSearchParams();
      params.set("month", formatMonthLabel(month));
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      router.push(`?${params.toString()}`);
    },
    [router, typeFilter, categoryFilter]
  );

  const handleTypeChange = (type: "all" | "income" | "expense") => {
    updateSearchParams({ type });
  };

  const handleCategoryChange = (category: string | null) => {
    updateSearchParams({ category: category ?? "all" });
  };

  const hasTransactions = transactions.length > 0;
  const allEmpty = summary.totalIncome === 0 && summary.totalExpense === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <MonthPicker selectedMonth={selectedMonth} onChange={handleMonthChange} />
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          เพิ่มรายการ
        </Button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        balance={summary.balance}
      />

      {/* Empty State */}
      {allEmpty ? (
        <EmptyDashboardState onAddTransaction={() => setDialogOpen(true)} />
      ) : (
        <>
          {/* Filters */}
          <DashboardFilters
            typeFilter={typeFilter}
            categoryFilter={categoryFilter}
            categories={categories}
            onTypeChange={handleTypeChange}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          {/* Transaction Table */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">รายการ</h2>
            <TransactionTable transactions={filteredTransactions} />
          </div>
        </>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpensePieChart data={pieData} />
        <IncomeExpenseBarChart data={trendData} />
      </div>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
      />
    </div>
  );
}
