import { z } from 'zod';

const positiveAmount = z
  .number({ error: 'Amount is required' })
  .positive('Amount must be greater than zero');

export const grantSchema = z.object({
  grant_to_person_id: z.string().uuid('Select who receives the grant'),
  amount: positiveAmount,
  interest_start_date: z.string().min(1, 'Interest start date is required'),
  interest_percent: z
    .number({ error: 'Interest rate is required' })
    .min(0, 'Rate cannot be negative')
    .max(100, 'Rate must be at most 100%'),
  notes: z.string().optional(),
});

export type GrantFormData = z.infer<typeof grantSchema>;

export function grantFormToRate(interestPercent: number): number {
  return interestPercent / 100;
}

export function grantRateToPercent(rate: number): number {
  return Math.round(rate * 10000) / 100;
}
