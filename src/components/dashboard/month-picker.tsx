"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel, shiftMonth } from "@/lib/month";

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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(shiftMonth(selectedMonth, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[180px] text-center font-semibold text-lg">
        {displayLabel}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(shiftMonth(selectedMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
