import type { Patient, Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type CholecystitisSeverityKey =
  | 'leucocitoseMaior18000'
  | 'massaHd'
  | 'duracaoMaior72h'
  | 'inflamacaoLocalImportante'
  | 'cardiovascular'
  | 'neurologica'
  | 'respiratoria'
  | 'renal'
  | 'hepatica'
  | 'hematologica'

export type CholecystitisSeverity = 'leve' | 'moderada' | 'grave'

export type CholecystitisAntibioticScheme =
  | 'ampicillin_sulbactam'
  | 'ertapenem'
  | 'ceftriaxone_metronidazole'
  | 'ciprofloxacin_metronidazole'
  | 'piperacillin_tazobactam'
  | 'meropenem'
  | 'cefepime_metronidazole'
  | 'ceftazidime_metronidazole'

export const CHOLECYSTITIS_INITIAL_EXAMS = [
  'Hemograma completo',
  'PCR',
  'EAS',
  'Função renal',
  'Beta-hCG em mulheres férteis',
  'TGO e TGP',
  'Fosfatase alcalina e GGT',
  'Bilirrubinas total e frações',
  'Amilase e lipase',
  'Coagulograma',
  'Outros conforme quadro'
]

export const CHOLECYSTITIS_MODERATE_CRITERIA: Array<{ key: CholecystitisSeverityKey; label: string }> = [
  { key: 'leucocitoseMaior18000', label: 'Leucocitose > 18.000' },
  { key: 'massaHd', label: 'Massa palpável e dolorosa em hipocôndrio direito' },
  { key: 'duracaoMaior72h', label: 'Queixas com duração maior que 72 horas' },
  { key: 'inflamacaoLocalImportante', label: 'Inflamação local importante: gangrena, abscesso pericolecístico/hepático ou peritonite biliar' }
]

export const CHOLECYSTITIS_SEVERE_CRITERIA: Array<{ key: CholecystitisSeverityKey; label: string }> = [
  { key: 'cardiovascular', label: 'Disfunção cardiovascular: choque/hipotensão' },
  { key: 'neurologica', label: 'Disfunção neurológica: alteração do nível de consciência' },
  { key: 'respiratoria', label: 'Disfunção respiratória: PaO2/FiO2 < 300' },
  { key: 'renal', label: 'Disfunção renal: oligúria e/ou creatinina > 2 mg/dL' },
  { key: 'hepatica', label: 'Disfunção hepática: INR > 1,5' },
  { key: 'hematologica', label: 'Disfunção hematológica: plaquetas < 100.000' }
]

export const defaultCholecystitisSeverityValues = (): Record<CholecystitisSeverityKey, boolean> => ({
  leucocitoseMaior18000: false,
  massaHd: false,
  duracaoMaior72h: false,
  inflamacaoLocalImportante: false,
  cardiovascular: false,
  neurologica: false,
  respiratoria: false,
  renal: false,
  hepatica: false,
  hematologica: false
})

export const calculateCholecystitisSeverity = (values: Record<CholecystitisSeverityKey, boolean>) => {
  const severeSelected = CHOLECYSTITIS_SEVERE_CRITERIA.filter(item => values[item.key])
  const moderateSelected = CHOLECYSTITIS_MODERATE_CRITERIA.filter(item => values[item.key])

  if (severeSelected.length > 0) {
    return {
      severity: 'grave' as CholecystitisSeverity,
      tokyo: 'Tokyo III',
      title: 'Colecistite aguda grave',
      nextStep: 'cole_grave',
      value: 'tokyo_iii',
      selectedCount: severeSelected.length + moderateSelected.length,
      note: 'Disfunção orgânica presente. Indicar suporte intensivo, controle da disfunção, antibióticos e drenagem percutânea e/ou colecistectomia.'
    }
  }

  if (moderateSelected.length > 0) {
    return {
      severity: 'moderada' as CholecystitisSeverity,
      tokyo: 'Tokyo II',
      title: 'Colecistite aguda moderada',
      nextStep: 'cole_moderada',
      value: 'tokyo_ii',
      selectedCount: moderateSelected.length,
      note: 'Pelo menos um critério moderado. Colecistectomia laparoscópica precoce; considerar drenagem percutânea se alto risco cirúrgico.'
    }
  }

  return {
    severity: 'leve' as CholecystitisSeverity,
    tokyo: 'Tokyo I',
    title: 'Colecistite aguda leve',
    nextStep: 'cole_leve',
    value: 'tokyo_i',
    selectedCount: 0,
    note: 'Sem critérios de moderada ou grave. Colecistectomia laparoscópica precoce, idealmente em até 72 horas, além de hidratação, analgesia e antibióticos.'
  }
}

export const getCholecystitisAntibioticOptions = (severity: CholecystitisSeverity) => {
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
      'Metronidazol 500 mg EV de 8/8 horas + Ceftriaxona 2 g EV de 24/24 horas',
      'Metronidazol 500 mg EV de 8/8 horas + Ciprofloxacino 500 mg EV de 12/12 horas'
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

export const buildCholecystitisPrescriptionItems = (
  severity: CholecystitisSeverity,
  antibioticScheme: CholecystitisAntibioticScheme = severity === 'grave' ? 'piperacillin_tazobactam' : 'ceftriaxone_metronidazole'
): PrescriptionDraft[] => {
  const antibiotics: Record<CholecystitisAntibioticScheme, PrescriptionDraft[]> = {
    ampicillin_sulbactam: [
      {
        medication: 'Ampicilina + Sulbactam',
        dosage: '3 g EV',
        frequency: '6/6 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Opção de monoterapia para colecistite aguda leve conforme perfil local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    ertapenem: [
      {
        medication: 'Ertapeném',
        dosage: '1 g EV',
        frequency: '24/24 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Opção de monoterapia; individualizar conforme perfil microbiológico local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    ceftriaxone_metronidazole: [
      {
        medication: 'Ceftriaxona',
        dosage: '2 g + 100 mL SF 0,9%',
        frequency: 'EV em 30 minutos de 24/24 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Esquema sugerido para colecistite aguda, associado a metronidazol.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg/100 mL',
        frequency: 'EV em 20 minutos de 8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associado à ceftriaxona no esquema sugerido.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    ciprofloxacin_metronidazole: [
      {
        medication: 'Ciprofloxacino',
        dosage: '500 mg EV',
        frequency: '12/12 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associar a metronidazol; ajustar conforme função renal, alergias e perfil local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associado ao ciprofloxacino no esquema sugerido.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    piperacillin_tazobactam: [
      {
        medication: 'Piperacilina + Tazobactam',
        dosage: '4,5 g EV',
        frequency: '6/6 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Opção para colecistite moderada/grave; ajustar à função renal e microbiologia local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    meropenem: [
      {
        medication: 'Meropeném',
        dosage: '1 g EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Opção para colecistite grave conforme perfil microbiológico local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    cefepime_metronidazole: [
      {
        medication: 'Cefepime',
        dosage: '2 g EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associar a metronidazol; opção para quadros graves conforme perfil local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associado ao cefepime no esquema sugerido.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ],
    ceftazidime_metronidazole: [
      {
        medication: 'Ceftazidima',
        dosage: '2 g EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associar a metronidazol; opção para quadros graves conforme perfil local.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg EV',
        frequency: '8/8 horas',
        duration: 'Conforme protocolo e culturas',
        instructions: 'Associado à ceftazidima no esquema sugerido.',
        prescribedBy: 'Fluxograma Colecistite Aguda'
      }
    ]
  }

  return [
    {
      medication: 'Dieta oral zero',
      dosage: 'Manter jejum',
      frequency: 'Até definição do procedimento',
      duration: 'Reavaliar diariamente',
      instructions: 'Jejum até definição de colecistectomia ou drenagem.',
      prescribedBy: 'Fluxograma Colecistite Aguda'
    },
    {
      medication: 'Soro glicosado 5% + NaCl 10% + KCl 10%',
      dosage: '500 mL + 10 mL + 10 mL',
      frequency: 'EV de 6/6 horas',
      duration: 'Conforme volemia e eletrólitos',
      instructions: 'Individualizar conforme função renal, eletrólitos, sepse e metas hemodinâmicas.',
      prescribedBy: 'Fluxograma Colecistite Aguda'
    },
    ...antibiotics[antibioticScheme],
    {
      medication: 'Dipirona',
      dosage: '1 g EV',
      frequency: '6/6 horas se dor ou febre',
      duration: 'Conforme necessidade',
      instructions: 'Equivale a 2 mL da apresentação 500 mg/mL diluídos em AD ou SF.',
      prescribedBy: 'Fluxograma Colecistite Aguda'
    },
    {
      medication: 'Tramadol',
      dosage: '100 mg + 100 mL SF 0,9%',
      frequency: 'EV em 30 minutos se dor intensa',
      duration: 'Conforme necessidade',
      instructions: 'Monitorar sedação, náuseas e risco de queda.',
      prescribedBy: 'Fluxograma Colecistite Aguda'
    },
    {
      medication: 'Bromoprida',
      dosage: '10 mg EV',
      frequency: 'Se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Alternativa antiemética conforme disponibilidade e contraindicações.',
      prescribedBy: 'Fluxograma Colecistite Aguda'
    }
  ]
}

export const hasCholecystitisPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Colecistite Aguda')
      .map((item) => item.medication)
  )
  return names.has('Dieta oral zero') && names.has('Dipirona') && (
    names.has('Ampicilina + Sulbactam') ||
    names.has('Ertapeném') ||
    names.has('Ceftriaxona') ||
    names.has('Ciprofloxacino') ||
    names.has('Piperacilina + Tazobactam') ||
    names.has('Meropeném') ||
    names.has('Cefepime') ||
    names.has('Ceftazidima')
  )
}
