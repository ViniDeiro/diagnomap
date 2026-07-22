'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Syringe,
  Waves
} from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyPatient } from '@/types/emergency'
import { UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'

export const RABIES_CASE_ANSWER_KEY = 'raiva_caso_estruturado'

export const RABIES_STAGES = [
  'raiva_cuidados_iniciais',
  'raiva_tipo_contato',
  'raiva_indireto_morcego',
  'raiva_especie',
  'raiva_cao_gato_observavel',
  'raiva_observacao_10_dias',
  'raiva_gravidade',
  'raiva_sem_profilaxia',
  'raiva_vacina',
  'raiva_vacina_soro'
] as const

export type RabiesStage = typeof RABIES_STAGES[number]

export type RabiesCaseData = {
  updatedAt?: string
  initialCare?: string[]
  contactType?: 'indirect' | 'direct'
  indirectAnimal?: 'bat' | 'other'
  animalGroup?: 'dog_cat' | 'economic' | 'wild'
  dogCatStatus?: 'observable_healthy' | 'unobservable_suspect'
  observationStartDate?: string
  observationOutcome?: 'healthy_10d' | 'disappeared_sick_dead'
  accidentCriteria?: string[]
  severity?: 'light' | 'severe'
  previousProphylaxis?: 'none' | 'complete' | 'incomplete_unknown'
  immunosuppressed?: boolean
  vaccineRoute?: 'id' | 'im'
  immunoglobulin?: 'sar' | 'ighar'
  passiveImmunizationChecks?: string[]
  outcome?: 'none' | 'vaccine' | 'vaccine_serum'
  disposition?: string
  completedAt?: string
}

export const parseRabiesCase = (raw?: string | null): RabiesCaseData => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as RabiesCaseData : {}
  } catch {
    return {}
  }
}

const stageCopy: Record<RabiesStage, [string, string]> = {
  raiva_cuidados_iniciais: ['Primeiros cuidados da exposição', 'Cuide da porta de entrada antes de decidir a profilaxia.'],
  raiva_tipo_contato: ['Como ocorreu o contato?', 'A integridade da pele e o tipo de exposição mudam a conduta.'],
  raiva_indireto_morcego: ['Houve envolvimento de morcego?', 'Mesmo uma exposição pouco evidente merece avaliação específica.'],
  raiva_especie: ['Qual animal esteve envolvido?', 'O grupo animal determina observação, classificação ou profilaxia imediata.'],
  raiva_cao_gato_observavel: ['O cão ou gato pode ser acompanhado?', 'Avalie condição clínica e possibilidade real de observação por dez dias.'],
  raiva_observacao_10_dias: ['Acompanhamento do cão ou gato', 'Registre o período e a evolução do animal, sem perder o retorno de segurança.'],
  raiva_gravidade: ['Classificar a porta de entrada', 'A localização, a profundidade e a extensão definem o risco do acidente.'],
  raiva_sem_profilaxia: ['Profilaxia antirrábica não indicada', 'Mantenha os cuidados locais e as orientações de retorno.'],
  raiva_vacina: ['Profilaxia com vacina', 'Organize o esquema, a via e as datas de aplicação.'],
  raiva_vacina_soro: ['Vacina e imunização passiva', 'Planeje vacina e SAR ou IGHAR com infiltração adequada das lesões.']
}

const initialCareOptions = [
  ['wash', 'Higienização abundante', 'Ferimento lavado com água corrente e sabão, removendo sujidades sem ampliar a lesão.'],
  ['wound', 'Avaliação da ferida', 'Profundidade, extensão, local, sinais de infecção e necessidade de abordagem cirúrgica registrados.'],
  ['tetanus', 'Proteção antitetânica', 'Situação vacinal e necessidade de profilaxia do tétano conferidas.'],
  ['antibiotic', 'Risco bacteriano', 'Antibioticoterapia avaliada conforme tipo de ferida e condição do paciente.'],
  ['notification', 'Registro epidemiológico', 'Exposição documentada para notificação e seguimento.']
] as const

