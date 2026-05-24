import { format, subMonths, startOfMonth, differenceInCalendarDays, endOfMonth } from 'date-fns';
import { chitTypeLabels } from '@/constants/chit-labels';
import {
  getRecordedAmount,
  getInstallmentVariance,
  hasRecordedPayment,
  summarizeChitPayments,
} from '@/utils/chit-payment-summary';
import { getInstallmentDueDate } from '@/utils/installment-due';
import { summarizeLoanBalance } from '@/utils/loan-balance';
import { roundMoney } from '@/utils/loan-calculations';
import { computeYearProfitLoss } from '@/utils/profit-loss-metrics';
import type { Loan, LoanRepayment, PaymentStatus } from '@/types/database';
import type { PaymentWithChit } from '@/utils/payment-month';
import { getCurrentMonthKey, parseMonthKey, toMonthKey } from '@/utils/payment-month';

export interface EnterpriseChitRow {
  id: string;
  person_id: string;
  type?: string;
  category?: string;
  start_date?: string | null;
  end_date?: string | null;
  matured: boolean;
  withdrawal: boolean;
  withdrawal_date?: string | null;
  person?: { name?: string; city?: string };
}

export interface EnterpriseBundleInput {
  payments: PaymentWithChit[];
  chits: EnterpriseChitRow[];
  loans: Loan[];
  repayments: LoanRepayment[];
}

export interface GrowthMetric {
  today: number;
  thisMonth: number;
  lastMonth: number;
  growthPct: number;
  sparkline: number[];
}

export interface OutstandingSnapshot {
  totalDue: number;
  overdue: number;
  partialPending: number;
  progressPct: number;
}

export interface ExecutiveSnapshot {
  cashCollected: GrowthMetric;
  outstanding: OutstandingSnapshot;
  netProfitMonth: number;
  netProfitYtd: number;
  loanExposure: {
    activeLoans: number;
    principalOutstanding: number;
    monthlyInterestBurden: number;
  };
  withdrawalLiability: {
    maturedNotWithdrawn: number;
    totalPayoutLiability: number;
  };
  cashPosition: {
    current: number;
    trend: { name: string; value: number }[];
  };
  profitWaterfall: { name: string; value: number }[];
}

export interface CashFlowMonth {
  monthKey: string;
  name: string;
  collections: number;
  loanRepayments: number;
  withdrawals: number;
}

