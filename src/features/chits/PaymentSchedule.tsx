'use client';

import { useState } from 'react';
import type { Payment } from '@/types/database';
import { PaymentScheduleDesktop } from './PaymentScheduleDesktop';
import { PaymentScheduleMobile } from './PaymentScheduleMobile';

interface PaymentScheduleProps {
  payments: Payment[];
  startDate: string | null;
  onMarkPaid?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onReset?: (payment: Payment) => void;
  canWrite: boolean;
}

export function PaymentSchedule({
  payments,
  startDate,
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
      <PaymentScheduleMobile payments={payments} startDate={startDate} {...actionProps} />
      <PaymentScheduleDesktop payments={payments} startDate={startDate} {...actionProps} />
    </>
  );
}
