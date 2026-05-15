import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type AppendicitisAlvaradoKey =
  | 'dorMigratoria'
  | 'anorexia'
  | 'nauseasVomitos'
  | 'defesaFid'
  | 'descompressao'
  | 'febre'
  | 'leucocitose'
  | 'desvioEsquerda'

export type AppendicitisAntibioticScheme =
  | 'ceftriaxone_metronidazole'
  | 'ciprofloxacin_metronidazole'
  | 'ampicillin_sulbactam'
  | 'piperacillin_tazobactam'

export const APPENDICITIS_INITIAL_EXAMS = [
  'Hemograma completo',
  'PCR',
  'EAS',
  'Função renal',
  'Beta-hCG em mulheres férteis',
  'Outros conforme contexto e investigação'
]

export const APPENDICITIS_ALVARADO_ITEMS: Array<{
  key: AppendicitisAlvaradoKey
  group: 'Sintomas' | 'Sinais' | 'Laboratório'
  label: string
  points: number
}> = [
  { key: 'dorMigratoria', group: 'Sintomas', label: 'Dor típica migratória', points: 1 },
  { key: 'anorexia', group: 'Sintomas', label: 'Anorexia', points: 1 },
  { key: 'nauseasVomitos', group: 'Sintomas', label: 'Náuseas e/ou vômitos', points: 1 },
  { key: 'defesaFid', group: 'Sinais', label: 'Defesa abdominal em FID', points: 2 },
  { key: 'descompressao', group: 'Sinais', label: 'Dor à descompressão', points: 1 },
  { key: 'febre', group: 'Sinais', label: 'Elevação da temperatura', points: 1 },
  { key: 'leucocitose', group: 'Laboratório', label: 'Leucocitose', points: 2 },
  { key: 'desvioEsquerda', group: 'Laboratório', label: 'Desvio à esquerda', points: 1 }
]

export const defaultAppendicitisAlvaradoValues = (): Record<AppendicitisAlvaradoKey, boolean> => ({
  dorMigratoria: false,
  anorexia: false,
  nauseasVomitos: false,
  defesaFid: false,
  descompressao: false,
  febre: false,
  leucocitose: false,
  desvioEsquerda: false
})

export const calculateAppendicitisAlvarado = (values: Record<AppendicitisAlvaradoKey, boolean>) => {
  const score = APPENDICITIS_ALVARADO_ITEMS.reduce((total, item) => total + (values[item.key] ? item.points : 0), 0)

  if (score >= 7) {
    return {
      score,
      risk: 'alto' as const,
      title: 'Alto risco',
      nextStep: 'apend_alto_risco',
      value: 'alto_risco',
      note: 'Alvarado 7 a 10: solicitar imagem para confirmar ou encaminhar diretamente para conduta cirúrgica conforme avaliação.'
    }
  }

  if (score >= 4) {
    return {
      score,
      risk: 'moderado' as const,
      title: 'Risco moderado',
      nextStep: 'apend_moderado_risco',
      value: 'moderado_risco',
      note: 'Alvarado 4 a 6: solicitar exame de imagem; se normal e paciente estável, considerar alta com orientações.'
    }
  }

  return {
    score,
    risk: 'baixo' as const,
    title: 'Baixo risco',
    nextStep: 'apend_baixo_risco',
    value: 'baixo_risco',
    note: 'Alvarado 0 a 3: baixa probabilidade. Considerar diagnósticos alternativos e alta com sintomáticos/orientações se estável.'
  }
}

export const getAppendicitisAntibioticOptions = () => [
  'Ceftriaxona 2 g EV de 24/24 horas + Metronidazol 500 mg EV de 8/8 horas',
  'Ciprofloxacino 400 mg EV de 12/12 horas + Metronidazol 500 mg EV de 8/8 horas',
  'Amoxicilina + Sulbactam 1,5 g EV de 8/8 horas',
  'Piperacilina + Tazobactam 4,5 g EV de 6/6 horas'
]

