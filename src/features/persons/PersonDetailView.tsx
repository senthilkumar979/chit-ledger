'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchPersonById } from '@/services/persons';
import { fetchChitsByPerson } from '@/services/chits';
import { BackLink } from '@/components/layout/BackLink';
import { PersonDetailHero } from './PersonDetailHero';
import { PersonDetailToolbar } from './PersonDetailToolbar';
import { PersonLinkedChits } from './PersonLinkedChits';
import { PersonDetailSkeleton } from './PersonDetailSkeleton';

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

  const { data: person, isLoading, refetch } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => fetchPersonById(personId),
  });

  const { data: chits = [] } = useQuery({
    queryKey: ['chits-by-person', personId],
    queryFn: () => fetchChitsByPerson(personId),
    enabled: Boolean(person),
  });

  if (isLoading) return <PersonDetailSkeleton />;

  if (!person) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-muted">Member not found.</p>
        <BackLink href="/persons" label="Back to members" className="mt-4 inline-flex" />
      </div>
    );
  }

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
        onAddChit={canWrite ? () => router.push('/chits') : undefined}
      />
    </div>
  );
}
