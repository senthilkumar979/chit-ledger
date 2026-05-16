import { describe, expect, it } from '@jest/globals';
import {
  ChitTypes,
  INSTALLMENT_COUNT,
  ONE_LAKH,
  TWO_LAKH,
  getChitSchedule,
} from '@/constants/chit-config';

describe('chit-config', () => {
  it('has 20 installments per chit type', () => {
    expect(ONE_LAKH.payments).toHaveLength(INSTALLMENT_COUNT);
    expect(ONE_LAKH.maturity).toHaveLength(INSTALLMENT_COUNT);
    expect(TWO_LAKH.payments).toHaveLength(INSTALLMENT_COUNT);
    expect(TWO_LAKH.maturity).toHaveLength(INSTALLMENT_COUNT);
  });

  it('returns correct schedule by type', () => {
    expect(getChitSchedule(ChitTypes.ONE_LAKH)).toBe(ONE_LAKH);
    expect(getChitSchedule(ChitTypes.TWO_LAKH)).toBe(TWO_LAKH);
  });

  it('uses decimal-safe amounts for TWO_LAKH', () => {
    expect(TWO_LAKH.payments[1]).toBe(4267.5);
    expect(TWO_LAKH.maturity[0]).toBe(81500);
  });
});
