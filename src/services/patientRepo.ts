import { supabase } from './supabaseClient';
import { getCurrentDoctor } from './doctorRepo';
import { Patient, Prescription } from '@/types/patient';

// Minimal shapes aligned with the DB JSONB columns
export type PatientPayload = {
  external_id?: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  age: number;
  gender: string;
  weight?: number;
  allergies?: string[];
  medical_record: string;
  selected_flowchart: string;
  flowchart_key?: string | null;
  general_observations?: string;
  return_count?: number;
  assigned_doctor_id?: string | null;
  admission: Record<string, any>;
  flowchart_state: Record<string, any>;
  treatment: Record<string, any>;
  status: 'active' | 'waiting_labs' | 'discharged';
  lab_results?: Record<string, any> | null;
};

export async function insertPatient(payload: PatientPayload) {
  const { data, error } = await supabase
    .from('patients')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatient(id: string, patch: Partial<PatientPayload>) {
  const { data, error } = await supabase
    .from('patients')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Ensure flowchart linkage when inserting: set flowchart_key if corresponding flowchart exists
export async function insertPatientWithFlowLink(payload: PatientPayload) {
  const patch = { ...payload } as PatientPayload
  if (!patch.flowchart_key && patch.selected_flowchart) {
    const { data: flow, error: flowErr } = await supabase
      .from('flowcharts')
      .select('key')
      .eq('key', patch.selected_flowchart)
      .limit(1)
    if (!flowErr && Array.isArray(flow) && flow.length > 0) {
      patch.flowchart_key = flow[0].key
    }
  }
  if (!patch.assigned_doctor_id) {
    const current = await getCurrentDoctor();
    if (current?.id) {
      patch.assigned_doctor_id = current.id;
    }
  }
  const { data, error } = await supabase
    .from('patients')
    .insert(patch)
    .select()
    .single()
  if (error) throw error
  return data
}

// Ensure flowchart linkage when updating: set flowchart_key if selected_flowchart changes and flowchart exists
export async function updatePatientWithFlowLink(id: string, patch: Partial<PatientPayload>) {
  const upd = { ...patch }
  if (!upd.flowchart_key && upd.selected_flowchart) {
    const { data: flow, error: flowErr } = await supabase
      .from('flowcharts')
      .select('key')
      .eq('key', upd.selected_flowchart)
      .limit(1)
    if (!flowErr && Array.isArray(flow) && flow.length > 0) {
      upd.flowchart_key = flow[0].key
    }
  }
  if (!upd.assigned_doctor_id) {
    const current = await getCurrentDoctor();
    if (current?.id) {
      upd.assigned_doctor_id = current.id;
    }
  }
  const { data, error } = await supabase
    .from('patients')
    .update(upd)
    .eq('external_id', id)
    .select()
    .single()
  if (!error) return data
  if ((error as any)?.code === 'PGRST116') {
    const full = { ...upd, external_id: id }
    const { data: upserted, error: upsertErr } = await supabase
      .from('patients')
      .upsert(full, { onConflict: 'external_id' })
      .select()
      .single()
    if (upsertErr) throw upsertErr
    return upserted
  }
  throw error
}

export async function listPatients(filters?: { status?: string }) {
  const current = await getCurrentDoctor();
  let query = supabase.from('patients').select('*').order('created_at', { ascending: false });

  if (current?.id) {
    query = query.eq('assigned_doctor_id', current.id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPatientById(id: string) {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw error;
}

// Optional helper to map local form data into DB payload structure
export function mapFormToPatientPayload(formData: any): PatientPayload {
  return {
    external_id: formData?.externalId ?? undefined,
    name: formData.name,
    birth_date: formData.birthDate, // ensure YYYY-MM-DD
    age: formData.age,
    gender: formData.gender,
    weight: formData.weight ?? undefined,
    allergies: formData.allergies ?? [],
    medical_record: formData.medicalRecord,
    selected_flowchart: formData.selectedFlowchart ?? 'dengue',
    general_observations: formData.generalObservations ?? '',
    return_count: formData.returnCount ?? 0,
    assigned_doctor_id: formData.assignedDoctorId ?? null,
    admission: {
      date: formData.admission?.date,
      time: formData.admission?.time,
      symptoms: formData.admission?.symptoms ?? [],
      vitalSigns: formData.admission?.vitalSigns ?? null,
    },
    flowchart_state: {
      currentStep: formData.flowchartState?.currentStep ?? null,
      history: formData.flowchartState?.history ?? [],
      answers: formData.flowchartState?.answers ?? {},
      progress: formData.flowchartState?.progress ?? 0,
      group: formData.flowchartState?.group ?? null,
      lastUpdate: formData.flowchartState?.lastUpdate ?? new Date().toISOString(),
    },
    treatment: {
      prescriptions: formData.treatment?.prescriptions ?? [],
      observations: formData.treatment?.observations ?? [],
      dischargeDate: formData.treatment?.dischargeDate ?? null,
      dischargeCriteria: formData.treatment?.dischargeCriteria ?? [],
    },
    status: formData.status ?? 'active',
    lab_results: formData.labResults ?? null,
  };
}

export function toUIPatient(row: any): Patient {
  const admission = row.admission || {};
  const flow = row.flowchart_state || {};
  const treatment = row.treatment || {};
  const labs = row.lab_results || {};

  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date ? new Date(row.birth_date) : new Date(),
    age: row.age ?? 0,
    gender: row.gender ?? 'masculino',
    weight: row.weight ?? undefined,
    allergies: row.allergies ?? [],
    medicalRecord: row.medical_record,
    selectedFlowchart: row.selected_flowchart,
    generalObservations: row.general_observations ?? '',
    returnCount: row.return_count ?? 0,
    admission: {
      date: admission.date ? new Date(admission.date) : new Date(),
      time: admission.time ?? '',
      symptoms: admission.symptoms ?? [],
      vitalSigns: admission.vitalSigns ?? undefined,
    },
    flowchartState: {
      currentStep: flow.currentStep ?? 'start',
      history: flow.history ?? [],
      answers: flow.answers ?? {},
      progress: flow.progress ?? 0,
      group: flow.group ?? undefined,
      lastUpdate: flow.lastUpdate ? new Date(flow.lastUpdate) : new Date(),
    },
    treatment: {
      prescriptions: (treatment.prescriptions ?? []) as Prescription[],
      observations: treatment.observations ?? [],
      nextEvaluation: treatment.nextEvaluation ? new Date(treatment.nextEvaluation) : undefined,
      dischargeDate: treatment.dischargeDate ? new Date(treatment.dischargeDate) : undefined,
      dischargeCriteria: treatment.dischargeCriteria ?? undefined,
    },
    status: row.status,
    labResults: labs
      ? {
          hemoglobin: labs.hemoglobin ?? undefined,
          hematocrit: labs.hematocrit ?? undefined,
          platelets: labs.platelets ?? undefined,
          albumin: labs.albumin ?? undefined,
          transaminases: labs.transaminases ?? { alt: undefined, ast: undefined },
          requestDate: labs.requestDate ? new Date(labs.requestDate) : undefined,
          resultDate: labs.resultDate ? new Date(labs.resultDate) : undefined,
          status: labs.status ?? undefined,
        }
      : undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  } as Patient;
}

export function fromUIPatient(patient: Patient): PatientPayload {
  return {
    external_id: patient.id,
    name: patient.name,
    birth_date: patient.birthDate.toISOString().slice(0, 10),
    age: patient.age,
    gender: patient.gender,
    weight: patient.weight,
    allergies: patient.allergies,
    medical_record: patient.medicalRecord,
    selected_flowchart: patient.selectedFlowchart,
    general_observations: patient.generalObservations,
    return_count: patient.returnCount ?? 0,
    admission: {
      ...patient.admission,
      date: patient.admission.date instanceof Date ? patient.admission.date.toISOString() : patient.admission.date,
    },
    flowchart_state: {
      ...patient.flowchartState,
      lastUpdate: patient.flowchartState.lastUpdate instanceof Date
        ? patient.flowchartState.lastUpdate.toISOString()
        : patient.flowchartState.lastUpdate,
    },
    treatment: {
      ...patient.treatment,
      nextEvaluation: patient.treatment.nextEvaluation ? patient.treatment.nextEvaluation.toISOString() : undefined,
      dischargeDate: patient.treatment.dischargeDate ? patient.treatment.dischargeDate.toISOString() : undefined,
    } as any,
    status: patient.status,
    lab_results: patient.labResults
      ? {
          ...patient.labResults,
          requestDate: patient.labResults.requestDate ? patient.labResults.requestDate.toISOString() : undefined,
          resultDate: patient.labResults.resultDate ? patient.labResults.resultDate.toISOString() : undefined,
        }
      : undefined,
  };
}

export async function updatePatientByExternalId(external_id: string, patch: Partial<PatientPayload>) {
  const { data, error } = await supabase
    .from('patients')
    .update(patch)
    .eq('external_id', external_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
