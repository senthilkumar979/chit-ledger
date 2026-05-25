'use client';

import Link from 'next/link';
import {
  Calendar,
  CalendarClock,
  IndianRupee,
  MapPin,
  Percent,
  TrendingUp,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { buildGrantDisplayMetrics } from '@/utils/grant-metrics';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import { getDisplayPersonLabel } from '@/utils/person-display';
import { LoanInterestBreakdownCard } from '@/features/loans/LoanInterestBreakdownCard';
import type { Grant } from '@/types/database';
import type { LucideIcon } from 'lucide-react';

interface GrantDetailSummaryProps {
  grant: Grant;
}

export function GrantDetailSummary({ grant }: GrantDetailSummaryProps) {
  const metrics = buildGrantDisplayMetrics(grant);
  const breakdown = {
    monthlyInterest: metrics.monthlyInterest,
    monthsHeld: metrics.monthsSinceStart,
    totalInterest: metrics.interestSoFar,
    repaymentTotal: 0,
  };

  const stats: {
    label: string;
    value: string;
    icon: LucideIcon;
    tone: keyof typeof toneClasses;
    highlight?: boolean;
  }[] = [
    {
      label: 'Grant amount',
      value: formatCurrency(grant.amount),
      icon: IndianRupee,
      tone: 'accent',
      highlight: true,
    },
    {
      label: 'Interest per month',
      value: formatCurrency(metrics.monthlyInterest),
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
      label: 'Months since start',
      value: String(metrics.monthsSinceStart),
      icon: CalendarClock,
      tone: 'default',
    },
    {
      label: 'Interest start date',
      value: formatDate(grant.interest_start_date),
      icon: Calendar,
      tone: 'default',
    },
    {
      label: 'As of',
      value: formatDate(metrics.asOfDate),
      icon: Calendar,
      tone: 'default',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {grant.grant_to ? (
            <Link href={`/persons/${grant.grant_to_person_id}`} className="group min-w-0">
              <span className="flex items-center gap-1.5 text-lg font-semibold text-primary group-hover:text-accent">
                <User className="h-4 w-4 text-accent" />
                {getDisplayPersonLabel(grant.grant_to)}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {grant.grant_to.city}
              </span>
            </Link>
          ) : (
            <p className="text-muted">Recipient not linked</p>
          )}
          <Badge variant="danger" className="gap-1 tabular-nums">
            <Percent className="h-3 w-3" />
            {rateToPercentLabel(grant.interest_rate)}/mo
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone, highlight }) => (
          <div
            key={label}
            className={cn(
              'rounded-xl border border-border/80 bg-card p-3 shadow-sm sm:p-4',
              highlight && 'border-warning/30 ring-1 ring-warning/15',
            )}
          >
            <div className={cn('mb-2 inline-flex rounded-lg p-2', toneClasses[tone])}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-primary sm:text-xl">{value}</p>
          </div>
        ))}
      </div>

      <LoanInterestBreakdownCard
        principal={grant.amount}
        rate={grant.interest_rate}
        startDate={grant.interest_start_date}
        closeDate={metrics.asOfDate}
        breakdown={breakdown}
        periodLabel="Accrued to date"
      />

      {grant.notes ? (
        <div className="rounded-xl border border-border/80 bg-card px-4 py-3 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Notes</p>
          <p className="mt-1 text-sm text-primary">{grant.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

const toneClasses = {
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  default: 'bg-surface text-primary border border-border/60',
} as const;
