'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  bulkMarkPaymentSchema,
  type BulkMarkPaymentFormData,
} from '@/schemas/payment';
import { PaymentModes, paymentModeOptions } from '@/constants/payment-modes';
import { paidToRecipientOptions } from '@/constants/paid-to-recipients';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SelectWithCustom } from '@/components/ui/SelectWithCustom';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  getUnpaidInstallments,
  previewBulkPayment,
} from '@/utils/bulk-payment';
import type { Payment } from '@/types/database';

interface BulkMarkPaymentFormProps {
  payments: Payment[];
  onSubmit: (data: BulkMarkPaymentFormData) => Promise<void>;
  onCancel: () => void;
}

export function BulkMarkPaymentForm({
  payments,
  onSubmit,
  onCancel,
}: BulkMarkPaymentFormProps) {
  const unpaid = useMemo(() => getUnpaidInstallments(payments), [payments]);
  const maxCount = unpaid.length;

  const schema = useMemo(
    () =>
      bulkMarkPaymentSchema.refine(
        (data) => data.installment_count <= maxCount,
        {
          message:
            maxCount === 0
              ? 'All installments are already paid'
              : `Only ${maxCount} unpaid installment${maxCount === 1 ? '' : 's'} remaining`,
          path: ['installment_count'],
        },
      ),
    [maxCount],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BulkMarkPaymentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      installment_count: maxCount > 0 ? Math.min(maxCount, 1) : 1,
      paid_date: new Date().toISOString().split('T')[0],
      payment_mode: PaymentModes.CASH,
      paid_to: '',
    },
  });

  const count = Number(watch('installment_count')) || 0;
  const preview = previewBulkPayment(payments, count);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="rounded-lg bg-surface p-3 text-sm text-muted">
        Marks the next unpaid installments in order, each at its full expected amount.
        {maxCount > 0 ? (
          <>
            {' '}
            <strong className="text-primary">{maxCount}</strong> unpaid remaining.
          </>
        ) : (
          ' All installments are already paid.'
        )}
      </p>

      <Input
        label="Number of installments"
        type="number"
        min={1}
        max={maxCount || 1}
        step={1}
        disabled={maxCount === 0}
        error={errors.installment_count?.message}
        {...register('installment_count', { valueAsNumber: true })}
      />

      {preview.targets.length > 0 ? (
        <div className="rounded-lg border border-border/80 bg-surface/50 px-3 py-2.5 text-sm">
          <p className="font-medium text-primary">
            Installments #{preview.fromInstallment}
            {preview.toInstallment !== preview.fromInstallment
              ? `–#${preview.toInstallment}`
              : ''}{' '}
            · {formatCurrency(preview.totalAmount)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {preview.targets.length} installment
            {preview.targets.length === 1 ? '' : 's'} at expected amounts
          </p>
        </div>
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
          disabled={maxCount === 0}
        >
          Save bulk payment
        </Button>
      </div>
    </form>
  );
}
