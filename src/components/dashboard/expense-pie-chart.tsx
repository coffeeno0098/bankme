"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatTHB } from "@/lib/format";

/* Cal.com badge pastels + monochrome scale */
const COLORS = [
  "#111111", "#6b7280", "#3b82f6", "#8b5cf6", "#ec4899",
  "#fb923c", "#34d399", "#06b6d4", "#eab308", "#f43f5e",
];

interface CategoryGroup {
  categoryName: string;
  total: number;
}

interface ExpensePieChartProps {
  data: CategoryGroup[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card rounded-xl p-7">
        <h3 className="font-display text-lg mb-4">หมวดหมู่รายจ่าย</h3>
        <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
          ไม่มีข้อมูลรายจ่ายในเดือนนี้
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-7">
      <h3 className="font-display text-lg mb-4">หมวดหมู่รายจ่าย</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            strokeWidth={2}
            stroke="var(--background)"
            label={({ name, value }: { name?: string; value?: number }) =>
              `${name ?? ""} (${formatTHB(value ?? 0)})`
            }
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
