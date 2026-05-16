import { format } from 'date-fns';
import { chitTypeLabels } from '@/constants/chit-labels';
export interface DashboardChitRow {
  id: string;
  matured: boolean;
  withdrawal: boolean;
}
import {
  getRecordedAmount,
  getInstallmentVariance,
  hasRecordedPayment,
} from '@/utils/chit-payment-summary';
import { pendingAmount } from '@/utils/installment-due';
import {
  getCurrentMonthKey,
  isPaymentDueInMonth,
  parseMonthKey,
  toMonthKey,
  type PaymentWithChit,
} from '@/utils/payment-month';

export interface DashboardMonthKpis {
  totalChits: number;
  activeChits: number;
  maturedChits: number;
  withdrawnChits: number;
  collectedInMonth: number;
  expectedOnPaidInMonth: number;
  extraCollectedInMonth: number;
  shortfallInMonth: number;
  paymentsRecordedInMonth: number;
  installmentsDueInMonth: number;
  installmentsPaidInMonth: number;
  amountDueRemaining: number;
  dueChitsCount: number;
  overdueCount: number;
}

export interface VarianceMonthDatum {
  name: string;
  monthKey: string;
  extra: number;
  shortfall: number;
}

function isPaidInCalendarMonth(payment: PaymentWithChit, monthKey: string): boolean {
  if (!payment.paid_date || !hasRecordedPayment(payment)) return false;
  const { year, monthIndex } = parseMonthKey(monthKey);
  const d = new Date(payment.paid_date);
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}

export function computeDashboardMonthKpis(
  payments: PaymentWithChit[],
  chits: DashboardChitRow[],
  monthKey: string,
): DashboardMonthKpis {
  let collectedInMonth = 0;
  let expectedOnPaidInMonth = 0;
  let paymentsRecordedInMonth = 0;

  for (const payment of payments) {
    if (!isPaidInCalendarMonth(payment, monthKey)) continue;
    collectedInMonth += getRecordedAmount(payment);
    expectedOnPaidInMonth += Number(payment.expected_amount);
    paymentsRecordedInMonth++;
  }

  const extraCollectedInMonth = Math.max(0, collectedInMonth - expectedOnPaidInMonth);
  const shortfallInMonth = Math.max(0, expectedOnPaidInMonth - collectedInMonth);

  const dueInMonth = payments.filter((p) => isPaymentDueInMonth(p, monthKey));
  const dueChitIds = new Set<string>();
  let amountDueRemaining = 0;

  for (const payment of dueInMonth) {
    if (payment.status === 'paid') continue;
    dueChitIds.add(payment.chit_id);
    amountDueRemaining += pendingAmount(
      Number(payment.expected_amount),
      hasRecordedPayment(payment) ? getRecordedAmount(payment) : 0,
    );
  }

  return {
    totalChits: chits.length,
    activeChits: chits.filter((c) => !c.matured && !c.withdrawal).length,
    maturedChits: chits.filter((c) => c.matured && !c.withdrawal).length,
    withdrawnChits: chits.filter((c) => c.withdrawal).length,
    collectedInMonth,
    expectedOnPaidInMonth,
    extraCollectedInMonth,
    shortfallInMonth,
    paymentsRecordedInMonth,
    installmentsDueInMonth: dueInMonth.length,
    installmentsPaidInMonth: dueInMonth.filter((p) => p.status === 'paid').length,
    amountDueRemaining,
    dueChitsCount: dueChitIds.size,
    overdueCount: dueInMonth.filter((p) => p.status === 'overdue').length,
  };
}

export function buildVarianceTrend(payments: PaymentWithChit[]): VarianceMonthDatum[] {
  const byMonth = new Map<string, { extra: number; shortfall: number }>();

  for (const payment of payments) {
    if (!payment.paid_date || !hasRecordedPayment(payment)) continue;
    const key = payment.paid_date.slice(0, 7);
    const variance = getInstallmentVariance(payment);
    const bucket = byMonth.get(key) ?? { extra: 0, shortfall: 0 };
    if (variance > 0) bucket.extra += variance;
    else if (variance < 0) bucket.shortfall += Math.abs(variance);
    byMonth.set(key, bucket);
  }

  return [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([monthKey, { extra, shortfall }]) => ({
      monthKey,
      name: format(new Date(`${monthKey}-01`), 'MMM yy'),
      extra,
      shortfall,
    }));
}

export function filterCalendarMonthCollections(
  payments: PaymentWithChit[],
  monthKey: string,
): PaymentWithChit[] {
  return payments.filter((p) => isPaidInCalendarMonth(p, monthKey));
}

export function filterDueInMonth(
  payments: PaymentWithChit[],
  monthKey: string,
): PaymentWithChit[] {
  return payments.filter((p) => isPaymentDueInMonth(p, monthKey));
}

export function buildDashboardMonthOptions(payments: PaymentWithChit[]) {
  const keys = new Set<string>([getCurrentMonthKey()]);
  for (const payment of payments) {
    if (payment.paid_date) keys.add(payment.paid_date.slice(0, 7));
    const start = payment.chit?.start_date;
    if (start) {
      const due = new Date(start);
      due.setMonth(due.getMonth() + payment.installment_no - 1);
      keys.add(toMonthKey(due.getFullYear(), due.getMonth()));
    }
  }
  return [...keys]
    .sort()
    .reverse()
    .map((value) => ({
      value,
      label: format(new Date(`${value}-01`), 'MMMM yyyy'),
    }));
}

export function breakdownForCalendarMonth(
  payments: PaymentWithChit[],
  monthKey: string,
) {
  const byType = new Map<string, number>();
  const byCity = new Map<string, number>();
  const byCategory = new Map<string, number>();

  for (const payment of filterCalendarMonthCollections(payments, monthKey)) {
    const amt = getRecordedAmount(payment);
    const type = chitTypeLabels[payment.chit?.type ?? ''] ?? 'Unknown';
    byType.set(type, (byType.get(type) ?? 0) + amt);
    byCity.set(payment.chit?.person?.city ?? 'Unknown', (byCity.get(payment.chit?.person?.city ?? 'Unknown') ?? 0) + amt);
    const cat = payment.chit?.category ?? 'Other';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + amt);
  }

  const sortEntries = (map: Map<string, number>) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount }));

  return {
    byType: sortEntries(byType),
    byCity: sortEntries(byCity).slice(0, 8),
    byCategory: sortEntries(byCategory),
  };
}
