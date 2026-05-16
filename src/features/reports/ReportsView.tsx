'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import {
  fetchMonthlyCollections,
  fetchDefaulters,
  fetchMaturedMembers,
  fetchUpcomingWithdrawals,
  fetchReportSummary,
  reportRowsToExport,
} from '@/services/reports';
import { ReportsHero } from './ReportsHero';
import { AnalyticsChartsGrid } from '@/components/charts/AnalyticsChartsGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { exportToCsv } from '@/utils/export-csv';
import { exportToPdf } from '@/utils/export-pdf';
import { formatCurrency, cn } from '@/lib/utils';

const tabs = [
  { id: 'collections', label: 'Collections' },
  { id: 'defaulters', label: 'Defaulters' },
  { id: 'matured', label: 'Matured' },
  { id: 'withdrawals', label: 'Withdrawals' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const fetchers: Record<TabId, () => Promise<import('@/services/reports').ReportRow[]>> = {
  collections: fetchMonthlyCollections,
  defaulters: fetchDefaulters,
  matured: fetchMaturedMembers,
  withdrawals: fetchUpcomingWithdrawals,
};

interface ReportsViewProps {
  canExport: boolean;
}

export function ReportsView({ canExport }: ReportsViewProps) {
  const [tab, setTab] = useState<TabId>('collections');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['report-summary'],
    queryFn: fetchReportSummary,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reports', tab],
    queryFn: fetchers[tab],
  });

  function handleCsv() {
    if (!data) return;
    exportToCsv(
      `chitledger-${tab}.csv`,
      ['Name', 'Details', 'Amount', 'Date', 'Status'],
      reportRowsToExport(data),
    );
  }

  function handlePdf() {
    if (!data) return;
    exportToPdf({
      title: tabs.find((t) => t.id === tab)?.label ?? 'Report',
      filename: `chitledger-${tab}.pdf`,
      headers: ['Name', 'Details', 'Amount', 'Date', 'Status'],
      rows: reportRowsToExport(data),
    });
  }

  if (summaryLoading || !summary) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <ReportsHero
        totalCollected={summary.totalCollected}
        defaulterCount={summary.defaulterCount}
        maturedCount={summary.maturedCount}
        withdrawalPending={summary.withdrawalPending}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                tab === t.id ? 'bg-accent text-white shadow-sm' : 'bg-card text-muted hover:bg-surface',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {canExport ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCsv}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="accent" size="sm" onClick={handlePdf}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        ) : null}
      </div>

      <AnalyticsChartsGrid analytics={summary.analytics} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-primary">
          {tabs.find((t) => t.id === tab)?.label}
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {data?.map((row) => (
              <Card key={row.id} className="flex justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-primary">{row.label}</p>
                  {row.sublabel ? <p className="text-sm text-muted">{row.sublabel}</p> : null}
                </div>
                <div className="text-right text-sm">
                  {row.amount != null ? (
                    <p className="font-medium text-primary">{formatCurrency(row.amount)}</p>
                  ) : null}
                  {row.date ? <p className="text-muted">{row.date}</p> : null}
                  {row.status ? <p className="capitalize text-muted">{row.status}</p> : null}
                </div>
              </Card>
            ))}
            {!data?.length ? (
              <p className="py-12 text-center text-sm text-muted">No records for this report.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
