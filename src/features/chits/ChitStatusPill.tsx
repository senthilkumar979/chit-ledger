import { cn } from '@/lib/utils';
import type { ChitLifecycleVariant } from './chit-status';

const styles: Record<ChitLifecycleVariant, string> = {
  success: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
  danger: 'bg-danger/10 text-danger',
};

interface ChitStatusPillProps {
  label: string;
  variant: ChitLifecycleVariant;
}

export function ChitStatusPill({ label, variant }: ChitStatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles[variant],
      )}
    >
      {label}
    </span>
  );
}
