'use client';

import { LayoutGrid, List, Plus, Search, Table2, X } from 'lucide-react';
import type { CatalogViewMode } from '@/hooks/useCatalogViewMode';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { chitTypeLabels } from '@/constants/chit-labels';
import { ChitTypes } from '@/constants/chit-config';
import type { ChitStatusFilter } from '@/constants/chit-labels';

interface ChitsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilter: (v: string) => void;
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

export function ChitsToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilter,
  statusFilter,
  onStatusFilter,
  view,
  onViewChange,
  resultCount,
  canWrite,
  onAdd,
}: ChitsToolbarProps) {
  const hasFilters = Boolean(search || typeFilter || statusFilter !== 'all');

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

      <div className="flex flex-wrap items-center gap-2">
        <Chip active={!typeFilter} onClick={() => onTypeFilter('')}>
          All types
        </Chip>
        <Chip
          active={typeFilter === ChitTypes.FIFTY_THOUSAND}
          onClick={() => onTypeFilter(ChitTypes.FIFTY_THOUSAND)}
        >
          {chitTypeLabels[ChitTypes.FIFTY_THOUSAND]}
        </Chip>
        <Chip active={typeFilter === ChitTypes.ONE_LAKH} onClick={() => onTypeFilter(ChitTypes.ONE_LAKH)}>
          {chitTypeLabels[ChitTypes.ONE_LAKH]}
        </Chip>
        <Chip active={typeFilter === ChitTypes.TWO_LAKH} onClick={() => onTypeFilter(ChitTypes.TWO_LAKH)}>
          {chitTypeLabels[ChitTypes.TWO_LAKH]}
        </Chip>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        {statusChips.map((s) => (
          <Chip key={s.id} active={statusFilter === s.id} onClick={() => onStatusFilter(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      <p className="text-xs text-muted">
        <span className="font-medium tabular-nums text-primary">{resultCount}</span>
        {resultCount === 1 ? ' chit' : ' chits'}
        {hasFilters ? ' · filtered' : ''}
      </p>
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
