'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { updatePerson, deletePerson } from '@/services/persons';
import { PersonForm } from './PersonForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { Person } from '@/types/database';
import type { PersonFormData } from '@/schemas/person';

interface PersonDetailToolbarProps {
  person: Person;
  personId: string;
  canWrite: boolean;
  canDelete: boolean;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function PersonDetailToolbar({
  person,
  personId,
  canWrite,
  canDelete,
  onUpdated,
  onDeleted,
}: PersonDetailToolbarProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleUpdate(form: PersonFormData) {
    await updatePerson(personId, form);
    toast.success('Profile updated');
    setEditOpen(false);
    onUpdated();
  }

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      await deletePerson(personId);
      toast.success('Member removed');
      setDeleteOpen(false);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete member');
    } finally {
      setIsDeleting(false);
    }
  }

  if (!canWrite && !canDelete) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canWrite ? (
          <Button variant="outline" size="md" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit profile
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="danger" size="md" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete member
          </Button>
        ) : null}
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        className="max-w-lg"
      >
        <PersonForm
          key={`${person.id}-${person.updated_at}`}
          defaultValues={{
            name: person.name,
            name_tamil: person.name_tamil ?? '',
            city: person.city,
            phone: person.phone ?? '',
            notes: person.notes ?? '',
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        title="Delete member?"
      >
        <p className="text-sm leading-relaxed text-muted">
          Deleting removes this member permanently. Chits will also be cleared along with this.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={isDeleting}
            onClick={() => setDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1 sm:flex-none"
            isLoading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </>
  );
}
