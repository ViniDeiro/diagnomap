import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type SinusitisEtiology = 'viral' | 'allergic' | 'bacterial'

export const SINUSITIS_ALLERGIC_FEATURES = [
  'Coriza hialina crônica',
  'Espirros/prurido nasal recorrentes',
  'Congestão ou prurido ocular',
  'Sibilância ou história de atopia associada'
]

export const SINUSITIS_BACTERIAL_FEATURES = [
  'Piora após fase inicial',
  'Rinorreia predominantemente unilateral',
  'Rinorreia posterior purulenta',
  'Dor facial unilateral intensa',
  'Febre ≥ 37,8°C'
]

export const SINUSITIS_HOSPITAL_WARNING_SIGNS = [
  'Diplopia',
  'Redução da acuidade visual ou da mobilidade ocular',
  'Proptose ocular',
  'Presença de sinais meníngeos',
  'Alteração do estado mental',
  'Indícios de sepse',
  'Cefaleia ou dor facial intensa que não responde à medicação oral'
]

export const buildSinusitisPrescriptionItems = (etiology: SinusitisEtiology): PrescriptionDraft[] => {
  const baseItems: PrescriptionDraft[] = [
    {
      medication: 'Dipirona 1 g ou Paracetamol 500 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 6 horas, se febre ou dor',
      duration: 'Conforme necessidade',
      instructions: 'Usar um ou outro analgésico/antitérmico conforme perfil do paciente.',
      prescribedBy: 'Fluxograma Rinossinusite'
    },
    {
      medication: 'Budesonida spray nasal',
      dosage: '50 mcg',
      frequency: 'Aplicar 1 a 2 jatos em cada narina de 12/12 horas',
      duration: '10 dias',
      instructions: 'Corticosteroide nasal para controle de inflamação/congestão.',
      prescribedBy: 'Fluxograma Rinossinusite'
    },
    {
      medication: 'Cloridrato de Oximetazolina',
      dosage: '0,5 mg/mL',
      frequency: '1 a 2 gotas em cada narina pela manhã e à noite, se congestão nasal intensa',
      duration: 'Máximo de 5 dias',
      instructions: 'Não usar por tempo prolongado pelo risco de rinite medicamentosa.',
      prescribedBy: 'Fluxograma Rinossinusite'
    },
    {
      medication: 'Lavagem nasal com soro fisiológico 0,9%',
      dosage: 'Volume livre conforme técnica orientada',
      frequency: 'Repetir ao longo do dia',
      duration: 'Enquanto houver congestão/secreção',
      instructions: 'Inclinar a cabeça para o lado oposto da narina em uso, aplicar com seringa ou frasco e repetir no outro lado.',
      prescribedBy: 'Fluxograma Rinossinusite'
    }
  ]

  if (etiology !== 'bacterial') return baseItems

  return [
    {
      medication: 'Amoxicilina + Clavulanato',
      dosage: '875/125 mg',
      frequency: 'VO de 12/12 horas',
      duration: '7 dias',
      instructions: 'Antibiótico de escolha quando critérios sugerem rinossinusite bacteriana.',
      prescribedBy: 'Fluxograma Rinossinusite'
    },
    ...baseItems
  ]
}

export const hasSinusitisPrescriptionSet = (
  prescriptions: Prescription[],
  etiology: SinusitisEtiology
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Rinossinusite')
      .map((item) => item.medication)
  )

  const baseRequired = [
    'Dipirona 1 g ou Paracetamol 500 mg',
    'Budesonida spray nasal',
    'Cloridrato de Oximetazolina',
    'Lavagem nasal com soro fisiológico 0,9%'
  ]

  if (etiology === 'bacterial') {
    return names.has('Amoxicilina + Clavulanato') && baseRequired.every((item) => names.has(item))
  }

  return baseRequired.every((item) => names.has(item))
}
