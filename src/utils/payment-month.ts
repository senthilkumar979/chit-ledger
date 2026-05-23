import { format } from 'date-fns';
import type { Payment, PaymentStatus } from '@/types/database';
import { getInstallmentDueDate, isInstallmentDueInMonth } from '@/utils/installment-due';
import { getRecordedAmount, hasRecordedPayment } from '@/utils/chit-payment-summary';

export type PaymentWithChit = Payment & {
  chit?: {
    id?: string;
    type?: string;
    category?: string;
    start_date?: string | null;
    person?: { name?: string; city?: string };
  };
};

const STATUS_SORT_ORDER: Record<PaymentStatus, number> = {
  overdue: 0,
  pending: 1,
  partial: 2,
  paid: 3,
};

export function getCurrentMonthKey(): string {
  const now = new Date();
  return toMonthKey(now.getFullYear(), now.getMonth());
}

export function toMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function parseMonthKey(monthKey: string): { year: number; monthIndex: number } {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function formatMonthLabel(monthKey: string): string {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return format(new Date(year, monthIndex, 1), 'MMM yy');
}

export function getDueMonthKey(payment: PaymentWithChit): string | null {
  const start = payment.chit?.start_date;
  if (!start) return null;
  const due = getInstallmentDueDate(start, payment.installment_no);
  return toMonthKey(due.getFullYear(), due.getMonth());
}

export function isPaymentDueInMonth(payment: PaymentWithChit, monthKey: string): boolean {
  const start = payment.chit?.start_date;
  if (!start) return false;
  const { year, monthIndex } = parseMonthKey(monthKey);
  return isInstallmentDueInMonth(start, payment.installment_no, year, monthIndex);
}

export function filterPaymentsByMonth(
  payments: PaymentWithChit[],
  monthKey: string,
): PaymentWithChit[] {
  return payments.filter((p) => isPaymentDueInMonth(p, monthKey));
}

export type PaymentStatusFilter = '' | PaymentStatus;

export function filterPaymentsByStatus(
  payments: PaymentWithChit[],
  status: PaymentStatusFilter,
): PaymentWithChit[] {
  if (!status) return payments;
  return payments.filter((p) => p.status === status);
}

export function filterPaymentsByCity(
  payments: PaymentWithChit[],
  city: string,
): PaymentWithChit[] {
  if (!city) return payments;
  return payments.filter((p) => p.chit?.person?.city === city);
}

export function filterPaymentsByCategory(
  payments: PaymentWithChit[],
  category: string,
): PaymentWithChit[] {
  if (!category) return payments;
  return payments.filter((p) => p.chit?.category === category);
}

export function buildCityOptions(payments: PaymentWithChit[]): string[] {
  const cities = payments
    .map((p) => p.chit?.person?.city)
    .filter((c): c is string => Boolean(c));
  return [...new Set(cities)].sort();
}

export function buildCategoryOptions(payments: PaymentWithChit[]): string[] {
  const categories = payments
    .map((p) => p.chit?.category)
    .filter((c): c is string => Boolean(c));
  return [...new Set(categories)].sort();
}

export function sortPaymentsByStatus(payments: PaymentWithChit[]): PaymentWithChit[] {
  return [...payments].sort((a, b) => {
    const statusDiff = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.installment_no - b.installment_no;
  });
}

export interface PaymentsMonthStats {
  total: number;
  paid: number;
  pending: number;
  partial: number;
  overdue: number;
  collectedAmount: number;
}

/** Counts for installments due in the selected month (ignores list sub-filters). */
export function computePaymentsMonthStats(payments: PaymentWithChit[]): PaymentsMonthStats {
  return {
    total: payments.length,
    paid: payments.filter((p) => p.status === 'paid').length,
    pending: payments.filter((p) => p.status === 'pending').length,
    partial: payments.filter((p) => p.status === 'partial').length,
    overdue: payments.filter((p) => p.status === 'overdue').length,
    collectedAmount: payments.reduce(
      (sum, p) => sum + (hasRecordedPayment(p) ? getRecordedAmount(p) : 0),
      0,
    ),
  };
}

export function buildMonthOptions(payments: PaymentWithChit[]): { value: string; label: string }[] {
  const keys = new Set<string>([getCurrentMonthKey()]);
  for (const p of payments) {
    const key = getDueMonthKey(p);
    if (key) keys.add(key);
  }
  return [...keys]
    .sort()
    .map((value) => ({ value, label: formatMonthLabel(value) }));
}
