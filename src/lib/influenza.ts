import type { Patient, Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export const INFLUENZA_SEVERITY_SIGNS = [
  'SpO2 <95% (ar ambiente)',
  'Desconforto / Insuficiência respiratória',
  'Dispneia',
  'Exacerbação de doenças pré-existentes'
]

export const INFLUENZA_RISK_FACTORS = [
  'População indígena sem acesso assistencial facilitado',
  'Criança com menos de 2 anos',
  'Adulto com 60 anos ou mais',
  'Gestante',
  'Obesidade com IMC maior que 30',
  'Imunossupressão (HIV, transplante ou uso de imunossupressores)',
  'Doença crônica relevante (diabetes, cardiopatia, pneumopatia, hepatopatia, doença neuromuscular, hematológica ou metabólica)',
  'Profissional de saúde ou cuidador de instituição de longa permanência'
]

export const INFLUENZA_WORSENING_SIGNS = [
  'Manutenção de febre por mais de 3 dias ou agravamento da febre',
  'Desidratação',
  'Exacerbação de sintomas gastrointestinais na população pediátrica',
  'Alterações do estado mental (confusão, sonolência excessiva ou desorientação)'
]

export const INFLUENZA_ICU_CRITERIA = [
  'Saturação <90% apesar de oxigênio suplementar',
  'FR >30 irpm persistente',
  'Uso de musculatura acessória',
  'Alteração do nível de consciência',
  'Hipotensão',
  'Lactato elevado',
  'Necessidade de ventilação não invasiva',
  'Necessidade de cânula nasal de alto fluxo',
  'Choque ou falência orgânica'
]

export const INFLUENZA_ICU_CRITERIA_INFO: Record<string, string> = {
  'Saturação <90% apesar de oxigênio suplementar':
    'Hipoxemia persistente apesar de oxigênio suplementar sugere insuficiência respiratória grave e risco de necessidade de suporte ventilatório avançado.',
  'FR >30 irpm persistente':
    'Taquipneia persistente acima de 30 irpm indica aumento importante do trabalho respiratório e risco de fadiga muscular.',
  'Uso de musculatura acessória':
    'Uso de musculatura acessória, tiragens ou esforço respiratório sustentado indicam desconforto respiratório importante e possível falência ventilatória iminente.',
  'Alteração do nível de consciência':
    'Confusão, sonolência excessiva, agitação ou rebaixamento podem indicar hipoxemia, hipercapnia, sepse ou disfunção orgânica.',
  'Hipotensão':
    'Hipotensão em síndrome gripal/SRAG deve levantar suspeita de sepse, choque ou hipovolemia significativa, exigindo monitorização estreita.',
  'Lactato elevado':
    'Lactato elevado sugere hipoperfusão tecidual ou sepse e deve acelerar avaliação intensiva e investigação de falência orgânica.',
  'Necessidade de ventilação não invasiva':
    'Necessidade de VNI indica insuficiência respiratória com demanda de suporte ventilatório e vigilância em ambiente com resposta rápida.',
  'Necessidade de cânula nasal de alto fluxo':
    'Necessidade de alto fluxo indica demanda elevada de FiO2/fluxo e risco de progressão para suporte ventilatório invasivo.',
  'Choque ou falência orgânica':
    'Choque ou falência orgânica representa doença sistêmica grave, com necessidade de suporte hemodinâmico, respiratório ou multiorgânico.'
}

const INFLUENZA_PRESCRIPTION_MEDICATIONS = [
  'Fosfato de Oseltamivir',
  'Acetilcisteína',
  'Paracetamol ou Dipirona',
  'Metoclopramida ou Ondansetrona',
  'Budesonida spray nasal',
  'Lavagem nasal com soro fisiológico 0,9%'
]

export const getInfluenzaAgeInMonths = (birthDate?: Date) => {
  if (!birthDate) return 0
  const now = new Date()
  const birth = new Date(birthDate)
  return Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)))
}

export const getOseltamivirDoseText = (patient: Pick<Patient, 'age' | 'birthDate' | 'weight'>) => {
  const ageYears = patient.age || 0
  const ageMonths = getInfluenzaAgeInMonths(patient.birthDate)
  const weight = patient.weight

  if (ageYears >= 18) {
    return '75 mg VO de 12/12 horas por 5 dias'
  }

  if (ageMonths > 0 && ageMonths < 12) {
    if (ageMonths < 3) return '12 mg VO de 12/12 horas por 5 dias'
    if (ageMonths < 6) return '20 mg VO de 12/12 horas por 5 dias'
    return '25 mg VO de 12/12 horas por 5 dias'
  }

  if (weight == null || weight <= 0) {
    return '30 a 75 mg VO de 12/12 horas por 5 dias, conforme peso/faixa etária'
  }

  if (weight < 15) return '30 mg VO de 12/12 horas por 5 dias'
  if (weight <= 23) return '45 mg VO de 12/12 horas por 5 dias'
  if (weight <= 40) return '60 mg VO de 12/12 horas por 5 dias'
  return '75 mg VO de 12/12 horas por 5 dias'
}

