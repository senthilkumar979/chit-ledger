import { z } from 'zod';
import { PaymentModes } from '@/constants/payment-modes';

const modeValues = Object.values(PaymentModes) as [string, ...string[]];

export const markPaymentSchema = z.object({
  paid_date: z.string().min(1, 'Payment date is required'),
  payment_mode: z.enum(modeValues),
  paid_to: z.string().min(1, 'Paid to is required'),
  amount_paid: z.number({ error: 'Amount is required' }).positive('Amount must be positive'),
});

export type MarkPaymentFormData = z.infer<typeof markPaymentSchema>;

export const bulkMarkPaymentSchema = z.object({
  installment_count: z
    .number({ error: 'Number of installments is required' })
    .int('Must be a whole number')
    .min(1, 'At least one installment')
    .max(20, 'Cannot exceed 20 installments'),
  paid_date: z.string().min(1, 'Payment date is required'),
  payment_mode: z.enum(modeValues),
  paid_to: z.string().min(1, 'Paid to is required'),
});

export type BulkMarkPaymentFormData = z.infer<typeof bulkMarkPaymentSchema>;
