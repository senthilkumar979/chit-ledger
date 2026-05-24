import { describe, expect, it } from '@jest/globals';
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('omits .00 for whole rupee amounts', () => {
    expect(formatCurrency(1245)).toBe('₹1,245');
    expect(formatCurrency(1245.0)).toBe('₹1,245');
    expect(formatCurrency(1245.004)).toBe('₹1,245');
  });

  it('shows two decimal places when paise are non-zero', () => {
    expect(formatCurrency(1245.5)).toBe('₹1,245.50');
    expect(formatCurrency(1245.05)).toBe('₹1,245.05');
  });
});
