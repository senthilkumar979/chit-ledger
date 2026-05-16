import { describe, expect, it } from '@jest/globals';
import { personSchema } from '@/schemas/person';

describe('personSchema', () => {
  it('validates required fields', () => {
    const result = personSchema.safeParse({
      name: 'Rajesh Kumar',
      city: 'Chennai',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = personSchema.safeParse({ name: 'A', city: 'Chennai' });
    expect(result.success).toBe(false);
  });
});
