import { cn } from '@/lib/utils';

export function isWithdrawalInstallment(
  installmentNo: number,
  withdrawalInstallmentNo: number | null,
): boolean {
  return withdrawalInstallmentNo != null && installmentNo === withdrawalInstallmentNo;
}

export function getPaymentScheduleRowClass(isWithdrawnMonth: boolean, isPaid: boolean): string {
  if (isWithdrawnMonth) {
    return 'border-danger/35 bg-danger/[0.06]';
  }
  if (isPaid) {
    return 'border-accent/25 bg-accent/[0.04]';
  }
  return 'border-border/80 bg-card hover:border-accent/20';
}

export function getPaymentScheduleDueMonthClass(isWithdrawnMonth: boolean, isPaid =false): string {
  return cn(isWithdrawnMonth ? 'font-semibold text-danger' : isPaid ? 'font-semibold text-accent' : 'font-semibold text-muted');
}
