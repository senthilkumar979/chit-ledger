import { createClient } from '@/lib/supabase/client';
import { fetchAnalytics } from './analytics';
import {
  buildReportsBundle,
  type CollectionReportRow,
  type MaturedReportRow,
  type OutstandingReportRow,
  type PortfolioReportRow,
  type ReportsChitRow,
  type ReportsDataBundle,
} from '@/utils/report-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

export type {
  CollectionReportRow,
  MaturedReportRow,
  OutstandingReportRow,
  PortfolioReportRow,
  ReportsDataBundle,
} from '@/utils/report-metrics';

export async function fetchReportsData(): Promise<ReportsDataBundle> {
  const supabase = createClient();

  const [paymentsRes, chitsRes, analytics] = await Promise.all([
    supabase
      .from('payments')
      .select(
        '*, chit:chits(id, type, category, start_date, end_date, matured, withdrawal, person:persons(name, city))',
      )
      .order('paid_date', { ascending: false }),
    supabase
      .from('chits')
      .select(
        'id, matured, withdrawal, type, category, end_date, withdrawal_date, person:persons(name, city)',
      ),
    fetchAnalytics(),
  ]);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);
  if (chitsRes.error) throw new Error(chitsRes.error.message);

  return buildReportsBundle(
    (paymentsRes.data ?? []) as PaymentWithChit[],
    (chitsRes.data ?? []) as ReportsChitRow[],
    analytics,
  );
}
