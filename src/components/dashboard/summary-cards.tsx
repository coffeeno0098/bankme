import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatTHB } from "@/lib/format";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function SummaryCards({ totalIncome, totalExpense, balance }: SummaryCardsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-3 stagger-children">
      {/* Income */}
      <div className="bg-card rounded-xl p-7 relative group transition-shadow duration-200 hover:shadow-card-hover">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
            รายรับ
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-income/10">
            <TrendingUp className="h-4 w-4 text-income" />
          </div>
        </div>
        <div className="font-number text-[32px] text-income leading-none">
          {formatTHB(totalIncome)}
        </div>
      </div>

      {/* Balance — FEATURED: dark surface, Cal.com featured-tier treatment */}
      <div className="surface-dark rounded-xl p-7 relative group transition-shadow duration-200 hover:shadow-card-hover sm:order-first sm:col-span-1 sm:row-span-1 sm:order-none">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-medium uppercase tracking-wider" style={{ color: 'var(--on-dark-soft)' }}>
            คงเหลือ
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <Wallet className="h-4 w-4" style={{ color: 'var(--on-dark)' }} />
          </div>
        </div>
        <div
          className="font-number text-[36px] leading-none"
          style={{ color: balance >= 0 ? 'var(--on-dark)' : '#f87171' }}
        >
          {formatTHB(balance)}
        </div>
      </div>

      {/* Expense */}
      <div className="bg-card rounded-xl p-7 relative group transition-shadow duration-200 hover:shadow-card-hover">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
            รายจ่าย
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-expense/10">
            <TrendingDown className="h-4 w-4 text-expense" />
          </div>
        </div>
        <div className="font-number text-[32px] text-expense leading-none">
          {formatTHB(totalExpense)}
        </div>
      </div>
    </div>
  );
}
