import { describe, expect, it } from '@jest/globals';
import {
  ChitTypes,
  FIFTY_THOUSAND,
  INSTALLMENT_COUNT,
  ONE_LAKH,
  TWO_LAKH,
  getChitSchedule,
} from '@/constants/chit-config';

describe('chit-config', () => {
  it('has 20 installments per chit type', () => {
    expect(FIFTY_THOUSAND.payments).toHaveLength(INSTALLMENT_COUNT);
    expect(FIFTY_THOUSAND.maturity).toHaveLength(INSTALLMENT_COUNT);
    expect(ONE_LAKH.payments).toHaveLength(INSTALLMENT_COUNT);
    expect(ONE_LAKH.maturity).toHaveLength(INSTALLMENT_COUNT);
    expect(TWO_LAKH.payments).toHaveLength(INSTALLMENT_COUNT);
    expect(TWO_LAKH.maturity).toHaveLength(INSTALLMENT_COUNT);
  });

  it('returns correct schedule by type', () => {
    expect(getChitSchedule(ChitTypes.FIFTY_THOUSAND)).toBe(FIFTY_THOUSAND);
    expect(getChitSchedule(ChitTypes.ONE_LAKH)).toBe(ONE_LAKH);
    expect(getChitSchedule(ChitTypes.TWO_LAKH)).toBe(TWO_LAKH);
  });

  it('FIFTY_THOUSAND amounts are half of ONE_LAKH', () => {
    ONE_LAKH.payments.forEach((amount, i) => {
      expect(FIFTY_THOUSAND.payments[i]).toBe(amount / 2);
    });
    ONE_LAKH.maturity.forEach((amount, i) => {
      expect(FIFTY_THOUSAND.maturity[i]).toBe(amount / 2);
    });
  });

  it('uses decimal-safe amounts for TWO_LAKH', () => {
    expect(TWO_LAKH.payments[1]).toBe(8535);
    expect(TWO_LAKH.maturity[0]).toBe(163000);
  });
});
