import { formatDate } from '@/lib/utils';
import { sanitizePdfText } from '@/utils/pdf/pdf-theme';
import { currencyPdfCell } from '@/utils/pdf/export-report-pdf';
import type {
  CollectionReportRow,
  MaturedReportRow,
  OutstandingReportRow,
  PortfolioReportRow,
  ReportsKpis,
} from '@/utils/report-metrics';

function schemePdf(label: string): string {
  return sanitizePdfText(label.replace(/\u20B9/g, 'Rs. '));
}

export function collectionsToPdfRows(rows: CollectionReportRow[]): string[][] {
  return rows.map((r) => [
    r.memberName,
    String(r.installmentNo),
    schemePdf(r.scheme),
    r.schedule,
    r.city,
    r.paidDate ? formatDate(r.paidDate) : '-',
    currencyPdfCell(r.expected),
    currencyPdfCell(r.collected),
    r.variance === 0 ? '-' : currencyPdfCell(Math.abs(r.variance)),
    r.mode ?? '-',
    r.paidTo ?? '-',
    r.status,
  ]);
}

export const COLLECTIONS_PDF_HEADERS = [
  'Member',
  '#',
  'Scheme',
  'Schedule',
  'City',
  'Paid on',
  'Expected',
  'Collected',
  'Var',
  'Mode',
  'Paid to',
  'Status',
];

export function outstandingToPdfRows(rows: OutstandingReportRow[]): string[][] {
  return rows.map((r) => [
    r.memberName,
    String(r.installmentNo),
    schemePdf(r.scheme),
    r.schedule,
    r.city,
    currencyPdfCell(r.expected),
    currencyPdfCell(r.collected),
    currencyPdfCell(r.pending),
    r.status,
  ]);
}

export const OUTSTANDING_PDF_HEADERS = [
  'Member',
  '#',
  'Scheme',
  'Schedule',
  'City',
  'Expected',
  'Collected',
  'Pending',
  'Status',
];

export function maturedToPdfRows(rows: MaturedReportRow[]): string[][] {
  return rows.map((r) => [
    r.memberName,
    schemePdf(r.scheme),
    r.schedule,
    r.city,
    r.endDate ? formatDate(r.endDate) : '-',
    currencyPdfCell(r.netPayout),
    r.withdrawn ? 'Yes' : 'No',
    r.withdrawalDate ? formatDate(r.withdrawalDate) : '-',
  ]);
}

export const MATURED_PDF_HEADERS = [
  'Member',
  'Scheme',
  'Schedule',
  'City',
  'End date',
  'Net payout',
  'Withdrawn',
  'Withdrawal date',
];

export function portfolioToPdfRows(rows: PortfolioReportRow[]): string[][] {
  return rows.map((r) => [
    r.memberName,
    schemePdf(r.scheme),
    r.schedule,
    r.city,
    r.lifecycle,
    `${r.paidCount}/20`,
    currencyPdfCell(r.collected),
    currencyPdfCell(r.outstanding),
    String(r.overdueCount),
  ]);
}

export const PORTFOLIO_PDF_HEADERS = [
  'Member',
  'Scheme',
  'Schedule',
  'City',
  'Status',
  'Paid',
  'Collected',
  'Outstanding',
  'Overdue',
];

export function kpisToPdfSummary(kpis: ReportsKpis) {
  return [
    { label: 'Total collected', value: currencyPdfCell(kpis.totalCollected) },
    { label: 'Outstanding', value: currencyPdfCell(kpis.totalOutstanding) },
    { label: 'Overdue inst.', value: String(kpis.overdueInstallments) },
    { label: 'Active chits', value: String(kpis.activeChits) },
  ];
}

export function collectionKpisSummary(rows: CollectionReportRow[]) {
  const collected = rows.reduce((s, r) => s + r.collected, 0);
  const expected = rows.reduce((s, r) => s + r.expected, 0);
  return [
    { label: 'Rows', value: String(rows.length) },
    { label: 'Collected', value: currencyPdfCell(collected) },
    { label: 'Expected', value: currencyPdfCell(expected) },
    {
      label: 'Variance',
      value: currencyPdfCell(Math.abs(collected - expected)),
    },
  ];
}
