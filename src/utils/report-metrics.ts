import { chitTypeLabels } from '@/constants/chit-labels';
import type { AnalyticsBundle, ChartDatum } from '@/services/analytics';
import {
  getRecordedAmount,
  getInstallmentVariance,
  hasRecordedPayment,
  summarizeChitPayments,
} from '@/utils/chit-payment-summary';
import { getPrimaryPersonName } from '@/utils/person-display';
import { paymentStatusLabel } from '@/utils/payment-status';
import type { PaymentStatus } from '@/types/database';
import type { PaymentWithChit } from '@/utils/payment-month';

export interface ReportsChitRow {
  id: string;
  matured: boolean;
  withdrawal: boolean;
  type?: string;
  category?: string;
  end_date?: string | null;
  withdrawal_date?: string | null;
  person?: { name?: string; name_tamil?: string; city?: string };
}

export interface ReportsKpis {
  totalCollected: number;
  totalExpectedOnPaid: number;
  collectionVariance: number;
  totalOutstanding: number;
  overdueInstallments: number;
  partialInstallments: number;
  pendingInstallments: number;
  paidInstallments: number;
  activeChits: number;
  maturedChits: number;
  withdrawnChits: number;
  totalChits: number;
  maturedAwaitingWithdrawal: number;
}

export interface CollectionReportRow {
  id: string;
  chitId: string;
  memberName: string;
  city: string;
  scheme: string;
  schedule: string;
  installmentNo: number;
  expected: number;
  collected: number;
  variance: number;
  paidDate: string | null;
  mode: string | null;
  paidTo: string | null;
  status: string;
  statusKey: PaymentStatus;
}

export interface OutstandingReportRow {
  id: string;
  chitId: string;
  memberName: string;
  city: string;
  scheme: string;
  schedule: string;
  installmentNo: number;
  expected: number;
  collected: number;
  pending: number;
  status: string;
  statusKey: PaymentStatus;
}

export interface MaturedReportRow {
  id: string;
  chitId: string;
  memberName: string;
  city: string;
  scheme: string;
  schedule: string;
  endDate: string | null;
  netPayout: number;
  withdrawn: boolean;
  withdrawalDate: string | null;
}

export interface PortfolioReportRow {
  id: string;
  memberName: string;
  city: string;
  scheme: string;
  schedule: string;
  lifecycle: 'Active' | 'Matured' | 'Withdrawn';
  paidCount: number;
  collected: number;
  outstanding: number;
  overdueCount: number;
}

export interface ReportsDataBundle {
  analytics: AnalyticsBundle;
  kpis: ReportsKpis;
  byStatus: ChartDatum[];
  portfolioMix: ChartDatum[];
  collections: CollectionReportRow[];
  outstanding: OutstandingReportRow[];
  matured: MaturedReportRow[];
  pendingWithdrawals: MaturedReportRow[];
  portfolio: PortfolioReportRow[];
}

function schemeLabel(type?: string): string {
  if (!type) return 'Unknown';
  return chitTypeLabels[type] ?? type;
}

function groupPaymentsByChit(payments: PaymentWithChit[]): Map<string, PaymentWithChit[]> {
  const map = new Map<string, PaymentWithChit[]>();
  for (const payment of payments) {
    const list = map.get(payment.chit_id) ?? [];
    list.push(payment);
    map.set(payment.chit_id, list);
  }
  return map;
}

