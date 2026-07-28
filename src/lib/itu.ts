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
  ciprofloxacino_prostatite: {
    medication: 'Ciprofloxacino',
    dosage: '500 mg',
    frequency: 'VO de 12/12 horas',
    duration: '2–4 semanas, conforme resposta, cultura e protocolo local',
    instructions: 'Reavaliar em 48–72 horas. Revisar função renal, interações, contraindicações, risco de resistência e resultado da urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  sulfametoxazol_trimetoprim_prostatite: {
    medication: 'Sulfametoxazol-trimetoprim',
    dosage: '800/160 mg',
    frequency: 'VO de 12/12 horas',
    duration: '2–4 semanas, conforme resposta, cultura e protocolo local',
    instructions: 'Utilizar se houver sensibilidade provável ou confirmada. Reavaliar em 48–72 horas e ajustar à função renal, interações, alergias e urocultura/TSA.',
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
  cefalexina_gestacao: {
    medication: 'Cefalexina',
    dosage: '500 mg',
    frequency: 'VO de 6/6 horas',
    duration: '5–7 dias',
    instructions: 'Uso na gestação após revisar alergias, função renal, urocultura/TSA e protocolo obstétrico. Programar cultura de controle conforme a linha de cuidado.',
    prescribedBy: ITU_PRESCRIBER
  },
  amoxicilina_clavulanato_gestacao: {
    medication: 'Amoxicilina-clavulanato',
    dosage: '875/125 mg',
    frequency: 'VO de 12/12 horas',
    duration: '5–7 dias',
    instructions: 'Utilizar quando o agente for sensível ou o protocolo local sustentar a escolha. Revisar alergias, função renal e organizar cultura de controle na gestação.',
    prescribedBy: ITU_PRESCRIBER
  },
  ceftriaxona_ev: {
    medication: 'Ceftriaxona',
    dosage: '1 g',
    frequency: 'EV uma vez ao dia',
    duration: '7 dias',
    instructions: 'Preparo EV de referência: reconstituir o frasco de 1 g com 9,6 mL de diluente IV compatível (aproximadamente 100 mg/mL), retirar a dose e diluir em 50–100 mL de SF 0,9% ou SG 5%; infundir em 30 minutos. Não usar soluções contendo cálcio, como Ringer lactato. Confirmar a bula da apresentação padronizada, ajustar a duração conforme evolução clínica e urocultura/TSA, e reavaliar diariamente para ajuste ou descalonamento.',
    prescribedBy: ITU_PRESCRIBER
  },
  ciprofloxacino_ev: {
    medication: 'Ciprofloxacino',
    dosage: '400 mg',
    frequency: 'EV de 12/12 horas',
    duration: '7 dias',
    instructions: 'Apresentação pronta de referência: 400 mg/200 mL (2 mg/mL), sem diluição adicional, em infusão EV durante 60 minutos. Se o serviço utilizar concentrado ou outra apresentação, preparar conforme a bula. Ajustar à função renal, revisar contraindicações e interações, e ajustar a duração conforme evolução clínica e urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  cefepime_ev: {
    medication: 'Cefepime',
    dosage: '2 g',
    frequency: 'EV de 8/8 a 12/12 horas, conforme gravidade e função renal',
    duration: '7 dias',
    instructions: 'Preparo EV de referência: reconstituir o frasco conforme a apresentação, diluir a dose em 50–100 mL de SF 0,9% ou SG 5% e infundir em aproximadamente 30 minutos. Ajustar obrigatoriamente à função renal e vigiar neurotoxicidade; confirmar bula e protocolo institucional, e ajustar a duração conforme evolução clínica e urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  piperacilina_tazobactam: {
    medication: 'Piperacilina-tazobactam',
    dosage: '4,5 g',
    frequency: 'EV de 6/6 horas',
    duration: '7 dias',
    instructions: 'Preparo EV de referência: reconstituir o frasco de 4,5 g com 20 mL de água para injetáveis, SF 0,9% ou SG 5%; depois diluir em 50–150 mL de solução compatível e infundir por pelo menos 30 minutos. Confirmar a bula e o protocolo institucional, ajustar à função renal e descalonar conforme culturas, resposta e duração clínica.',
    prescribedBy: ITU_PRESCRIBER
  },
  meropenem: {
    medication: 'Meropenem',
    dosage: '1 g',
    frequency: 'EV de 8/8 horas',
    duration: '7 dias',
    instructions: 'Preparo EV de referência: reconstituir 1 g com 20 mL de água para injetáveis, diluir em 50–100 mL de SF 0,9% e infundir em 15–30 minutos. Confirmar a bula da apresentação e a estabilidade após preparo. Reservar para quadro grave ou alto risco de resistência, ajustar à função renal e descalonar conforme culturas, resposta e duração clínica.',
    prescribedBy: ITU_PRESCRIBER
  }
}

const ituCistiteSymptomaticPrescriptions: PrescriptionDraft[] = [
  {
    medication: 'Fenazopiridina',
    dosage: '200 mg',
    frequency: 'VO de 8/8 horas',
    duration: 'Máximo 2 dias',
    instructions: 'Analgésico urinário sintomático. Orientar que pode deixar a urina com coloração avermelhada/alaranjada durante o uso.',
    prescribedBy: ITU_PRESCRIBER
  },
  {
    medication: 'Dipirona 1 g ou Paracetamol 500 mg',
    dosage: '1 g ou 500 mg',
    frequency: 'VO de 6/6 horas',
    duration: 'Se dor ou febre',
    instructions: 'Utilizar conforme necessidade para dor ou febre, respeitando contraindicações.',
    prescribedBy: ITU_PRESCRIBER
  }
]

const ituCistiteChoices = new Set(['fosfomicina', 'nitrofurantoina', 'cefuroxima', 'sulfametoxazol_trimetoprim'])

export const buildItuPrescriptionItems = (choice?: string): PrescriptionDraft[] => {
  const prescription = choice ? ituAntibioticPrescriptions[choice] : undefined
  if (!prescription) return []
  const items = [{ ...prescription }]
  if (choice && ituCistiteChoices.has(choice)) {
    items.push(...ituCistiteSymptomaticPrescriptions.map((item) => ({ ...item })))
  }
  return items
}
