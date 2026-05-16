'use client';

import Link from 'next/link';
import { Landmark, Plus, ArrowUpRight } from 'lucide-react';
import { chitTypeLabels, chitTypeStyles } from '@/constants/chit-labels';
import { cn } from '@/lib/utils';
import type { Chit } from '@/types/database';

interface PersonLinkedChitsProps {
  chits: Chit[];
  canWrite: boolean;
  onAddChit?: () => void;
}

export function PersonLinkedChits({ chits, canWrite, onAddChit }: PersonLinkedChitsProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">Linked chits</h2>
          <p className="text-sm text-muted">{chits.length} scheme{chits.length !== 1 ? 's' : ''}</p>
        </div>
        {canWrite && onAddChit ? (
          <button
            type="button"
            onClick={onAddChit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/15"
          >
            <Plus className="h-4 w-4" />
            New chit
          </button>
        ) : null}
      </div>

      {chits.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <Landmark className="mb-3 h-10 w-10 text-muted/40" />
          <p className="text-sm text-muted">No chits linked to this member yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {chits.map((chit) => (
            <li key={chit.id}>
              <Link
                href={`/chits/${chit.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface/80"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                    chitTypeStyles[chit.type],
                  )}
                >
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary group-hover:text-accent">
                    {chitTypeLabels[chit.type]} · {chit.category}
                  </p>
                  <p className="text-xs text-muted">
                    {chit.matured ? 'Matured' : 'Active'}
                    {chit.withdrawal ? ' · Withdrawn' : ''}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
