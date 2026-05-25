import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import { grantFormToRate, type GrantFormData } from '@/schemas/grant';
import type { Grant } from '@/types/database';

function mapGrant(row: Grant): Grant {
  return {
    ...row,
    amount: Number(row.amount),
    interest_rate: Number(row.interest_rate),
  };
}

export async function fetchGrants(): Promise<Grant[]> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('grants')
      .select('*, grant_to:persons(id, name, name_tamil, city)')
      .order('interest_start_date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapGrant(row as Grant));
  });
}

export async function fetchGrantById(id: string): Promise<Grant> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('grants')
      .select('*, grant_to:persons(id, name, name_tamil, city)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapGrant(data as Grant);
  });
}

export async function createGrant(form: GrantFormData): Promise<Grant> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('grants')
      .insert({
        grant_to_person_id: form.grant_to_person_id,
        amount: form.amount,
        interest_start_date: form.interest_start_date,
        interest_rate: grantFormToRate(form.interest_percent),
        notes: form.notes?.trim() || null,
      })
      .select('*, grant_to:persons(id, name, name_tamil, city)')
      .single();

    if (error) throw new Error(error.message);
    return mapGrant(data as Grant);
  });
}

export async function updateGrant(id: string, form: GrantFormData): Promise<Grant> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('grants')
      .update({
        grant_to_person_id: form.grant_to_person_id,
        amount: form.amount,
        interest_start_date: form.interest_start_date,
        interest_rate: grantFormToRate(form.interest_percent),
        notes: form.notes?.trim() || null,
      })
      .eq('id', id)
      .select('*, grant_to:persons(id, name, name_tamil, city)')
      .single();

    if (error) throw new Error(error.message);
    return mapGrant(data as Grant);
  });
}

export async function deleteGrant(id: string): Promise<void> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { error } = await supabase.from('grants').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });
}
