'use client';

import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { loanStatusLabels } from '@/constants/loans';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import { summarizeLoanBalance } from '@/utils/loan-balance';
import type { LoanWithRepayments } from '@/types/database';

interface LoanDetailSummaryProps {
  loan: LoanWithRepayments;
}

export function LoanDetailSummary({ loan }: LoanDetailSummaryProps) {
  const balance = summarizeLoanBalance(loan, loan.repayments);
  const isActive = loan.status === 'active';

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Original principal" value={formatCurrency(balance.originalPrincipal)} />
      <Stat
        label="Outstanding principal"
        value={formatCurrency(isActive ? balance.principalOutstanding : 0)}
        highlight={isActive}
      />
      <Stat label="Principal repaid" value={formatCurrency(balance.principalRepaid)} />
      <Stat label="Interest paid" value={formatCurrency(balance.interestPaidToDate)} />
      <Stat label="Total repaid" value={formatCurrency(balance.totalRepaidToDate)} />
      <Stat label="Rate" value={`${rateToPercentLabel(loan.interest_rate)} / month`} />
      <Stat label="Started" value={formatDate(loan.start_date)} />
      <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Status</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant={isActive ? 'warning' : 'success'}>{loanStatusLabels[loan.status]}</Badge>
          {loan.closed_date ? (
            <span className="text-sm text-muted">Closed {formatDate(loan.closed_date)}</span>
          ) : null}
        </div>
      </div>
      {loan.notes ? (
        <div className="rounded-xl border border-border/80 bg-card px-4 py-3 sm:col-span-2 lg:col-span-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Notes</p>
          <p className="mt-1 text-sm text-primary">{loan.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p
        className={
          highlight
            ? 'mt-1 text-lg font-semibold tabular-nums text-accent'
            : 'mt-1 text-lg font-semibold tabular-nums text-primary'
        }
      >
        {value}
      </p>
    </div>
  );
}
