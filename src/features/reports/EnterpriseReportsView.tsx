'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEnterpriseData } from '@/services/enterprise-analytics';
import { fetchPersons } from '@/services/persons';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { exportToCsv } from '@/utils/export-csv';
import { exportReportTablePdf } from '@/utils/pdf/export-report-pdf';
import { formatPdfCurrency, pdfTheme, type PdfRgb } from '@/utils/pdf/pdf-theme';
import {
  buildEnterpriseDashboardMetrics,
  buildEnterpriseReportsMetrics,
  filterChitsForReports,
  filterPaymentsForReports,
} from '@/utils/enterprise-metrics';
import { buildCityOptions, buildCategoryOptions } from '@/utils/payment-month';
import { ReportsAnalyticsSections } from './enterprise/ReportsAnalyticsSections';

interface EnterpriseReportsViewProps {
  canExport: boolean;
}

export function EnterpriseReportsView({ canExport }: EnterpriseReportsViewProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [chitType, setChitType] = useState('');
  const [memberId, setMemberId] = useState('');

  const { data: raw, isLoading } = useQuery({
    queryKey: ['enterprise-reports'],
    queryFn: () => fetchEnterpriseData(),
  });

  const { data: persons = [] } = useQuery({
    queryKey: ['persons', 'report-filter-options'],
    queryFn: () => fetchPersons(),
  });

  const filteredBundle = useMemo(() => {
    if (!raw) return null;
    const payments = filterPaymentsForReports(raw.payments, {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      city: city || undefined,
      category: category || undefined,
      chitType: chitType || undefined,
      memberId: memberId || undefined,
    });
    const chits = filterChitsForReports(raw.chits, payments, {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      city: city || undefined,
      category: category || undefined,
      chitType: chitType || undefined,
      memberId: memberId || undefined,
    });
    const input = { payments, chits, loans: raw.loans, repayments: raw.repayments };
    return {
      dashboard: buildEnterpriseDashboardMetrics(input),
      reports: buildEnterpriseReportsMetrics(input),
    };
  }, [raw, dateFrom, dateTo, city, category, chitType, memberId]);

  const cities = useMemo(() => buildCityOptions(raw?.payments ?? []), [raw?.payments]);
  const categories = useMemo(() => buildCategoryOptions(raw?.payments ?? []), [raw?.payments]);
  const memberOptions = useMemo(
    () => persons.map((person) => ({ id: person.id, label: `${person.name} · ${person.city}` })),
    [persons],
  );

  const exportCsv = () => {
    if (!filteredBundle) return;
    const rows = filteredBundle.reports.memberRevenue.map((r) => [
      r.member,
      r.city,
      String(r.chits),
      String(r.totalPaid),
      String(r.outstanding),
      String(r.amountReturned),
      String(r.profit),
      String(r.variance),
    ]);
    exportToCsv(
      'reports-members.csv',
      ['Member', 'City', 'Chits', 'Paid', 'Outstanding', 'Amount returned', 'Profit', 'Variance'],
      rows,
    );
    toast.success('CSV downloaded');
  };

  const exportPdf = () => {
    if (!filteredBundle) return;
    try {
      const totalProfit = filteredBundle.reports.memberRevenue.reduce(
        (sum, row) => (row.profit > 0 ? sum + row.profit : sum),
        0,
      );
      const totalLoss = filteredBundle.reports.memberRevenue.reduce(
        (sum, row) => (row.profit < 0 ? sum + Math.abs(row.profit) : sum),
        0,
      );
      const netProfit = totalProfit - totalLoss;
      const purple: PdfRgb = [124, 58, 237];
      const softTint = (color: PdfRgb): PdfRgb =>
        color.map((channel) => Math.round(255 - (255 - channel) * 0.12)) as PdfRgb;

      exportReportTablePdf({
        title: 'Member revenue report',
        subtitle: 'Filtered analytics export',
        summaryItems: [
          {
            label: 'Total Profit',
            value: formatPdfCurrency(totalProfit),
            fillColor: softTint(pdfTheme.accent),
            borderColor: pdfTheme.accent,
            labelColor: pdfTheme.accent,
            valueColor: pdfTheme.accent,
          },
          {
            label: 'Total Loss',
            value: formatPdfCurrency(totalLoss),
            fillColor: softTint(pdfTheme.danger),
            borderColor: pdfTheme.danger,
            labelColor: pdfTheme.danger,
            valueColor: pdfTheme.danger,
          },
          {
            label: 'Net Profit',
            value: formatPdfCurrency(netProfit),
            fillColor: softTint(netProfit < 0 ? pdfTheme.danger : pdfTheme.info),
            borderColor: netProfit < 0 ? pdfTheme.danger : pdfTheme.info,
            labelColor: netProfit < 0 ? pdfTheme.danger : pdfTheme.info,
            valueColor: netProfit < 0 ? pdfTheme.danger : pdfTheme.info,
          },
        ],
        headers: ['Member', 'City', 'Chits', 'Total paid', 'Outstanding', 'Amount returned', 'Profit', 'Variance'],
        rows: filteredBundle.reports.memberRevenue.map((r) => [
          r.member,
          r.city,
          String(r.chits),
          formatPdfCurrency(r.totalPaid),
          formatPdfCurrency(r.outstanding),
          formatPdfCurrency(r.amountReturned),
          formatPdfCurrency(r.profit),
          formatPdfCurrency(r.variance),
        ]),
        bodyCellStyles: filteredBundle.reports.memberRevenue.map((r) => [
          undefined,
          undefined,
          undefined,
          { textColor: pdfTheme.info },
          { textColor: purple },
          { textColor: pdfTheme.warning },
          { textColor: r.profit < 0 ? pdfTheme.danger : pdfTheme.accent },
          { textColor: pdfTheme.danger },
        ]),
        filename: 'reports-analytics',
        landscape: true,
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  const hasFilters = Boolean(
    dateFrom || dateTo || city || category || chitType || memberId,
  );

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCity('');
    setCategory('');
    setChitType('');
    setMemberId('');
  };

  if (isLoading || !raw || !filteredBundle) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Reports</h1>
        <p className="mt-1 text-sm text-muted">Analytics workspace for finance, members, chits, and operations</p>
      </header>

      <div className="sticky top-14 z-10 -mx-4 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <section className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter Criteria
              </div>
              <h2 className="mt-1 text-lg font-semibold text-primary">Refine report analytics</h2>
              <p className="mt-1 text-sm text-muted">
                Focus the report by date range, member, city, schedule, chit type, and payment status.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasFilters ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4" />
                  Clear filters
                </Button>
              ) : null}
              {canExport ? (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
                    <FileDown className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={exportPdf}>
                    <FileDown className="h-4 w-4" />
                    PDF
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Member" className="xl:col-span-2">
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
              >
                <option value="">All members</option>
                {memberOptions.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="From">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
              />
            </FilterField>

            <FilterField label="To">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
              />
            </FilterField>

            <FilterField label="City">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
              >
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Schedule">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
              >
                <option value="">All schedules</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Chit type">
              <select
                value={chitType}
                onChange={(e) => setChitType(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
              >
                <option value="">All chit types</option>
                <option value="FIFTY_THOUSAND">₹50K</option>
                <option value="ONE_LAKH">₹1 Lakh</option>
                <option value="TWO_LAKH">₹2 Lakh</option>
              </select>
            </FilterField>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs">
            <p className="text-muted">
              <span className="font-semibold text-primary">
                {filteredBundle.reports.memberRevenue.length}
              </span>{' '}
              member rows in the current report view
              {hasFilters ? ' · filtered' : ' · all records'}
            </p>
            <p className="text-muted">Exports follow the currently selected criteria.</p>
          </div>
        </section>
      </div>

      <ReportsAnalyticsSections metrics={filteredBundle.reports} />
    </div>
  );
}

function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}
