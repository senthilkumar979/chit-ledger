import { z } from 'zod';
import { DEFAULT_LOAN_INTEREST_RATE } from '@/constants/loans';

const positiveAmount = z
  .number({ error: 'Amount is required' })
  .positive('Amount must be greater than zero');

export const takeLoanSchema = z.object({
  loan_from_person_id: z.string().uuid('Select who the loan is from'),
  principal: positiveAmount,
  interest_rate: z
    .number()
    .min(0, 'Rate cannot be negative')
    .max(1, 'Rate must be at most 100%'),
  start_date: z.string().min(1, 'Start date is required'),
  notes: z.string().optional(),
});

const nonNegativeAmount = z.number({ error: 'Amount is required' }).min(0, 'Amount cannot be negative');

export const partialRepaymentSchema = z
  .object({
    repayment_date: z.string().min(1, 'Repayment date is required'),
    principal_paid: nonNegativeAmount,
    interest_paid: nonNegativeAmount,
    notes: z.string().optional(),
  })
  .refine((data) => data.principal_paid + data.interest_paid > 0, {
    message: 'Enter a principal or interest amount',
    path: ['principal_paid'],
  });

export const closeLoanSchema = z.object({
  closed_date: z.string().min(1, 'Close date is required'),
  interest_amount: nonNegativeAmount,
  repayment_amount: positiveAmount,
});

export type TakeLoanFormData = z.infer<typeof takeLoanSchema>;
export type PartialRepaymentFormData = z.infer<typeof partialRepaymentSchema>;
export type CloseLoanFormData = z.infer<typeof closeLoanSchema>;
