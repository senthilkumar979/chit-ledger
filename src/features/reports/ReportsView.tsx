'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReportsData } from '@/services/reports';
import { ReportsHero } from './ReportsHero';
import { ReportsKpiGrid } from './ReportsKpiGrid';
import { ReportsChartsSection } from './ReportsChartsSection';
import { ReportSection } from './ReportSection';
import { ReportCollectionsTable } from './ReportCollectionsTable';
import { ReportOutstandingTable } from './ReportOutstandingTable';
import { ReportMaturedTable, ReportPortfolioTable } from './ReportChitTables';
import {
  COLLECTIONS_PDF_HEADERS,
  MATURED_PDF_HEADERS,
  OUTSTANDING_PDF_HEADERS,
  PORTFOLIO_PDF_HEADERS,
  collectionKpisSummary,
  collectionsToPdfRows,
  kpisToPdfSummary,
  maturedToPdfRows,
  outstandingToPdfRows,
  portfolioToPdfRows,
} from './report-pdf-mappers';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { exportToCsv } from '@/utils/export-csv';
import { exportReportTablePdf } from '@/utils/pdf/export-report-pdf';
import {
  buildCollectionMonthOptions,
  filterCollectionsByMonth,
} from '@/utils/report-metrics';
import { toast } from 'sonner';

interface ReportsViewProps {
  canExport: boolean;
}

export function ReportsView({ canExport }: ReportsViewProps) {
  const [collectionMonth, setCollectionMonth] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reports-data'],
    queryFn: fetchReportsData,
  });

  const monthOptions = useMemo(
    () => [{ value: '', label: 'All months' }, ...buildCollectionMonthOptions(data?.collections ?? [])],
    [data?.collections],
  );

  const filteredCollections = useMemo(() => {
    if (!data) return [];
    if (!collectionMonth) return data.collections;
    return filterCollectionsByMonth(data.collections, collectionMonth);
  }, [data, collectionMonth]);

  const monthLabel =
    monthOptions.find((o) => o.value === collectionMonth)?.label ?? 'All months';

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const exportCollectionsPdf = async () => {
    try {
      await exportReportTablePdf({
        title: 'Collection history',
        subtitle: monthLabel,
        summaryItems: collectionKpisSummary(filteredCollections),
        headers: COLLECTIONS_PDF_HEADERS,
        rows: collectionsToPdfRows(filteredCollections),
        filename: `collections-${collectionMonth || 'all'}`,
        landscape: true,
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  const exportCollectionsCsv = () => {
    exportToCsv(
      `collections-${collectionMonth || 'all'}.csv`,
      COLLECTIONS_PDF_HEADERS,
      collectionsToPdfRows(filteredCollections),
    );
  };

  const exportOutstandingPdf = async () => {
    try {
      await exportReportTablePdf({
        title: 'Outstanding installments',
        subtitle: 'Pending, partial, and overdue',
        headers: OUTSTANDING_PDF_HEADERS,
        rows: outstandingToPdfRows(data.outstanding),
        filename: 'outstanding-installments',
        landscape: true,
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  const exportMaturedPdf = async () => {
    try {
      await exportReportTablePdf({
        title: 'Matured chits',
        subtitle: 'Members who completed installment 20',
        headers: MATURED_PDF_HEADERS,
        rows: maturedToPdfRows(data.matured),
        filename: 'matured-chits',
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  const exportWithdrawalsPdf = async () => {
    try {
      await exportReportTablePdf({
        title: 'Awaiting withdrawal',
        subtitle: 'Matured chits pending payout',
        headers: MATURED_PDF_HEADERS,
        rows: maturedToPdfRows(data.pendingWithdrawals),
        filename: 'awaiting-withdrawal',
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  const exportPortfolioPdf = async () => {
    try {
      await exportReportTablePdf({
        title: 'Chit portfolio',
        subtitle: 'All chits with collection progress',
        summaryItems: kpisToPdfSummary(data.kpis),
        headers: PORTFOLIO_PDF_HEADERS,
        rows: portfolioToPdfRows(data.portfolio),
        filename: 'chit-portfolio',
        landscape: true,
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ReportsHero kpis={data.kpis} />
      <ReportsKpiGrid kpis={data.kpis} />
      <ReportsChartsSection
        analytics={data.analytics}
        byStatus={data.byStatus}
        portfolioMix={data.portfolioMix}
      />

      <ReportSection
        title="Collection history"
        description="All payments recorded with paid date, amount, and variance"
        count={filteredCollections.length}
        canExport={canExport}
        onExportPdf={exportCollectionsPdf}
        onExportCsv={exportCollectionsCsv}
        toolbar={
          <select
            value={collectionMonth}
            onChange={(e) => setCollectionMonth(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-primary"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        }
      >
        <ReportCollectionsTable
          rows={filteredCollections}
          emptyMessage="No collections for the selected period."
        />
      </ReportSection>

      <ReportSection
        title="Outstanding installments"
        description="Pending, partial, and overdue amounts still to be collected"
        count={data.outstanding.length}
        canExport={canExport}
        onExportPdf={exportOutstandingPdf}
        onExportCsv={() =>
          exportToCsv(
            'outstanding.csv',
            OUTSTANDING_PDF_HEADERS,
            outstandingToPdfRows(data.outstanding),
          )
        }
      >
        <ReportOutstandingTable
          rows={data.outstanding}
          emptyMessage="No outstanding installments."
        />
      </ReportSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportSection
          title="Matured chits"
          description="Completed chit cycles with net maturity payout"
          count={data.matured.length}
          canExport={canExport}
          onExportPdf={exportMaturedPdf}
        >
          <ReportMaturedTable rows={data.matured} emptyMessage="No matured chits yet." />
        </ReportSection>

        <ReportSection
          title="Awaiting withdrawal"
          description="Matured chits where payout has not been recorded"
          count={data.pendingWithdrawals.length}
          canExport={canExport}
          onExportPdf={exportWithdrawalsPdf}
        >
          <ReportMaturedTable
            rows={data.pendingWithdrawals}
            emptyMessage="No chits awaiting withdrawal."
          />
        </ReportSection>
      </div>

      <ReportSection
        title="Full portfolio"
        description="Every chit with lifecycle status, progress, and balances"
        count={data.portfolio.length}
        canExport={canExport}
        onExportPdf={exportPortfolioPdf}
        onExportCsv={() =>
          exportToCsv('portfolio.csv', PORTFOLIO_PDF_HEADERS, portfolioToPdfRows(data.portfolio))
        }
      >
        <ReportPortfolioTable rows={data.portfolio} emptyMessage="No chits in portfolio." />
      </ReportSection>
    </div>
  );
}