export const buildAppendicitisPrescriptionItems = (
  antibioticScheme: AppendicitisAntibioticScheme = 'ceftriaxone_metronidazole',
  includeAntibiotics = true
): PrescriptionDraft[] => {
  const antibiotics: Record<AppendicitisAntibioticScheme, PrescriptionDraft[]> = {
    ceftriaxone_metronidazole: [
      {
        medication: 'Ceftriaxona',
        dosage: '2 g + 100 mL SF 0,9%',
        frequency: 'EV em 30 minutos de 24/24 horas',
        duration: 'Conforme conduta cirúrgica',
        instructions: 'Esquema sugerido para apendicite aguda, associado a metronidazol.',
        prescribedBy: 'Fluxograma Apendicite Aguda'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg/100 mL',
        frequency: 'EV em 20 minutos de 8/8 horas',
        duration: 'Conforme conduta cirúrgica',
        instructions: 'Associado à ceftriaxona no esquema sugerido.',
        prescribedBy: 'Fluxograma Apendicite Aguda'
      }
    ],
    ciprofloxacin_metronidazole: [
      {
        medication: 'Ciprofloxacino',
        dosage: '400 mg EV',
        frequency: '12/12 horas',
        duration: 'Conforme conduta cirúrgica',
        instructions: 'Associar a metronidazol; ajustar conforme função renal e protocolo local.',
        prescribedBy: 'Fluxograma Apendicite Aguda'
      },
      {
        medication: 'Metronidazol',
        dosage: '500 mg EV',
        frequency: '8/8 horas',
        duration: 'Conforme conduta cirúrgica',
        instructions: 'Associado ao ciprofloxacino no esquema sugerido.',
        prescribedBy: 'Fluxograma Apendicite Aguda'
      }
    ],
    ampicillin_sulbactam: [
      {
        medication: 'Amoxicilina + Sulbactam',
        dosage: '1,5 g EV',
        frequency: '8/8 horas',
        duration: 'Conforme conduta cirúrgica',
        instructions: 'Opção conforme perfil de susceptibilidade local.',
        prescribedBy: 'Fluxograma Apendicite Aguda'
      }
    ],
    piperacillin_tazobactam: [
      {
        medication: 'Piperacilina + Tazobactam',
        dosage: '4,5 g EV',
        frequency: '6/6 horas',
        duration: 'Conforme conduta cirúrgica',
        instructions: 'Opção para quadro complicado ou conforme protocolo institucional.',
        prescribedBy: 'Fluxograma Apendicite Aguda'
      }
    ]
  }

  return [
    {
      medication: 'Dieta oral zero',
      dosage: 'Manter jejum',
      frequency: 'Até definição do procedimento',
      duration: 'Reavaliar diariamente',
      instructions: 'Jejum até definição diagnóstica e avaliação da cirurgia geral.',
      prescribedBy: 'Fluxograma Apendicite Aguda'
    },
    {
      medication: 'Soro glicosado 5% + NaCl 10% + KCl 10%',
      dosage: '500 mL + 10 mL + 10 mL',
      frequency: 'EV de 6/6 horas',
      duration: 'Conforme volemia e eletrólitos',
      instructions: 'Individualizar conforme função renal, eletrólitos e metas hemodinâmicas.',
      prescribedBy: 'Fluxograma Apendicite Aguda'
    },
    ...(includeAntibiotics ? antibiotics[antibioticScheme] : []),
    {
      medication: 'Dipirona',
      dosage: '1 g EV',
      frequency: '6/6 horas se dor ou febre',
      duration: 'Conforme necessidade',
      instructions: 'Equivale a 2 mL da apresentação 500 mg/mL diluídos em AD ou SF.',
      prescribedBy: 'Fluxograma Apendicite Aguda'
    },
    {
      medication: 'Tramadol',
      dosage: '100 mg + 100 mL SF 0,9%',
      frequency: 'EV em 30 minutos se dor intensa',
      duration: 'Conforme necessidade',
      instructions: 'Monitorar sedação, náuseas e risco de queda.',
      prescribedBy: 'Fluxograma Apendicite Aguda'
    },
    {
      medication: 'Bromoprida',
      dosage: '10 mg EV',
      frequency: 'Se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Alternativa antiemética conforme disponibilidade e contraindicações.',
      prescribedBy: 'Fluxograma Apendicite Aguda'
    }
  ]
}

export const buildAppendicitisLowRiskPrescriptionItems = (): PrescriptionDraft[] => [
  {
    medication: 'Dipirona ou Paracetamol',
    dosage: 'Dipirona 1 g VO ou Paracetamol 500-750 mg VO',
    frequency: '6/6 horas se dor ou febre',
    duration: 'Conforme necessidade',
    instructions: 'Retornar imediatamente se piora da dor, febre persistente, vômitos, queda do estado geral ou sinais peritoneais.',
    prescribedBy: 'Fluxograma Apendicite Aguda'
  },
  {
    medication: 'Ondansetrona',
    dosage: '4 mg VO',
    frequency: '8/8 horas se náuseas ou vômitos',
    duration: 'Conforme necessidade',
    instructions: 'Alternativa conforme disponibilidade e contraindicações.',
    prescribedBy: 'Fluxograma Apendicite Aguda'
  }
]

export const hasAppendicitisPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Apendicite Aguda')
      .map((item) => item.medication)
  )
  return names.has('Dipirona ou Paracetamol') || (names.has('Dieta oral zero') && names.has('Dipirona') && (names.has('Ceftriaxona') || names.has('Ciprofloxacino') || names.has('Amoxicilina + Sulbactam') || names.has('Piperacilina + Tazobactam')))
}
