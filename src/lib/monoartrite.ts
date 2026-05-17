import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type MonoartriteDisposition = 'gout' | 'septic'

const prescribedBy = 'Fluxograma Monoartrite'

export const MONOARTRITE_JANSSENS_CRITERIA = [
  'Homem: +2 pontos',
  'Artrite prévia relatada pelo paciente: +2 pontos',
  'Início agudo, com máxima intensidade em 24 horas: +0,5 ponto',
  'Vermelhidão da articulação: +1 ponto',
  'Acometimento da 1ª metatarsofalangeana: +2,5 pontos',
  'Ácido úrico > 5,88 mg/dL: +3,5 pontos',
  'História de hipertensão, angina, IAM, ICC, doença cerebrovascular ou doença arterial periférica: +1,5 ponto'
]

export const MONOARTRITE_SEPTIC_WARNING_SIGNS = [
  'Dor intensa com calor local e edema',
  'Limitação importante dos movimentos',
  'Febre ou calafrios',
  'Toxemia ou queda do estado geral',
  'Imunossupressão, prótese articular ou bacteremia suspeita'
]

export const MONOARTRITE_SYNOVIAL_FLUID_TABLE = [
  {
    characteristic: 'Aparência',
    normal: 'Transparente',
    nonInflammatory: 'Transparente',
    gout: 'Translúcido',
    septic: 'Opaco'
  },
  {
    characteristic: 'Coloração',
    normal: 'Clara',
    nonInflammatory: 'Amarelada',
    gout: 'Amarelada',
    septic: 'Amarelada'
  },
  {
    characteristic: 'Viscosidade',
    normal: 'Alta',
    nonInflammatory: 'Alta',
    gout: 'Baixa',
    septic: 'Variável'
  },
  {
    characteristic: 'Leucócitos (mm³)',
    normal: '< 200',
    nonInflammatory: '0 a 200',
    gout: '2.000 a 50.000',
    septic: '> 50.000'
  },
  {
    characteristic: 'Polimorfonucleares',
    normal: '< 25%',
    nonInflammatory: '25 a 50%',
    gout: '> 50%',
    septic: '> 75%'
  },
  {
    characteristic: 'Cultura',
    normal: 'Negativa',
    nonInflammatory: 'Negativa',
    gout: 'Negativa',
    septic: 'Positiva'
  },
  {
    characteristic: 'Cristais',
    normal: 'Negativa',
    nonInflammatory: 'Negativa',
    gout: 'Positiva',
    septic: 'Negativa'
  }
]

export const MONOARTRITE_SEPTIC_ANTIBIOTIC_OPTIONS = [
  'Cocos Gram-positivos isolados ou em pequenos grupos: oxacilina 2 g EV de 4/4 horas. Se suspeita de MRSA, vancomicina 1 g EV de 12/12 horas.',
  'Cocos Gram-negativos: ceftriaxona 2 g EV 1x/dia. Alternativa: imipenem 0,5 g EV de 6/6 horas.',
  'Bacilos Gram-negativos: cefotaxima 2 g EV de 6/6 horas. Alternativa: imipenem 0,5 g EV de 6/6 horas.',
  'Nenhum organismo em paciente jovem e saudável: ceftriaxona 2 g EV 1x/dia + oxacilina 2 g EV de 4/4 horas. Se suspeita de MRSA, vancomicina 1 g EV de 12/12 horas.'
]

export const buildMonoartritePrescriptionItems = (disposition: MonoartriteDisposition): PrescriptionDraft[] => {
  if (disposition === 'septic') {
    return [
      {
        medication: 'Oxacilina',
        dosage: '2 g',
        frequency: 'EV de 4/4 horas',
        duration: 'Conforme internação e culturas',
        instructions: 'Esquema empírico inicial para cobertura de cocos Gram-positivos quando não há suspeita de MRSA.',
        prescribedBy
      },
      {
        medication: 'Ceftriaxona',
        dosage: '2 g',
        frequency: 'EV 1x/dia',
        duration: 'Conforme internação e culturas',
        instructions: 'Associar/ajustar conforme Gram, culturas, perfil do paciente e protocolo local.',
        prescribedBy
      }
    ]
  }

  return [
    {
      medication: 'Cetorolaco de trometamol',
      dosage: '30 mg/mL',
      frequency: '15 mg EV até de 4/4 horas',
      duration: 'Curto prazo no pronto-socorro',
      instructions: 'AINE como primeira linha se não houver contraindicação.',
      prescribedBy
    },
    {
      medication: 'Colchicina',
      dosage: '0,5 mg',
      frequency: 'Fazer 1 mg, seguido de 0,5 mg após 1 hora',
      duration: 'Total de 1,5 mg no primeiro dia',
      instructions: 'Evitar/ajustar em disfunção renal, interações medicamentosas ou intolerância gastrointestinal.',
      prescribedBy
    }
  ]
}

export const getMonoartriteGoutAlternatives = () => [
  'Tenoxicam 20 a 40 mg EV/IM 1x/dia.',
  'Cetoprofeno 100 mg + 100 mL de SF 0,9% EV, correr em 30 minutos.',
  'Se contraindicação a AINE: prednisona 40 mg VO.'
]

export const hasMonoartritePrescriptionSet = (
  prescriptions: Prescription[],
  disposition: MonoartriteDisposition
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  if (disposition === 'septic') {
    return names.has('Oxacilina') && names.has('Ceftriaxona')
  }

  return names.has('Cetorolaco de trometamol') && names.has('Colchicina')
}
