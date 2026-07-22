'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowLeft, CheckCircle2, ChevronRight, ClipboardCheck, HeartPulse, Stethoscope } from 'lucide-react'
import { clsx } from 'clsx'
import type { Patient } from '@/types/patient'
import PhysicalExamForm, { type PhysicalExamData } from './PhysicalExamForm'
import { GlasgowCalculator, type GlasgowValues } from './ClinicalScaleCalculators'

export const UNIVERSAL_ASSESSMENT_ANSWER_KEY = '__avaliacao_clinica_inicial'

export type UniversalVitalSigns = {
  temperature?: number
  bloodPressure?: string
  heartRate?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  glucose?: string
  painLevel?: number
  glasgow?: number
  capillaryRefill?: number
}

export type UniversalClinicalAssessmentData = {
  savedAt: string
  sinaisVitais: UniversalVitalSigns
  exameFisico: PhysicalExamData
  glasgowDetalhes?: GlasgowValues
}

const defaultPhysicalExam = (): PhysicalExamData => ({
  generalState: 'bom',
  coloration: { status: 'corado' },
  hydration: { status: 'hidratado' },
  cyanosis: { status: 'acianotico' },
  jaundice: { status: 'anicterico' },
  temperature: { status: 'afebril' },
  respiration: { status: 'eupneico' },
  neuro: { glasgow: 15, altered: '' },
  cardiac: { altered: '' },
  pulmonary: { altered: '' },
  abdomen: { altered: '' },
  extremities: { altered: '' }
})

export const parseUniversalClinicalAssessment = (raw?: string | null): UniversalClinicalAssessmentData | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<UniversalClinicalAssessmentData>
    if (!parsed || typeof parsed !== 'object' || !parsed.sinaisVitais || !parsed.exameFisico) return null
    return parsed as UniversalClinicalAssessmentData
  } catch {
    return null
  }
}

export const summarizeUniversalPhysicalExam = (exam?: PhysicalExamData | null): string[] => {
  if (!exam) return []
  const generalState: Record<PhysicalExamData['generalState'], string> = {
    bom: 'bom estado geral',
    regular: 'estado geral regular',
    mal: 'mau estado geral',
    grave: 'estado geral grave',
    pessimo: 'estado geral crítico'
  }
  const grade = (value?: number) => value ? ` ${value}/4+` : ''
  return [
    `Estado geral: ${generalState[exam.generalState]}`,
    `Coloração: ${exam.coloration.status === 'corado' ? 'corado' : `descorado${grade(exam.coloration.grade)}`}`,
    `Hidratação: ${exam.hydration.status === 'hidratado' ? 'hidratado' : `desidratado${grade(exam.hydration.grade)}`}`,
    `Cianose: ${exam.cyanosis.status === 'acianotico' ? 'ausente' : `presente${grade(exam.cyanosis.grade)}`}`,
    `Icterícia: ${exam.jaundice.status === 'anicterico' ? 'ausente' : `presente${grade(exam.jaundice.grade)}`}`,
    `Respiração: ${exam.respiration.status === 'eupneico' ? 'eupneico' : exam.respiration.status === 'taquipneico' ? 'taquipneico' : `dispneico${grade(exam.respiration.grade)}`}`,
    `Neurológico: Glasgow ${exam.neuro.glasgow ?? 'não informado'}${exam.neuro.altered?.trim() ? `; ${exam.neuro.altered.trim()}` : ''}`,
    `Cardiovascular: ${exam.cardiac.altered?.trim() || 'sem alteração descrita'}`,
    `Pulmonar: ${exam.pulmonary.altered?.trim() || 'sem alteração descrita'}`,
    `Abdome: ${exam.abdomen.altered?.trim() || 'sem alteração descrita'}`,
    `Extremidades: ${exam.extremities.altered?.trim() || 'sem alteração descrita'}`
  ]
}

