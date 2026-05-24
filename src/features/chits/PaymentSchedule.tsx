'use client';

import { useMemo, useState } from 'react';
import type { Payment } from '@/types/database';
import type { ChitType } from '@/constants/chit-config';
import { findWithdrawalInstallmentNo } from '@/utils/chit-payment-summary';
import { PaymentScheduleDesktop } from './PaymentScheduleDesktop';
import { PaymentScheduleMobile } from './PaymentScheduleMobile';

interface PaymentScheduleProps {
  payments: Payment[];
  startDate: string | null;
  withdrawalNetAmount?: number | null;
  collectionVariance?: number | null;
  chitType?: ChitType | null;
  onMarkPaid?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onReset?: (payment: Payment) => void;
  canWrite: boolean;
}

export function PaymentSchedule({
  payments,
  startDate,
  withdrawalNetAmount,
  collectionVariance,
  chitType,
  onMarkPaid,
  onEdit,
  onReset,
  canWrite,
}: PaymentScheduleProps) {
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  const withdrawalInstallmentNo = useMemo(
    () => findWithdrawalInstallmentNo(payments, withdrawalNetAmount, collectionVariance, chitType),
    [payments, withdrawalNetAmount, collectionVariance, chitType],
  );

  const actionProps = {
    canWrite,
    confirmReset,
    onConfirmReset: setConfirmReset,
    onMarkPaid,
    onEdit,
    onReset,
  };

  const scheduleProps = {
    payments,
    startDate,
    withdrawalInstallmentNo,
    ...actionProps,
  };

  return (
    <>
      <PaymentScheduleMobile {...scheduleProps} />
      <PaymentScheduleDesktop {...scheduleProps} />
    </>
  );
}
