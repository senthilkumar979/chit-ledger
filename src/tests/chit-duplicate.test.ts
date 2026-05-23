import { describe, expect, it } from '@jest/globals';
import { ChitTypes } from '@/constants/chit-config';
import { chitToDuplicateFormData } from '@/utils/chit-duplicate';

describe('chitToDuplicateFormData', () => {
  it('copies chit setup fields for a new insert', () => {
    const form = chitToDuplicateFormData({
      person_id: '11111111-1111-1111-1111-111111111111',
      type: ChitTypes.ONE_LAKH,
      category: 'Monthly',
      start_date: '2026-01-15',
      end_date: '2027-08-15',
    });

    expect(form).toEqual({
      person_id: '11111111-1111-1111-1111-111111111111',
      type: ChitTypes.ONE_LAKH,
      category: 'Monthly',
      start_date: '2026-01-15',
      end_date: '2027-08-15',
    });
  });
});
