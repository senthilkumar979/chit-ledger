import { describe, expect, it } from '@jest/globals';
import { personSchema } from '@/schemas/person';

describe('personSchema', () => {
  it('validates required fields', () => {
    const result = personSchema.safeParse({
      name: 'Rajesh Kumar',
      name_tamil: 'ராஜேஷ் குமார்',
      city: 'Madurai',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid city', () => {
    const result = personSchema.safeParse({
      name: 'Rajesh Kumar',
      name_tamil: 'ராஜேஷ் குமார்',
      city: 'Chennai',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = personSchema.safeParse({
      name: 'A',
      name_tamil: 'அ',
      city: 'Madurai',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short tamil name', () => {
    const result = personSchema.safeParse({
      name: 'Rajesh Kumar',
      name_tamil: 'அ',
      city: 'Madurai',
    });
    expect(result.success).toBe(false);
  });
});