export const buildInfluenzaPrescriptionItems = (
  patient: Pick<Patient, 'age' | 'birthDate' | 'weight'>,
  includeOseltamivir: boolean
): PrescriptionDraft[] => {
  const isAdult = (patient.age || 0) >= 18
  const prescriptions: PrescriptionDraft[] = []

  if (includeOseltamivir) {
    prescriptions.push({
      medication: 'Fosfato de Oseltamivir',
      dosage: getOseltamivirDoseText(patient),
      frequency: '12/12 horas',
      duration: '5 dias',
      instructions: 'Idealmente iniciar nas primeiras 48 horas. Ajustar se houver disfunção renal.',
      prescribedBy: 'Fluxograma Influenza'
    })
  }

  prescriptions.push(
    {
      medication: 'Acetilcisteína',
      dosage: isAdult
        ? 'Xarope 40 mg/mL: 15 mL 1x/dia ou granulado 600 mg: 1 envelope 1x/dia'
        : 'Avaliar apresentação pediátrica conforme idade e tolerância',
      frequency: '1x/dia',
      duration: '5 dias',
      instructions: 'Uso oral, como sintomático para secreção/irritação de vias aéreas.',
      prescribedBy: 'Fluxograma Influenza'
    },
    {
      medication: 'Paracetamol ou Dipirona',
      dosage: isAdult
        ? 'Paracetamol 500 mg ou Dipirona 1 g'
        : 'Paracetamol 10-15 mg/kg/dose ou Dipirona 10 mg/kg/dose',
      frequency: 'VO a cada 6 horas, se febre ou dor',
      duration: 'Conforme necessidade',
      instructions: 'Utilizar um ou outro antitérmico/analgésico, conforme disponibilidade e perfil do paciente.',
      prescribedBy: 'Fluxograma Influenza'
    },
    {
      medication: 'Metoclopramida ou Ondansetrona',
      dosage: isAdult
        ? 'Metoclopramida 10 mg VO/EV/IM ou Ondansetrona 4 mg VO/EV'
        : 'Metoclopramida: contraindicada em menores de 1 ano; 1-3 anos: 1 mg VO 2-3x/dia; 3-5 anos: 2 mg VO 2-3x/dia; 5-14 anos: 2,5-5 mg VO 3x/dia',
      frequency: isAdult ? 'A cada 8 horas, se náuseas ou vômitos' : 'Conforme faixa etária, se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: isAdult
        ? 'Usar apenas se houver sintomas gastrointestinais. Para preparo de exame radiológico do trato gastrointestinal, metoclopramida pode ser usada 10 minutos antes do exame conforme protocolo local.'
        : 'Dose máxima usual de metoclopramida: 0,5 mg/kg/dia, com teto prático de 60 mg/dia ou 20 mg/dose. Considerar ondansetrona conforme protocolo pediátrico local.',
      prescribedBy: 'Fluxograma Influenza'
    },
    {
      medication: 'Budesonida spray nasal',
      dosage: '50 mcg',
      frequency: 'Aplicar 1 a 2 jatos em cada narina de 12/12 horas',
      duration: '10 dias',
      instructions: 'Uso nasal.',
      prescribedBy: 'Fluxograma Influenza'
    },
    {
      medication: 'Lavagem nasal com soro fisiológico 0,9%',
      dosage: 'Volume livre conforme conforto',
      frequency: 'Repetir ao longo do dia',
      duration: 'Enquanto houver congestão',
      instructions: 'Realizar higiene/lavagem nasal com seringa ou frasco apropriado.',
      prescribedBy: 'Fluxograma Influenza'
    }
  )

  return prescriptions
}

export const hasInfluenzaPrescriptionSet = (
  prescriptions: Prescription[],
  includeOseltamivir: boolean
) => {
  const medicationNames = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Influenza')
      .map((item) => item.medication)
  )

  const requiredSupportiveMedications = INFLUENZA_PRESCRIPTION_MEDICATIONS
    .filter((item) => item !== 'Fosfato de Oseltamivir')
  const hasSupportivePrescriptionSet = requiredSupportiveMedications
    .every((item) => medicationNames.has(item))

  if (includeOseltamivir) {
    return medicationNames.has('Fosfato de Oseltamivir') && hasSupportivePrescriptionSet
  }

  return hasSupportivePrescriptionSet
}
