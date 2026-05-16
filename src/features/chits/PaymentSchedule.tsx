'use client';

import { useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import type { Payment } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  paymentStatusLabel,
  paymentStatusVariant,
} from '@/utils/payment-status';

interface PaymentScheduleProps {
  payments: Payment[];
  onMarkPaid?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onReset?: (payment: Payment) => void;
  canWrite: boolean;
}

export function PaymentSchedule({
  payments,
  onMarkPaid,
  onEdit,
  onReset,
  canWrite,
}: PaymentScheduleProps) {
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="hidden gap-2 rounded-lg bg-surface px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted lg:grid lg:grid-cols-9">
        <span>#</span>
        <span>Expected</span>
        <span>Maturity</span>
        <span>Collected</span>
        <span>Mode</span>
        <span>Paid to</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>
      {payments.map((p, i) => (
        <ScheduleRow
          key={p.id}
          payment={p}
          index={i}
          canWrite={canWrite}
          confirmReset={confirmReset}
          onConfirmReset={setConfirmReset}
          onMarkPaid={onMarkPaid}
          onEdit={onEdit}
          onReset={onReset}
        />
      ))}
    </div>
  );
}

function ScheduleRow({
  payment: p,
  index,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: {
  payment: Payment;
  index: number;
  canWrite: boolean;
  confirmReset: string | null;
  onConfirmReset: (id: string | null) => void;
  onMarkPaid?: (p: Payment) => void;
  onEdit?: (p: Payment) => void;
  onReset?: (p: Payment) => void;
}) {
  const paid = Number(p.advance_amount_paid ?? 0);
  const variant = paymentStatusVariant(p.status);
  const isPaid = p.status === 'paid' || p.status === 'partial';
  const isConfirming = confirmReset === p.id;

  return (
    <div
      className={cn(
        'member-card-enter rounded-xl border p-4 transition-all lg:grid lg:grid-cols-9 lg:items-center lg:gap-2',
        isPaid ? 'border-accent/25 bg-accent/[0.04]' : 'border-border/80 bg-card hover:border-accent/20',
      )}
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-sm font-bold text-primary">
        {p.installment_no}
      </span>
      <Cell value={formatCurrency(Number(p.expected_amount))} />
      <Cell value={formatCurrency(Number(p.maturity_amount))} />
      <Cell value={paid > 0 ? formatCurrency(paid) : '—'} />
      <Cell value={p.payment_mode ?? '—'} />
      <Cell value={p.paid_to ?? '—'} />
      <Cell value={p.paid_date ? formatDate(p.paid_date) : '—'} />
      <Badge variant={variant} className="w-fit">
        {paymentStatusLabel(p.status)}
      </Badge>

      <div className="mt-3 flex flex-wrap gap-2 lg:mt-0 lg:justify-end">
        {canWrite && !isPaid && onMarkPaid ? (
          <button
            type="button"
            onClick={() => onMarkPaid(p)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
          >
            Record
          </button>
        ) : null}
        {canWrite && isPaid && onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(p)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        ) : null}
        {canWrite && isPaid && onReset ? (
          isConfirming ? (
            <>
              <button
                type="button"
                onClick={() => onReset(p)}
                className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => onConfirmReset(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmReset(p.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}

function Cell({ value }: { value: string }) {
  return <p className="text-sm font-medium tabular-nums text-primary lg:py-1">{value}</p>;
}
