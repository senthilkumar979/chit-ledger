'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personSchema, type PersonFormData } from '@/schemas/person';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PersonFormProps {
  defaultValues?: Partial<PersonFormData>;
  onSubmit: (data: PersonFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function PersonForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save member',
}: PersonFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: '',
      city: '',
      phone: '',
      notes: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" placeholder="e.g. Rajesh Kumar" error={errors.name?.message} {...register('name')} />
        <Input label="City" placeholder="e.g. Chennai" error={errors.city?.message} {...register('city')} />
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
