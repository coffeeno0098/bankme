"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatMonthLabel, parseMonthLabel } from "@/lib/month";
import type { Category } from "@/lib/database.types";

interface DashboardFiltersProps {
  typeFilter: "all" | "income" | "expense";
  categoryFilter: string;
  categories: Category[];
  onTypeChange: (type: "all" | "income" | "expense") => void;
  onCategoryChange: (categoryId: string | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  rangeFilter: "1m" | "3m" | "6m" | "custom";
  customStart: string | null;
  customEnd: string | null;
  onRangeChange: (range: "1m" | "3m" | "6m" | "custom") => void;
  onCustomDateChange: (startDate: string | null, endDate: string | null) => void;
}

const monthNames = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function DashboardFilters({
  typeFilter,
  categoryFilter,
  categories,
  onTypeChange,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  selectedMonth,
  onMonthChange,
  rangeFilter,
  customStart,
  customEnd,
  onRangeChange,
  onCustomDateChange,
}: DashboardFiltersProps) {
  // Generate options from 3 months ahead to 12 months back
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const todayBkk = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const year = todayBkk.getUTCFullYear();
    const month = todayBkk.getUTCMonth();
    for (let i = -3; i <= 12; i++) {
      const d = new Date(Date.UTC(year, month - i, 1, 0, 0, 0));
      options.push(d);
    }
    return options;
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
      <div className="flex flex-wrap items-center gap-3">
        {/* Type filter — Cal.com pill group */}
        <div className="pill-group">
          <button
            className="pill-group-item"
            data-active={typeFilter === "all" ? "true" : undefined}
            onClick={() => onTypeChange("all")}
          >
            ทั้งหมด
          </button>
          <button
            className="pill-group-item"
            data-active={typeFilter === "income" ? "true" : undefined}
            onClick={() => onTypeChange("income")}
          >
            รายรับ
          </button>
          <button
            className="pill-group-item"
            data-active={typeFilter === "expense" ? "true" : undefined}
            onClick={() => onTypeChange("expense")}
          >
            รายจ่าย
          </button>
        </div>

        {/* Date Range Selector */}
        <Select
          value={rangeFilter}
          onValueChange={(val) => {
            if (val) onRangeChange(val as "1m" | "3m" | "6m" | "custom");
          }}
        >
          <SelectTrigger className="w-[130px] h-10 rounded-lg border-border text-sm">
            <SelectValue placeholder="ช่วงเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">เดือนนี้</SelectItem>
            <SelectItem value="3m">3 เดือนล่าสุด</SelectItem>
            <SelectItem value="6m">6 เดือนล่าสุด</SelectItem>
            <SelectItem value="custom">กำหนดเอง</SelectItem>
          </SelectContent>
        </Select>

        {/* Month Selector (Hidden when custom range) */}
        {rangeFilter !== "custom" && (
          <Select
            value={formatMonthLabel(selectedMonth)}
            onValueChange={(val) => {
              if (val) onMonthChange(parseMonthLabel(val));
            }}
          >
            <SelectTrigger className="w-[180px] h-10 rounded-lg border-border text-sm">
              <SelectValue placeholder="เลือกเดือน" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((m) => {
                const value = formatMonthLabel(m);
                const label = `${monthNames[m.getUTCMonth()]} ${m.getUTCFullYear() + 543}`;
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {/* Custom Date Inputs */}
        {rangeFilter === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="h-10 py-2 text-sm w-[140px] rounded-lg border-border"
              value={customStart || ""}
              onChange={(e) => onCustomDateChange(e.target.value, customEnd)}
            />
            <span className="text-xs text-muted-foreground font-medium">ถึง</span>
            <Input
              type="date"
              className="h-10 py-2 text-sm w-[140px] rounded-lg border-border"
              value={customEnd || ""}
              onChange={(e) => onCustomDateChange(customStart, e.target.value)}
            />
          </div>
        )}

        {/* Category Selector */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[160px] h-10 rounded-lg border-border text-sm">
            <SelectValue placeholder="ทุกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search — Cal.com text-input style */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ค้นหาตามรายละเอียด..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9 w-full h-10 rounded-lg border-border text-sm"
        />
      </div>
    </div>
  );
}
