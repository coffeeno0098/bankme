"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTHB } from "@/lib/format";
import { format, isToday, isYesterday } from "date-fns";
import { th } from "date-fns/locale";
import {
  Utensils,
  Coffee,
  Car,
  Home,
  ShoppingBag,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

interface TransactionRow {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_at: string;
  category_name: string | null;
}

interface TransactionTableProps {
  transactions: TransactionRow[];
}

interface CategoryStyle {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

const getTransactionStyle = (
  type: "income" | "expense",
  categoryName: string | null
): CategoryStyle => {
  if (type === "income") {
    return {
      icon: DollarSign,
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    };
  }

  const name = categoryName ?? "";
  if (name.includes("กิน") || name.includes("อาหาร")) {
    return {
      icon: Utensils,
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    };
  }
  if (name.includes("ดื่ม") || name.includes("น้ำ") || name.includes("กาแฟ")) {
    return {
      icon: Coffee,
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    };
  }
  if (name.includes("เดินทาง") || name.includes("รถ") || name.includes("น้ำมัน")) {
    return {
      icon: Car,
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    };
  }
  if (name.includes("ที่พัก") || name.includes("บ้าน") || name.includes("ห้อง")) {
    return {
      icon: Home,
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    };
  }
  if (name.includes("ช้อปปิ้ง") || name.includes("ซื้อของ") || name.includes("เสื้อผ้า")) {
    return {
      icon: ShoppingBag,
      bgColor: "bg-pink-500/10 dark:bg-pink-500/20",
      iconColor: "text-pink-600 dark:text-pink-400",
    };
  }

  return {
    icon: Tag,
    bgColor: "bg-slate-500/10 dark:bg-slate-500/20",
    iconColor: "text-slate-600 dark:text-slate-400",
  };
};

function formatDateHeader(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return "วันนี้";
  if (isYesterday(date)) return "เมื่อวาน";
  return format(date, "EEEEที่ d MMMM yyyy", { locale: th });
}

interface GroupedTransactions {
  dateStr: string;
  formattedDate: string;
  transactions: TransactionRow[];
  netTotal: number;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page when transactions array changes (e.g., search/filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  // Group paginated transactions by date
  const grouped = paginatedTransactions.reduce<Record<string, TransactionRow[]>>((acc, tx) => {
    const dateKey = tx.transaction_at.split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  const groups = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map<GroupedTransactions>((dateKey) => {
      const txs = grouped[dateKey];
      const netTotal = txs.reduce((sum, tx) => {
        return sum + (tx.type === "income" ? tx.amount : -tx.amount);
      }, 0);

      return {
        dateStr: dateKey,
        formattedDate: formatDateHeader(dateKey),
        transactions: txs,
        netTotal,
      };
    });

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/10 border-dashed">
          <p className="text-muted-foreground font-medium">ไม่พบรายการที่ค้นหา</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.dateStr} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{group.formattedDate}</span>
                <span
                  className={cn(
                    "font-bold",
                    group.netTotal > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : group.netTotal < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {group.netTotal > 0 ? "+" : ""}
                  {formatTHB(group.netTotal)}
                </span>
              </div>

              {/* Group Items */}
              <div className="divide-y rounded-xl border bg-card shadow-xs overflow-hidden">
                {group.transactions.map((tx) => {
                  const style = getTransactionStyle(tx.type, tx.category_name);
                  const Icon = style.icon;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Icon Badge */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                            style.bgColor
                          )}
                        >
                          <Icon className={cn("h-4 w-4", style.iconColor)} />
                        </div>

                        {/* Description & Category */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {tx.description || (tx.type === "income" ? "รายรับ" : "รายจ่าย")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tx.type === "expense" ? tx.category_name ?? "ไม่มีหมวดหมู่" : "รายรับ"}
                          </p>
                        </div>
                      </div>

                      {/* Time & Amount */}
                      <div className="flex items-center gap-4 text-right">
                        <div className="hidden sm:block text-[10px] text-muted-foreground">
                          {format(new Date(tx.transaction_at), "HH:mm")}
                        </div>
                        <div
                          className={cn(
                            "text-sm font-bold tracking-tight",
                            tx.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {tx.type === "expense" ? "-" : "+"}
                          {formatTHB(tx.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-muted">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                แสดง {startIndex + 1} ถึง {Math.min(endIndex, transactions.length)} จากทั้งหมด {transactions.length} รายการ
              </span>
              <div className="flex items-center justify-center gap-1">
                {/* ChevronsLeft */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                {/* ChevronLeft */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                {getPageNumbers().map((pNum, idx) => {
                  if (typeof pNum === "string") {
                    return (
                      <span key={`ellipse-${idx}`} className="text-xs px-1 text-muted-foreground">
                        {pNum}
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={pNum}
                      variant={currentPage === pNum ? "default" : "outline"}
                      className="h-8 w-8 text-xs font-semibold"
                      onClick={() => setCurrentPage(pNum)}
                    >
                      {pNum}
                    </Button>
                  );
                })}

                {/* ChevronRight */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {/* ChevronsRight */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