const accidentOptions = [
  ['light_superficial', 'Lesão superficial em tronco ou membro', 'Não inclui mãos nem pés.', false],
  ['light_lick', 'Lambedura sobre lesão superficial', 'Sem contato com mucosa ou ferida profunda.', false],
  ['severe_site', 'Mucosa, cabeça, mãos ou pés', 'Qualquer mordedura ou arranhadura nesses locais.', true],
  ['severe_multiple', 'Feridas múltiplas ou extensas', 'Em qualquer região corporal.', true],
  ['severe_deep', 'Ferida profunda ou puntiforme', 'Ainda que a abertura aparente seja pequena.', true],
  ['severe_lick', 'Lambedura de mucosa ou ferida profunda', 'Inclui mucosa aparentemente íntegra.', true]
] as const

const passiveChecks = [
  ['weight', 'Peso confirmado antes do cálculo'],
  ['infiltration', 'Planejada infiltração dentro e ao redor de todas as lesões identificáveis'],
  ['separate_site', 'Eventual restante IM programado em sítio distinto da vacina'],
  ['deadline', 'Administração no dia zero ou, se indisponível, até o sétimo dia após a primeira vacina']
] as const

const toggle = (values: string[] = [], value: string) => values.includes(value)
  ? values.filter(item => item !== value)
  : [...values, value]

const Choice = ({ selected, title, description, danger = false, onClick }: { selected: boolean; title: string; description?: string; danger?: boolean; onClick: () => void }) => (
  <button type="button" aria-pressed={selected} onClick={onClick} className={clsx(
    'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200',
    selected
      ? danger ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md'
  )}>
    <span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? danger ? 'border-red-600 bg-red-600 text-white' : 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 text-transparent')}>
      <CheckCircle2 className="h-4 w-4" />
    </span>
    <span><strong className="block text-slate-950">{title}</strong>{description && <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>}</span>
  </button>
)

interface Props {
  patient: EmergencyPatient
  initialStep: string
  initialHistory: string[]
  initialAnswers: Record<string, string>
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
  onComplete: () => void
  onBack?: () => void
  onOpenReport?: () => void
}

