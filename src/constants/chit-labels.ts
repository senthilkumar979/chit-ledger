import { ChitTypes } from './chit-config';

export const chitTypeLabels: Record<string, string> = {
  [ChitTypes.ONE_LAKH]: '₹1 Lakh',
  [ChitTypes.TWO_LAKH]: '₹2 Lakh',
};

/** ASCII-safe labels for jsPDF (Helvetica cannot render ₹). */
export const chitTypePdfLabels: Record<string, string> = {
  [ChitTypes.ONE_LAKH]: 'Rs. 1 Lakh',
  [ChitTypes.TWO_LAKH]: 'Rs. 2 Lakh',
};

export const chitTypeStyles: Record<string, string> = {
  [ChitTypes.ONE_LAKH]: 'from-emerald-600 to-teal-700',
  [ChitTypes.TWO_LAKH]: 'from-sky-600 to-indigo-700',
};

export type ChitStatusFilter = 'all' | 'active' | 'matured' | 'withdrawn';
