import { describe, it, expect } from "vitest";
import {
  calculateMonthlySummary,
  groupExpensesByCategory,
  buildIncomeExpenseTrend,
} from "./finance";
import type { Transaction, TransactionType } from "./database.types";

// Minimal type for testing - mimics the columns we care about
interface TestTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  transaction_at: Date;
  category_id: string | null;
  category_name?: string | null;
}

describe("calculateMonthlySummary", () => {
  const baseDate = new Date("2026-06-15T10:00:00Z");

  it("returns income, expense, and balance for selected month", () => {
    const transactions: TestTransaction[] = [
      {
        id: "1",
        type: "income",
        amount: 50000,
        transaction_at: new Date("2026-06-10T08:00:00Z"),
        category_id: null,
      },
      {
        id: "2",
        type: "expense",
        amount: 1200,
        transaction_at: new Date("2026-06-12T12:00:00Z"),
        category_id: "cat-1",
        category_name: "ของกิน",
      },
      {
        id: "3",
        type: "expense",
        amount: 3500,
        transaction_at: new Date("2026-06-20T18:00:00Z"),
        category_id: "cat-2",
        category_name: "ค่าเดินทาง",
      },
    ];

    const result = calculateMonthlySummary(transactions, baseDate);

    expect(result.totalIncome).toBe(50000);
    expect(result.totalExpense).toBe(4700);
    expect(result.balance).toBe(45300);
  });

  it("ignores transactions outside selected month", () => {
    const transactions: TestTransaction[] = [
      {
        id: "1",
        type: "income",
        amount: 10000,
        transaction_at: new Date("2026-05-15T12:00:00Z"),
        category_id: null,
      },
      {
        id: "2",
        type: "income",
        amount: 20000,
        transaction_at: new Date("2026-06-15T12:00:00Z"),
        category_id: null,
      },
      {
        id: "3",
        type: "income",
        amount: 30000,
        transaction_at: new Date("2026-07-15T12:00:00Z"),
        category_id: null,
      },
    ];

    const result = calculateMonthlySummary(transactions, baseDate);

    expect(result.totalIncome).toBe(20000);
  });

  it("returns zeros when no transactions in month", () => {
    const transactions: TestTransaction[] = [
      {
        id: "1",
        type: "income",
        amount: 5000,
        transaction_at: new Date("2026-01-01T00:00:00Z"),
        category_id: null,
      },
    ];

    const result = calculateMonthlySummary(transactions, baseDate);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.balance).toBe(0);
  });

  it("handles empty transaction array", () => {
    const result = calculateMonthlySummary([], baseDate);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.balance).toBe(0);
  });
});

describe("groupExpensesByCategory", () => {
  it("groups only expenses by category", () => {
    const transactions: TestTransaction[] = [
      {
        id: "1",
        type: "expense",
        amount: 200,
        transaction_at: new Date(),
        category_id: "cat-1",
        category_name: "ของกิน",
      },
      {
        id: "2",
        type: "income",
        amount: 50000,
        transaction_at: new Date(),
        category_id: null,
      },
      {
        id: "3",
        type: "expense",
        amount: 150,
        transaction_at: new Date(),
        category_id: "cat-1",
        category_name: "ของกิน",
      },
      {
        id: "4",
        type: "expense",
        amount: 500,
        transaction_at: new Date(),
        category_id: "cat-2",
        category_name: "ค่าเดินทาง",
      },
    ];

    const result = groupExpensesByCategory(transactions);

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.categoryName === "ของกิน")?.total).toBe(350);
    expect(result.find((r) => r.categoryName === "ค่าเดินทาง")?.total).toBe(500);
  });

  it("returns empty array when no expenses", () => {
    const transactions: TestTransaction[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        transaction_at: new Date(),
        category_id: null,
      },
    ];

    const result = groupExpensesByCategory(transactions);

    expect(result).toEqual([]);
  });

  it("handles expense without category name gracefully", () => {
    const transactions: TestTransaction[] = [
      {
        id: "1",
        type: "expense",
        amount: 300,
        transaction_at: new Date(),
        category_id: "cat-1",
        category_name: null,
      },
    ];

    const result = groupExpensesByCategory(transactions);

    expect(result[0].categoryName).toBe("ไม่มีหมวดหมู่");
  });
});

describe("buildIncomeExpenseTrend", () => {
  function makeTx(monthOffset: number, type: "income" | "expense", amount: number): TestTransaction {
    const d = new Date("2026-06-01T00:00:00Z");
    d.setMonth(d.getMonth() + monthOffset);
    return {
      id: String(monthOffset) + type,
      type,
      amount,
      transaction_at: d,
      category_id: type === "expense" ? "cat-1" : null,
    };
  }

  it("returns last six months in chronological order", () => {
    // Transactions only in June
    const transactions: TestTransaction[] = [
      makeTx(0, "income", 10000),
      makeTx(0, "expense", 3000),
    ];

    // Reference month is August 2026 (month 2)
    const refDate = new Date("2026-08-15T00:00:00Z");

    const result = buildIncomeExpenseTrend(transactions, refDate, 6);

    expect(result).toHaveLength(6);

    // First entry should be March 2026, last should be August 2026
    const months = result.map((r) => r.monthLabel);
    expect(months).toEqual([
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);

    // June (index 3) should have data
    expect(result[3].income).toBe(10000);
    expect(result[3].expense).toBe(3000);

    // Other months should be zero
    expect(result[0].income).toBe(0);
    expect(result[0].expense).toBe(0);
  });

  it("handles empty transactions", () => {
    const refDate = new Date("2026-06-15T00:00:00Z");
    const result = buildIncomeExpenseTrend([], refDate, 3);

    expect(result).toHaveLength(3);
    expect(result.every((r) => r.income === 0 && r.expense === 0)).toBe(true);
  });
});
