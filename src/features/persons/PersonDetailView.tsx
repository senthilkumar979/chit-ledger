'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPersonById } from '@/services/persons';
import { fetchChitsByPerson, createChit } from '@/services/chits';
import { ChitForm } from '@/features/chits/ChitForm';
import { BackLink } from '@/components/layout/BackLink';
import { Modal } from '@/components/ui/Modal';
import { PersonDetailHero } from './PersonDetailHero';
import { PersonDetailToolbar } from './PersonDetailToolbar';
import { PersonLinkedChits } from './PersonLinkedChits';
import { PersonDetailSkeleton } from './PersonDetailSkeleton';
import { invalidateChitQueries } from '@/lib/invalidate-chit-queries';
import { getPrimaryPersonName } from '@/utils/person-display';
import { toast } from 'sonner';
import type { ChitFormData } from '@/schemas/chit';

interface PersonDetailViewProps {
  personId: string;
  canWrite: boolean;
  canDelete: boolean;
}

export function PersonDetailView({
  personId,
  canWrite,
  canDelete,
}: PersonDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showChitForm, setShowChitForm] = useState(false);

  const { data: person, isLoading, refetch } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => fetchPersonById(personId),
  });

  const { data: chits = [] } = useQuery({
    queryKey: ['chits-by-person', personId],
    queryFn: () => fetchChitsByPerson(personId),
    enabled: Boolean(person),
  });

  async function handleCreateChit(form: ChitFormData) {
    await createChit(form);
    toast.success('Chit created with 20 installments');
    setShowChitForm(false);
    await invalidateChitQueries(queryClient, { personId });
  }

  if (isLoading) return <PersonDetailSkeleton />;

  if (!person) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-muted">Member not found.</p>
        <BackLink href="/persons" label="Back to members" className="mt-4 inline-flex" />
      </div>
    );
  }

  const personDisplayName = getPrimaryPersonName(person);

  return (
    <div className="space-y-6 sm:space-y-8">
      <BackLink href="/persons" label="Back to members" />
      <PersonDetailHero person={person} chitCount={chits.length} />
      <PersonDetailToolbar
        person={person}
        personId={personId}
        canWrite={canWrite}
        canDelete={canDelete}
        onUpdated={() => {
          void refetch();
        }}
        onDeleted={() => router.push('/persons')}
      />
      <PersonLinkedChits
        chits={chits}
        canWrite={canWrite}
        onAddChit={canWrite ? () => setShowChitForm(true) : undefined}
      />

      <Modal
        isOpen={showChitForm}
        onClose={() => setShowChitForm(false)}
        title="Create chit for member"
        className="max-w-lg"
      >
        <p className="mb-5 text-sm text-muted">
          Link a scheme to {personDisplayName}. Twenty installments are generated on save.
        </p>
        <ChitForm
          lockPersonId={personId}
          onSubmit={handleCreateChit}
          onCancel={() => setShowChitForm(false)}
        />
      </Modal>
    </div>
  );
}
