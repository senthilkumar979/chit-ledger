import { describe, expect, it } from '@jest/globals';
import { getPersonChitStats, isPersonActiveChit } from '@/utils/person-chit-stats';

const today = '2026-05-24';

describe('isPersonActiveChit', () => {
  it('returns true when end date is after today and not matured', () => {
    expect(
      isPersonActiveChit({ matured: false, withdrawal: false, end_date: '2026-12-01' }, today),
    ).toBe(true);
  });

  it('returns false when matured', () => {
    expect(
      isPersonActiveChit({ matured: true, withdrawal: false, end_date: '2026-12-01' }, today),
    ).toBe(false);
  });

  it('returns false when end date is today or in the past', () => {
    expect(
      isPersonActiveChit({ matured: false, withdrawal: false, end_date: today }, today),
    ).toBe(false);
    expect(
      isPersonActiveChit({ matured: false, withdrawal: false, end_date: '2026-01-01' }, today),
    ).toBe(false);
  });

  it('returns false when end date is missing', () => {
    expect(
      isPersonActiveChit({ matured: false, withdrawal: false, end_date: null }, today),
    ).toBe(false);
  });

  it('counts withdrawn chits that are still active by date', () => {
    expect(
      isPersonActiveChit({ matured: false, withdrawal: true, end_date: '2026-12-01' }, today),
    ).toBe(true);
  });
});

describe('getPersonChitStats', () => {
  it('counts withdrawn only among active chits', () => {
    const stats = getPersonChitStats(
      [
        { matured: false, withdrawal: true, end_date: '2026-12-01' },
        { matured: false, withdrawal: false, end_date: '2026-12-01' },
        { matured: true, withdrawal: true, end_date: '2026-12-01' },
        { matured: false, withdrawal: true, end_date: '2026-01-01' },
      ],
      today,
    );
    expect(stats.activeChitCount).toBe(2);
    expect(stats.withdrawnActiveChitCount).toBe(1);
  });
});
