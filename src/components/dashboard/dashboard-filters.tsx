"use client";

import { Button } from "@/components/ui/button";
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
}: DashboardFiltersProps) {
  // Generate options from 3 months ahead to 12 months back
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = -3; i <= 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push(d);
    }
    return options;
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange("all")}
        >
          ทั้งหมด
        </Button>
        <Button
          variant={typeFilter === "income" ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange("income")}
        >
          รายรับ
        </Button>
        <Button
          variant={typeFilter === "expense" ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange("expense")}
        >
          รายจ่าย
        </Button>

        {/* Month Selector Dropdown */}
        <Select
          value={formatMonthLabel(selectedMonth)}
          onValueChange={(val) => {
            if (val) onMonthChange(parseMonthLabel(val));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="เลือกเดือน" />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map((m) => {
              const value = formatMonthLabel(m);
              const label = `${monthNames[m.getMonth()]} ${m.getFullYear() + 543}`;
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Category Selector Dropdown */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
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

      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ค้นหาตามรายละเอียด..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
    </div>
  );
}
