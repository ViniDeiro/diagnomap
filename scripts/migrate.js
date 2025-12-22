// Simple migration runner using direct Postgres connection
// Requires env var POSTGRES_URL_NON_POOLING (preferred) or POSTGRES_URL
// Usage: $env:POSTGRES_URL_NON_POOLING="<url>"; npm run db:migrate

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function run() {
  // Try to hydrate env from .env.local if variables are missing
  let dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!dbUrl) {
    try {
      const envPath = path.join(__dirname, '..', '.env.local')
      const content = fs.readFileSync(envPath, 'utf8')
      content.split(/\r?\n/).forEach(l => {
        const m = l.match(/^([^=#\s]+)=(.*)$/)
        if (m) process.env[m[1]] = m[2]
      })
      dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    } catch {}
  }
  if (!dbUrl) {
    console.error('Erro: defina POSTGRES_URL_NON_POOLING ou POSTGRES_URL antes de rodar a migração.')
    process.exit(1)
  }

  // Parse connection string manually to ensure SSL options are applied
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

  const schemaPath = path.join(__dirname, '..', 'db', 'supabase', 'schema.sql')
  const schemaDoctorsPath = path.join(__dirname, '..', 'db', 'supabase', 'schema_remune_doctors.sql')
  const schemaFlowchartsPath = path.join(__dirname, '..', 'db', 'supabase', 'schema_flowcharts.sql')

  const sql1 = fs.readFileSync(schemaPath, 'utf8')
  const sql2 = fs.readFileSync(schemaDoctorsPath, 'utf8')
  const sql3 = fs.readFileSync(schemaFlowchartsPath, 'utf8')

  try {
    console.log('Conectando ao banco...')
    await client.connect()

    console.log('Aplicando schema.sql...')
    await client.query(sql1)

    console.log('Aplicando schema_remune_doctors.sql...')
    await client.query(sql2)

    console.log('Aplicando schema_flowcharts.sql...')
    await client.query(sql3)

    console.log('Verificando tabelas...')
    const checkTables = await client.query("select to_regclass('public.patients') as patients, to_regclass('public.doctors') as doctors, to_regclass('public.flowcharts') as flowcharts")
    const checkColumns = await client.query("select column_name from information_schema.columns where table_schema='public' and table_name='patients' and column_name in ('assigned_doctor_id','flowchart_key')")
    console.log('Tabelas registradas:', checkTables.rows[0])
    console.log('Colunas em patients:', checkColumns.rows.map(r => r.column_name))

    console.log('Migração concluída com sucesso.')
  } catch (err) {
    console.error('Falha na migração:', err?.message || err)
    process.exitCode = 1
  } finally {
    try { await client.end() } catch {}
  }
}

run()
