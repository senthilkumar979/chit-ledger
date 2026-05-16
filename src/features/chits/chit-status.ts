import type { Chit } from '@/types/database';

export type ChitLifecycleVariant = 'success' | 'info' | 'danger';

export interface ChitLifecycleStatus {
  label: string;
  variant: ChitLifecycleVariant;
}

export function getChitLifecycleStatus(chit: Chit): ChitLifecycleStatus {
  if (chit.withdrawal) return { label: 'Withdrawn', variant: 'danger' };
  if (chit.matured) return { label: 'Matured', variant: 'info' };
  return { label: 'Active', variant: 'success' };
}

export function countPaidInstallments(chit: Chit): number {
  return chit.payments?.filter((p) => p.status === 'paid').length ?? 0;
}
