/**
 * Seed da REMUNE municipal para Mogi das Cruzes
 *
 * - Baixa e parseia o PDF oficial da REMUME (2022) publicado pela Prefeitura
 * - Cria/atualiza registros em `public.medicines`
 * - Faz UPSERT em `public.remune_municipal` para o município de Mogi das Cruzes
 *
 * Observação:
 * - Se a Prefeitura publicar uma versão mais recente, atualize a constante PDF_URL.
 * - O parser é heurístico; caso não extraia ≥100 itens, o script aborta e salva
 *   o texto bruto em `tmp/mogi_remume_extracted.txt` para revisão manual.
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const { Client } = require('pg')

const PDF_URL = 'https://www.mogidascruzes.sp.gov.br/public/site/doc/20220603134942629a3ba60df0a.pdf'

async function downloadPdf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Falha ao baixar PDF: status ${res.statusCode}`))
        return
      }
      const chunks = []
      res.on('data', d => chunks.push(d))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

function normalizeWhitespace(s) {
  return s.replace(/\s+/g, ' ').trim()
}

function parseItemsFromText(text) {
  // O PDF está formatado com quebras de linha por coluna:
  // Linha 1: "<Medicamento> <força><Forma>" (ex: "Amiodarona 200 mgComprimido")
  // Linha 2: Observações (ex: "Apresentação de receituário comum" ou "Uso exclusivo da unidade")
  // Linha 3: Locais (ex: "Todas unidades básicas" ou "UAPS 2" etc.)
  // Algumas entradas juntam tudo em uma única linha; outras têm o "Forma" na linha seguinte.

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const items = []

  const isHeader = (line) => /Relação Municipal de Medicamentos|Planilha1|Página \d+|MedicamentoApresentaçãoObservaçõesLocais/i.test(line)

  const formKeywords = [
    'Comprimido','Cápsula','Frasco','Ampola','Frasco-Ampola','Tubo','Pote','Envelope',
    'Adesivo','Colírio','Creme','Pomada','Solução','Suspensão','Xarope','Gotas','Gel'
  ]

  const detectForm = (line) => {
    const lower = line.toLowerCase()
    for (const f of formKeywords) {
      const lf = f.toLowerCase()
      if (lower.includes(lf)) return f
    }
    return null
  }

  let current = null
  for (const raw of lines) {
    const line = normalizeWhitespace(raw)
    if (!line) continue
    if (isHeader(line)) continue

    const formHere = detectForm(line)
    if (formHere) {
      // Nova entrada começa quando a linha contém a forma farmacêutica
      if (current) items.push(current)
      current = { firstLine: line, extras: [] }
    } else {
      if (current) {
        current.extras.push(line)
      } else {
        // Ignorar linhas soltas antes da primeira entrada
      }
    }
  }
  if (current) items.push(current)

  // Transformar blocos em registros de medicamento
  const results = []
  for (const blk of items) {
    const form = detectForm(blk.firstLine)
    let namePart = blk.firstLine
    if (form) {
      const idx = namePart.toLowerCase().lastIndexOf(form.toLowerCase())
      if (idx >= 0) namePart = namePart.slice(0, idx).trim()
    }

    // Extrair força da parte do nome/presentação
    let strength = null
    let unit = null
    const strengthMatch = namePart.match(/(\d+[\d\/,\.]*\s*(mg|mcg|g|ml|mL|UI|%)\b(?:\s*\/\s*\d+\s*(mL|ml))?)/i)
    if (strengthMatch) {
      strength = strengthMatch[1].replace(/\s+/g, ' ').trim()
      unit = (strengthMatch[2] || '').toLowerCase()
    }

    // Remover a força do nome, se presente
    let name = namePart
    if (strength) {
      name = name.replace(strength, '').trim()
    }

    // Notas de restrição (concatenar extras)
    const restriction_notes = blk.extras.length ? blk.extras.join(' / ') : null

    results.push({ name, form, strength, unit, restriction_notes })
  }

  // Deduplicar por name+form+strength
  const key = (it) => `${(it.name||'').toLowerCase()}|${(it.form||'').toLowerCase()}|${(it.strength||'').toLowerCase()}`
  const map = new Map()
  for (const it of results) {
    const k = key(it)
    if (!map.has(k)) map.set(k, it)
  }
  return Array.from(map.values())
}

async function getMunicipalityId(client, name) {
  const { rows } = await client.query('select id from public.municipalities where lower(name) = lower($1) limit 1', [name])
  if (!rows.length) throw new Error(`Município não encontrado: ${name}`)
  return rows[0].id
}

async function findOrCreateMedicine(client, { name, form, strength, unit }) {
  // Buscar por nome + form + strength (case-insensitive)
  const { rows } = await client.query(
    `select id from public.medicines where lower(name)=lower($1) and coalesce(lower(form),'')=lower($2) and coalesce(lower(strength),'')=lower($3) limit 1`,
    [name, form || '', strength || '']
  )
  if (rows.length) return rows[0].id

  const insert = await client.query(
    `insert into public.medicines (name, form, strength, unit) values ($1,$2,$3,$4) returning id`,
    [name, form, strength, unit]
  )
  return insert.rows[0].id
}

async function upsertMunicipalItem(client, municipality_id, medicine_id, restriction_notes) {
  await client.query(
    `insert into public.remune_municipal (municipality_id, medicine_id, available, restriction_notes)
     values ($1,$2,true,$3)
     on conflict (municipality_id, medicine_id)
     do update set available = EXCLUDED.available, restriction_notes = EXCLUDED.restriction_notes`,
    [municipality_id, medicine_id, restriction_notes]
  )
}

async function main() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!connectionString) {
    console.error('Erro: defina POSTGRES_URL_NON_POOLING ou POSTGRES_URL para conectar ao banco.')
    process.exit(1)
  }

  console.log('Baixando PDF da REMUME de Mogi...')
  let pdfBuffer
  try {
    pdfBuffer = await downloadPdf(PDF_URL)
  } catch (err) {
    console.error('Falha ao baixar PDF:', err.message)
    process.exit(1)
  }

  console.log('Extraindo texto do PDF...')
  let parsed
  try {
    parsed = await pdfParse(pdfBuffer)
  } catch (err) {
    console.error('Falha ao parsear PDF:', err.message)
    process.exit(1)
  }

  const text = parsed.text || ''
  const items = parseItemsFromText(text)
  console.log(`Itens extraídos (únicos): ${items.length}`)

  // Guardar texto bruto para auditoria
  const tmpDir = path.join(process.cwd(), 'tmp')
  try { fs.mkdirSync(tmpDir, { recursive: true }) } catch {}
  fs.writeFileSync(path.join(tmpDir, 'mogi_remume_extracted.txt'), text, 'utf-8')

  if (items.length < 100) {
    console.error('Menos de 100 itens extraídos. O formato do PDF pode ter mudado. Revise o arquivo tmp/mogi_remume_extracted.txt e considere gerar um CSV manual.')
    process.exit(1)
  }

  // Conexão com SSL (Supabase) como nos outros scripts
  let client
  try {
    const u = new URL(connectionString)
    client = new Client({
      host: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      database: u.pathname.replace(/^\//, '') || 'postgres',
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl: { rejectUnauthorized: false, require: true }
    })
  } catch {
    client = new Client({ connectionString, ssl: { rejectUnauthorized: false, require: true } })
  }
  await client.connect()
  try {
    const municipality_id = await getMunicipalityId(client, 'Mogi das Cruzes')
    console.log('Municipality ID:', municipality_id)

    let createdCount = 0
    let upsertedCount = 0

    for (const it of items) {
      const medId = await findOrCreateMedicine(client, it)
      if (medId) createdCount++
      await upsertMunicipalItem(client, municipality_id, medId, it.restriction_notes || null)
      upsertedCount++
    }

    console.log(`Medicamentos criados/buscados: ${createdCount}`)
    console.log(`Itens REMUNE municipal upsertados: ${upsertedCount}`)
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('Erro fatal no seed REMUME Mogi:', err)
  process.exit(1)
})
