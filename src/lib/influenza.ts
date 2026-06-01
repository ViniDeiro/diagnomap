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
  'Persistência ou agravamento da febre por mais de 3 dias',
  'Miosite comprovada por CPK elevada',
  'Alteração do sensório',
  'Desidratação',
  'Em crianças, exacerbação de sintomas gastrointestinais'
]

export const INFLUENZA_ICU_CRITERIA = [
  'Choque',
  'Disfunção de órgãos vitais',
  'Insuficiência respiratória',
  'Instabilidade hemodinâmica'
]

export const INFLUENZA_ICU_CRITERIA_INFO: Record<string, string> = {
  'Choque':
    'Choque é uma síndrome de falência circulatória aguda em que a oferta e/ou utilização de oxigênio tornam-se insuficientes para sustentar o metabolismo celular, levando à hipoperfusão tecidual, disfunção orgânica progressiva e risco de morte.',
  'Disfunção de órgãos vitais':
    'Disfunção de órgãos vitais é o comprometimento agudo ou progressivo da função de órgãos essenciais à homeostase sistêmica, com incapacidade parcial ou completa de sustentar suas funções fisiológicas, podendo evoluir para falência orgânica multissistêmica.',
  'Insuficiência respiratória':
    'Insuficiência respiratória é a incapacidade do sistema respiratório de manter trocas gasosas adequadas às demandas metabólicas, por falha de ventilação, difusão, relação ventilação/perfusão, mecânica respiratória ou controle neuromuscular, resultando em hipoxemia, hipercapnia ou ambas.',
  'Instabilidade hemodinâmica':
    'Instabilidade hemodinâmica é a incapacidade do sistema cardiovascular de manter perfusão tecidual adequada e sustentada, com hipoperfusão sistêmica, variabilidade pressórica significativa, deterioração orgânica progressiva e possível necessidade de suporte volêmico, vasoativo ou circulatório.'
}

const INFLUENZA_PRESCRIPTION_MEDICATIONS = [
  'Fosfato de Oseltamivir',
  'Acetilcisteína',
  'Paracetamol ou Dipirona',
  'Bromoprida ou Ondansetrona',
  'Flurbiprofeno pastilha',
  'Budesonida spray nasal',
  'Cloridrato de Oximetazolina',
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
      medication: 'Bromoprida ou Ondansetrona',
      dosage: isAdult ? 'Bromoprida 10 mg ou Ondansetrona 4 mg' : 'Ajustar dose conforme idade/peso',
      frequency: 'VO a cada 8 horas, se náuseas ou vômitos',
      duration: 'Conforme necessidade',
      instructions: 'Usar apenas se houver sintomas gastrointestinais.',
      prescribedBy: 'Fluxograma Influenza'
    },
    {
      medication: 'Flurbiprofeno pastilha',
      dosage: '1 pastilha',
      frequency: 'Dissolver lentamente na boca a cada 6 horas, se odinofagia',
      duration: 'Conforme necessidade',
      instructions: 'Reservar para dor de garganta.',
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
      medication: 'Cloridrato de Oximetazolina',
      dosage: '0,5 mg/mL',
      frequency: '1 a 2 gotas em cada narina, manhã e noite',
      duration: 'Máximo de 5 dias',
      instructions: 'Usar somente em caso de congestão nasal intensa.',
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
