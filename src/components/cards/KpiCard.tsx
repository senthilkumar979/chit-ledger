import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  isCurrency?: boolean;
  variant?: 'default' | 'accent' | 'warning' | 'danger';
}

const iconVariants = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isCurrency,
  variant = 'default',
}: KpiCardProps) {
  const display =
    typeof value === 'number' && isCurrency ? formatCurrency(value) : value;
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className="group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-primary">
            {display}
          </p>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
          {trend !== undefined ? (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-accent' : 'text-danger',
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend)}% vs last month
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            'transition-transform group-hover:scale-105',
            iconVariants[variant],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
