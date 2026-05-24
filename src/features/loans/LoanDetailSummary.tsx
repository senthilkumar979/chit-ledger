'use client'

import Link from 'next/link'
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Percent,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { loanStatusLabels } from '@/constants/loans'
import { rateToPercentLabel } from '@/utils/loan-calculations'
import { buildLoanDetailMetrics } from '@/utils/loan-detail-metrics'
import { LoanInterestBreakdownCard } from './LoanInterestBreakdownCard'
import type { LoanWithRepayments } from '@/types/database'
import type { LucideIcon } from 'lucide-react'

interface LoanDetailSummaryProps {
  loan: LoanWithRepayments
}

export function LoanDetailSummary({ loan }: LoanDetailSummaryProps) {
  const metrics = buildLoanDetailMetrics(loan, loan.repayments)
  const { balance, isActive } = metrics

  const statItems: {
    label: string
    value: string
    icon: LucideIcon
    tone: keyof typeof toneClasses
    highlight?: boolean
  }[] = [
    {
      label: 'Original principal',
      value: formatCurrency(balance.originalPrincipal),
      icon: IndianRupee,
      tone: 'default',
    },
    {
      label: 'Outstanding principal',
      value: formatCurrency(isActive ? balance.principalOutstanding : 0),
      icon: Wallet,
      tone: 'accent',
      highlight: isActive,
    },
    {
      label: 'Principal repaid',
      value: formatCurrency(balance.principalRepaid),
      icon: CheckCircle2,
      tone: 'default',
    },
    {
      label: 'Interest per month',
      value: formatCurrency(
        isActive
          ? metrics.monthlyInterestOnOutstanding
          : metrics.monthlyInterestOnOriginal,
      ),
      icon: Percent,
      tone: 'danger',
    },
    {
      label: 'Interest so far',
      value: formatCurrency(metrics.interestSoFar),
      icon: TrendingUp,
      tone: 'warning',
      highlight: true,
    },
    {
      label: 'Interest paid',
      value: formatCurrency(balance.interestPaidToDate),
      icon: TrendingUp,
      tone: 'default',
    },
    {
      label: 'Accruing this period',
      value: isActive
        ? formatCurrency(metrics.interestAccruingThisPeriod)
        : '—',
      icon: Clock,
      tone: 'info',
    },
    {
      label: 'Total repaid',
      value: formatCurrency(balance.totalRepaidToDate),
      icon: Wallet,
      tone: 'default',
    },
    {
      label: 'Months since borrowed',
      value: String(metrics.monthsSinceBorrowed),
      icon: CalendarClock,
      tone: 'default',
    },
    {
      label: isActive ? 'Months this period' : 'Months at close',
      value: String(metrics.currentPeriodBreakdown.monthsHeld),
      icon: Calendar,
      tone: 'default',
    },
    {
      label: isActive ? 'Payoff if closed today' : 'Final repayment',
      value: isActive
        ? formatCurrency(metrics.settlementIfClosedToday ?? 0)
        : metrics.storedRepaymentAmount != null
        ? formatCurrency(metrics.storedRepaymentAmount)
        : '—',
      icon: IndianRupee,
      tone: 'accent',
    },
    {
      label: 'Partial repayments',
      value: String(balance.partialRepaymentCount),
      icon: Wallet,
      tone: 'default',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {loan.loan_from && loan.loan_from_person_id ? (
              <Link
                href={`/persons/${loan.loan_from_person_id}`}
                className="group inline-flex min-w-0 flex-col"
              >
                <span className="flex items-center gap-1.5 text-lg font-semibold text-primary group-hover:text-accent">
                  <User className="h-4 w-4 shrink-0 text-accent" />
                  {loan.loan_from.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {loan.loan_from.city}
                </span>
              </Link>
            ) : (
              <p className="text-sm text-muted">Lender not linked</p>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Started {formatDate(loan.start_date)}
              </span>
              {loan.closed_date ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Closed {formatDate(loan.closed_date)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  As of {formatDate(metrics.asOfDate)}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="danger" className="gap-1 tabular-nums">
              {/* <Percent className="h-3 w-3" /> */}
              {rateToPercentLabel(loan.interest_rate)} interest per month
            </Badge>
            <Badge variant={isActive ? 'warning' : 'success'}>
              {loanStatusLabels[loan.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {statItems.map(({ label, value, icon: Icon, tone, highlight }) => (
          <div
            key={label}
            className={cn(
              'rounded-xl border border-border/80 bg-card p-3 shadow-sm sm:p-4',
              highlight && 'border-warning/30 ring-1 ring-warning/15',
            )}
          >
            <div
              className={cn(
                'mb-2 inline-flex rounded-lg p-2',
                toneClasses[tone],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
              {label}
            </p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-primary sm:mt-1 sm:text-xl">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LoanInterestBreakdownCard
          principal={isActive ? balance.principalOutstanding : loan.principal}
          rate={loan.interest_rate}
          startDate={isActive ? metrics.currentPeriodStart : loan.start_date}
          closeDate={metrics.periodEndDate}
          breakdown={metrics.currentPeriodBreakdown}
          periodLabel={
            isActive
              ? balance.lastRepaymentDate
                ? 'Since last repayment'
                : 'Since loan start'
              : 'At closure'
          }
        />
        <LoanInterestBreakdownCard
          principal={loan.principal}
          rate={loan.interest_rate}
          startDate={loan.start_date}
          closeDate={metrics.periodEndDate}
          breakdown={metrics.lifeBreakdown}
          periodLabel="Full loan term"
        />
      </div>

      {loan.notes ? (
        <div className="rounded-xl border border-border/80 bg-card px-4 py-3 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Notes
          </p>
          <p className="mt-1 text-sm text-primary">{loan.notes}</p>
        </div>
      ) : null}
    </div>
  )
}

const toneClasses = {
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  default: 'bg-surface text-primary',
} as const
