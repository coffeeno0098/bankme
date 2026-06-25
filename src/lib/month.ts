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
