import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  formatPdfCurrency,
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

export interface ReportPdfSummaryItem {
  label: string;
  value: string;
}

export interface ReportPdfInput {
  title: string;
  subtitle?: string;
  summaryItems?: ReportPdfSummaryItem[];
  headers: string[];
  rows: string[][];
  filename: string;
  landscape?: boolean;
}

const PORTRAIT_W = 210;
const PORTRAIT_H = 297;
const LANDSCAPE_W = 297;
const LANDSCAPE_H = 210;

export function exportReportTablePdf(input: ReportPdfInput): void {
  const pageW = input.landscape ? LANDSCAPE_W : PORTRAIT_W;
  const pageH = input.landscape ? LANDSCAPE_H : PORTRAIT_H;
  const doc = new jsPDF({
    orientation: input.landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const generatedAt = sanitizePdfText(
    new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(),
    ),
  );

  let y = drawBrandedHeader(
    doc,
    pageW,
    sanitizePdfText(input.title),
    sanitizePdfText(input.subtitle ?? 'ChitLedger operational report'),
  );

  if (input.summaryItems?.length) {
    y = drawSummaryRow(doc, pageW, input.summaryItems, y);
  }

  drawTable(doc, pageW, input.headers, input.rows, y);
  applyPdfFooters(doc, pageW, generatedAt, 'ChitLedger | Reports', pageH);

  doc.save(`${sanitizeFilename(input.filename)}.pdf`);
}

function drawSummaryRow(
  doc: jsPDF,
  pageW: number,
  items: ReportPdfSummaryItem[],
  startY: number,
): number {
  let y = startY + 2;
  drawSectionTitle(doc, 'Summary', PDF_MARGIN, y);
  y += 7;

  const count = Math.min(items.length, 4);
  const boxW = (pageW - PDF_MARGIN * 2 - (count - 1) * 5) / count;

  items.slice(0, 4).forEach((item, index) => {
    const x = PDF_MARGIN + index * (boxW + 5);
    doc.setDrawColor(...pdfTheme.border);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, boxW, 14, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(...pdfTheme.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizePdfText(item.label).toUpperCase(), x + 3, y + 5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...pdfTheme.primary);
    doc.text(sanitizePdfText(item.value), x + 3, y + 10);
  });

  return y + 20;
}

function drawTable(
  doc: jsPDF,
  pageW: number,
  headers: string[],
  rows: string[][],
  startY: number,
): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...pdfTheme.primary);
  doc.text('Details', PDF_MARGIN, startY);

  if (!rows.length) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...pdfTheme.muted);
    doc.text('No records for this report.', PDF_MARGIN, startY + 8);
    return;
  }

  const body = rows.map((row) => row.map((cell) => sanitizePdfText(String(cell))));

  autoTable(doc, {
    startY: startY + 4,
    margin: { left: PDF_MARGIN, right: PDF_MARGIN },
    head: [headers.map((h) => sanitizePdfText(h))],
    body,
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: pdfTheme.primary,
      lineColor: pdfTheme.border,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: pdfTheme.primary,
      textColor: pdfTheme.white,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: pdfTheme.surface },
  });
}

export function currencyPdfCell(amount: number): string {
  return formatPdfCurrency(amount);
}
