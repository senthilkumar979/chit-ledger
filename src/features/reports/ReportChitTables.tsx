'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { MaturedReportRow, PortfolioReportRow } from '@/utils/report-metrics';

interface ReportMaturedTableProps {
  rows: MaturedReportRow[];
  emptyMessage: string;
}

export function ReportMaturedTable({ rows, emptyMessage }: ReportMaturedTableProps) {
  if (!rows.length) {
    return <p className="px-4 py-12 text-center text-sm text-muted sm:px-6">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Scheme</th>
            <th className="px-4 py-3">End date</th>
            <th className="px-4 py-3">Net payout</th>
            <th className="px-4 py-3">Withdrawn</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface/50">
              <td className="px-4 py-3 font-medium text-primary">{row.memberName}</td>
              <td className="px-4 py-3 text-muted">{row.scheme}</td>
              <td className="px-4 py-3 text-muted">
                {row.endDate ? formatDate(row.endDate) : '-'}
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums text-accent">
                {formatCurrency(row.netPayout)}
              </td>
              <td className="px-4 py-3 text-muted">{row.withdrawn ? 'Yes' : 'No'}</td>
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
  );
}

interface ReportPortfolioTableProps {
  rows: PortfolioReportRow[];
  emptyMessage: string;
}

export function ReportPortfolioTable({ rows, emptyMessage }: ReportPortfolioTableProps) {
  if (!rows.length) {
    return <p className="px-4 py-12 text-center text-sm text-muted sm:px-6">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Scheme</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Paid</th>
            <th className="px-4 py-3">Collected</th>
            <th className="px-4 py-3">Outstanding</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface/50">
              <td className="px-4 py-3 font-medium text-primary">{row.memberName}</td>
              <td className="px-4 py-3 text-muted">{row.scheme}</td>
              <td className="px-4 py-3 text-muted">{row.lifecycle}</td>
              <td className="px-4 py-3 tabular-nums">{row.paidCount}/20</td>
              <td className="px-4 py-3 tabular-nums">{formatCurrency(row.collected)}</td>
              <td className="px-4 py-3 tabular-nums">{formatCurrency(row.outstanding)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/chits/${row.id}`} className="inline-flex text-accent hover:underline">
                  View <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
