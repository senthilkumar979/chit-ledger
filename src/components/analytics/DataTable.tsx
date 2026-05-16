'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Search, Settings2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { exportToCsv } from '@/utils/export-csv';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number;
  sortable?: boolean;
  isCurrency?: boolean;
  mobileLabel?: string;
  hiddenOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  exportFilename?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchPlaceholder = 'Search…',
  exportFilename,
  pageSize = 25,
  onRowClick,
  emptyMessage = 'No rows match your filters.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortId, setSortId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [visibleCols, setVisibleCols] = useState(() => new Set(columns.map((c) => c.id)));
  const [showCols, setShowCols] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = data;
    if (q) {
      rows = rows.filter((row) =>
        columns.some((col) => String(col.accessor(row)).toLowerCase().includes(q)),
      );
    }
    if (sortId) {
      const col = columns.find((c) => c.id === sortId);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = col.accessor(a);
          const bv = col.accessor(b);
          const cmp =
            typeof av === 'number' && typeof bv === 'number'
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, search, sortId, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const activeCols = columns.filter((c) => visibleCols.has(c.id));

  const toggleSort = (id: string) => {
    if (sortId === id) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortId(id);
      setSortDir('desc');
    }
  };

  const exportCsv = () => {
    if (!exportFilename) return;
    exportToCsv(
      exportFilename,
      activeCols.map((c) => c.header),
      filtered.map((row) => activeCols.map((c) => String(c.accessor(row)))),
    );
  };

  const formatCell = (col: DataTableColumn<T>, row: T) => {
    const v = col.accessor(row);
    if (col.isCurrency && typeof v === 'number') return formatCurrency(v);
    return String(v);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCols((s) => !s)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <Settings2 className="h-4 w-4" />
            Columns
          </button>
          {showCols ? (
            <div className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded-lg border border-border bg-card p-2 shadow-lg">
              {columns.map((col) => (
                <label key={col.id} className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={visibleCols.has(col.id)}
                    onChange={() => {
                      setVisibleCols((prev) => {
                        const next = new Set(prev);
                        if (next.has(col.id)) next.delete(col.id);
                        else next.add(col.id);
                        return next;
                      });
                    }}
                  />
                  {col.header}
                </label>
              ))}
            </div>
          ) : null}
        </div>
        {exportFilename ? (
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface/50 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              {activeCols.map((col) => (
                <th key={col.id} className="px-4 py-3">
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort(col.id)}
                    >
                      {col.header}
                      {sortId === col.id ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="px-4 py-8 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    'border-b border-border/60 last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-surface/40',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {activeCols.map((col) => (
                    <td key={col.id} className="px-4 py-3 tabular-nums">
                      {formatCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {pageRows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{emptyMessage}</p>
        ) : (
          pageRows.map((row) => (
            <button
              key={rowKey(row)}
              type="button"
              onClick={() => onRowClick?.(row)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left text-sm shadow-sm"
            >
              {activeCols
                .filter((c) => !c.hiddenOnMobile)
                .map((col) => (
                  <div key={col.id} className="flex justify-between gap-2 py-0.5">
                    <span className="text-muted">{col.mobileLabel ?? col.header}</span>
                    <span className="font-medium tabular-nums">{formatCell(col, row)}</span>
                  </div>
                ))}
            </button>
          ))
        )}
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {filtered.length} rows · page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
