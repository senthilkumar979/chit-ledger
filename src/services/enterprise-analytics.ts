import { createClient } from '@/lib/supabase/client';
import type { Loan, LoanRepayment } from '@/types/database';
import type { PaymentWithChit } from '@/utils/payment-month';
import {
  buildEnterpriseDashboardMetrics,
  buildEnterpriseReportsMetrics,
  type EnterpriseBundleInput,
  type EnterpriseChitRow,
  type EnterpriseDashboardMetrics,
  type EnterpriseReportsMetrics,
} from '@/utils/enterprise-metrics';

export interface EnterpriseDataBundle extends EnterpriseBundleInput {
  dashboard: EnterpriseDashboardMetrics;
  reports: EnterpriseReportsMetrics;
}

export async function fetchEnterpriseData(
  selectedMonthKey?: string,
): Promise<EnterpriseDataBundle> {
  const supabase = createClient();

  const [paymentsRes, chitsRes, loansRes, repaymentsRes] = await Promise.all([
    supabase
      .from('payments')
      .select(
        '*, chit:chits(id, type, category, start_date, end_date, matured, withdrawal, withdrawal_date, person_id, person:persons(id, name, city))',
      )
      .order('paid_date', { ascending: false }),
    supabase
      .from('chits')
      .select(
        'id, person_id, type, category, start_date, end_date, matured, withdrawal, withdrawal_date, person:persons(name, city)',
      ),
    supabase.from('loans').select('*').order('start_date', { ascending: false }),
    supabase.from('loan_repayments').select('*').order('repayment_date', { ascending: false }),
  ]);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);
  if (chitsRes.error) throw new Error(chitsRes.error.message);
  if (loansRes.error) throw new Error(loansRes.error.message);
  if (repaymentsRes.error) throw new Error(repaymentsRes.error.message);

  const input: EnterpriseBundleInput = {
    payments: (paymentsRes.data ?? []) as PaymentWithChit[],
    chits: (chitsRes.data ?? []) as EnterpriseChitRow[],
    loans: (loansRes.data ?? []) as Loan[],
    repayments: (repaymentsRes.data ?? []) as LoanRepayment[],
  };

  return {
    ...input,
    dashboard: buildEnterpriseDashboardMetrics(input, selectedMonthKey),
    reports: buildEnterpriseReportsMetrics(input),
  };
}
