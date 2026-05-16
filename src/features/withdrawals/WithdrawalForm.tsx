'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { withdrawalSchema, type WithdrawalFormData } from '@/schemas/withdrawal';
import { PaymentModes, paymentModeOptions } from '@/constants/payment-modes';
import { recordWithdrawal } from '@/services/withdrawals';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

const defaultWithdrawalValues = (): WithdrawalFormData => ({
  withdrawal_date: new Date().toISOString().split('T')[0],
  withdrawal_by: '',
  withdrawal_payment_mode: PaymentModes.CASH,
});

interface WithdrawalFormProps {
  chitId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function WithdrawalForm({ chitId, onSuccess, onCancel }: WithdrawalFormProps) {
  const [proof, setProof] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: defaultWithdrawalValues(),
  });

  async function submit(data: WithdrawalFormData) {
    await recordWithdrawal(chitId, data, proof ?? undefined);
    toast.success('Withdrawal recorded');
    reset(defaultWithdrawalValues());
    setProof(null);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input
        label="Withdrawal date"
        type="date"
        error={errors.withdrawal_date?.message}
        {...register('withdrawal_date')}
      />
      <Input label="Taken by" error={errors.withdrawal_by?.message} {...register('withdrawal_by')} />
      <Select
        label="Payment mode"
        options={paymentModeOptions}
        error={errors.withdrawal_payment_mode?.message}
        {...register('withdrawal_payment_mode')}
      />
      <div>
        <label className="text-sm font-medium text-primary">Proof upload</label>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/50 px-4 py-8 transition-colors hover:border-accent/40 hover:bg-accent/5">
          <Upload className="mb-2 h-8 w-8 text-muted" />
          <span className="text-sm font-medium text-primary">
            {proof ? proof.name : 'Drop image or PDF'}
          </span>
          <span className="mt-1 text-xs text-muted">PNG, JPG, or PDF</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => setProof(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="accent"
          className="flex-1 shadow-md shadow-accent/15 sm:flex-none"
          isLoading={isSubmitting}
        >
          Record withdrawal
        </Button>
      </div>
    </form>
  );
}
