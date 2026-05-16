import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INSTALLMENT_COUNT } from '@/constants/chit-config';
import type { ChitWithPayments } from '@/types/database';
import { summarizeChitPayments, getRecordedAmount, getInstallmentVariance } from '@/utils/chit-payment-summary';
import { paymentStatusLabel } from '@/utils/payment-status';
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

const MARGIN = 14;
const PAGE_W = 210;

export function exportChitToPdf(chit: ChitWithPayments): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const summary = summarizeChitPayments(chit.payments);
  const personName = sanitizePdfText(chit.person?.name ?? 'Member');
  const schemeLabel = pdfChitTypeLabel(chit.type);
  const generatedAt = sanitizePdfText(
    new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date()),
  );

  let y = drawHeader(doc, personName, schemeLabel);
  y = drawInfoColumns(doc, chit, y);
  y = drawSummaryBand(doc, summary, y);
  y = drawScheduleTable(doc, chit, y);

  if (chit.matured || chit.withdrawal) {
    y = drawMaturitySection(doc, chit, summary, y);
  }

  applyFooters(doc, generatedAt);

  const filename = `chit-${sanitizeFilename(personName)}-${sanitizeFilename(schemeLabel)}.pdf`;
  doc.save(filename);
}

function drawHeader(doc: jsPDF, personName: string, schemeLabel: string): number {
  doc.setFillColor(...pdfTheme.primary);
  doc.rect(0, 0, PAGE_W, 36, 'F');
  doc.setFillColor(...pdfTheme.accent);
  doc.rect(0, 36, PAGE_W, 1.2, 'F');

  doc.setTextColor(...pdfTheme.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ChitLedger', MARGIN, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 210);
  doc.text('Premium chit fund management', MARGIN, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...pdfTheme.white);
  doc.text('Chit statement', MARGIN, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${personName} | ${schemeLabel}`, MARGIN, 35);

  return 44;
}

function drawInfoColumns(doc: jsPDF, chit: ChitWithPayments, startY: number): number {
  const colW = (PAGE_W - MARGIN * 2 - 8) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 8;
  let y = startY;

  doc.setDrawColor(...pdfTheme.border);
  doc.setFillColor(...pdfTheme.surface);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 38, 2, 2, 'FD');

  y += 7;
  drawSectionTitle(doc, 'Member', leftX, y);
  drawSectionTitle(doc, 'Chit details', rightX, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(...pdfTheme.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizePdfText(chit.person?.name ?? PDF_EMPTY), leftX, y);
  doc.text(pdfChitTypeLabel(chit.type), rightX, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...pdfTheme.muted);
  const status = chit.withdrawal ? 'Withdrawn' : chit.matured ? 'Matured' : 'Active';
  const leftLines = [
    `City: ${sanitizePdfText(chit.person?.city ?? PDF_EMPTY)}`,
    `Phone: ${sanitizePdfText(chit.person?.phone ?? PDF_EMPTY)}`,
    chit.person?.notes
      ? `Notes: ${sanitizePdfText(truncate(chit.person.notes, 60))}`
      : '',
  ].filter(Boolean);
  const rightLines = [
    `Schedule: ${sanitizePdfText(chit.category)}`,
    `Start: ${formatPdfDate(chit.start_date)}`,
    `End: ${formatPdfDate(chit.end_date)}`,
    `Status: ${status}`,
  ];

  leftLines.forEach((line, i) => doc.text(line, leftX, y + i * 4.5));
  rightLines.forEach((line, i) => doc.text(line, rightX, y + i * 4.5));

  return startY + 44;
}

function drawSummaryBand(
  doc: jsPDF,
  summary: ReturnType<typeof summarizeChitPayments>,
  startY: number,
): number {
  let y = startY + 4;
  drawSectionTitle(doc, 'Financial summary', MARGIN, y);
  y += 7;

  const items = [
    { label: 'Collected', value: formatPdfCurrency(summary.totalCollected) },
    { label: 'Outstanding', value: formatPdfCurrency(summary.outstanding) },
    {
      label: sanitizePdfText(summary.varianceLabel),
      value:
        summary.collectionVariance === 0
          ? 'Balanced'
          : formatPdfSignedCurrency(summary.collectionVariance),
    },
    { label: 'Net maturity', value: formatPdfCurrency(summary.netMaturityPayout) },
    {
      label: 'Paid installments',
      value: `${summary.paidInstallmentCount} / ${INSTALLMENT_COUNT}`,
    },
    { label: 'Overdue', value: String(summary.overdueCount) },
  ];

  const boxW = (PAGE_W - MARGIN * 2 - 10) / 3;
  items.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = MARGIN + col * (boxW + 5);
    const boxY = y + row * 18;

    doc.setDrawColor(...pdfTheme.border);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, boxY, boxW, 15, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(...pdfTheme.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label.toUpperCase(), x + 3, boxY + 5);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...pdfTheme.primary);
    doc.text(item.value, x + 3, boxY + 11);
  });

  return y + 38;
}

function drawScheduleTable(doc: jsPDF, chit: ChitWithPayments, startY: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...pdfTheme.primary);
  doc.text('Payment schedule', MARGIN, startY);

  const rows = chit.payments.map((p) => {
    const collected = getRecordedAmount(p);
    const variance = getInstallmentVariance(p);
    const varianceText = variance === 0 ? PDF_EMPTY : formatPdfSignedCurrency(variance);

    return [
      String(p.installment_no),
      formatPdfCurrency(Number(p.expected_amount)),
      formatPdfCurrency(Number(p.maturity_amount)),
      collected > 0 ? formatPdfCurrency(collected) : PDF_EMPTY,
      varianceText,
      formatPdfDate(p.paid_date),
      sanitizePdfText(p.payment_mode ?? PDF_EMPTY),
      sanitizePdfText(p.paid_to ?? PDF_EMPTY),
      paymentStatusLabel(p.status),
    ];
  });

  autoTable(doc, {
    startY: startY + 4,
    margin: { left: MARGIN, right: MARGIN },
    head: [
      [
        '#',
        'Expected',
        'Maturity',
        'Collected',
        '+/-',
        'Paid on',
        'Mode',
        'Paid to',
        'Status',
      ],
    ],
    body: rows,
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: pdfTheme.primary,
      lineColor: pdfTheme.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: pdfTheme.primary,
      textColor: pdfTheme.white,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: pdfTheme.surface },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      4: { halign: 'right' },
    },
    didParseCell(data) {
      if (data.section !== 'body' || data.column.index !== 8) return;
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

  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? startY + 20;
}

function drawMaturitySection(
  doc: jsPDF,
  chit: ChitWithPayments,
  summary: ReturnType<typeof summarizeChitPayments>,
  startY: number,
): number {
  let y = startY + 8;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  drawSectionTitle(doc, 'Maturity & withdrawal', MARGIN, y);
  y += 7;

  doc.setFillColor(...pdfTheme.surface);
  doc.setDrawColor(...pdfTheme.border);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, chit.withdrawal ? 28 : 18, 2, 2, 'FD');

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...pdfTheme.muted);
  doc.setFont('helvetica', 'normal');
  doc.text(`Base maturity: ${formatPdfCurrency(summary.maturityBase)}`, MARGIN + 4, y);
  y += 5;
  doc.text(
    `${sanitizePdfText(summary.varianceLabel)}: ${summary.collectionVariance === 0 ? PDF_EMPTY : formatPdfCurrency(Math.abs(summary.collectionVariance))}`,
    MARGIN + 4,
    y,
  );
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...pdfTheme.accent);
  doc.text(`Net payout: ${formatPdfCurrency(summary.netMaturityPayout)}`, MARGIN + 4, y);

  if (chit.withdrawal && chit.withdrawal_date) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...pdfTheme.primary);
    doc.text(
      `Withdrawn ${formatPdfDate(chit.withdrawal_date)} | ${sanitizePdfText(chit.withdrawal_by ?? PDF_EMPTY)} | ${sanitizePdfText(chit.withdrawal_payment_mode ?? PDF_EMPTY)}`,
      MARGIN + 4,
      y,
    );
  }

  return y + 14;
}

function applyFooters(doc: jsPDF, generatedAt: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...pdfTheme.border);
    doc.line(MARGIN, 287, PAGE_W - MARGIN, 287);
    doc.setFontSize(7);
    doc.setTextColor(...pdfTheme.muted);
    doc.setFont('helvetica', 'normal');
    doc.text('ChitLedger | Confidential member statement', MARGIN, 292);
    doc.text(`Generated ${generatedAt}`, MARGIN, 296);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, 292, { align: 'right' });
  }
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...pdfTheme.accent);
  doc.text(title.toUpperCase(), x, y);
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 3)}...`;
}
