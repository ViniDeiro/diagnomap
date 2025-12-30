-- Schema para perfis de médicos, municípios e listas REMUNE
-- Inclui também suporte à transferência de pacientes entre médicos

create extension if not exists pgcrypto;

-- Municípios (baseada em IBGE)
create table if not exists public.municipalities (
  id bigserial primary key,
  ibge_code text not null unique,
  name text not null,
  uf char(2) not null,
  created_at timestamptz not null default now()
);
create index if not exists municipalities_uf_idx on public.municipalities (uf);

-- Médicos / perfis
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid, -- opcional: referencia auth.users
  name text not null,
  crm text,
  specialty text,
  email text unique,
  phone text,
  municipality_id bigint references public.municipalities(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists doctors_municipality_idx on public.doctors (municipality_id);
create index if not exists doctors_status_idx on public.doctors (status);

-- Trigger updated_at (reusa function set_updated_at se já existir)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_doctors_updated_at on public.doctors;
create trigger set_doctors_updated_at
before update on public.doctors
for each row execute function public.set_updated_at();

-- Catálogo de medicamentos
create table if not exists public.medicines (
  id bigserial primary key,
  name text not null,
  form text,           -- ex: comprimido, solução oral, injetável
  strength text,       -- ex: 500mg, 10mg/ml
  unit text,           -- ex: mg, ml, UI
  atc_code text,       -- opcional
  active_ingredients jsonb default '[]',
  created_at timestamptz not null default now()
);
create index if not exists medicines_name_idx on public.medicines using gin (to_tsvector('portuguese', name));

-- REMUNE nacional (lista essencial nacional)
create table if not exists public.remune_national (
  id bigserial primary key,
  medicine_id bigint not null references public.medicines(id) on delete cascade,
  available boolean not null default true,
  restriction_notes text,
  source_version text,
  last_update timestamptz not null default now(),
  unique (medicine_id)
);
create index if not exists remune_national_medicine_idx on public.remune_national (medicine_id);

-- REMUNE municipal (por município)
create table if not exists public.remune_municipal (
  id bigserial primary key,
  municipality_id bigint not null references public.municipalities(id) on delete cascade,
  medicine_id bigint not null references public.medicines(id) on delete cascade,
  available boolean not null default true,
  restriction_notes text,
  last_update timestamptz not null default now(),
  unique (municipality_id, medicine_id)
);
create index if not exists remune_municipal_municipality_idx on public.remune_municipal (municipality_id);

-- Transferência de pacientes entre médicos
alter table if exists public.patients
  add column if not exists assigned_doctor_id uuid references public.doctors(id) on delete set null;

create table if not exists public.patient_transfers (
  id bigserial primary key,
  patient_id uuid not null references public.patients(id) on delete cascade,
  from_doctor_id uuid references public.doctors(id) on delete set null,
  to_doctor_id uuid not null references public.doctors(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.doctors(id) on delete set null
);
create index if not exists patient_transfers_patient_idx on public.patient_transfers (patient_id);
create index if not exists patient_transfers_to_doctor_idx on public.patient_transfers (to_doctor_id);

-- RLS dev: abrir acesso para anon em desenvolvimento
alter table public.municipalities enable row level security;
alter table public.doctors enable row level security;
alter table public.medicines enable row level security;
alter table public.remune_national enable row level security;
alter table public.remune_municipal enable row level security;
alter table public.patient_transfers enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='municipalities' and policyname='anon_dev_full_access_municipalities') then
    create policy anon_dev_full_access_municipalities on public.municipalities for all to anon using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='anon_dev_full_access_doctors') then
    create policy anon_dev_full_access_doctors on public.doctors for all to anon using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='auth_dev_full_access_doctors') then
    create policy auth_dev_full_access_doctors on public.doctors for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='medicines' and policyname='anon_dev_full_access_medicines') then
    create policy anon_dev_full_access_medicines on public.medicines for all to anon using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='remune_national' and policyname='anon_dev_full_access_remune_national') then
    create policy anon_dev_full_access_remune_national on public.remune_national for all to anon using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='remune_municipal' and policyname='anon_dev_full_access_remune_municipal') then
    create policy anon_dev_full_access_remune_municipal on public.remune_municipal for all to anon using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='patient_transfers' and policyname='anon_dev_full_access_patient_transfers') then
    create policy anon_dev_full_access_patient_transfers on public.patient_transfers for all to anon using (true) with check (true);
  end if;
end $$;

-- Policies robustas para produção (permitem operações do usuário autenticado)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='doctors_insert_own') then
    create policy doctors_insert_own on public.doctors
      for insert to authenticated
      with check (auth.uid() = auth_user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='doctors_select_own') then
    create policy doctors_select_own on public.doctors
      for select to authenticated
      using (auth.uid() = auth_user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='doctors_update_own') then
    create policy doctors_update_own on public.doctors
      for update to authenticated
      using (auth.uid() = auth_user_id)
      with check (auth.uid() = auth_user_id);
  end if;
  -- Municípios: leitura pública (anon e authenticated) segura
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='municipalities' and policyname='municipalities_select_public') then
    create policy municipalities_select_public on public.municipalities
      for select to anon, authenticated
      using (true);
  end if;
end $$;

-- Comentários:
-- 1) Para produção, substitua políticas abertas por regras de acesso por usuário/perfil.
-- 2) A transferência de paciente deve sempre registrar em patient_transfers e atualizar patients.assigned_doctor_id.
-- 3) As listas REMUNE podem ser carregadas via seed (CSV) para medicines, remune_national e remune_municipal.