export interface CollectionFunnel {
  expected: number;
  collected: number;
  shortfall: number;
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

export interface CollectionTrendMonth {
  name: string;
  monthKey: string;
  expected: number;
  actual: number;
  variance: number;
}

export interface MemberLeaderboardRow {
  personId: string;
  name: string;
  city: string;
  totalPaid: number;
  totalVariance: number;
  chitCount: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskMemberRow {
  personId: string;
  name: string;
  city: string;
  outstanding: number;
  missedInstallments: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface ChitTypeSlice {
  type: string;
  label: string;
  count: number;
  revenue: number;
  avgVariance: number;
}

export interface MaturityBucket {
  label: string;
  count: number;
  liability: number;
}

export interface CityGeoRow {
  city: string;
  revenue: number;
  riskScore: number;
  memberCount: number;
}

export interface ScheduleCompareRow {
  schedule: string;
  count: number;
  revenue: number;
}

export interface ChitPortfolioBar {
  label: string;
  key: 'total' | 'active' | 'matured' | 'withdrawn';
  count: number;
  fill: string;
}

export interface GeographicChitRow {
  city: string;
  total: number;
  active: number;
  matured: number;
  withdrawn: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

export interface EnterpriseDashboardMetrics {
  executive: ExecutiveSnapshot;
  cashFlow: CashFlowMonth[];
  funnel: CollectionFunnel;
  aging: AgingBucket[];
  collectionTrend: CollectionTrendMonth[];
  topMembers: MemberLeaderboardRow[];
  riskMembers: RiskMemberRow[];
  chitTypes: ChitTypeSlice[];
  maturityPipeline: MaturityBucket[];
  cities: CityGeoRow[];
  scheduleComparison: ScheduleCompareRow[];
  chitPortfolio: ChitPortfolioBar[];
  geographicChits: GeographicChitRow[];
  alerts: DashboardAlert[];
}

export interface MonthlyPnLRow {
  monthKey: string;
  name: string;
  revenue: number;
  loanInterest: number;
  profit: number;
}

export interface MemberRevenueRow {
  personId: string;
  member: string;
  city: string;
  chits: number;
  totalPaid: number;
  outstanding: number;
  variance: number;
  profitContribution: number;
}

export interface CohortCell {
  cohortMonth: string;
  installment: number;
  completionPct: number;
}

export interface OperationalKpis {
  avgCollectionDelayDays: number;
  avgWithdrawalDelayDays: number;
  avgMaturityMonths: number;
  paymentSuccessRate: number;
}

export interface EnterpriseReportsMetrics {
  monthlyPnL: MonthlyPnLRow[];
  profitTrend: { name: string; profit: number }[];
  memberRevenue: MemberRevenueRow[];
  pareto: { name: string; cumulativePct: number; revenue: number }[];
  cohortHeatmap: CohortCell[];
  varianceHistogram: { bucket: string; count: number }[];
  debtTimeline: { name: string; principal: number; interest: number; repayments: number }[];
  interestLeakage: { monthKey: string; name: string; pctOfRevenue: number }[];
  operational: OperationalKpis;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function collectedInMonth(payments: PaymentWithChit[], monthKey: string): number {
  let sum = 0;
  for (const p of payments) {
    if (!hasRecordedPayment(p) || !p.paid_date) continue;
    if (!p.paid_date.startsWith(monthKey)) continue;
    sum += getRecordedAmount(p);
  }
  return round(sum);
}

function collectedOnDate(payments: PaymentWithChit[], dateKey: string): number {
  let sum = 0;
  for (const p of payments) {
    if (!hasRecordedPayment(p) || p.paid_date !== dateKey) continue;
    sum += getRecordedAmount(p);
  }
  return round(sum);
}

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  let cursor = startOfMonth(new Date());
  for (let i = 0; i < n; i++) {
    keys.unshift(toMonthKey(cursor.getFullYear(), cursor.getMonth()));
    cursor = subMonths(cursor, 1);
  }
  return keys;
}

function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return round(((current - previous) / previous) * 100);
}

function daysOverdue(payment: PaymentWithChit, today = new Date()): number {
  const start = payment.chit?.start_date;
  if (!start || payment.status === 'paid') return 0;
  const dueEnd = endOfMonth(getInstallmentDueDate(start, payment.installment_no));
  if (dueEnd >= today) return 0;
  return differenceInCalendarDays(today, dueEnd);
}

function riskLevel(score: number): RiskLevel {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export function buildEnterpriseDashboardMetrics(
  input: EnterpriseBundleInput,
  selectedMonthKey?: string,
): EnterpriseDashboardMetrics {
  const { payments, chits, loans, repayments } = input;
  const monthKey = selectedMonthKey ?? getCurrentMonthKey();
  const { year, monthIndex } = parseMonthKey(monthKey);
  const prevMonth = subMonths(new Date(year, monthIndex, 1), 1);
  const prevMonthKey = toMonthKey(prevMonth.getFullYear(), prevMonth.getMonth());
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  const monthKeys12 = lastNMonthKeys(12);
  const sparkline = monthKeys12.map((k) => collectedInMonth(payments, k));

  const thisMonth = collectedInMonth(payments, monthKey);
  const lastMonth = collectedInMonth(payments, prevMonthKey);

  let totalDue = 0;
  let overdueAmt = 0;
  let partialPending = 0;
  const agingMap = new Map<string, { amount: number; count: number }>([
    ['Current', { amount: 0, count: 0 }],
    ['1–30 days', { amount: 0, count: 0 }],
    ['31–60 days', { amount: 0, count: 0 }],
    ['61–90 days', { amount: 0, count: 0 }],
    ['90+ days', { amount: 0, count: 0 }],
  ]);

  for (const p of payments) {
    if (p.status === 'paid') continue;
    const expected = Number(p.expected_amount);
    const collected = getRecordedAmount(p);
    const pending = Math.max(0, expected - collected);
    if (pending <= 0) continue;
    totalDue += pending;
    if (p.status === 'overdue') overdueAmt += pending;
    if (p.status === 'partial') partialPending += pending;

    const days = daysOverdue(p);
    let bucket = 'Current';
    if (days > 90) bucket = '90+ days';
    else if (days > 60) bucket = '61–90 days';
    else if (days > 30) bucket = '31–60 days';
    else if (days > 0) bucket = '1–30 days';
    const b = agingMap.get(bucket)!;
    b.amount += pending;
    b.count += 1;
    agingMap.set(bucket, b);
  }

  const progressPct = totalDue > 0 ? round((1 - overdueAmt / totalDue) * 100) : 100;

  const calendarYear = new Date().getFullYear();
  const ytdPl = computeYearProfitLoss(calendarYear, payments, loans, repayments);
  const monthInterest = repayments
    .filter((r) => r.repayment_date.startsWith(monthKey))
    .reduce((s, r) => s + Number(r.interest_paid), 0);
  const netProfitMonth = round(collectedInMonth(payments, monthKey) - monthInterest);

  const activeLoans = loans.filter((l) => l.status === 'active');
  let principalOutstanding = 0;
  let monthlyInterestBurden = 0;
  for (const loan of activeLoans) {
    const balance = summarizeLoanBalance(
      loan,
      repayments.filter((r) => r.loan_id === loan.id),
    );
    principalOutstanding += balance.principalOutstanding;
    monthlyInterestBurden += roundMoney(
      balance.principalOutstanding * (Number(loan.interest_rate) / 100),
    );
  }

  const byChitPayments = new Map<string, PaymentWithChit[]>();
  for (const p of payments) {
    const list = byChitPayments.get(p.chit_id) ?? [];
    list.push(p);
    byChitPayments.set(p.chit_id, list);
  }

  let maturedNotWithdrawn = 0;
  let totalPayoutLiability = 0;
  for (const chit of chits) {
    if (!chit.matured || chit.withdrawal) continue;
    maturedNotWithdrawn++;
    const summary = summarizeChitPayments(byChitPayments.get(chit.id) ?? []);
    totalPayoutLiability += summary.netMaturityPayout;
  }

  const cashFlow: CashFlowMonth[] = monthKeys12.map((mk) => {
    const collections = collectedInMonth(payments, mk);
    let loanRep = 0;
    let withdrawals = 0;
    for (const r of repayments) {
      if (r.repayment_date.startsWith(mk)) {
        loanRep += Number(r.principal_paid) + Number(r.interest_paid);
      }
    }
    for (const chit of chits) {
      if (chit.withdrawal_date?.startsWith(mk)) {
        const summary = summarizeChitPayments(byChitPayments.get(chit.id) ?? []);
        withdrawals += summary.netMaturityPayout;
      }
    }
    return {
      monthKey: mk,
      name: format(new Date(`${mk}-01`), 'MMM yy'),
      collections,
      loanRepayments: round(loanRep),
      withdrawals: round(withdrawals),
    };
  });

  const cashTrend = cashFlow.map((m) => ({
    name: m.name,
    value: round(m.collections - m.withdrawals - m.loanRepayments),
  }));

  const funnelExpected = payments
    .filter((p) => isPaymentDueInSelectedMonth(p, monthKey))
    .reduce((s, p) => s + Number(p.expected_amount), 0);
  const funnelCollected = payments
    .filter((p) => isPaymentDueInSelectedMonth(p, monthKey) && hasRecordedPayment(p))
    .reduce((s, p) => s + getRecordedAmount(p), 0);

  const collectionTrend: CollectionTrendMonth[] = monthKeys12.map((mk) => {
    const expected = payments
      .filter((p) => isPaymentDueInSelectedMonth(p, mk))
      .reduce((s, p) => s + Number(p.expected_amount), 0);
    const actual = collectedInMonth(payments, mk);
    return {
      monthKey: mk,
      name: format(new Date(`${mk}-01`), 'MMM yy'),
      expected: round(expected),
      actual,
      variance: round(actual - expected),
    };
  });

  const memberMap = aggregateMembers(payments, chits);
  const topMembers = [...memberMap.values()]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  const riskMembers = [...memberMap.values()]
    .map((m) => {
      const score = Math.min(
        100,
        m.overdueCount * 20 + m.partialCount * 10 + (m.shortfall > 0 ? 25 : 0),
      );
      return {
        personId: m.personId,
        name: m.name,
        city: m.city,
        outstanding: m.outstanding,
        missedInstallments: m.overdueCount + m.partialCount,
        riskScore: score,
        riskLevel: riskLevel(score),
      };
    })
    .filter((m) => m.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 15);

  const typeMap = new Map<string, { count: number; revenue: number; varianceSum: number }>();
  for (const chit of chits) {
    const type = chit.type ?? 'ONE_LAKH';
    const summary = summarizeChitPayments(byChitPayments.get(chit.id) ?? []);
    const bucket = typeMap.get(type) ?? { count: 0, revenue: 0, varianceSum: 0 };
    bucket.count++;
    bucket.revenue += summary.totalCollected;
    bucket.varianceSum += summary.collectionVariance;
    typeMap.set(type, bucket);
  }

  const chitTypes: ChitTypeSlice[] = [...typeMap.entries()].map(([type, v]) => ({
    type,
    label: chitTypeLabels[type] ?? type,
    count: v.count,
    revenue: round(v.revenue),
    avgVariance: v.count ? round(v.varianceSum / v.count) : 0,
  }));

  const maturityPipeline = buildMaturityPipeline(chits, byChitPayments);
  const cities = buildCityMetrics(memberMap);
  const scheduleComparison = buildScheduleComparison(chits, byChitPayments);
  const chitPortfolio = buildChitPortfolioBars(chits);
  const geographicChits = buildGeographicChits(chits);
  const alerts = buildAlerts(payments, chits, loans, principalOutstanding, totalPayoutLiability);

  return {
    executive: {
      cashCollected: {
        today: collectedOnDate(payments, todayKey),
        thisMonth,
        lastMonth,
        growthPct: growthPct(thisMonth, lastMonth),
        sparkline,
      },
      outstanding: {
        totalDue: round(totalDue),
        overdue: round(overdueAmt),
        partialPending: round(partialPending),
        progressPct,
      },
      netProfitMonth: netProfitMonth,
      netProfitYtd: ytdPl.netProfit,
      loanExposure: {
        activeLoans: activeLoans.length,
        principalOutstanding: round(principalOutstanding),
        monthlyInterestBurden: round(monthlyInterestBurden),
      },
      withdrawalLiability: {
        maturedNotWithdrawn,
        totalPayoutLiability: round(totalPayoutLiability),
      },
      cashPosition: { current: cashTrend[cashTrend.length - 1]?.value ?? 0, trend: cashTrend },
      profitWaterfall: [
        { name: 'Revenue', value: ytdPl.chitRevenue },
        { name: 'Interest', value: -ytdPl.loanInterestExpense },
        { name: 'Net', value: ytdPl.netProfit },
      ],
    },
    cashFlow,
    funnel: {
      expected: round(funnelExpected),
      collected: round(funnelCollected),
      shortfall: round(Math.max(0, funnelExpected - funnelCollected)),
    },
    aging: [...agingMap.entries()].map(([label, v]) => ({
      label,
      amount: round(v.amount),
      count: v.count,
    })),
    collectionTrend,
    topMembers,
    riskMembers,
    chitTypes,
    maturityPipeline,
    cities,
    scheduleComparison,
    chitPortfolio,
    geographicChits,
    alerts,
  };
}

function classifyChitLifecycle(chit: EnterpriseChitRow): 'active' | 'matured' | 'withdrawn' {
  if (chit.withdrawal) return 'withdrawn';
  if (chit.matured) return 'matured';
  return 'active';
}

function buildScheduleComparison(
  chits: EnterpriseChitRow[],
  byChit: Map<string, PaymentWithChit[]>,
): ScheduleCompareRow[] {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const chit of chits) {
    const schedule = chit.category?.trim() || 'Unspecified';
    const summary = summarizeChitPayments(byChit.get(chit.id) ?? []);
    const bucket = map.get(schedule) ?? { count: 0, revenue: 0 };
    bucket.count++;
    bucket.revenue += summary.totalCollected;
    map.set(schedule, bucket);
  }
  return [...map.entries()]
    .map(([schedule, v]) => ({
      schedule,
      count: v.count,
      revenue: round(v.revenue),
    }))
    .sort((a, b) => b.count - a.count);
}

function buildChitPortfolioBars(chits: EnterpriseChitRow[]): ChitPortfolioBar[] {
  const counts = { active: 0, matured: 0, withdrawn: 0 };
  for (const chit of chits) counts[classifyChitLifecycle(chit)]++;

  return [
    { label: 'Total', key: 'total', count: chits.length, fill: '#64748B' },
    { label: 'Active', key: 'active', count: counts.active, fill: '#16A34A' },
    { label: 'Matured', key: 'matured', count: counts.matured, fill: '#0284C7' },
    { label: 'Withdrawn', key: 'withdrawn', count: counts.withdrawn, fill: '#DC2626' },
  ];
}

function buildGeographicChits(chits: EnterpriseChitRow[]): GeographicChitRow[] {
  const map = new Map<string, GeographicChitRow>();
  for (const chit of chits) {
    const city = chit.person?.city?.trim() || 'Unknown';
    const row = map.get(city) ?? { city, total: 0, active: 0, matured: 0, withdrawn: 0 };
    row.total++;
    row[classifyChitLifecycle(chit)]++;
    map.set(city, row);
  }
  return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 12);
}

function isPaymentDueInSelectedMonth(payment: PaymentWithChit, monthKey: string): boolean {
  const start = payment.chit?.start_date;
  if (!start) return false;
  const { year, monthIndex } = parseMonthKey(monthKey);
  const due = getInstallmentDueDate(start, payment.installment_no);
  return due.getFullYear() === year && due.getMonth() === monthIndex;
}

interface MemberAgg {
  personId: string;
  name: string;
  city: string;
  totalPaid: number;
  totalVariance: number;
  chitCount: number;
  outstanding: number;
  overdueCount: number;
  partialCount: number;
  shortfall: number;
}

function aggregateMembers(
  payments: PaymentWithChit[],
  chits: EnterpriseChitRow[],
): Map<string, MemberAgg> {
  const map = new Map<string, MemberAgg>();
  const chitToPerson = new Map(chits.map((c) => [c.id, c.person_id]));

  for (const chit of chits) {
    const id = chit.person_id;
    if (!map.has(id)) {
      map.set(id, {
        personId: id,
        name: chit.person?.name ?? 'Unknown',
        city: chit.person?.city ?? '-',
        totalPaid: 0,
        totalVariance: 0,
        chitCount: 0,
        outstanding: 0,
        overdueCount: 0,
        partialCount: 0,
        shortfall: 0,
      });
    }
    const m = map.get(id)!;
    m.chitCount++;
  }

  for (const p of payments) {
    const personId = chitToPerson.get(p.chit_id);
    if (!personId) continue;
    const m = map.get(personId);
    if (!m) continue;

    if (hasRecordedPayment(p)) {
      m.totalPaid += getRecordedAmount(p);
      const v = getInstallmentVariance(p);
      m.totalVariance += v;
      if (v < 0) m.shortfall += Math.abs(v);
    }
    if (p.status === 'overdue') m.overdueCount++;
    if (p.status === 'partial') m.partialCount++;
    if (p.status !== 'paid') {
      m.outstanding += Math.max(0, Number(p.expected_amount) - getRecordedAmount(p));
    }
  }

  return map;
}

function buildMaturityPipeline(
  chits: EnterpriseChitRow[],
  byChit: Map<string, PaymentWithChit[]>,
): MaturityBucket[] {
  const buckets: MaturityBucket[] = [
    { label: '0–30 days', count: 0, liability: 0 },
    { label: '31–60 days', count: 0, liability: 0 },
    { label: '61–90 days', count: 0, liability: 0 },
    { label: '90+ days', count: 0, liability: 0 },
  ];
  const today = new Date();

  for (const chit of chits) {
    if (!chit.matured || chit.withdrawal) continue;
    const end = chit.end_date ? new Date(chit.end_date) : today;
    const days = differenceInCalendarDays(today, end);
    const payout = summarizeChitPayments(byChit.get(chit.id) ?? []).netMaturityPayout;
    let idx = 0;
    if (days > 90) idx = 3;
    else if (days > 60) idx = 2;
    else if (days > 30) idx = 1;
    buckets[idx].count++;
    buckets[idx].liability += payout;
  }

  return buckets.map((b) => ({ ...b, liability: round(b.liability) }));
}

function buildCityMetrics(members: Map<string, MemberAgg>): CityGeoRow[] {
  const byCity = new Map<string, { revenue: number; risk: number; count: number }>();
  for (const m of members.values()) {
    const c = byCity.get(m.city) ?? { revenue: 0, risk: 0, count: 0 };
    c.revenue += m.totalPaid;
    c.risk += m.overdueCount * 10 + m.partialCount * 5;
    c.count++;
    byCity.set(m.city, c);
  }
  return [...byCity.entries()]
    .map(([city, v]) => ({
      city,
      revenue: round(v.revenue),
      riskScore: v.count ? Math.min(100, Math.round(v.risk / v.count)) : 0,
      memberCount: v.count,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12);
}

function buildAlerts(
  payments: PaymentWithChit[],
  chits: EnterpriseChitRow[],
  loans: Loan[],
  principalOutstanding: number,
  payoutLiability: number,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const overdue60 = payments.filter((p) => daysOverdue(p) > 60 && p.status !== 'paid').length;
  if (overdue60 > 0) {
    alerts.push({
      id: 'overdue-60',
      severity: 'critical',
      title: `${overdue60} installments overdue 60+ days`,
      description: 'Prioritize follow-up on long-pending collections.',
      actionLabel: 'View payments',
      href: '/payments?status=overdue',
    });
  }
  if (principalOutstanding > 500000) {
    alerts.push({
      id: 'loan-burden',
      severity: 'warning',
      title: 'High loan principal outstanding',
      description: `₹${(principalOutstanding / 100000).toFixed(1)}L principal still active.`,
      actionLabel: 'Review loans',
      href: '/loans',
    });
  }
  const pendingWd = chits.filter((c) => c.matured && !c.withdrawal).length;
  if (pendingWd > 0) {
    alerts.push({
      id: 'withdrawal-pending',
      severity: 'warning',
      title: `${pendingWd} matured chits awaiting withdrawal`,
      description: `Estimated liability ₹${(payoutLiability / 100000).toFixed(1)}L.`,
      actionLabel: 'View matured',
      href: '/reports',
    });
  }
  const repeatPartial = payments.filter((p) => p.status === 'partial').length;
  if (repeatPartial >= 5) {
    alerts.push({
      id: 'partial-payments',
      severity: 'info',
      title: `${repeatPartial} partial payments active`,
      description: 'Members with incomplete installments need monitoring.',
      actionLabel: 'View partial',
      href: '/payments?status=partial',
    });
  }
  return alerts;
}

export function buildEnterpriseReportsMetrics(input: EnterpriseBundleInput): EnterpriseReportsMetrics {
  const { payments, chits, loans, repayments } = input;
  const monthKeys12 = lastNMonthKeys(12);
  const year = new Date().getFullYear();

  const monthlyPnL: MonthlyPnLRow[] = monthKeys12.map((mk) => {
    const y = Number(mk.slice(0, 4));
    const revenue = collectedInMonth(payments, mk);
    const loanInterest = loans.reduce((s, loan) => {
      const paid = repayments
        .filter((r) => r.loan_id === loan.id && r.repayment_date.startsWith(mk))
        .reduce((sum, r) => sum + Number(r.interest_paid), 0);
      return s + paid;
    }, 0);
    return {
      monthKey: mk,
      name: format(new Date(`${mk}-01`), 'MMM yy'),
      revenue,
      loanInterest: round(loanInterest),
      profit: round(revenue - loanInterest),
    };
  });

  const profitTrend = monthlyPnL.map((m) => ({ name: m.name, profit: m.profit }));

  const members = aggregateMembers(payments, chits);
  const memberRevenue: MemberRevenueRow[] = [...members.values()]
    .map((m) => ({
      personId: m.personId,
      member: m.name,
      city: m.city,
      chits: m.chitCount,
      totalPaid: round(m.totalPaid),
      outstanding: round(m.outstanding),
      variance: round(m.totalVariance),
      profitContribution: round(m.totalPaid - m.shortfall),
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid);

  const totalRev = memberRevenue.reduce((s, m) => s + m.totalPaid, 0);
  let cumulative = 0;
  const pareto = memberRevenue.slice(0, 20).map((m) => {
    cumulative += m.totalPaid;
    return {
      name: m.member,
      revenue: m.totalPaid,
      cumulativePct: totalRev ? round((cumulative / totalRev) * 100) : 0,
    };
  });

  const cohortHeatmap = buildCohortHeatmap(chits, payments);
  const varianceHistogram = buildVarianceHistogram(chits, payments);

  const debtTimeline = monthKeys12.map((mk) => {
    let principal = 0;
    let interest = 0;
    let repaid = 0;
    for (const loan of loans) {
      if (loan.start_date.startsWith(mk)) principal += Number(loan.principal);
    }
    for (const r of repayments) {
      if (!r.repayment_date.startsWith(mk)) continue;
      repaid += Number(r.principal_paid) + Number(r.interest_paid);
      interest += Number(r.interest_paid);
    }
    return {
      name: format(new Date(`${mk}-01`), 'MMM yy'),
      principal: round(principal),
      interest: round(interest),
      repayments: round(repaid),
    };
  });

  const interestLeakage = monthlyPnL.map((m) => ({
    monthKey: m.monthKey,
    name: m.name,
    pctOfRevenue: m.revenue > 0 ? round((m.loanInterest / m.revenue) * 100) : 0,
  }));

  const operational = computeOperationalKpis(payments, chits);

  return {
    monthlyPnL,
    profitTrend,
    memberRevenue,
    pareto,
    cohortHeatmap,
    varianceHistogram,
    debtTimeline,
    interestLeakage,
    operational,
  };
}

function buildCohortHeatmap(
  chits: EnterpriseChitRow[],
  payments: PaymentWithChit[],
): CohortCell[] {
  const byChit = new Map<string, PaymentWithChit[]>();
  for (const p of payments) {
    const list = byChit.get(p.chit_id) ?? [];
    list.push(p);
    byChit.set(p.chit_id, list);
  }

  const cells: CohortCell[] = [];
  const cohorts = new Map<string, EnterpriseChitRow[]>();
  for (const chit of chits) {
    if (!chit.start_date) continue;
    const cohort = chit.start_date.slice(0, 7);
    const list = cohorts.get(cohort) ?? [];
    list.push(chit);
    cohorts.set(cohort, list);
  }

  for (const [cohortMonth, cohortChits] of cohorts) {
    for (let inst = 1; inst <= 20; inst++) {
      let paid = 0;
      let total = 0;
      for (const chit of cohortChits) {
        const p = byChit.get(chit.id)?.find((x) => x.installment_no === inst);
        if (!p) continue;
        total++;
        if (p.status === 'paid') paid++;
        else if (hasRecordedPayment(p)) paid += 0.5;
      }
      if (total === 0) continue;
      cells.push({
        cohortMonth,
        installment: inst,
        completionPct: round((paid / total) * 100),
      });
    }
  }
  return cells;
}

function buildVarianceHistogram(
  chits: EnterpriseChitRow[],
  payments: PaymentWithChit[],
): { bucket: string; count: number }[] {
  const buckets = [
    { bucket: '< −10k', min: -Infinity, max: -10000, count: 0 },
    { bucket: '−10k to 0', min: -10000, max: 0, count: 0 },
    { bucket: '0 to 10k', min: 0, max: 10000, count: 0 },
    { bucket: '> 10k', min: 10000, max: Infinity, count: 0 },
  ];
  const byChit = new Map<string, PaymentWithChit[]>();
  for (const p of payments) {
    const list = byChit.get(p.chit_id) ?? [];
    list.push(p);
    byChit.set(p.chit_id, list);
  }
  for (const chit of chits) {
    const v = summarizeChitPayments(byChit.get(chit.id) ?? []).collectionVariance;
    const b = buckets.find((x) => v > x.min && v <= x.max) ?? buckets[2];
    b.count++;
  }
  return buckets.map(({ bucket, count }) => ({ bucket, count }));
}

function computeOperationalKpis(
  payments: PaymentWithChit[],
  chits: EnterpriseChitRow[],
): OperationalKpis {
  let delaySum = 0;
  let delayCount = 0;
  let wdSum = 0;
  let wdCount = 0;
  let maturitySum = 0;
  let maturityCount = 0;
  let success = 0;
  let attempts = 0;

  for (const p of payments) {
    if (p.status === 'paid' || p.status === 'partial' || p.status === 'overdue' || p.status === 'pending') {
      attempts++;
      if (p.status === 'paid') success++;
    }
    if (p.status === 'paid' && p.paid_date && p.chit?.start_date) {
      const due = getInstallmentDueDate(p.chit.start_date, p.installment_no);
      delaySum += Math.max(0, differenceInCalendarDays(new Date(p.paid_date), endOfMonth(due)));
      delayCount++;
    }
  }

  for (const chit of chits) {
    if (chit.withdrawal && chit.withdrawal_date && chit.end_date) {
      wdSum += differenceInCalendarDays(
        new Date(chit.withdrawal_date),
        new Date(chit.end_date),
      );
      wdCount++;
    }
    if (chit.matured && chit.start_date && chit.end_date) {
      maturitySum += differenceInCalendarDays(new Date(chit.end_date), new Date(chit.start_date)) / 30;
      maturityCount++;
    }
  }

  return {
    avgCollectionDelayDays: delayCount ? round(delaySum / delayCount) : 0,
    avgWithdrawalDelayDays: wdCount ? round(wdSum / wdCount) : 0,
    avgMaturityMonths: maturityCount ? round(maturitySum / maturityCount) : 0,
    paymentSuccessRate: attempts ? round((success / attempts) * 100) : 0,
  };
}

export function filterPaymentsForReports(
  payments: PaymentWithChit[],
  filters: {
    dateFrom?: string;
    dateTo?: string;
    city?: string;
    category?: string;
    chitType?: string;
    status?: PaymentStatus | '';
    memberQuery?: string;
  },
): PaymentWithChit[] {
  return payments.filter((p) => {
    if (filters.city && p.chit?.person?.city !== filters.city) return false;
    if (filters.category && p.chit?.category !== filters.category) return false;
    if (filters.chitType && p.chit?.type !== filters.chitType) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.memberQuery) {
      const q = filters.memberQuery.toLowerCase();
      if (!p.chit?.person?.name?.toLowerCase().includes(q)) return false;
    }
    if (filters.dateFrom && p.paid_date && p.paid_date < filters.dateFrom) return false;
    if (filters.dateTo && p.paid_date && p.paid_date > filters.dateTo) return false;
    return true;
  });
}
