'use client';

import { useState } from 'react';
import type { Payment } from '@/types/database';
import { PaymentScheduleDesktop } from './PaymentScheduleDesktop';
import { PaymentScheduleMobile } from './PaymentScheduleMobile';

interface PaymentScheduleProps {
  payments: Payment[];
  onMarkPaid?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onReset?: (payment: Payment) => void;
  canWrite: boolean;
}

export function PaymentSchedule({
  payments,
  onMarkPaid,
  onEdit,
  onReset,
  canWrite,
}: PaymentScheduleProps) {
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  const actionProps = {
    canWrite,
    confirmReset,
    onConfirmReset: setConfirmReset,
    onMarkPaid,
    onEdit,
    onReset,
  };

  return (
    <>
      <PaymentScheduleMobile payments={payments} {...actionProps} />
      <PaymentScheduleDesktop payments={payments} {...actionProps} />
    </>
  );
}
