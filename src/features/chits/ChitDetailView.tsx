'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchChitById } from '@/services/chits'
import {
  markPayment,
  markBulkPayments,
  updatePayment,
  resetPayment,
} from '@/services/payments'
import { BackLink } from '@/components/layout/BackLink'
import { ChitDetailHero } from './ChitDetailHero'
import { ChitDetailStats } from './ChitDetailStats'
import { ChitDetailToolbar } from './ChitDetailToolbar'
import { ChitExportButton } from './ChitExportButton'
import { ChitWithdrawalSummary } from './ChitWithdrawalSummary'
import { PaymentSchedule } from './PaymentSchedule'
import { MarkPaymentForm } from '@/features/payments/MarkPaymentForm'
import { BulkMarkPaymentForm } from '@/features/payments/BulkMarkPaymentForm'
import { Button } from '@/components/ui/Button'
import { WithdrawalForm } from '@/features/withdrawals/WithdrawalForm'
import { Modal } from '@/components/ui/Modal'
import { ChitDetailSkeleton } from './ChitDetailSkeleton'
import { toast } from 'sonner'
import type { Payment } from '@/types/database'
import type { BulkMarkPaymentFormData, MarkPaymentFormData } from '@/schemas/payment'
import { getUnpaidInstallments, previewBulkPayment } from '@/utils/bulk-payment'
import { INSTALLMENT_COUNT } from '../../constants/chit-config'
import { invalidateChitQueries as invalidateChitRelatedQueries } from '@/lib/invalidate-chit-queries'
import { resolveChitPaymentSummary } from '@/utils/chit-payment-summary'

interface ChitDetailViewProps {
  chitId: string
  canWrite: boolean
  canDelete: boolean
}

export function ChitDetailView({
  chitId,
  canWrite,
  canDelete,
}: ChitDetailViewProps) {
  const [active, setActive] = useState<Payment | null>(null)
  const [mode, setMode] = useState<'record' | 'edit'>('record')
  const [withdrawalOpen, setWithdrawalOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: chit, isLoading } = useQuery({
    queryKey: ['chit', chitId],
    queryFn: () => fetchChitById(chitId),
  })

  async function refreshChitData() {
    await invalidateChitRelatedQueries(queryClient, {
      chitId,
      personId: chit?.person_id,
    })
  }

  async function handleSubmit(form: MarkPaymentFormData) {
    if (!active) return
    let updated: Payment
    if (mode === 'edit') {
      updated = await updatePayment(
        active.id,
        Number(active.expected_amount),
        form,
      )
      if (updated.installment_no === 20 && updated.status === 'paid') {
        toast.success('Payment updated · Chit matured')
      } else {
        toast.success('Payment updated')
      }
    } else {
      updated = await markPayment(
        active.id,
        Number(active.expected_amount),
        form,
      )
      if (updated.installment_no === 20 && updated.status === 'paid') {
        toast.success('Payment recorded · Chit matured')
      } else {
        toast.success('Payment recorded')
      }
    }
    setActive(null)
    queryClient.invalidateQueries({ queryKey: ['chit', chitId] })
  }

  async function handleBulkSubmit(form: BulkMarkPaymentFormData) {
    if (!chit) return
    const preview = previewBulkPayment(chit.payments, form.installment_count)
    const { updatedCount } = await markBulkPayments(chitId, form)
    const matured = preview.targets.some((p) => p.installment_no === 20)
    toast.success(
      matured
        ? `Recorded ${updatedCount} payments · Chit matured`
        : `Recorded ${updatedCount} payment${updatedCount === 1 ? '' : 's'}`,
    )
    setBulkOpen(false)
    queryClient.invalidateQueries({ queryKey: ['chit', chitId] })
  }

  async function handleReset(payment: Payment) {
    await resetPayment(payment.id)
    toast.success('Payment reset to pending')
    queryClient.invalidateQueries({ queryKey: ['chit', chitId] })
  }

  if (isLoading || !chit) return <ChitDetailSkeleton />

  const paidCount = chit.payments.filter((p) => p.status === 'paid').length
  const unpaidCount = getUnpaidInstallments(chit.payments).length
  const paymentSummary = resolveChitPaymentSummary(chit.payments, chit)

  return (
    <div className="space-y-6 sm:space-y-8">
      <BackLink href="/chits" label="Back to chits" />
      <ChitDetailHero
        chit={chit}
        paidCount={paidCount}
        canWrite={canWrite}
        onRecordWithdrawal={
          canWrite && !chit.withdrawal
            ? () => setWithdrawalOpen(true)
            : undefined
        }
        footerActions={
          <div className="flex w-full flex-wrap items-center gap-2">
            {canWrite || canDelete ? (
              <ChitDetailToolbar
                chit={chit}
                canWrite={canWrite}
                canDelete={canDelete}
              />
            ) : null}
            <ChitExportButton chit={chit} />
          </div>
        }
      />
      <ChitDetailStats payments={chit.payments} chit={chit} />

      <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Payment schedule</h2>
            <p className="mt-0.5 text-sm text-muted">
              {INSTALLMENT_COUNT} installments
            </p>
          </div>
          {canWrite && unpaidCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-border/80"
              onClick={() => setBulkOpen(true)}
            >
              Record bulk payment
            </Button>
          ) : null}
        </div>
        <div className="p-4 sm:p-6">
          <PaymentSchedule
            payments={chit.payments}
            startDate={chit.start_date}
            canWrite={canWrite}
            onMarkPaid={(p) => {
              setMode('record')
              setActive(p)
            }}
            onEdit={(p) => {
              setMode('edit')
              setActive(p)
            }}
            onReset={handleReset}
          />
        </div>
      </div>

      {chit.withdrawal && chit.withdrawal_date ? (
        <ChitWithdrawalSummary chit={chit} payments={chit.payments} />
      ) : null}

      <Modal
        isOpen={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        title="Record withdrawal"
        className="max-w-lg"
      >
        <p className="mb-4 text-sm text-muted">
          Maturity payout details and proof.
        </p>
        <WithdrawalForm
          chitId={chit.id}
          paymentSummary={paymentSummary}
          onSuccess={() => {
            void refreshChitData()
            setWithdrawalOpen(false)
          }}
          onCancel={() => setWithdrawalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Record bulk payment"
        className="max-w-md"
      >
        <BulkMarkPaymentForm
          key={`bulk-${chit.updated_at}-${unpaidCount}`}
          payments={chit.payments}
          onSubmit={handleBulkSubmit}
          onCancel={() => setBulkOpen(false)}
        />
      </Modal>

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
  )
}
