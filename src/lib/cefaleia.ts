import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type CefaleiaDisposition = 'tensional' | 'migranea' | 'salvas'

const prescribedBy = 'Fluxograma Cefaleia'

export const CEFALEIA_ALARM_SIGNS = [
  'Cefaleia em thunderclap / trovoada',
  'Cefaleia nova e de forte intensidade',
  'Idade > 50 anos',
  'Traumatismo craniano prévio nos últimos 2 meses',
  'Febre ou suspeita infecciosa relevante',
  'Imunocomprometimento',
  'Papiledema',
  'Irritação meníngea',
  'Gravidez ou pós-parto < 6 semanas',
  'Uso de anticoagulantes, corticoides, drogas ilícitas ou intoxicações exógenas',
  'Novo déficit neurológico'
]

export const CEFALEIA_GREEN_FLAGS = [
  'Dor recorrente desde a infância',
  'Dias livres de dor entre as crises',
  'Crises semelhantes próximas ao período menstrual',
  'História familiar de cefaleia com mesmo fenótipo',
  'Cefaleia iniciou ou terminou há mais de uma semana'
]

export const buildCefaleiaPrescriptionItems = (disposition: CefaleiaDisposition): PrescriptionDraft[] => {
  const baseItems: PrescriptionDraft[] = [
    {
      medication: 'Naproxeno',
      dosage: '500 mg',
      frequency: 'VO 1x/dia',
      duration: '5 dias',
      instructions: 'Evitar se contraindicação a AINE.',
      prescribedBy
    },
    {
      medication: 'Dipirona 1 g ou Paracetamol 500 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 6 horas se febre ou dor',
      duration: 'Conforme necessidade',
      instructions: 'Não usar opioides para cefaleia primária.',
      prescribedBy
    }
  ]

  if (disposition === 'migranea') {
    return [
      ...baseItems,
      {
        medication: 'Sumatriptano',
        dosage: '50 mg',
        frequency: 'VO em caso de crise intensa',
        duration: 'Máximo de 4 comprimidos por dia',
        instructions: 'Evitar se contraindicação cardiovascular ou suspeita de cefaleia secundária.',
        prescribedBy
      },
      {
        medication: 'Metoclopramida 10 mg ou Ondansetrona 4 mg',
        dosage: '1 comprimido',
        frequency: 'VO a cada 8 horas se náuseas ou vômitos',
        duration: 'Conforme necessidade',
        instructions: 'Individualizar conforme contraindicações.',
        prescribedBy
      }
    ]
  }

  if (disposition === 'salvas') {
    return [
      {
        medication: 'Oxigênio suplementar',
        dosage: 'Máscara não reinalante',
        frequency: '8 a 15 L/min por 15 minutos',
        duration: 'Durante a crise',
        instructions: 'Primeira linha para cefaleia em salvas quando disponível.',
        prescribedBy
      },
      {
        medication: 'Sumatriptano',
        dosage: '6 mg/0,5 mL',
        frequency: 'SC agora; pode repetir em 2 horas se necessário',
        duration: 'Durante a crise',
        instructions: 'Triptano raramente disponível no PS; evitar se contraindicação cardiovascular.',
        prescribedBy
      }
    ]
  }

  return baseItems
}

export const getCefaleiaPsMedicationOptions = (disposition: CefaleiaDisposition) => {
  if (disposition === 'salvas') {
    return [
      'O2 em máscara não reinalante 8 a 15 L/min por 15 minutos.',
      'Sumatriptano 6 mg SC agora; pode repetir em 2 horas se necessário.'
    ]
  }

  if (disposition === 'migranea') {
    return [
      'Dipirona 1 g/2 mL: 2 mL EV lento agora; pode repetir de 6/6 horas.',
      'Cetoprofeno 100 mg + 100 mL de SF 0,9% EV agora.',
      'Sumatriptano 6 mg SC agora; pode repetir em 2 horas se necessário.',
      'Dexametasona 10 mg EV agora se crises recorrentes ou dor > 72h.',
      'Metoclopramida 10 mg + 100 mL de SF 0,9% EV lento ou ondansetrona 4 mg EV agora se náuseas/vômitos.'
    ]
  }

  return [
    'Dipirona 1 g/2 mL: 2 mL EV lento agora; pode repetir de 6/6 horas.',
    'Cetoprofeno 100 mg + 100 mL de SF 0,9% EV agora.',
    'Não usar opioides.'
  ]
}

export const hasCefaleiaPrescriptionSet = (
  prescriptions: Prescription[],
  disposition: CefaleiaDisposition
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  if (disposition === 'salvas') {
    return names.has('Oxigênio suplementar') && names.has('Sumatriptano')
  }

  const base = names.has('Naproxeno') && names.has('Dipirona 1 g ou Paracetamol 500 mg')
  if (disposition === 'migranea') {
    return base && names.has('Sumatriptano') && names.has('Metoclopramida 10 mg ou Ondansetrona 4 mg')
  }

  return base
}
