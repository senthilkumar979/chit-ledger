'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users } from 'lucide-react';
import { fetchPersonsWithStats, createPerson } from '@/services/persons';
import { usePersonsViewMode } from '@/hooks/usePersonsViewMode';
import { PersonsHero } from './PersonsHero';
import { PersonsToolbar } from './PersonsToolbar';
import { PersonCard } from './PersonCard';
import { PersonCardSkeleton } from './PersonCardSkeleton';
import { PersonsTable } from './PersonsTable';
import { PersonsTableSkeleton } from './PersonsTableSkeleton';
import { PersonForm } from './PersonForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PersonFormData } from '@/schemas/person';

interface PersonsPageViewProps {
  canWrite: boolean;
}

export function PersonsPageView({ canWrite }: PersonsPageViewProps) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { view, setView, isReady } = usePersonsViewMode();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['persons', search],
    queryFn: () => fetchPersonsWithStats(search),
  });

  const cities = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((p) => p.city))].sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!cityFilter) return data;
    return data.filter((p) => p.city === cityFilter);
  }, [data, cityFilter]);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      cityCount: new Set(list.map((p) => p.city)).size,
      withPhone: list.filter((p) => p.phone).length,
    };
  }, [data]);

  async function handleCreate(form: PersonFormData) {
    await createPerson(form);
    toast.success('Member added successfully');
    setShowForm(false);
    refetch();
  }

  const emptyMessage = search || cityFilter
    ? 'No matching members for the current filters.'
    : 'No members yet.';

  return (
    <div className="space-y-6 sm:space-y-8">
      <PersonsHero {...stats} />
      <PersonsToolbar
        search={search}
        onSearchChange={setSearch}
        cities={cities}
        cityFilter={cityFilter}
        onCityFilter={setCityFilter}
        view={view}
        onViewChange={setView}
        resultCount={filtered.length}
        canWrite={canWrite}
        onAdd={() => setShowForm(true)}
      />

      {!isReady || isLoading ? (
        <MembersLoading view={view} />
      ) : !filtered.length ? (
        <EmptyMembers canWrite={canWrite} hasFilters={Boolean(search || cityFilter)} onAdd={() => setShowForm(true)} />
      ) : view === 'table' ? (
        <PersonsTable persons={filtered} emptyMessage={emptyMessage} />
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
              : 'flex flex-col gap-3',
          )}
        >
          {filtered.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i} variant={view} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add new member"
        className="max-w-lg"
      >
        <p className="mb-5 text-sm text-muted">
          Members can be linked to multiple chits and payment schedules.
        </p>
        <PersonForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Create member" />
      </Modal>
    </div>
  );
}

function MembersLoading({ view }: { view: 'grid' | 'list' | 'table' }) {
  if (view === 'table') return <PersonsTableSkeleton />;

  return (
    <div className={cn('grid gap-4', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : '')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <PersonCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyMembers({
  canWrite,
  hasFilters,
  onAdd,
}: {
  canWrite: boolean;
  hasFilters: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
        <Users className="h-8 w-8 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-primary">
        {hasFilters ? 'No matching members' : 'Build your member roster'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {hasFilters
          ? 'Try a different search or clear city filters.'
          : 'Add members to start creating chits and tracking installments.'}
      </p>
      {canWrite && !hasFilters ? (
        <Button variant="accent" className="mt-6" onClick={onAdd}>
          <UserPlus className="h-4 w-4" />
          Add first member
        </Button>
      ) : null}
    </div>
  );
}
