'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthOption {
  value: string;
  label: string;
}

interface PaymentsMonthPickerProps {
  monthKey: string;
  monthLabel: string;
  monthOptions: MonthOption[];
  onMonthChange: (key: string) => void;
}

export function PaymentsMonthPicker({
  monthKey,
  monthLabel,
  monthOptions,
  onMonthChange,
}: PaymentsMonthPickerProps) {
  const monthIndex = monthOptions.findIndex((m) => m.value === monthKey);
  const hasPrev = monthIndex > 0;
  const hasNext = monthIndex >= 0 && monthIndex < monthOptions.length - 1;

  function goMonth(delta: number) {
    const next = monthOptions[monthIndex + delta];
    if (next) onMonthChange(next.value);
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <Calendar className="h-3.5 w-3.5 text-accent" />
          Month
        </span>
        <div className="flex items-center gap-1">
          <NavBtn label="Previous month" disabled={!hasPrev} onClick={() => goMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </NavBtn>
          <span className="min-w-[4.5rem] text-center text-sm font-semibold text-primary">{monthLabel}</span>
          <NavBtn label="Next month" disabled={!hasNext} onClick={() => goMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </NavBtn>
        </div>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {monthOptions.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onMonthChange(m.value)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              monthKey === m.value
                ? 'bg-accent text-white shadow-sm shadow-accent/25'
                : 'border border-border bg-card text-muted hover:border-accent/30',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border p-1.5 transition-colors',
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-surface hover:text-accent',
      )}
    >
      {children}
    </button>
  );
}
