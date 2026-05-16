'use client';

import { Building2, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonsHeroProps {
  total: number;
  cityCount: number;
  withPhone: number;
}

export function PersonsHero({ total, cityCount, withPhone }: PersonsHeroProps) {
  const stats = [
    { label: 'Total members', value: total, icon: Users },
    { label: 'Cities', value: cityCount, icon: MapPin },
    { label: 'With phone', value: withPhone, icon: Building2 },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-secondary to-primary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-info/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          Member directory
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Your chit fund network
        </h1>
        <p className="mt-2 max-w-md text-sm text-white/70">
          Manage members, contacts, and cities — every profile links to chits and payments.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className={cn(
                'rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm',
                'transition-colors hover:bg-white/10 sm:px-4 sm:py-4',
              )}
            >
              <Icon className="mb-2 h-4 w-4 text-accent" />
              <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