const fromPatient = (patient: Pick<Patient, 'admission'>): UniversalVitalSigns => {
  const source = patient.admission?.vitalSigns || {}
  return {
    temperature: typeof source.temperature === 'number' ? source.temperature : undefined,
    bloodPressure: typeof source.bloodPressure === 'string' ? source.bloodPressure : undefined,
    heartRate: typeof source.heartRate === 'number' ? source.heartRate : undefined,
    respiratoryRate: typeof source.respiratoryRate === 'number' ? source.respiratoryRate : undefined,
    oxygenSaturation: typeof source.oxygenSaturation === 'number' ? source.oxygenSaturation : undefined,
    glucose: source.glucose != null ? String(source.glucose) : undefined,
    painLevel: typeof source.painLevel === 'number' ? source.painLevel : undefined,
    glasgow: typeof source.glasgow === 'number' ? source.glasgow : 15,
    capillaryRefill: typeof source.capillaryRefill === 'number' ? source.capillaryRefill : undefined
  }
}

type VitalField = {
  key: keyof UniversalVitalSigns
  label: string
  unit: string
  min?: number
  max?: number
  placeholder: string
  text?: boolean
}

const vitalFields: VitalField[] = [
  { key: 'temperature', label: 'Temperatura', unit: '°C', min: 25, max: 45, placeholder: '36,5' },
  { key: 'bloodPressure', label: 'Pressão arterial', unit: 'mmHg', placeholder: '120/80', text: true },
  { key: 'heartRate', label: 'Frequência cardíaca', unit: 'bpm', min: 20, max: 250, placeholder: '80' },
  { key: 'respiratoryRate', label: 'Frequência respiratória', unit: 'irpm', min: 4, max: 80, placeholder: '18' },
  { key: 'oxygenSaturation', label: 'Saturação periférica', unit: '%', min: 50, max: 100, placeholder: '97' },
  { key: 'glucose', label: 'Glicemia capilar', unit: 'mg/dL', placeholder: '95 ou HI/LO', text: true },
  { key: 'painLevel', label: 'Escala de dor', unit: '0–10', min: 0, max: 10, placeholder: '0' },
  { key: 'capillaryRefill', label: 'Enchimento capilar', unit: 'segundos', min: 0, max: 20, placeholder: '2' }
]

interface UniversalClinicalAssessmentProps {
  patient: Pick<Patient, 'name' | 'admission'>
  flowchartName: string
  savedValue?: string
  onSave: (data: UniversalClinicalAssessmentData) => void
  onBack?: () => void
}

