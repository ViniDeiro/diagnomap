import type { Patient, Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type CholangitisDiagnosisKey =
  | 'febreCalafrios'
  | 'leucocitosPcr'
  | 'ictericiaBilirrubina'
  | 'enzimasColestaticas'
  | 'dilatacaoViaBiliar'
  | 'etiologiaImagem'

export type CholangitisSeverityKey =
  | 'leucocitosExtremos'
  | 'febreAlta'
  | 'idadeMaior75'
  | 'bilirrubinaMaior5'
  | 'hipoalbuminemia'
  | 'cardiovascular'
  | 'neurologica'
  | 'respiratoria'
  | 'renal'
  | 'hepatica'
  | 'hematologica'

export type CholangitisSeverity = 'leve' | 'moderada' | 'grave'

export const CHOLANGITIS_INITIAL_EXAMS = [
  'Hemograma completo',
  'Hemoculturas',
  'EAS',
  'PCR',
  'Função renal',
  'Beta-hCG em mulheres férteis',
  'TGO e TGP',
  'Fosfatase alcalina e GGT',
  'Bilirrubinas total e frações',
  'Amilase e lipase',
  'Coagulograma',
  'Albumina'
]

export const CHOLEDOCOLITHIASIS_CLINICAL_SIGNS = [
  'Dor intensa em hipocôndrio direito, persistente, irradiando para dorso ou ombro direito',
  'Anorexia, náuseas e/ou vômitos',
  'Icterícia, colúria e acolia fecal',
  'Febre sugere colangite associada'
]

export const CHOLANGITIS_DIAGNOSIS_ITEMS: Array<{
  key: CholangitisDiagnosisKey
  group: 'A' | 'B' | 'C'
  label: string
}> = [
  { key: 'febreCalafrios', group: 'A', label: 'Febre > 38ºC ou calafrios' },
  { key: 'leucocitosPcr', group: 'A', label: 'Leucócitos < 4.000 ou > 10.000/uL ou PCR aumentado' },
  { key: 'ictericiaBilirrubina', group: 'B', label: 'Icterícia / bilirrubina >= 2 mg/dL' },
  { key: 'enzimasColestaticas', group: 'B', label: 'FA, GGT, AST ou ALT > 1,5x LSN' },
  { key: 'dilatacaoViaBiliar', group: 'C', label: 'Dilatação da via biliar na imagem' },
  { key: 'etiologiaImagem', group: 'C', label: 'Etiologia na imagem: cálculo, estenose, stent ou outro' }
]

export const CHOLANGITIS_MODERATE_CRITERIA: Array<{ key: CholangitisSeverityKey; label: string }> = [
  { key: 'leucocitosExtremos', label: 'Leucócitos > 12.000 ou leucopenia < 4.000' },
  { key: 'febreAlta', label: 'Febre alta > 39ºC' },
  { key: 'idadeMaior75', label: 'Idade > 75 anos' },
  { key: 'bilirrubinaMaior5', label: 'Hiperbilirrubinemia > 5 mg/dL' },
  { key: 'hipoalbuminemia', label: 'Hipoalbuminemia' }
]

export const CHOLANGITIS_SEVERE_CRITERIA: Array<{ key: CholangitisSeverityKey; label: string }> = [
  { key: 'cardiovascular', label: 'Disfunção cardiovascular: choque/hipotensão' },
  { key: 'neurologica', label: 'Disfunção neurológica: alteração do nível de consciência' },
  { key: 'respiratoria', label: 'Disfunção respiratória: PaO2/FiO2 < 300' },
  { key: 'renal', label: 'Disfunção renal: oligúria ou creatinina > 2 mg/dL' },
  { key: 'hepatica', label: 'Disfunção hepática: INR > 1,5' },
  { key: 'hematologica', label: 'Disfunção hematológica: plaquetas < 100.000' }
]

export const defaultCholangitisDiagnosisValues = (): Record<CholangitisDiagnosisKey, boolean> => ({
  febreCalafrios: false,
  leucocitosPcr: false,
  ictericiaBilirrubina: false,
  enzimasColestaticas: false,
  dilatacaoViaBiliar: false,
  etiologiaImagem: false
})

export const defaultCholangitisSeverityValues = (
  patient: Pick<Patient, 'age'>
): Record<CholangitisSeverityKey, boolean> => ({
  leucocitosExtremos: false,
  febreAlta: false,
  idadeMaior75: typeof patient.age === 'number' ? patient.age > 75 : false,
  bilirrubinaMaior5: false,
  hipoalbuminemia: false,
  cardiovascular: false,
  neurologica: false,
  respiratoria: false,
  renal: false,
  hepatica: false,
  hematologica: false
})

export const calculateCholangitisDiagnosis = (values: Record<CholangitisDiagnosisKey, boolean>) => {
  const hasA = values.febreCalafrios || values.leucocitosPcr
  const hasB = values.ictericiaBilirrubina || values.enzimasColestaticas
  const hasC = values.dilatacaoViaBiliar || values.etiologiaImagem
  const status = hasA && hasB && hasC
    ? 'confirmado'
    : hasA && (hasB || hasC)
      ? 'suspeito'
      : 'insuficiente'

  return {
    hasA,
    hasB,
    hasC,
    status,
    label: status === 'confirmado' ? 'Caso confirmado' : status === 'suspeito' ? 'Caso suspeito' : 'Critérios insuficientes',
    note: status === 'confirmado'
      ? 'Tokyo 2018: A + B + C. Iniciar antibiótico precoce, suporte e classificar gravidade.'
      : status === 'suspeito'
        ? 'Tokyo 2018: A + B ou C. Manter suspeita, antibioticoterapia precoce e completar investigação.'
        : 'Reavaliar hipóteses e procurar outros diagnósticos de dor abdominal/icterícia.'
  }
}

export const calculateCholangitisSeverity = (values: Record<CholangitisSeverityKey, boolean>) => {
  const severeSelected = CHOLANGITIS_SEVERE_CRITERIA.filter(item => values[item.key])
  const moderateSelected = CHOLANGITIS_MODERATE_CRITERIA.filter(item => values[item.key])

  if (severeSelected.length > 0) {
    return {
      severity: 'grave' as CholangitisSeverity,
      tokyo: 'Tokyo III',
      title: 'Colangite aguda grave',
      nextStep: 'colangite_grave',
      value: 'tokyo_iii',
      selectedCount: severeSelected.length + moderateSelected.length,
      note: 'Disfunção orgânica presente. Suporte intensivo e drenagem biliar urgente, idealmente em 12-24h.'
    }
  }

  if (moderateSelected.length > 0) {
    return {
      severity: 'moderada' as CholangitisSeverity,
      tokyo: 'Tokyo II',
      title: 'Colangite aguda moderada',
      nextStep: 'colangite_moderada',
      value: 'tokyo_ii',
      selectedCount: moderateSelected.length,
      note: 'Pelo menos um critério moderado. Drenagem biliar precoce, preferencialmente em 24-48h.'
    }
  }

  return {
    severity: 'leve' as CholangitisSeverity,
    tokyo: 'Tokyo I',
    title: 'Colangite aguda leve',
    nextStep: 'colangite_leve',
    value: 'tokyo_i',
    selectedCount: 0,
    note: 'Sem critérios de moderada ou grave. Suporte clínico e antibiótico; drenar se não houver resposta em até 48h.'
  }
}

export const getCholangitisAntibioticOptions = (severity: CholangitisSeverity) => {
  if (severity === 'leve') {
    return [
      'Ampicilina + Sulbactam 3 g EV de 6/6 horas',
      'Ertapeném 1 g EV de 24/24 horas',
      'Metronidazol 500 mg EV de 8/8 horas + Ceftriaxona 2 g EV de 24/24 horas',
      'Metronidazol 500 mg EV de 8/8 horas + Ciprofloxacino 500 mg EV de 12/12 horas'
    ]
  }
  if (severity === 'moderada') {
    return [
      'Piperacilina + Tazobactam 4,5 g EV de 6/6 horas',
      'Ertapeném 1 g EV de 24/24 horas',
      'Metronidazol 500 mg EV de 8/8 horas + Cefepime 2 g EV de 8/8 horas',
      'Metronidazol 500 mg EV de 8/8 horas + Cefotaxima 2 g EV de 8/8 horas'
    ]
  }
  return [
    'Piperacilina + Tazobactam 4,5 g EV de 6/6 horas',
    'Ertapeném 1 g EV de 24/24 horas',
    'Meropeném 1 g EV de 8/8 horas',
    'Metronidazol 500 mg EV de 8/8 horas + Cefepime 2 g EV de 8/8 horas',
    'Metronidazol 500 mg EV de 8/8 horas + Ceftazidima 2 g EV de 8/8 horas'
  ]
}

export const buildCholangitisPrescriptionItems = (
  severity: CholangitisSeverity,
  antibioticScheme: 'cefepime_metronidazole' | 'piperacillin_tazobactam' | 'ceftriaxone_metronidazole' = severity === 'leve' ? 'ceftriaxone_metronidazole' : severity === 'moderada' ? 'cefepime_metronidazole' : 'piperacillin_tazobactam',
  includeAntibiotics = true
): PrescriptionDraft[] => {
  const antibiotics: Record<typeof antibioticScheme, PrescriptionDraft[]> = {
    cefepime_metronidazole: [
      {
        medication: 'Cefepime',
        dosage: '2 g + 100 mL SF 0,9%',
        frequency: 'EV em 30 minutos de 8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Esquema sugerido para colangite Tokyo II, associado a metronidazol.',
        prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg/100 mL',
        frequency: 'EV em 20 minutos de 8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associado ao cefepime no esquema sugerido.',
        prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
      }
    ],
    piperacillin_tazobactam: [
      {
        medication: 'Piperacilina + Tazobactam',
        dosage: '4,5 g EV',
        frequency: '6/6 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Opção de monoterapia para colangite moderada/grave; ajustar à função renal e microbiologia local.',
        prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
      }
    ],
    ceftriaxone_metronidazole: [
      {
        medication: 'Ceftriaxona',
        dosage: '2 g EV',
        frequency: '24/24 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Opção para quadro leve ou coledocolitíase com suspeita de colangite, associada a metronidazol.',
        prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associado à ceftriaxona no esquema sugerido.',
        prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
      }
    ]
  }

  return [
    {
      medication: 'Dieta oral zero',
      dosage: 'Manter jejum',
      frequency: 'Até definição do procedimento',
      duration: 'Reavaliar diariamente',
      instructions: 'Jejum até estabilização clínica e definição de drenagem/CPRE/cirurgia.',
      prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
    },
    {
      medication: 'Soro glicosado 5% + NaCl 10% + KCl 10%',
      dosage: '500 mL + 10 mL + 10 mL',
      frequency: 'EV de 6/6 horas',
      duration: 'Conforme volemia e eletrólitos',
      instructions: 'Individualizar conforme função renal, eletrólitos, sepse e metas hemodinâmicas.',
      prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
    },
    ...(includeAntibiotics ? antibiotics[antibioticScheme] : []),
    {
      medication: 'Dipirona',
      dosage: '1 g EV',
      frequency: '6/6 horas se dor ou febre',
      duration: 'Conforme necessidade',
      instructions: 'Equivale a 2 mL da apresentação 500 mg/mL diluídos em AD ou SF.',
      prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
    },
    {
      medication: 'Tramadol',
      dosage: '100 mg + 100 mL SF 0,9%',
      frequency: 'EV em 30 minutos se dor intensa',
      duration: 'Conforme necessidade',
      instructions: 'Monitorar sedação, náuseas e risco de queda.',
      prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
    },
    {
      medication: 'Bromoprida',
      dosage: '10 mg EV',
      frequency: 'Se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Alternativa antiemética conforme disponibilidade e contraindicações.',
      prescribedBy: 'Fluxograma Colangite / Coledocolitíase'
    }
  ]
}

export const hasCholangitisPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Colangite / Coledocolitíase')
      .map((item) => item.medication)
  )
  return names.has('Dieta oral zero') && names.has('Dipirona') && (names.has('Cefepime') || names.has('Piperacilina + Tazobactam') || names.has('Ceftriaxona'))
}
