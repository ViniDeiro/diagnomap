import { supabase } from './supabaseClient';

let activePatientId: string | null = null;

export function enableLocalStorageReplication(patientId: string) {
  activePatientId = patientId;

  if (typeof window === 'undefined') return;
  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  if (!(window as any).__supa_storage_patched__) {
    (window as any).__supa_storage_patched__ = true;

    window.localStorage.setItem = (key: string, value: string) => {
      try { originalSetItem(key, value); } catch {}
      replicateKeyValue(key, value).catch(() => {});
    };

    window.localStorage.removeItem = (key: string) => {
      try { originalRemoveItem(key); } catch {}
      removeReplicatedKey(key).catch(() => {});
    };
  }
}

export async function hydrateLocalStorageFromDB(patientId: string) {
  if (typeof window === 'undefined') return;
  const { data, error } = await supabase
    .from('patients')
    .select('flowchart_state')
    .eq('id', patientId)
    .single();
  if (error) return;
  const storage = (data?.flowchart_state?.storage ?? {}) as Record<string, string>;
  for (const [k, v] of Object.entries(storage)) {
    try { window.localStorage.setItem(k, v); } catch {}
  }
}

async function replicateKeyValue(key: string, value: string) {
  const patientId = extractPatientIdFromKey(key) || activePatientId;
  if (!patientId) return;
  const { data, error } = await supabase
    .from('patients')
    .select('id, flowchart_state')
    .eq('id', patientId)
    .single();
  if (error) return;
  const flow = (data?.flowchart_state ?? {}) as any;
  flow.storage = flow.storage || {};
  flow.storage[key] = value;
  await supabase.from('patients').update({ flowchart_state: flow }).eq('id', patientId);
}

async function removeReplicatedKey(key: string) {
  const patientId = extractPatientIdFromKey(key) || activePatientId;
  if (!patientId) return;
  const { data, error } = await supabase
    .from('patients')
    .select('id, flowchart_state')
    .eq('id', patientId)
    .single();
  if (error) return;
  const flow = (data?.flowchart_state ?? {}) as any;
  if (flow.storage && flow.storage[key] !== undefined) {
    delete flow.storage[key];
    await supabase.from('patients').update({ flowchart_state: flow }).eq('id', patientId);
  }
}

function extractPatientIdFromKey(key: string): string | null {
  const match = key.match(/_(patient_[A-Za-z0-9]+|[0-9a-fA-F-]{36})$/);
  return match ? match[1] : null;
}

