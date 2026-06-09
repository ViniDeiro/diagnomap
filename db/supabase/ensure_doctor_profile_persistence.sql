-- Garante que qualquer usuário autenticado consiga criar, vincular e editar o proprio perfil medico.

alter table public.doctors
  add column if not exists cpf text,
  add column if not exists unit text,
  add column if not exists company text,
  add column if not exists avatar_url text;

create unique index if not exists doctors_auth_user_id_unique
  on public.doctors (auth_user_id)
  where auth_user_id is not null;

alter table public.doctors enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'doctors'
      and policyname = 'doctors_insert_own'
  ) then
    create policy doctors_insert_own on public.doctors
      for insert to authenticated
      with check (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'doctors'
      and policyname = 'doctors_select_own'
  ) then
    create policy doctors_select_own on public.doctors
      for select to authenticated
      using (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'doctors'
      and policyname = 'doctors_update_own'
  ) then
    create policy doctors_update_own on public.doctors
      for update to authenticated
      using (auth.uid() = auth_user_id)
      with check (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'doctors'
      and policyname = 'doctors_claim_by_email'
  ) then
    create policy doctors_claim_by_email on public.doctors
      for update to authenticated
      using (
        auth_user_id is null
        and email is not null
        and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      with check (auth.uid() = auth_user_id);
  end if;
end $$;
