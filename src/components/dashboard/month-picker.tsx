"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftMonth } from "@/lib/month";

const monthNames = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

interface MonthPickerProps {
  selectedMonth: Date;
  onChange: (month: Date) => void;
}

export function MonthPicker({ selectedMonth, onChange }: MonthPickerProps) {
  const displayLabel = `${
    monthNames[selectedMonth.getMonth()]
  } ${selectedMonth.getFullYear() + 543}`;

  return (
    <div className="flex items-center gap-3">
      {/* Button-icon-circular — 36px, Cal.com spec */}
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
        onClick={() => onChange(shiftMonth(selectedMonth, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[200px] text-center font-display text-[22px] leading-tight">
        {displayLabel}
      </span>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
        onClick={() => onChange(shiftMonth(selectedMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
