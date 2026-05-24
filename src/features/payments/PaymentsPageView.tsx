'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { fetchPaymentsPageData, markPayment, updatePayment } from '@/services/payments';
import {
  buildMonthOptionsFromChits,
  buildMonthlyScheduledPayments,
  buildCategoryOptions,
  buildCityOptions,
  filterPaymentsByCategory,
  filterPaymentsByCity,
  filterPaymentsByStatus,
  formatMonthLabel,
  getCurrentMonthKey,
  sortPaymentsByStatus,
  computePaymentsMonthStats,
  type PaymentStatusFilter,
  type PaymentWithChit,
} from '@/utils/payment-month';
import { PaymentsHero } from './PaymentsHero';
import { PaymentsToolbar } from './PaymentsToolbar';
import { PaymentRowCard } from './PaymentRowCard';
import { MarkPaymentForm } from './MarkPaymentForm';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import type { Payment } from '@/types/database';
import type { MarkPaymentFormData } from '@/schemas/payment';

interface PaymentsPageViewProps {
  canWrite: boolean;
}

export function PaymentsPageView({ canWrite }: PaymentsPageViewProps) {
  const [search, setSearch] = useState('');
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [active, setActive] = useState<Payment | null>(null);
  const [mode, setMode] = useState<'record' | 'edit'>('record');
  const queryClient = useQueryClient();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['payments-page'],
    queryFn: () => fetchPaymentsPageData(),
  });

  const scheduleChits = pageData?.chits ?? [];

  const monthOptions = useMemo(
    () => buildMonthOptionsFromChits(scheduleChits),
    [scheduleChits],
  );

  const monthSchedule = useMemo(
    () => buildMonthlyScheduledPayments(scheduleChits, monthKey),
    [scheduleChits, monthKey],
  );

  const monthPayments = monthSchedule.scheduled;

  const cities = useMemo(() => buildCityOptions(monthPayments), [monthPayments]);
  const categories = useMemo(() => buildCategoryOptions(monthPayments), [monthPayments]);

  useEffect(() => {
    setCityFilter('');
    setCategoryFilter('');
    setStatusFilter('');
  }, [monthKey]);

  const filtered = useMemo(() => {
    const byStatus = filterPaymentsByStatus(monthPayments, statusFilter);
    const byCity = filterPaymentsByCity(byStatus, cityFilter);
    const byCategory = filterPaymentsByCategory(byCity, categoryFilter);
    const sorted = sortPaymentsByStatus(byCategory);

    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((p) => p.chit?.person?.name?.toLowerCase().includes(q));
  }, [monthPayments, statusFilter, cityFilter, categoryFilter, search]);

  const stats = useMemo(
    () => computePaymentsMonthStats(monthPayments),
    [monthPayments],
  );

  async function handleSubmit(form: MarkPaymentFormData) {
    if (!active) return;
    if (mode === 'edit') {
      await updatePayment(active.id, Number(active.expected_amount), form);
      toast.success('Payment updated');
    } else {
      await markPayment(active.id, Number(active.expected_amount), form);
      toast.success('Payment recorded');
    }
    setActive(null);
    queryClient.invalidateQueries({ queryKey: ['payments-page'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  }

  function openRecord(p: Payment) {
    setMode('record');
    setActive(p);
  }

  function openEdit(p: Payment) {
    setMode('edit');
    setActive(p);
  }

  const monthLabel = formatMonthLabel(monthKey);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PaymentsHero {...stats} monthLabel={monthLabel} schedule={monthSchedule} />
      <PaymentsToolbar
        search={search}
        onSearchChange={setSearch}
        monthKey={monthKey}
        onMonthChange={setMonthKey}
        monthOptions={monthOptions}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        cityFilter={cityFilter}
        onCityFilter={setCityFilter}
        cities={cities}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        categories={categories}
        resultCount={filtered.length}
        monthLabel={monthLabel}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyPayments
          monthLabel={monthLabel}
          hasSearch={Boolean(search.trim())}
          hasSubFilters={Boolean(statusFilter || cityFilter || categoryFilter)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <PaymentRowCard
              key={p.id}
              payment={p}
              index={i}
              canWrite={canWrite}
              onRecord={openRecord}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!active}
        onClose={() => setActive(null)}
        title={mode === 'edit' ? 'Edit payment' : 'Record payment'}
        className="max-w-md"
      >
        {active ? (
          <MarkPaymentForm
            payment={active}
            onSubmit={handleSubmit}
            onCancel={() => setActive(null)}
            isEdit={mode === 'edit'}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function EmptyPayments({
  monthLabel,
  hasSearch,
  hasSubFilters,
}: {
  monthLabel: string;
  hasSearch: boolean;
  hasSubFilters: boolean;
}) {
  const message = hasSearch
    ? 'No matching payments'
    : hasSubFilters
      ? 'No installments match your filters'
      : `No payments scheduled for ${monthLabel}`;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
      <CreditCard className="mb-3 h-10 w-10 text-muted" />
      <p className="font-semibold text-primary">{message}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Try another month, city, schedule, status, or search.
      </p>
    </div>
  );
}
