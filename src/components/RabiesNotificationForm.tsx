'use client'

import React, { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, ClipboardList, Info } from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyPatient } from '@/types/emergency'

export type RabiesNotificationData = {
  notificationNumber?: string
  notificationDate?: string
  attendanceDate?: string
  notifyingState?: string
  notifyingCity?: string
  notifyingUnit?: string
  notifyingUnitCode?: string
  motherName?: string
  susCard?: string
  raceColor?: string
  education?: string
  occupation?: string
  residenceState?: string
  residenceCity?: string
  district?: string
  neighborhood?: string
  street?: string
  addressNumber?: string
  complement?: string
  referencePoint?: string
  postalCode?: string
  phone?: string
  zone?: string
  exposureTypes?: string[]
  exposureLocations?: string[]
  woundCount?: string
  woundTypes?: string[]
  exposureDate?: string
  previousRabiesTreatment?: string
  previousTreatmentType?: string[]
  previousCompletion?: string
  previousDoses?: string
  animalSpecies?: string
  otherAnimalSpecies?: string
  animalCondition?: string
  animalObservable?: string
  treatmentIndicated?: string
  vaccineManufacturer?: string
  vaccineOtherManufacturer?: string
  vaccineLot?: string
  vaccineExpiration?: string
  vaccineDates?: string[]
  animalFinalCondition?: string
  treatmentInterrupted?: string
  interruptionReason?: string
  patientSearchedAfterAbandonment?: string
  vaccineAdverseEvent?: string
  serumIndicated?: string
  serumWeightKg?: string
  serumAmountMl?: string
  serumType?: string
  serumInfiltration?: string
  serumInfiltrationExtent?: string
  serumManufacturer?: string
  serumOtherManufacturer?: string
  serumBatch?: string
  serumAdverseEvent?: string
  closureDate?: string
  observations?: string
  investigatorUnit?: string
  investigatorName?: string
  investigatorRole?: string
}

type Props = {
  patient: EmergencyPatient
  value?: RabiesNotificationData
  outcome: 'vaccine' | 'vaccine_serum'
  onChange: (value: RabiesNotificationData) => void
}

const sections = [
  ['notification', 'Notificação e atendimento'],
  ['individual', 'Identificação complementar'],
  ['residence', 'Residência e contato'],
  ['exposure', 'Exposição e animal'],
  ['treatment', 'Tratamento atual'],
  ['closure', 'Acompanhamento e encerramento']
] as const

const requiredKeys: Array<keyof RabiesNotificationData> = [
  'notificationDate', 'attendanceDate', 'notifyingCity', 'notifyingUnit',
  'exposureDate', 'exposureTypes', 'exposureLocations', 'woundTypes',
  'animalSpecies', 'animalCondition', 'treatmentIndicated'
]

