'use client';

import Link from 'next/link';
import { ArrowUpRight, MapPin, Phone, StickyNote } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { getAvatarGradient, getInitials } from '@/utils/person-avatar';
import type { Person } from '@/types/database';

interface PersonCardProps {
  person: Person;
  index?: number;
  variant?: 'grid' | 'list';
}

export function PersonCard({ person, index = 0, variant = 'grid' }: PersonCardProps) {
  const initials = getInitials(person.name);
  const gradient = getAvatarGradient(person.name);
  const hasNotes = Boolean(person.notes?.trim());

  return (
    <Link
      href={`/persons/${person.id}`}
      className={cn(
        'member-card-enter group relative block rounded-2xl border border-border/80 bg-card',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        variant === 'list' ? 'p-4 sm:flex sm:items-center sm:gap-6' : 'p-5',
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
          'bg-gradient-to-br from-accent/[0.04] via-transparent to-info/[0.04]',
          'group-hover:opacity-100',
        )}
      />
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            'bg-gradient-to-br text-sm font-bold text-white shadow-md',
            'ring-2 ring-card transition-transform duration-300 group-hover:scale-105',
            gradient,
          )}
        >
          {initials || '?'}
          {hasNotes ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-card"
              title="Has notes"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-primary transition-colors group-hover:text-accent">
              {person.name}
            </h3>
            <ArrowUpRight
              className={cn(
                'h-4 w-4 shrink-0 text-muted opacity-0 transition-all duration-300',
                'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100',
              )}
            />
          </div>
          <div
            className={cn(
              'mt-2',
              variant === 'list' ? 'flex flex-wrap items-center gap-x-4 gap-y-1' : 'space-y-1.5',
            )}
          >
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent/70" />
              {person.city}
            </span>
            {person.phone ? (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {person.phone}
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              'flex items-center justify-between',
              variant === 'list' ? 'mt-1 sm:mt-0 sm:ml-auto sm:border-0 sm:pt-0' : 'mt-3 border-t border-border/60 pt-3',
            )}
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted/80">
              Joined {formatDate(person.created_at)}
            </span>
            {hasNotes ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-[11px] text-muted">
                <StickyNote className="h-3 w-3" />
                Notes
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
