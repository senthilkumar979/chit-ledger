import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import { chitTypeLabels } from '@/constants/chit-labels';
import { format } from 'date-fns';
import { getPrimaryPersonName } from '@/utils/person-display';
import {
  isInstallmentDueInMonth,
  pendingAmount,
} from '@/utils/installment-due';

export interface ChartDatum {
  name: string;
  amount: number;
}

export interface AnalyticsBundle {
  byMonth: ChartDatum[];
  byType: ChartDatum[];
  byCity: ChartDatum[];
  byCategory: ChartDatum[];
}

function collectedAmount(row: {
  advance_amount_paid: number | null;
  expected_amount: number;
}): number {
  const raw = row.advance_amount_paid;
  return raw != null && Number(raw) > 0 ? Number(raw) : 0;
}

interface PaymentRow {
  expected_amount: number;
  advance_amount_paid: number | null;
  status: string;
  paid_date: string | null;
  installment_no: number;
  chit?: {
    type?: string;
    category?: string;
    start_date?: string | null;
    person?: { city?: string };
  } | null;
}

async function fetchPaymentRows(): Promise<PaymentRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select(
      'expected_amount, advance_amount_paid, status, paid_date, installment_no, chit:chits(type, category, start_date, person:persons(city))',
    );

  if (error) throw new Error(error.message);
  return (data ?? []) as PaymentRow[];
}

function sumMap(map: Map<string, number>, key: string, value: number) {
  map.set(key, (map.get(key) ?? 0) + value);
}

export async function fetchAnalyticsData(): Promise<AnalyticsBundle> {
  const rows = await fetchPaymentRows();
  const byMonth = new Map<string, number>();
  const byType = new Map<string, number>();
  const byCity = new Map<string, number>();
  const byCategory = new Map<string, number>();

  for (const p of rows) {
    if (p.status !== 'paid' || !p.paid_date) continue;
    const amt = collectedAmount(p) || Number(p.expected_amount);
    const monthKey = p.paid_date.slice(0, 7);
    sumMap(byMonth, monthKey, amt);

    const type = chitTypeLabels[p.chit?.type ?? ''] ?? 'Unknown';
    sumMap(byType, type, amt);
    sumMap(byCity, p.chit?.person?.city ?? 'Unknown', amt);
    sumMap(byCategory, p.chit?.category ?? 'Other', amt);
  }

  const sortByAmount = (entries: [string, number][]) =>
    entries.sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount }));

  const monthEntries = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const recentMonths = monthEntries.slice(-8).map(([key, amount]) => ({
    name: format(new Date(`${key}-01`), 'MMM yyyy'),
    amount,
  }));

  return {
    byMonth: recentMonths,
    byType: sortByAmount([...byType.entries()]),
    byCity: sortByAmount([...byCity.entries()]).slice(0, 8),
    byCategory: sortByAmount([...byCategory.entries()]),
  };
}

export async function fetchAnalytics(): Promise<AnalyticsBundle> {
  return supabaseRequest(fetchAnalyticsData);
}

export async function fetchCurrentMonthPending(): Promise<number> {
  return supabaseRequest(async () => {
  const rows = await fetchPaymentRows();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return rows.reduce((sum, p) => {
    if (p.status === 'paid') return sum;
    const start = p.chit?.start_date;
    if (!start) return sum;
    if (!isInstallmentDueInMonth(start, p.installment_no, year, month)) return sum;
    return sum + pendingAmount(Number(p.expected_amount), p.advance_amount_paid);
  }, 0);
  });
}

export async function fetchRecentActivity() {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const { data } = await supabase
    .from('payments')
    .select('installment_no, paid_date, chit:chits(person:persons(name, name_tamil))')
    .eq('status', 'paid')
    .not('paid_date', 'is', null)
    .order('paid_date', { ascending: false })
    .limit(5);

  return (data ?? []).map((p, i) => {
    const row = p as typeof p & { chit?: { person?: { name?: string; name_tamil?: string } } };
    return {
      id: String(i),
      text: `Payment — ${getPrimaryPersonName(row.chit?.person, 'Member')} #${p.installment_no}`,
      time: p.paid_date ?? '',
    };
  });
  });
}
