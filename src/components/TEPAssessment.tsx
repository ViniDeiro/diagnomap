'use client'

import React, { useMemo, useState } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

type Props = {
  stepId: string
  savedAnswer?: string
  patientAge?: number
  vitalSigns?: { heartRate?: number; bloodPressure?: string; oxygenSaturation?: number }
  onContinue: (nextStep: string, value: string) => void
}

const parseSaved = (raw?: string) => {
  try { return raw ? JSON.parse(raw) : {} } catch { return {} }
}

const Checkbox = ({ checked, label, detail, onChange }: { checked: boolean; label: string; detail?: string; onChange: () => void }) => (
  <label className={clsx('flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors', checked ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50')}>
    <input type="checkbox" checked={checked} onChange={onChange} className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-700" />
    <span><strong className="block text-slate-900">{label}</strong>{detail && <span className="mt-1 block text-sm text-slate-600">{detail}</span>}</span>
  </label>
)

const Continue = ({ onClick, label = 'Salvar e continuar', disabled = false, critical = false }: { onClick: () => void; label?: string; disabled?: boolean; critical?: boolean }) => (
  <button type="button" disabled={disabled} onClick={onClick} className={clsx('inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-white sm:w-auto', critical ? 'bg-red-700 hover:bg-red-800' : 'bg-blue-700 hover:bg-blue-800', disabled && 'cursor-not-allowed opacity-40')}>
    {label}<ChevronRight className="h-5 w-5" />
  </button>
)

const WELLS = [
  ['sinais_tvp', 'Sinais clínicos de TVP', 3],
  ['tep_mais_provavel', 'TEP é a principal hipótese diagnóstica', 3],
  ['fc_maior_100', 'Frequência cardíaca > 100 bpm', 1.5],
  ['imobilizacao_cirurgia', 'Imobilização > 72 h ou cirurgia nas últimas 4 semanas', 1.5],
  ['tep_tvp_previo', 'Antecedente de TEP ou TVP', 1.5],
  ['hemoptise', 'Hemoptise', 1],
  ['neoplasia', 'Neoplasia ativa', 1]
] as const

const PERC = [
  ['idade_50', 'Idade ≥ 50 anos'], ['fc_100', 'Frequência cardíaca ≥ 100 bpm'],
  ['sat_95', 'Saturação em ar ambiente < 95%'], ['edema_unilateral', 'Edema unilateral de membro inferior'],
  ['hemoptise', 'Hemoptise'], ['cirurgia_trauma', 'Cirurgia ou trauma nas últimas 4 semanas'],
  ['tev_previo', 'Antecedente de TVP ou TEP'], ['estrogenio', 'Uso de estrogênios']
] as const

const SPESI = [
  ['idade_80', 'Idade > 80 anos'], ['neoplasia', 'Neoplasia'], ['insuficiencia_cardiaca', 'Insuficiência cardíaca'],
  ['dpoc', 'DPOC'], ['fc_110', 'Frequência cardíaca ≥ 110 bpm'], ['pas_100', 'Pressão arterial sistólica < 100 mmHg'],
  ['sat_90', 'Saturação arterial de oxigênio < 90%']
] as const

const ABSOLUTE = [
  ['avc_hemorragico', 'AVC hemorrágico ou AVC de natureza desconhecida'],
  ['avc_isquemico_6m', 'AVC isquêmico nos últimos 6 meses'],
  ['neoplasia_snc', 'Neoplasia do sistema nervoso central'],
  ['trauma_cirurgia_snc', 'Trauma grave, cirurgia ou TCE nas últimas 3 semanas'],
  ['sangramento_ativo', 'Discrasia sanguínea ou sangramento ativo relevante'],
  ['hemorragia_digestiva', 'Hemorragia digestiva alta há menos de 1 mês']
] as const

const RELATIVE = [
  ['ait_6m', 'AIT nos últimos 6 meses'], ['anticoagulante', 'Uso de anticoagulantes'],
  ['gestacao', 'Gestação ou primeira semana de puerpério'], ['puncao', 'Punção venosa em sítio não compressível'],
  ['rcp', 'RCP traumática'], ['pa_180', 'PA > 180 mmHg refratária'],
  ['insuficiencia_hepatica', 'Insuficiência hepática'], ['endocardite', 'Endocardite infecciosa'], ['ulcera', 'Úlcera péptica ativa']
] as const

export default function TEPAssessment({ stepId, savedAnswer, patientAge, vitalSigns, onContinue }: Props) {
  const saved = useMemo(() => parseSaved(savedAnswer), [savedAnswer])
  const [selected, setSelected] = useState<string[]>(Array.isArray(saved.criteriosSelecionados) ? saved.criteriosSelecionados : [])
  const [dDimer, setDDimer] = useState(saved.dDimero != null ? String(saved.dDimero) : '')
  const [categoryFlags, setCategoryFlags] = useState<Record<string, boolean>>(saved.dados || {})
  const toggle = (key: string) => setSelected(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key])
  const toggleFlag = (key: string) => setCategoryFlags(current => ({ ...current, [key]: !current[key] }))

  if (stepId === 'tep_wells') {
    const auto = new Set<string>()
    if ((vitalSigns?.heartRate || 0) > 100) auto.add('fc_maior_100')
    const effective = Array.from(new Set([...selected, ...auto]))
    const score = WELLS.reduce((sum, [key, , points]) => sum + (effective.includes(key) ? points : 0), 0)
    const classification = score <= 1 ? 'Baixa probabilidade' : score <= 6 ? 'Média probabilidade' : 'Alta probabilidade'
    const nextStep = score <= 1 ? 'tep_perc' : score <= 6 ? 'tep_years' : 'tep_angio_tc'
    return <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><strong>Wells: {score.toLocaleString('pt-BR')} ponto(s) — {classification}</strong><p className="mt-1 text-sm">0–1: baixa; 2–6: média; &gt; 6: alta probabilidade.</p></div>
      <div className="grid gap-3 md:grid-cols-2">{WELLS.map(([key, label, points]) => <Checkbox key={key} checked={effective.includes(key)} label={`${label} (+${String(points).replace('.', ',')})`} detail={auto.has(key) ? 'Preenchido automaticamente pelos sinais vitais.' : undefined} onChange={() => !auto.has(key) && toggle(key)} />)}</div>
      <div className="flex justify-end"><Continue onClick={() => onContinue(nextStep, JSON.stringify({ criteriosSelecionados: effective, score, classificacao: classification }))} /></div>
    </div>
  }

  if (stepId === 'tep_perc') {
    const auto = new Set<string>()
    if ((patientAge || 0) >= 50) auto.add('idade_50')
    if ((vitalSigns?.heartRate || 0) >= 100) auto.add('fc_100')
    if ((vitalSigns?.oxygenSaturation || 100) < 95) auto.add('sat_95')
    const effective = Array.from(new Set([...selected, ...auto]))
    const negative = effective.length === 0
    return <div className="space-y-4">
      <div className={clsx('rounded-xl border p-4', negative ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}><strong>{negative ? 'PERC negativo: todos os critérios ausentes' : `PERC positivo: ${effective.length} critério(s)`}</strong><p className="mt-1 text-sm">A regra só deve ser usada após definir baixa probabilidade clínica.</p></div>
      <div className="grid gap-3 md:grid-cols-2">{PERC.map(([key, label]) => <Checkbox key={key} checked={effective.includes(key)} label={label} detail={auto.has(key) ? 'Preenchido automaticamente.' : undefined} onChange={() => !auto.has(key) && toggle(key)} />)}</div>
      <div className="flex justify-end"><Continue onClick={() => onContinue(negative ? 'tep_excluido' : 'tep_years', JSON.stringify({ criteriosSelecionados: effective, resultado: negative ? 'negativo' : 'positivo' }))} label={negative ? 'Encerrar investigação de TEP' : 'Prosseguir com YEARS e D-dímero'} /></div>
    </div>
  }

  if (stepId === 'tep_years') {
    const years = [['sinais_tvp', 'Sinais clínicos de TVP'], ['hemoptise', 'Hemoptise'], ['tep_mais_provavel', 'TEP é o diagnóstico mais provável']] as const
    const value = Number(dDimer)
    const cutoff = selected.length === 0 ? 1000 : 500
    const valid = dDimer !== '' && Number.isFinite(value) && value >= 0
    const excluded = valid && value < cutoff
    return <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">{years.map(([key, label]) => <Checkbox key={key} checked={selected.includes(key)} label={label} onChange={() => toggle(key)} />)}</div>
      <label className="block rounded-xl border border-slate-200 bg-white p-4"><strong className="block">D-dímero (ng/mL FEU)</strong><input type="number" min="0" value={dDimer} onChange={e => setDDimer(e.target.value)} placeholder="Ex.: 740" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3" /><span className="mt-2 block text-sm text-slate-600">Ponto de corte YEARS: {cutoff} ng/mL ({selected.length === 0 ? 'nenhum critério' : 'ao menos um critério'}).</span></label>
      {valid && <div className={clsx('rounded-xl border p-4 font-bold', excluded ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900')}>{excluded ? 'Abaixo do ponto de corte: TEP excluído pela estratégia YEARS.' : 'Igual ou acima do ponto de corte: solicitar Angio-TC.'}</div>}
      <div className="flex justify-end"><Continue disabled={!valid} onClick={() => onContinue(excluded ? 'tep_excluido' : 'tep_angio_tc', JSON.stringify({ criteriosSelecionados: selected, dDimero: value, pontoDeCorte: cutoff, resultado: excluded ? 'negativo' : 'positivo' }))} /></div>
    </div>
  }

  if (stepId === 'tep_spesi') {
    const auto = new Set<string>()
    if ((patientAge || 0) > 80) auto.add('idade_80')
    if ((vitalSigns?.heartRate || 0) >= 110) auto.add('fc_110')
    const systolic = Number(vitalSigns?.bloodPressure?.split('/')[0])
    if (systolic > 0 && systolic < 100) auto.add('pas_100')
    if ((vitalSigns?.oxygenSaturation || 100) < 90) auto.add('sat_90')
    const effective = Array.from(new Set([...selected, ...auto]))
    const score = effective.length
    return <div className="space-y-4"><div className={clsx('rounded-xl border p-4', score === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}><strong>sPESI {score}: {score === 0 ? 'baixo risco (mortalidade aproximada de 1%)' : 'risco aumentado (mortalidade aproximada de 10%)'}</strong></div><div className="grid gap-3 md:grid-cols-2">{SPESI.map(([key, label]) => <Checkbox key={key} checked={effective.includes(key)} label={`${label} (+1)`} detail={auto.has(key) ? 'Preenchido automaticamente.' : undefined} onChange={() => !auto.has(key) && toggle(key)} />)}</div><div className="flex justify-end"><Continue onClick={() => onContinue('tep_categoria', JSON.stringify({ criteriosSelecionados: effective, score, classificacao: score === 0 ? 'baixo_risco' : 'risco_aumentado' }))} /></div></div>
  }

  if (stepId === 'tep_categoria') {
    const items = [
      ['assintomatico', 'Assintomático/subclínico'], ['spesi_alto', 'sPESI ≥ 1 ou risco clínico elevado'],
      ['biomarcador', 'Troponina ou BNP/NT-proBNP elevados'], ['vd', 'Disfunção de ventrículo direito em eco/TC'],
      ['falencia_iminente', 'Falência cardiopulmonar iminente'], ['choque_pcr', 'Choque ou parada cardiorrespiratória']
    ] as const
    const category = categoryFlags.choque_pcr ? 'E' : categoryFlags.falencia_iminente ? 'D' : (categoryFlags.spesi_alto || categoryFlags.biomarcador || categoryFlags.vd) ? 'C' : categoryFlags.assintomatico ? 'A' : 'B'
    return <div className="space-y-4"><div className={clsx('rounded-xl border p-5 text-lg font-extrabold', ['D','E'].includes(category) ? 'border-red-300 bg-red-50 text-red-900' : category === 'C' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900')}>Categoria calculada: {category}</div><div className="grid gap-3 md:grid-cols-2">{items.map(([key, label]) => <Checkbox key={key} checked={Boolean(categoryFlags[key])} label={label} onChange={() => toggleFlag(key)} />)}</div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><strong>A:</strong> subclínico; <strong>B:</strong> sintomático de baixo risco; <strong>C:</strong> estável com risco elevado/biomarcador/VD; <strong>D:</strong> falência iminente; <strong>E:</strong> choque/PCR.</div><div className="flex justify-end"><Continue critical={['D','E'].includes(category)} onClick={() => onContinue('tep_tratamento', JSON.stringify({ categoria: category, dados: categoryFlags }))} /></div></div>
  }

  if (stepId === 'tep_tratamento') {
    const category = typeof saved.categoria === 'string' ? saved.categoria : 'C'
    const highRisk = category === 'D' || category === 'E'
    const nextStep = highRisk ? 'tep_trombolise_contra' : category === 'C' ? 'tep_internacao' : 'tep_alta'
    return <div className="space-y-4">
      <div className={clsx('rounded-xl border p-5', highRisk ? 'border-red-300 bg-red-50 text-red-950' : category === 'C' ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-emerald-300 bg-emerald-50 text-emerald-950')}>
        <h4 className="text-lg font-extrabold">Categoria {category}</h4>
        <p className="mt-2 text-sm">{highRisk ? 'Falência cardiopulmonar: UTI, anticoagulação quando segura e reperfusão emergencial.' : category === 'C' ? 'Paciente estável com risco aumentado: internação, anticoagulação e monitorização para deterioração.' : 'Baixo risco: considerar tratamento ambulatorial somente se houver estabilidade, baixo risco hemorrágico, adesão e acesso rápido ao sistema de saúde.'}</p>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <strong>Anticoagulação terapêutica</strong>
        <ul className="mt-2 list-disc space-y-1 pl-5"><li>HBPM: enoxaparina 1 mg/kg SC 12/12 h; ajustar em insuficiência renal e situações especiais.</li><li>HNF: preferir em instabilidade, insuficiência renal grave ou quando reperfusão/procedimento é provável.</li><li>Em pacientes ambulatoriais elegíveis, rivaroxabana ou apixabana podem ser iniciadas sem ponte; outras opções dependem de heparina prévia ou monitorização de INR.</li></ul>
      </div>
      <div className="flex justify-end"><Continue critical={highRisk} onClick={() => onContinue(nextStep, JSON.stringify({ categoria: category, destino: nextStep }))} label={highRisk ? 'Revisar contraindicações e reperfundir' : category === 'C' ? 'Internar e anticoagular' : 'Planejar alta segura'} /></div>
    </div>
  }

  if (stepId === 'tep_trombolise_contra') {
    const absoluteSelected = selected.filter(item => item.startsWith('abs_'))
    return <div className="space-y-5"><div className={clsx('rounded-xl border p-4', absoluteSelected.length ? 'border-red-300 bg-red-50 text-red-950' : 'border-emerald-200 bg-emerald-50 text-emerald-950')}><strong>{absoluteSelected.length ? 'Contraindicação absoluta identificada: evitar trombólise sistêmica e acionar alternativa de reperfusão.' : 'Nenhuma contraindicação absoluta marcada.'}</strong></div><section><h4 className="mb-3 font-extrabold text-red-900">Contraindicações absolutas</h4><div className="grid gap-3 md:grid-cols-2">{ABSOLUTE.map(([key,label]) => <Checkbox key={key} checked={selected.includes(`abs_${key}`)} label={label} onChange={() => toggle(`abs_${key}`)} />)}</div></section><section><h4 className="mb-3 font-extrabold text-amber-900">Contraindicações relativas</h4><div className="grid gap-3 md:grid-cols-2">{RELATIVE.map(([key,label]) => <Checkbox key={key} checked={selected.includes(`rel_${key}`)} label={label} onChange={() => toggle(`rel_${key}`)} />)}</div></section><div className="flex justify-end"><Continue critical onClick={() => onContinue('tep_reperfusao', JSON.stringify({ criteriosSelecionados: selected, contraindicaoAbsoluta: absoluteSelected.length > 0 }))} label="Definir estratégia de reperfusão" /></div></div>
  }

  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><AlertTriangle className="mr-2 inline h-5 w-5" />Etapa de avaliação não reconhecida.</div>
}
