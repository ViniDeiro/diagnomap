'use client'

import React, { useState } from 'react'
import { ImageIcon } from 'lucide-react'

export const UNIVERSAL_IMAGING_RESULTS_KEY = '__universal_imaging_results'

export type ImagingStudyStatus = '' | 'solicitado' | 'pendente' | 'realizado' | 'indisponivel'

export type UniversalImagingRecord = {
  chestXrayStatus: ImagingStudyStatus
  chestXrayReport: string
  chestXrayImpression: string
  chestCtStatus: ImagingStudyStatus
  chestCtReport: string
  chestCtImpression: string
  lungUltrasoundStatus: ImagingStudyStatus
  lungUltrasoundReport: string
  lungUltrasoundImpression: string
  lungUltrasoundScore: string
  notes: string
}

const emptyRecord: UniversalImagingRecord = {
  chestXrayStatus: '',
  chestXrayReport: '',
  chestXrayImpression: '',
  chestCtStatus: '',
  chestCtReport: '',
  chestCtImpression: '',
  lungUltrasoundStatus: '',
  lungUltrasoundReport: '',
  lungUltrasoundImpression: '',
  lungUltrasoundScore: '',
  notes: ''
}

export const parseUniversalImagingRecord = (raw?: string | null): UniversalImagingRecord => {
  if (!raw) return emptyRecord
  try {
    const parsed = JSON.parse(raw) as Partial<UniversalImagingRecord>
    return {
      ...emptyRecord,
      ...parsed,
      lungUltrasoundScore: parsed.lungUltrasoundScore == null ? '' : String(parsed.lungUltrasoundScore)
    }
  } catch {
    return emptyRecord
  }
}

type Props = { value?: string; onChange: (value: string) => void; title?: string }
type ImagingTabKey = 'xray' | 'ct' | 'ultrasound'

const imagingTabs = [
  {
    key: 'xray' as const,
    label: 'RX',
    fullLabel: 'Radiografia de tórax',
    statusKey: 'chestXrayStatus' as const,
    impressionKey: 'chestXrayImpression' as const,
    reportKey: 'chestXrayReport' as const,
    impressionPlaceholder: 'Ex.: consolidação em base direita'
  },
  {
    key: 'ct' as const,
    label: 'TC',
    fullLabel: 'Tomografia de tórax',
    statusKey: 'chestCtStatus' as const,
    impressionKey: 'chestCtImpression' as const,
    reportKey: 'chestCtReport' as const,
    impressionPlaceholder: 'Ex.: opacidades em vidro fosco bilaterais'
  },
  {
    key: 'ultrasound' as const,
    label: 'US pulmonar',
    fullLabel: 'Ultrassom pulmonar',
    statusKey: 'lungUltrasoundStatus' as const,
    impressionKey: 'lungUltrasoundImpression' as const,
    reportKey: 'lungUltrasoundReport' as const,
    impressionPlaceholder: 'Ex.: linhas B confluentes e consolidação subpleural'
  }
]

const statusOptions: Array<{ value: ImagingStudyStatus; label: string }> = [
  { value: '', label: 'Selecione' },
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'pendente', label: 'Aguardando resultado' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'indisponivel', label: 'Indisponível no serviço' }
]

