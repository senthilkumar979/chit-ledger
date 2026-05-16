import { describe, expect, it } from '@jest/globals';
import { computePaymentStatus } from '@/utils/payment-status';

describe('computePaymentStatus', () => {
  it('returns pending when nothing paid', () => {
    expect(computePaymentStatus(5000, 0)).toBe('pending');
  });

  it('returns partial when under expected', () => {
    expect(computePaymentStatus(5000, 3000)).toBe('partial');
  });

  it('returns paid when full or over', () => {
    expect(computePaymentStatus(5000, 5000)).toBe('paid');
    expect(computePaymentStatus(5000, 6000)).toBe('paid');
  });
});
