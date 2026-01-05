/*
 * Seed script: executa db/supabase/seed_patients.sql no Postgres do Supabase
 * Requisitos:
 *   - Definir POSTGRES_URL_NON_POOLING (ou POSTGRES_URL) com sslmode=require
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
const ts = require('typescript')
const vm = require('vm')

function getDbUrl() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) {
    throw new Error('Defina POSTGRES_URL_NON_POOLING ou POSTGRES_URL para executar o seed')
  }
  return url
}

async function main() {
  const dbUrl = getDbUrl()
  const sqlPath = path.resolve(__dirname, '../db/supabase/seed_patients.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  let client
  try {
    const u = new URL(dbUrl)
    client = new Client({
      host: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      database: u.pathname.replace(/^\//, '') || 'postgres',
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl: { rejectUnauthorized: false, require: true }
    })
  } catch {
    client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false, require: true } })
  }

  console.log('Conectando ao banco...')
  await client.connect()
  console.log('Executando seed_patients.sql...')
  await client.query(sql)
  console.log('Seed concluído com sucesso.')

  // Upsert de flowcharts mínimos (chaves para vincular pacientes)
  const flows = [
    { key: 'iam', title: 'Infarto Agudo do Miocárdio (IAM)', version: 'v1' },
    { key: 'avc', title: 'Acidente Vascular Cerebral (AVC)', version: 'v1' },
    { key: 'sepsis', title: 'Sepse Grave e Choque Séptico', version: 'v1' },
    { key: 'dengue', title: 'Dengue - Classificação de Risco (Emergência)', version: 'v1' },
    { key: 'gasometria', title: 'Gasometria', version: 'v1' },
    { key: 'dhel_hiponatremia', title: 'DHEL - Hiponatremia sintomática', version: 'v1' }
  ]
  console.log('Upsert de chaves de flowcharts...')
  for (const f of flows) {
    await client.query(
      `insert into public.flowcharts (key, title, version, definition, status)
       values ($1, $2, $3, $4::jsonb, 'active')
       on conflict (key) do update set
         title = excluded.title,
         version = excluded.version,
         definition = excluded.definition,
         status = excluded.status`,
      [f.key, f.title, f.version, JSON.stringify({ source: 'seed', key: f.key })]
    )
  }
  console.log('Flowcharts upsertados com sucesso.')

  const flowTsPath = path.resolve(__dirname, '../src/data/emergencyFlowcharts.ts')
  const flowTsSource = fs.readFileSync(flowTsPath, 'utf8')
  const transpiled = ts.transpileModule(flowTsSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
  })
  const mod = { exports: {} }
  vm.runInNewContext(transpiled.outputText, {
    exports: mod.exports,
    module: mod,
    require: () => ({}),
    __filename: flowTsPath,
    __dirname: path.dirname(flowTsPath)
  })
  const flowsMap = mod.exports.emergencyFlowcharts || {}
  console.log('Upsert de definições completas dos flowcharts...')
  for (const [key, flow] of Object.entries(flowsMap)) {
    const title = flow?.name || key
    await client.query(
      `insert into public.flowcharts (key, title, version, definition, status)
       values ($1, $2, $3, $4::jsonb, 'active')
       on conflict (key) do update set
         title = excluded.title,
         version = excluded.version,
         definition = excluded.definition,
         status = excluded.status`,
      [key, title, 'v1', JSON.stringify(flow)]
    )
  }
  await client.end()
}

main().catch(async (err) => {
  console.error('Falha ao executar seed:', err)
  process.exitCode = 1
})