export default function UniversalImagingNotebook({ value, onChange, title = 'Exames de imagem' }: Props) {
  const [activeTab, setActiveTab] = useState<ImagingTabKey>('xray')
  const record = parseUniversalImagingRecord(value)
  const activeStudy = imagingTabs.find((tab) => tab.key === activeTab) || imagingTabs[0]
  const update = (patch: Partial<UniversalImagingRecord>) => onChange(JSON.stringify({ ...record, ...patch, updatedAt: new Date().toISOString() }))
  const lusScore = record.lungUltrasoundScore.trim()
  const lusScoreNumber = lusScore === '' ? null : Number(lusScore)
  const invalidLusScore = lusScoreNumber !== null && (!Number.isFinite(lusScoreNumber) || lusScoreNumber < 0 || lusScoreNumber > 36)

  const tabHasData = (tab: typeof imagingTabs[number]) => Boolean(
    record[tab.statusKey]
    || record[tab.impressionKey].trim()
    || record[tab.reportKey].trim()
    || (tab.key === 'ultrasound' && record.lungUltrasoundScore.trim())
  )

  return <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
    <header className="flex items-center gap-3 border-b border-sky-100 bg-sky-50 p-4 sm:p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-700 text-white"><ImageIcon className="h-5 w-5" /></span>
      <div><h3 className="font-extrabold text-slate-950">{title}</h3><p className="text-sm text-slate-600">Registre solicitação, disponibilidade e resultado de RX, TC e ultrassom pulmonar.</p></div>
    </header>

    <div className="border-b border-slate-200 bg-slate-50 px-4 pt-4 sm:px-5" role="tablist" aria-label="Modalidade do exame de imagem">
      <div className="flex gap-2 overflow-x-auto">
        {imagingTabs.map((tab) => {
          const selected = tab.key === activeTab
          return <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => setActiveTab(tab.key)}
            className={`relative min-w-fit rounded-t-xl border border-b-0 px-4 py-2.5 text-sm font-bold transition-colors ${selected ? 'border-sky-300 bg-white text-sky-800' : 'border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900'}`}
          >
            {tab.label}
            {tabHasData(tab) && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" aria-label="Possui registro" />}
          </button>
        })}
      </div>
    </div>

    <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2" role="tabpanel">
      <label className="text-sm font-bold text-slate-700">
        Situação — {activeStudy.fullLabel}
        <select
          value={record[activeStudy.statusKey]}
          onChange={(event) => update({ [activeStudy.statusKey]: event.target.value as ImagingStudyStatus })}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
        >
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label className="text-sm font-bold text-slate-700">
        Impressão diagnóstica
        <input
          value={record[activeStudy.impressionKey]}
          onChange={(event) => update({ [activeStudy.impressionKey]: event.target.value })}
          placeholder={activeStudy.impressionPlaceholder}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>

      {activeStudy.key === 'ultrasound' && <div className="md:col-span-2 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <label className="text-sm font-bold text-violet-950">
          Escore LUS — protocolo de 12 zonas (0–36)
          <input
            type="number"
            min={0}
            max={36}
            step={1}
            value={record.lungUltrasoundScore}
            onChange={(event) => update({ lungUltrasoundScore: event.target.value })}
            placeholder="0"
            aria-invalid={invalidLusScore}
            className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 ${invalidLusScore ? 'border-red-400 focus:ring-red-200' : 'border-violet-300'}`}
          />
        </label>
        <p className={`mt-2 text-xs ${invalidLusScore ? 'font-bold text-red-700' : 'text-violet-800'}`}>
          {invalidLusScore
            ? 'Informe um total entre 0 e 36.'
            : 'Somar o pior padrão de cada zona: 0 = linhas A; 1 = linhas B separadas; 2 = linhas B confluentes; 3 = consolidação. Interpretar junto ao quadro clínico e à evolução.'}
        </p>
      </div>}

      <label className="text-sm font-bold text-slate-700 md:col-span-2">
        Resultado/laudo
        <textarea
          value={record[activeStudy.reportKey]}
          onChange={(event) => update({ [activeStudy.reportKey]: event.target.value })}
          rows={4}
          placeholder={`Transcreva os achados relevantes de ${activeStudy.fullLabel.toLowerCase()}`}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>

      <label className="text-sm font-bold text-slate-700 md:col-span-2">
        Observações e pendências dos exames de imagem
        <textarea
          value={record.notes}
          onChange={(event) => update({ notes: event.target.value })}
          rows={2}
          placeholder="Horário, comparação, exame pendente ou necessidade de reavaliação"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>
    </div>
  </section>
}
