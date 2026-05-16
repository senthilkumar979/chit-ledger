'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/services/dashboard';
import { DashboardHero } from './DashboardHero';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { DashboardMonthToolbar } from './DashboardMonthToolbar';
import { DashboardChartsSection } from './DashboardChartsSection';
import { DashboardInstallmentTable } from './DashboardInstallmentTable';
import { CollectionsExportButton } from './CollectionsExportButton';
import { CardSkeleton } from '@/components/ui/Skeleton';
import {
  buildDashboardMonthOptions,
  breakdownForCalendarMonth,
  buildVarianceTrend,
  computeDashboardMonthKpis,
  filterCalendarMonthCollections,
  filterDueInMonth,
} from '@/utils/dashboard-metrics';
import {
  buildCategoryOptions,
  buildCityOptions,
  filterPaymentsByCategory,
  filterPaymentsByCity,
  filterPaymentsByStatus,
  formatMonthLabel,
  getCurrentMonthKey,
  sortPaymentsByStatus,
  type PaymentStatusFilter,
  type PaymentWithChit,
} from '@/utils/payment-month';

export function DashboardView() {
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
  });

  const payments = (data?.payments ?? []) as PaymentWithChit[];
  const monthOptions = useMemo(() => buildDashboardMonthOptions(payments), [payments]);
  const monthLabel = formatMonthLabel(monthKey);
  const monthLabelFull =
    monthOptions.find((option) => option.value === monthKey)?.label ?? monthLabel;

  const dueBase = useMemo(() => filterDueInMonth(payments, monthKey), [payments, monthKey]);
  const cities = useMemo(() => buildCityOptions(dueBase), [dueBase]);
  const categories = useMemo(() => buildCategoryOptions(dueBase), [dueBase]);

  useEffect(() => {
    setCityFilter('');
    setCategoryFilter('');
    setStatusFilter('');
    setSearch('');
  }, [monthKey]);

  const applyFilters = (list: PaymentWithChit[]) => {
    let result = filterPaymentsByStatus(list, statusFilter);
    result = filterPaymentsByCity(result, cityFilter);
    result = filterPaymentsByCategory(result, categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.chit?.person?.name?.toLowerCase().includes(q));
    }
    return sortPaymentsByStatus(result);
  };

  const collectionRows = useMemo(
    () => applyFilters(filterCalendarMonthCollections(payments, monthKey)),
    [payments, monthKey, statusFilter, cityFilter, categoryFilter, search],
  );

  const dueRows = useMemo(
    () => applyFilters(dueBase),
    [dueBase, statusFilter, cityFilter, categoryFilter, search],
  );

  const kpis = useMemo(
    () => computeDashboardMonthKpis(payments, data?.chits ?? [], monthKey),
    [payments, data?.chits, monthKey],
  );

  const monthBreakdown = useMemo(
    () => breakdownForCalendarMonth(payments, monthKey),
    [payments, monthKey],
  );

  const varianceTrend = useMemo(() => buildVarianceTrend(payments), [payments]);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <DashboardHero kpis={kpis} monthLabel={monthLabel} />
      <DashboardKpiGrid kpis={kpis} />
      <DashboardMonthToolbar
        monthKey={monthKey}
        monthOptions={monthOptions}
        onMonthChange={setMonthKey}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        cityFilter={cityFilter}
        onCityFilter={setCityFilter}
        cities={cities}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      <DashboardChartsSection
        kpis={kpis}
        monthLabel={monthLabel}
        analytics={data.analytics}
        monthBreakdown={monthBreakdown}
        varianceTrend={varianceTrend}
      />
      <DashboardInstallmentTable
        title="Collections this month"
        description="Payments recorded by paid date in the selected month"
        rows={collectionRows}
        showCollected
        emptyMessage="No collections recorded for this month with the current filters."
        headerAction={
          <CollectionsExportButton
            monthLabel={monthLabelFull}
            rows={collectionRows}
            kpis={kpis}
            search={search}
            statusFilter={statusFilter}
            cityFilter={cityFilter}
            categoryFilter={categoryFilter}
          />
        }
      />
      <DashboardInstallmentTable
        title="Due this month"
        description="Installments scheduled for collection in the selected month"
        rows={dueRows}
        emptyMessage="No installments due this month with the current filters."
      />
    </div>
  );
}
