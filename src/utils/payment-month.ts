import { format } from 'date-fns';
import type { Payment, PaymentStatus } from '@/types/database';
import {
  chitEndDateFromStart,
  getInstallmentDueDate,
  getInstallmentNumberForCalendarMonth,
  isCalendarMonthWithinChitPeriod,
  isInstallmentDueInMonth,
  monthKeyToOrdinal,
} from '@/utils/installment-due';
import { getRecordedAmount, hasRecordedPayment } from '@/utils/chit-payment-summary';

export type PaymentWithChit = Payment & {
  chit?: {
    id?: string;
    type?: string;
    category?: string;
    start_date?: string | null;
    end_date?: string | null;
    matured?: boolean;
    withdrawal?: boolean;
    person?: { name?: string; name_tamil?: string; city?: string };
  };
};

export interface ChitForPayments {
  id: string;
  start_date: string | null;
  end_date: string | null;
  type?: string;
  category?: string;
  matured?: boolean;
  withdrawal?: boolean;
  person?: { name?: string; name_tamil?: string; city?: string };
}

/** Chit row from the chits table with nested payments rows for status lookup. */
export interface ChitWithSchedulePayments extends ChitForPayments {
  payments?: Payment[];
}

export interface MonthlyScheduledPaymentsResult {
  /** Scheduled rows for the month: schedule from chits, status from payments. */
  scheduled: PaymentWithChit[];
  scheduledCount: number;
  excludedNoStartDate: number;
  excludedOutsidePeriod: number;
  missingPaymentRow: number;
}

/** @deprecated Use MonthlyScheduledPaymentsResult */
export type MonthlyChitPaymentCoverage = MonthlyScheduledPaymentsResult & {
  payments: PaymentWithChit[];
  chitsInPeriod: number;
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

/** Build the month's collection list: schedule from chits, status from payments table. */
export function buildMonthlyScheduledPayments(
  chits: ChitWithSchedulePayments[],
  monthKey: string,
): MonthlyScheduledPaymentsResult {
  const scheduled: PaymentWithChit[] = [];
  let scheduledCount = 0;
  let excludedNoStartDate = 0;
  let excludedOutsidePeriod = 0;
  let missingPaymentRow = 0;

  for (const chit of chits) {
    if (!chit.start_date) {
      excludedNoStartDate++;
      continue;
    }

    if (!isCalendarMonthWithinChitPeriod(monthKey, chit.start_date, chit.end_date)) {
      excludedOutsidePeriod++;
      continue;
    }

    scheduledCount++;

    const installmentNo = getInstallmentNumberForCalendarMonth(chit.start_date, monthKey);
    if (installmentNo == null) {
      missingPaymentRow++;
      continue;
    }

    const paymentRow = chit.payments?.find((p) => p.installment_no === installmentNo);
    if (!paymentRow) {
      missingPaymentRow++;
      continue;
    }

    scheduled.push({
      ...paymentRow,
      chit_id: chit.id,
      chit: {
        id: chit.id,
        type: chit.type,
        category: chit.category,
        start_date: chit.start_date,
        end_date: chit.end_date,
        matured: chit.matured,
        withdrawal: chit.withdrawal,
        person: chit.person,
      },
    });
  }

  return {
    scheduled: sortPaymentsByStatus(scheduled),
    scheduledCount,
    excludedNoStartDate,
    excludedOutsidePeriod,
    missingPaymentRow,
  };
}

/** @deprecated Use buildMonthlyScheduledPayments with chits that include nested payments. */
export function buildMonthlyCollectionsFromChits(
  chits: ChitForPayments[],
  allPayments: PaymentWithChit[],
  monthKey: string,
): MonthlyScheduledPaymentsResult {
  const byChitId = new Map<string, PaymentWithChit[]>();
  for (const payment of allPayments) {
    const list = byChitId.get(payment.chit_id) ?? [];
    list.push(payment);
    byChitId.set(payment.chit_id, list);
  }

  const withPayments: ChitWithSchedulePayments[] = chits.map((chit) => ({
    ...chit,
    payments: byChitId.get(chit.id)?.map(({ chit: _c, ...payment }) => payment) ?? [],
  }));

  return buildMonthlyScheduledPayments(withPayments, monthKey);
}

/** @deprecated Use buildMonthlyScheduledPayments with chits from the chits table. */
export function buildPaymentsForActiveChitsInMonth(
  allPayments: PaymentWithChit[],
  monthKey: string,
): MonthlyScheduledPaymentsResult {
  const chits: ChitForPayments[] = [];
  const seen = new Set<string>();

  for (const payment of allPayments) {
    if (seen.has(payment.chit_id) || !payment.chit?.id) continue;
    seen.add(payment.chit_id);
    chits.push({
      id: payment.chit.id,
      start_date: payment.chit.start_date ?? null,
      end_date: payment.chit.end_date ?? null,
      type: payment.chit.type,
      category: payment.chit.category,
      matured: payment.chit.matured,
      withdrawal: payment.chit.withdrawal,
      person: payment.chit.person,
    });
  }

  return buildMonthlyCollectionsFromChits(chits, allPayments, monthKey);
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

export function buildMonthOptionsFromChits(
  chits: ChitForPayments[],
): { value: string; label: string }[] {
  const keys = new Set<string>([getCurrentMonthKey()]);

  for (const chit of chits) {
    if (!chit.start_date) continue;
    const endDate = chit.end_date ?? chitEndDateFromStart(chit.start_date);
    const startOrd = monthKeyToOrdinal(toMonthKeyFromDate(chit.start_date));
    const endOrd = monthKeyToOrdinal(toMonthKeyFromDate(endDate));

    for (let ord = startOrd; ord <= endOrd; ord++) {
      keys.add(ordinalToMonthKey(ord));
    }
  }

  return [...keys]
    .sort()
    .map((value) => ({ value, label: formatMonthLabel(value) }));
}

function toMonthKeyFromDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year}-${month}`;
}

function ordinalToMonthKey(ordinal: number): string {
  const year = Math.floor(ordinal / 12);
  const month = (ordinal % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
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