const TextField = ({ label, value, onChange, type = 'text', required = false, placeholder }: { label: string; value?: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) => <label className="block text-sm font-bold text-slate-800">{label}{required && <span className="ml-1 text-red-600">*</span>}<input type={type} value={value || ''} placeholder={placeholder} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-medium text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>

const SelectField = ({ label, value, onChange, options, required = false }: { label: string; value?: string; onChange: (value: string) => void; options: Array<[string, string]>; required?: boolean }) => <label className="block text-sm font-bold text-slate-800">{label}{required && <span className="ml-1 text-red-600">*</span>}<select value={value || ''} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">Selecione</option>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>

const MultiChoice = ({ label, values = [], options, onChange, required = false }: { label: string; values?: string[]; options: Array<[string, string]>; onChange: (values: string[]) => void; required?: boolean }) => <fieldset><legend className="text-sm font-bold text-slate-800">{label}{required && <span className="ml-1 text-red-600">*</span>}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{options.map(([id, text]) => { const selected = values.includes(id); return <button key={id} type="button" aria-pressed={selected} onClick={() => onChange(selected ? values.filter(item => item !== id) : [...values, id])} className={clsx('flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition', selected ? 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-100' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300')}><span className={clsx('flex h-5 w-5 shrink-0 items-center justify-center rounded border', selected ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 text-transparent')}><CheckCircle2 className="h-3.5 w-3.5" /></span>{text}</button> })}</div></fieldset>

export const isRabiesNotificationCoreComplete = (data?: RabiesNotificationData) => requiredKeys.every(key => {
  const value = data?.[key]
  return Array.isArray(value) ? value.length > 0 : Boolean(value)
})

const RabiesNotificationForm: React.FC<Props> = ({ patient, value = {}, outcome, onChange }) => {
  const [open, setOpen] = useState<string>('notification')
  const patch = (next: Partial<RabiesNotificationData>) => onChange({ ...value, ...next })
  const completedRequired = useMemo(() => requiredKeys.filter(key => {
    const item = value[key]
    return Array.isArray(item) ? item.length > 0 : Boolean(item)
  }).length, [value])
  const progress = Math.round((completedRequired / requiredKeys.length) * 100)
  const vaccineDates = value.vaccineDates || ['', '', '', '', '']

  const sectionBody = (id: string) => {
    if (id === 'notification') return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><TextField label="Número da notificação" value={value.notificationNumber} onChange={notificationNumber => patch({ notificationNumber })} /><TextField required type="date" label="Data da notificação" value={value.notificationDate} onChange={notificationDate => patch({ notificationDate })} /><TextField required type="date" label="Data do atendimento" value={value.attendanceDate} onChange={attendanceDate => patch({ attendanceDate })} /><TextField label="UF notificadora" value={value.notifyingState} onChange={notifyingState => patch({ notifyingState })} placeholder="Ex.: SP" /><TextField required label="Município de notificação" value={value.notifyingCity} onChange={notifyingCity => patch({ notifyingCity })} /><TextField required label="Unidade notificadora" value={value.notifyingUnit} onChange={notifyingUnit => patch({ notifyingUnit })} /><TextField label="Código da unidade" value={value.notifyingUnitCode} onChange={notifyingUnitCode => patch({ notifyingUnitCode })} /></div>

    if (id === 'individual') return <div className="space-y-4"><div className="grid gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 md:grid-cols-3"><div><span className="text-xs font-black uppercase text-blue-700">Paciente</span><strong className="mt-1 block text-slate-950">{patient.name}</strong></div><div><span className="text-xs font-black uppercase text-blue-700">Nascimento / idade</span><strong className="mt-1 block text-slate-950">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'Não informado'} · {patient.age ?? '—'} anos</strong></div><div><span className="text-xs font-black uppercase text-blue-700">Prontuário</span><strong className="mt-1 block text-slate-950">{patient.medicalRecord || 'Não informado'}</strong></div></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><TextField label="Nome da mãe" value={value.motherName} onChange={motherName => patch({ motherName })} /><TextField label="Cartão SUS" value={value.susCard} onChange={susCard => patch({ susCard })} /><SelectField label="Raça/cor" value={value.raceColor} onChange={raceColor => patch({ raceColor })} options={[["white","Branca"],["black","Preta"],["yellow","Amarela"],["brown","Parda"],["indigenous","Indígena"],["ignored","Ignorado"]]} /><TextField label="Escolaridade" value={value.education} onChange={education => patch({ education })} /><TextField label="Ocupação" value={value.occupation} onChange={occupation => patch({ occupation })} /></div></div>

    if (id === 'residence') return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><TextField label="UF de residência" value={value.residenceState} onChange={residenceState => patch({ residenceState })} /><TextField label="Município" value={value.residenceCity} onChange={residenceCity => patch({ residenceCity })} /><TextField label="Distrito" value={value.district} onChange={district => patch({ district })} /><TextField label="Bairro" value={value.neighborhood} onChange={neighborhood => patch({ neighborhood })} /><TextField label="Logradouro" value={value.street} onChange={street => patch({ street })} /><TextField label="Número" value={value.addressNumber} onChange={addressNumber => patch({ addressNumber })} /><TextField label="Complemento" value={value.complement} onChange={complement => patch({ complement })} /><TextField label="Ponto de referência" value={value.referencePoint} onChange={referencePoint => patch({ referencePoint })} /><TextField label="CEP" value={value.postalCode} onChange={postalCode => patch({ postalCode })} /><TextField label="Telefone" value={value.phone} onChange={phone => patch({ phone })} /><SelectField label="Zona" value={value.zone} onChange={zone => patch({ zone })} options={[["urban","Urbana"],["rural","Rural"],["periurban","Periurbana"],["ignored","Ignorado"]]} /></div>

    if (id === 'exposure') return <div className="space-y-5"><MultiChoice required label="Tipo de exposição ao vírus rábico" values={value.exposureTypes} onChange={exposureTypes => patch({ exposureTypes })} options={[["indirect","Contato indireto"],["scratch","Arranhadura"],["lick","Lambedura"],["bite","Mordedura"],["other","Outro"]]} /><MultiChoice required label="Localização da exposição" values={value.exposureLocations} onChange={exposureLocations => patch({ exposureLocations })} options={[["mucosa","Mucosa"],["head_neck","Cabeça/pescoço"],["hands_feet","Mãos/pés"],["trunk","Tronco"],["upper_limbs","Membros superiores"],["lower_limbs","Membros inferiores"]]} /><div className="grid gap-4 md:grid-cols-3"><SelectField label="Número de ferimentos" value={value.woundCount} onChange={woundCount => patch({ woundCount })} options={[["single","Único"],["multiple","Múltiplos"],["none","Sem ferimento"],["ignored","Ignorado"]]} /><div className="md:col-span-2"><MultiChoice required label="Tipo de ferimento" values={value.woundTypes} onChange={woundTypes => patch({ woundTypes })} options={[["deep","Profundo"],["superficial","Superficial"],["lacerating","Dilacerante"],["none","Sem ferimento"]]} /></div><TextField required type="date" label="Data da exposição" value={value.exposureDate} onChange={exposureDate => patch({ exposureDate })} /><SelectField label="Tratamento antirrábico anterior" value={value.previousRabiesTreatment} onChange={previousRabiesTreatment => patch({ previousRabiesTreatment })} options={[["yes","Sim"],["no","Não"],["ignored","Ignorado"]]} /><TextField label="Doses aplicadas anteriormente" value={value.previousDoses} onChange={previousDoses => patch({ previousDoses })} /></div><div className="grid gap-4 md:grid-cols-3"><SelectField required label="Espécie do animal" value={value.animalSpecies} onChange={animalSpecies => patch({ animalSpecies })} options={[["dog","Canina"],["cat","Felina"],["bat","Quiróptera/morcego"],["primate","Primata"],["fox","Raposa"],["economic","Herbívoro doméstico"],["other","Outra"]]} />{value.animalSpecies === 'other' && <TextField label="Outra espécie" value={value.otherAnimalSpecies} onChange={otherAnimalSpecies => patch({ otherAnimalSpecies })} />}<SelectField required label="Condição do animal" value={value.animalCondition} onChange={animalCondition => patch({ animalCondition })} options={[["healthy","Sadio"],["suspect","Suspeito"],["rabid","Raivoso"],["dead_missing","Morto/desaparecido"]]} /><SelectField label="Passível de observação (cão/gato)" value={value.animalObservable} onChange={animalObservable => patch({ animalObservable })} options={[["yes","Sim"],["no","Não"]]} /></div></div>

    if (id === 'treatment') return <div className="space-y-5"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><span className="text-xs font-black uppercase text-emerald-700">Tratamento indicado pelo fluxo</span><strong className="mt-1 block text-lg text-emerald-950">{outcome === 'vaccine_serum' ? 'Vacina + soro/imunoglobulina' : 'Vacina'}</strong></div><SelectField required label="Tratamento indicado na ficha" value={value.treatmentIndicated} onChange={treatmentIndicated => patch({ treatmentIndicated })} options={[["pre_exposure","Pré-exposição"],["dispensed","Dispensa de tratamento"],["animal_observation","Observação do animal"],["observation_vaccine","Observação + vacina"],["vaccine","Vacina"],["serum_vaccine","Soro + vacina"],["reexposure","Esquema de reexposição"]]} /><div className="grid gap-4 md:grid-cols-3"><TextField label="Laboratório produtor da vacina" value={value.vaccineManufacturer} onChange={vaccineManufacturer => patch({ vaccineManufacturer })} /><TextField label="Lote da vacina" value={value.vaccineLot} onChange={vaccineLot => patch({ vaccineLot })} /><TextField type="date" label="Validade da vacina" value={value.vaccineExpiration} onChange={vaccineExpiration => patch({ vaccineExpiration })} /></div><fieldset><legend className="text-sm font-bold text-slate-800">Datas das aplicações</legend><div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{vaccineDates.map((date, index) => <TextField key={index} type="date" label={`${index + 1}ª dose`} value={date} onChange={nextDate => { const next = [...vaccineDates]; next[index] = nextDate; patch({ vaccineDates: next }) }} />)}</div></fieldset>{outcome === 'vaccine_serum' && <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5"><h3 className="font-black text-red-950">Soro ou imunoglobulina</h3><div className="grid gap-4 md:grid-cols-3"><SelectField label="Indicação registrada" value={value.serumIndicated} onChange={serumIndicated => patch({ serumIndicated })} options={[["yes","Sim"],["no","Não"],["ignored","Ignorado"]]} /><TextField label="Peso (kg)" value={value.serumWeightKg || (patient.weight ? String(patient.weight) : '')} onChange={serumWeightKg => patch({ serumWeightKg })} /><TextField label="Quantidade aplicada (mL)" value={value.serumAmountMl} onChange={serumAmountMl => patch({ serumAmountMl })} /><SelectField label="Tipo" value={value.serumType} onChange={serumType => patch({ serumType })} options={[["heterologous","Heterólogo/SAR"],["homologous","Homólogo/IGHAR"]]} /><SelectField label="Infiltração no ferimento" value={value.serumInfiltration} onChange={serumInfiltration => patch({ serumInfiltration })} options={[["yes","Sim"],["no","Não"]]} /><SelectField label="Extensão da infiltração" value={value.serumInfiltrationExtent} onChange={serumInfiltrationExtent => patch({ serumInfiltrationExtent })} options={[["total","Total"],["partial","Parcial"]]} /><TextField label="Laboratório produtor" value={value.serumManufacturer} onChange={serumManufacturer => patch({ serumManufacturer })} /><TextField label="Número da partida" value={value.serumBatch} onChange={serumBatch => patch({ serumBatch })} /></div></div>}</div>

    return <div className="space-y-5"><div className="grid gap-4 md:grid-cols-3"><SelectField label="Condição final do animal" value={value.animalFinalCondition} onChange={animalFinalCondition => patch({ animalFinalCondition })} options={[["negative_clinical","Negativo clinicamente"],["negative_lab","Negativo laboratorial"],["positive_clinical","Positivo clinicamente"],["positive_lab","Positivo laboratorial"],["dead_no_diagnosis","Morto/sacrificado sem diagnóstico"],["ignored","Ignorado"]]} /><SelectField label="Tratamento interrompido" value={value.treatmentInterrupted} onChange={treatmentInterrupted => patch({ treatmentInterrupted })} options={[["yes","Sim"],["no","Não"]]} /><SelectField label="Evento adverso à vacina" value={value.vaccineAdverseEvent} onChange={vaccineAdverseEvent => patch({ vaccineAdverseEvent })} options={[["yes","Sim"],["no","Não"],["ignored","Ignorado"]]} />{outcome === 'vaccine_serum' && <SelectField label="Evento adverso ao soro" value={value.serumAdverseEvent} onChange={serumAdverseEvent => patch({ serumAdverseEvent })} options={[["yes","Sim"],["no","Não"],["ignored","Ignorado"]]} />}<TextField type="date" label="Data de encerramento" value={value.closureDate} onChange={closureDate => patch({ closureDate })} /></div>{value.treatmentInterrupted === 'yes' && <div className="grid gap-4 md:grid-cols-2"><SelectField label="Motivo da interrupção" value={value.interruptionReason} onChange={interruptionReason => patch({ interruptionReason })} options={[["service_indication","Indicação da unidade"],["abandonment","Abandono"],["transfer","Transferência"]]} /><SelectField label="Busca do paciente após abandono" value={value.patientSearchedAfterAbandonment} onChange={patientSearchedAfterAbandonment => patch({ patientSearchedAfterAbandonment })} options={[["yes","Sim"],["no","Não"]]} /></div>}<label className="block text-sm font-bold text-slate-800">Observações<textarea value={value.observations || ''} onChange={event => patch({ observations: event.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><div className="grid gap-4 md:grid-cols-3"><TextField label="Município/unidade do investigador" value={value.investigatorUnit} onChange={investigatorUnit => patch({ investigatorUnit })} /><TextField label="Nome do investigador" value={value.investigatorName} onChange={investigatorName => patch({ investigatorName })} /><TextField label="Função" value={value.investigatorRole} onChange={investigatorRole => patch({ investigatorRole })} /></div></div>
  }

  return <section className="overflow-hidden rounded-[1.75rem] border border-indigo-200 bg-indigo-50/40 shadow-sm">
    <div className="border-b border-indigo-200 bg-gradient-to-r from-indigo-800 to-blue-700 p-5 text-white sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="rounded-xl bg-white/15 p-2.5"><ClipboardList className="h-6 w-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-100">Ficha de investigação SINAN</p><h2 className="mt-1 text-xl font-black">Atendimento antirrábico humano</h2><p className="mt-1 text-sm text-indigo-100">Preencha o núcleo obrigatório agora; seguimento, doses e encerramento permanecem editáveis.</p></div></div><div className="min-w-36 rounded-xl bg-white/10 p-3 ring-1 ring-white/20"><div className="flex justify-between text-xs font-bold"><span>Núcleo preenchido</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${progress}%` }} /></div></div></div></div>
    <div className="space-y-3 p-4 sm:p-5"><div className="flex gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Nome, nascimento, idade, sexo e prontuário vêm do cadastro do paciente. Campos com asterisco compõem o conjunto mínimo para finalizar esta etapa.</p></div>{sections.map(([id, label]) => <div key={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button type="button" aria-expanded={open === id} onClick={() => setOpen(open === id ? '' : id)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left font-black text-slate-950"><span>{label}</span><ChevronDown className={clsx('h-5 w-5 text-slate-500 transition-transform', open === id && 'rotate-180')} /></button>{open === id && <div className="border-t border-slate-200 p-4 sm:p-5">{sectionBody(id)}</div>}</div>)}</div>
  </section>
}

export default RabiesNotificationForm
