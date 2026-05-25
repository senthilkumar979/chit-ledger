'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Payment } from '@/types/database'
import {
  getInstallmentVariance,
  getRecordedAmount,
  hasRecordedPayment,
} from '@/utils/chit-payment-summary'
import { formatInstallmentDueMonth } from '@/utils/installment-due'
import type { PaymentWithChit } from '@/utils/payment-month'
import {
  paymentStatusLabel,
  paymentStatusVariant,
} from '@/utils/payment-status'
import { Pencil } from 'lucide-react'
import Link from 'next/link'

interface PaymentRowCardProps {
  payment: PaymentWithChit
  index: number
  canWrite: boolean
  onRecord: (p: Payment) => void
  onEdit: (p: Payment) => void
}

export function PaymentRowCard({
  payment: p,
  index,
  canWrite,
  onRecord,
  onEdit,
}: PaymentRowCardProps) {
  const collected = getRecordedAmount(p)
  const variance = getInstallmentVariance(p)
  const isPaid = p.status === 'paid'
  const dueMonth = formatInstallmentDueMonth(
    p.chit?.start_date ?? null,
    p.installment_no,
  )
  const varianceTone =
    variance === 0
      ? 'text-muted'
      : variance > 0
      ? 'text-accent'
      : 'text-warning'

  return (
    <article
      className={cn(
        'member-card-enter rounded-2xl border p-4 shadow-sm transition-all',
        isPaid
          ? 'border-accent/25 bg-accent/[0.04]'
          : p.status === 'partial'
          ? 'border-warning/25 bg-warning/10'
          : 'border-border/80 bg-card hover:border-accent/20',
      )}
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold',
                isPaid
                  ? 'bg-accent/10 text-accent'
                  : 'bg-primary/5 text-primary',
              )}
            >
              {p.installment_no}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Installment
              </p>
              <Link
                href={`/chits/${p.chit_id}`}
                className="truncate text-base font-semibold text-primary hover:text-accent"
              >
                {p.chit?.person?.name ?? 'Member'}
              </Link>
              <p className="mt-0.5 text-sm text-muted">
                #{p.installment_no} · {p.chit?.category ?? 'Unscheduled'} ·{' '}
                {p.chit?.person?.city ?? '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant={paymentStatusVariant(p.status)}>
              {paymentStatusLabel(p.status)}
            </Badge>
            {canWrite && !isPaid ? (
              <Button
                type="button"
                size="sm"
                variant="accent"
                onClick={() => onRecord(p)}
              >
                Record
              </Button>
            ) : null}
            {canWrite && isPaid ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEdit(p)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <DetailCell label="Due" value={dueMonth} emphasize />
          <DetailCell
            label="Expected"
            value={formatCurrency(Number(p.expected_amount))}
            emphasize
          />
          <DetailCell
            label="Maturity"
            value={formatCurrency(Number(p.maturity_amount))}
          />
          <DetailCell
            label="Collected"
            value={hasRecordedPayment(p) ? formatCurrency(collected) : '₹0'}
            valueClassName={
              p.status === 'paid'
                ? 'text-accent font-semibold'
                : p.status === 'partial'
                ? 'text-warning font-semibold'
                : undefined
            }
          />
          <DetailCell
            label="Variance"
            value={
              variance === 0
                ? formatCurrency(0)
                : `${variance > 0 ? '+' : '-'}${formatCurrency(
                    Math.abs(variance),
                  )}`
            }
            valueClassName={cn(varianceTone, 'font-semibold')}
          />
          <DetailCell
            label="Payment"
            value={
              p.payment_mode
                ? `${p.payment_mode}${p.paid_to ? ` · ${p.paid_to}` : ''}`
                : p.paid_date
                ? formatDate(p.paid_date)
                : ''
            }
          />
        </dl>
      </div>
    </article>
  )
}

function DetailCell({
  label,
  value,
  emphasize,
  valueClassName,
}: {
  label: string
  value: string
  emphasize?: boolean
  valueClassName?: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border border-muted/20 bg-background/60 px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd
        className={cn(
          'mt-1 truncate text-sm tabular-nums',
          valueClassName,
          !valueClassName &&
            (emphasize
              ? 'font-semibold text-primary'
              : 'font-medium text-primary/90'),
        )}
      >
        {value}
      </dd>
    </div>
  )
}
