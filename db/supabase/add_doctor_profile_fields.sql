alter table public.doctors
  add column if not exists cpf text,
  add column if not exists unit text,
  add column if not exists company text,
  add column if not exists avatar_url text;
