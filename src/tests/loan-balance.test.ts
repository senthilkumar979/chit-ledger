import { describe, expect, it } from '@jest/globals';
import { summarizeLoanBalance } from '@/utils/loan-balance';
import type { Loan, LoanRepayment } from '@/types/database';

const baseLoan: Loan = {
  id: 'loan-1',
  loan_from_person_id: null,
  principal: 100_000,
  interest_rate: 0.01,
  interest_amount: null,
  repayment_amount: null,
  status: 'active',
  start_date: '2026-01-01',
  closed_date: null,
  notes: null,
  created_at: '',
  updated_at: '',
};

describe('summarizeLoanBalance', () => {
  it('tracks outstanding principal after partial repayments', () => {
    const repayments: LoanRepayment[] = [
      {
        id: 'r1',
        loan_id: 'loan-1',
        repayment_date: '2026-02-01',
        principal_paid: 30_000,
        interest_paid: 1_000,
        is_final: false,
        notes: null,
        created_at: '',
        updated_at: '',
      },
    ];

    const balance = summarizeLoanBalance(baseLoan, repayments);
    expect(balance.principalOutstanding).toBe(70_000);
    expect(balance.principalRepaid).toBe(30_000);
    expect(balance.interestPaidToDate).toBe(1_000);
    expect(balance.totalRepaidToDate).toBe(31_000);
    expect(balance.partialRepaymentCount).toBe(1);
    expect(balance.lastRepaymentDate).toBe('2026-02-01');
  });
});
