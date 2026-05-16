'use client';

import type { Payment } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { paymentStatusLabel, paymentStatusVariant } from '@/utils/payment-status';
import {
  PaymentScheduleRowActions,
  type PaymentScheduleRowActionsProps,
} from './PaymentScheduleRowActions';
import { PaymentScheduleCollectedCell } from './PaymentScheduleCollectedCell';
import { hasRecordedPayment } from '@/utils/chit-payment-summary';
import { formatInstallmentDueMonth } from '@/utils/installment-due';

interface PaymentScheduleMobileProps extends Omit<PaymentScheduleRowActionsProps, 'payment' | 'layout'> {
  payments: Payment[];
  startDate: string | null;
}

export function PaymentScheduleMobile({
  payments,
  startDate,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: PaymentScheduleMobileProps) {
  return (
    <div className="space-y-3 lg:hidden">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        Tap an installment to record or manage payment
      </p>
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
        {payments.map((p, i) => (
          <MobileCard
            key={p.id}
            payment={p}
            startDate={startDate}
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
    </div>
  );
}

function MobileCard({
  payment: p,
  startDate,
  index,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
}: PaymentScheduleRowActionsProps & { startDate: string | null; index: number }) {
  const variant = paymentStatusVariant(p.status);
  const isPaid = p.status === 'paid' || p.status === 'partial';
  const hasPaymentDetails = hasRecordedPayment(p);

  return (
    <article
      className={cn(
        'member-card-enter flex flex-col overflow-hidden rounded-xl border shadow-sm',
        isPaid ? 'border-accent/30 bg-accent/[0.04]' : 'border-border/80 bg-card',
      )}
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <header className="flex items-center gap-3 border-b border-border/60 bg-surface/40 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-base font-bold text-primary">
          {p.installment_no}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Installment</p>
          <p className="truncate text-sm font-semibold text-primary">
            #{p.installment_no}
            <span className="ml-1.5 font-normal text-muted">
              · {formatInstallmentDueMonth(startDate, p.installment_no)}
            </span>
            {p.installment_no === 20 ? (
              <span className="ml-1 font-normal text-muted">· maturity</span>
            ) : null}
          </p>
        </div>
        <Badge variant={variant} className="shrink-0">
          {paymentStatusLabel(p.status)}
        </Badge>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 px-4 py-4">
        <LedgerField
          label="Due month"
          value={formatInstallmentDueMonth(startDate, p.installment_no)}
          emphasize
        />
        <LedgerField label="Expected" value={formatCurrency(Number(p.expected_amount))} emphasize />
        <LedgerField label="Maturity" value={formatCurrency(Number(p.maturity_amount))} />
        {hasPaymentDetails ? (
          <>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Collected</p>
              <div className="mt-0.5">
                <PaymentScheduleCollectedCell payment={p} stacked />
              </div>
            </div>
            <LedgerField
              label="Paid on"
              value={p.paid_date ? formatDate(p.paid_date) : '—'}
            />
            <LedgerField label="Mode" value={p.payment_mode ?? '—'} />
            <LedgerField label="Paid to" value={p.paid_to ?? '—'} />
          </>
        ) : (
          <LedgerField
            label="Collected"
            value="—"
            className="col-span-2 text-muted"
          />
        )}
      </dl>

      {canWrite ? (
        <footer className="border-t border-border/60 bg-surface/30 px-4 py-3">
          <PaymentScheduleRowActions
            payment={p}
            canWrite={canWrite}
            confirmReset={confirmReset}
            onConfirmReset={onConfirmReset}
            onMarkPaid={onMarkPaid}
            onEdit={onEdit}
            onReset={onReset}
            layout="stacked"
          />
        </footer>
      ) : null}
    </article>
  );
}

function LedgerField({
  label,
  value,
  emphasize,
  className,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 truncate text-sm tabular-nums',
          emphasize ? 'font-semibold text-primary' : 'font-medium text-primary/90',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
