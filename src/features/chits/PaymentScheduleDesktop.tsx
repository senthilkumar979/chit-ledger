'use client';

import type { Payment } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { paymentStatusLabel, paymentStatusVariant } from '@/utils/payment-status';
import {
  PaymentScheduleRowActions,
  type PaymentScheduleRowActionsProps,
} from './PaymentScheduleRowActions';

interface PaymentScheduleDesktopProps extends Omit<PaymentScheduleRowActionsProps, 'payment' | 'layout'> {
  payments: Payment[];
}

export function PaymentScheduleDesktop({
  payments,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: PaymentScheduleDesktopProps) {
  return (
    <div className="hidden space-y-2 lg:block">
      <div className="grid grid-cols-9 gap-2 rounded-lg bg-surface px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
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
        <DesktopRow
          key={p.id}
          payment={p}
          index={i}
          canWrite={canWrite}
          confirmReset={confirmReset}
          onConfirmReset={onConfirmReset}
          onMarkPaid={onMarkPaid}
          onEdit={onEdit}
          onReset={onReset}
        />
      ))}
    </div>
  );
}

function DesktopRow({
  payment: p,
  index,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: PaymentScheduleRowActionsProps & { index: number }) {
  const paid = Number(p.advance_amount_paid ?? 0);
  const variant = paymentStatusVariant(p.status);
  const isPaid = p.status === 'paid' || p.status === 'partial';

  return (
    <div
      className={cn(
        'member-card-enter grid grid-cols-9 items-center gap-2 rounded-xl border p-4 transition-all',
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
      <PaymentScheduleRowActions
        payment={p}
        canWrite={canWrite}
        confirmReset={confirmReset}
        onConfirmReset={onConfirmReset}
        onMarkPaid={onMarkPaid}
        onEdit={onEdit}
        onReset={onReset}
        layout="inline"
        className="justify-end"
      />
    </div>
  );
}

function Cell({ value }: { value: string }) {
  return <p className="py-1 text-sm font-medium tabular-nums text-primary">{value}</p>;
}
