import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
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

const PAGE_SIZE = 1000;

async function fetchAllPages<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => Promise<{ data: unknown[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw new Error(error.message);

    const pageRows = (data ?? []) as T[];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

export async function fetchEnterpriseData(
  selectedMonthKey?: string,
): Promise<EnterpriseDataBundle> {
  return supabaseRequest(async () => {
    const supabase = createClient();

    const [payments, chits, loans, repayments] = await Promise.all([
      fetchAllPages<PaymentWithChit>(async (from, to) =>
        await supabase
          .from('payments')
          .select(
            '*, chit:chits(id, type, category, start_date, end_date, matured, withdrawal, withdrawal_date, person_id, person:persons(id, name, name_tamil, city))',
          )
          .order('id', { ascending: true })
          .range(from, to),
      ),
      fetchAllPages<EnterpriseChitRow>(async (from, to) =>
        await supabase
          .from('chits')
          .select(
            'id, person_id, type, category, start_date, end_date, matured, withdrawal, withdrawal_date, collection_variance, withdrawal_net_amount, person:persons(name, name_tamil, city), payments(id, chit_id, installment_no, expected_amount, maturity_amount, paid_date, payment_mode, paid_to, advance_amount_paid, amount_paid, status, created_at, updated_at)',
          )
          .order('id', { ascending: true })
          .range(from, to),
      ),
      fetchAllPages<Loan>(async (from, to) =>
        await supabase.from('loans').select('*').order('id', { ascending: true }).range(from, to),
      ),
      fetchAllPages<LoanRepayment>(async (from, to) =>
        await supabase
          .from('loan_repayments')
          .select('*')
          .order('id', { ascending: true })
          .range(from, to),
      ),
    ]);

    const input: EnterpriseBundleInput = {
      payments,
      chits,
      loans,
      repayments,
    };

    return {
      ...input,
      dashboard: buildEnterpriseDashboardMetrics(input, selectedMonthKey),
      reports: buildEnterpriseReportsMetrics(input),
    };
  });
}
