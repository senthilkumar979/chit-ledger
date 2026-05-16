import { createClient } from '@/lib/supabase/client';
import { fetchAnalytics, fetchCurrentMonthPending, fetchRecentActivity } from './analytics';

export async function fetchDashboardStats() {
  const supabase = createClient();
  const now = new Date();

  const [chitsRes, paymentsRes, pendingCollections, analytics, recentActivity] =
    await Promise.all([
      supabase.from('chits').select('id, matured', { count: 'exact' }),
      supabase.from('payments').select('expected_amount, status, paid_date, advance_amount_paid'),
      fetchCurrentMonthPending(),
      fetchAnalytics(),
      fetchRecentActivity(),
    ]);

  if (chitsRes.error) throw new Error(chitsRes.error.message);
  if (paymentsRes.error) throw new Error(paymentsRes.error.message);

  const chits = chitsRes.data ?? [];
  const payments = paymentsRes.data ?? [];

  const activeChits = chits.filter((c) => !c.matured).length;
  const maturedChits = chits.filter((c) => c.matured).length;
  const overdueAccounts = payments.filter((p) => p.status === 'overdue').length;

  const monthlyRevenue = payments
    .filter((p) => p.status === 'paid' && p.paid_date)
    .filter((p) => {
      const d = new Date(p.paid_date!);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + Number(p.advance_amount_paid ?? p.expected_amount), 0);

  return {
    activeChits,
    pendingCollections,
    monthlyRevenue,
    maturedChits,
    overdueAccounts,
    analytics,
    recentActivity,
  };
}
