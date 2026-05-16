'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { fetchProfitLossData, getProfitLossForYear } from '@/services/profit-loss';
import { createLoan, deleteLoan } from '@/services/loans';
import { LoansHero } from './LoansHero';
import { ProfitLossPanel } from './ProfitLossPanel';
import { LoansTable } from './LoansTable';
import { TakeLoanForm } from './TakeLoanForm';
import { ReportSection } from '@/features/reports/ReportSection';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import { invalidateLoanQueries } from '@/lib/invalidate-loan-queries';
import type { TakeLoanFormData } from '@/schemas/loan';
import type { Loan } from '@/types/database';

interface LoansPageViewProps {
  canManageLoans: boolean;
  canDelete: boolean;
}

export function LoansPageView({ canManageLoans, canDelete }: LoansPageViewProps) {
  const queryClient = useQueryClient();
  const [year, setYear] = useState(new Date().getFullYear());
  const [takeOpen, setTakeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profit-loss-data'],
    queryFn: fetchProfitLossData,
  });

  const { profitLoss, loanStats } = useMemo(() => {
    if (!data) {
      return {
        profitLoss: null,
        loanStats: null,
      };
    }
    return getProfitLossForYear(data, year);
  }, [data, year]);

  const activeLoans = useMemo(
    () => (data?.loans ?? []).filter((l) => l.status === 'active'),
    [data?.loans],
  );
  const closedLoans = useMemo(
    () => (data?.loans ?? []).filter((l) => l.status === 'closed'),
    [data?.loans],
  );

  async function handleTakeLoan(form: TakeLoanFormData) {
    await createLoan(form);
    toast.success('Loan recorded');
    setTakeOpen(false);
    await invalidateLoanQueries(queryClient);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteLoan(deleteTarget.id);
      toast.success('Loan deleted');
      setDeleteTarget(null);
      await invalidateLoanQueries(queryClient);
    } catch {
      toast.error('Could not delete loan');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading || !data || !profitLoss || !loanStats) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <LoansHero stats={loanStats} year={year} />

      {canManageLoans ? (
        <div className="flex justify-end">
          <Button type="button" variant="accent" onClick={() => setTakeOpen(true)}>
            <Plus className="h-4 w-4" />
            Take new loan
          </Button>
        </div>
      ) : null}

      <ProfitLossPanel
        data={profitLoss}
        year={year}
        onYearChange={setYear}
        yearOptions={data.yearOptions}
      />

      <ReportSection
        title="Active loans"
        description="Tap a loan to record partial repayments or close it"
        count={activeLoans.length}
        canExport={false}
      >
        <LoansTable
          loans={activeLoans}
          canManage={canManageLoans}
          onDelete={canDelete ? setDeleteTarget : undefined}
          emptyMessage="No active loans. Record a new loan when capital is borrowed."
        />
      </ReportSection>

      <ReportSection
        title="Loan history"
        description="Closed loans with full repayment history"
        count={closedLoans.length}
        canExport={false}
      >
        <LoansTable
          loans={closedLoans}
          canManage={false}
          onDelete={canDelete ? setDeleteTarget : undefined}
          emptyMessage="No closed loans yet."
        />
      </ReportSection>

      <Modal isOpen={takeOpen} onClose={() => setTakeOpen(false)} title="Take new loan">
        <TakeLoanForm onSubmit={handleTakeLoan} onCancel={() => setTakeOpen(false)} />
      </Modal>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete loan record?"
        description="This removes the loan and all repayment history permanently. Profit and loss figures will change."
      />
    </div>
  );
}
