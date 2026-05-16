'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import {
  paymentStatusLabel,
  paymentStatusVariant,
} from '@/utils/payment-status';
import type { Payment } from '@/types/database';
import type { PaymentWithChit } from '@/utils/payment-month';

interface PaymentRowCardProps {
  payment: PaymentWithChit;
  index: number;
  canWrite: boolean;
  onRecord: (p: Payment) => void;
  onEdit: (p: Payment) => void;
}

export function PaymentRowCard({
  payment: p,
  index,
  canWrite,
  onRecord,
  onEdit,
}: PaymentRowCardProps) {
  const collected = Number(p.advance_amount_paid ?? 0);
  const isPaid = p.status === 'paid';

  return (
    <article
      className="member-card-enter flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 transition hover:border-accent/25 sm:flex-row sm:items-center sm:justify-between"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <div className="min-w-0 flex-1">
        <Link
          href={`/chits/${p.chit_id}`}
          className="font-semibold text-primary hover:text-accent"
        >
          {p.chit?.person?.name ?? 'Member'}
          <span className="text-muted"> · #{p.installment_no}</span>
        </Link>
        <p className="mt-0.5 text-xs text-muted">
          {p.chit?.category} · {p.chit?.person?.city ?? '—'}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <span className="text-muted">
            Expected <strong className="text-primary">{formatCurrency(Number(p.expected_amount))}</strong>
          </span>
          {collected > 0 ? (
            <span className="text-muted">
              Collected <strong className="text-accent">{formatCurrency(collected)}</strong>
            </span>
          ) : null}
          {p.payment_mode ? (
            <span className="text-muted">
              {p.payment_mode} → {p.paid_to}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Badge variant={paymentStatusVariant(p.status)}>{paymentStatusLabel(p.status)}</Badge>
        {canWrite && !isPaid ? (
          <button
            type="button"
            onClick={() => onRecord(p)}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white"
          >
            Record
          </button>
        ) : null}
        {canWrite && isPaid ? (
          <button
            type="button"
            onClick={() => onEdit(p)}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : null}
      </div>
    </article>
  );
}
