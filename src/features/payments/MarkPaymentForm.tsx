'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { markPaymentSchema, type MarkPaymentFormData } from '@/schemas/payment';
import { PaymentModes, paymentModeOptions } from '@/constants/payment-modes';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/types/database';

interface MarkPaymentFormProps {
  payment: Payment;
  onSubmit: (data: MarkPaymentFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function MarkPaymentForm({
  payment,
  onSubmit,
  onCancel,
  isEdit = false,
}: MarkPaymentFormProps) {
  const expected = Number(payment.expected_amount);
  const collected = Number(payment.advance_amount_paid ?? expected);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MarkPaymentFormData>({
    resolver: zodResolver(markPaymentSchema),
    defaultValues: {
      paid_date: payment.paid_date ?? new Date().toISOString().split('T')[0],
      payment_mode:
        (payment.payment_mode as MarkPaymentFormData['payment_mode']) ?? PaymentModes.CASH,
      paid_to: payment.paid_to ?? '',
      amount_paid: collected || expected,
      is_advance: false,
    },
  });

  const amount = watch('amount_paid');
  const isPartial = Number(amount) > 0 && Number(amount) < expected;
  const isAdvance = Number(amount) > expected;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="rounded-lg bg-surface p-3 text-sm">
        Installment <strong>#{payment.installment_no}</strong> — expected{' '}
        <strong>{formatCurrency(expected)}</strong>
      </p>
      <Input
        label="Amount paid"
        type="number"
        step="0.01"
        error={errors.amount_paid?.message}
        {...register('amount_paid', { valueAsNumber: true })}
      />
      {isPartial ? (
        <p className="text-xs text-warning">Recorded as partial payment</p>
      ) : null}
      {isAdvance ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_advance')} />
          Mark as advance payment
        </label>
      ) : null}
      <Input
        label="Payment date"
        type="date"
        error={errors.paid_date?.message}
        {...register('paid_date')}
      />
      <Select
        label="Payment mode"
        options={paymentModeOptions}
        error={errors.payment_mode?.message}
        {...register('payment_mode')}
      />
      <Input
        label="Paid to"
        error={errors.paid_to?.message}
        {...register('paid_to')}
      />
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" className="flex-1" isLoading={isSubmitting}>
          {isEdit ? 'Update payment' : 'Save payment'}
        </Button>
      </div>
    </form>
  );
}
