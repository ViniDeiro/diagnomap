import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

const prescribedBy = 'Fluxograma Crise de Ansiedade'

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

export const buildAnsiedadePrescriptionItems = (): PrescriptionDraft[] => [
  {
    medication: 'Clonazepam',
    dosage: '0,25 a 0,5 mg',
    frequency: 'VO dose única e reavaliar',
    duration: 'Uso no pronto-socorro',
    instructions: 'Evitar se sedação excessiva, intoxicação por álcool/outros depressores, risco respiratório ou contraindicação clínica.',
    prescribedBy
  }
]

export const getAnsiedadeMedicationAlternatives = () => [
  'Clonazepam solução oral 2 mg/mL: fazer 5 a 10 gotas e reavaliar.',
  'Diazepam 5 mg VO e reavaliar.',
  'Alprazolam 0,25 a 0,5 mg VO e reavaliar.'
]

export const hasAnsiedadePrescriptionSet = (prescriptions: Prescription[]) => {
  return prescriptions.some(
    (item) => item.prescribedBy === prescribedBy && item.medication === 'Clonazepam'
  )
}
