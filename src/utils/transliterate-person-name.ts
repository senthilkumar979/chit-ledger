import { containsTamil, transliterate } from '@piraisoodan/tanglish';

export function transliteratePersonName(input: string): string {
  const value = input.trim().replace(/\s+/g, ' ');
  if (!value) return '';
  if (containsTamil(value)) return value;
  return transliterate(value);
}
