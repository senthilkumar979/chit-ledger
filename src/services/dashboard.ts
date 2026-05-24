import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import { fetchAnalyticsData } from './analytics';
import type { PaymentWithChit } from '@/utils/payment-month';
import type { DashboardChitRow } from '@/utils/dashboard-metrics';

export interface DashboardDataBundle {
  payments: PaymentWithChit[];
  chits: DashboardChitRow[];
  analytics: Awaited<ReturnType<typeof fetchAnalyticsData>>;
}

export async function fetchDashboardData(): Promise<DashboardDataBundle> {
  return supabaseRequest(async () => {
    const supabase = createClient();

    const [paymentsRes, chitsRes, analytics] = await Promise.all([
      supabase
        .from('payments')
        .select(
          '*, chit:chits(id, type, category, start_date, matured, withdrawal, person:persons(name, city))',
        )
        .order('paid_date', { ascending: false }),
      supabase
        .from('chits')
        .select('id, matured, withdrawal, type, category, person:persons(name, city)'),
      fetchAnalyticsData(),
    ]);

    if (paymentsRes.error) throw new Error(paymentsRes.error.message);
    if (chitsRes.error) throw new Error(chitsRes.error.message);

    return {
      payments: (paymentsRes.data ?? []) as PaymentWithChit[],
      chits: (chitsRes.data ?? []) as DashboardChitRow[],
      analytics,
    };
  });
}
