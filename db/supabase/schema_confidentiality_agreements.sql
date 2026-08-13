-- Termos de confidencialidade assinados no cadastro.
-- Mantém o PDF em bucket privado e os dados de auditoria em tabela protegida por RLS.

create extension if not exists pgcrypto;

create table if not exists public.confidentiality_agreements (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  full_name text not null,
  crm text not null,
  email text not null,
  term_version text not null,
  signed_at timestamptz not null,
  signature_name text not null,
  pdf_path text not null unique,
  pdf_sha256 text not null check (length(pdf_sha256) = 64),
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists confidentiality_agreements_auth_user_idx
  on public.confidentiality_agreements (auth_user_id);
create index if not exists confidentiality_agreements_doctor_idx
  on public.confidentiality_agreements (doctor_id);
create index if not exists confidentiality_agreements_signed_at_idx
  on public.confidentiality_agreements (signed_at desc);

alter table public.confidentiality_agreements enable row level security;

drop policy if exists confidentiality_agreements_insert_own on public.confidentiality_agreements;
create policy confidentiality_agreements_insert_own on public.confidentiality_agreements
  for insert to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists confidentiality_agreements_select_own_or_admin on public.confidentiality_agreements;
create policy confidentiality_agreements_select_own_or_admin on public.confidentiality_agreements
  for select to authenticated
  using (
    auth.uid() = auth_user_id
    or lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'joaopedrolopes@gmail.com',
      'rodrigoplutarco@hotmail.com',
      'wrkcristianehellena@gmail.com',
      'makotopanetta@gmail.com'
    )
  );

revoke all on table public.confidentiality_agreements from anon;
grant insert, select on table public.confidentiality_agreements to authenticated;

-- O painel administrativo precisa relacionar o termo ao cadastro do médico.
drop policy if exists doctors_admin_select on public.doctors;
create policy doctors_admin_select on public.doctors
  for select to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'joaopedrolopes@gmail.com',
      'rodrigoplutarco@hotmail.com',
      'wrkcristianehellena@gmail.com',
      'makotopanetta@gmail.com'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'confidentiality-terms',
  'confidentiality-terms',
  false,
  5242880,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists confidentiality_terms_insert_own on storage.objects;
create policy confidentiality_terms_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'confidentiality-terms'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists confidentiality_terms_select_own_or_admin on storage.objects;
create policy confidentiality_terms_select_own_or_admin on storage.objects
  for select to authenticated
  using (
    bucket_id = 'confidentiality-terms'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or lower(coalesce(auth.jwt() ->> 'email', '')) in (
        'joaopedrolopes@gmail.com',
        'rodrigoplutarco@hotmail.com',
        'wrkcristianehellena@gmail.com',
        'makotopanetta@gmail.com'
      )
    )
  );

drop policy if exists confidentiality_terms_delete_own on storage.objects;
create policy confidentiality_terms_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'confidentiality-terms'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
