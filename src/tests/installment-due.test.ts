import {
  chitEndDateFromStart,
  formatInstallmentDueMonth,
  getInstallmentDueDate,
  getInstallmentNumberForCalendarMonth,
  isCalendarMonthWithinChitPeriod,
  isInstallmentDueInMonth,
  pendingAmount,
} from '@/utils/installment-due';

describe('installment-due', () => {
  it('computes end date as start + 19 months', () => {
    expect(chitEndDateFromStart('2025-01-15')).toBe('2026-08-15');
  });

  it('formats installment due month as Mon YYYY', () => {
    expect(formatInstallmentDueMonth('2026-01-01', 5)).toBe('May 2026');
    expect(formatInstallmentDueMonth('2026-01-01', 6)).toBe('Jun 2026');
  });

  it('detects installment due month', () => {
    expect(isInstallmentDueInMonth('2025-01-01', 3, 2025, 2)).toBe(true);
    expect(isInstallmentDueInMonth('2025-01-01', 3, 2025, 0)).toBe(false);
  });

  it('maps calendar month to installment number', () => {
    expect(getInstallmentNumberForCalendarMonth('2025-01-01', '2025-01')).toBe(1);
    expect(getInstallmentNumberForCalendarMonth('2025-01-01', '2025-03')).toBe(3);
    expect(getInstallmentNumberForCalendarMonth('2025-01-01', '2024-12')).toBeNull();
    expect(getInstallmentNumberForCalendarMonth('2025-01-01', '2026-09')).toBeNull();
  });

  it('checks calendar month within chit start–end period', () => {
    expect(isCalendarMonthWithinChitPeriod('2025-06', '2025-01-01', '2026-08-01')).toBe(true);
    expect(isCalendarMonthWithinChitPeriod('2024-12', '2025-01-01', '2026-08-01')).toBe(false);
    expect(isCalendarMonthWithinChitPeriod('2026-09', '2025-01-01', '2026-08-01')).toBe(false);
    expect(isCalendarMonthWithinChitPeriod('2025-06', '2025-01-01', null)).toBe(true);
  });

  it('calculates pending amount after partial', () => {
    expect(pendingAmount(5000, 2000)).toBe(3000);
  });

  it('returns due date for installment', () => {
    const due = getInstallmentDueDate('2025-06-01', 2);
    expect(due.getMonth()).toBe(6);
    expect(due.getFullYear()).toBe(2025);
  });
});
