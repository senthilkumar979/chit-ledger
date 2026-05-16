'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { markPaymentSchema, type MarkPaymentFormData } from '@/schemas/payment';
import { PaymentModes, paymentModeOptions } from '@/constants/payment-modes';
import { paidToRecipientOptions } from '@/constants/paid-to-recipients';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SelectWithCustom } from '@/components/ui/SelectWithCustom';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import { getRecordedAmount } from '@/utils/chit-payment-summary';
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
  const existing = getRecordedAmount(payment);
  const {
    register,
    control,
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
      amount_paid: existing > 0 ? existing : expected,
    },
  });

  const amount = watch('amount_paid');
  const numericAmount = Number(amount) || 0;
  const variance = numericAmount - expected;
  const isPartial = numericAmount > 0 && numericAmount < expected;

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
      {numericAmount > 0 && variance !== 0 ? (
        <p
          className={cn(
            'rounded-lg px-3 py-2 text-xs font-medium',
            variance > 0 ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning',
          )}
        >
          {variance > 0 ? 'Extra' : 'Shortfall'} of {formatCurrency(Math.abs(variance))} on this
          installment
          {variance > 0
            ? ' — counts toward maturity payout.'
            : ' — reduces net maturity payout.'}
        </p>
      ) : null}
      {isPartial ? (
        <p className="text-xs text-warning">Recorded as partial until the full expected amount is paid.</p>
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
      <Controller
        name="paid_to"
        control={control}
        render={({ field }) => (
          <SelectWithCustom
            label="Paid to"
            options={paidToRecipientOptions}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.paid_to?.message}
            placeholder="Select recipient"
            customInputPlaceholder="Enter recipient name"
          />
        )}
      />
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
        <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          className="min-h-11 flex-1"
          isLoading={isSubmitting}
        >
          {isEdit ? 'Update payment' : 'Save payment'}
        </Button>
      </div>
    </form>
  );
}
