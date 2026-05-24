import { todayLocalIsoDate } from '@/utils/loan-calculations';

export interface PersonChitStatsInput {
  matured: boolean;
  withdrawal: boolean;
  end_date: string | null;
}

/** Active: not matured and end date is after today (local calendar). */
export function isPersonActiveChit(
  chit: PersonChitStatsInput,
  today = todayLocalIsoDate(),
): boolean {
  if (chit.matured) return false;
  if (!chit.end_date) return false;
  return chit.end_date > today;
}

export function getPersonChitStats(
  chits: PersonChitStatsInput[],
  today = todayLocalIsoDate(),
): { activeChitCount: number; withdrawnActiveChitCount: number } {
  const active = chits.filter((c) => isPersonActiveChit(c, today));
  return {
    activeChitCount: active.length,
    withdrawnActiveChitCount: active.filter((c) => c.withdrawal).length,
  };
}