const RabiesExposureFlowchartInteractive: React.FC<Props> = ({ patient, initialStep, initialHistory, initialAnswers, onUpdate, onComplete, onBack, onOpenReport }) => {
  const stored = parseRabiesCase(initialAnswers[RABIES_CASE_ANSWER_KEY])
  const initialStage = RABIES_STAGES.includes(initialStep as RabiesStage) ? initialStep as RabiesStage : 'raiva_cuidados_iniciais'
  const [stage, setStage] = useState<RabiesStage>(initialStage)
  const [history, setHistory] = useState<RabiesStage[]>(initialHistory.filter(item => RABIES_STAGES.includes(item as RabiesStage)) as RabiesStage[])
  const [answers, setAnswers] = useState(initialAnswers)
  const [data, setData] = useState<RabiesCaseData>(stored)
  const [notice, setNotice] = useState('')
  const [showCompletion, setShowCompletion] = useState(Boolean(stored.completedAt))
  const [title, subtitle] = stageCopy[stage]
  const finalStage = ['raiva_sem_profilaxia', 'raiva_vacina', 'raiva_vacina_soro'].includes(stage)
  const progress = finalStage ? 94 : Math.max(10, Math.round(((RABIES_STAGES.indexOf(stage) + 1) / 8) * 82))
  const severeSelected = useMemo(() => (data.accidentCriteria || []).some(value => value.startsWith('severe_')), [data.accidentCriteria])
  const weight = typeof patient.weight === 'number' && patient.weight > 0 ? patient.weight : undefined
  const sarDose = weight ? weight * 40 : undefined
  const igharDose = weight ? weight * 20 : undefined

  const update = (patch: Partial<RabiesCaseData>) => setData(previous => ({ ...previous, ...patch }))
  const selectMany = (key: 'initialCare' | 'accidentCriteria' | 'passiveImmunizationChecks', value: string) => setData(previous => ({ ...previous, [key]: toggle(previous[key], value) }))

  const legacyPatchFor = (current: RabiesStage, nextData: RabiesCaseData): Record<string, string> => {
    if (current === 'raiva_tipo_contato' && nextData.contactType) return { raiva_tipo_contato: nextData.contactType === 'indirect' ? 'contato_indireto' : 'contato_direto' }
    if (current === 'raiva_indireto_morcego' && nextData.indirectAnimal) return { raiva_indireto_morcego: nextData.indirectAnimal === 'bat' ? 'morcego' : 'outro_animal' }
    if (current === 'raiva_especie' && nextData.animalGroup) return { raiva_especie: nextData.animalGroup === 'dog_cat' ? 'cao_gato' : nextData.animalGroup === 'economic' ? 'mamifero_domestico' : 'animal_silvestre' }
    if (current === 'raiva_cao_gato_observavel' && nextData.dogCatStatus) return { raiva_cao_gato_observavel: nextData.dogCatStatus === 'observable_healthy' ? 'observavel_sadio' : 'nao_observavel_ou_suspeito' }
    if (current === 'raiva_observacao_10_dias' && nextData.observationOutcome) return { raiva_observacao_10_dias: nextData.observationOutcome === 'healthy_10d' ? 'vivo_saudavel' : 'evolucao_suspeita' }
    if (current === 'raiva_gravidade' && nextData.severity) return { raiva_gravidade: nextData.severity === 'severe' ? 'grave' : 'leve' }
    return {}
  }

  const persist = (nextStage: RabiesStage, patch: Partial<RabiesCaseData> = {}) => {
    const nextData = { ...data, ...patch, updatedAt: new Date().toISOString() }
    const nextHistory = [...history, stage]
    const nextAnswers = { ...answers, ...legacyPatchFor(stage, nextData), [RABIES_CASE_ANSWER_KEY]: JSON.stringify(nextData) }
    setData(nextData); setHistory(nextHistory); setStage(nextStage); setAnswers(nextAnswers); setNotice('')
    onUpdate(patient.id, nextStage, nextHistory, nextAnswers, nextStage.startsWith('raiva_') ? Math.max(progress, 10) : progress, nextData.severity === 'severe' || nextData.outcome === 'vaccine_serum' ? 'Exposição grave' : 'Exposição antirrábica')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (!history.length) { onBack?.(); return }
    const previous = history[history.length - 1]
    const nextHistory = history.slice(0, -1)
    setStage(previous); setHistory(nextHistory); setShowCompletion(false); setNotice('')
    onUpdate(patient.id, previous, nextHistory, answers, Math.max(8, progress - 12), patient.emergencyState.riskGroup)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    const preserved: Record<string, string> = {}
    if (answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]) preserved[UNIVERSAL_ASSESSMENT_ANSWER_KEY] = answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]
    setStage('raiva_cuidados_iniciais'); setHistory([]); setAnswers(preserved); setData({}); setNotice(''); setShowCompletion(false)
    onUpdate(patient.id, 'raiva_cuidados_iniciais', [], preserved, 8, 'Exposição antirrábica')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = () => {
    const disposition = data.outcome === 'vaccine_serum'
      ? 'Profilaxia pós-exposição com vacina e imunização passiva'
      : data.outcome === 'vaccine' ? 'Profilaxia pós-exposição com vacina' : 'Sem indicação de imunoprofilaxia antirrábica neste caminho'
    const nextData = { ...data, disposition, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const nextAnswers = { ...answers, [RABIES_CASE_ANSWER_KEY]: JSON.stringify(nextData) }
    setData(nextData); setAnswers(nextAnswers); setShowCompletion(true)
    onUpdate(patient.id, stage, [...history, stage], nextAnswers, 100, data.outcome === 'vaccine_serum' ? 'Exposição grave' : 'Exposição antirrábica')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueContact = () => {
    if (!data.contactType) { setNotice('Selecione como ocorreu o contato.'); return }
    persist(data.contactType === 'indirect' ? 'raiva_indireto_morcego' : 'raiva_especie')
  }

  const continueIndirect = () => {
    if (!data.indirectAnimal) { setNotice('Informe se houve contato com morcego.'); return }
    persist(data.indirectAnimal === 'bat' ? 'raiva_vacina_soro' : 'raiva_sem_profilaxia', { outcome: data.indirectAnimal === 'bat' ? 'vaccine_serum' : 'none' })
  }

  const continueSpecies = () => {
    if (!data.animalGroup) { setNotice('Selecione o grupo do animal envolvido.'); return }
    if (data.animalGroup === 'wild') persist('raiva_vacina_soro', { severity: 'severe', outcome: 'vaccine_serum' })
    else persist(data.animalGroup === 'dog_cat' ? 'raiva_cao_gato_observavel' : 'raiva_gravidade')
  }

  const continueDogCat = () => {
    if (!data.dogCatStatus) { setNotice('Registre se o animal é observável e está sem sinais sugestivos.'); return }
    persist(data.dogCatStatus === 'observable_healthy' ? 'raiva_observacao_10_dias' : 'raiva_gravidade')
  }

  const continueObservation = () => {
    if (!data.observationOutcome) { setNotice('Registre a evolução do animal ao final ou durante a observação.'); return }
    persist(data.observationOutcome === 'healthy_10d' ? 'raiva_sem_profilaxia' : 'raiva_gravidade', data.observationOutcome === 'healthy_10d' ? { outcome: 'none' } : {})
  }

  const continueSeverity = () => {
    if (!(data.accidentCriteria || []).length) { setNotice('Marque ao menos uma característica da exposição.'); return }
    const severity = severeSelected ? 'severe' : 'light'
    persist(severity === 'severe' ? 'raiva_vacina_soro' : 'raiva_vacina', { severity, outcome: severity === 'severe' ? 'vaccine_serum' : 'vaccine' })
  }

  const finalReady = data.outcome === 'none'
    || (Boolean(data.vaccineRoute) && Boolean(data.previousProphylaxis) && data.immunosuppressed != null
      && (data.outcome !== 'vaccine_serum' || (Boolean(data.immunoglobulin) && (data.passiveImmunizationChecks || []).length === passiveChecks.length)))

  return <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 pb-12">
    <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div><p className="text-lg font-black text-slate-950">{patient.name}</p><p className="text-xs font-semibold text-slate-500">{patient.age ? `${patient.age} anos` : 'Idade não informada'} · avaliação antirrábica</p></div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onComplete} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"><ChevronLeft className="h-4 w-4" /> Dashboard</button>
          <button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-950"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-950"><RotateCcw className="h-4 w-4" /> Reiniciar</button>
        </div>
      </div>
    </div>

    <header className={clsx('relative overflow-hidden px-5 py-7 text-white shadow-lg sm:px-8', data.outcome === 'vaccine_serum' || severeSelected ? 'bg-gradient-to-r from-red-700 via-rose-650 to-orange-600' : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600')}>
      <div className="mx-auto flex max-w-6xl items-center gap-4"><div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20"><ShieldCheck className="h-8 w-8" /></div><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.22em] text-white/75">Protocolo interativo · profilaxia da raiva</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-white/85 sm:text-base">{subtitle}</p></div><div className="hidden text-right sm:block"><strong className="text-2xl">{showCompletion ? 100 : progress}%</strong><p className="text-xs text-white/70">registrado</p></div></div>
      <div className="absolute bottom-0 left-0 h-1.5 bg-white/35 transition-all" style={{ width: `${showCompletion ? 100 : progress}%` }} />
    </header>

    <main className="mx-auto mt-7 max-w-6xl px-4 sm:px-6">
      {showCompletion ? <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15"><CheckCircle2 className="h-8 w-8" /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Avaliação registrada</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Fluxo de mordedura concluído</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50">Exposição, animal, gravidade e conduta foram preservados para compor o relatório clínico.</p></div></div><span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold">100% concluído</span></div></section>
        <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Classificação</p><p className="mt-2 text-lg font-black text-slate-950">{data.severity === 'severe' ? 'Acidente grave' : data.severity === 'light' ? 'Acidente leve' : 'Sem classificação necessária'}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Conduta</p><p className="mt-2 text-lg font-black text-slate-950">{data.outcome === 'vaccine_serum' ? 'Vacina + SAR/IGHAR' : data.outcome === 'vaccine' ? 'Vacina' : 'Sem imunoprofilaxia'}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Finalização</p><p className="mt-2 text-sm font-black text-slate-950">{data.completedAt ? new Date(data.completedAt).toLocaleString('pt-BR') : 'Horário não informado'}</p></div></section>
        <section className="rounded-[1.75rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Síntese do caminho</p><h3 className="mt-2 text-xl font-black text-slate-950">{data.disposition}</h3><p className="mt-2 text-sm leading-relaxed text-blue-950">Abra o relatório para revisar as características da exposição, os cuidados locais, o cálculo em UI quando aplicável e as orientações registradas.</p></section>
        <div className="grid gap-3 sm:grid-cols-2">{onOpenReport && <button type="button" onClick={onOpenReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-5 py-4 font-extrabold text-blue-950"><FileText className="h-5 w-5" /> Abrir relatório completo</button>}<button type="button" onClick={onComplete} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white"><CheckCircle2 className="h-5 w-5" /> Concluir e ir ao dashboard</button></div>
      </motion.div> : <motion.section key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
        {stage === 'raiva_cuidados_iniciais' && <div className="space-y-6"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950"><div className="flex gap-3"><Waves className="h-6 w-6 shrink-0" /><p><strong>A lavagem é imediata.</strong> A classificação epidemiológica vem em seguida e não substitui o cuidado local.</p></div></div><div className="grid gap-3 md:grid-cols-2">{initialCareOptions.map(([id, label, description]) => <Choice key={id} selected={(data.initialCare || []).includes(id)} title={label} description={description} onClick={() => selectMany('initialCare', id)} />)}</div><button type="button" disabled={!(data.initialCare || []).includes('wash')} onClick={() => persist('raiva_tipo_contato')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Classificar a exposição <ChevronRight /></button></div>}

        {stage === 'raiva_tipo_contato' && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2"><Choice selected={data.contactType === 'indirect'} title="Contato indireto" description="Toque, alimentação do animal, lambedura em pele íntegra ou secreção sobre pele sem lesão." onClick={() => update({ contactType: 'indirect' })} /><Choice selected={data.contactType === 'direct'} title="Contato direto ou duvidoso" description="Mordedura, arranhadura, lambedura de lesão/mucosa ou secreção em pele não íntegra." danger onClick={() => update({ contactType: 'direct' })} /></div><button type="button" onClick={continueContact} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Prosseguir conforme o contato <ChevronRight /></button></div>}

        {stage === 'raiva_indireto_morcego' && <div className="space-y-5"><div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><strong>Por que separar o morcego?</strong><p className="mt-1 text-sm">Contato com quirópteros pode ocorrer sem ferimento percebido e exige uma decisão mais protetora.</p></div><div className="grid gap-3 md:grid-cols-2"><Choice selected={data.indirectAnimal === 'bat'} title="Morcego envolvido" danger onClick={() => update({ indirectAnimal: 'bat' })} /><Choice selected={data.indirectAnimal === 'other'} title="Outro animal, sem exposição direta" onClick={() => update({ indirectAnimal: 'other' })} /></div><button type="button" onClick={continueIndirect} className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Definir conduta</button></div>}

        {stage === 'raiva_especie' && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-3"><Choice selected={data.animalGroup === 'dog_cat'} title="Cão ou gato" description="A possibilidade de observar por dez dias será avaliada." onClick={() => update({ animalGroup: 'dog_cat' })} /><Choice selected={data.animalGroup === 'economic'} title="Mamífero doméstico de produção" description="Bovino, equino, suíno, caprino ou ovino." onClick={() => update({ animalGroup: 'economic' })} /><Choice selected={data.animalGroup === 'wild'} title="Mamífero silvestre" description="Inclui morcego, raposa, primata e outros mamíferos silvestres." danger onClick={() => update({ animalGroup: 'wild' })} /></div><button type="button" onClick={continueSpecies} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Aplicar regra do animal <ChevronRight /></button></div>}

        {stage === 'raiva_cao_gato_observavel' && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2"><Choice selected={data.dogCatStatus === 'observable_healthy'} title="Sem sinais sugestivos e observável" description="Há responsável e condições para acompanhar o animal durante todo o período." onClick={() => update({ dogCatStatus: 'observable_healthy' })} /><Choice selected={data.dogCatStatus === 'unobservable_suspect'} title="Não observável ou clinicamente suspeito" description="Animal desaparecido, sem seguimento confiável ou com mudança comportamental/neurológica." danger onClick={() => update({ dogCatStatus: 'unobservable_suspect' })} /></div><button type="button" onClick={continueDogCat} className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Definir próximo passo</button></div>}

        {stage === 'raiva_observacao_10_dias' && <div className="space-y-6"><div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5"><div className="flex items-start gap-3"><CalendarDays className="h-6 w-6 shrink-0 text-blue-700" /><div><h2 className="font-black text-slate-950">Janela de observação do animal</h2><p className="mt-1 text-sm text-slate-600">Conte dez dias a partir da agressão. Se o animal adoecer, morrer ou desaparecer, o paciente deve retornar imediatamente.</p></div></div><label className="mt-4 block text-sm font-black text-slate-800">Data da agressão<input type="date" value={data.observationStartDate || ''} onChange={event => update({ observationStartDate: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label>{data.observationStartDate && <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-blue-950">Reavaliação prevista: {new Date(`${data.observationStartDate}T12:00:00`).getTime() ? new Date(new Date(`${data.observationStartDate}T12:00:00`).getTime() + 10 * 86400000).toLocaleDateString('pt-BR') : 'data inválida'}</p>}</div><div className="grid gap-3 md:grid-cols-2"><Choice selected={data.observationOutcome === 'healthy_10d'} title="Permaneceu vivo e saudável" description="Acompanhamento concluído até o décimo dia." onClick={() => update({ observationOutcome: 'healthy_10d' })} /><Choice selected={data.observationOutcome === 'disappeared_sick_dead'} title="Desapareceu, adoeceu ou morreu" description="Raiva não descartada durante a observação." danger onClick={() => update({ observationOutcome: 'disappeared_sick_dead' })} /></div><button type="button" disabled={!data.observationStartDate} onClick={continueObservation} className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Registrar evolução do animal</button></div>}

        {stage === 'raiva_gravidade' && <div className="space-y-5"><div className={clsx('rounded-2xl border p-4 text-sm font-bold', severeSelected ? 'border-red-300 bg-red-50 text-red-950' : 'border-amber-300 bg-amber-50 text-amber-950')}>{(data.accidentCriteria || []).length ? severeSelected ? 'Há pelo menos um critério grave. O fluxo direcionará para vacina e imunização passiva.' : 'Até o momento, somente critérios leves foram marcados.' : 'Selecione todas as características presentes; qualquer critério grave prevalece.'}</div><div className="grid gap-3 md:grid-cols-2">{accidentOptions.map(([id, label, description, danger]) => <Choice key={id} selected={(data.accidentCriteria || []).includes(id)} title={label} description={description} danger={danger} onClick={() => selectMany('accidentCriteria', id)} />)}</div><button type="button" onClick={continueSeverity} className={clsx('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-extrabold text-white', severeSelected ? 'bg-red-700' : 'bg-blue-700')}>Aplicar classificação calculada <ChevronRight /></button></div>}

        {stage === 'raiva_sem_profilaxia' && <div className="space-y-6"><div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-950"><ShieldCheck className="h-8 w-8" /><h2 className="mt-3 text-xl font-black">Sem indicação de vacina ou SAR/IGHAR neste percurso</h2><p className="mt-2 text-sm leading-relaxed">Mantenha os cuidados da ferida, complete a avaliação antitetânica e reavalie imediatamente se surgirem novas informações epidemiológicas.</p></div><button type="button" onClick={finish} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white"><CheckCircle2 /> Registrar conclusão</button></div>}

        {(stage === 'raiva_vacina' || stage === 'raiva_vacina_soro') && <div className="space-y-6"><section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950"><div className="flex gap-3"><Syringe className="h-6 w-6 shrink-0" /><div><h2 className="font-black">Esquema de quatro doses</h2><p className="mt-1 text-sm">Registre aplicações nos dias 0, 3, 7 e 14. A via pode ser intradérmica ou intramuscular conforme produto, capacitação e protocolo do serviço.</p></div></div></section><section><h2 className="mb-3 font-black text-slate-950">Via planejada</h2><div className="grid gap-3 md:grid-cols-2"><Choice selected={data.vaccineRoute === 'id'} title="Intradérmica" description="0,2 mL por dia, divididos em duas aplicações de 0,1 mL em locais distintos no antebraço ou inserção do deltoide." onClick={() => update({ vaccineRoute: 'id' })} /><Choice selected={data.vaccineRoute === 'im'} title="Intramuscular" description="Volume integral da apresentação (0,5 ou 1 mL), no deltoide ou vasto lateral em menores de dois anos; não usar glúteo." onClick={() => update({ vaccineRoute: 'im' })} /></div></section><section><h2 className="mb-3 font-black text-slate-950">Situações que exigem revisão do esquema</h2><div className="grid gap-3 md:grid-cols-3"><Choice selected={data.previousProphylaxis === 'none'} title="Sem profilaxia anterior" onClick={() => update({ previousProphylaxis: 'none' })} /><Choice selected={data.previousProphylaxis === 'complete'} title="Esquema prévio completo" description="Reexposição: revisar o esquema específico antes de aplicar quatro doses." onClick={() => update({ previousProphylaxis: 'complete' })} /><Choice selected={data.previousProphylaxis === 'incomplete_unknown'} title="Prévio incompleto ou desconhecido" description="Confirmar registros e consultar vigilância/protocolo vigente." danger onClick={() => update({ previousProphylaxis: 'incomplete_unknown' })} /></div><div className="mt-3 grid gap-3 md:grid-cols-2"><Choice selected={data.immunosuppressed === false} title="Sem imunossupressão relevante" onClick={() => update({ immunosuppressed: false })} /><Choice selected={data.immunosuppressed === true} title="Imunossupressão presente" description="O esquema e a avaliação de resposta devem ser revistos com a referência." danger onClick={() => update({ immunosuppressed: true })} /></div></section>{stage === 'raiva_vacina_soro' && <section className="space-y-4"><div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"><h2 className="font-black">Imunização passiva indicada</h2><p className="mt-1 text-sm">A dose é calculada em unidades internacionais. O volume em mL depende da concentração do produto disponível.</p>{weight ? <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white p-4"><span className="text-xs font-black uppercase text-slate-500">SAR · 40 UI/kg</span><strong className="mt-1 block text-2xl text-red-800">{sarDose?.toLocaleString('pt-BR')} UI</strong></div><div className="rounded-xl bg-white p-4"><span className="text-xs font-black uppercase text-slate-500">IGHAR · 20 UI/kg</span><strong className="mt-1 block text-2xl text-red-800">{igharDose?.toLocaleString('pt-BR')} UI</strong></div></div> : <p className="mt-3 rounded-xl bg-white p-3 font-bold">Peso não registrado. Informe-o nos dados do paciente antes de calcular.</p>}</div><div className="grid gap-3 md:grid-cols-2"><Choice selected={data.immunoglobulin === 'sar'} title="SAR selecionado" description={sarDose ? `${sarDose.toLocaleString('pt-BR')} UI para ${weight} kg.` : 'Calcular 40 UI/kg.'} danger onClick={() => update({ immunoglobulin: 'sar' })} /><Choice selected={data.immunoglobulin === 'ighar'} title="IGHAR selecionada" description={igharDose ? `${igharDose.toLocaleString('pt-BR')} UI para ${weight} kg.` : 'Calcular 20 UI/kg.'} danger onClick={() => update({ immunoglobulin: 'ighar' })} /></div><div className="grid gap-3 md:grid-cols-2">{passiveChecks.map(([id, label]) => <Choice key={id} selected={(data.passiveImmunizationChecks || []).includes(id)} title={label} danger={id === 'deadline'} onClick={() => selectMany('passiveImmunizationChecks', id)} />)}</div></section>} {(data.previousProphylaxis === 'complete' || data.previousProphylaxis === 'incomplete_unknown' || data.immunosuppressed) && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><strong>Não finalizar a prescrição automaticamente:</strong> confirme o histórico, o grau de imunossupressão e o esquema de reexposição com a vigilância/protocolo vigente.</div>}<button type="button" disabled={!finalReady} onClick={finish} className={clsx('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-extrabold text-white disabled:bg-slate-300', stage === 'raiva_vacina_soro' ? 'bg-red-700' : 'bg-blue-700')}><Sparkles className="h-5 w-5" /> Registrar plano e finalizar</button></div>}

        {notice && <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950"><AlertTriangle className="mr-2 inline h-4 w-4" />{notice}</p>}
        <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button><span className="hidden text-xs font-semibold text-slate-500 sm:block">As escolhas ficam registradas no resumo clínico.</span></footer>
      </motion.section>}
    </main>
  </div>
}

export default RabiesExposureFlowchartInteractive
