'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personSchema, type PersonFormData } from '@/schemas/person';
import { MemberCities } from '@/constants/member-cities';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface PersonFormProps {
  defaultValues?: Partial<Omit<PersonFormData, 'city'>> & { city?: string };
  onSubmit: (data: PersonFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function buildCityOptions(currentCity?: string) {
  const extras =
    currentCity && !(MemberCities as readonly string[]).includes(currentCity) ? [currentCity] : [];
  return [...MemberCities, ...extras].map((city) => ({ value: city, label: city }));
}

export function PersonForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save member',
}: PersonFormProps) {
  const cityOptions = useMemo(() => buildCityOptions(defaultValues?.city), [defaultValues?.city]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: '',
      city: '' as PersonFormData['city'],
      phone: '',
      notes: '',
      ...defaultValues,
    } as PersonFormData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" placeholder="e.g. Rajesh Kumar" error={errors.name?.message} {...register('name')} />
        <Select
          label="City"
          placeholder="Select city"
          options={cityOptions}
          error={errors.city?.message}
          {...register('city')}
        />
      </div>
      <Input label="Phone" type="tel" placeholder="+91 …" error={errors.phone?.message} {...register('phone')} />
      <Input label="Notes" placeholder="Optional context for this member" error={errors.notes?.message} {...register('notes')} />
      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" className="flex-1 shadow-md shadow-accent/15" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
