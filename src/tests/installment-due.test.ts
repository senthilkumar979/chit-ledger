import {
  chitEndDateFromStart,
  getInstallmentDueDate,
  isInstallmentDueInMonth,
  pendingAmount,
} from '@/utils/installment-due';

describe('installment-due', () => {
  it('computes end date as start + 20 months', () => {
    expect(chitEndDateFromStart('2025-01-15')).toBe('2026-09-15');
  });

  it('detects installment due month', () => {
    expect(isInstallmentDueInMonth('2025-01-01', 3, 2025, 2)).toBe(true);
    expect(isInstallmentDueInMonth('2025-01-01', 3, 2025, 0)).toBe(false);
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
