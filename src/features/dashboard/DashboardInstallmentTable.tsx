'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { getRecordedAmount, getInstallmentVariance } from '@/utils/chit-payment-summary';
import { getDisplayPersonLabel } from '@/utils/person-display';
import {
  paymentStatusLabel,
  paymentStatusVariant,
} from '@/utils/payment-status';
import type { PaymentWithChit } from '@/utils/payment-month';

interface DashboardInstallmentTableProps {
  title: string;
  description: string;
  rows: PaymentWithChit[];
  emptyMessage: string;
  showCollected?: boolean;
  headerAction?: React.ReactNode;
}

export function DashboardInstallmentTable({
  title,
  description,
  rows,
  emptyMessage,
  showCollected = false,
  headerAction,
}: DashboardInstallmentTableProps) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
            <p className="mt-1 text-xs text-muted">
              {rows.length} row{rows.length !== 1 ? 's' : ''}
            </p>
          </div>
          {headerAction ? <div className="flex shrink-0 items-center">{headerAction}</div> : null}
        </div>
      </header>

      {!rows.length ? (
        <p className="px-4 py-12 text-center text-sm text-muted sm:px-6">{emptyMessage}</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Inst.</th>
                  <th className="px-4 py-3">Expected</th>
                  {showCollected ? <th className="px-4 py-3">Collected</th> : null}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row) => (
                  <TableRow key={row.id} payment={row} showCollected={showCollected} />
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border/60 md:hidden">
            {rows.map((row) => (
              <MobileRow key={row.id} payment={row} showCollected={showCollected} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function TableRow({
  payment: p,
  showCollected,
}: {
  payment: PaymentWithChit;
  showCollected: boolean;
}) {
  const collected = getRecordedAmount(p);
  const variance = getInstallmentVariance(p);

  return (
    <tr className="hover:bg-surface/50">
      <td className="px-4 py-3 font-medium text-primary">
        {getDisplayPersonLabel(p.chit?.person, '—')}
      </td>
      <td className="px-4 py-3 tabular-nums">#{p.installment_no}</td>
      <td className="px-4 py-3 tabular-nums">{formatCurrency(Number(p.expected_amount))}</td>
      {showCollected ? (
        <td className="px-4 py-3">
          <span className="tabular-nums font-medium">{formatCurrency(collected)}</span>
          {variance !== 0 ? (
            <span
              className={cn(
                'ml-1 text-xs',
                variance > 0 ? 'text-accent' : 'text-warning',
              )}
            >
              ({variance > 0 ? '+' : '−'}
              {formatCurrency(Math.abs(variance))})
            </span>
          ) : null}
        </td>
      ) : null}
      <td className="px-4 py-3">
        <Badge variant={paymentStatusVariant(p.status)}>{paymentStatusLabel(p.status)}</Badge>
      </td>
      <td className="px-4 py-3 text-muted">{p.chit?.category ?? '—'}</td>
      <td className="px-4 py-3 text-right">
        <Link href={`/chits/${p.chit_id}`} className="inline-flex text-accent hover:underline">
          View <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
        </Link>
      </td>
    </tr>
  );
}

function MobileRow({
  payment: p,
  showCollected,
}: {
  payment: PaymentWithChit;
  showCollected: boolean;
}) {
  const collected = getRecordedAmount(p);
  const variance = getInstallmentVariance(p);

  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-primary">
            {getDisplayPersonLabel(p.chit?.person, 'Member')}
          </p>
          <p className="text-xs text-muted">
            #{p.installment_no} · {p.chit?.category}
            {p.paid_date ? ` · ${formatDate(p.paid_date)}` : ''}
          </p>
        </div>
        <Badge variant={paymentStatusVariant(p.status)}>{paymentStatusLabel(p.status)}</Badge>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted">Expected</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(Number(p.expected_amount))}</dd>
        </div>
        {showCollected ? (
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted">Collected</dt>
            <dd className="font-medium tabular-nums text-accent">{formatCurrency(collected)}</dd>
          </div>
        ) : (
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted">City</dt>
            <dd>{p.chit?.person?.city ?? '—'}</dd>
          </div>
        )}
      </dl>
      {showCollected && variance !== 0 ? (
        <p className={cn('mt-2 text-xs font-medium', variance > 0 ? 'text-accent' : 'text-warning')}>
          {variance > 0 ? 'Extra' : 'Shortfall'} {formatCurrency(Math.abs(variance))}
        </p>
      ) : null}
      <Link
        href={`/chits/${p.chit_id}`}
        className="mt-3 inline-flex items-center text-sm font-medium text-accent"
      >
        Open chit <ArrowUpRight className="h-4 w-4" />
      </Link>
    </li>
  );
}
