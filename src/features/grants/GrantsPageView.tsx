'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Gift, Plus } from 'lucide-react';
import { createGrant, deleteGrant, fetchGrants } from '@/services/grants';
import { GrantsTable } from './GrantsTable';
import { GrantForm } from './GrantForm';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { buildGrantDisplayMetrics } from '@/utils/grant-metrics';
import { invalidateGrantQueries } from '@/lib/invalidate-grant-queries';
import { toast } from 'sonner';
import type { GrantFormData } from '@/schemas/grant';
import type { Grant } from '@/types/database';

interface GrantsPageViewProps {
  canManageGrants: boolean;
  canDelete: boolean;
}

export function GrantsPageView({ canManageGrants, canDelete }: GrantsPageViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Grant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: grants = [], isLoading } = useQuery({
    queryKey: ['grants'],
    queryFn: fetchGrants,
  });

  const portfolio = useMemo(() => {
    let totalAmount = 0;
    let monthlyInterest = 0;
    let interestSoFar = 0;
    for (const grant of grants) {
      totalAmount += grant.amount;
      const m = buildGrantDisplayMetrics(grant);
      monthlyInterest += m.monthlyInterest;
      interestSoFar += m.interestSoFar;
    }
    return { count: grants.length, totalAmount, monthlyInterest, interestSoFar };
  }, [grants]);

  async function handleCreate(form: GrantFormData) {
    const grant = await createGrant(form);
    toast.success('Grant recorded');
    setFormOpen(false);
    await invalidateGrantQueries(queryClient, grant.id);
    router.push(`/grants/${grant.id}`);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteGrant(deleteTarget.id);
      toast.success('Grant deleted');
      setDeleteTarget(null);
      await invalidateGrantQueries(queryClient);
    } catch {
      toast.error('Could not delete grant');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-secondary via-primary to-info/90 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Capital</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Grants</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Record grants to members with a start date and monthly interest rate. Interest accrues
              from the interest start date.
            </p>
          </div>
          {canManageGrants ? (
            <Button type="button" variant="accent" className="shrink-0 shadow-lg" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add grant
            </Button>
          ) : null}
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HeroStat label="Grants" value={String(portfolio.count)} icon={Gift} />
          <HeroStat label="Total granted" value={formatCurrency(portfolio.totalAmount)} />
          <HeroStat label="Interest / month" value={formatCurrency(portfolio.monthlyInterest)} />
          <HeroStat label="Interest so far" value={formatCurrency(portfolio.interestSoFar)} />
        </div>
      </section>

      <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-lg font-semibold text-primary">All grants</h2>
          <p className="text-sm text-muted">Tap a row for full details</p>
        </div>
        <GrantsTable
          grants={grants}
          onDelete={canDelete ? setDeleteTarget : undefined}
          emptyMessage={
            canManageGrants
              ? 'No grants yet. Add a grant to start tracking interest.'
              : 'No grants recorded.'
          }
        />
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Add grant" className="max-w-lg">
        <p className="mb-5 text-sm text-muted">
          Grant capital to a member. Interest is calculated monthly from the interest start date.
        </p>
        <GrantForm
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
          submitLabel="Create grant"
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete grant?"
        description="This permanently removes the grant record."
      />
    </div>
  );
}

function HeroStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Gift;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
      {Icon ? <Icon className="mb-2 h-4 w-4 text-accent" /> : null}
      <p className="text-lg font-bold tabular-nums sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">{label}</p>
    </div>
  );
}
