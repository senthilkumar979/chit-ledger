import type { jsPDF } from 'jspdf';
import { pdfTheme } from './pdf-theme';

export const PDF_MARGIN = 14;
export const PDF_PAGE_W_PORTRAIT = 210;

export function drawBrandedHeader(
  doc: jsPDF,
  pageWidth: number,
  reportTitle: string,
  subtitle: string,
): number {
  doc.setFillColor(...pdfTheme.primary);
  doc.rect(0, 0, pageWidth, 36, 'F');
  doc.setFillColor(...pdfTheme.accent);
  doc.rect(0, 36, pageWidth, 1.2, 'F');

  doc.setTextColor(...pdfTheme.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ChitLedger', PDF_MARGIN, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 210);
  doc.text('Premium chit fund management', PDF_MARGIN, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(reportTitle, PDF_MARGIN, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, PDF_MARGIN, 35);

  return 44;
}

export function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...pdfTheme.accent);
  doc.text(title.toUpperCase(), x, y);
}

export function applyPdfFooters(
  doc: jsPDF,
  pageWidth: number,
  generatedAt: string,
  footerNote = 'ChitLedger | Confidential report',
  pageHeight = 297,
) {
  const lineY = pageHeight - 10;
  const textY = pageHeight - 5;
  const metaY = pageHeight - 1;
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...pdfTheme.border);
    doc.line(PDF_MARGIN, lineY, pageWidth - PDF_MARGIN, lineY);
    doc.setFontSize(7);
    doc.setTextColor(...pdfTheme.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(footerNote, PDF_MARGIN, textY);
    doc.text(`Generated ${generatedAt}`, PDF_MARGIN, metaY);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - PDF_MARGIN, textY, { align: 'right' });
  }
}
