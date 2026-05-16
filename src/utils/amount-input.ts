/** Display amount in Indian grouping with 2 decimal places (no currency symbol). */
export function formatAmountInputDisplay(value: number): string {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Raw value while editing (no grouping). */
export function formatAmountForEdit(value: number): string {
  if (!Number.isFinite(value)) return '';
  return String(value);
}

export function parseAmountInput(raw: string): number | undefined {
  const cleaned = raw.replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
  if (!cleaned || cleaned === '-' || cleaned === '.') return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}
