import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import type { Loan, LoanRepayment } from '@/types/database';
import {
  buildYearOptions,
  computeLoanYearStats,
  computeYearProfitLoss,
  type LoanYearStats,
  type YearProfitLoss,
} from '@/utils/profit-loss-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

export interface ProfitLossBundle {
  loans: Loan[];
  repayments: LoanRepayment[];
  payments: PaymentWithChit[];
  yearOptions: number[];
}

export async function fetchProfitLossData(): Promise<ProfitLossBundle> {
  return supabaseRequest(async () => {
    const supabase = createClient();

    const [loansRes, repaymentsRes, paymentsRes] = await Promise.all([
      supabase
        .from('loans')
        .select('*, loan_from:persons(id, name, city)')
        .order('start_date', { ascending: false }),
      supabase.from('loan_repayments').select('*').order('repayment_date', { ascending: false }),
      supabase
        .from('payments')
        .select('expected_amount, advance_amount_paid, status, paid_date')
        .order('paid_date', { ascending: false }),
    ]);

    if (loansRes.error) throw new Error(loansRes.error.message);
    if (repaymentsRes.error) throw new Error(repaymentsRes.error.message);
    if (paymentsRes.error) throw new Error(paymentsRes.error.message);

    const loans = (loansRes.data ?? []).map((row) => ({
      ...row,
      principal: Number(row.principal),
      interest_rate: Number(row.interest_rate),
      interest_amount: row.interest_amount != null ? Number(row.interest_amount) : null,
      repayment_amount: row.repayment_amount != null ? Number(row.repayment_amount) : null,
    })) as Loan[];

    const repayments = (repaymentsRes.data ?? []).map((row) => ({
      ...row,
      principal_paid: Number(row.principal_paid),
      interest_paid: Number(row.interest_paid),
    })) as LoanRepayment[];

    const payments = (paymentsRes.data ?? []) as PaymentWithChit[];

    return {
      loans,
      repayments,
      payments,
      yearOptions: buildYearOptions(loans, payments, repayments),
    };
  });
}

export function getProfitLossForYear(
  bundle: ProfitLossBundle,
  year: number,
): { profitLoss: YearProfitLoss; loanStats: LoanYearStats } {
  return {
    profitLoss: computeYearProfitLoss(year, bundle.payments, bundle.loans, bundle.repayments),
    loanStats: computeLoanYearStats(bundle.loans, bundle.repayments, year),
  };
}
