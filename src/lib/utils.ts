import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** INR with decimals only when paise are non-zero (e.g. ₹1,245.50 vs ₹1,245). */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const paise = Math.round(Math.abs(rounded) * 100) % 100;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: paise !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
