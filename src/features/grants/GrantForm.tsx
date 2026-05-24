'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  grantRateToPercent,
  grantSchema,
  type GrantFormData,
} from '@/schemas/grant';
import { DEFAULT_GRANT_INTEREST_RATE } from '@/constants/grants';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import { fetchPersons } from '@/services/persons';
import type { Grant } from '@/types/database';
import { AmountInput } from '@/components/ui/AmountInput';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface GrantFormProps {
  initialGrant?: Grant;
  onSubmit: (data: GrantFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function GrantForm({
  initialGrant,
  onSubmit,
  onCancel,
  submitLabel = 'Save grant',
}: GrantFormProps) {
  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => fetchPersons(),
  });

  const personOptions =
    persons?.map((p) => ({ value: p.id, label: `${p.name} · ${p.city}` })) ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GrantFormData>({
    resolver: zodResolver(grantSchema),
    defaultValues: initialGrant
      ? {
          grant_to_person_id: initialGrant.grant_to_person_id,
          amount: initialGrant.amount,
          interest_start_date: initialGrant.interest_start_date,
          interest_percent: grantRateToPercent(initialGrant.interest_rate),
          notes: initialGrant.notes ?? '',
        }
      : {
          grant_to_person_id: '',
          amount: undefined,
          interest_start_date: new Date().toISOString().slice(0, 10),
          interest_percent: grantRateToPercent(DEFAULT_GRANT_INTEREST_RATE),
          notes: '',
        },
  });

  const interestPercent = watch('interest_percent') ?? grantRateToPercent(DEFAULT_GRANT_INTEREST_RATE);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Grant to person"
        options={personOptions}
        placeholder={persons ? 'Select member' : 'Loading members…'}
        disabled={!persons?.length}
        error={errors.grant_to_person_id?.message}
        {...register('grant_to_person_id')}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <AmountInput
            label="Grant amount"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.amount?.message}
          />
        )}
      />
      <Input
        label="Interest start date"
        type="date"
        {...register('interest_start_date')}
        error={errors.interest_start_date?.message}
      />
      <Input
        label={`Interest per month (%) — default ${rateToPercentLabel(DEFAULT_GRANT_INTEREST_RATE)}`}
        type="number"
        step="0.01"
        {...register('interest_percent', { valueAsNumber: true })}
        error={errors.interest_percent?.message}
      />
      <p className="-mt-2 text-xs text-muted">
        Stored rate: {rateToPercentLabel(interestPercent / 100)} per month on the grant amount
      </p>
      <Input label="Notes (optional)" {...register('notes')} error={errors.notes?.message} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
