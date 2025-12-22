-- Tabela de Fluxogramas (Flowcharts) e vínculo opcional com Patients

create extension if not exists pgcrypto;

create table if not exists public.flowcharts (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  version text not null default 'v1',
  definition jsonb not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flowcharts_key_idx on public.flowcharts (key);

-- Trigger updated_at (reusa function set_updated_at se já existir)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_flowcharts_updated_at on public.flowcharts;
create trigger set_flowcharts_updated_at
before update on public.flowcharts
for each row execute function public.set_updated_at();

-- RLS dev: abrir acesso para anon em desenvolvimento
alter table public.flowcharts enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'flowcharts' and policyname = 'anon_dev_full_access_flowcharts'
  ) then
    create policy anon_dev_full_access_flowcharts on public.flowcharts
    for all to anon
    using (true)
    with check (true);
  end if;
end $$;

-- Vínculo opcional em patients: flowchart_key referenciando flowcharts(key)
alter table if exists public.patients
  add column if not exists flowchart_key text;

do $$
begin
  -- Adiciona FK apenas se ainda não existir
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where t.relname = 'patients' and c.conname = 'patients_flowchart_key_fk'
  ) then
    alter table public.patients
      add constraint patients_flowchart_key_fk foreign key (flowchart_key)
      references public.flowcharts(key)
      on update cascade
      on delete restrict;
  end if;
end $$;

