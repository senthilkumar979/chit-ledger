'use client';

import { AlertCircle, CheckCircle2, Clock, CreditCard, CalendarDays } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyScheduledPaymentsResult } from '@/utils/payment-month';

interface PaymentsHeroProps {
  total: number;
  paid: number;
  pending: number;
  partial: number;
  overdue: number;
  collectedAmount: number;
  monthLabel: string;
  schedule: MonthlyScheduledPaymentsResult;
}

export function PaymentsHero({
  total,
  paid,
  pending,
  partial,
  overdue,
  collectedAmount,
  monthLabel,
  schedule,
}: PaymentsHeroProps) {
  const stats = [
    { label: 'Scheduled', value: String(schedule.scheduledCount), icon: CalendarDays },
    { label: 'Listed', value: String(total), icon: CreditCard },
    { label: 'Paid', value: String(paid), icon: CheckCircle2 },
    { label: 'Pending', value: String(pending), icon: Clock },
    { label: 'Partial', value: String(partial), icon: Clock },
    { label: 'Overdue', value: String(overdue), icon: AlertCircle },
    { label: 'Recorded', value: formatCurrency(collectedAmount), icon: CreditCard },
  ];

  const excludedParts: string[] = [];
  if (schedule.excludedOutsidePeriod > 0) {
    excludedParts.push(`${schedule.excludedOutsidePeriod} outside chit period`);
  }
  if (schedule.excludedNoStartDate > 0) {
    excludedParts.push(`${schedule.excludedNoStartDate} missing start date`);
  }
  if (schedule.missingPaymentRow > 0) {
    excludedParts.push(`${schedule.missingPaymentRow} without a payments-table row`);
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-accent/90 via-primary to-secondary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Collections</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Scheduled installments for {monthLabel} come from the chits table (start–end period). Each
          row&apos;s status — paid, partial, pending, or overdue — is read from the payments table.
          {excludedParts.length > 0 ? ` Skipped: ${excludedParts.join('; ')}.` : ''}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
            >
              <Icon className="mb-2 h-4 w-4 text-white/80" />
              <p className="text-lg font-bold tabular-nums sm:text-xl">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
