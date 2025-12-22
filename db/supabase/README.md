# Supabase: pacientes

Passos para aplicar o schema e usar no app:

1) No painel do Supabase, abra `SQL Editor` e cole o conteúdo de `db/supabase/schema.sql`. Execute para criar tabela, índices e políticas.

2) No projeto Next.js (`diagno-map`), crie/valide o arquivo `.env.local` com estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...

POSTGRES_HOST=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL=...
POSTGRES_URL_NON_POOLING=...
DATABASE_URL=...
```

3) Instale o cliente do Supabase:

```
npm i @supabase/supabase-js
```

4) Use `src/services/supabaseClient.ts` e `src/services/patientRepo.ts` para inserir/listar pacientes.

5) Perfis, REMUNE e transferência:
   - Execute também `db/supabase/schema_remune_doctors.sql` no SQL Editor para criar:
     - Tabelas: `municipalities`, `doctors`, `medicines`, `remune_national`, `remune_municipal`, `patient_transfers`
     - Coluna: `patients.assigned_doctor_id`
   - Use `src/services/doctorRepo.ts` para cadastrar/buscar médicos e `transferPatient(...)` para transferir por ID.
   - Use `src/services/remuneRepo.ts` para listar REMUNE nacional e por município.

### Seed da REMUNE municipal (Mogi das Cruzes)

O projeto inclui um seed que baixa e parseia o PDF oficial da REMUME de Mogi (versão 2022) e faz UPSERT dos itens no banco.

Pré-requisitos:
- Variáveis de ambiente `POSTGRES_URL_NON_POOLING` ou `POSTGRES_URL` definidas (como já usado no seed de municípios).
- Dependência `pdf-parse` instalada (adicionada no `package.json`).

Comando:
```
npm run db:seed:remune:mogi
```

Detalhes:
- O script salva um dump do texto extraído em `tmp/mogi_remume_extracted.txt` para auditoria.
- Se extrair menos de 100 itens, o script aborta, pois o layout do PDF pode ter mudado. Nesse caso, forneça um CSV ou um PDF atualizado e nós adaptamos o parser.
- Para usar uma versão mais recente da lista, atualize a constante `PDF_URL` em `scripts/seed_remune_mogi.js`.

Notas:
- As políticas de RLS estão abertas para `anon` apenas em desenvolvimento. Para produção, restrinja acesso conforme regras de autenticação desejadas.
- Os campos estruturados (`admission`, `flowchart_state`, `treatment`, `lab_results`) são `jsonb`, facilitando migração rápida do localStorage. Podemos normalizar depois se necessário.
