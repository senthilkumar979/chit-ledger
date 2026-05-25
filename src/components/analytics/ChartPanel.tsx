'use client'

import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface ChartPanelProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  height?: string
  onClick?: () => void
  active?: boolean
}

export function ChartPanel({
  title,
  description,
  action,
  children,
  className,
  height = 'h-72',
  onClick,
  active,
}: ChartPanelProps) {
  const inner = (
    <Card
      padding="lg"
      className={cn(
        'transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        active && 'ring-2 ring-primary/20',
        className,
      )}
    >
      <CardHeader title={title} description={description} action={action} />
      <div className={cn('w-full', height)}>{children}</div>
    </Card>
  )

  if (!onClick) return inner
  return (
    <div role="presentation" onClick={onClick}>
      {inner}
    </div>
  )
}
