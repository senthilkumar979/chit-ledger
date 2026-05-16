'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { chitTypeLabels, chitTypeStyles } from '@/constants/chit-labels'
import { getAvatarGradient, getInitials } from '@/utils/person-avatar'
import { ChitDetailHeroProgressPanel } from './ChitDetailHeroProgressPanel'
import { chitEndDateFromStart } from '@/utils/installment-due'
import type { ChitWithPayments } from '@/types/database'

interface ChitDetailHeroProps {
  chit: ChitWithPayments
  paidCount: number
  canWrite: boolean
  onRecordWithdrawal?: () => void
  footerActions?: ReactNode
}

export function ChitDetailHero({
  chit,
  paidCount,
  canWrite,
  onRecordWithdrawal,
  footerActions,
}: ChitDetailHeroProps) {
  const personName = chit.person?.name ?? 'Unknown'
  const initials = getInitials(personName)
  const avatarGradient = getAvatarGradient(personName)
  const typeGradient = chitTypeStyles[chit.type] ?? 'from-primary to-secondary'
  const showWithdrawalCta = Boolean(canWrite && onRecordWithdrawal)
  const displayEndDate = chit.start_date ? chitEndDateFromStart(chit.start_date) : chit.end_date
  const dateRows = [
    { label: 'Start' as const, value: chit.start_date },
    { label: 'End' as const, value: displayEndDate },
  ]

  return (
    <div className="flex flex-col md:flex-row justify-between gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl w-full">
        <div className={cn('h-1.5 w-full bg-gradient-to-r', typeGradient)} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 flex flex-col  md:flex-row justify-between gap-8 w-full">
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between md:justify-start  gap-8 items-center w-full">
              <div className="w-full max-w-[500px]">
                <div className="flex min-w-0 flex-1 gap-5 flex-col md:flex-row  justify-center md:justify-start items-center md:items-start">
                  <Link href={`/persons/${chit.person_id}`}>
                    <div
                      className={cn(
                        'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white',
                        'bg-gradient-to-br shadow-lg ring-4 ring-card transition-transform hover:scale-[1.02]',
                        avatarGradient,
                      )}
                    >
                      {initials}
                    </div>
                  </Link>
                  <div className="w-full flex flex-col justify-center md:justify-start ">
                    <div className="flex flex-wrap items-start md:items-center justify-center md:justify-start gap-2">
                      <span
                        className={cn(
                          'rounded-full bg-gradient-to-r px-3 py-0.5 text-xs font-semibold text-white shadow-sm',
                          typeGradient,
                        )}
                      >
                        {chitTypeLabels[chit.type]}
                      </span>
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          chit.matured
                            ? 'border border-accent/20 bg-accent/15 text-accent'
                            : 'border border-border bg-card text-primary',
                        )}
                      >
                        {chit.matured ? 'Matured' : 'Active'}
                      </span>
                      {chit.withdrawal ? (
                        <span className="rounded-md border border-info/25 bg-info/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">
                          Withdrawn
                        </span>
                      ) : null}
                    </div>
                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-center md:text-start text-primary sm:text-3xl">
                      <Link
                        href={`/persons/${chit.person_id}`}
                        className="hover:text-accent"
                      >
                        {personName}
                      </Link>
                    </h1>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-center md:text-start text-muted">
                      Collection schedule
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-center md:text-start text-primary">
                      {chit.category}
                    </p>
                    {chit.person?.city ? (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-center md:text-start justify-center md:justify-start text-muted">
                        <MapPin className="h-4 w-4 shrink-0 text-accent" />
                        {chit.person.city}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border/60 pt-5">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center justify-between">
                  {dateRows.map(({ label, value }) => (
                    <span
                      key={label}
                      className="flex items-center gap-2 text-muted"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface">
                        <Calendar className="h-4 w-4 text-accent" />
                      </span>
                      <span>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          {label}
                        </span>
                        <span className="font-medium text-primary">
                          {value ? formatDate(value) : '—'}
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {footerActions ? (
              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2 rounded-xl border border-border/60 bg-surface/50 p-3">
                {footerActions}
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <ChitDetailHeroProgressPanel
        chit={chit}
        paidCount={paidCount}
        showWithdrawalCta={showWithdrawalCta}
        onRecordWithdrawal={onRecordWithdrawal}
      />
    </div>
  )
}
