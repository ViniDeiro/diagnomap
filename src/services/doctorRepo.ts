import { supabase } from './supabaseClient';

export type DoctorProfile = {
  id?: string;
  auth_user_id?: string | null;
  name: string;
  crm?: string | null;
  specialty?: string | null;
  email?: string | null;
  phone?: string | null;
  municipality_id?: number | null;
  status?: 'active' | 'inactive';
};

export async function createDoctorProfile(profile: DoctorProfile) {
  const { data, error } = await supabase
    .from('doctors')
    .insert({
      auth_user_id: profile.auth_user_id ?? null,
      name: profile.name,
      crm: profile.crm ?? null,
      specialty: profile.specialty ?? null,
      email: profile.email ?? null,
      phone: profile.phone ?? null,
      municipality_id: profile.municipality_id ?? null,
      status: profile.status ?? 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getDoctorById(id: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function findDoctorByEmail(email: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', email)
    .single();
  if (error) throw error;
  return data;
}

export async function listDoctors(filters?: { municipality_id?: number; status?: string }) {
  let query = supabase.from('doctors').select('*').order('created_at', { ascending: false });
  if (filters?.municipality_id) query = query.eq('municipality_id', filters.municipality_id);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCurrentDoctor() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
  if (!error && data) return data;
  const email = user.email || null;
  if (email) {
    try {
      return await findDoctorByEmail(email);
    } catch {}
  }
  return null;
}

export async function searchDoctors(query: string, opts?: { municipality_id?: number; status?: string; limit?: number }) {
  const limit = opts?.limit ?? 10;
  const pattern = `%${query}%`;
  let q = supabase
    .from('doctors')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit)
    .or(`name.ilike.${pattern},crm.ilike.${pattern}`);
  if (opts?.municipality_id) q = q.eq('municipality_id', opts.municipality_id);
  if (opts?.status) q = q.eq('status', opts.status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function transferPatient(patientId: string, toDoctorId: string, options?: { note?: string; created_by?: string }) {
  // Fetch current patient to capture from_doctor_id
  const { data: patient, error: patientErr } = await supabase
    .from('patients')
    .select('id, assigned_doctor_id')
    .eq('id', patientId)
    .single();
  if (patientErr) throw patientErr;

  const fromDoctorId = patient?.assigned_doctor_id ?? null;

  // Create transfer record
  const { error: transferErr } = await supabase
    .from('patient_transfers')
    .insert({
      patient_id: patientId,
      from_doctor_id: fromDoctorId,
      to_doctor_id: toDoctorId,
      note: options?.note ?? null,
      created_by: options?.created_by ?? null,
    });
  if (transferErr) throw transferErr;

  // Update patient assignment
  const { data: updated, error: updErr } = await supabase
    .from('patients')
    .update({ assigned_doctor_id: toDoctorId })
    .eq('id', patientId)
    .select()
    .single();
  if (updErr) throw updErr;
  return updated;
}

// Auth helpers (opcional): cadastro e login via Supabase Auth
export async function signUpDoctor(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInDoctor(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutDoctor() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateDoctorProfile(id: string, patch: Partial<DoctorProfile>) {
  const { data, error } = await supabase
    .from('doctors')
    .update({
      name: patch.name,
      crm: patch.crm ?? null,
      specialty: patch.specialty ?? null,
      phone: patch.phone ?? null,
      municipality_id: patch.municipality_id ?? null,
      status: patch.status ?? undefined,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
