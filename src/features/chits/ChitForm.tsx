'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { chitSchema, type ChitFormData } from '@/schemas/chit';
import { ChitTypes } from '@/constants/chit-config';
import { chitTypeLabels } from '@/constants/chit-labels';
import { ChitCategories } from '@/constants/chit-categories';
import { fetchPersons } from '@/services/persons';
import { chitEndDateFromStart } from '@/utils/installment-due';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Chit } from '@/types/database';

interface ChitFormProps {
  onSubmit: (data: ChitFormData) => Promise<void>;
  onCancel: () => void;
  mode?: 'create' | 'edit';
  initialChit?: Pick<Chit, 'person_id' | 'type' | 'category' | 'start_date' | 'end_date'>;
}

const typeOptions = [
  { value: ChitTypes.ONE_LAKH, label: '₹1 Lakh — 20 installments' },
  { value: ChitTypes.TWO_LAKH, label: '₹2 Lakh — 20 installments' },
];

const categoryOptions = ChitCategories.map((c) => ({ value: c, label: c }));

function defaultFormValues(
  mode: 'create' | 'edit',
  initialChit?: ChitFormProps['initialChit'],
): ChitFormData {
  if (mode === 'edit' && initialChit) {
    return {
      person_id: initialChit.person_id,
      type: initialChit.type,
      category: initialChit.category as ChitFormData['category'],
      start_date: initialChit.start_date ?? '',
      end_date: initialChit.end_date ?? '',
    };
  }
  return {
    person_id: '',
    type: ChitTypes.ONE_LAKH,
    category: ChitCategories[0],
    start_date: '',
    end_date: '',
  };
}

export function ChitForm({
  onSubmit,
  onCancel,
  mode = 'create',
  initialChit,
}: ChitFormProps) {
  const isEdit = mode === 'edit';
  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => fetchPersons(),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChitFormData>({
    resolver: zodResolver(chitSchema),
    defaultValues: defaultFormValues(mode, initialChit),
  });

  const startDate = watch('start_date');
  const chitType = watch('type');

  useEffect(() => {
    if (startDate) setValue('end_date', chitEndDateFromStart(startDate));
  }, [startDate, setValue]);

  const personOptions =
    persons?.map((p) => ({ value: p.id, label: `${p.name} · ${p.city}` })) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Select
        label="Member"
        options={personOptions}
        placeholder="Select member"
        error={errors.person_id?.message}
        {...register('person_id')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {isEdit ? (
          <div className="sm:col-span-2 rounded-lg border border-border bg-surface/80 px-3 py-3">
            <p className="text-xs font-medium text-muted">Chit type</p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {chitTypeLabels[chitType] ?? chitType}
            </p>
            <p className="mt-1 text-xs text-muted">
              Type cannot be changed after installments are created.
            </p>
            <input type="hidden" {...register('type')} />
          </div>
        ) : (
          <Select label="Chit type" options={typeOptions} {...register('type')} />
        )}
        <Select
          label="Collection schedule"
          options={categoryOptions}
          className={isEdit ? 'sm:col-span-2' : undefined}
          error={errors.category?.message}
          {...register('category')}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Start date"
          type="date"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <div>
          <Input label="End date" type="date" readOnly className="bg-surface/80" {...register('end_date')} />
          <p className="mt-1 text-xs text-muted">Auto-calculated: start + 20 months</p>
        </div>
      </div>
      {!isEdit ? (
        <p className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-muted">
          <span className="font-medium text-accent">Auto-schedule:</span> 20 installments with preset
          amounts are created on save.
        </p>
      ) : (
        <p className="rounded-lg border border-border bg-surface/60 px-3 py-2 text-xs text-muted">
          Updating dates affects due-month views; installment amounts stay on the original scheme.
        </p>
      )}
      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          className="flex-1 shadow-md shadow-accent/15"
          isLoading={isSubmitting}
        >
          {isEdit ? 'Save changes' : 'Create chit'}
        </Button>
      </div>
    </form>
  );
}
