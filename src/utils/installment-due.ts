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

export function isInstallmentDueInMonth(
  startDate: string,
  installmentNo: number,
  year: number,
  month: number,
): boolean {
  const due = getInstallmentDueDate(startDate, installmentNo);
  return due.getFullYear() === year && due.getMonth() === month;
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
