import type { Patient, Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type PneumoniaPsiFieldKey =
  | 'idade'
  | 'residenteCasaRepouso'
  | 'neoplasiaAtiva'
  | 'doencaHepaticaCronica'
  | 'insuficienciaCardiaca'
  | 'doencaCerebrovascular'
  | 'doencaRenalCronica'
  | 'estadoMentalAlterado'
  | 'frMaior30'
  | 'pasMenor90'
  | 'temperaturaExtrema'
  | 'fcMaior125'
  | 'phMenor735'
  | 'ureiaMaior30'
  | 'sodioMenor130'
  | 'glicoseMaior250'
  | 'hematocritoMenor30'
  | 'hipoxemia'
  | 'derramePleural'

export type PneumoniaCurbFieldKey =
  | 'confusaoMental'
  | 'ureiaMaior43'
  | 'frMaior30'
  | 'paBaixa'
  | 'idadeMaior65'

export type PneumoniaPsiValues = Record<PneumoniaPsiFieldKey, boolean | number | ''>
export type PneumoniaCurbValues = Record<PneumoniaCurbFieldKey, boolean>

export const PNEUMONIA_MANDATORY_ADMISSION_LIMITERS = [
  'Impossibilidade da via oral',
  'Vulnerabilidade social',
  'Doença mental limitante'
]

export const PNEUMONIA_PSEUDOMONAS_RISK_FACTORS = [
  'Uso de antibióticos endovenosos no último mês',
  'Internação hospitalar por mais de 48 horas na última semana',
  'Doença estrutural pulmonar, como bronquiectasias',
  'Neutropenia grave'
]

export const PNEUMONIA_COMORBIDITIES_FOR_AMBULATORY_ATB = [
  'Doença pulmonar crônica',
  'Insuficiência cardíaca',
  'Doença hepática crônica',
  'Doença renal crônica',
  'Etilismo',
  'Neoplasia maligna',
  'Asplenia',
  'Imunossupressão',
  'Uso de antibióticos nos últimos 3 meses'
]

export const defaultPsiValues = (patient: Pick<Patient, 'age' | 'gender'>): PneumoniaPsiValues => ({
  idade: typeof patient.age === 'number' ? patient.age : '',
  residenteCasaRepouso: false,
  neoplasiaAtiva: false,
  doencaHepaticaCronica: false,
  insuficienciaCardiaca: false,
  doencaCerebrovascular: false,
  doencaRenalCronica: false,
  estadoMentalAlterado: false,
  frMaior30: false,
  pasMenor90: false,
  temperaturaExtrema: false,
  fcMaior125: false,
  phMenor735: false,
  ureiaMaior30: false,
  sodioMenor130: false,
  glicoseMaior250: false,
  hematocritoMenor30: false,
  hipoxemia: false,
  derramePleural: false
})

export const defaultCurbValues = (patient: Pick<Patient, 'age'>): PneumoniaCurbValues => ({
  confusaoMental: false,
  ureiaMaior43: false,
  frMaior30: false,
  paBaixa: false,
  idadeMaior65: typeof patient.age === 'number' ? patient.age > 65 : false
})

const isFemalePatient = (patient: Pick<Patient, 'gender'>) => {
  const gender = String(patient.gender || '').toLowerCase()
  return gender.includes('f') || gender.includes('mulher') || gender.includes('fem')
}

export const calculatePneumoniaPsi = (
  values: PneumoniaPsiValues,
  patient: Pick<Patient, 'gender'>
) => {
  const age = Number(values.idade) || 0
  let nonAgePoints = 0
  let score = isFemalePatient(patient) ? Math.max(0, age - 10) : age

  const addIf = (key: PneumoniaPsiFieldKey, points: number) => {
    if (values[key] === true) {
      score += points
      nonAgePoints += points
    }
  }

  addIf('residenteCasaRepouso', 10)
  addIf('neoplasiaAtiva', 30)
  addIf('doencaHepaticaCronica', 20)
  addIf('insuficienciaCardiaca', 10)
  addIf('doencaCerebrovascular', 10)
  addIf('doencaRenalCronica', 10)
  addIf('estadoMentalAlterado', 20)
  addIf('frMaior30', 20)
  addIf('pasMenor90', 20)
  addIf('temperaturaExtrema', 15)
  addIf('fcMaior125', 10)
  addIf('phMenor735', 30)
  addIf('ureiaMaior30', 20)
  addIf('sodioMenor130', 20)
  addIf('glicoseMaior250', 10)
  addIf('hematocritoMenor30', 10)
  addIf('hipoxemia', 10)
  addIf('derramePleural', 10)

  if (age < 50 && nonAgePoints === 0) {
    return { score, group: 'PORT I / PSI I', disposition: 'Tratamento ambulatorial', nextStep: 'pac_psi_baixo', value: 'psi_baixo' }
  }
  if (score < 71) {
    return { score, group: 'PORT II / PSI II', disposition: 'Tratamento ambulatorial', nextStep: 'pac_psi_baixo', value: 'psi_baixo' }
  }
  if (score <= 90) {
    return { score, group: 'PORT III / PSI III', disposition: 'Internação em enfermaria', nextStep: 'pac_psi_intermediario', value: 'psi_intermediario' }
  }
  if (score <= 130) {
    return { score, group: 'PORT IV / PSI IV', disposition: 'Internação em enfermaria', nextStep: 'pac_psi_intermediario', value: 'psi_intermediario' }
  }
  return { score, group: 'PORT V / PSI V', disposition: 'Internação em terapia intensiva', nextStep: 'pac_psi_alto', value: 'psi_alto' }
}

export const calculatePneumoniaCurb65 = (values: PneumoniaCurbValues) => {
  const score = Object.values(values).filter(Boolean).length
  if (score <= 1) return { score, disposition: 'Tratamento ambulatorial', nextStep: 'pac_curb_baixo', value: 'curb_baixo' }
  if (score === 2) return { score, disposition: 'Internação hospitalar', nextStep: 'pac_curb_intermediario', value: 'curb_intermediario' }
  return { score, disposition: score >= 4 ? 'Internação hospitalar; considerar UTI' : 'Internação hospitalar', nextStep: 'pac_curb_alto', value: 'curb_alto' }
}

export const buildPneumoniaPrescriptionItems = (
  patient: Pick<Patient, 'age'>,
  hasComorbidityOrRecentAtb: boolean
): PrescriptionDraft[] => {
  const adult = (patient.age || 0) >= 18
  if (!adult) {
    return [{
      medication: 'Antibioticoterapia para PAC pediátrica',
      dosage: 'Ajustar conforme idade, peso, gravidade e protocolo institucional',
      frequency: 'Conforme prescrição médica',
      duration: 'Conforme evolução clínica',
      instructions: 'Este fluxograma prioriza esquemas adultos; revisar dose pediátrica antes de prescrever.',
      prescribedBy: 'Fluxograma Pneumonia'
    }]
  }

  const base: PrescriptionDraft[] = hasComorbidityOrRecentAtb
    ? [
        {
          medication: 'Amoxicilina + Clavulanato',
          dosage: '875/125 mg',
          frequency: 'VO de 12/12 horas',
          duration: '7 dias',
          instructions: 'Associar azitromicina quando houver comorbidades, fatores de risco ou uso recente de antibiótico.',
          prescribedBy: 'Fluxograma Pneumonia'
        },
        {
          medication: 'Azitromicina',
          dosage: '500 mg',
          frequency: 'VO de 24/24 horas',
          duration: '5 dias',
          instructions: 'Usar em associação ao beta-lactâmico.',
          prescribedBy: 'Fluxograma Pneumonia'
        }
      ]
    : [
        {
          medication: 'Amoxicilina',
          dosage: '500 mg, 2 comprimidos (1 g)',
          frequency: 'VO de 8/8 horas',
          duration: '7 dias',
          instructions: 'Alternativas: amoxicilina + clavulanato, azitromicina ou claritromicina conforme perfil clínico.',
          prescribedBy: 'Fluxograma Pneumonia'
        }
      ]

  return [
    ...base,
    {
      medication: 'Acetilcisteína',
      dosage: 'Xarope 40 mg/mL: 15 mL ou granulado 600 mg: 1 envelope',
      frequency: 'VO 1x/dia',
      duration: '5 dias',
      instructions: 'Dissolver o granulado em meio copo de água, se essa apresentação for escolhida.',
      prescribedBy: 'Fluxograma Pneumonia'
    },
    {
      medication: 'Dipirona 1 g ou Paracetamol 500 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 6 horas, se febre ou dor',
      duration: 'Conforme necessidade',
      instructions: 'Usar um ou outro analgésico/antitérmico conforme perfil do paciente.',
      prescribedBy: 'Fluxograma Pneumonia'
    },
    {
      medication: 'Bromoprida 10 mg ou Ondansetrona 4 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 8 horas, se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Sintomático, apenas se houver náuseas ou vômitos.',
      prescribedBy: 'Fluxograma Pneumonia'
    }
  ]
}

export const hasPneumoniaPrescriptionSet = (
  prescriptions: Prescription[],
  hasComorbidityOrRecentAtb: boolean
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Pneumonia')
      .map((item) => item.medication)
  )
  const required = hasComorbidityOrRecentAtb
    ? ['Amoxicilina + Clavulanato', 'Azitromicina']
    : ['Amoxicilina']
  return required.every((item) => names.has(item))
}
