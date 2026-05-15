import type { Patient, Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type PancreatitisBisapKey =
  | 'bunMaior25'
  | 'alteracaoMental'
  | 'sirs'
  | 'idadeMaior60'
  | 'derramePleural'

export type PancreatitisMarshallValues = {
  cardiovascular: number
  respiratory: number
  renal: number
  persistentOrganFailure: boolean
  transientOrganFailure: boolean
  localOrSystemicComplication: boolean
}

export const PANCREATITIS_INITIAL_EXAMS = [
  'Hemograma completo',
  'PCR',
  'Gasometria e lactato',
  'Amilase e lipase',
  'TGO e TGP',
  'FA e GGT',
  'Ureia e creatinina',
  'Na, K, Ca, P',
  'EAS / urina tipo 1',
  'USG de abdome',
  'Triglicérides'
]

export const PANCREATITIS_ETIOLOGY_ITEMS = [
  'Alcoolismo',
  'Histórico de colelitíase',
  'CPRE recente',
  'Hipertrigliceridemia',
  'Fármacos',
  'Hipercalcemia'
]

export const PANCREATITIS_ICU_CRITERIA = [
  'FC < 40 ou > 150 bpm',
  'PAS < 80 mmHg ou PAM < 60 mmHg',
  'FR > 35 irpm',
  'Sódio < 110 ou > 170 mEq/L',
  'Potássio < 2,0 ou > 7,0 mEq/L',
  'PaO2 < 50 mmHg',
  'pH < 7,1 ou > 7,7',
  'Glicemia > 800 mg/dL',
  'Cálcio sérico > 15 mg/dL',
  'Anúria',
  'Coma'
]

export const defaultPancreatitisBisapValues = (patient: Pick<Patient, 'age'>): Record<PancreatitisBisapKey, boolean> => ({
  bunMaior25: false,
  alteracaoMental: false,
  sirs: false,
  idadeMaior60: typeof patient.age === 'number' ? patient.age > 60 : false,
  derramePleural: false
})

export const defaultPancreatitisMarshallValues = (): PancreatitisMarshallValues => ({
  cardiovascular: 0,
  respiratory: 0,
  renal: 0,
  persistentOrganFailure: false,
  transientOrganFailure: false,
  localOrSystemicComplication: false
})

export const calculatePancreatitisBisap = (values: Record<PancreatitisBisapKey, boolean>) => {
  const score = Object.values(values).filter(Boolean).length
  return {
    score,
    highRisk: score >= 3,
    label: score >= 3 ? 'Alto risco à beira-leito' : 'Baixo/intermediário risco pelo BISAP',
    note: score >= 3 ? 'BISAP >= 3 sugere maior mortalidade e necessidade de vigilância intensiva.' : 'Manter reavaliação clínica e laboratorial frequente.'
  }
}

export const calculatePancreatitisMarshall = (values: PancreatitisMarshallValues) => {
  const maxScore = Math.max(values.cardiovascular, values.respiratory, values.renal)
  const hasOrganFailure = maxScore >= 2
  if (values.persistentOrganFailure && hasOrganFailure) {
    return {
      maxScore,
      hasOrganFailure,
      severity: 'grave' as const,
      title: 'Pancreatite aguda grave',
      nextStep: 'pan_grave',
      value: 'grave'
    }
  }
  if (values.transientOrganFailure || values.localOrSystemicComplication || hasOrganFailure) {
    return {
      maxScore,
      hasOrganFailure,
      severity: 'moderada' as const,
      title: 'Pancreatite aguda moderadamente grave',
      nextStep: 'pan_moderada',
      value: 'moderada'
    }
  }
  return {
    maxScore,
    hasOrganFailure,
    severity: 'leve' as const,
    title: 'Pancreatite aguda leve',
    nextStep: 'pan_leve',
    value: 'leve'
  }
}

export const buildPancreatitisHospitalPrescriptionItems = (
  patient: Pick<Patient, 'weight'>,
  includeAntibiotic = false
): PrescriptionDraft[] => {
  const weight = typeof patient.weight === 'number' && patient.weight > 0 ? patient.weight : null
  const bolus = weight ? `${Math.round(weight * 10)} mL em bolus se hipovolêmico` : '10 mL/kg em bolus se hipovolêmico'
  const maintenance = weight ? `${Math.round(weight * 1.5)} mL/h de manutenção se euvolêmico` : '1,5 mL/kg/h de manutenção se euvolêmico'

  const items: PrescriptionDraft[] = [
    {
      medication: 'Ringer Lactato',
      dosage: `${bolus}; depois ${maintenance}`,
      frequency: 'EV conforme metas',
      duration: 'Reavaliar frequentemente',
      instructions: 'Guiar por PAM 65-85 mmHg, FC < 120 bpm, diurese > 0,5-1 mL/kg/h e hematócrito 35-44%. Evitar sobrecarga volêmica.',
      prescribedBy: 'Fluxograma Pancreatite Aguda'
    },
    {
      medication: 'Dipirona',
      dosage: '1 g EV lento',
      frequency: '4/4 horas se dor ou febre',
      duration: 'Conforme necessidade',
      instructions: 'Preferir via EV no manejo inicial da dor.',
      prescribedBy: 'Fluxograma Pancreatite Aguda'
    },
    {
      medication: 'Tramadol',
      dosage: '100 mg + 100 mL SF 0,9%',
      frequency: 'EV em 30 minutos até 6/6 horas se dor moderada/intensa',
      duration: 'Conforme necessidade',
      instructions: 'Opção opioide se analgesia simples insuficiente; monitorar sedação e náuseas.',
      prescribedBy: 'Fluxograma Pancreatite Aguda'
    },
    {
      medication: 'Ondansetrona',
      dosage: '8 mg EV',
      frequency: '8/8 horas se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Alternativas: bromoprida 10 mg EV 8/8h ou metoclopramida 10 mg EV lento 8/8h.',
      prescribedBy: 'Fluxograma Pancreatite Aguda'
    }
  ]

  if (includeAntibiotic) {
    items.push({
      medication: 'Piperacilina + Tazobactam',
      dosage: '4,5 g EV',
      frequency: '6/6 horas',
      duration: 'Conforme foco infeccioso e protocolo institucional',
      instructions: 'Antibiótico apenas se evidência de infecção sobreposta/necrose infectada. Não usar profilaticamente.',
      prescribedBy: 'Fluxograma Pancreatite Aguda'
    })
  }

  return items
}

export const hasPancreatitisPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Pancreatite Aguda')
      .map((item) => item.medication)
  )
  return names.has('Ringer Lactato') && names.has('Dipirona') && names.has('Ondansetrona')
}
