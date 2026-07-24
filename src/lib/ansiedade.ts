import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export const ANSIEDADE_PRESCRIBER = 'Fluxograma Crise de Ansiedade'

export type AnsiedadeMedicationCode = 'clonazepam_tablet' | 'clonazepam_drops' | 'diazepam' | 'alprazolam'

export const ANSIEDADE_MEDICATION_OPTIONS: Array<{
  code: AnsiedadeMedicationCode
  label: string
  dose: string
  note: string
}> = [
  { code: 'clonazepam_tablet', label: 'Clonazepam comprimido', dose: '0,25 a 0,5 mg VO', note: 'Dose única no pronto-socorro e reavaliar antes de repetir.' },
  { code: 'clonazepam_drops', label: 'Clonazepam solução 2 mg/mL', dose: '5 a 10 gotas VO', note: 'Alternativa quando houver dificuldade com comprimido.' },
  { code: 'diazepam', label: 'Diazepam', dose: '5 mg VO', note: 'Maior cautela em idosos, pessoas frágeis e risco de sedação.' },
  { code: 'alprazolam', label: 'Alprazolam', dose: '0,25 a 0,5 mg VO', note: 'Evitar continuidade sem seguimento longitudinal.' }
]

export const ANSIEDADE_ORGANIC_RED_FLAGS = [
  'Dor precordial ou sintomas compatíveis com síndrome coronariana aguda',
  'Taquicardia sustentada, irregularidade do pulso ou suspeita de arritmia',
  'Parestesias com sinais focais, assimetria, alteração de fala ou suspeita de AVC',
  'Dispneia, sibilância, hipoxemia ou suspeita de exacerbação de DPOC',
  'Rebaixamento do nível de consciência, intoxicação, hipoglicemia ou outra causa metabólica'
]

export const ANSIEDADE_NON_PHARMACOLOGICAL_STEPS = [
  'Acolher e tranquilizar, explicando que os sintomas podem ocorrer na crise e não representam risco imediato de morte após exclusão de causas orgânicas.',
  'Demonstrar empatia, validar sensações como reais e perguntar sobre fatores de estresse.',
  'Explicar que a crise é comum, passageira e costuma durar entre 10 e 30 minutos.',
  'Orientar respiração diafragmática, limitando uso de musculatura intercostal.'
]

export const buildAnsiedadePrescriptionItems = (code: AnsiedadeMedicationCode = 'clonazepam_tablet'): PrescriptionDraft[] => {
  const option = ANSIEDADE_MEDICATION_OPTIONS.find(item => item.code === code) || ANSIEDADE_MEDICATION_OPTIONS[0]
  const [dosage, route = 'VO'] = option.dose.split(' VO')
  return [{
    medication: option.label,
    dosage,
    frequency: `${route.trim() || 'VO'} dose única e reavaliar`,
    duration: 'Uso no pronto-socorro',
    instructions: `${option.note} Evitar se sedação excessiva, intoxicação por álcool/outros depressores, risco respiratório ou contraindicação clínica.`,
    prescribedBy: ANSIEDADE_PRESCRIBER
  }]
}

export const getAnsiedadeMedicationAlternatives = () => [
  'Clonazepam solução oral 2 mg/mL: fazer 5 a 10 gotas e reavaliar.',
  'Diazepam 5 mg VO e reavaliar.',
  'Alprazolam 0,25 a 0,5 mg VO e reavaliar.'
]

export const hasAnsiedadePrescriptionSet = (prescriptions: Prescription[]) => {
  return prescriptions.some(item => item.prescribedBy === ANSIEDADE_PRESCRIBER)
}
