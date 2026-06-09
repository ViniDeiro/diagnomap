import { supabase } from './supabaseClient';

export type DoctorProfile = {
  id?: string;
  auth_user_id?: string | null;
  name: string;
  crm?: string | null;
  specialty?: string | null;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  unit?: string | null;
  company?: string | null;
  avatar_url?: string | null;
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
      cpf: profile.cpf ?? null,
      unit: profile.unit ?? null,
      company: profile.company ?? null,
      avatar_url: profile.avatar_url ?? null,
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
    .maybeSingle();
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
    .maybeSingle();
  if (!error && data) return data;

  const email = user.email || null;
  if (email) {
    try {
      const doctor = await findDoctorByEmail(email);
      if (doctor && !doctor.auth_user_id) {
        const { data: linked } = await supabase
          .from('doctors')
          .update({ auth_user_id: user.id })
          .eq('id', doctor.id)
          .select()
          .single();
        return linked || doctor;
      }
      if (doctor) return doctor;
    } catch {}
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const term = (metadata.medical_responsibility_term || {}) as Record<string, unknown>;
  const fallbackName =
    typeof metadata.name === 'string' && metadata.name.trim()
      ? metadata.name.trim()
      : typeof metadata.full_name === 'string' && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : typeof term.name === 'string' && term.name.trim()
          ? term.name.trim()
          : email || 'Médico(a)';

  try {
    return await createDoctorProfile({
      auth_user_id: user.id,
      name: fallbackName,
      email,
      crm: typeof term.crmUf === 'string' ? term.crmUf : null,
      cpf: typeof term.cpf === 'string' ? term.cpf : null,
      unit: typeof term.unit === 'string' ? term.unit : null,
      company: typeof term.company === 'string' ? term.company : null,
      avatar_url: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null,
      status: 'active',
    });
  } catch (createError) {
    if (!email) throw createError;
    const doctor = await findDoctorByEmail(email);
    if (doctor && !doctor.auth_user_id) {
      const { data: linked, error: linkError } = await supabase
        .from('doctors')
        .update({ auth_user_id: user.id })
        .eq('id', doctor.id)
        .select()
        .single();
      if (linkError) throw linkError;
      return linked;
    }
    if (doctor) return doctor;
    throw createError;
  }
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
  const updatePayload: Record<string, unknown> = {}
  if ('name' in patch) updatePayload.name = patch.name
  if ('email' in patch) updatePayload.email = patch.email ?? null
  if ('crm' in patch) updatePayload.crm = patch.crm ?? null
  if ('specialty' in patch) updatePayload.specialty = patch.specialty ?? null
  if ('phone' in patch) updatePayload.phone = patch.phone ?? null
  if ('cpf' in patch) updatePayload.cpf = patch.cpf ?? null
  if ('unit' in patch) updatePayload.unit = patch.unit ?? null
  if ('company' in patch) updatePayload.company = patch.company ?? null
  if ('avatar_url' in patch) updatePayload.avatar_url = patch.avatar_url ?? null
  if ('municipality_id' in patch) updatePayload.municipality_id = patch.municipality_id ?? null
  if ('status' in patch) updatePayload.status = patch.status

  const { data, error } = await supabase
    .from('doctors')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
