import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveChitsLabelProps {
  count: number;
  className?: string;
  compact?: boolean;
}

export function formatActiveChits(count: number): string {
  if (count === 0) return 'No active chits';
  if (count === 1) return '1 active chit';
  return `${count} active chits`;
}

export function ActiveChitsLabel({ count, className, compact }: ActiveChitsLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium tabular-nums',
        count > 0 ? 'text-accent' : 'text-muted',
        compact ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <Layers className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {formatActiveChits(count)}
    </span>
  );
}
