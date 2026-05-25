'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { chitTypeLabels } from '@/constants/chit-labels';
import { formatDate } from '@/lib/utils';
import { duplicateChit } from '@/services/chits';
import { getDisplayPersonLabel } from '@/utils/person-display';
import type { Chit, ChitWithPayments } from '@/types/database';
import { useState } from 'react';
import { toast } from 'sonner';

interface DuplicateChitModalProps {
  chit: ChitWithPayments;
  isOpen: boolean;
  onClose: () => void;
  onDuplicated: (newChit: Chit) => void;
}

export function DuplicateChitModal({
  chit,
  isOpen,
  onClose,
  onDuplicated,
}: DuplicateChitModalProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const memberName = getDisplayPersonLabel(chit.person, 'Member');
  const typeLabel = chitTypeLabels[chit.type] ?? chit.type;
  const startLabel = chit.start_date ? formatDate(chit.start_date) : 'Not set';
  const endLabel = chit.end_date ? formatDate(chit.end_date) : 'Not set';

  async function handleConfirm() {
    try {
      setIsDuplicating(true);
      const newChit = await duplicateChit(chit);
      onDuplicated(newChit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not duplicate chit');
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isDuplicating && onClose()}
      title="Duplicate chit?"
      className="max-w-md"
    >
      <p className="text-sm leading-relaxed text-muted">
        Creates a new chit with the same member, scheme, category, and dates. A fresh
        20-installment schedule is generated; payments and withdrawal are not copied.
      </p>
      <dl className="mt-4 space-y-2 rounded-xl border border-border/80 bg-surface/60 p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Member</dt>
          <dd className="font-medium text-primary">{memberName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Scheme</dt>
          <dd className="font-medium text-primary">{typeLabel}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Category</dt>
          <dd className="font-medium text-primary">{chit.category}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Start</dt>
          <dd className="font-medium text-primary">{startLabel}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">End</dt>
          <dd className="font-medium text-primary">{endLabel}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="flex-1 sm:flex-none"
          disabled={isDuplicating}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="accent"
          className="flex-1 sm:flex-none"
          isLoading={isDuplicating}
          onClick={handleConfirm}
        >
          Duplicate chit
        </Button>
      </div>
    </Modal>
  );
}
