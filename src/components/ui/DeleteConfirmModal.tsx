'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title,
  description,
  confirmLabel = 'Delete permanently',
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isDeleting && onClose()} title={title}>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="flex-1 sm:flex-none"
          disabled={isDeleting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          className="flex-1 sm:flex-none"
          isLoading={isDeleting}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
