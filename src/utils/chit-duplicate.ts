import type { ChitFormData } from '@/schemas/chit';
import type { Chit } from '@/types/database';

export function chitToDuplicateFormData(
  chit: Pick<Chit, 'person_id' | 'type' | 'category' | 'start_date' | 'end_date'>,
): ChitFormData {
  return {
    person_id: chit.person_id,
    type: chit.type,
    category: chit.category as ChitFormData['category'],
    start_date: chit.start_date ?? '',
    end_date: chit.end_date ?? '',
  };
}
