'use client';

import { Pencil, RotateCcw } from 'lucide-react';
import type { Payment } from '@/types/database';
import { cn } from '@/lib/utils';

export interface PaymentScheduleRowActionsProps {
  payment: Payment;
  canWrite: boolean;
  confirmReset: string | null;
  onConfirmReset: (id: string | null) => void;
  onMarkPaid?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onReset?: (payment: Payment) => void;
  className?: string;
  layout?: 'inline' | 'stacked';
}

export function PaymentScheduleRowActions({
  payment: p,
  canWrite,
  confirmReset,
  onConfirmReset,
  onMarkPaid,
  onEdit,
  onReset,
  className,
  layout = 'inline',
}: PaymentScheduleRowActionsProps) {
  const isPaid = p.status === 'paid' || p.status === 'partial';
  const isConfirming = confirmReset === p.id;
  const stacked = layout === 'stacked';

  if (!canWrite) return null;

  const btnBase = cn(
    'rounded-lg text-xs font-medium transition-colors',
    stacked ? 'min-h-10 flex-1 px-3 py-2.5 sm:min-h-9' : 'px-3 py-1.5',
  );

  return (
    <div className={cn('flex flex-wrap gap-2', stacked && 'w-full', className)} role="group">
      {!isPaid && onMarkPaid ? (
        <button
          type="button"
          onClick={() => onMarkPaid(p)}
          className={cn(btnBase, 'bg-accent text-white shadow-sm shadow-accent/20', stacked && 'w-full sm:flex-1')}
        >
          {stacked ? 'Record payment' : 'Record'}
        </button>
      ) : null}
      {isPaid && onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(p)}
          className={cn(
            btnBase,
            'inline-flex items-center justify-center gap-1 border border-border bg-card hover:bg-surface',
            stacked && 'flex-1',
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      ) : null}
      {isPaid && onReset ? (
        isConfirming ? (
          <>
            <button
              type="button"
              onClick={() => onReset(p)}
              className={cn(btnBase, 'bg-danger text-white', stacked && 'flex-1')}
            >
              Confirm reset
            </button>
            <button
              type="button"
              onClick={() => onConfirmReset(null)}
              className={cn(btnBase, 'border border-border bg-card', stacked && 'flex-1')}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onConfirmReset(p.id)}
            className={cn(
              btnBase,
              'inline-flex items-center justify-center gap-1 border border-danger/30 text-danger hover:bg-danger/5',
              stacked && 'flex-1',
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )
      ) : null}
    </div>
  );
}

