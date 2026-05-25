'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteGrant, fetchGrantById, updateGrant } from '@/services/grants';
import { BackLink } from '@/components/layout/BackLink';
import { GrantDetailSummary } from './GrantDetailSummary';
import { GrantForm } from './GrantForm';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { invalidateGrantQueries } from '@/lib/invalidate-grant-queries';
import { getDisplayPersonLabel } from '@/utils/person-display';
import { toast } from 'sonner';
import type { GrantFormData } from '@/schemas/grant';

interface GrantDetailViewProps {
  grantId: string;
  canManageGrants: boolean;
  canDelete: boolean;
}

export function GrantDetailView({ grantId, canManageGrants, canDelete }: GrantDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: grant, isLoading } = useQuery({
    queryKey: ['grant', grantId],
    queryFn: () => fetchGrantById(grantId),
  });

  async function handleUpdate(form: GrantFormData) {
    await updateGrant(grantId, form);
    toast.success('Grant updated');
    setEditOpen(false);
    await invalidateGrantQueries(queryClient, grantId);
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteGrant(grantId);
      toast.success('Grant deleted');
      await invalidateGrantQueries(queryClient);
      router.push('/grants');
    } catch {
      toast.error('Could not delete grant');
      setIsDeleting(false);
    }
  }

  if (isLoading || !grant) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <BackLink href="/grants" label="Back to grants" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Grant details</h1>
          <p className="mt-1 text-sm text-muted">
            {getDisplayPersonLabel(grant.grant_to, 'Member')} · {grant.grant_to?.city ?? ''}
          </p>
        </div>
        {(canManageGrants || canDelete) && (
          <div className="flex flex-wrap gap-2">
            {canManageGrants ? (
              <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            ) : null}
            {canDelete ? (
              <Button type="button" variant="outline" className="text-danger" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            ) : null}
          </div>
        )}
      </div>

      <GrantDetailSummary grant={grant} />

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit grant" className="max-w-lg">
        <GrantForm
          initialGrant={grant}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete grant?"
        description="This permanently removes the grant record."
      />
    </div>
  );
}
