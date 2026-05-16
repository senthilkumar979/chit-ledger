import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/utils/enterprise-metrics';

const styles: Record<RiskLevel, string> = {
  low: 'bg-accent/10 text-accent border-accent/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-danger/10 text-danger border-danger/20',
};

const labels: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles[level],
      )}
    >
      {labels[level]}
    </span>
  );
}
