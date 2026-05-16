'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { takeLoanSchema, type TakeLoanFormData } from '@/schemas/loan';
import { DEFAULT_LOAN_INTEREST_RATE } from '@/constants/loans';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import { AmountInput } from '@/components/ui/AmountInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TakeLoanFormProps {
  onSubmit: (data: TakeLoanFormData) => Promise<void>;
  onCancel: () => void;
}

export function TakeLoanForm({ onSubmit, onCancel }: TakeLoanFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TakeLoanFormData>({
    resolver: zodResolver(takeLoanSchema),
    defaultValues: {
      principal: undefined,
      interest_rate: DEFAULT_LOAN_INTEREST_RATE,
      start_date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const rate = watch('interest_rate') ?? DEFAULT_LOAN_INTEREST_RATE;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="principal"
        control={control}
        render={({ field }) => (
          <AmountInput
            label="Loan amount"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.principal?.message}
          />
        )}
      />
      <Input
        label={`Interest rate per month (${rateToPercentLabel(rate)} default)`}
        type="number"
        step="0.0001"
        {...register('interest_rate', { valueAsNumber: true })}
        error={errors.interest_rate?.message}
      />
      <Input
        label="Loan start date"
        type="date"
        {...register('start_date')}
        error={errors.start_date?.message}
      />
      <Input label="Notes (optional)" {...register('notes')} error={errors.notes?.message} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting}>
          Record loan
        </Button>
      </div>
    </form>
  );
}
