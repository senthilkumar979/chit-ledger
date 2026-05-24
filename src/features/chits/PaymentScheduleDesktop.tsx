'use client';

import type { Payment } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { paymentStatusLabel, paymentStatusVariant } from '@/utils/payment-status';
import { formatInstallmentDueMonth } from '@/utils/installment-due';
import {
  PaymentScheduleRowActions,
  type PaymentScheduleRowActionsProps,
} from './PaymentScheduleRowActions';
import { PaymentScheduleCollectedCell } from './PaymentScheduleCollectedCell';

import {
  getPaymentScheduleDueMonthClass,
  getPaymentScheduleRowClass,
  isWithdrawalInstallment,
} from './payment-schedule-style';

interface PaymentScheduleDesktopProps extends Omit<PaymentScheduleRowActionsProps, 'payment' | 'layout'> {
  payments: Payment[];
  startDate: string | null;
  withdrawalInstallmentNo: number | null;
}

export function PaymentScheduleDesktop({
  payments,
  startDate,
  withdrawalInstallmentNo,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: PaymentScheduleDesktopProps) {
  return (
    <div className="hidden space-y-2 lg:block">
      <div className="grid grid-cols-10 gap-2 rounded-lg bg-surface px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
        <span>#</span>
        <span>Due</span>
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
          startDate={startDate}
          withdrawalInstallmentNo={withdrawalInstallmentNo}
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
  startDate,
  withdrawalInstallmentNo,
  index,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: PaymentScheduleRowActionsProps & {
  startDate: string | null;
  withdrawalInstallmentNo: number | null;
  index: number;
}) {
  const variant = paymentStatusVariant(p.status);
  const isPaid = p.status === 'paid' || p.status === 'partial';
  const isWithdrawnMonth = isWithdrawalInstallment(p.installment_no, withdrawalInstallmentNo);

  return (
    <div
      className={cn(
        'member-card-enter grid grid-cols-10 items-center gap-2 rounded-xl border p-4 transition-all',
        getPaymentScheduleRowClass(isWithdrawnMonth, isPaid),
      )}
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
          isWithdrawnMonth ? 'bg-danger/10 text-danger' : 'bg-primary/5 text-primary',
        )}
      >
        {p.installment_no}
      </span>
      <Cell
        value={formatInstallmentDueMonth(startDate, p.installment_no)}
        className={getPaymentScheduleDueMonthClass(isWithdrawnMonth)}
      />
      <Cell value={formatCurrency(Number(p.expected_amount))} />
      <Cell value={formatCurrency(Number(p.maturity_amount))} />
      <PaymentScheduleCollectedCell payment={p} />
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

function Cell({ value, className }: { value: string; className?: string }) {
  return (
    <p className={cn('py-1 text-sm font-medium tabular-nums text-primary', className)}>{value}</p>
  );
}
