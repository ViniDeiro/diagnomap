import type { Patient, Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type AnaphylaxisAdjunctKey =
  | 'hypotension'
  | 'stridor'
  | 'dyspnea'
  | 'urticaria'
  | 'vomiting'

export const ANAPHYLAXIS_SKIN_MUCOSA_SIGNS = [
  'Prurido',
  'Urticária',
  'Rubor',
  'Angioedema de lábios, língua e/ou úvula'
]

export const ANAPHYLAXIS_RESPIRATORY_SIGNS = [
  'Dispneia',
  'Sibilos ou broncoespasmo',
  'Estridor, disfonia ou dificuldade para engolir',
  'Hipoxemia',
  'Queda de PFE'
]

export const ANAPHYLAXIS_CIRCULATORY_SIGNS = [
  'Hipotensão',
  'Síncope',
  'Colapso ou hipotonia',
  'Incontinência',
  'Sinais de choque'
]

export const ANAPHYLAXIS_GI_SIGNS = [
  'Dor abdominal severa',
  'Vômitos repetitivos',
  'Diarreia intensa'
]

export const ANAPHYLAXIS_KNOWN_ALLERGEN_CRITERIA = [
  'Hipotensão após alérgeno conhecido ou suspeito',
  'Broncoespasmo após alérgeno conhecido ou suspeito',
  'Envolvimento laríngeo após alérgeno conhecido ou suspeito'
]

export const ANAPHYLAXIS_HOME_ORIENTATIONS = [
  'Explicar que os sintomas podem reaparecer após a melhora inicial e revisar os sinais que exigem novo atendimento.',
  'Evitar o possível desencadeante até investigação especializada.',
  'Entregar plano escrito de ação e encaminhamento para alergologia/imunologia.',
  'Quando indicado e disponível, prescrever autoinjetor de adrenalina e demonstrar o uso ao paciente e ao cuidador.',
  'Orientar retorno imediato diante de falta de ar, ruído laríngeo, tontura, síncope, vômitos repetidos, urticária extensa ou edema de face/língua.'
]

export const ANAPHYLAXIS_ADJUNCT_CARDS: Record<AnaphylaxisAdjunctKey, { title: string; color: string; bullets: string[] }> = {
  hypotension: {
    title: 'Hipotensão / colapso',
    color: 'red',
    bullets: [
      'Oxigênio em alto fluxo',
      'Posição supina com extremidades elevadas',
      'Reposição volêmica com SF 0,9% ou Ringer em bolus',
      'Monitorar pressão arterial e perfusão'
    ]
  },
  stridor: {
    title: 'Estridor / envolvimento laríngeo',
    color: 'orange',
    bullets: [
      'Oxigênio em alto fluxo',
      'Manter sentado se houver desconforto respiratório',
      'Adrenalina nebulizada pode ser adjuvante conforme protocolo local',
      'Acionar suporte avançado de via aérea'
    ]
  },
  dyspnea: {
    title: 'Dispneia / broncoespasmo',
    color: 'yellow',
    bullets: [
      'Oxigênio em alto fluxo',
      'Manter sentado se houver desconforto respiratório',
      'Beta-2 agonista inalatório repetido conforme resposta',
      'O broncodilatador complementa, mas não substitui, novas doses de adrenalina IM'
    ]
  },
  urticaria: {
    title: 'Urticária / sintomas cutâneos',
    color: 'green',
    bullets: [
      'Após estabilizar A/B/C, considerar anti-histamínico não sedativo por via oral',
      'Reservar para prurido e lesões cutâneas persistentes',
      'Anti-histamínico não trata obstrução respiratória nem choque'
    ]
  },
  vomiting: {
    title: 'Náuseas / vômitos',
    color: 'blue',
    bullets: [
      'Antiemético se vômitos persistentes',
      'Ondansetrona conforme idade/peso e via disponível',
      'Reavaliar perfusão e risco de broncoaspiração'
    ]
  }
}

export const calculateAnaphylaxisAdrenalineDose = (patient: Pick<Patient, 'age' | 'weight'>) => {
  const weight = typeof patient.weight === 'number' && patient.weight > 0 ? patient.weight : null
  const age = typeof patient.age === 'number' ? patient.age : null

  // Em adulto/adolescente, a faixa etária prevalece sobre um peso ausente ou
  // eventualmente inconsistente no cadastro: 0,5 mg IM da solução 1 mg/mL.
  if (age !== null && age > 12) {
    return {
      label: 'Adolescente ou adulto',
      doseMg: 0.5,
      volumeMl: 0.5,
      rule: 'Dose fixa: 0,5 mg = 0,5 mL da solução 1 mg/mL (1:1000)'
    }
  }

  if (weight !== null && weight < 10) {
    const dose = Math.max(0.01, Math.min(0.1, weight * 0.01))
    return {
      label: 'Criança < 10 kg',
      doseMg: Number(dose.toFixed(2)),
      volumeMl: Number(dose.toFixed(2)),
      rule: '0,01 mg/kg = 0,01 mL/kg da solução 1 mg/mL (1:1000)'
    }
  }

  if (age !== null && age <= 5) {
    return {
      label: 'Criança 1-5 anos',
      doseMg: 0.15,
      volumeMl: 0.15,
      rule: 'Dose fixa: 0,15 mg = 0,15 mL da solução 1 mg/mL (1:1000)'
    }
  }

  if (age !== null && age <= 12) {
    return {
      label: 'Criança 6-12 anos',
      doseMg: 0.3,
      volumeMl: 0.3,
      rule: 'Dose fixa: 0,3 mg = 0,3 mL da solução 1 mg/mL (1:1000)'
    }
  }

  if (weight !== null && weight <= 30) {
    const dose = Math.min(0.3, weight * 0.01)
    return {
      label: 'Criança até 30 kg',
      doseMg: Number(dose.toFixed(2)),
      volumeMl: Number(dose.toFixed(2)),
      rule: '0,01 mg/kg, máximo usual pediátrico 0,3 mg'
    }
  }

  return {
    label: 'Adolescente ou adulto',
    doseMg: 0.5,
    volumeMl: 0.5,
    rule: 'Dose fixa: 0,5 mg = 0,5 mL da solução 1 mg/mL (1:1000)'
  }
}

export const buildAnaphylaxisDischargePrescriptionItems = (
  patient: Pick<Patient, 'age' | 'weight'>
): PrescriptionDraft[] => {
  const adult = (patient.age || 0) >= 12 || (patient.weight || 0) > 30

  return [
    {
      medication: adult ? 'Fexofenadina' : 'Fexofenadina solução oral',
      dosage: adult ? '180 mg' : '6 mg/mL, dose conforme idade/peso',
      frequency: 'VO 1x/dia',
      duration: 'Enquanto persistirem sintomas cutâneos, conforme avaliação médica',
      instructions: 'Opção apenas para prurido/urticária residual após estabilização; não previne reação bifásica nem substitui adrenalina.',
      prescribedBy: 'Fluxograma Anafilaxia'
    }
  ]
}

export const hasAnaphylaxisDischargePrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Anafilaxia')
      .map((item) => item.medication)
  )
  return Array.from(names).some((name) => name.includes('Fexofenadina'))
}
