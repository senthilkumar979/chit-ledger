import { z } from 'zod';
import { MemberCities } from '@/constants/member-cities';

export const personSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  city: z.enum(MemberCities, { message: 'Select a city' }),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type PersonFormData = z.infer<typeof personSchema>;
