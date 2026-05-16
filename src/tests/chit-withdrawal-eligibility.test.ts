import { describe, expect, it } from '@jest/globals';
import { getChitWithdrawalEligibility } from '@/features/chits/chit-status';
import type { Payment } from '@/types/database';

function payment(status: Payment['status']): Payment {
  return {
    id: 'p1',
    chit_id: 'c1',
    installment_no: 1,
    expected_amount: 1000,
    maturity_amount: 50000,
    paid_date: status === 'pending' ? null : '2026-01-01',
    payment_mode: null,
    paid_to: null,
    advance_amount_paid: status === 'pending' ? 0 : 1000,
    amount_paid: status === 'pending' ? 0 : 1000,
    status,
    created_at: '',
    updated_at: '',
  };
}

describe('getChitWithdrawalEligibility', () => {
  const chit = { matured: false, withdrawal: false };

  it('blocks when no payments are recorded', () => {
    const result = getChitWithdrawalEligibility(
      [payment('pending'), payment('pending')],
      chit,
    );
    expect(result.canRecord).toBe(false);
    expect(result.disabledReason).toMatch(/at least one/i);
  });

  it('allows when payments exist but chit is not matured', () => {
    const result = getChitWithdrawalEligibility(
      Array.from({ length: 15 }, (_, i) =>
        payment('paid'),
      ),
      chit,
    );
    expect(result.canRecord).toBe(true);
  });

  it('blocks when withdrawal is already recorded', () => {
    const result = getChitWithdrawalEligibility([payment('paid')], {
      matured: true,
      withdrawal: true,
    });
    expect(result.canRecord).toBe(false);
    expect(result.disabledReason).toMatch(/already recorded/i);
  });

  it('allows when at least one payment exists', () => {
    const result = getChitWithdrawalEligibility(
      [payment('partial'), payment('pending')],
      chit,
    );
    expect(result.canRecord).toBe(true);
    expect(result.disabledReason).toBeUndefined();
  });
});
