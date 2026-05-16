'use client';

import { LayoutGrid, List, Plus, Search, SlidersHorizontal, Table2, X } from 'lucide-react';
import type { PersonsViewMode } from '@/hooks/usePersonsViewMode';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface PersonsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  cities: string[];
  cityFilter: string;
  onCityFilter: (city: string) => void;
  view: PersonsViewMode;
  onViewChange: (v: PersonsViewMode) => void;
  resultCount: number;
  canWrite: boolean;
  onAdd: () => void;
}

export function PersonsToolbar({
  search,
  onSearchChange,
  cities,
  cityFilter,
  onCityFilter,
  view,
  onViewChange,
  resultCount,
  canWrite,
  onAdd,
}: PersonsToolbarProps) {
  const hasFilters = Boolean(search || cityFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search name, city, or phone…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm',
              'placeholder:text-muted/70 transition-all duration-200',
              'focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
            )}
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted hover:bg-surface hover:text-primary"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline">
              /
            </kbd>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-card p-1">
            <ViewBtn active={view === 'grid'} onClick={() => onViewChange('grid')} label="Cards">
              <LayoutGrid className="h-4 w-4" />
            </ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => onViewChange('list')} label="List">
              <List className="h-4 w-4" />
            </ViewBtn>
            <ViewBtn active={view === 'table'} onClick={() => onViewChange('table')} label="Table">
              <Table2 className="h-4 w-4" />
            </ViewBtn>
          </div>
          {canWrite ? (
            <Button variant="accent" onClick={onAdd} className="h-11 shrink-0 px-5 shadow-md shadow-accent/20">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add member</span>
              <span className="sm:hidden">Add</span>
            </Button>
          ) : null}
        </div>
      </div>

      {cities.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            City
          </span>
          <FilterChip active={!cityFilter} onClick={() => onCityFilter('')}>
            All
          </FilterChip>
          {cities.map((city) => (
            <FilterChip key={city} active={cityFilter === city} onClick={() => onCityFilter(city)}>
              {city}
            </FilterChip>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-muted">
        <span className="font-medium tabular-nums text-primary">{resultCount}</span>
        {resultCount === 1 ? ' member' : ' members'}
        {hasFilters ? ' · filtered' : ''}
      </p>
    </div>
  );
}

function ViewBtn({
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
      onClick={onClick}
      aria-label={label}
      className={cn(
        'rounded-lg p-2 transition-colors',
        active ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary',
      )}
    >
      {children}
    </button>
  );
}

function FilterChip({
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
        'rounded-full px-3 py-1 text-xs font-medium transition-all duration-200',
        active
          ? 'bg-accent text-white shadow-sm shadow-accent/25'
          : 'border border-border bg-card text-muted hover:border-accent/30 hover:text-primary',
      )}
    >
      {children}
    </button>
  );
}
