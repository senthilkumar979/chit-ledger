'use client';

import {
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { resolveChitPaymentSummary } from '@/utils/chit-payment-summary';
import type { Chit, Payment } from '@/types/database';
import type { LucideIcon } from 'lucide-react';

interface ChitDetailStatsProps {
  payments: Payment[];
  chit: Pick<Chit, 'withdrawal' | 'withdrawal_net_amount' | 'collection_variance'>;
}

export function ChitDetailStats({ payments, chit }: ChitDetailStatsProps) {
  const summary = resolveChitPaymentSummary(payments, chit);
  const { collectionVariance, varianceLabel } = summary;
  const varianceTone =
    collectionVariance > 0 ? 'accent' : collectionVariance < 0 ? 'warning' : 'default';
  const VarianceIcon =
    collectionVariance > 0 ? TrendingUp : collectionVariance < 0 ? TrendingDown : CheckCircle2;

  const items: {
    label: string;
    value: string;
    icon: LucideIcon;
    tone: string;
    highlight?: boolean;
  }[] = [
    {
      label: 'Collected',
      value: formatCurrency(summary.totalCollected),
      icon: IndianRupee,
      tone: 'accent',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(summary.outstanding),
      icon: Clock,
      tone: 'warning',
    },
    {
      label: varianceLabel,
      value:
        collectionVariance === 0
          ? 'Balanced'
          : `${collectionVariance > 0 ? '+' : '−'}${formatCurrency(Math.abs(collectionVariance))}`,
      icon: VarianceIcon,
      tone: varianceTone,
    },
    {
      label: summary.usesRecordedWithdrawal ? 'Withdrawal paid' : 'Net maturity',
      value: formatCurrency(summary.netMaturityPayout),
      icon: Wallet,
      tone: 'accent',
      highlight: true,
    },
    {
      label: 'Paid installments',
      value: String(summary.paidInstallmentCount),
      icon: CheckCircle2,
      tone: 'default',
    },
    {
      label: 'Overdue',
      value: String(summary.overdueCount),
      icon: AlertTriangle,
      tone: 'danger',
    },
  ];

  const toneClasses: Record<string, string> = {
    accent: 'text-accent bg-accent/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    default: 'text-primary bg-surface',
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {items.map(({ label, value, icon: Icon, tone, highlight }) => (
        <div
          key={label}
          className={cn(
            'rounded-xl border border-border/80 bg-card p-3 shadow-sm transition-shadow sm:p-4',
            highlight && 'border-accent/30 ring-1 ring-accent/15',
          )}
        >
          <div className={cn('mb-2 inline-flex rounded-lg p-2 sm:mb-3', toneClasses[tone])}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
            {label}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-primary sm:mt-1 sm:text-xl">{value}</p>
        </div>
      ))}
    </div>
  );
}
