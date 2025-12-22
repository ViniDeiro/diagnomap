// Seed de municípios brasileiros a partir de fonte confiável (IBGE via dataset kelvins)
// Requer POSTGRES_URL_NON_POOLING (preferido) ou POSTGRES_URL
// Uso: $env:POSTGRES_URL_NON_POOLING="<url>"; npm run db:seed:municipios

const https = require('https')
const { Client } = require('pg')

const MUNICIPIOS_CSV_URL = 'https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/main/csv/municipios.csv'
const ESTADOS_CSV_URL = 'https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/main/csv/estados.csv'

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`Falha ao baixar ${url}: status ${res.statusCode}`))
          res.resume()
          return
        }
        res.setEncoding('utf8')
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}

function parseCsvLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
  }
  result.push(cur)
  return result.map(s => s.trim())
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  const header = parseCsvLine(lines[0])
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue
    const cols = parseCsvLine(lines[i])
    rows.push(cols)
  }
  return { header, idx, rows }
}

function getDbUrl() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) throw new Error('Defina POSTGRES_URL_NON_POOLING ou POSTGRES_URL para executar o seed')
  return url
}

async function connect(dbUrl) {
  try {
    const u = new URL(dbUrl)
    return new Client({
      host: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      database: u.pathname.replace(/^\//, '') || 'postgres',
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl: { rejectUnauthorized: false, require: true }
    })
  } catch {
    return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false, require: true } })
  }
}

async function seedMunicipalities() {
  console.log('Baixando CSV de estados e municípios do repositório kelvins/municipios-brasileiros...')
  const [estadosCsv, municipiosCsv] = await Promise.all([download(ESTADOS_CSV_URL), download(MUNICIPIOS_CSV_URL)])

  const estados = parseCsv(estadosCsv)
  const municipios = parseCsv(municipiosCsv)

  // estados.csv: headers esperados: codigo_uf,nome,uf,regiao
  const ufByCodigoUf = new Map()
  const idxUf = estados.idx['uf']
  const idxCodigoUf = estados.idx['codigo_uf']
  estados.rows.forEach(cols => {
    const codigoUf = cols[idxCodigoUf]
    const uf = cols[idxUf]
    if (codigoUf && uf) ufByCodigoUf.set(String(codigoUf), String(uf).toUpperCase())
  })

  // municipios.csv: headers esperados: codigo_ibge,nome,latitude,longitude,capital,codigo_uf,siafi_id,ddd,fuso_horario
  const idxCodigoIbge = municipios.idx['codigo_ibge']
  const idxNome = municipios.idx['nome']
  const idxCodigoUfMunicipio = municipios.idx['codigo_uf']
  const items = []
  municipios.rows.forEach(cols => {
    const ibgeCode = cols[idxCodigoIbge]
    const name = cols[idxNome]
    const codigoUf = cols[idxCodigoUfMunicipio]
    const uf = ufByCodigoUf.get(String(codigoUf))
    if (ibgeCode && name && uf) {
      items.push({ ibge_code: String(ibgeCode), name: String(name), uf })
    }
  })

  console.log(`Preparados ${items.length} municípios para inserção/atualização.`)

  const dbUrl = getDbUrl()
  const client = await connect(dbUrl)

  try {
    console.log('Conectando ao banco...')
    await client.connect()
    await client.query('BEGIN')

    const batchSize = 500
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const values = []
      const placeholders = []
      for (let j = 0; j < batch.length; j++) {
        const base = j * 3
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`)
        values.push(batch[j].ibge_code, batch[j].name, batch[j].uf)
      }
      const sql = `INSERT INTO public.municipalities (ibge_code, name, uf) VALUES ${placeholders.join(',')}\n` +
        'ON CONFLICT (ibge_code) DO UPDATE SET name = EXCLUDED.name, uf = EXCLUDED.uf'
      await client.query(sql, values)
      console.log(`Inseridos/atualizados ${i + batch.length} de ${items.length}`)
    }

    await client.query('COMMIT')
    const count = await client.query('select count(*)::int as c from public.municipalities')
    console.log('Seed de municípios concluído com sucesso. Total na tabela:', count.rows[0].c)
  } catch (err) {
    try { await client.query('ROLLBACK') } catch {}
    console.error('Falha ao executar seed de municípios:', err?.message || err)
    process.exitCode = 1
  } finally {
    try { await client.end() } catch {}
  }
}

seedMunicipalities()

