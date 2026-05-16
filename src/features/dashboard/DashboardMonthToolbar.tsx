'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { PaymentStatusFilter } from '@/utils/payment-month';

interface DashboardMonthToolbarProps {
  monthKey: string;
  monthOptions: { value: string; label: string }[];
  onMonthChange: (key: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: PaymentStatusFilter;
  onStatusFilter: (value: PaymentStatusFilter) => void;
  cityFilter: string;
  onCityFilter: (value: string) => void;
  cities: string[];
  categoryFilter: string;
  onCategoryFilter: (value: string) => void;
  categories: string[];
}

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

export function DashboardMonthToolbar({
  monthKey,
  monthOptions,
  onMonthChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  cityFilter,
  onCityFilter,
  cities,
  categoryFilter,
  onCategoryFilter,
  categories,
}: DashboardMonthToolbarProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <Select
              label="Reporting month"
              options={monthOptions}
              value={monthKey}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
          <Input
            label="Search member"
            placeholder="Name…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value as PaymentStatusFilter)}
          />
          <Select
            label="City"
            options={[{ value: '', label: 'All cities' }, ...cities.map((c) => ({ value: c, label: c }))]}
            value={cityFilter}
            onChange={(e) => onCityFilter(e.target.value)}
          />
          <Select
            label="Schedule"
            options={[
              { value: '', label: 'All schedules' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            value={categoryFilter}
            onChange={(e) => onCategoryFilter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
