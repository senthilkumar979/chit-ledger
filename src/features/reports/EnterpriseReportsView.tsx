'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEnterpriseData } from '@/services/enterprise-analytics';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { exportToCsv } from '@/utils/export-csv';
import { exportReportTablePdf } from '@/utils/pdf/export-report-pdf';
import {
  buildEnterpriseDashboardMetrics,
  buildEnterpriseReportsMetrics,
  filterPaymentsForReports,
} from '@/utils/enterprise-metrics';
import { buildCityOptions, buildCategoryOptions } from '@/utils/payment-month';
import type { PaymentStatus } from '@/types/database';
import { ReportsAnalyticsSections } from './enterprise/ReportsAnalyticsSections';

interface EnterpriseReportsViewProps {
  canExport: boolean;
  canViewLoanAnalytics: boolean;
}

export function EnterpriseReportsView({
  canExport,
  canViewLoanAnalytics,
}: EnterpriseReportsViewProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [chitType, setChitType] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [memberQuery, setMemberQuery] = useState('');

  const { data: raw, isLoading } = useQuery({
    queryKey: ['enterprise-reports'],
    queryFn: () => fetchEnterpriseData(),
  });

  const filteredBundle = useMemo(() => {
    if (!raw) return null;
    const payments = filterPaymentsForReports(raw.payments, {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      city: city || undefined,
      category: category || undefined,
      chitType: chitType || undefined,
      status: status || undefined,
      memberQuery: memberQuery || undefined,
    });
    const input = { payments, chits: raw.chits, loans: raw.loans, repayments: raw.repayments };
    return {
      dashboard: buildEnterpriseDashboardMetrics(input),
      reports: buildEnterpriseReportsMetrics(input),
    };
  }, [raw, dateFrom, dateTo, city, category, chitType, status, memberQuery]);

  const cities = useMemo(() => buildCityOptions(raw?.payments ?? []), [raw?.payments]);
  const categories = useMemo(() => buildCategoryOptions(raw?.payments ?? []), [raw?.payments]);

  const exportCsv = () => {
    if (!filteredBundle) return;
    const rows = filteredBundle.reports.memberRevenue.map((r) => [
      r.member,
      r.city,
      String(r.chits),
      String(r.totalPaid),
      String(r.outstanding),
      String(r.variance),
      String(r.profitContribution),
    ]);
    exportToCsv('reports-members.csv', ['Member', 'City', 'Chits', 'Paid', 'Outstanding', 'Variance', 'Profit'], rows);
    toast.success('CSV downloaded');
  };

  const exportPdf = () => {
    if (!filteredBundle) return;
    try {
      exportReportTablePdf({
        title: 'Member revenue report',
        subtitle: 'Filtered analytics export',
        headers: ['Member', 'City', 'Chits', 'Total paid', 'Outstanding', 'Variance'],
        rows: filteredBundle.reports.memberRevenue.map((r) => [
          r.member,
          r.city,
          String(r.chits),
          String(r.totalPaid),
          String(r.outstanding),
          String(r.variance),
        ]),
        filename: 'reports-analytics',
        landscape: true,
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
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

      <div className="sticky top-14 z-10 -mx-4 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <div className="flex flex-wrap items-end gap-2">
          <FilterField label="From">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            />
          </FilterField>
          <FilterField label="To">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm" />
          </FilterField>
          <FilterField label="City">
            <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm">
              <option value="">All</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Schedule">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm">
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Chit type">
            <select value={chitType} onChange={(e) => setChitType(e.target.value)} className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm">
              <option value="">All</option>
              <option value="ONE_LAKH">₹1 Lakh</option>
              <option value="TWO_LAKH">₹2 Lakh</option>
            </select>
          </FilterField>
          <FilterField label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus | '')}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </FilterField>
          <FilterField label="Member" className="min-w-[10rem] flex-1">
            <input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Search member"
              className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            />
          </FilterField>
          {canExport ? (
            <>
              <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
                <FileDown className="h-4 w-4" />
                CSV
              </button>
              <button type="button" onClick={exportPdf} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
                <FileDown className="h-4 w-4" />
                PDF
              </button>
            </>
          ) : null}
        </div>
      </div>

      <ReportsAnalyticsSections metrics={filteredBundle.reports} canViewLoanAnalytics={canViewLoanAnalytics} />
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
