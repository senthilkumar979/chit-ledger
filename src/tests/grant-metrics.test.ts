import { describe, expect, it } from '@jest/globals';
import { buildGrantDisplayMetrics } from '@/utils/grant-metrics';
import type { Grant } from '@/types/database';

const baseGrant: Grant = {
  id: 'g1',
  grant_to_person_id: 'p1',
  amount: 100_000,
  interest_rate: 0.01,
  interest_start_date: '2026-01-01',
  notes: null,
  created_at: '',
  updated_at: '',
};

describe('buildGrantDisplayMetrics', () => {
  it('calculates monthly interest and accrued interest from start date', () => {
    const metrics = buildGrantDisplayMetrics(baseGrant, '2026-04-01');
    expect(metrics.monthlyInterest).toBe(1_000);
    expect(metrics.monthsSinceStart).toBe(4);
    expect(metrics.interestSoFar).toBe(4_000);
  });
});
