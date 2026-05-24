'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Landmark,
  Wallet,
} from 'lucide-react'
import { chitTypeLabels, chitTypeStyles } from '@/constants/chit-labels'
import { ChitStatusPill } from '@/features/chits/ChitStatusPill'
import { cn, formatCurrency } from '@/lib/utils'
import { buildPersonLinkedChitDisplay } from './person-linked-chit-summary'
import type { Chit } from '@/types/database'

interface PersonLinkedChitItemProps {
  chit: Chit
  index?: number
}

export function PersonLinkedChitItem({
  chit,
  index = 0,
}: PersonLinkedChitItemProps) {
  const display = buildPersonLinkedChitDisplay(chit)
  const typeGradient = chitTypeStyles[chit.type] ?? 'from-primary to-secondary'
  const footnote = getChitFootnote(chit)

  return (
    <Link
      href={`/chits/${chit.id}`}
      className={cn(
        'member-card-enter group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card',
        'shadow-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5',
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={cn('h-1 bg-gradient-to-r opacity-90', typeGradient)} />

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
            'bg-gradient-to-br from-accent/[0.03] to-info/[0.03]',
          )}
        />

        <div className="relative flex items-start justify-between gap-2">
          <span
            className={cn(
              'inline-flex rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm',
              typeGradient,
            )}
          >
            {chitTypeLabels[chit.type]}
          </span>
          <div className="flex items-center gap-1.5">
            <ChitStatusPill
              label={display.lifecycle.label}
              variant={display.lifecycle.variant}
            />
            <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-all group-hover:opacity-100" />
          </div>
        </div>

        <h3 className="relative mt-3 truncate text-base font-semibold text-primary group-hover:text-accent">
          {chit.category}
        </h3>
        <p className="relative mt-1 flex items-center gap-1 text-xs text-muted">
          <Calendar className="h-3 w-3 shrink-0" />
          {display.scheduleRange}
        </p>

        <div className="relative mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-2xl font-bold tabular-nums text-primary">
              {display.paidCount}
              <span className="text-base font-medium text-muted">
                /{display.totalInstallments}
              </span>
            </p>
            <span className="text-xs font-medium text-muted">paid</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                typeGradient,
              )}
              style={{ width: `${display.progressPercent}%` }}
            />
          </div>
          <ChitAlerts
            partial={display.partialCount}
            overdue={display.overdueCount}
          />
        </div>

        {chit.withdrawal ? (
          <WithdrawalPanel display={display} />
        ) : footnote ? (
          <p className="relative mt-4 rounded-lg border border-info/20 bg-info/[0.06] px-3 py-2 text-xs font-medium text-info">
            {footnote}
          </p>
        ) : (
          <p className="relative mt-4 flex items-center gap-1.5 text-xs text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent/80" />
            {display.recordedCount} installment
            {display.recordedCount !== 1 ? 's' : ''} recorded
          </p>
        )}

        <p className="relative mt-auto pt-4 text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
          View chit details
        </p>
      </div>
    </Link>
  )
}

function getChitFootnote(chit: Chit): string | null {
  if (chit.withdrawal) return null
  if (chit.matured) return 'Matured — awaiting withdrawal'
  return null
}

function ChitAlerts({
  partial,
  overdue,
}: {
  partial: number
  overdue: number
}) {
  if (partial === 0 && overdue === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {partial > 0 ? (
        <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
          {partial} partial
        </span>
      ) : null}
      {overdue > 0 ? (
        <span className="rounded-md bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
          {overdue} overdue
        </span>
      ) : null}
    </div>
  )
}

function WithdrawalPanel({
  display,
}: {
  display: ReturnType<typeof buildPersonLinkedChitDisplay>
}) {
  return (
    <div className="relative mt-4 space-y-2 rounded-xl border border-danger/20 bg-danger/[0.04] p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
        <Wallet className="h-3 w-3" />
        Withdrawal
      </div>
      <dl className="flex justify-between gap-y-2 text-xs">
        <div>
          <dt className="text-muted">Installment</dt>
          <dd className="font-semibold tabular-nums text-primary">
            {display.withdrawalInstallmentNo != null
              ? `#${display.withdrawalInstallmentNo}`
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="font-semibold text-primary">
            {display.withdrawalDateLabel}
          </dd>
        </div>
        {display.withdrawalMonthLabel ? (
          <div className="col-span-2">
            <dt className="text-muted">Withdrawal in month</dt>
            <dd className="font-semibold text-primary">
              {display.withdrawalMonthLabel}
            </dd>
          </div>
        ) : null}
      </dl>
      {display.netPayout != null ? (
        <p className="border-t border-danger/15 pt-2 text-sm font-bold tabular-nums text-danger">
          {formatCurrency(display.netPayout)} paid to member
        </p>
      ) : null}
    </div>
  )
}
