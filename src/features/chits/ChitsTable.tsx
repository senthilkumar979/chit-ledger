'use client';

import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { chitTypeLabels, chitTypeStyles } from '@/constants/chit-labels';
import { INSTALLMENT_COUNT } from '@/constants/chit-config';
import { ChitStatusPill } from './ChitStatusPill';
import { countPaidInstallments, getChitLifecycleStatus, getChitWithdrawalDateLabel } from './chit-status';
import { getAvatarGradient, getInitials } from '@/utils/person-avatar';
import { cn, formatDate } from '@/lib/utils';
import type { Chit } from '@/types/database';

interface ChitsTableProps {
  chits: Chit[];
  emptyMessage: string;
}

export function ChitsTable({ chits, emptyMessage }: ChitsTableProps) {
  const router = useRouter();

  if (!chits.length) {
    return <p className="py-12 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="border-b border-border bg-surface/60 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Scheme</th>
            <th className="px-4 py-3">Schedule</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">Withdrawn</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {chits.map((chit) => {
            const personName = chit.person?.name ?? 'Unknown';
            const initials = getInitials(personName);
            const avatarGradient = getAvatarGradient(personName);
            const typeGradient = chitTypeStyles[chit.type] ?? 'from-primary to-secondary';
            const paidCount = countPaidInstallments(chit);
            const status = getChitLifecycleStatus(chit);

            return (
              <tr
                key={chit.id}
                className="cursor-pointer transition-colors hover:bg-surface/40"
                onClick={() => router.push(`/chits/${chit.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white',
                        avatarGradient,
                      )}
                    >
                      {initials || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-primary">{personName}</p>
                      {chit.person?.city ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <MapPin className="h-3 w-3 text-accent/70" />
                          {chit.person.city}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full bg-gradient-to-r px-2 py-0.5 text-[11px] font-semibold text-white',
                      typeGradient,
                    )}
                  >
                    {chitTypeLabels[chit.type] ?? chit.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{chit.category}</td>
                <td className="px-4 py-3 font-medium tabular-nums text-primary">
                  {paidCount}/{INSTALLMENT_COUNT} paid
                </td>
                <td className="px-4 py-3 text-muted">
                  {chit.start_date ? formatDate(chit.start_date) : '—'}
                </td>
                <td
                  className={cn(
                    'px-4 py-3 tabular-nums',
                    chit.withdrawal ? 'font-medium text-danger' : 'text-muted',
                  )}
                >
                  {getChitWithdrawalDateLabel(chit)}
                </td>
                <td className="px-4 py-3">
                  <ChitStatusPill label={status.label} variant={status.variant} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
