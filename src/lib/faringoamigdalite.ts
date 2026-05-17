import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type FaringoamigdaliteDisposition = 'symptomatic' | 'consider_antibiotic' | 'bacterial'

const prescribedBy = 'Fluxograma Faringoamigdalite'

export const FARINGO_CENTOR_CRITERIA = [
  'Febre > 38°C',
  'Adenopatia cervical anterior',
  'Exsudato ou edema amigdaliano',
  'Ausência de tosse',
  'Idade entre 3 e 14 anos',
  'Idade entre 15 e 44 anos: 0 ponto',
  'Idade > 45 anos: -1 ponto'
]

export const FARINGO_VIRAL_FEATURES = [
  'Coriza',
  'Conjuntivite',
  'Tosse',
  'Quadro respiratório alto difuso'
]

export const FARINGO_HOSPITAL_WARNING_SIGNS = [
  'Abscesso peritonsilar/retrofaríngeo suspeito',
  'Toxemia significativa',
  'Queda importante do estado geral',
  'Trismo, sialorreia, estridor ou dificuldade respiratória',
  'Incapacidade de ingerir líquidos'
]

export const buildFaringoamigdalitePrescriptionItems = (
  disposition: FaringoamigdaliteDisposition
): PrescriptionDraft[] => {
  const symptomaticItems: PrescriptionDraft[] = [
    {
      medication: 'Flurbiprofeno (Strepsils) pastilha',
      dosage: '1 pastilha',
      frequency: 'Dissolver lentamente na boca a cada 6 horas, se dor de garganta',
      duration: 'Conforme necessidade',
      instructions: 'Evitar se contraindicação a anti-inflamatório.',
      prescribedBy
    },
    {
      medication: 'Dipirona 1 g ou Paracetamol 500 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 6 horas, se febre ou dor',
      duration: 'Conforme necessidade',
      instructions: 'Usar um ou outro analgésico/antitérmico conforme perfil do paciente.',
      prescribedBy
    },
    {
      medication: 'Bromoprida 10 mg ou Ondansetrona 4 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 8 horas, se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Individualizar conforme contraindicações e disponibilidade.',
      prescribedBy
    }
  ]

  if (disposition === 'symptomatic') return symptomaticItems

  return [
    {
      medication: 'Amoxicilina + Clavulanato',
      dosage: '875/125 mg',
      frequency: 'VO de 12/12 horas',
      duration: '10 dias',
      instructions: 'Opção de prescrição para faringoamigdalite bacteriana conforme avaliação clínica.',
      prescribedBy
    },
    ...symptomaticItems
  ]
}

export const getFaringoamigdaliteAntibioticAlternatives = () => [
  'Penicilina G benzatina 1.200.000 UI IM em dose única.',
  'Amoxicilina 500 mg VO de 8/8 horas por 10 dias.',
  'Penicilina V 500 mg VO de 8/8 horas por 10 dias.',
  'Se alergia a penicilina: azitromicina 500 mg VO 1x/dia por 5 dias.',
  'Se alergia a penicilina: cefalexina 500 mg VO de 12/12 horas por 10 dias.',
  'Se alergia a penicilina: cefuroxima 500 mg VO de 12/12 horas por 10 dias.'
]

export const hasFaringoamigdalitePrescriptionSet = (
  prescriptions: Prescription[],
  disposition: FaringoamigdaliteDisposition
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  const baseRequired = [
    'Flurbiprofeno (Strepsils) pastilha',
    'Dipirona 1 g ou Paracetamol 500 mg',
    'Bromoprida 10 mg ou Ondansetrona 4 mg'
  ]

  if (disposition !== 'symptomatic') {
    return names.has('Amoxicilina + Clavulanato') && baseRequired.every((item) => names.has(item))
  }

  return baseRequired.every((item) => names.has(item))
}
