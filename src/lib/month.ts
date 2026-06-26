/**
 * Month utility functions for BankMe.
 * Handles month boundaries, formatting, and navigation.
 */

export function getMonthRange(month: Date): { start: Date; end: Date } {
  const start = new Date(month.getFullYear(), month.getMonth(), 1, 0, 0, 0);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1, 0, 0, 0);
  return { start, end };
}

export function formatMonthLabel(month: Date): string {
  const y = month.getFullYear();
  const m = month.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function shiftMonth(month: Date, offset: number): Date {
  const d = new Date(month);
  d.setMonth(d.getMonth() + offset);
  return d;
}

export function parseMonthLabel(label: string): Date {
  const [year, monthNum] = label.split("-").map(Number);
  return new Date(year, monthNum - 1, 1);
}

export function getDateRange(
  rangeType: "1m" | "3m" | "6m" | "custom",
  selectedMonth: Date,
  customStart?: string | null,
  customEnd?: string | null
): { start: Date; end: Date } {
  if (rangeType === "3m") {
    const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1, 0, 0, 0);
    const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 2, 1, 0, 0, 0);
    return { start, end };
  }
  if (rangeType === "6m") {
    const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1, 0, 0, 0);
    const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 5, 1, 0, 0, 0);
    return { start, end };
  }
  if (rangeType === "custom" && customStart && customEnd) {
    const start = new Date(customStart + "T00:00:00");
    const end = new Date(customEnd + "T23:59:59");
    return { start, end };
  }
  return getMonthRange(selectedMonth);
}
