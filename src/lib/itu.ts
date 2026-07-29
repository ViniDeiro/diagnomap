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
  levofloxacino_prostatite: {
    medication: 'Levofloxacino',
    dosage: '500 mg',
    frequency: 'VO uma vez ao dia',
    duration: '2–4 semanas, conforme resposta, cultura e protocolo local',
    instructions: 'Reavaliar em 48–72 horas. Revisar função renal, interações, contraindicações, exposição prévia a fluoroquinolona, resistência local e resultado da urocultura/TSA.',
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
  sulfametoxazol_trimetoprim_homem: {
    medication: 'Sulfametoxazol-trimetoprim',
    dosage: '800/160 mg',
    frequency: 'VO de 12/12 horas',
    duration: '7 dias',
    instructions: 'Opção para ITU localizada no homem quando houver sensibilidade provável ou confirmada e ausência de sinais prostáticos/sistêmicos. Ajustar à função renal e revisar alergias, interações e urocultura/TSA.',
    prescribedBy: ITU_PRESCRIBER
  },
  ciprofloxacino_homem: {
    medication: 'Ciprofloxacino',
    dosage: '500 mg',
    frequency: 'VO de 12/12 horas',
    duration: '7 dias',
    instructions: 'Reservar para ITU localizada no homem quando resistência local, TSA, exposição recente e contraindicações permitirem. Reavaliar se surgirem febre, dor perineal, retenção ou sinais sistêmicos.',
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
    dosage: '2 g',
    frequency: 'EV uma vez ao dia',
    duration: '7 dias',
    instructions: 'Preparo EV de referência: reconstituir o frasco de 1 g com 9,6 mL de diluente IV compatível (aproximadamente 100 mg/mL), retirar a dose e diluir em 50–100 mL de SF 0,9% ou SG 5%; infundir em 30 minutos. Não usar soluções contendo cálcio, como Ringer lactato. Confirmar a bula da apresentação padronizada, ajustar a duração conforme evolução clínica e urocultura/TSA, e reavaliar diariamente para ajuste ou descalonamento.',
    prescribedBy: ITU_PRESCRIBER
  },
  ampicilina_ev: {
    medication: 'Ampicilina',
    dosage: '2 g',
    frequency: 'EV de 4/4 a 6/6 horas, conforme protocolo e função renal',
    duration: 'Definir conforme síndrome, cultura, resposta e controle do foco',
    instructions: 'Componente do esquema ampicilina + gentamicina. Confirmar alergias, função renal, suspeita de Enterococcus e protocolo institucional; ajustar ou descalonar conforme culturas.',
    prescribedBy: ITU_PRESCRIBER
  },
  gentamicina_ev: {
    medication: 'Gentamicina',
    dosage: '6–7 mg/kg',
    frequency: 'EV uma vez ao dia, com individualização farmacocinética',
    duration: 'Reavaliar diariamente; limitar exposição conforme resposta e cultura',
    instructions: 'Calcular pelo peso apropriado e protocolo institucional. Ajustar à função renal, monitorar níveis quando indicado e vigiar nefrotoxicidade e ototoxicidade.',
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
  },
  aztreonam_ev: {
    medication: 'Aztreonam',
    dosage: '2 g',
    frequency: 'EV de 8/8 horas',
    duration: 'Definir conforme resposta, cultura e controle do foco',
    instructions: 'Alternativa em alergia imediata grave a beta-lactâmicos, com cobertura de Gram-negativos, inclusive Pseudomonas, mas sem cobertura de Gram-positivos ou anaeróbios. Ajustar à função renal e discutir associação apenas quando o contexto clínico/microbiológico e o protocolo local indicarem.',
    prescribedBy: ITU_PRESCRIBER
  },
  ceftriaxona_procedimento_urologico: {
    medication: 'Ceftriaxona', dosage: '1 g', frequency: 'EV, dose perioperatória dirigida pelo TSA', duration: '1 dose; excepcionalmente 2 doses conforme protocolo',
    instructions: 'Administrar em geral 30–60 minutos antes do procedimento com trauma de mucosa. Confirmar sensibilidade, alergias, função renal/hepática, horário cirúrgico e protocolo da urologia.', prescribedBy: ITU_PRESCRIBER
  },
  ciprofloxacino_procedimento_urologico: {
    medication: 'Ciprofloxacino', dosage: '400 mg', frequency: 'EV, dose perioperatória dirigida pelo TSA', duration: '1 dose; excepcionalmente 2 doses conforme protocolo',
    instructions: 'Administrar em geral 30–60 minutos antes do procedimento. Confirmar sensibilidade, função renal, QT, interações, alergias e protocolo da urologia.', prescribedBy: ITU_PRESCRIBER
  },
  sulfametoxazol_procedimento_urologico: {
    medication: 'Sulfametoxazol-trimetoprim', dosage: '800/160 mg', frequency: 'VO, dose perioperatória dirigida pelo TSA', duration: '1 dose; excepcionalmente 2 doses conforme protocolo',
    instructions: 'Confirmar sensibilidade, função renal, alergia a sulfa, interações e horário do procedimento com a urologia.', prescribedBy: ITU_PRESCRIBER
  },
  fluconazol_candiduria_procedimento: {
    medication: 'Fluconazol', dosage: '400 mg (6 mg/kg)', frequency: 'VO ou EV uma vez ao dia', duration: 'Alguns dias antes e após o procedimento, conforme infectologia/urologia',
    instructions: 'Usar somente se a espécie for sensível. Ajustar à função renal e revisar função hepática, QT, interações e gestação.', prescribedBy: ITU_PRESCRIBER
  },
  anfotericina_candiduria_procedimento: {
    medication: 'Anfotericina B desoxicolato', dosage: '0,3–0,6 mg/kg', frequency: 'EV uma vez ao dia', duration: 'Alguns dias antes e após o procedimento, conforme infectologia/urologia',
    instructions: 'Uso hospitalar. Confirmar formulação desoxicolato, peso, função renal, potássio e magnésio; monitorar reação infusional e nefrotoxicidade.', prescribedBy: ITU_PRESCRIBER
  },
  fluconazol_candiduria_cistite: {
    medication: 'Fluconazol', dosage: '200 mg', frequency: 'VO uma vez ao dia', duration: '14 dias',
    instructions: 'Somente para cistite sintomática por espécie sensível. Ajustar à função renal e revisar função hepática, QT, interações e gestação; remover/trocar cateter quando possível.', prescribedBy: ITU_PRESCRIBER
  },
  anfotericina_candiduria_resistente: {
    medication: 'Anfotericina B desoxicolato', dosage: '0,3–0,6 mg/kg', frequency: 'EV uma vez ao dia', duration: '1–7 dias, conforme espécie, síndrome e infectologia',
    instructions: 'Uso hospitalar para infecção urinária por Candida resistente selecionada. Confirmar formulação, função renal e eletrólitos; monitorar reação infusional e nefrotoxicidade.', prescribedBy: ITU_PRESCRIBER
  },
  flucitosina_candiduria: {
    medication: 'Flucitosina', dosage: '25 mg/kg', frequency: 'VO de 6/6 horas', duration: '7–10 dias, conforme espécie e infectologia',
    instructions: 'Quando disponível e indicada. Ajustar obrigatoriamente à função renal e monitorar hemograma, função hepática e toxicidade; confirmar sensibilidade.', prescribedBy: ITU_PRESCRIBER
  },
  fluconazol_candiduria_pielo: {
    medication: 'Fluconazol', dosage: '200–400 mg', frequency: 'VO ou EV uma vez ao dia', duration: '14 dias',
    instructions: 'Pielonefrite por Candida sensível: internar, excluir fungemia/obstrução, ajustar à função renal e acionar infectologia/urologia.', prescribedBy: ITU_PRESCRIBER
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
  if (choice === 'ampicilina_gentamicina') {
    return [{ ...ituAntibioticPrescriptions.ampicilina_ev }, { ...ituAntibioticPrescriptions.gentamicina_ev }]
  }
  const prescription = choice ? ituAntibioticPrescriptions[choice] : undefined
  if (!prescription) return []
  const items = [{ ...prescription }]
  if (choice && ituCistiteChoices.has(choice)) {
    items.push(...ituCistiteSymptomaticPrescriptions.map((item) => ({ ...item })))
  }
  return items
}
