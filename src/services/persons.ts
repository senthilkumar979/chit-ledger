import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import type { Person } from '@/types/database';
import type { PersonFormData } from '@/schemas/person';

export interface PersonWithStats extends Person {
  activeChitCount: number;
}

interface PersonChitRow {
  matured: boolean;
  withdrawal: boolean;
}

export async function fetchPersonById(id: string): Promise<Person> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('persons').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data as Person;
  });
}

export async function fetchPersons(search?: string): Promise<Person[]> {
  return fetchPersonsWithStats(search);
}

export async function fetchPersonsWithStats(search?: string): Promise<PersonWithStats[]> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    let query = supabase
      .from('persons')
      .select('*, chits(matured, withdrawal)')
      .order('name');

    if (search?.trim()) {
      query = query.or(
        `name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const { chits, ...person } = row as Person & { chits?: PersonChitRow[] };
      const activeChitCount = (chits ?? []).filter((c) => !c.matured && !c.withdrawal).length;
      return { ...(person as Person), activeChitCount };
    });
  });
}

export async function createPerson(input: PersonFormData): Promise<Person> {
  return supabaseRequest(async () => {
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
  });
}

export async function updatePerson(id: string, input: PersonFormData): Promise<Person> {
  return supabaseRequest(async () => {
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
  });
}

export async function deletePerson(id: string): Promise<void> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { error } = await supabase.from('persons').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });
}
