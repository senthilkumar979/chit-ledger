'use client';

import { cn } from '@/lib/utils';

interface ChipOption {
  id: string;
  label: string;
}

interface FilterChipGroupProps {
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (id: string) => void;
}

export function FilterChipGroup({ label, value, options, onChange }: FilterChipGroupProps) {
  if (!options.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-medium text-muted">{label}</span>
      {options.map((opt) => (
        <button
          key={opt.id || 'all'}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            value === opt.id
              ? 'bg-accent text-white shadow-sm shadow-accent/25'
              : 'border border-border bg-card text-muted hover:border-accent/30 hover:text-primary',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function toChipOptions(values: string[]): ChipOption[] {
  return [{ id: '', label: 'All' }, ...values.map((v) => ({ id: v, label: v }))];
}
