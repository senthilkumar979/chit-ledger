'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { fetchPayments, markPayment, updatePayment } from '@/services/payments';
import {
  buildMonthOptions,
  buildCategoryOptions,
  buildCityOptions,
  filterPaymentsByMonth,
  filterPaymentsByCategory,
  filterPaymentsByCity,
  filterPaymentsByStatus,
  formatMonthLabel,
  getCurrentMonthKey,
  sortPaymentsByStatus,
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

  const { data: allPayments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => fetchPayments(),
  });

  const monthOptions = useMemo(
    () => buildMonthOptions((allPayments ?? []) as PaymentWithChit[]),
    [allPayments],
  );

  const monthPayments = useMemo(() => {
    const list = (allPayments ?? []) as PaymentWithChit[];
    return filterPaymentsByMonth(list, monthKey);
  }, [allPayments, monthKey]);

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

  const stats = useMemo(() => {
    const list = filtered;
    const collectedAmount = list.reduce((s, p) => s + Number(p.advance_amount_paid ?? 0), 0);
    return {
      total: list.length,
      paid: list.filter((p) => p.status === 'paid').length,
      pending: list.filter((p) => p.status === 'pending' || p.status === 'partial').length,
      overdue: list.filter((p) => p.status === 'overdue').length,
      collectedAmount,
    };
  }, [filtered]);

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
      <PaymentsHero {...stats} />
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
      : `No installments due in ${monthLabel}`;

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
