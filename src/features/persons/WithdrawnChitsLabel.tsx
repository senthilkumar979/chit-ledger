import { HandCoins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WithdrawnChitsLabelProps {
  withdrawn?: number
  activeTotal?: number
  className?: string
  compact?: boolean
}

export function formatWithdrawnChits(
  withdrawn: number | undefined,
  activeTotal: number | undefined,
): string {
  const active = activeTotal ?? 0
  const count = withdrawn ?? 0
  if (active === 0) return '—'
  if (count === 0) return '0'
  if (count === 1) return '1 chit'
  return `${count} chits`
}

export function WithdrawnChitsLabel({
  withdrawn,
  activeTotal,
  className,
  compact,
}: WithdrawnChitsLabelProps) {
  const label = formatWithdrawnChits(withdrawn, activeTotal)
  const hasWithdrawn = (withdrawn ?? 0) > 0

  if (!hasWithdrawn) {
    return null
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium tabular-nums',
        hasWithdrawn ? 'text-danger' : 'text-muted',
        compact ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <HandCoins
        className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
      />
      {label} withdrawn
    </span>
  )
}
