import { describe, expect, it } from '@jest/globals';
import {
  formatAmountForEdit,
  formatAmountInputDisplay,
  parseAmountInput,
} from '@/utils/amount-input';

describe('amount-input', () => {
  it('formats display with Indian grouping', () => {
    expect(formatAmountInputDisplay(75840)).toBe('75,840.00');
  });

  it('parses grouped input', () => {
    expect(parseAmountInput('75,840.00')).toBe(75840);
    expect(parseAmountInput('')).toBeUndefined();
  });

  it('formats edit value without grouping', () => {
    expect(formatAmountForEdit(75840.5)).toBe('75840.5');
  });
});
