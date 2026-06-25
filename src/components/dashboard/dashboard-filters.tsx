"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/database.types";

interface DashboardFiltersProps {
  typeFilter: "all" | "income" | "expense";
  categoryFilter: string;
  categories: Category[];
  onTypeChange: (type: "all" | "income" | "expense") => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export function DashboardFilters({
  typeFilter,
  categoryFilter,
  categories,
  onTypeChange,
  onCategoryChange,
}: DashboardFiltersProps) {
  return (
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
  );
}
