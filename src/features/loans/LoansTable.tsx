'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { loanStatusLabels } from '@/constants/loans';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import type { Loan } from '@/types/database';

interface LoansTableProps {
  loans: Loan[];
  canManage: boolean;
  onDelete?: (loan: Loan) => void;
  emptyMessage: string;
}

export function LoansTable({ loans, canManage, onDelete, emptyMessage }: LoansTableProps) {
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Principal</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Interest</th>
              <th className="px-4 py-3">Repayment</th>
              <th className="px-4 py-3">Closed</th>
              <th className="px-4 py-3">Status</th>
              {canManage || onDelete ? <th className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loans.map((loan) => (
              <tr
                key={loan.id}
                className="cursor-pointer hover:bg-surface/50"
                onClick={() => openLoan(loan.id)}
              >
                <td className="px-4 py-3 text-muted">{formatDate(loan.start_date)}</td>
                <td className="px-4 py-3 font-medium tabular-nums text-primary">
                  {formatCurrency(loan.principal)}
                </td>
                <td className="px-4 py-3 text-muted">{rateToPercentLabel(loan.interest_rate)}</td>
                <td className="px-4 py-3 tabular-nums">
                  {loan.interest_amount != null ? formatCurrency(loan.interest_amount) : '—'}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {loan.repayment_amount != null ? formatCurrency(loan.repayment_amount) : '—'}
                </td>
                <td className="px-4 py-3 text-muted">
                  {loan.closed_date ? formatDate(loan.closed_date) : '—'}
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
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border/60 md:hidden">
        {loans.map((loan) => (
          <li key={loan.id}>
            <button
              type="button"
              className="w-full px-4 py-4 text-left hover:bg-surface/50"
              onClick={() => openLoan(loan.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold tabular-nums text-primary">
                    {formatCurrency(loan.principal)}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(loan.start_date)}
                    {loan.closed_date ? ` → ${formatDate(loan.closed_date)}` : ''}
                  </p>
                </div>
                <Badge variant={loan.status === 'active' ? 'warning' : 'success'}>
                  {loanStatusLabels[loan.status]}
                </Badge>
              </div>
              {loan.repayment_amount != null ? (
                <p className={cn('mt-2 text-sm text-muted')}>
                  Repaid {formatCurrency(loan.repayment_amount)} (interest{' '}
                  {formatCurrency(loan.interest_amount ?? 0)})
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
        ))}
      </ul>
    </>
  );
}
