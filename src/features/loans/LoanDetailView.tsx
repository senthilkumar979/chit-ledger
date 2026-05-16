'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  closeLoan,
  createPartialRepayment,
  deleteLoan,
  deleteLoanRepayment,
  fetchLoanWithRepayments,
} from '@/services/loans';
import { BackLink } from '@/components/layout/BackLink';
import { LoanDetailSummary } from './LoanDetailSummary';
import { LoanRepaymentsTable } from './LoanRepaymentsTable';
import { PartialRepaymentForm } from './PartialRepaymentForm';
import { CloseLoanForm } from './CloseLoanForm';
import { ReportSection } from '@/features/reports/ReportSection';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import { invalidateLoanQueries } from '@/lib/invalidate-loan-queries';
import type { CloseLoanFormData, PartialRepaymentFormData } from '@/schemas/loan';
import type { LoanRepayment } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LoanDetailViewProps {
  loanId: string;
  canManageLoans: boolean;
  canDelete: boolean;
}

export function LoanDetailView({ loanId, canManageLoans, canDelete }: LoanDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [partialOpen, setPartialOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [repaymentDeleteTarget, setRepaymentDeleteTarget] = useState<LoanRepayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingRepayment, setIsDeletingRepayment] = useState(false);

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => fetchLoanWithRepayments(loanId),
  });

  async function refresh() {
    await invalidateLoanQueries(queryClient, loanId);
  }

  async function handlePartial(form: PartialRepaymentFormData) {
    await createPartialRepayment(loanId, form);
    toast.success('Partial repayment recorded');
    setPartialOpen(false);
    await refresh();
  }

  async function handleClose(form: CloseLoanFormData) {
    await closeLoan(loanId, form);
    toast.success('Loan closed');
    setCloseOpen(false);
    await refresh();
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteLoan(loanId);
      toast.success('Loan deleted');
      await invalidateLoanQueries(queryClient);
      router.push('/loans');
    } catch {
      toast.error('Could not delete loan');
      setIsDeleting(false);
    }
  }

  async function handleDeleteRepayment() {
    if (!repaymentDeleteTarget) return;
    try {
      setIsDeletingRepayment(true);
      await deleteLoanRepayment(loanId, repaymentDeleteTarget.id);
      toast.success('Repayment deleted');
      setRepaymentDeleteTarget(null);
      await refresh();
    } catch {
      toast.error('Could not delete repayment');
    } finally {
      setIsDeletingRepayment(false);
    }
  }

  function repaymentDeleteDescription(repayment: LoanRepayment): string {
    const total = formatCurrency(repayment.principal_paid + repayment.interest_paid);
    const date = formatDate(repayment.repayment_date);
    if (repayment.is_final) {
      return `This removes the final closure payment (${total} on ${date}). The loan will reopen as active with outstanding principal restored.`;
    }
    return `This removes the partial repayment of ${total} on ${date}. Outstanding balance and profit figures will be recalculated.`;
  }

  if (isLoading || !loan) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const isActive = loan.status === 'active';

  return (
    <div className="space-y-6 sm:space-y-8">
      <BackLink href="/loans" label="Back to loans" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Loan details
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isActive
              ? 'Record partial repayments or close when the balance is fully settled.'
              : 'Closed loan with full repayment history.'}
          </p>
        </div>
        {(canManageLoans && isActive) || canDelete ? (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {canManageLoans && isActive ? (
              <>
                <Button type="button" variant="outline" onClick={() => setPartialOpen(true)}>
                  Partial repayment
                </Button>
                <Button type="button" variant="accent" onClick={() => setCloseOpen(true)}>
                  Close loan
                </Button>
              </>
            ) : null}
            {canDelete ? (
              <Button
                type="button"
                variant="outline"
                className="text-danger"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <LoanDetailSummary loan={loan} />

      <ReportSection
        title="Repayment history"
        description="Partial payments and final closure for this loan"
        count={loan.repayments.length}
        canExport={false}
      >
        <LoanRepaymentsTable
          repayments={loan.repayments}
          canDelete={canManageLoans}
          onDelete={canManageLoans ? setRepaymentDeleteTarget : undefined}
        />
      </ReportSection>

      <Modal isOpen={partialOpen} onClose={() => setPartialOpen(false)} title="Partial repayment">
        <PartialRepaymentForm
          loan={loan}
          onSubmit={handlePartial}
          onCancel={() => setPartialOpen(false)}
        />
      </Modal>

      <Modal isOpen={closeOpen} onClose={() => setCloseOpen(false)} title="Close loan">
        <CloseLoanForm loan={loan} onSubmit={handleClose} onCancel={() => setCloseOpen(false)} />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete loan record?"
        description="This removes the loan and all repayment history permanently."
      />

      <DeleteConfirmModal
        isOpen={Boolean(repaymentDeleteTarget)}
        onClose={() => setRepaymentDeleteTarget(null)}
        onConfirm={handleDeleteRepayment}
        isDeleting={isDeletingRepayment}
        title="Delete repayment?"
        description={
          repaymentDeleteTarget
            ? repaymentDeleteDescription(repaymentDeleteTarget)
            : ''
        }
      />
    </div>
  );
}