const UniversalClinicalAssessment: React.FC<UniversalClinicalAssessmentProps> = ({
  patient,
  flowchartName,
  savedValue,
  onSave,
  onBack
}) => {
  const saved = useMemo(() => parseUniversalClinicalAssessment(savedValue), [savedValue])
  const [stage, setStage] = useState<'vitals' | 'exam'>('vitals')
  const [vitals, setVitals] = useState<UniversalVitalSigns>(() => ({ ...fromPatient(patient), ...(saved?.sinaisVitais || {}) }))
  const [physicalExam, setPhysicalExam] = useState<PhysicalExamData>(() => saved?.exameFisico || defaultPhysicalExam())
  const [glasgowValues, setGlasgowValues] = useState<GlasgowValues>(() => saved?.glasgowDetalhes || (physicalExam.neuro.glasgow === 15 ? { eyes: 4, verbal: 5, motor: 6 } : {}))
  const [reviewed, setReviewed] = useState(false)

  const measuredCount = Object.values(vitals).filter(value => value !== undefined && value !== '').length

  const updateVital = (field: VitalField, raw: string) => {
    if (field.text) {
      setVitals(previous => ({ ...previous, [field.key]: raw || undefined }))
      return
    }
    const parsed = raw === '' ? undefined : Number(raw.replace(',', '.'))
    setVitals(previous => ({ ...previous, [field.key]: Number.isFinite(parsed) ? parsed : undefined }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-cyan-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-blue-950/10">
        <header className="bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 px-5 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                {stage === 'vitals' ? <HeartPulse className="h-7 w-7" /> : <Stethoscope className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-100">Avaliação clínica inicial</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">{stage === 'vitals' ? 'Sinais vitais' : 'Exame físico'}</h1>
                <p className="mt-1 text-sm text-blue-50">{flowchartName} · {patient.name || 'Paciente em atendimento'}</p>
              </div>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold ring-1 ring-white/25">
              {stage === 'vitals' ? '1 de 2' : '2 de 2'}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className={clsx('h-2 rounded-full', stage === 'vitals' || stage === 'exam' ? 'bg-white' : 'bg-white/25')} />
            <div className={clsx('h-2 rounded-full transition-colors', stage === 'exam' ? 'bg-white' : 'bg-white/25')} />
          </div>
        </header>

        <main className="p-5 sm:p-8">
          {stage === 'vitals' ? (
            <motion.section initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-extrabold text-blue-950">Registre o estado fisiológico de entrada</h2>
                  <p className="mt-1 text-sm text-blue-800">Campos sem medida podem ficar em branco; alterações críticas devem ser manejadas sem esperar o preenchimento da tela.</p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-blue-800 shadow-sm">{measuredCount} registrado(s)</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vitalFields.map(field => (
                  <label key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <span className="flex items-center justify-between gap-2 text-sm font-extrabold text-slate-800">
                      {field.label}
                      <span className="text-xs font-semibold text-slate-500">{field.unit}</span>
                    </span>
                    <input
                      type={field.text ? 'text' : 'number'}
                      min={field.min}
                      max={field.max}
                      step={field.key === 'temperature' || field.key === 'capillaryRefill' ? '0.1' : '1'}
                      inputMode={field.text ? 'text' : 'decimal'}
                      value={vitals[field.key] ?? ''}
                      onChange={event => updateVital(field, event.target.value)}
                      placeholder={field.placeholder}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {onBack ? (
                  <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="h-5 w-5" /> Voltar
                  </button>
                ) : <span />}
                <button type="button" onClick={() => setStage('exam')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-200 hover:shadow-xl">
                  Continuar para exame físico <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.section initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-6 w-6 shrink-0 text-cyan-700" />
                  <div>
                    <h2 className="font-extrabold text-cyan-950">Exame geral e por sistemas</h2>
                    <p className="mt-1 text-sm text-cyan-900">Selecione o padrão observado e descreva somente as alterações. O registro seguirá para o relatório clínico.</p>
                  </div>
                </div>
              </div>

              <PhysicalExamForm
                value={physicalExam}
                onChange={setPhysicalExam}
                showGlasgowInput={false}
                neurologicalAssessment={
                  <GlasgowCalculator value={glasgowValues} onChange={(next, total) => {
                    setGlasgowValues(next)
                    setPhysicalExam(previous => ({ ...previous, neuro: { ...previous.neuro, glasgow: total } }))
                  }} />
                }
              />

              <label className={clsx('mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all', reviewed ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100' : 'border-amber-300 bg-amber-50')}>
                <input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>
                  <span className="block font-extrabold text-slate-950">Revisei sinais vitais e exame físico</span>
                  <span className="mt-1 block text-sm text-slate-600">Confirmo que os dados refletem a avaliação disponível neste momento, inclusive os campos mantidos no padrão normal.</span>
                </span>
              </label>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => setStage('vitals')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
                  <ArrowLeft className="h-5 w-5" /> Revisar sinais vitais
                </button>
                <button
                  type="button"
                  disabled={!reviewed}
                  onClick={() => onSave({ savedAt: new Date().toISOString(), sinaisVitais: vitals, exameFisico: physicalExam, glasgowDetalhes: glasgowValues })}
                  className={clsx('inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-extrabold transition-all', reviewed ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl' : 'cursor-not-allowed bg-slate-100 text-slate-400')}
                >
                  <CheckCircle2 className="h-5 w-5" /> Salvar e iniciar fluxograma
                </button>
              </div>
            </motion.section>
          )}
        </main>

        <footer className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-8">
          <Activity className="h-4 w-4" /> Os dados podem ser complementados nas reavaliações específicas de cada protocolo.
        </footer>
      </div>
    </div>
  )
}

export default UniversalClinicalAssessment
