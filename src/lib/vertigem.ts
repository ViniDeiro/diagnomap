import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type VertigemDisposition = 'neurite' | 'vppb'

const prescribedBy = 'Fluxograma Síndrome Vertiginosa'

export const VERTIGEM_HINTS_ITEMS = [
  'Head impulse: VOR preservado sugere causa central; sacada corretiva sugere causa periférica.',
  'Nistagmo: mudança de direção conforme olhar sugere causa central; direção fixa sugere causa periférica.',
  'Test of skew: desvio vertical/diagonal sugere causa central.'
]

export const VERTIGEM_CENTRAL_WARNING_SIGNS = [
  'Déficit neurológico focal',
  'Ataxia importante ou incapacidade de marcha',
  'Cefaleia intensa ou nova',
  'Diplopia, disartria, disfagia ou fraqueza',
  'HINTS central: VOR normal, nistagmo que muda de direção ou skew positivo'
]

export const buildVertigemPrescriptionItems = (disposition: VertigemDisposition): PrescriptionDraft[] => {
  const symptomaticItems: PrescriptionDraft[] = [
    {
      medication: 'Dimenidrinato + Cloridrato de Piridoxina',
      dosage: '30 mg + 50 mg',
      frequency: 'VO a cada 6 horas se tontura ou enjoo',
      duration: 'Máximo de 3 dias',
      instructions: 'Usar pelo menor tempo possível para não atrasar compensação vestibular.',
      prescribedBy
    },
    {
      medication: 'Metoclopramida 10 mg ou Ondansetrona 4 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 8 horas se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Individualizar conforme contraindicações e perfil do paciente.',
      prescribedBy
    }
  ]

  if (disposition === 'vppb') return symptomaticItems

  return [
    ...symptomaticItems,
    {
      medication: 'Meclizina',
      dosage: '50 mg',
      frequency: 'VO de 12/12 horas',
      duration: 'Máximo de 3 dias',
      instructions: 'Opção antivertiginosa sintomática na fase aguda, com suspensão precoce.',
      prescribedBy
    }
  ]
}

export const getVertigemAntivertigoAlternatives = () => [
  'Dimenidrinato + Piridoxina (30+50 mg/10 mL) + 50 mL de AD EV de 6/6 horas.',
  'Meclizina 50 mg VO de 12/12 horas.',
  'Cinarizina 25 mg VO de 8/8 horas.',
  'Flunarizina 10 mg VO de 24/24 horas.'
]

export const hasVertigemPrescriptionSet = (
  prescriptions: Prescription[],
  disposition: VertigemDisposition
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  const base = names.has('Dimenidrinato + Cloridrato de Piridoxina') && names.has('Metoclopramida 10 mg ou Ondansetrona 4 mg')

  if (disposition === 'neurite') return base && names.has('Meclizina')
  return base
}
