import { INSTALLMENT_COUNT } from '@/constants/chit-config';

function parseLocalDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

/** Installment N is due in the month of start_date + (N - 1) months. */
export function getInstallmentDueDate(
  startDate: string,
  installmentNo: number,
): Date {
  const { year, month } = parseLocalDate(startDate);
  return new Date(year, month + installmentNo - 1, 1);
}

/** Calendar month key `YYYY-MM` → installment number (1–20), or null if before start / after schedule. */
export function getInstallmentNumberForCalendarMonth(
  startDate: string,
  monthKey: string,
): number | null {
  const { year: startYear, month: startMonth } = parseLocalDate(startDate);
  const [targetYear, targetMonth] = monthKey.split('-').map(Number);
  const monthsDiff = (targetYear - startYear) * 12 + (targetMonth - 1 - startMonth);
  if (monthsDiff < 0) return null;
  const installmentNo = monthsDiff + 1;
  if (installmentNo > INSTALLMENT_COUNT) return null;
  return installmentNo;
}

export function isInstallmentDueInMonth(
  startDate: string,
  installmentNo: number,
  year: number,
  month: number,
): boolean {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  return getInstallmentNumberForCalendarMonth(startDate, monthKey) === installmentNo;
}

export function addMonthsToDateString(startDate: string, months: number): string {
  const { year, month, day } = parseLocalDate(startDate);
  const end = new Date(year, month + months, day);
  const y = end.getFullYear();
  const m = String(end.getMonth() + 1).padStart(2, '0');
  const d = String(end.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Last installment (20) is due in start month + 19. */
export const CHIT_END_MONTHS_FROM_START = 19;

export function chitEndDateFromStart(startDate: string): string {
  return addMonthsToDateString(startDate, CHIT_END_MONTHS_FROM_START);
}

function dateToMonthOrdinal(dateStr: string): number {
  const { year, month } = parseLocalDate(dateStr);
  return year * 12 + month;
}

export function monthKeyToOrdinal(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number);
  return year * 12 + (month - 1);
}

/** True when the calendar month falls within the chit's start → end period (inclusive). */
export function isCalendarMonthWithinChitPeriod(
  monthKey: string,
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): boolean {
  if (!startDate) return false;
  const monthOrd = monthKeyToOrdinal(monthKey);
  const startOrd = dateToMonthOrdinal(startDate);
  const endOrd = dateToMonthOrdinal(endDate ?? chitEndDateFromStart(startDate));
  return monthOrd >= startOrd && monthOrd <= endOrd;
}

export function formatInstallmentDueMonth(
  startDate: string | null | undefined,
  installmentNo: number,
): string {
  if (!startDate) return '—';
  const due = getInstallmentDueDate(startDate, installmentNo);
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(due);
}

export function pendingAmount(expected: number, advance: number | null): number {
  const paid = Number(advance ?? 0);
  return Math.max(0, expected - paid);
}
