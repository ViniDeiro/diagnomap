/*
 * Seed script: executa db/supabase/seed_patients.sql no Postgres do Supabase
 * Requisitos:
 *   - Definir POSTGRES_URL_NON_POOLING (ou POSTGRES_URL) com sslmode=require
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

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
  await client.end()
}

main().catch(async (err) => {
  console.error('Falha ao executar seed:', err)
  process.exitCode = 1
})

