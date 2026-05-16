import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fetchAnalytics } from './analytics';

export interface ReportRow {
  id: string;
  label: string;
  sublabel?: string;
  amount?: number;
  date?: string;
  status?: string;
}

export async function fetchReportSummary() {
  const [analytics, collections, defaulters, matured, withdrawals] = await Promise.all([
    fetchAnalytics(),
    fetchMonthlyCollections(),
    fetchDefaulters(),
    fetchMaturedMembers(),
    fetchUpcomingWithdrawals(),
  ]);

  const totalCollected = analytics.byMonth.reduce((s, d) => s + d.amount, 0);

  return {
    totalCollected,
    defaulterCount: defaulters.length,
    maturedCount: matured.length,
    withdrawalPending: withdrawals.length,
    analytics,
  };
}

export async function fetchMonthlyCollections(month?: string): Promise<ReportRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*, chit:chits(category, type, person:persons(name, city))')
    .eq('status', 'paid')
    .order('paid_date', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((p) => {
      if (!month || !p.paid_date) return true;
      return p.paid_date.startsWith(month);
    })
    .map((p) => {
      const row = p as typeof p & {
        chit?: { category?: string; type?: string; person?: { name?: string; city?: string } };
      };
      return {
        id: p.id,
        label: row.chit?.person?.name ?? 'Unknown',
        sublabel: `#${p.installment_no} · ${row.chit?.category} · ${row.chit?.person?.city}`,
        amount: Number(p.advance_amount_paid ?? p.expected_amount),
        date: p.paid_date ? formatDate(p.paid_date) : undefined,
        status: p.status,
      };
    });
}

export async function fetchDefaulters(): Promise<ReportRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*, chit:chits(category, person:persons(name, phone, city))')
    .in('status', ['overdue', 'pending'])
    .order('installment_no');

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const row = p as typeof p & {
      chit?: { category?: string; person?: { name?: string; phone?: string; city?: string } };
    };
    return {
      id: p.id,
      label: row.chit?.person?.name ?? 'Unknown',
      sublabel: `#${p.installment_no} · ${row.chit?.person?.city ?? ''}`,
      amount: Number(p.expected_amount),
      status: p.status,
    };
  });
}

export async function fetchMaturedMembers(): Promise<ReportRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chits')
    .select('*, person:persons(name, city)')
    .eq('matured', true);

  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => {
    const row = c as typeof c & { person?: { name?: string; city?: string } };
    return {
      id: c.id,
      label: row.person?.name ?? 'Unknown',
      sublabel: `${c.type} · ${c.category} · ${row.person?.city}`,
      date: c.end_date ? formatDate(c.end_date) : undefined,
    };
  });
}

export async function fetchUpcomingWithdrawals(): Promise<ReportRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chits')
    .select('*, person:persons(name, city)')
    .eq('matured', true)
    .eq('withdrawal', false);

  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => {
    const row = c as typeof c & { person?: { name?: string; city?: string } };
    return {
      id: c.id,
      label: row.person?.name ?? 'Unknown',
      sublabel: `${c.type} · ${c.category} · ${row.person?.city}`,
    };
  });
}

export function reportRowsToExport(rows: ReportRow[]) {
  return rows.map((r) => [
    r.label,
    r.sublabel ?? '',
    r.amount != null ? formatCurrency(r.amount) : '',
    r.date ?? '',
    r.status ?? '',
  ]);
}
