'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, cn } from '@/lib/utils';
import { paymentStatusVariant } from '@/utils/payment-status';
import type { OutstandingReportRow } from '@/utils/report-metrics';

interface ReportOutstandingTableProps {
  rows: OutstandingReportRow[];
  emptyMessage: string;
}

export function ReportOutstandingTable({ rows, emptyMessage }: ReportOutstandingTableProps) {
  if (!rows.length) {
    return <p className="px-4 py-12 text-center text-sm text-muted sm:px-6">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Scheme</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Collected</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-primary">{row.memberName}</td>
                <td className="px-4 py-3 tabular-nums">#{row.installmentNo}</td>
                <td className="px-4 py-3 text-muted">{row.scheme}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(row.expected)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(row.collected)}</td>
                <td className="px-4 py-3 font-medium tabular-nums text-warning">
                  {formatCurrency(row.pending)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={paymentStatusVariant(row.statusKey)}>{row.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/chits/${row.chitId}`} className="inline-flex text-accent hover:underline">
                    View <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border/60 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="px-4 py-4">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-primary">{row.memberName}</p>
              <Badge variant={paymentStatusVariant(row.statusKey)}>{row.status}</Badge>
            </div>
            <p className="mt-2 text-sm">
              Pending{' '}
              <span className={cn('font-semibold tabular-nums', row.statusKey === 'overdue' && 'text-danger')}>
                {formatCurrency(row.pending)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
