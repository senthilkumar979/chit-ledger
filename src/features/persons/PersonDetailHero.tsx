'use client';

import { MapPin, Phone, StickyNote, Landmark } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { getAvatarGradient, getInitials } from '@/utils/person-avatar';
import type { Person } from '@/types/database';

interface PersonDetailHeroProps {
  person: Person;
  chitCount: number;
}

export function PersonDetailHero({ person, chitCount }: PersonDetailHeroProps) {
  const initials = getInitials(person.name);
  const gradient = getAvatarGradient(person.name);
  const hasNotes = Boolean(person.notes?.trim());

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-secondary to-primary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-info/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-5">
          <div
            className={cn(
              'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold',
              'bg-gradient-to-br shadow-lg ring-4 ring-white/10',
              gradient,
            )}
          >
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Member profile
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{person.name}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" />
                {person.city}
              </span>
              {person.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {person.phone}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:justify-end">
          <StatChip icon={Landmark} label="Chits" value={chitCount} />
          <StatChip icon={StickyNote} label="Since" value={formatDate(person.created_at)} compact />
        </div>
      </div>

      {hasNotes && person.notes ? (
        <p className="relative mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/85">
          {person.notes}
        </p>
      ) : null}
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  compact,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className="min-w-[100px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-white/50">
        <Icon className="h-3.5 w-3.5 text-accent" />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn('mt-1 font-semibold tabular-nums text-white', compact ? 'text-sm' : 'text-xl')}>
        {value}
      </p>
    </div>
  );
}
