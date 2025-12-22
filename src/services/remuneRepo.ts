import { supabase } from './supabaseClient';

export async function listNationalRemune() {
  const { data, error } = await supabase
    .from('remune_national')
    .select('id, available, restriction_notes, source_version, last_update, medicines:medicine_id (id, name, form, strength, unit, atc_code)')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
}

export async function listMunicipalRemune(municipality_id: number) {
  const { data, error } = await supabase
    .from('remune_municipal')
    .select('id, available, restriction_notes, last_update, medicines:medicine_id (id, name, form, strength, unit, atc_code)')
    .eq('municipality_id', municipality_id)
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
}

export async function searchMedicinesByName(query: string) {
  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, form, strength, unit, atc_code')
    .textSearch('name', query, { type: 'websearch', config: 'portuguese' })
    .limit(25);
  if (error) throw error;
  return data;
}

export async function upsertNationalItem(medicine_id: number, item: { available?: boolean; restriction_notes?: string; source_version?: string }) {
  const { data, error } = await supabase
    .from('remune_national')
    .upsert({ medicine_id, available: item.available ?? true, restriction_notes: item.restriction_notes ?? null, source_version: item.source_version ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertMunicipalItem(municipality_id: number, medicine_id: number, item: { available?: boolean; restriction_notes?: string }) {
  const { data, error } = await supabase
    .from('remune_municipal')
    .upsert({ municipality_id, medicine_id, available: item.available ?? true, restriction_notes: item.restriction_notes ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

