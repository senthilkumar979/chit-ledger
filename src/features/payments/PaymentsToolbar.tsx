'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentStatusFilter } from '@/utils/payment-month';
import { FilterChipGroup, toChipOptions } from './FilterChipGroup';
import { PaymentsMonthPicker } from './PaymentsMonthPicker';

interface MonthOption {
  value: string;
  label: string;
}

interface PaymentsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  monthKey: string;
  onMonthChange: (v: string) => void;
  monthOptions: MonthOption[];
  statusFilter: PaymentStatusFilter;
  onStatusFilter: (v: PaymentStatusFilter) => void;
  cityFilter: string;
  onCityFilter: (v: string) => void;
  cities: string[];
  categoryFilter: string;
  onCategoryFilter: (v: string) => void;
  categories: string[];
  resultCount: number;
  monthLabel: string;
}

const STATUS_OPTIONS = [
  { id: '' as PaymentStatusFilter, label: 'All' },
  { id: 'overdue' as PaymentStatusFilter, label: 'Overdue' },
  { id: 'pending' as PaymentStatusFilter, label: 'Pending' },
  { id: 'partial' as PaymentStatusFilter, label: 'Partial' },
  { id: 'paid' as PaymentStatusFilter, label: 'Paid' },
];

export function PaymentsToolbar({
  search,
  onSearchChange,
  monthKey,
  onMonthChange,
  monthOptions,
  statusFilter,
  onStatusFilter,
  cityFilter,
  onCityFilter,
  cities,
  categoryFilter,
  onCategoryFilter,
  categories,
  resultCount,
  monthLabel,
}: PaymentsToolbarProps) {
  const hasFilters = Boolean(search || statusFilter || cityFilter || categoryFilter);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search member name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm',
            'placeholder:text-muted/70 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
          )}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <PaymentsMonthPicker
        monthKey={monthKey}
        monthLabel={monthLabel}
        monthOptions={monthOptions}
        onMonthChange={onMonthChange}
      />

      <div className="space-y-3 rounded-xl border border-border/80 bg-surface/40 p-3 sm:p-4">
        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Sub-filters
        </span>
        <FilterChipGroup
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(id) => onStatusFilter(id as PaymentStatusFilter)}
        />
        <FilterChipGroup
          label="City"
          value={cityFilter}
          options={toChipOptions(cities)}
          onChange={onCityFilter}
        />
        <FilterChipGroup
          label="Schedule"
          value={categoryFilter}
          options={toChipOptions(categories)}
          onChange={onCategoryFilter}
        />
      </div>

      <p className="text-xs text-muted">
        <span className="font-medium tabular-nums text-primary">{resultCount}</span>
        {resultCount === 1 ? ' installment' : ' installments'} in {monthLabel}
        {hasFilters ? ' · filtered' : ' · sorted overdue → paid'}
      </p>
    </div>
  );
}
