'use client'

import Link from 'next/link'
import { ArrowUpRight, Calendar, Landmark, MapPin } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { chitTypeLabels, chitTypeStyles } from '@/constants/chit-labels'
import { INSTALLMENT_COUNT } from '@/constants/chit-config'
import { ChitStatusPill } from './ChitStatusPill'
import { countPaidInstallments, getChitLifecycleStatus, getChitWithdrawalDateLabel } from './chit-status'
import { getAvatarGradient, getInitials } from '@/utils/person-avatar'
import type { Chit } from '@/types/database'

interface ChitCardProps {
  chit: Chit
  index?: number
  variant?: 'grid' | 'list'
}

export function ChitCard({ chit, index = 0, variant = 'grid' }: ChitCardProps) {
  const personName = chit.person?.name ?? 'Unknown'
  const initials = getInitials(personName)
  const avatarGradient = getAvatarGradient(personName)
  const typeGradient = chitTypeStyles[chit.type] ?? 'from-primary to-secondary'
  const paidCount = countPaidInstallments(chit)
  const lifecycle = getChitLifecycleStatus(chit)

  return (
    <Link
      href={`/chits/${chit.id}`}
      className={cn(
        'member-card-enter group relative block overflow-hidden rounded-2xl border border-border/80 bg-card',
        'shadow-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5',
        variant === 'list' ? 'p-4' : 'p-5',
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80',
          typeGradient,
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
          'bg-gradient-to-br from-accent/[0.03] to-info/[0.03]',
        )}
      />

      <div
        className={cn(
          'relative',
          variant === 'list' && 'flex items-center gap-4',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md ring-2 ring-card',
              'bg-gradient-to-br transition-transform group-hover:scale-105',
              avatarGradient,
            )}
          >
            {initials || <Landmark className="h-5 w-5" />}
          </div>
          <span
            className={cn(
              'rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm',
              typeGradient,
            )}
          >
            {chitTypeLabels[chit.type]}
          </span>
        </div>

        <div
          className={cn('mt-4 min-w-0 flex-1', variant === 'list' && 'mt-0')}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate font-semibold text-primary group-hover:text-accent transition-colors">
                {personName}
              </h3>
              <p className="mt-0.5 text-sm text-muted">{chit.category}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted opacity-0 transition-all group-hover:opacity-100" />
          </div>
          <div className="w-full flex justify-between">
            {chit.person?.city ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3 w-3 text-accent/70" />
                {chit.person.city}
              </p>
            ) : null}
            <span className="shrink-0 font-semibold tabular-nums text-primary/80">
              {paidCount}/{INSTALLMENT_COUNT} paid
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3 text-[11px] text-muted">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {chit.start_date ? formatDate(chit.start_date) : 'No start date'}
              </span>
              {chit.withdrawal ? (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0 text-danger" />
                  <span className="text-muted">Withdrawn</span>
                  <span className="font-semibold text-danger">
                    {getChitWithdrawalDateLabel(chit)}
                  </span>
                </span>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              <ChitStatusPill label={lifecycle.label} variant={lifecycle.variant} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

