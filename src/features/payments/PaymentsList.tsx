'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { fetchPayments, markPayment } from '@/services/payments';
import { MarkPaymentForm } from './MarkPaymentForm';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDisplayPersonLabel } from '@/utils/person-display';
import {
  paymentStatusLabel,
  paymentStatusVariant,
} from '@/utils/payment-status';
import { toast } from 'sonner';
import type { Payment } from '@/types/database';
import type { MarkPaymentFormData } from '@/schemas/payment';

interface PaymentsListProps {
  canWrite: boolean;
}

type PaymentWithChit = Payment & {
  chit?: { id: string; person?: { name?: string; name_tamil?: string }; category?: string };
};

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
];

export function PaymentsList({ canWrite }: PaymentsListProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paying, setPaying] = useState<Payment | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payments', status, search],
    queryFn: () => fetchPayments({ status: status || undefined, search }),
  });

  async function handleMarkPaid(form: MarkPaymentFormData) {
    if (!paying) return;
    await markPayment(paying.id, Number(paying.expected_amount), form);
    toast.success('Payment recorded');
    setPaying(null);
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by member..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={statusFilterOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="sm:w-40"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState icon={CreditCard} title="No payments" description="Payments appear when chits are created." />
      ) : (
        <div className="space-y-3">
          {(data as PaymentWithChit[]).map((p) => (
            <Card key={p.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/chits/${p.chit_id}`} className="font-semibold text-primary hover:text-accent">
                  {getDisplayPersonLabel(p.chit?.person, 'Member')} — #{p.installment_no}
                </Link>
                <p className="text-sm text-muted">{formatCurrency(Number(p.expected_amount))}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={paymentStatusVariant(p.status)}>
                  {paymentStatusLabel(p.status)}
                </Badge>
                {canWrite && p.status !== 'paid' ? (
                  <button
                    type="button"
                    onClick={() => setPaying(p)}
                    className="text-sm font-medium text-accent"
                  >
                    Record
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!paying} onClose={() => setPaying(null)} title="Record payment">
        {paying ? (
          <MarkPaymentForm payment={paying} onSubmit={handleMarkPaid} onCancel={() => setPaying(null)} />
        ) : null}
      </Modal>
    </div>
  );
}
