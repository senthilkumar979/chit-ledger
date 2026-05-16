import { ChitTypes } from './chit-config';

export const chitTypeLabels: Record<string, string> = {
  [ChitTypes.FIFTY_THOUSAND]: '₹50K',
  [ChitTypes.ONE_LAKH]: '₹1 Lakh',
  [ChitTypes.TWO_LAKH]: '₹2 Lakh',
};

/** Labels for chit creation forms and filters. */
export const chitTypeFormOptions = [
  { value: ChitTypes.FIFTY_THOUSAND, label: '₹50K — 20 installments' },
  { value: ChitTypes.ONE_LAKH, label: '₹1 Lakh — 20 installments' },
  { value: ChitTypes.TWO_LAKH, label: '₹2 Lakh — 20 installments' },
] as const;

/** ASCII-safe labels for jsPDF (Helvetica cannot render ₹). */
export const chitTypePdfLabels: Record<string, string> = {
  [ChitTypes.FIFTY_THOUSAND]: 'Rs. 50K',
  [ChitTypes.ONE_LAKH]: 'Rs. 1 Lakh',
  [ChitTypes.TWO_LAKH]: 'Rs. 2 Lakh',
};

export const chitTypeStyles: Record<string, string> = {
  [ChitTypes.FIFTY_THOUSAND]: 'from-amber-600 to-orange-700',
  [ChitTypes.ONE_LAKH]: 'from-emerald-600 to-teal-700',
  [ChitTypes.TWO_LAKH]: 'from-sky-600 to-indigo-700',
};

export type ChitStatusFilter = 'all' | 'active' | 'matured' | 'withdrawn';
