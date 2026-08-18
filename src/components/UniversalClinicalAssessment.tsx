'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowLeft, CheckCircle2, HeartPulse, Stethoscope } from 'lucide-react'
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
  extremities: { altered: '' },
  skin: { altered: '' },
  additionalInformation: ''
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
    `Estado geral: ${[
      generalState[exam.generalState],
      exam.coloration.status === 'corado' ? 'corado' : `descorado${grade(exam.coloration.grade)}`,
      exam.hydration.status === 'hidratado' ? 'hidratado' : `desidratado${grade(exam.hydration.grade)}`,
      exam.cyanosis.status === 'acianotico' ? 'acianótico' : `cianótico${grade(exam.cyanosis.grade)}`,
      exam.jaundice.status === 'anicterico' ? 'anictérico' : `ictérico${grade(exam.jaundice.grade)}`,
      exam.respiration.status === 'eupneico' ? 'eupneico' : exam.respiration.status === 'taquipneico' ? 'taquipneico' : `dispneico${grade(exam.respiration.grade)}`
    ].join(', ')}`,
    exam.neuro.notAssessed ? null : `Neurológico: ${exam.neuro.altered?.trim() || 'consciente, contactuante, pupilas isofotorreagentes'}; Glasgow ${exam.neuro.glasgow ?? 'não informado'}`,
    exam.cardiac.notAssessed ? null : `Cardíaco: ${exam.cardiac.altered?.trim() || 'ACV em ritmo cardíaco regular em dois tempos, bulhas normofonéticas, sem sopros audíveis'}`,
    exam.pulmonary.notAssessed ? null : `Pulmonar: ${exam.pulmonary.altered?.trim() || 'AP com murmúrio vesicular audível bilateralmente, sem ruídos adventícios'}`,
    exam.abdomen.notAssessed ? null : `Abdome: ${exam.abdomen.altered?.trim() || 'plano, normotenso, ruídos hidroaéreos presentes, indolor à palpação, sem massas ou visceromegalias e sem sinais de irritação peritoneal'}`,
    exam.extremities.notAssessed ? null : `Extremidades: ${exam.extremities.altered?.trim() || 'simétricas, sem deformidades; pele íntegra, sem lesões ou alterações tróficas; ausência de edema; pulsos radiais, braquiais, femorais, poplíteos, tibiais posteriores e pediosos palpáveis, normais e simétricos'}`,
    exam.skin?.notAssessed ? null : `Pele: ${exam.skin?.altered?.trim() || 'íntegra, sem lesões cutâneas aparentes'}`,
    exam.additionalInformation?.trim() ? `Informações adicionais: ${exam.additionalInformation.trim()}` : null
  ].filter((item): item is string => Boolean(item))
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
    glasgow: typeof source.glasgow === 'number' ? source.glasgow : undefined,
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
                <HeartPulse className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-100">Avaliação clínica inicial</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">Sinais vitais e exame físico</h1>
                <p className="mt-1 text-sm text-blue-50">{flowchartName} · {patient.name || 'Paciente em atendimento'}</p>
              </div>
            </div>
            <span className="hidden rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold ring-1 ring-white/25 sm:inline-flex">Uma única etapa</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-700">1</span>Sinais vitais</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-cyan-700">2</span>Exame físico</span>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <section aria-labelledby="universal-vitals-title" className="rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-white p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md shadow-blue-200"><HeartPulse className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">1 · Dados objetivos</p>
                    <h2 id="universal-vitals-title" className="mt-1 text-xl font-black text-blue-950">Sinais vitais</h2>
                    <p className="mt-1 text-sm text-blue-800">Registre primeiro o estado fisiológico de entrada. Campos sem medida podem ficar em branco.</p>
                  </div>
                </div>
                <span className="self-start whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-blue-800 shadow-sm ring-1 ring-blue-100 sm:self-auto">{measuredCount} registrado(s)</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vitalFields.map(field => (
                  <label key={field.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
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
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">Alterações críticas devem ser manejadas imediatamente, sem esperar a conclusão do preenchimento.</p>
            </section>

            <section aria-labelledby="universal-exam-title" className="rounded-3xl border border-cyan-200 bg-gradient-to-b from-cyan-50/70 to-white p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-700 text-white shadow-md shadow-cyan-200"><Stethoscope className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">2 · Avaliação por sistemas</p>
                  <h2 id="universal-exam-title" className="mt-1 text-xl font-black text-cyan-950">Exame físico</h2>
                  <p className="mt-1 text-sm text-cyan-900">Selecione o padrão observado e descreva apenas as alterações. A temperatura já foi registrada nos sinais vitais.</p>
                </div>
              </div>

              <PhysicalExamForm
                value={physicalExam}
                onChange={setPhysicalExam}
                showGlasgowInput={false}
                showTemperature={false}
                neurologicalAssessment={
                  <GlasgowCalculator value={glasgowValues} onChange={(next, total) => {
                    setGlasgowValues(next)
                    setPhysicalExam(previous => ({ ...previous, neuro: { ...previous.neuro, glasgow: total } }))
                  }} />
                }
              />
            </section>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <label className={clsx('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all', reviewed ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100' : 'border-amber-300 bg-amber-50')}>
                <input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>
                  <span className="block font-extrabold text-slate-950">Revisei sinais vitais e exame físico</span>
                  <span className="mt-1 block text-sm text-slate-600">Confirmo que os dados refletem a avaliação disponível neste momento, inclusive os campos mantidos no padrão normal.</span>
                </span>
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {onBack ? <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button> : <span />}
                <button
                  type="button"
                  disabled={!reviewed}
                  onClick={() => onSave({ savedAt: new Date().toISOString(), sinaisVitais: vitals, exameFisico: physicalExam, glasgowDetalhes: glasgowValues })}
                  className={clsx('inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-extrabold transition-all', reviewed ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl' : 'cursor-not-allowed bg-slate-100 text-slate-400')}
                >
                  <CheckCircle2 className="h-5 w-5" /> Salvar e iniciar fluxograma
                </button>
              </div>
            </div>
          </motion.div>
        </main>

        <footer className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-8">
          <Activity className="h-4 w-4" /> Os dados podem ser complementados nas reavaliações específicas de cada protocolo.
        </footer>
      </div>
    </div>
  )
}

export default UniversalClinicalAssessment
