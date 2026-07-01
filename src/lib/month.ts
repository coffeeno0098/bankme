/**
 * Month utility functions for BankMe.
 * Handles month boundaries, formatting, and navigation in Asia/Bangkok (UTC+7) timezone.
 */

// Offset in milliseconds for Asia/Bangkok (UTC+7)
const BKK_OFFSET = 7 * 60 * 60 * 1000;

export function getMonthRange(month: Date): { start: Date; end: Date } {
  // `month` has UTC components representing the year/month we want (e.g. 2026-07-01T00:00:00.000Z)
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();

  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0) - BKK_OFFSET);
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0) - BKK_OFFSET);
  return { start, end };
}

export function formatMonthLabel(month: Date): string {
  // `month` UTC components represent local year/month
  const y = month.getUTCFullYear();
  const m = month.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function shiftMonth(month: Date, offset: number): Date {
  const y = month.getUTCFullYear();
  const m = month.getUTCMonth();
  return new Date(Date.UTC(y, m + offset, 1, 0, 0, 0));
}

export function parseMonthLabel(label: string): Date {
  const [year, monthNum] = label.split("-").map(Number);
  return new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0));
}

export function getDateRange(
  rangeType: "1m" | "3m" | "6m" | "custom",
  selectedMonth: Date,
  customStart?: string | null,
  customEnd?: string | null
): { start: Date; end: Date } {
  const year = selectedMonth.getUTCFullYear();
  const monthIndex = selectedMonth.getUTCMonth();

  if (rangeType === "3m") {
    const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0) - BKK_OFFSET);
    const start = new Date(Date.UTC(year, monthIndex - 2, 1, 0, 0, 0) - BKK_OFFSET);
    return { start, end };
  }
  if (rangeType === "6m") {
    const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0) - BKK_OFFSET);
    const start = new Date(Date.UTC(year, monthIndex - 5, 1, 0, 0, 0) - BKK_OFFSET);
    return { start, end };
  }
  if (rangeType === "custom" && customStart && customEnd) {
    const [sYear, sMonth, sDay] = customStart.split("-").map(Number);
    const [eYear, eMonth, eDay] = customEnd.split("-").map(Number);
    
    const start = new Date(Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0) - BKK_OFFSET);
    const end = new Date(Date.UTC(eYear, eMonth - 1, eDay, 23, 59, 59, 999) - BKK_OFFSET);
    return { start, end };
  }
  return getMonthRange(selectedMonth);
}
