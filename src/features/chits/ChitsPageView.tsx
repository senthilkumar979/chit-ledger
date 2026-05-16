'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Landmark, Plus } from 'lucide-react';
import { fetchChits, createChit } from '@/services/chits';
import { ChitsHero } from './ChitsHero';
import { ChitsToolbar } from './ChitsToolbar';
import { ChitCard } from './ChitCard';
import { ChitCardSkeleton } from './ChitCardSkeleton';
import { ChitForm } from './ChitForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChitFormData } from '@/schemas/chit';
import type { ChitStatusFilter } from '@/constants/chit-labels';
import type { Chit } from '@/types/database';

interface ChitsPageViewProps {
  canWrite: boolean;
}

function matchesStatus(chit: Chit, filter: ChitStatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return !chit.matured && !chit.withdrawal;
  if (filter === 'matured') return chit.matured && !chit.withdrawal;
  return chit.withdrawal;
}

export function ChitsPageView({ canWrite }: ChitsPageViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChitStatusFilter>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['chits', search],
    queryFn: () => fetchChits(search),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      return matchesStatus(c, statusFilter);
    });
  }, [data, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      active: list.filter((c) => !c.matured && !c.withdrawal).length,
      matured: list.filter((c) => c.matured && !c.withdrawal).length,
      withdrawn: list.filter((c) => c.withdrawal).length,
    };
  }, [data]);

  async function handleCreate(form: ChitFormData) {
    const chit = await createChit(form);
    toast.success('Chit created with 20 installments');
    setShowForm(false);
    refetch();
    router.push(`/chits/${chit.id}`);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <ChitsHero {...stats} />
      <ChitsToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        view={view}
        onViewChange={setView}
        resultCount={filtered.length}
        canWrite={canWrite}
        onAdd={() => setShowForm(true)}
      />

      {isLoading ? (
        <div className={cn('grid gap-4', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : '')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ChitCardSkeleton key={i} />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyChits
          canWrite={canWrite}
          hasFilters={Boolean(search || typeFilter || statusFilter !== 'all')}
          onAdd={() => setShowForm(true)}
        />
      ) : (
        <div
          className={cn(
            view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3',
          )}
        >
          {filtered.map((chit, i) => (
            <ChitCard key={chit.id} chit={chit} index={i} variant={view} />
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create new chit" className="max-w-lg">
        <p className="mb-5 text-sm text-muted">
          Select a member and scheme. Twenty installments will be generated instantly.
        </p>
        <ChitForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

function EmptyChits({
  canWrite,
  hasFilters,
  onAdd,
}: {
  canWrite: boolean;
  hasFilters: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-gradient-to-b from-card to-surface/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/20">
        <Landmark className="h-8 w-8 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-primary">
        {hasFilters ? 'No chits match filters' : 'Start your first chit'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {hasFilters
          ? 'Adjust type or status filters, or clear your search.'
          : 'Link a member to a ₹1L or ₹2L scheme with automatic installment schedules.'}
      </p>
      {canWrite && !hasFilters ? (
        <Button variant="accent" className="mt-6 shadow-md shadow-accent/20" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Create chit
        </Button>
      ) : null}
    </div>
  );
}
