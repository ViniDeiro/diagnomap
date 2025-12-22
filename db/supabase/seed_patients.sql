-- Seeds básicos para municipalities, doctors e patients
-- Seguros para reexecução com ON CONFLICT

-- Município SP
insert into public.municipalities (ibge_code, name, uf)
values ('3550308', 'São Paulo', 'SP')
on conflict (ibge_code) do nothing;

-- Doutor padrão
insert into public.doctors (name, crm, specialty, email, phone, municipality_id, status)
values (
  'Dra. Ana Souza', '12345-SP', 'Clínica Médica', 'ana.souza@example.com', '+55 11 99999-0001',
  (select id from public.municipalities where ibge_code = '3550308'), 'active'
)
on conflict (email) do nothing;

-- Paciente 1 (ativo)
insert into public.patients (
  external_id, name, birth_date, age, gender, weight, allergies, medical_record,
  selected_flowchart, general_observations, return_count,
  admission, flowchart_state, treatment, status, lab_results, assigned_doctor_id
)
values (
  'EXT-0001', 'Maria Silva', '1985-03-12', 39, 'feminino', 62.5, array['dipirona'], 'MR-0001',
  'Dengue', 'Observações iniciais', 0,
  '{"date":"2025-12-09","time":"10:30","symptoms":["febre","mialgia"],"vitalSigns":{"temp":38.2,"bp":"120/80","hr":90,"rr":18,"spo2":97}}'::jsonb,
  '{"currentStep":"triagem","history":[],"answers":{},"progress":20,"group":"B","lastUpdate":"2025-12-09T10:30:00Z"}'::jsonb,
  '{"prescriptions":[{"name":"Paracetamol","dose":"500mg","freq":"8/8h"}],"observations":"Hidratação oral"}'::jsonb,
  'active',
  '{"hemoglobin":13.5,"platelets":180000,"status":"requested","requestDate":"2025-12-09"}'::jsonb,
  (select id from public.doctors where email = 'ana.souza@example.com')
)
on conflict (external_id) do nothing;

-- Paciente 2 (aguardando exames)
insert into public.patients (
  external_id, name, birth_date, age, gender, weight, allergies, medical_record,
  selected_flowchart, general_observations, return_count,
  admission, flowchart_state, treatment, status, lab_results, assigned_doctor_id
)
values (
  'EXT-0002', 'João Pereira', '1990-11-01', 34, 'masculino', 80.0, array[]::text[], 'MR-0002',
  'Malária', 'Paciente relata viagem recente', 1,
  '{"date":"2025-12-08","time":"16:10","symptoms":["febre alta","calafrios"],"vitalSigns":{"temp":39.1,"bp":"110/70","hr":100,"rr":22,"spo2":95}}'::jsonb,
  '{"currentStep":"investigacao","history":["triagem"],"answers":{},"progress":50,"group":"C","lastUpdate":"2025-12-08T16:10:00Z"}'::jsonb,
  '{"prescriptions":[],"observations":"Aguardando resultado de teste rápido"}'::jsonb,
  'waiting_labs',
  '{"status":"requested","requestDate":"2025-12-08"}'::jsonb,
  (select id from public.doctors where email = 'ana.souza@example.com')
)
on conflict (external_id) do nothing;

