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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">รายรับ vs รายจ่าย</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthLabel" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => formatTHB(v)} />
            <Tooltip formatter={(value) => formatTHB(value as number)} />
            <Legend />
            <Bar dataKey="income" name="รายรับ" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="รายจ่าย" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
