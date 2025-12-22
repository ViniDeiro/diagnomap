'use client'

import React from 'react'
import { clsx } from 'clsx'
import { Thermometer, Activity, Brain, Heart, Stethoscope } from 'lucide-react'

export interface PhysicalExamData {
  generalState: 'bom' | 'regular' | 'mal' | 'grave' | 'pessimo'
  coloration: { status: 'corado' | 'descorado'; grade?: 1 | 2 | 3 | 4 }
  hydration: { status: 'hidratado' | 'desidratado'; grade?: 1 | 2 | 3 | 4 }
  cyanosis: { status: 'acianotico' | 'cianotico'; grade?: 1 | 2 | 3 | 4 }
  jaundice: { status: 'anicterico' | 'icterico'; grade?: 1 | 2 | 3 | 4 }
  temperature: { status: 'afebril' | 'febril'; value?: number }
  respiration: { status: 'eupneico' | 'taquipneico' | 'dispneico'; grade?: 1 | 2 | 3 | 4 }
  neuro: { glasgow?: number; altered?: string }
  cardiac: { altered?: string }
  pulmonary: { altered?: string }
  abdomen: { altered?: string }
  extremities: { altered?: string }
}

interface PhysicalExamFormProps {
  value: PhysicalExamData
  onChange: (v: PhysicalExamData) => void
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

const PhysicalExamForm: React.FC<PhysicalExamFormProps> = ({ value, onChange }) => {
  const update = <K extends keyof PhysicalExamData>(key: K, patch: Partial<PhysicalExamData[K]>) => {
    const current = value[key]
    // @ts-expect-error dynamic merge
    onChange({ ...value, [key]: { ...current, ...patch } })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="grid md:grid-cols-3 gap-4">
          <div>
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
          </div>
          <div className="md:col-span-2">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <SectionTitle icon={<Heart className="w-5 h-5" />} title="Cardíaco" />
          <p className="text-sm text-slate-600 mb-2">Padrão: Bulhas rítmicas, normofonéticas, sem sopros audíveis.</p>
          <textarea
            value={value.cardiac.altered ?? ''}
            onChange={(e) => update('cardiac', { altered: e.target.value })}
            placeholder="Descreva alterações cardíacas (sopros, arritmias, etc.)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <SectionTitle icon={<Activity className="w-5 h-5" />} title="Pulmonar" />
          <p className="text-sm text-slate-600 mb-2">Padrão: Murmúrio vesicular presente, sem ruídos adventícios.</p>
          <textarea
            value={value.pulmonary.altered ?? ''}
            onChange={(e) => update('pulmonary', { altered: e.target.value })}
            placeholder="Descreva alterações pulmonares (sibilos, estertores, etc.)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <SectionTitle icon={<Stethoscope className="w-5 h-5" />} title="Abdome" />
          <p className="text-sm text-slate-600 mb-2">Padrão: Plano, normotenso, ruídos hidro-aéreos presentes, sem alterações, sem sinais de irritação peritoneal.</p>
          <textarea
            value={value.abdomen.altered ?? ''}
            onChange={(e) => update('abdomen', { altered: e.target.value })}
            placeholder="Descreva alterações abdominais"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <SectionTitle icon={<Activity className="w-5 h-5" />} title="Extremidades" />
          <p className="text-sm text-slate-600 mb-2">Padrão: Pulsos periféricos simétricos, sem alterações. Sem empastamentos. Enchimento capilar normal, perfusão periférica preservada.</p>
          <textarea
            value={value.extremities.altered ?? ''}
            onChange={(e) => update('extremities', { altered: e.target.value })}
            placeholder="Descreva alterações em extremidades"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  )
}

export default PhysicalExamForm
