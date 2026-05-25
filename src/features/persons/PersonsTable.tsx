'use client';

import { useRouter } from 'next/navigation';
import { MapPin, StickyNote } from 'lucide-react';
import { ActiveChitsLabel } from './ActiveChitsLabel';
import { WithdrawnChitsLabel } from './WithdrawnChitsLabel';
import { getAvatarGradient, getInitials } from '@/utils/person-avatar';
import { getPrimaryPersonName, getSecondaryPersonName } from '@/utils/person-display';
import { cn } from '@/lib/utils';
import type { PersonWithStats } from '@/services/persons';

interface PersonsTableProps {
  persons: PersonWithStats[];
  emptyMessage: string;
}

export function PersonsTable({ persons, emptyMessage }: PersonsTableProps) {
  const router = useRouter();

  if (!persons.length) {
    return <p className="py-12 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-surface/60 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Active chits</th>
            <th className="px-4 py-3">Withdrawn chits</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {persons.map((person) => {
            const primaryName = getPrimaryPersonName(person);
            const secondaryName = getSecondaryPersonName(person);
            const initials = getInitials(primaryName);
            const gradient = getAvatarGradient(primaryName);
            const hasNotes = Boolean(person.notes?.trim());

            return (
              <tr
                key={person.id}
                className="cursor-pointer transition-colors hover:bg-surface/40"
                onClick={() => router.push(`/persons/${person.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white',
                        gradient,
                      )}
                    >
                      {initials || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-primary">{primaryName}</p>
                      {secondaryName ? (
                        <p className="truncate text-xs text-muted">{secondaryName}</p>
                      ) : null}
                      {hasNotes ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <StickyNote className="h-3 w-3" />
                          Notes
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-accent/70" />
                    {person.city}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{person.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <ActiveChitsLabel count={person.activeChitCount} compact />
                </td>
                <td className="px-4 py-3">
                  <WithdrawnChitsLabel
                    withdrawn={person.withdrawnActiveChitCount ?? 0}
                    activeTotal={person.activeChitCount ?? 0}
                    compact
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
