import { createClient } from '@/lib/supabase/client';
import type { Person } from '@/types/database';
import type { PersonFormData } from '@/schemas/person';

export async function fetchPersonById(id: string): Promise<Person> {
  const supabase = createClient();
  const { data, error } = await supabase.from('persons').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as Person;
}

export async function fetchPersons(search?: string): Promise<Person[]> {
  const supabase = createClient();
  let query = supabase.from('persons').select('*').order('name');

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Person[];
}

export async function createPerson(input: PersonFormData): Promise<Person> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('persons')
    .insert({
      name: input.name,
      city: input.city,
      phone: input.phone || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Person;
}

export async function updatePerson(
  id: string,
  input: PersonFormData,
): Promise<Person> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('persons')
    .update({
      name: input.name,
      city: input.city,
      phone: input.phone || null,
      notes: input.notes || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Person;
}

export async function deletePerson(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('persons').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
