-- Supabase schema for replacing localStorage with database storage
-- Patients table with JSONB substructures for admission, flowchart state, treatment, and lab results

create extension if not exists pgcrypto;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null,
  birth_date date not null,
  age int not null,
  gender text not null check (gender in ('masculino','feminino','outro')),
  weight numeric(6,2),
  allergies text[] default '{}',
  medical_record text not null,
  selected_flowchart text not null,
  general_observations text default '',
  return_count int not null default 0,

  admission jsonb not null,
  flowchart_state jsonb not null,
  treatment jsonb not null,
  status text not null check (status in ('active','waiting_labs','discharged')),
  lab_results jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists patients_status_idx on public.patients (status);
create index if not exists patients_selected_flowchart_idx on public.patients (selected_flowchart);
create index if not exists patients_medical_record_idx on public.patients (medical_record);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

-- RLS policies (development open policy)
alter table public.patients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'patients' and policyname = 'anon_dev_full_access'
  ) then
    create policy anon_dev_full_access on public.patients
    for all to anon
    using (true)
    with check (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'patients' and policyname = 'auth_dev_full_access_patients'
  ) then
    create policy auth_dev_full_access_patients on public.patients
    for all to authenticated
    using (true)
    with check (true);
  end if;
end $$;

-- Example JSON structure expectations (for reference):
-- admission: {
--   date: 'YYYY-MM-DD', time: 'HH:mm', symptoms: string[],
--   vitalSigns: { temp, bp, hr, rr, spo2 }
-- }
-- flowchart_state: {
--   currentStep, history: string[], answers: object, progress: number,
--   group: 'A'|'B'|'C'|'D', lastUpdate: timestamp
-- }
-- treatment: { prescriptions: object[], observations: string[], dischargeDate?, dischargeCriteria? }
-- lab_results: { hemoglobin?, hematocrit?, platelets?, albumin?, transaminases?: { alt?, ast? }, status?, requestDate?, resultDate? }
