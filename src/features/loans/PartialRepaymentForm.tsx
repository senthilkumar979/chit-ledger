'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partialRepaymentSchema, type PartialRepaymentFormData } from '@/schemas/loan';
import { interestPeriodStart, summarizeLoanBalance } from '@/utils/loan-balance';
import {
  buildLoanPeriodInterestBreakdown,
  todayLocalIsoDate,
} from '@/utils/loan-calculations';
import type { LoanWithRepayments } from '@/types/database';
import { LoanInterestBreakdownCard } from './LoanInterestBreakdownCard';
import { AmountInput } from '@/components/ui/AmountInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface PartialRepaymentFormProps {
  loan: LoanWithRepayments;
  onSubmit: (data: PartialRepaymentFormData) => Promise<void>;
  onCancel: () => void;
}

export function PartialRepaymentForm({ loan, onSubmit, onCancel }: PartialRepaymentFormProps) {
  const today = todayLocalIsoDate();
  const balance = summarizeLoanBalance(loan, loan.repayments);
  const periodStart = interestPeriodStart(loan, loan.repayments);

  const initialBreakdown = buildLoanPeriodInterestBreakdown(
    balance.principalOutstanding,
    loan.interest_rate,
    periodStart,
    today,
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PartialRepaymentFormData>({
    resolver: zodResolver(partialRepaymentSchema),
    defaultValues: {
      repayment_date: today,
      principal_paid: 0,
      interest_paid: initialBreakdown.totalInterest,
    },
  });

  const repaymentDate = watch('repayment_date');

  const breakdown = useMemo(() => {
    if (!repaymentDate) return initialBreakdown;
    return buildLoanPeriodInterestBreakdown(
      balance.principalOutstanding,
      loan.interest_rate,
      periodStart,
      repaymentDate,
    );
  }, [
    repaymentDate,
    balance.principalOutstanding,
    loan.interest_rate,
    periodStart,
    initialBreakdown,
  ]);

  useEffect(() => {
    if (!repaymentDate) return;
    setValue('interest_paid', breakdown.totalInterest, { shouldValidate: true });
  }, [breakdown.totalInterest, repaymentDate, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted">
        Outstanding principal:{' '}
        <span className="font-semibold text-primary">
          {formatCurrency(balance.principalOutstanding)}
        </span>
      </p>
      <LoanInterestBreakdownCard
        principal={balance.principalOutstanding}
        rate={loan.interest_rate}
        startDate={periodStart}
        closeDate={repaymentDate || today}
        breakdown={breakdown}
        periodLabel="since last repayment"
      />
      <Input
        label="Repayment date"
        type="date"
        min={periodStart}
        {...register('repayment_date')}
        error={errors.repayment_date?.message}
      />
      <Controller
        name="principal_paid"
        control={control}
        render={({ field }) => (
          <AmountInput
            label="Principal paid"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.principal_paid?.message}
          />
        )}
      />
      <Controller
        name="interest_paid"
        control={control}
        render={({ field }) => (
          <AmountInput
            label="Interest paid (editable)"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.interest_paid?.message}
          />
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting}>
          Record repayment
        </Button>
      </div>
    </form>
  );
}
