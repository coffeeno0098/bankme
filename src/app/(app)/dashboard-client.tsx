"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { IncomeExpenseBarChart } from "@/components/dashboard/income-expense-bar-chart";
import { MonthPicker } from "@/components/dashboard/month-picker";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { EmptyDashboardState } from "@/components/dashboard/empty-dashboard-state";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Loader2, Printer } from "lucide-react";
import { formatMonthLabel } from "@/lib/month";
import type { Category } from "@/lib/database.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTransaction } from "@/app/(app)/actions/transactions";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { formatTHB } from "@/lib/format";
import { cn } from "@/lib/utils";

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
    category_id: string | null;
    currency: string;
    exchange_rate: number;
    attachment_path: string | null;
  }>;
  pieData: Array<{ categoryName: string; total: number }>;
  trendData: Array<{ monthLabel: string; income: number; expense: number }>;
  categories: Category[];
  typeFilter: "all" | "income" | "expense";
  categoryFilter: string;
  rangeFilter: "1m" | "3m" | "6m" | "custom";
  customStart: string | null;
  customEnd: string | null;
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
  rangeFilter,
  customStart,
  customEnd,
}: DashboardClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<DashboardClientProps["transactions"][number] | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<DashboardClientProps["transactions"][number] | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setDeleteSubmitting(true);
    try {
      const res = await deleteTransaction(deletingTransaction.id);
      if (!res.success) {
        throw new Error(res.error);
      }
      toast.success("ลบรายการสำเร็จ!");
      setDeletingTransaction(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบรายการ");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    const headers = ["วันที่", "เวลา", "ประเภท", "หมวดหมู่", "รายละเอียด", "จำนวนเงิน (บาท)"];
    
    const rows = filteredTransactions.map((tx) => {
      const date = new Date(tx.transaction_at);
      const dateStr = format(date, "yyyy-MM-dd");
      const timeStr = format(date, "HH:mm");
      const typeStr = tx.type === "income" ? "รายรับ" : "รายจ่าย";
      const categoryStr = tx.type === "expense" ? tx.category_name || "ไม่มีหมวดหมู่" : "-";
      const descriptionStr = tx.description || "";
      
      return [
        dateStr,
        timeStr,
        typeStr,
        categoryStr,
        descriptionStr.replace(/"/g, '""'),
        tx.amount
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthStr = format(selectedMonth, "yyyy-MM");
    link.setAttribute("href", url);
    link.setAttribute("download", `bankme-transactions-${monthStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ส่งออก CSV สำเร็จ!");
  };

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

      // Month parameter
      const month = formatMonthLabel(selectedMonth);
      params.set("month", month);

      // Type parameter
      const currentType = updates.type !== undefined ? updates.type : typeFilter;
      if (currentType && currentType !== "all") params.set("type", currentType);

      // Category parameter
      const currentCat = updates.category !== undefined ? updates.category : categoryFilter;
      if (currentCat && currentCat !== "all") params.set("category", currentCat);

      // Range parameters
      const currentRange = updates.range !== undefined ? updates.range : rangeFilter;
      if (currentRange && currentRange !== "1m") params.set("range", currentRange);

      const currentStart = updates.startDate !== undefined ? updates.startDate : customStart;
      if (currentStart && currentRange === "custom") params.set("startDate", currentStart);

      const currentEnd = updates.endDate !== undefined ? updates.endDate : customEnd;
      if (currentEnd && currentRange === "custom") params.set("endDate", currentEnd);

      router.push(`?${params.toString()}`);
    },
    [router, selectedMonth, typeFilter, categoryFilter, rangeFilter, customStart, customEnd]
  );

  const handleMonthChange = useCallback(
    (month: Date) => {
      updateSearchParams({
        month: formatMonthLabel(month),
      });
    },
    [updateSearchParams]
  );

  const handleTypeChange = (type: "all" | "income" | "expense") => {
    updateSearchParams({ type });
  };

  const handleCategoryChange = (category: string | null) => {
    updateSearchParams({ category: category ?? "all" });
  };

  const handleRangeChange = (range: "1m" | "3m" | "6m" | "custom") => {
    updateSearchParams({
      range,
      startDate: range === "custom" ? customStart || new Date().toISOString().slice(0, 10) : null,
      endDate: range === "custom" ? customEnd || new Date().toISOString().slice(0, 10) : null,
    });
  };

  const handleCustomDateChange = (startDate: string | null, endDate: string | null) => {
    updateSearchParams({
      range: "custom",
      startDate,
      endDate,
    });
  };

  const allEmpty = summary.totalIncome === 0 && summary.totalExpense === 0;

  return (
    <div className="space-y-8">
      {/* Header — Month picker + action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {rangeFilter !== "custom" ? (
          <MonthPicker selectedMonth={selectedMonth} onChange={handleMonthChange} />
        ) : (
          <div className="font-display text-[22px] text-foreground">ช่วงเวลาที่กำหนดเอง</div>
        )}
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" onClick={() => window.print()} className="rounded-lg h-10 text-sm">
            <Printer className="mr-2 h-4 w-4" />
            พิมพ์รายงาน
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="rounded-lg h-10 text-sm">
            <Download className="mr-2 h-4 w-4" />
            ส่งออก CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="rounded-lg h-10 text-sm font-semibold">
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มรายการ
          </Button>
        </div>
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
          <div className="no-print">
            <DashboardFilters
              typeFilter={typeFilter}
              categoryFilter={categoryFilter}
              categories={categories}
              onTypeChange={handleTypeChange}
              onCategoryChange={handleCategoryChange}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              rangeFilter={rangeFilter}
              customStart={customStart}
              customEnd={customEnd}
              onRangeChange={handleRangeChange}
              onCustomDateChange={handleCustomDateChange}
            />
          </div>

          {/* Transaction Table */}
          <div>
            <h2 className="font-display text-lg mb-4">รายการ</h2>
            <TransactionTable
              transactions={filteredTransactions}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setDialogOpen(true);
              }}
              onDelete={(tx) => {
                setDeletingTransaction(tx);
              }}
            />
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
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        categories={categories}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTransaction} onOpenChange={(open) => {
        if (!open) setDeletingTransaction(null);
      }}>
        <DialogContent className="sm:max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 font-display text-lg">ยืนยันการลบรายการ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          {deletingTransaction && (
            <div className="py-4 space-y-2.5 text-sm border-y border-border my-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">รายละเอียด:</span>
                <span className="font-semibold text-foreground">
                  {deletingTransaction.description || (deletingTransaction.type === "income" ? "รายรับ" : "รายจ่าย")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ประเภท:</span>
                <span className="font-semibold text-foreground">
                  {deletingTransaction.type === "income" ? "รายรับ" : "รายจ่าย"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">จำนวนเงิน:</span>
                <span className={cn(
                  "font-number text-base",
                  deletingTransaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {deletingTransaction.type === "income" ? "+" : "-"}
                  {formatTHB(deletingTransaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">วันที่:</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(deletingTransaction.transaction_at), "d MMMM yyyy HH:mm", { locale: th })}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingTransaction(null)}
              disabled={deleteSubmitting}
              className="rounded-lg"
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteSubmitting}
              className="rounded-lg"
            >
              {deleteSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                "ยืนยันการลบ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
