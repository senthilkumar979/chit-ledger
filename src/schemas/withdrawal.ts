import { z } from 'zod';
import { PaymentModes } from '@/constants/payment-modes';

const modeValues = Object.values(PaymentModes) as [string, ...string[]];

export const withdrawalSchema = z.object({
  withdrawal_date: z.string().min(1, 'Withdrawal date is required'),
  withdrawal_by: z.string().min(1, 'Taken by is required'),
  withdrawal_payment_mode: z.enum(modeValues),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;
