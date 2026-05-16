import { chitTypePdfLabels } from '@/constants/chit-labels';
import { colors } from '@/constants/theme';

export type PdfRgb = [number, number, number];

export const pdfTheme = {
  primary: hexToRgb(colors.primary),
  secondary: hexToRgb(colors.secondary),
  accent: hexToRgb(colors.accent),
  info: hexToRgb(colors.info),
  warning: hexToRgb(colors.warning),
  danger: hexToRgb(colors.danger),
  surface: hexToRgb(colors.surface),
  border: hexToRgb(colors.border),
  muted: hexToRgb(colors.muted),
  white: [255, 255, 255] as PdfRgb,
} as const;

export function hexToRgb(hex: string): PdfRgb {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

/** Empty field placeholder — avoid Unicode em dashes (Helvetica lacks many glyphs). */
export const PDF_EMPTY = '-';

/** Strip/replace Unicode glyphs that jsPDF Helvetica cannot render. */
export function sanitizePdfText(value: string): string {
  return value
    .replace(/\u20B9/g, 'Rs. ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/\u00B7/g, '|')
    .replace(/\u2026/g, '...')
    .replace(/\u00B1/g, '+/-');
}

export function pdfChitTypeLabel(type: string): string {
  return chitTypePdfLabels[type] ?? sanitizePdfText(type);
}

export function formatPdfCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
}

export function formatPdfSignedCurrency(amount: number): string {
  if (amount === 0) return formatPdfCurrency(0);
  const sign = amount > 0 ? '+' : '-';
  return `${sign}${formatPdfCurrency(Math.abs(amount))}`;
}

export function formatPdfDate(date: string | Date | null | undefined): string {
  if (!date) return PDF_EMPTY;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function sanitizeFilename(value: string): string {
  return value.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 48);
}
