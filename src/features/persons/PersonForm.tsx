'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personSchema, type PersonFormData } from '@/schemas/person';
import { MemberCities } from '@/constants/member-cities';
import { transliteratePersonName } from '@/utils/transliterate-person-name';
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

function buildDefaultValues(defaultValues?: PersonFormProps['defaultValues']): PersonFormData {
  return {
    name: '',
    name_tamil: defaultValues?.name_tamil ?? transliteratePersonName(defaultValues?.name ?? ''),
    city: '' as PersonFormData['city'],
    phone: '',
    notes: '',
    ...defaultValues,
  } as PersonFormData;
}

export function PersonForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save member',
}: PersonFormProps) {
  const cityOptions = useMemo(() => buildCityOptions(defaultValues?.city), [defaultValues?.city]);
  const formDefaults = useMemo(() => buildDefaultValues(defaultValues), [defaultValues]);
  const [isTamilAuto, setIsTamilAuto] = useState(() => !defaultValues?.name_tamil);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: formDefaults,
  });

  const name = watch('name');
  const tamilField = register('name_tamil');

  useEffect(() => {
    if (!isTamilAuto) return;
    setValue('name_tamil', transliteratePersonName(name ?? ''), {
      shouldDirty: Boolean(name),
      shouldValidate: true,
    });
  }, [isTamilAuto, name, setValue]);

  useEffect(() => {
    setIsTamilAuto(!defaultValues?.name_tamil);
  }, [defaultValues?.name_tamil]);

  function handleRegenerateTamil() {
    setIsTamilAuto(true);
    setValue('name_tamil', transliteratePersonName(name ?? ''), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="English name"
          placeholder="e.g. Rajesh Kumar"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="person-name-tamil" className="text-sm font-medium text-primary">
              Tamil name
            </label>
            <Button type="button" variant="ghost" size="sm" onClick={handleRegenerateTamil}>
              Regenerate Tamil
            </Button>
          </div>
          <Input
            id="person-name-tamil"
            placeholder="தமிழ் பெயர்"
            error={errors.name_tamil?.message}
            {...tamilField}
            onChange={(event) => {
              setIsTamilAuto(false);
              tamilField.onChange(event);
            }}
          />
          <p className="text-xs text-muted">
            Auto-generated from the English name. You can edit the Tamil name anytime.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="City"
          placeholder="Select city"
          options={cityOptions}
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+91 …"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <Input
        label="Notes"
        placeholder="Optional context for this member"
        error={errors.notes?.message}
        {...register('notes')}
      />
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
