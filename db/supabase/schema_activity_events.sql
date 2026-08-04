create extension if not exists pgcrypto;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  user_email text not null,
  doctor_name text,
  patient_external_id text,
  flowchart_id text,
  flowchart_name text,
  event_type text not null,
  step_id text,
  progress integer check (progress is null or (progress >= 0 and progress <= 100)),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists activity_events_occurred_at_idx on public.activity_events (occurred_at desc);
create index if not exists activity_events_auth_user_id_idx on public.activity_events (auth_user_id);
create index if not exists activity_events_flowchart_id_idx on public.activity_events (flowchart_id);

alter table public.activity_events enable row level security;

drop policy if exists activity_events_insert_own on public.activity_events;
create policy activity_events_insert_own on public.activity_events
  for insert to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists activity_events_admin_select on public.activity_events;
create policy activity_events_admin_select on public.activity_events
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'joaopedrolopes@gmail.com');

revoke all on table public.activity_events from anon;
grant insert on table public.activity_events to authenticated;
grant select on table public.activity_events to authenticated;
