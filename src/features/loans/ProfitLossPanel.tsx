'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { YearProfitLoss } from '@/utils/profit-loss-metrics';

interface ProfitLossPanelProps {
  data: YearProfitLoss;
  year: number;
  onYearChange: (year: number) => void;
  yearOptions: number[];
}

export function ProfitLossPanel({ data, year, onYearChange, yearOptions }: ProfitLossPanelProps) {
  const isProfit = data.netProfit >= 0;

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Yearly profit / loss</h2>
          <p className="text-sm text-muted">
            Chit collections minus loan interest closed in the selected year
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div
        className={cn(
          'mt-5 flex items-center gap-3 rounded-xl border px-4 py-4',
          isProfit ? 'border-accent/30 bg-accent/5' : 'border-danger/30 bg-danger/5',
        )}
      >
        {isProfit ? (
          <TrendingUp className="h-8 w-8 shrink-0 text-accent" />
        ) : (
          <TrendingDown className="h-8 w-8 shrink-0 text-danger" />
        )}
        <div>
          <p className="text-sm font-medium text-muted">
            Net {isProfit ? 'profit' : 'loss'} · {year}
          </p>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums',
              isProfit ? 'text-accent' : 'text-danger',
            )}
          >
            {formatCurrency(Math.abs(data.netProfit))}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ProfitRow label="Chit revenue" value={formatCurrency(data.chitRevenue)} positive />
        <ProfitRow
          label="Loan interest (expense)"
          value={formatCurrency(data.loanInterestExpense)}
          negative
        />
        <ProfitRow label="Principal borrowed" value={formatCurrency(data.totalPrincipalBorrowed)} />
        <ProfitRow label="Principal repaid" value={formatCurrency(data.totalPrincipalRepaid)} />
        <ProfitRow label="Loans taken" value={String(data.loansTakenCount)} />
        <ProfitRow label="Loans closed" value={String(data.loansClosedCount)} />
      </dl>
    </section>
  );
}

function ProfitRow({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/40 px-3 py-3">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-1 text-lg font-bold tabular-nums',
          positive && 'text-accent',
          negative && 'text-danger',
          !positive && !negative && 'text-primary',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
