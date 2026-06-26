"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatTHB } from "@/lib/format";

interface TrendPoint {
  monthLabel: string;
  income: number;
  expense: number;
}

interface IncomeExpenseBarChartProps {
  data: TrendPoint[];
}

const monthNames = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatMonthLabel(label: string): string {
  const [year, month] = label.split("-").map(Number);
  // Show short year + Thai month
  const shortYear = String(year).slice(2);
  return `${monthNames[month - 1]} ${shortYear}`;
}

export function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    monthLabel: formatMonthLabel(point.monthLabel),
  }));

  return (
    <div className="bg-card rounded-xl p-7">
      <h3 className="font-display text-lg mb-4">รายรับ vs รายจ่าย</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="monthLabel" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
          <YAxis fontSize={12} tickFormatter={(v) => formatTHB(v)} tick={{ fill: 'var(--muted-foreground)' }} />
          <Tooltip
            formatter={(value) => formatTHB(value as number)}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '14px',
            }}
          />
          <Legend />
          <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="รายจ่าย" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
