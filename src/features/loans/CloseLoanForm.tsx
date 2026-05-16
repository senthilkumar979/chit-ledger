'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeLoanSchema, type CloseLoanFormData } from '@/schemas/loan';
import { getClosingBreakdown } from '@/services/loans';
import { calculateRepaymentAmount, todayLocalIsoDate } from '@/utils/loan-calculations';
import { formatCurrency } from '@/lib/utils';
import type { LoanWithRepayments } from '@/types/database';
import { LoanInterestBreakdownCard } from './LoanInterestBreakdownCard';
import { AmountInput } from '@/components/ui/AmountInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CloseLoanFormProps {
  loan: LoanWithRepayments;
  onSubmit: (data: CloseLoanFormData) => Promise<void>;
  onCancel: () => void;
}

export function CloseLoanForm({ loan, onSubmit, onCancel }: CloseLoanFormProps) {
  const today = todayLocalIsoDate();
  const initial = getClosingBreakdown(loan, today);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CloseLoanFormData>({
    resolver: zodResolver(closeLoanSchema),
    defaultValues: {
      closed_date: today,
      interest_amount: initial.breakdown.totalInterest,
      repayment_amount: initial.breakdown.repaymentTotal,
    },
  });

  const closedDate = watch('closed_date');
  const interestAmount = watch('interest_amount');

  const { balance, periodStart, breakdown } = useMemo(() => {
    if (!closedDate) return initial;
    return getClosingBreakdown(loan, closedDate);
  }, [closedDate, loan, initial]);

  useEffect(() => {
    if (!closedDate) return;
    setValue('interest_amount', breakdown.totalInterest, { shouldValidate: true });
    setValue('repayment_amount', breakdown.repaymentTotal, { shouldValidate: true });
  }, [breakdown.totalInterest, breakdown.repaymentTotal, closedDate, setValue]);

  useEffect(() => {
    const interest = Number(interestAmount);
    if (!Number.isFinite(interest) || interest < 0) return;
    setValue(
      'repayment_amount',
      calculateRepaymentAmount(balance.principalOutstanding, interest),
      { shouldValidate: true },
    );
  }, [interestAmount, balance.principalOutstanding, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {balance.partialRepaymentCount > 0 ? (
        <p className="rounded-lg border border-border/80 bg-surface/60 px-3 py-2 text-sm text-muted">
          Already repaid {formatCurrency(balance.principalRepaid)} principal and{' '}
          {formatCurrency(balance.interestPaidToDate)} interest. Closing pays the remaining{' '}
          {formatCurrency(balance.principalOutstanding)} principal plus interest for this period.
        </p>
      ) : null}
      <LoanInterestBreakdownCard
        principal={balance.principalOutstanding}
        rate={loan.interest_rate}
        startDate={periodStart}
        closeDate={closedDate || today}
        breakdown={breakdown}
        periodLabel="since last repayment"
      />
      <Input
        label="Close / repayment date"
        type="date"
        min={periodStart}
        {...register('closed_date')}
        error={errors.closed_date?.message}
      />
      <Controller
        name="interest_amount"
        control={control}
        render={({ field }) => (
          <AmountInput
            label="Closing interest (editable)"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.interest_amount?.message}
          />
        )}
      />
      <Controller
        name="repayment_amount"
        control={control}
        render={({ field }) => (
          <AmountInput
            label="Total closing payment (principal + interest)"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.repayment_amount?.message}
          />
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting}>
          Close loan
        </Button>
      </div>
    </form>
  );
}
