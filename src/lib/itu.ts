import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export const ITU_PRESCRIBER = 'Fluxograma ITU'

const ituAntibioticPrescriptions: Record<string, PrescriptionDraft> = {
  fosfomicina: {
    medication: 'Fosfomicina trometamol',
    dosage: '3 g',
    frequency: 'VO, dose única',
    duration: 'Dose única',
    instructions: 'Dissolver 1 envelope em água. Ajustar à urocultura/TSA e ao contexto clínico quando aplicável.',
    prescribedBy: ITU_PRESCRIBER
  },
  nitrofurantoina: {
    medication: 'Nitrofurantoína',
    dosage: '100 mg',
    frequency: 'VO de 6/6 horas',
    duration: '5 dias',
    instructions: 'Não utilizar para pielonefrite. Revisar função renal, gestação próxima do termo, deficiência de G6PD e alergias.',
    prescribedBy: ITU_PRESCRIBER
  },
  cefuroxima: {
    medication: 'Cefuroxima',
    dosage: '250 mg',
    frequency: 'VO de 12/12 horas',
    duration: '5 dias',
    instructions: 'Ajustar à função renal, alergias e resultado da urocultura/TSA quando disponível.',
    prescribedBy: ITU_PRESCRIBER
  },
  sulfametoxazol_trimetoprim: {
    medication: 'Sulfametoxazol-trimetoprim',
    dosage: '800/160 mg',
    frequency: 'VO de 12/12 horas',
    duration: '3 dias',
    instructions: 'Evitar em gestação, alergia a sulfa, interação relevante, resistência conhecida ou uso recente. Ajustar à função renal.',
    prescribedBy: ITU_PRESCRIBER
  },
  ciprofloxacino_vo: {
    medication: 'Ciprofloxacino',
    dosage: '500 mg',
    frequency: 'VO de 12/12 horas',
    duration: '7 dias',
    instructions: 'Revisar interações, função renal, contraindicações e ajustar conforme urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  levofloxacino_vo: {
    medication: 'Levofloxacino',
    dosage: '750 mg',
    frequency: 'VO uma vez ao dia',
    duration: '5 dias',
    instructions: 'Revisar interações, função renal, contraindicações e ajustar conforme urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  amoxicilina_clavulanato_vo: {
    medication: 'Amoxicilina-clavulanato',
    dosage: '875/125 mg',
    frequency: 'VO de 12/12 horas',
    duration: '7 dias',
    instructions: 'Revisar alergias e ajustar conforme função renal e urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  ceftriaxona_ev: {
    medication: 'Ceftriaxona',
    dosage: '1 g',
    frequency: 'EV uma vez ao dia',
    duration: 'Conforme evolução clínica e urocultura/TSA',
    instructions: 'Reavaliar diariamente para ajuste ou descalonamento do antimicrobiano.',
    prescribedBy: ITU_PRESCRIBER
  },
  ciprofloxacino_ev: {
    medication: 'Ciprofloxacino',
    dosage: '400 mg',
    frequency: 'EV de 12/12 horas',
    duration: 'Conforme evolução clínica e urocultura/TSA',
    instructions: 'Ajustar à função renal e reavaliar contraindicações e interações.',
    prescribedBy: ITU_PRESCRIBER
  },
  piperacilina_tazobactam: {
    medication: 'Piperacilina-tazobactam',
    dosage: '4,5 g',
    frequency: 'EV de 6/6 horas',
    duration: 'Conforme evolução clínica e urocultura/TSA',
    instructions: 'Ajustar à função renal e descalonar conforme culturas e resposta clínica.',
    prescribedBy: ITU_PRESCRIBER
  },
  meropenem: {
    medication: 'Meropenem',
    dosage: '1 g',
    frequency: 'EV de 8/8 horas',
    duration: 'Conforme evolução clínica e urocultura/TSA',
    instructions: 'Reservar para quadro grave ou alto risco de resistência; ajustar à função renal e descalonar quando possível.',
    prescribedBy: ITU_PRESCRIBER
  }
}

export const buildItuPrescriptionItems = (choice?: string): PrescriptionDraft[] => {
  const prescription = choice ? ituAntibioticPrescriptions[choice] : undefined
  return prescription ? [{ ...prescription }] : []
}
