'use client'

import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Thermometer, Activity, Brain, Heart, Stethoscope, Camera, ShieldCheck, X } from 'lucide-react'

export interface PhysicalExamData {
  generalState: 'bom' | 'regular' | 'mal' | 'grave' | 'pessimo'
  coloration: { status: 'corado' | 'descorado'; grade?: 1 | 2 | 3 | 4 }
  hydration: { status: 'hidratado' | 'desidratado'; grade?: 1 | 2 | 3 | 4 }
  cyanosis: { status: 'acianotico' | 'cianotico'; grade?: 1 | 2 | 3 | 4 }
  jaundice: { status: 'anicterico' | 'icterico'; grade?: 1 | 2 | 3 | 4 }
  temperature: { status: 'afebril' | 'febril'; value?: number }
  respiration: { status: 'eupneico' | 'taquipneico' | 'dispneico'; grade?: 1 | 2 | 3 | 4 }
  neuro: { glasgow?: number; altered?: string; notAssessed?: boolean }
  cardiac: { altered?: string; notAssessed?: boolean }
  pulmonary: { altered?: string; notAssessed?: boolean }
  abdomen: { altered?: string; notAssessed?: boolean }
  extremities: { altered?: string; notAssessed?: boolean }
  skin?: { altered?: string; notAssessed?: boolean }
  additionalInformation?: string
}

interface PhysicalExamFormProps {
  value: PhysicalExamData
  onChange: (v: PhysicalExamData) => void
  showGlasgowInput?: boolean
  neurologicalAssessment?: React.ReactNode
}

const grades: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4]

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center space-x-3 mb-4">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-slate-700 text-white flex items-center justify-center shadow-md">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-slate-600 text-sm">{subtitle}</p>}
    </div>
  </div>
)

