'use client';

import { useRouter } from 'next/navigation';
import {
  Calendar,
  CircleDollarSign,
  IndianRupee,
  MapPin,
  Percent,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { loanStatusLabels } from '@/constants/loans';
import { calculateLoanInterestSoFar } from '@/utils/loan-balance';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import type { Loan, LoanRepayment } from '@/types/database';

interface LoansTableProps {
  loans: Loan[];
  repayments?: LoanRepayment[];
  canManage: boolean;
  onDelete?: (loan: Loan) => void;
  emptyMessage: string;
}

export function LoansTable({
  loans,
  repayments = [],
  canManage,
  onDelete,
  emptyMessage,
}: LoansTableProps) {
  const router = useRouter();

  if (!loans.length) {
    return <p className="px-4 py-12 text-center text-sm text-muted sm:px-6">{emptyMessage}</p>;
  }

  function openLoan(loanId: string) {
    router.push(`/loans/${loanId}`);
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Loan from</th>
              <th className="px-4 py-3">Principal</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Interest so far</th>
              <th className="px-4 py-3">Repayment</th>
              <th className="px-4 py-3">Closed</th>
              <th className="px-4 py-3">Status</th>
              {canManage || onDelete ? <th className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loans.map((loan) => (
              <LoanTableRow
                key={loan.id}
                loan={loan}
                repayments={repayments}
                onOpen={() => openLoan(loan.id)}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border/60 md:hidden">
        {loans.map((loan) => (
          <LoanMobileRow
            key={loan.id}
            loan={loan}
            repayments={repayments}
            onOpen={() => openLoan(loan.id)}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </>
  );
}

function LoanTableRow({
  loan,
  repayments,
  onOpen,
  onDelete,
}: {
  loan: Loan;
  repayments: LoanRepayment[];
  onOpen: () => void;
  onDelete?: (loan: Loan) => void;
}) {
  const interestSoFar = calculateLoanInterestSoFar(loan, repayments);

  return (
    <tr className="cursor-pointer hover:bg-surface/50" onClick={onOpen}>
      <td className="px-4 py-3 text-muted">
        <CellWithIcon icon={Calendar}>{formatDate(loan.start_date)}</CellWithIcon>
      </td>
      <td className="px-4 py-3">
        <LoanFromCell loan={loan} />
      </td>
      <td className="px-4 py-3 font-medium tabular-nums text-primary">
        <CellWithIcon icon={IndianRupee}>{formatCurrency(loan.principal)}</CellWithIcon>
      </td>
      <td className="px-4 py-3">
        <Badge variant="danger" className="gap-1 tabular-nums">
          <Percent className="h-3 w-3" />
          {rateToPercentLabel(loan.interest_rate)}/mo
        </Badge>
      </td>
      <td className="px-4 py-3 font-medium tabular-nums text-warning">
        <CellWithIcon icon={TrendingUp}>{formatCurrency(interestSoFar)}</CellWithIcon>
      </td>
      <td className="px-4 py-3 tabular-nums text-muted">
        <CellWithIcon icon={Wallet}>
          {loan.repayment_amount != null ? formatCurrency(loan.repayment_amount) : '—'}
        </CellWithIcon>
      </td>
      <td className="px-4 py-3 text-muted">
        <CellWithIcon icon={CircleDollarSign}>
          {loan.closed_date ? formatDate(loan.closed_date) : '—'}
        </CellWithIcon>
      </td>
      <td className="px-4 py-3">
        <Badge variant={loan.status === 'active' ? 'warning' : 'success'}>
          {loanStatusLabels[loan.status]}
        </Badge>
      </td>
      {onDelete ? (
        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-danger"
            onClick={() => onDelete(loan)}
          >
            Delete
          </Button>
        </td>
      ) : null}
    </tr>
  );
}

function LoanMobileRow({
  loan,
  repayments,
  onOpen,
  onDelete,
}: {
  loan: Loan;
  repayments: LoanRepayment[];
  onOpen: () => void;
  onDelete?: (loan: Loan) => void;
}) {
  const interestSoFar = calculateLoanInterestSoFar(loan, repayments);

  return (
    <li>
      <button type="button" className="w-full px-4 py-4 text-left hover:bg-surface/50" onClick={onOpen}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-semibold tabular-nums text-primary">
              <IndianRupee className="h-4 w-4 shrink-0 text-accent" />
              {formatCurrency(loan.principal)}
            </p>
            <div className="mt-1">
              <LoanFromCell loan={loan} compact />
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatDate(loan.start_date)}
              {loan.closed_date ? ` → ${formatDate(loan.closed_date)}` : ''}
            </p>
          </div>
          <Badge variant={loan.status === 'active' ? 'warning' : 'success'}>
            {loanStatusLabels[loan.status]}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="danger" className="gap-1 tabular-nums">
            <Percent className="h-3 w-3" />
            {rateToPercentLabel(loan.interest_rate)}/mo
          </Badge>
          <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-warning">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(interestSoFar)} interest
          </span>
        </div>
        {loan.repayment_amount != null ? (
          <p className="mt-2 flex items-center gap-1 text-sm text-muted">
            <Wallet className="h-3.5 w-3.5" />
            Repaid {formatCurrency(loan.repayment_amount)}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">Tap to view details and repayments</p>
        )}
      </button>
      {onDelete ? (
        <div className="border-t border-border/60 px-4 pb-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full text-danger"
            onClick={() => onDelete(loan)}
          >
            Delete
          </Button>
        </div>
      ) : null}
    </li>
  );
}

function LoanFromCell({ loan, compact }: { loan: Loan; compact?: boolean }) {
  if (!loan.loan_from) {
    return <span className="text-muted">—</span>;
  }

  return (
    <div className={cn('min-w-0', compact ? 'text-xs' : 'text-sm')}>
      <p className="flex items-center gap-1.5 font-medium text-primary">
        <User className="h-3.5 w-3.5 shrink-0 text-accent/80" />
        <span className="truncate">{loan.loan_from.name}</span>
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-muted">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{loan.loan_from.city}</span>
      </p>
    </div>
  );
}

function CellWithIcon({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted/80" />
      {children}
    </span>
  );
}