export function buildReportsBundle(
  payments: PaymentWithChit[],
  chits: ReportsChitRow[],
  analytics: AnalyticsBundle,
): ReportsDataBundle {
  const byChit = groupPaymentsByChit(payments);
  let totalCollected = 0;
  let totalExpectedOnPaid = 0;
  let totalOutstanding = 0;
  const statusCounts = { paid: 0, partial: 0, pending: 0, overdue: 0 };

  const collections: CollectionReportRow[] = [];
  const outstanding: OutstandingReportRow[] = [];

  for (const payment of payments) {
    statusCounts[payment.status]++;

    if (hasRecordedPayment(payment) && payment.paid_date) {
      const collected = getRecordedAmount(payment);
      const expected = Number(payment.expected_amount);
      totalCollected += collected;
      totalExpectedOnPaid += expected;

      collections.push({
        id: payment.id,
        chitId: payment.chit_id,
        memberName: getPrimaryPersonName(payment.chit?.person),
        city: payment.chit?.person?.city ?? '-',
        scheme: schemeLabel(payment.chit?.type),
        schedule: payment.chit?.category ?? '-',
        installmentNo: payment.installment_no,
        expected,
        collected,
        variance: getInstallmentVariance(payment),
        paidDate: payment.paid_date,
        mode: payment.payment_mode,
        paidTo: payment.paid_to,
        status: paymentStatusLabel(payment.status),
        statusKey: payment.status,
      });
    }

    if (payment.status === 'pending' || payment.status === 'overdue' || payment.status === 'partial') {
      const collected = getRecordedAmount(payment);
      const expected = Number(payment.expected_amount);
      totalOutstanding += Math.max(0, expected - collected);

      outstanding.push({
        id: payment.id,
        chitId: payment.chit_id,
        memberName: getPrimaryPersonName(payment.chit?.person),
        city: payment.chit?.person?.city ?? '-',
        scheme: schemeLabel(payment.chit?.type),
        schedule: payment.chit?.category ?? '-',
        installmentNo: payment.installment_no,
        expected,
        collected,
        pending: Math.max(0, expected - collected),
        status: paymentStatusLabel(payment.status),
        statusKey: payment.status,
      });
    }
  }

  collections.sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? ''));
  outstanding.sort((a, b) => {
    const order: Record<PaymentStatus, number> = {
      overdue: 0,
      partial: 1,
      pending: 2,
      paid: 3,
    };
    return order[a.statusKey] - order[b.statusKey];
  });

  const matured: MaturedReportRow[] = [];
  const pendingWithdrawals: MaturedReportRow[] = [];
  const portfolio: PortfolioReportRow[] = [];

  for (const chit of chits) {
    const chitPayments = byChit.get(chit.id) ?? [];
    const summary = summarizeChitPayments(chitPayments);
    const person = chit.person ?? chitPayments[0]?.chit?.person;
    const type = chit.type ?? chitPayments[0]?.chit?.type;
    const category = chit.category ?? chitPayments[0]?.chit?.category ?? '-';

    const lifecycle: PortfolioReportRow['lifecycle'] = chit.withdrawal
      ? 'Withdrawn'
      : chit.matured
        ? 'Matured'
        : 'Active';

    portfolio.push({
      id: chit.id,
      memberName: getPrimaryPersonName(person),
      city: person?.city ?? '-',
      scheme: schemeLabel(type),
      schedule: category,
      lifecycle,
      paidCount: summary.paidInstallmentCount,
      collected: summary.totalCollected,
      outstanding: summary.outstanding,
      overdueCount: summary.overdueCount,
    });

    if (!chit.matured) continue;

    const row: MaturedReportRow = {
      id: chit.id,
      chitId: chit.id,
      memberName: getPrimaryPersonName(person),
      city: person?.city ?? '-',
      scheme: schemeLabel(type),
      schedule: category,
      endDate: chit.end_date ?? null,
      netPayout: summary.netMaturityPayout,
      withdrawn: chit.withdrawal,
      withdrawalDate: chit.withdrawal_date ?? null,
    };

    matured.push(row);
    if (!chit.withdrawal) pendingWithdrawals.push(row);
  }

  const kpis: ReportsKpis = {
    totalCollected,
    totalExpectedOnPaid,
    collectionVariance: totalCollected - totalExpectedOnPaid,
    totalOutstanding,
    overdueInstallments: statusCounts.overdue,
    partialInstallments: statusCounts.partial,
    pendingInstallments: statusCounts.pending,
    paidInstallments: statusCounts.paid,
    activeChits: chits.filter((c) => !c.matured && !c.withdrawal).length,
    maturedChits: chits.filter((c) => c.matured && !c.withdrawal).length,
    withdrawnChits: chits.filter((c) => c.withdrawal).length,
    totalChits: chits.length,
    maturedAwaitingWithdrawal: pendingWithdrawals.length,
  };

  return {
    analytics,
    kpis,
    byStatus: [
      { name: 'Paid', amount: statusCounts.paid },
      { name: 'Partial', amount: statusCounts.partial },
      { name: 'Pending', amount: statusCounts.pending },
      { name: 'Overdue', amount: statusCounts.overdue },
    ].filter((d) => d.amount > 0),
    portfolioMix: [
      { name: 'Active', amount: kpis.activeChits },
      { name: 'Matured', amount: kpis.maturedChits },
      { name: 'Withdrawn', amount: kpis.withdrawnChits },
    ].filter((d) => d.amount > 0),
    collections,
    outstanding,
    matured,
    pendingWithdrawals,
    portfolio,
  };
}

export function filterCollectionsByMonth(
  rows: CollectionReportRow[],
  monthKey: string,
): CollectionReportRow[] {
  return rows.filter((r) => r.paidDate?.startsWith(monthKey));
}

export function buildCollectionMonthOptions(rows: CollectionReportRow[]) {
  const keys = new Set<string>();
  for (const row of rows) {
    if (row.paidDate) keys.add(row.paidDate.slice(0, 7));
  }
  return [...keys]
    .sort()
    .reverse()
    .map((value) => ({
      value,
      label: new Intl.DateTimeFormat('en-IN', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${value}-01`)),
    }));
}
