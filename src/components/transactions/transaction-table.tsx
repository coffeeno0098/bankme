"use client";

import { useState } from "react";
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
  MoreVertical,
  Edit2,
  Trash2,
  FileImage,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface TransactionRow {
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
}

interface TransactionTableProps {
  transactions: TransactionRow[];
  onEdit: (transaction: TransactionRow) => void;
  onDelete: (transaction: TransactionRow) => void;
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

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [prevLength, setPrevLength] = useState(transactions.length);
  if (transactions.length !== prevLength) {
    setPrevLength(transactions.length);
    setCurrentPage(1);
  }

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
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl">
          <p className="text-muted-foreground text-sm font-medium">ไม่พบรายการที่ค้นหา</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.dateStr} className="space-y-2">
              {/* Group Header — Cal.com caption style */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group.formattedDate}
                </span>
                <span
                  className={cn(
                    "font-number text-sm",
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

              {/* Group Items — Cal.com card container */}
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card overflow-hidden shadow-card">
                {group.transactions.map((tx) => {
                  const style = getTransactionStyle(tx.type, tx.category_name);
                  const Icon = style.icon;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Icon Badge — rounded-xl (16px) */}
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                            style.bgColor
                          )}
                        >
                          <Icon className={cn("h-[18px] w-[18px]", style.iconColor)} />
                        </div>

                        {/* Description & Category */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {tx.description || (tx.type === "income" ? "รายรับ" : "รายจ่าย")}
                            </p>
                            {tx.attachment_path && (
                              <a
                                href={createClient().storage.from("receipts").getPublicUrl(tx.attachment_path).data.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="ดูใบเสร็จ"
                                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0 animate-pulse"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileImage className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tx.type === "expense" ? tx.category_name ?? "ไม่มีหมวดหมู่" : "รายรับ"}
                          </p>
                        </div>
                      </div>

                      {/* Time, Amount & Actions */}
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="flex items-center gap-3 text-right">
                          <div className="hidden sm:block text-[11px] text-muted-foreground font-medium">
                            {format(new Date(tx.transaction_at), "HH:mm")}
                          </div>
                          <div
                            className={cn(
                              "font-number text-sm flex flex-col items-end",
                              tx.type === "income"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            )}
                          >
                            <span>
                              {tx.type === "expense" ? "-" : "+"}
                              {tx.currency === "THB" ? formatTHB(tx.amount) : `${tx.currency} ${tx.amount.toFixed(2)}`}
                            </span>
                            {tx.currency !== "THB" && (
                              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                ≈ {formatTHB(tx.amount * tx.exchange_rate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                           <DropdownMenuTrigger
                             className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity rounded-lg hover:bg-muted cursor-pointer"
                           >
                             <MoreVertical className="h-4 w-4" />
                           </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => onEdit(tx)}>
                              <Edit2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                              <span>แก้ไข</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(tx)}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              <span>ลบ</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/50">
              <span className="text-[13px] text-muted-foreground text-center sm:text-left">
                แสดง {startIndex + 1} ถึง {Math.min(endIndex, transactions.length)} จากทั้งหมด {transactions.length} รายการ
              </span>
              <div className="flex items-center justify-center gap-1">
                {/* ChevronsLeft */}
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                {/* ChevronLeft */}
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

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
                    <button
                      key={pNum}
                      className={cn(
                        "h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                        currentPage === pNum
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-muted"
                      )}
                      onClick={() => setCurrentPage(pNum)}
                    >
                      {pNum}
                    </button>
                  );
                })}

                {/* ChevronRight */}
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* ChevronsRight */}
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
