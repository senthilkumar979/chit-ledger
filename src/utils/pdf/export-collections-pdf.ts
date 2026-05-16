import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getRecordedAmount, getInstallmentVariance } from '@/utils/chit-payment-summary';
import { paymentStatusLabel } from '@/utils/payment-status';
import type { DashboardMonthKpis } from '@/utils/dashboard-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';
import {
  formatPdfCurrency,
  formatPdfDate,
  formatPdfSignedCurrency,
  pdfChitTypeLabel,
  PDF_EMPTY,
  pdfTheme,
  sanitizeFilename,
  sanitizePdfText,
} from './pdf-theme';
import {
  applyPdfFooters,
  drawBrandedHeader,
  drawSectionTitle,
  PDF_MARGIN,
} from './pdf-layout';

const PAGE_W = 297;
const PAGE_H = 210;

export interface CollectionsPdfFilters {
  search?: string;
  status?: string;
  city?: string;
  category?: string;
}

export interface CollectionsPdfInput {
  monthLabel: string;
  rows: PaymentWithChit[];
  kpis: Pick<
    DashboardMonthKpis,
    | 'collectedInMonth'
    | 'expectedOnPaidInMonth'
    | 'extraCollectedInMonth'
    | 'shortfallInMonth'
    | 'paymentsRecordedInMonth'
  >;
  filters?: CollectionsPdfFilters;
}

function buildFilterSummary(filters?: CollectionsPdfFilters): string | null {
  if (!filters) return null;
  const parts: string[] = [];
  if (filters.search?.trim()) parts.push(`Search: ${filters.search.trim()}`);
  if (filters.status) parts.push(`Status: ${filters.status}`);
  if (filters.city) parts.push(`City: ${filters.city}`);
  if (filters.category) parts.push(`Schedule: ${filters.category}`);
  return parts.length ? parts.join(' | ') : null;
}

function computeFilteredKpis(rows: PaymentWithChit[]) {
  let collected = 0;
  let expected = 0;
  for (const payment of rows) {
    collected += getRecordedAmount(payment);
    expected += Number(payment.expected_amount);
  }
  return {
    collected,
    expected,
    extra: Math.max(0, collected - expected),
    shortfall: Math.max(0, expected - collected),
    count: rows.length,
  };
}

export function exportCollectionsToPdf(input: CollectionsPdfInput): void {
  const { monthLabel, rows, kpis, filters } = input;
  const hasFilters = Boolean(buildFilterSummary(filters));
  const summary = hasFilters ? computeFilteredKpis(rows) : null;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const generatedAt = sanitizePdfText(
    new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date()),
  );

  const subtitle = sanitizePdfText(
    `${monthLabel} | Payments recorded by paid date${hasFilters ? ' (filtered)' : ''}`,
  );

  let y = drawBrandedHeader(doc, PAGE_W, 'Collections this month', subtitle);
  y = drawSummaryBand(doc, summary ?? kpis, hasFilters, y);
  y = drawFilterNote(doc, buildFilterSummary(filters), y);
  drawCollectionsTable(doc, rows, y);
  applyPdfFooters(doc, PAGE_W, generatedAt, 'ChitLedger | Collections report', PAGE_H);

  const filename = `collections-${sanitizeFilename(monthLabel)}.pdf`;
  doc.save(filename);
}

