'use client';

import { formatCurrency } from '@/lib/utils';
import type { MemberRevenueRow } from '@/utils/enterprise-metrics';

interface MemberProfitStatsProps {
  rows: MemberRevenueRow[];
}

export function MemberProfitStats({ rows }: MemberProfitStatsProps) {
  const summary = rows.reduce(
    (acc, row) => {
      if (row.profit > 0) acc.totalProfit += row.profit;
      if (row.profit < 0) acc.totalLoss += Math.abs(row.profit);
      return acc;
    },
    { totalProfit: 0, totalLoss: 0 },
  );

  const netProfit = summary.totalProfit - summary.totalLoss;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <ProfitStatCard
        label="Total Profit"
        value={summary.totalProfit}
        toneClassName="border-accent/20 bg-accent/5 text-accent"
      />
      <ProfitStatCard
        label="Total Loss"
        value={summary.totalLoss}
        toneClassName="border-danger/20 bg-danger/5 text-danger"
      />
      <ProfitStatCard
        label="Net Profit"
        value={netProfit}
        toneClassName={
          netProfit < 0
            ? 'border-danger/20 bg-danger/5 text-danger'
            : 'border-info/20 bg-info/5 text-info'
        }
      />
    </div>
  );
}

function ProfitStatCard({
  label,
  value,
  toneClassName,
}: {
  label: string;
  value: number;
  toneClassName: string;
}) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${toneClassName}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(value)}</p>
    </article>
  );
}
