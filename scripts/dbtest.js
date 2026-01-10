const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

function getDbUrl() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || null
}

function ensureSupabaseEnv() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    try {
      const envPath = path.join(__dirname, '..', '.env.local')
      const content = fs.readFileSync(envPath, 'utf8')
      content.split(/\r?\n/).forEach(l => {
        const m = l.match(/^([^=#\s]+)=(.*)$/)
        if (m) process.env[m[1]] = m[2]
      })
      url = process.env.NEXT_PUBLIC_SUPABASE_URL
      anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    } catch {}
  }
  return { url, anon }
}

async function testWithPg(dbUrl) {
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

  console.log('Conectando ao Postgres...')
  await client.connect()
  const who = await client.query('select current_user, version()')
  console.log('Usuário/Versão:', who.rows[0])

  const tables = await client.query(
    "select to_regclass('public.patients') as patients, to_regclass('public.doctors') as doctors, to_regclass('public.flowcharts') as flowcharts, to_regclass('public.municipalities') as municipalities"
  )
  console.log('Tabelas:', tables.rows[0])

  const counts = await client.query('select count(*)::int as patients_count, (select count(*)::int from public.municipalities) as municipalities_count from public.patients')
  console.log('Pacientes (contagem):', counts.rows[0].patients_count)
  console.log('Municípios (contagem):', counts.rows[0].municipalities_count)

  await client.end()
  console.log('Teste concluído com sucesso (Postgres).')
}

async function testWithSupabase() {
  const { url, anon } = ensureSupabaseEnv()
  if (!url || !anon) {
    throw new Error('Defina POSTGRES_URL_NON_POOLING/POSTGRES_URL ou NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, anon)

  console.log('Conectando ao Supabase...')
  const patientsHead = await supabase.from('patients').select('*', { count: 'exact', head: true })
  if (patientsHead.error) throw patientsHead.error
  const municipalitiesHead = await supabase.from('municipalities').select('*', { count: 'exact', head: true })
  if (municipalitiesHead.error) throw municipalitiesHead.error
  const flowchartsHead = await supabase.from('flowcharts').select('*', { count: 'exact', head: true })
  const doctorsHead = await supabase.from('doctors').select('*', { count: 'exact', head: true })

  console.log('Tabelas:', {
    patients: true,
    municipalities: true,
    flowcharts: !flowchartsHead.error,
    doctors: !doctorsHead.error
  })
  console.log('Pacientes (contagem):', patientsHead.count || 0)
  console.log('Municípios (contagem):', municipalitiesHead.count || 0)
  console.log('Teste concluído com sucesso (Supabase).')

  return supabase
}

async function listDoctors() {
  const supabase = await testWithSupabase()
  console.log('Listando médicos cadastrados...')
  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, crm, specialty, email, phone, municipality_id, status, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!Array.isArray(data) || data.length === 0) {
    console.log('Nenhum médico encontrado.')
    return
  }
  for (const row of data) {
    const created = row.created_at ? new Date(row.created_at).toISOString() : 'N/A'
    console.log(`- ${row.name} (${row.crm || 'CRM N/A'}) | ${row.email || 'sem email'} | status=${row.status || 'N/A'} | muni_id=${row.municipality_id ?? 'N/A'} | criado=${created} | id=${row.id}`)
  }
}

async function listPatientsForDoctor(email) {
  const supabase = await testWithSupabase()
  console.log('Listando pacientes do médico atual...')
  let doctorId = null
  if (email) {
    const { data: docByEmail } = await supabase.from('doctors').select('id').eq('email', email).single()
    doctorId = docByEmail?.id || null
  }
  if (!doctorId) {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (uid) {
      const { data: docByAuth } = await supabase.from('doctors').select('id').eq('auth_user_id', uid).single()
      doctorId = docByAuth?.id || null
    }
  }
  const query = doctorId
    ? supabase.from('patients').select('id,name,status,assigned_doctor_id,created_at').eq('assigned_doctor_id', doctorId).order('created_at', { ascending: false })
    : supabase.from('patients').select('id,name,status,assigned_doctor_id,created_at').order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  if (!Array.isArray(data) || data.length === 0) {
    console.log('Nenhum paciente encontrado.')
    return
  }
  for (const row of data) {
    const created = row.created_at ? new Date(row.created_at).toISOString() : 'N/A'
    console.log(`- ${row.name} | status=${row.status} | assigned_doctor_id=${row.assigned_doctor_id ?? 'N/A'} | criado=${created} | id=${row.id}`)
  }
}

async function main() {
  const dbUrl = getDbUrl()
  const args = process.argv.slice(2)
  const listOnly = args.includes('--list-doctors')
  const listPatientsArg = args.includes('--list-patients')
  const emailArgIdx = args.findIndex(a => a.startsWith('--email='))
  const emailArg = emailArgIdx >= 0 ? args[emailArgIdx].split('=').slice(1).join('=') : null

  if (listOnly) {
    await listDoctors()
    return
  }
  if (listPatientsArg) {
    await listPatientsForDoctor(emailArg)
    return
  }

  if (dbUrl) {
    await testWithPg(dbUrl)
    return
  }
  await testWithSupabase()
}

main().catch(err => {
  console.error('Falha no teste de DB:', err)
  process.exit(1)
})
