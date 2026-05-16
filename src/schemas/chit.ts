import { z } from 'zod';
import { ChitTypes } from '@/constants/chit-config';
import { ChitCategories } from '@/constants/chit-categories';

export const chitSchema = z.object({
  person_id: z.string().uuid('Select a member'),
  type: z.enum([ChitTypes.ONE_LAKH, ChitTypes.TWO_LAKH]),
  category: z.enum(ChitCategories),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
});

export type ChitFormData = z.infer<typeof chitSchema>;