function drawSummaryBand(
  doc: jsPDF,
  data:
    | CollectionsPdfInput['kpis']
    | ReturnType<typeof computeFilteredKpis>,
  isFiltered: boolean,
  startY: number,
): number {
  let y = startY + 2;
  drawSectionTitle(doc, isFiltered ? 'Summary (filtered)' : 'Summary', PDF_MARGIN, y);
  y += 7;

  const collected = 'collectedInMonth' in data ? data.collectedInMonth : data.collected;
  const expected =
    'expectedOnPaidInMonth' in data ? data.expectedOnPaidInMonth : data.expected;
  const extra =
    'extraCollectedInMonth' in data ? data.extraCollectedInMonth : data.extra;
  const shortfall = 'shortfallInMonth' in data ? data.shortfallInMonth : data.shortfall;
  const count =
    'paymentsRecordedInMonth' in data ? data.paymentsRecordedInMonth : data.count;

  const items = [
    { label: 'Total collected', value: formatPdfCurrency(collected) },
    { label: 'Expected', value: formatPdfCurrency(expected) },
    { label: 'Extra collected', value: formatPdfCurrency(extra) },
    { label: 'Shortfall', value: formatPdfCurrency(shortfall) },
    { label: 'Payments', value: String(count) },
  ];

  const boxW = (PAGE_W - PDF_MARGIN * 2 - 20) / 5;
  items.forEach((item, index) => {
    const x = PDF_MARGIN + index * (boxW + 5);
    doc.setDrawColor(...pdfTheme.border);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, boxW, 15, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(...pdfTheme.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label.toUpperCase(), x + 3, y + 5);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...pdfTheme.primary);
    doc.text(item.value, x + 3, y + 11);
  });

  return y + 22;
}

function drawFilterNote(doc: jsPDF, filterLine: string | null, startY: number): number {
  if (!filterLine) return startY;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...pdfTheme.muted);
  doc.text(sanitizePdfText(`Filters: ${filterLine}`), PDF_MARGIN, startY);
  return startY + 6;
}

function drawCollectionsTable(doc: jsPDF, rows: PaymentWithChit[], startY: number): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...pdfTheme.primary);
  doc.text('Payment details', PDF_MARGIN, startY);

  if (!rows.length) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...pdfTheme.muted);
    doc.text('No collections match the current filters for this month.', PDF_MARGIN, startY + 8);
    return;
  }

  const body = rows.map((p) => {
    const collected = getRecordedAmount(p);
    const variance = getInstallmentVariance(p);
    return [
      sanitizePdfText(p.chit?.person?.name ?? PDF_EMPTY),
      String(p.installment_no),
      p.chit?.type ? pdfChitTypeLabel(p.chit.type) : PDF_EMPTY,
      sanitizePdfText(p.chit?.category ?? PDF_EMPTY),
      sanitizePdfText(p.chit?.person?.city ?? PDF_EMPTY),
      formatPdfDate(p.paid_date),
      formatPdfCurrency(Number(p.expected_amount)),
      formatPdfCurrency(collected),
      variance === 0 ? PDF_EMPTY : formatPdfSignedCurrency(variance),
      sanitizePdfText(p.payment_mode ?? PDF_EMPTY),
      sanitizePdfText(p.paid_to ?? PDF_EMPTY),
      paymentStatusLabel(p.status),
    ];
  });

  autoTable(doc, {
    startY: startY + 4,
    margin: { left: PDF_MARGIN, right: PDF_MARGIN },
    head: [
      [
        'Member',
        '#',
        'Scheme',
        'Schedule',
        'City',
        'Paid on',
        'Expected',
        'Collected',
        '+/-',
        'Mode',
        'Paid to',
        'Status',
      ],
    ],
    body,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: pdfTheme.primary,
      lineColor: pdfTheme.border,
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: pdfTheme.primary,
      textColor: pdfTheme.white,
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: pdfTheme.surface },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 8, halign: 'center' },
      7: { halign: 'right' },
      8: { halign: 'right', cellWidth: 18 },
    },
    didParseCell(data) {
      if (data.section !== 'body' || data.column.index !== 11) return;
      const status = String(data.cell.raw);
      if (status === 'Paid') {
        data.cell.styles.textColor = pdfTheme.accent;
        data.cell.styles.fontStyle = 'bold';
      } else if (status === 'Overdue') {
        data.cell.styles.textColor = pdfTheme.danger;
        data.cell.styles.fontStyle = 'bold';
      } else if (status === 'Partial') {
        data.cell.styles.textColor = pdfTheme.warning;
      }
    },
  });
}
