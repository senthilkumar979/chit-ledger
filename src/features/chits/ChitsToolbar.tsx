'use client';

import { LayoutGrid, List, Plus, Search, SlidersHorizontal, Table2, X } from 'lucide-react';
import type { CatalogViewMode } from '@/hooks/useCatalogViewMode';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { chitTypeLabels } from '@/constants/chit-labels';
import { ChitTypes } from '@/constants/chit-config';
import type { ChitStatusFilter } from '@/constants/chit-labels';

interface ChitsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  chitFilter: string;
  onChitFilter: (v: string) => void;
  scheduleFilter: string;
  onScheduleFilter: (v: string) => void;
  scheduleOptions: string[];
  statusFilter: ChitStatusFilter;
  onStatusFilter: (v: ChitStatusFilter) => void;
  view: CatalogViewMode;
  onViewChange: (v: CatalogViewMode) => void;
  resultCount: number;
  canWrite: boolean;
  onAdd: () => void;
}

const statusChips: { id: ChitStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'matured', label: 'Matured' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

const chitTypeChips = [
  { id: '', label: 'All chits' },
  { id: ChitTypes.FIFTY_THOUSAND, label: chitTypeLabels[ChitTypes.FIFTY_THOUSAND] },
  { id: ChitTypes.ONE_LAKH, label: chitTypeLabels[ChitTypes.ONE_LAKH] },
  { id: ChitTypes.TWO_LAKH, label: chitTypeLabels[ChitTypes.TWO_LAKH] },
] as const;

export function ChitsToolbar({
  search,
  onSearchChange,
  chitFilter,
  onChitFilter,
  scheduleFilter,
  onScheduleFilter,
  scheduleOptions,
  statusFilter,
  onStatusFilter,
  view,
  onViewChange,
  resultCount,
  canWrite,
  onAdd,
}: ChitsToolbarProps) {
  const hasFilters = Boolean(
    search || chitFilter || scheduleFilter || statusFilter !== 'all',
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search member or schedule…"
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

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-card p-1">
            <ViewToggle active={view === 'grid'} onClick={() => onViewChange('grid')} label="Cards">
              <LayoutGrid className="h-4 w-4" />
            </ViewToggle>
            <ViewToggle active={view === 'list'} onClick={() => onViewChange('list')} label="List">
              <List className="h-4 w-4" />
            </ViewToggle>
            <ViewToggle active={view === 'table'} onClick={() => onViewChange('table')} label="Table">
              <Table2 className="h-4 w-4" />
            </ViewToggle>
          </div>
          {canWrite ? (
            <Button variant="accent" onClick={onAdd} className="h-11 shadow-md shadow-accent/20">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New chit</span>
            </Button>
          ) : null}
        </div>
      </div>

      <FilterRow label="Chit">
        {chitTypeChips.map((chip) => (
          <Chip key={chip.id || 'all'} active={chitFilter === chip.id} onClick={() => onChitFilter(chip.id)}>
            {chip.label}
          </Chip>
        ))}
      </FilterRow>

      {scheduleOptions.length > 0 ? (
        <FilterRow label="Schedule">
          <Chip active={!scheduleFilter} onClick={() => onScheduleFilter('')}>
            All schedules
          </Chip>
          {scheduleOptions.map((schedule) => (
            <Chip
              key={schedule}
              active={scheduleFilter === schedule}
              onClick={() => onScheduleFilter(schedule)}
            >
              {schedule}
            </Chip>
          ))}
        </FilterRow>
      ) : null}

      <FilterRow label="Status">
        {statusChips.map((s) => (
          <Chip key={s.id} active={statusFilter === s.id} onClick={() => onStatusFilter(s.id)}>
            {s.label}
          </Chip>
        ))}
      </FilterRow>

      <p className="text-xs text-muted">
        <span className="font-medium tabular-nums text-primary">{resultCount}</span>
        {resultCount === 1 ? ' chit' : ' chits'}
        {hasFilters ? ' · filtered' : ''}
      </p>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex min-w-[4.5rem] items-center gap-1 text-xs font-medium text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'bg-accent text-white shadow-sm shadow-accent/25'
          : 'border border-border bg-card text-muted hover:border-accent/30',
      )}
    >
      {children}
    </button>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'rounded-lg p-2 transition-colors',
        active ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary',
      )}
    >
      {children}
    </button>
  );
}
