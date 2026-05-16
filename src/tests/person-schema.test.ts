import { describe, expect, it } from '@jest/globals';
import { personSchema } from '@/schemas/person';

describe('personSchema', () => {
  it('validates required fields', () => {
    const result = personSchema.safeParse({
      name: 'Rajesh Kumar',
      city: 'Madurai',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid city', () => {
    const result = personSchema.safeParse({ name: 'Rajesh Kumar', city: 'Chennai' });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = personSchema.safeParse({ name: 'A', city: 'Madurai' });
    expect(result.success).toBe(false);
  });
});
