import { INSTALLMENT_COUNT } from '@/constants/chit-config';
import {
  countPaidInstallments,
  getChitLifecycleStatus,
  getChitWithdrawalDateLabel,
  type ChitLifecycleStatus,
} from '@/features/chits/chit-status';
import { formatDate } from '@/lib/utils';
import { formatInstallmentDueMonth } from '@/utils/installment-due';
import { resolveChitPaymentSummary } from '@/utils/chit-payment-summary';
import type { Chit, Payment } from '@/types/database';

export interface PersonLinkedChitDisplay {
  lifecycle: ChitLifecycleStatus;
  paidCount: number;
  totalInstallments: number;
  recordedCount: number;
  partialCount: number;
  overdueCount: number;
  withdrawalInstallmentNo: number | null;
  withdrawalMonthLabel: string | null;
  withdrawalDateLabel: string;
  netPayout: number | null;
  scheduleRange: string;
  progressPercent: number;
}

function formatScheduleRange(start: string | null, end: string | null): string {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return `From ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;
  return 'Schedule not set';
}

function sortPayments(chit: Chit): Payment[] {
  return [...(chit.payments ?? [])].sort((a, b) => a.installment_no - b.installment_no) as Payment[];
}

export function buildPersonLinkedChitDisplay(chit: Chit): PersonLinkedChitDisplay {
  const payments = sortPayments(chit);
  const summary = resolveChitPaymentSummary(payments, chit);
  const paidCount = countPaidInstallments({ ...chit, payments });
  const totalInstallments = payments.length > 0 ? payments.length : INSTALLMENT_COUNT;
  const withdrawalInstallmentNo = chit.withdrawal ? summary.maturityInstallmentNo : null;
  const withdrawalMonthLabel =
    chit.withdrawal && chit.start_date && withdrawalInstallmentNo != null
      ? formatInstallmentDueMonth(chit.start_date, withdrawalInstallmentNo)
      : null;

  return {
    lifecycle: getChitLifecycleStatus(chit),
    paidCount,
    totalInstallments,
    recordedCount: summary.paidInstallmentCount + summary.partialCount,
    partialCount: summary.partialCount,
    overdueCount: summary.overdueCount,
    withdrawalInstallmentNo,
    withdrawalMonthLabel,
    withdrawalDateLabel: getChitWithdrawalDateLabel(chit),
    netPayout: chit.withdrawal ? summary.netMaturityPayout : null,
    scheduleRange: formatScheduleRange(chit.start_date, chit.end_date),
    progressPercent:
      totalInstallments > 0 ? Math.min(100, Math.round((paidCount / totalInstallments) * 100)) : 0,
  };
}