const ExamSection: React.FC<{
  icon: React.ReactNode
  title: string
  standardText: string
  value?: string
  notAssessed?: boolean
  onChange: (val: string) => void
  onNotAssessedChange: (value: boolean) => void
  placeholder: string
}> = ({ icon, title, standardText, value, notAssessed, onChange, onNotAssessedChange, placeholder }) => {
  const [mode, setMode] = useState<'normal' | 'abnormal' | 'not_assessed'>(
    notAssessed ? 'not_assessed' : (value && value.length > 0) ? 'abnormal' : 'normal'
  )

  useEffect(() => {
    if (notAssessed) setMode('not_assessed')
    else if (value && value.length > 0) {
      setMode('abnormal')
    }
  }, [notAssessed, value])

  const handleModeChange = (newMode: 'normal' | 'abnormal' | 'not_assessed') => {
    setMode(newMode)
    onNotAssessedChange(newMode === 'not_assessed')
    if (newMode !== 'abnormal') {
      onChange('')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <SectionTitle icon={icon} title={title} />
      
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={clsx(
            "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
            mode === 'normal' ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white group-hover:border-blue-400"
          )}>
            {mode === 'normal' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <input 
            type="radio" 
            className="hidden"
            checked={mode === 'normal'} 
            onChange={() => handleModeChange('normal')}
          />
          <span className={clsx("font-medium transition-colors", mode === 'normal' ? "text-blue-700" : "text-slate-600 group-hover:text-slate-800")}>Normal</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={clsx(
            "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
            mode === 'abnormal' ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white group-hover:border-blue-400"
          )}>
            {mode === 'abnormal' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <input 
            type="radio" 
            className="hidden"
            checked={mode === 'abnormal'} 
            onChange={() => handleModeChange('abnormal')}
          />
          <span className={clsx("font-medium transition-colors", mode === 'abnormal' ? "text-blue-700" : "text-slate-600 group-hover:text-slate-800")}>Anormal</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="radio" checked={mode === 'not_assessed'} onChange={() => handleModeChange('not_assessed')} />
          <span className={clsx("font-medium", mode === 'not_assessed' ? "text-slate-900" : "text-slate-600")}>Não avaliado</span>
        </label>
      </div>

      {mode === 'not_assessed' ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
          Este sistema será omitido da evolução clínica.
        </div>
      ) : mode === 'normal' ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
          <span className="font-semibold text-slate-700">Padrão:</span> {standardText}
        </div>
      ) : (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          autoFocus
        />
      )}
    </div>
  )
}

const PhysicalExamForm: React.FC<PhysicalExamFormProps> = ({ value, onChange, showGlasgowInput = true, neurologicalAssessment }) => {
  const [photoGuidanceOpen, setPhotoGuidanceOpen] = useState(false)
  const update = <K extends keyof PhysicalExamData>(key: K, patch: Partial<PhysicalExamData[K]>) => {
    const current = value[key]
    // @ts-expect-error dynamic merge
    onChange({ ...value, [key]: { ...current, ...patch } })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md"><Camera className="h-5 w-5" /></div>
            <div>
              <h3 className="font-extrabold text-slate-950">Imagem clínica do achado físico</h3>
              <p className="mt-1 text-sm text-slate-600">Recurso previsto para documentar achados relevantes no prontuário, com finalidade assistencial e consentimento.</p>
            </div>
          </div>
          <button type="button" onClick={() => setPhotoGuidanceOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 font-bold text-blue-800 transition hover:bg-blue-100">
            <Camera className="h-4 w-4" /> Registrar imagem
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Stethoscope className="w-5 h-5" />} title="Estado Geral" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { v: 'bom', label: 'Bom estado geral' },
            { v: 'regular', label: 'Regular estado geral' },
            { v: 'mal', label: 'Mal estado geral' },
            { v: 'grave', label: 'Grave estado geral' },
            { v: 'pessimo', label: 'Péssimo estado geral' }
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange({ ...value, generalState: opt.v as PhysicalExamData['generalState'] })}
              className={clsx(
                'p-3 rounded-xl border-2 text-left font-medium transition-all',
                value.generalState === opt.v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Heart className="w-5 h-5" />} title="Coloração" />
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => update('coloration', { status: 'corado', grade: undefined })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.coloration.status === 'corado' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Corado
          </button>
          <button
            type="button"
            onClick={() => update('coloration', { status: 'descorado', grade: value.coloration.grade ?? 1 })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.coloration.status === 'descorado' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Descorado
          </button>
          {value.coloration.status === 'descorado' && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-slate-600">Grau:</span>
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update('coloration', { grade: g })}
                  className={clsx(
                    'px-3 py-1 rounded-lg border text-sm',
                    value.coloration.grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
                  )}
                >
                  {g}/4+
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Activity className="w-5 h-5" />} title="Hidratação" />
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => update('hydration', { status: 'hidratado', grade: undefined })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.hydration.status === 'hidratado' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Hidratado
          </button>
          <button
            type="button"
            onClick={() => update('hydration', { status: 'desidratado', grade: value.hydration.grade ?? 1 })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.hydration.status === 'desidratado' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Desidratado
          </button>
          {value.hydration.status === 'desidratado' && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-slate-600">Grau:</span>
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update('hydration', { grade: g })}
                  className={clsx(
                    'px-3 py-1 rounded-lg border text-sm',
                    value.hydration.grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
                  )}
                >
                  {g}/4+
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Activity className="w-5 h-5" />} title="Cianose" />
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => update('cyanosis', { status: 'acianotico', grade: undefined })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.cyanosis.status === 'acianotico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Acianótico
          </button>
          <button
            type="button"
            onClick={() => update('cyanosis', { status: 'cianotico', grade: value.cyanosis.grade ?? 1 })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.cyanosis.status === 'cianotico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Cianótico
          </button>
          {value.cyanosis.status === 'cianotico' && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-slate-600">Grau:</span>
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update('cyanosis', { grade: g })}
                  className={clsx(
                    'px-3 py-1 rounded-lg border text-sm',
                    value.cyanosis.grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
                  )}
                >
                  {g}/4+
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Activity className="w-5 h-5" />} title="Icterícia" />
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => update('jaundice', { status: 'anicterico', grade: undefined })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.jaundice.status === 'anicterico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Anictérico
          </button>
          <button
            type="button"
            onClick={() => update('jaundice', { status: 'icterico', grade: value.jaundice.grade ?? 1 })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.jaundice.status === 'icterico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Ictérico
          </button>
          {value.jaundice.status === 'icterico' && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-slate-600">Grau:</span>
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update('jaundice', { grade: g })}
                  className={clsx(
                    'px-3 py-1 rounded-lg border text-sm',
                    value.jaundice.grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
                  )}
                >
                  {g}/4+
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Thermometer className="w-5 h-5" />} title="Temperatura" />
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => onChange({ ...value, temperature: { status: 'afebril', value: value.temperature.value } })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.temperature.status === 'afebril' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Afebril
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, temperature: { status: 'febril', value: value.temperature.value } })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.temperature.status === 'febril' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Febril
          </button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-slate-600">T:</span>
            <input
              type="number"
              value={value.temperature.value ?? ''}
              onChange={(e) => onChange({ ...value, temperature: { ...value.temperature, value: parseFloat(e.target.value) || undefined } })}
              className="w-28 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              step={0.1}
              min={30}
              max={45}
              placeholder="Ex: 38.5"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <SectionTitle icon={<Activity className="w-5 h-5" />} title="Respiração" />
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => onChange({ ...value, respiration: { status: 'eupneico' } })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.respiration.status === 'eupneico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Eupneico
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, respiration: { status: 'taquipneico' } })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.respiration.status === 'taquipneico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Taquipnéico
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, respiration: { status: 'dispneico', grade: value.respiration.grade ?? 1 } })}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 font-medium',
              value.respiration.status === 'dispneico' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
            )}
          >
            Dispnéico
          </button>
          {value.respiration.status === 'dispneico' && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-slate-600">Grau:</span>
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChange({ ...value, respiration: { status: 'dispneico', grade: g } })}
                  className={clsx(
                    'px-3 py-1 rounded-lg border text-sm',
                    value.respiration.grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50'
                  )}
                >
                  {g}/4+
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 lg:col-span-2">
        <SectionTitle icon={<Brain className="w-5 h-5" />} title="Neurológico" subtitle="Glasgow e achados" />
        <div className="mb-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={!value.neuro.notAssessed} onChange={() => update('neuro', { notAssessed: false })} /> Avaliado</label>
          <label className="flex items-center gap-2"><input type="radio" checked={Boolean(value.neuro.notAssessed)} onChange={() => update('neuro', { notAssessed: true, glasgow: undefined, altered: '' })} /> Não avaliado</label>
        </div>
        {value.neuro.notAssessed ? <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">O exame neurológico será omitido da evolução clínica.</p> : <>
        {neurologicalAssessment && <div className="mb-5">{neurologicalAssessment}</div>}
        <div className="grid md:grid-cols-3 gap-4">
          {showGlasgowInput && <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Glasgow (3–15)</label>
            <input
              type="number"
              value={value.neuro.glasgow ?? ''}
              onChange={(e) => update('neuro', { glasgow: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              min={3}
              max={15}
              placeholder="Ex: 15"
            />
          </div>}
          <div className={showGlasgowInput ? 'md:col-span-2' : 'md:col-span-3'}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Alterado</label>
            <textarea
              value={value.neuro.altered ?? ''}
              onChange={(e) => update('neuro', { altered: e.target.value })}
              placeholder="Descreva alterações neurológicas, consciência, pupilas, etc."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">Se vazio, assume: Consciente, contactuante, Pupilas iso-foto reagentes.</p>
          </div>
        </div>
        </>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
        <ExamSection
          icon={<Heart className="w-5 h-5" />}
          title="Cardíaco"
          standardText="ACV: ritmo cardíaco regular em dois tempos, bulhas normofonéticas, sem sopros audíveis."
          value={value.cardiac.altered}
          notAssessed={value.cardiac.notAssessed}
          onChange={(v) => update('cardiac', { altered: v })}
          onNotAssessedChange={(notAssessed) => update('cardiac', { notAssessed })}
          placeholder="Descreva alterações cardíacas (sopros, arritmias, etc.)"
        />

        <ExamSection
          icon={<Activity className="w-5 h-5" />}
          title="Pulmonar"
          standardText="AP: murmúrio vesicular audível bilateralmente, sem ruídos adventícios."
          value={value.pulmonary.altered}
          notAssessed={value.pulmonary.notAssessed}
          onChange={(v) => update('pulmonary', { altered: v })}
          onNotAssessedChange={(notAssessed) => update('pulmonary', { notAssessed })}
          placeholder="Descreva alterações pulmonares (sibilos, estertores, etc.)"
        />

        <ExamSection
          icon={<Stethoscope className="w-5 h-5" />}
          title="Abdome"
          standardText="Plano, normotenso, ruídos hidroaéreos presentes, indolor à palpação, sem massas ou visceromegalias e sem sinais de irritação peritoneal."
          value={value.abdomen.altered}
          notAssessed={value.abdomen.notAssessed}
          onChange={(v) => update('abdomen', { altered: v })}
          onNotAssessedChange={(notAssessed) => update('abdomen', { notAssessed })}
          placeholder="Descreva alterações abdominais"
        />

        <ExamSection
          icon={<Activity className="w-5 h-5" />}
          title="Extremidades"
          standardText="Simétricas, sem deformidades. Pele íntegra, sem lesões ou alterações tróficas. Ausência de edema. Pulsos radiais, braquiais, femorais, poplíteos, tibiais posteriores e pediosos palpáveis, normais e simétricos."
          value={value.extremities.altered}
          notAssessed={value.extremities.notAssessed}
          onChange={(v) => update('extremities', { altered: v })}
          onNotAssessedChange={(notAssessed) => update('extremities', { notAssessed })}
          placeholder="Descreva alterações em extremidades"
        />

        <ExamSection
          icon={<Stethoscope className="w-5 h-5" />}
          title="Pele"
          standardText="Pele íntegra, sem lesões cutâneas aparentes."
          value={value.skin?.altered}
          notAssessed={value.skin?.notAssessed}
          onChange={(v) => onChange({ ...value, skin: { ...(value.skin || {}), altered: v } })}
          onNotAssessedChange={(notAssessed) => onChange({ ...value, skin: { ...(value.skin || {}), notAssessed } })}
          placeholder="Descreva lesões, erupções, equimoses, úlceras, alterações de temperatura, umidade ou outras alterações cutâneas"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <SectionTitle
          icon={<Stethoscope className="h-5 w-5" />}
          title="Informações adicionais"
          subtitle="Registre outros achados relevantes do exame físico"
        />
        <textarea
          value={value.additionalInformation ?? ''}
          onChange={(event) => onChange({ ...value, additionalInformation: event.target.value })}
          placeholder="Inclua aqui achados que não se enquadram nos sistemas acima, limitações do exame ou observações complementares."
          rows={4}
          className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      {photoGuidanceOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-4" role="dialog" aria-modal="true" aria-labelledby="clinical-photo-title">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-gradient-to-r from-blue-700 to-cyan-700 p-5 text-white">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">Funcionalidade em construção</p><h3 id="clinical-photo-title" className="mt-1 text-xl font-black">Registro de imagem clínica</h3></div>
              <button type="button" onClick={() => setPhotoGuidanceOpen(false)} aria-label="Fechar orientação" className="rounded-full bg-white/15 p-2 hover:bg-white/25"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6 text-sm leading-relaxed text-slate-700">
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Nesta versão não há captura nem envio de arquivos.</strong> A tela antecipa a futura integração segura com o prontuário.</p></div>
              <p>Quando disponibilizado, o recurso deverá ser usado somente para um achado clinicamente relevante, com finalidade documentada, ciência do paciente ou responsável e respeito às regras institucionais e à LGPD.</p>
              <ul className="list-disc space-y-2 pl-5"><li>Registrar apenas a imagem mínima necessária e vinculá-la ao atendimento correto.</li><li>Não utilizar aparelho pessoal, mensageiros ou armazenamento fora do prontuário autorizado.</li><li>Descrever o achado no exame físico: a fotografia será complementar e não substituirá o registro escrito.</li><li>Restringir acesso, exportação e retenção conforme política de segurança da instituição.</li></ul>
              <button type="button" onClick={() => setPhotoGuidanceOpen(false)} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-extrabold text-white hover:bg-blue-800">Entendi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhysicalExamForm
