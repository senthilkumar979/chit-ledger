'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { LoanRepayment } from '@/types/database';

interface LoanRepaymentsTableProps {
  repayments: LoanRepayment[];
  canDelete?: boolean;
  onDelete?: (repayment: LoanRepayment) => void;
}

export function LoanRepaymentsTable({
  repayments,
  canDelete,
  onDelete,
}: LoanRepaymentsTableProps) {
  if (!repayments.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted sm:px-6">
        No repayments recorded yet. Partial payments will appear here.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Principal</th>
              <th className="px-4 py-3">Interest</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Notes</th>
              {canDelete ? <th className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {repayments.map((row) => (
              <tr key={row.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 text-muted">{formatDate(row.repayment_date)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(row.principal_paid)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(row.interest_paid)}</td>
                <td className="px-4 py-3 font-medium tabular-nums text-primary">
                  {formatCurrency(row.principal_paid + row.interest_paid)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={row.is_final ? 'success' : 'default'}>
                    {row.is_final ? 'Final' : 'Partial'}
                  </Badge>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-muted">
                  {row.notes ?? '—'}
                </td>
                {canDelete && onDelete ? (
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-danger"
                      onClick={() => onDelete(row)}
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
        {repayments.map((row) => (
          <li key={row.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-primary">
                  {formatCurrency(row.principal_paid + row.interest_paid)}
                </p>
                <p className="text-xs text-muted">{formatDate(row.repayment_date)}</p>
              </div>
              <Badge variant={row.is_final ? 'success' : 'default'}>
                {row.is_final ? 'Final' : 'Partial'}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted">
              Principal {formatCurrency(row.principal_paid)} · Interest{' '}
              {formatCurrency(row.interest_paid)}
            </p>
            {row.notes ? <p className="mt-1 text-xs text-muted">{row.notes}</p> : null}
            {canDelete && onDelete ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 w-full text-danger"
                onClick={() => onDelete(row)}
              >
                Delete
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
