'use client';

import { Landmark, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PersonLinkedChitItem } from './PersonLinkedChitItem';
import { getChitLifecycleStatus } from '@/features/chits/chit-status';
import type { Chit } from '@/types/database';

interface PersonLinkedChitsProps {
  chits: Chit[];
  canWrite: boolean;
  onAddChit?: () => void;
}

function countByLifecycle(chits: Chit[], match: 'active' | 'withdrawn' | 'matured'): number {
  return chits.filter((c) => {
    const { label } = getChitLifecycleStatus(c);
    if (match === 'active') return label === 'Active';
    if (match === 'withdrawn') return label === 'Withdrawn';
    return label === 'Matured';
  }).length;
}

export function PersonLinkedChits({ chits, canWrite, onAddChit }: PersonLinkedChitsProps) {
  const activeCount = countByLifecycle(chits, 'active');
  const maturedCount = countByLifecycle(chits, 'matured');
  const withdrawnCount = countByLifecycle(chits, 'withdrawn');

  return (
    <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-lg font-semibold text-primary">Linked chits</h2>
          <p className="mt-0.5 text-sm text-muted">Schemes and payment progress for this member</p>
        </div>
        {canWrite && onAddChit ? (
          <Button type="button" variant="accent" size="sm" onClick={onAddChit} className="shrink-0">
            <Plus className="h-4 w-4" />
            New chit
          </Button>
        ) : null}
      </header>

      {chits.length === 0 ? (
        <EmptyLinkedChits canWrite={canWrite} onAddChit={onAddChit} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-border/60 px-4 py-3 sm:px-5">
            <PortfolioChip label="Total" value={chits.length} />
            <PortfolioChip label="Active" value={activeCount} tone="accent" />
            <PortfolioChip label="Matured" value={maturedCount} tone="info" />
            <PortfolioChip label="Withdrawn" value={withdrawnCount} tone="danger" />
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            {chits.map((chit, index) => (
              <PersonLinkedChitItem key={chit.id} chit={chit} index={index} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function PortfolioChip({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'accent' | 'info' | 'danger';
}) {
  const toneClass = {
    default: 'bg-surface text-primary',
    accent: 'bg-accent/10 text-accent',
    info: 'bg-info/10 text-info',
    danger: 'bg-danger/10 text-danger',
  }[tone];

  return (
    <div className={`rounded-lg px-3 py-1.5 ${toneClass}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
      <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
    </div>
  );
}

function EmptyLinkedChits({
  canWrite,
  onAddChit,
}: {
  canWrite: boolean;
  onAddChit?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
        <Landmark className="h-7 w-7 text-accent" />
      </div>
      <p className="font-medium text-primary">No chits yet</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Create a scheme to start tracking installments and withdrawals.
      </p>
      {canWrite && onAddChit ? (
        <Button type="button" variant="accent" size="sm" className="mt-5" onClick={onAddChit}>
          <Plus className="h-4 w-4" />
          Create first chit
        </Button>
      ) : null}
    </div>
  );
}
