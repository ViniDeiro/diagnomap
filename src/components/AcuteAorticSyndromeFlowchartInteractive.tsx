'use client'

import React, { useState } from 'react'
import { Activity, AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, FileText, HeartPulse, RotateCcw, ScanLine } from 'lucide-react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import type { EmergencyPatient } from '@/types/emergency'
import UniversalCareTransition, { type CareTransitionData } from './UniversalCareTransition'
import { UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'

export const AORTIC_CASE_ANSWER_KEY = 'sindrome_aortica_caso_estruturado'

const stages = ['aorta_reconhecimento', 'aorta_estabilizacao', 'aorta_imagem', 'aorta_transferencia'] as const
type Stage = typeof stages[number]

type AorticData = {
  findings?: string[]
  blocker?: string
  blockerStarted?: boolean
  heartRateControlled?: boolean
  pressureControlled?: boolean
  vasodilator?: string
  imagingStatus?: 'stable' | 'unstable'
  imaging?: string[]
  classification?: string
  disposition?: string
  completedAt?: string
}

const parseData = (raw?: string): AorticData => {
  try { return raw ? JSON.parse(raw) as AorticData : {} } catch { return {} }
}

const findingOptions = [
  ['abrupt_pain', 'Dor torácica, dorsal ou abdominal abrupta e intensa'],
  ['pulse_deficit', 'Assimetria de pulsos ou diferença pressórica entre membros'],
  ['malperfusion', 'Déficit neurológico, isquemia de membro, oligúria ou dor abdominal por má perfusão'],
  ['aortic_regurgitation', 'Novo sopro de insuficiência aórtica'],
  ['shock', 'Hipotensão, choque, tamponamento ou hemotórax'],
  ['risk_condition', 'Aortopatia conhecida, Marfan, válvula bicúspide ou procedimento aórtico prévio']
] as const

const blockerOptions = [
  ['esmolol', 'Esmolol — opção preferencial', 'Bolus opcional de 500 mcg/kg; iniciar 50–100 mcg/kg/min em bomba e titular até 300 mcg/kg/min. Curta meia-vida facilita ajustes rápidos.'],
  ['seloken', 'Seloken® (tartarato de metoprolol)', 'Apresentação injetável 1 mg/mL, ampola de 5 mL. Administrar 5 mg EV lentamente; repetir a cada 5 minutos até 15 mg, conforme frequência, condução e função ventricular.'],
  ['labetalol', 'Labetalol, se disponível', '20 mg EV; depois 40 mg e 80 mg a cada 10 minutos conforme resposta, respeitando o limite institucional.'],
  ['non_dhp', 'Betabloqueador contraindicado', 'Documentar a contraindicação e considerar verapamil ou diltiazem intravenoso para controle de frequência conforme especialista/protocolo.']
] as const

const vasodilatorOptions = [
  ['none', 'Sem vasodilatador adicional', 'A PAS já está abaixo de 120 mmHg, ou no menor valor que mantém perfusão adequada.'],
  ['nitroprusside', 'Associar nitroprussiato', 'Somente depois do controle da frequência/impulso. Titular em bomba, proteger da luz e vigiar toxicidade.'],
  ['nicardipine', 'Associar nicardipina', 'Somente depois do controle da frequência/impulso. Iniciar em 5 mg/h e titular até 15 mg/h conforme resposta.']
] as const

const imagingOptions = [
  ['cta', 'Angio-TC da aorta', 'Primeira escolha no paciente estável. Abranger a aorta torácica e estender o estudo conforme suspeita/protocolo para definir porta de entrada, extensão, ramos e complicações.'],
  ['tee', 'Ecocardiograma transesofágico', 'Alternativa diagnóstica de alta acurácia, especialmente quando transporte ou contraste são inviáveis e há equipe experiente.'],
  ['pocus', 'POCUS / ecocardiograma focado', 'Exame complementar imediato no instável: pesquisar derrame/tamponamento, raiz dilatada, insuficiência aórtica e possível flap. Resultado negativo não exclui síndrome aórtica.'],
  ['transfer_imaging', 'Imagem não disponível — transferir sem atraso', 'Manter terapia anti-impulso e transporte monitorizado para serviço com imagem e equipe aórtica.']
] as const

const toggle = (values: string[] = [], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value]

const Option = ({ selected, title, description, disabled, danger, onClick }: { selected: boolean; title: string; description?: string; disabled?: boolean; danger?: boolean; onClick: () => void }) => (
  <button type="button" disabled={disabled} aria-pressed={selected} onClick={onClick} className={clsx('w-full rounded-2xl border p-4 text-left transition', disabled && 'cursor-not-allowed opacity-45', selected ? danger ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-blue-700 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300')}>
    <span className="flex items-start gap-3"><span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 text-transparent')}><CheckCircle2 className="h-4 w-4" /></span><span><strong className="block text-slate-950">{title}</strong>{description && <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>}</span></span>
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

export default function AcuteAorticSyndromeFlowchartInteractive({ patient, initialStep, initialHistory, initialAnswers, onUpdate, onComplete, onBack, onOpenReport }: Props) {
  const initial = stages.includes(initialStep as Stage) ? initialStep as Stage : 'aorta_reconhecimento'
  const [stage, setStage] = useState<Stage>(initial)
  const [history, setHistory] = useState<string[]>(initialHistory.filter(item => stages.includes(item as Stage)))
  const [answers, setAnswers] = useState(initialAnswers)
  const [data, setData] = useState<AorticData>(() => parseData(initialAnswers[AORTIC_CASE_ANSWER_KEY]))
  const [transition, setTransition] = useState<CareTransitionData | null>(() => { try { return initialAnswers.__care_transition_aorta_transferencia ? JSON.parse(initialAnswers.__care_transition_aorta_transferencia) : null } catch { return null } })
  const [done, setDone] = useState(() => Boolean(parseData(initialAnswers[AORTIC_CASE_ANSWER_KEY]).completedAt))
  const progress = done ? 100 : Math.round(((stages.indexOf(stage) + 1) / stages.length) * 100)
  const update = (patch: Partial<AorticData>) => setData(previous => ({ ...previous, ...patch }))
  const persist = (next: Stage, patch: Partial<AorticData> = {}) => {
    const nextData = { ...data, ...patch }
    const nextHistory = [...history, stage]
    const nextAnswers = { ...answers, [AORTIC_CASE_ANSWER_KEY]: JSON.stringify(nextData) }
    setData(nextData); setHistory(nextHistory); setStage(next); setAnswers(nextAnswers)
    onUpdate(patient.id, next, nextHistory, nextAnswers, Math.max(progress, 10), 'Síndrome aórtica aguda')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => {
    if (done) { setDone(false); return }
    if (!history.length) { onBack?.(); return }
    const previous = history[history.length - 1] as Stage
    const nextHistory = history.slice(0, -1)
    setStage(previous); setHistory(nextHistory)
    onUpdate(patient.id, previous, nextHistory, answers, Math.max(10, progress - 25), patient.emergencyState.riskGroup)
  }
  const restart = () => {
    const preserved: Record<string, string> = {}
    if (answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]) preserved[UNIVERSAL_ASSESSMENT_ANSWER_KEY] = answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]
    setStage('aorta_reconhecimento'); setHistory([]); setData({}); setAnswers(preserved); setTransition(null); setDone(false)
    onUpdate(patient.id, 'aorta_reconhecimento', [], preserved, 25, 'Síndrome aórtica aguda')
  }
  const finish = (confirmed: CareTransitionData) => {
    const nextData = { ...data, disposition: 'UTI e equipe vascular/cardiotorácica', completedAt: new Date().toISOString() }
    const nextAnswers = { ...answers, __care_transition_aorta_transferencia: JSON.stringify(confirmed), [AORTIC_CASE_ANSWER_KEY]: JSON.stringify(nextData) }
    setData(nextData); setAnswers(nextAnswers); setDone(true)
    onUpdate(patient.id, stage, [...history, stage], nextAnswers, 100, 'Síndrome aórtica aguda')
  }
  const imagePlanValid = data.imagingStatus === 'stable'
    ? (data.imaging || []).some(item => item === 'cta' || item === 'tee')
    : (data.imaging || []).includes('tee') || (data.imaging || []).includes('pocus') && (data.imaging || []).includes('transfer_imaging')

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 pb-12">
    <div className="sticky top-0 z-40 border-b bg-white/90 px-4 py-4 shadow backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-black">{patient.name}</h1><p className="text-sm text-slate-600">{patient.age} anos · {patient.medicalRecord}</p></div><div className="flex gap-2">{onBack && <button onClick={onBack} className="rounded-xl border px-4 py-2 font-bold"><ArrowLeft className="mr-2 inline h-4 w-4" />Dashboard</button>}<button onClick={back} className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-bold">Voltar</button><button onClick={restart} className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 font-bold"><RotateCcw className="mr-2 inline h-4 w-4" />Reiniciar</button></div></div></div>
    <header className="bg-gradient-to-r from-red-800 to-slate-950 px-5 py-7 text-white"><div className="mx-auto flex max-w-6xl items-center gap-4"><Activity className="h-9 w-9" /><div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-200">Protocolo interativo · {progress}%</p><h2 className="text-3xl font-black">Síndrome Aórtica Aguda</h2><p className="mt-1 text-red-100">Controle anti-impulso, imagem definitiva e equipe aórtica em paralelo.</p></div></div></header>
    <main className="mx-auto mt-7 max-w-6xl px-4">
      {done ? <div className="space-y-5"><section className="rounded-3xl bg-emerald-700 p-7 text-white"><CheckCircle2 className="h-10 w-10" /><h2 className="mt-3 text-3xl font-black">Plano aórtico registrado</h2><p className="mt-2">Betabloqueio, necessidade de vasodilatador, estratégia de imagem e transferência foram salvos.</p></section><div className="grid gap-3 sm:grid-cols-2">{onOpenReport && <button onClick={onOpenReport} className="rounded-xl border border-blue-300 bg-white px-5 py-4 font-black text-blue-900"><FileText className="mr-2 inline" />Abrir relatório</button>}<button onClick={onComplete} className="rounded-xl bg-blue-800 px-5 py-4 font-black text-white">Concluir e ir ao dashboard</button></div></div> :
      <motion.section key={stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-3xl border bg-white p-5 shadow-xl sm:p-7">
        {stage === 'aorta_reconhecimento' && <><div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"><AlertTriangle className="h-6 w-6" /><h3 className="mt-2 text-xl font-black">Não atrasar analgesia, monitorização e equipe especializada</h3><p className="mt-2 text-sm">Selecione os achados que sustentam a suspeita clínica.</p></div><div className="grid gap-3 md:grid-cols-2">{findingOptions.map(([id, label]) => <Option key={id} selected={(data.findings || []).includes(id)} title={label} onClick={() => update({ findings: toggle(data.findings, id) })} />)}</div><button disabled={!(data.findings || []).length} onClick={() => persist('aorta_estabilizacao')} className="w-full rounded-xl bg-red-800 px-5 py-4 font-black text-white disabled:bg-slate-300">Iniciar terapia anti-impulso <ChevronRight className="inline" /></button></>}
        {stage === 'aorta_estabilizacao' && <><div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5"><HeartPulse className="text-red-700" /><h3 className="mt-2 text-xl font-black">1. Betabloqueador primeiro</h3><p className="mt-2 text-sm">Alvo: FC entre 60–80 bpm e PAS abaixo de 120 mmHg, ou o menor valor que preserve perfusão. Esmolol é destacado pela titulação rápida.</p></div><div className="grid gap-3 md:grid-cols-2">{blockerOptions.map(([id, label, description]) => <Option key={id} selected={data.blocker === id} title={label} description={description} danger={id === 'esmolol'} onClick={() => update({ blocker: id, blockerStarted: true, heartRateControlled: false, vasodilator: undefined })} />)}</div>{data.blocker && <div className="grid gap-3 md:grid-cols-2"><Option selected={data.heartRateControlled === true} title="Frequência/impulso controlados" description="Betabloqueio administrado e resposta clínica reavaliada." onClick={() => update({ heartRateControlled: true })} /><Option selected={data.pressureControlled === true} title="PAS já controlada com perfusão adequada" onClick={() => update({ pressureControlled: true, vasodilator: 'none' })} /></div>}<section><h3 className="mb-2 text-xl font-black">2. Vasodilatador somente depois</h3><p className="mb-3 text-sm text-slate-600">As opções permanecem bloqueadas até registrar o controle da frequência/impulso.</p><div className="grid gap-3 md:grid-cols-3">{vasodilatorOptions.map(([id, label, description]) => <Option key={id} disabled={!data.heartRateControlled} selected={data.vasodilator === id} title={label} description={description} danger={id !== 'none'} onClick={() => update({ vasodilator: id, pressureControlled: id === 'none' })} />)}</div></section><button disabled={!data.blockerStarted || !data.heartRateControlled || !data.vasodilator} onClick={() => persist('aorta_imagem')} className="w-full rounded-xl bg-red-800 px-5 py-4 font-black text-white disabled:bg-slate-300">Registrar anti-impulso e escolher imagem <ChevronRight className="inline" /></button></>}
        {stage === 'aorta_imagem' && <><div className="rounded-2xl border border-blue-300 bg-blue-50 p-5"><ScanLine className="text-blue-700" /><h3 className="mt-2 text-xl font-black">A estabilidade define a imagem inicial</h3></div><div className="grid gap-3 sm:grid-cols-2"><Option selected={data.imagingStatus === 'stable'} title="Hemodinamicamente estável" description="Priorizar angio-TC; ETE é alternativa razoável quando TC não é possível." onClick={() => update({ imagingStatus: 'stable', imaging: [] })} /><Option selected={data.imagingStatus === 'unstable'} title="Instável ou transporte inseguro" description="POCUS/eco à beira-leito e transferência/equipe imediata, sem considerar POCUS negativo como exclusão." danger onClick={() => update({ imagingStatus: 'unstable', imaging: [] })} /></div><div className="grid gap-3 md:grid-cols-2">{imagingOptions.map(([id, label, description]) => <Option key={id} selected={(data.imaging || []).includes(id)} title={label} description={description} disabled={!data.imagingStatus || data.imagingStatus === 'unstable' && id === 'cta'} onClick={() => update({ imaging: toggle(data.imaging, id) })} />)}</div><div className="grid gap-3 md:grid-cols-3">{[['stanford_a','Stanford A / aorta ascendente'],['stanford_b_complicated','Stanford B complicada'],['not_confirmed','Diagnóstico ainda não confirmado']].map(([id,label]) => <Option key={id} selected={data.classification === id} title={label} onClick={() => update({ classification: id })} />)}</div><button disabled={!imagePlanValid || !data.classification} onClick={() => persist('aorta_transferencia')} className="w-full rounded-xl bg-red-800 px-5 py-4 font-black text-white disabled:bg-slate-300">Acionar equipe aórtica e organizar UTI <ChevronRight className="inline" /></button></>}
        {stage === 'aorta_transferencia' && <UniversalCareTransition destination="icu" context="sindrome-aortica-aguda" value={transition} onChange={(value) => { setTransition(value); const next = { ...answers, __care_transition_aorta_transferencia: JSON.stringify(value) }; setAnswers(next); onUpdate(patient.id, stage, history, next, progress, 'Síndrome aórtica aguda') }} onConfirmed={finish} />}
        <footer className="border-t pt-5"><button onClick={back} className="rounded-xl border px-4 py-3 font-bold"><ArrowLeft className="mr-2 inline h-4 w-4" />Voltar</button></footer>
      </motion.section>}
    </main>
  </div>
}
