import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import type { Chit, ChitWithPayments } from '@/types/database';
import type { ChitFormData } from '@/schemas/chit';
import { chitToDuplicateFormData } from '@/utils/chit-duplicate';
import { chitEndDateFromStart } from '@/utils/installment-due';

export async function fetchChitsByPerson(personId: string): Promise<Chit[]> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('chits')
      .select('*, person:persons(id, name, city), payments(status)')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Chit[];
  });
}

export async function fetchChits(search?: string): Promise<Chit[]> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('chits')
      .select('*, person:persons(id, name, city, phone), payments(status)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    let results = (data ?? []) as Chit[];
    if (search?.trim()) {
      const q = search.toLowerCase();
      results = results.filter((c) => {
        const name = c.person?.name?.toLowerCase() ?? '';
        return name.includes(q) || c.category.toLowerCase().includes(q);
      });
    }
    return results;
  });
}

export async function fetchChitById(id: string): Promise<ChitWithPayments> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('chits')
      .select('*, person:persons(*), payments(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    const chit = data as ChitWithPayments;
    chit.payments.sort((a, b) => a.installment_no - b.installment_no);
    return chit;
  });
}

export async function createChit(input: ChitFormData): Promise<Chit> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const endDate =
      input.end_date ||
      (input.start_date ? chitEndDateFromStart(input.start_date) : null);

    const { data, error } = await supabase
      .from('chits')
      .insert({
        person_id: input.person_id,
        type: input.type,
        category: input.category,
        start_date: input.start_date || null,
        end_date: endDate,
      })
      .select('*, person:persons(id, name, city)')
      .single();

    if (error) throw new Error(error.message);
    return data as Chit;
  });
}

export async function duplicateChit(
  source: Pick<Chit, 'person_id' | 'type' | 'category' | 'start_date' | 'end_date'>,
): Promise<Chit> {
  return createChit(chitToDuplicateFormData(source));
}

export async function updateChit(id: string, input: ChitFormData): Promise<Chit> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const endDate =
      input.end_date || (input.start_date ? chitEndDateFromStart(input.start_date) : null);

    const { data, error } = await supabase
      .from('chits')
      .update({
        person_id: input.person_id,
        type: input.type,
        category: input.category,
        start_date: input.start_date || null,
        end_date: endDate,
      })
      .eq('id', id)
      .select('*, person:persons(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as Chit;
  });
}

export async function deleteChit(id: string): Promise<void> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { error } = await supabase.from('chits').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });
}
