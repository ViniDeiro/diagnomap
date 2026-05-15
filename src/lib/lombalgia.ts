import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type LombalgiaRiskKey =
  | 'retencaoOuIncontinenciaUrinaria'
  | 'incontinenciaFecal'
  | 'anestesiaSela'
  | 'historicoCancer'
  | 'perdaPeso'
  | 'suspeitaNeoplasia'
  | 'febre'
  | 'imunossupressao'
  | 'hemodialise'
  | 'drogasInjetaveis'
  | 'endocardite'
  | 'bacteremia'
  | 'idadeAvancada'
  | 'corticoideCronico'
  | 'traumaSignificativo'
  | 'osteoporose'

export const LOMBALGIA_RISK_ITEMS: Array<{
  key: LombalgiaRiskKey
  group: 'cauda' | 'neoplasia' | 'infeccao' | 'fratura'
  label: string
}> = [
  { key: 'retencaoOuIncontinenciaUrinaria', group: 'cauda', label: 'Nova retenção ou incontinência urinária' },
  { key: 'incontinenciaFecal', group: 'cauda', label: 'Incontinência fecal' },
  { key: 'anestesiaSela', group: 'cauda', label: 'Anestesia em sela' },
  { key: 'historicoCancer', group: 'neoplasia', label: 'Histórico de câncer atual ou passado' },
  { key: 'perdaPeso', group: 'neoplasia', label: 'Perda de peso inexplicada' },
  { key: 'suspeitaNeoplasia', group: 'neoplasia', label: 'Suspeita clínica alta de neoplasia' },
  { key: 'febre', group: 'infeccao', label: 'Febre persistente ou sudorese' },
  { key: 'imunossupressao', group: 'infeccao', label: 'Imunossupressão' },
  { key: 'hemodialise', group: 'infeccao', label: 'Hemodiálise' },
  { key: 'drogasInjetaveis', group: 'infeccao', label: 'Uso de drogas injetáveis' },
  { key: 'endocardite', group: 'infeccao', label: 'Endocardite' },
  { key: 'bacteremia', group: 'infeccao', label: 'Bacteremia' },
  { key: 'idadeAvancada', group: 'fratura', label: 'Idade avançada' },
  { key: 'corticoideCronico', group: 'fratura', label: 'Uso crônico de corticosteroides' },
  { key: 'traumaSignificativo', group: 'fratura', label: 'Trauma significativo' },
  { key: 'osteoporose', group: 'fratura', label: 'Osteoporose' }
]

export const defaultLombalgiaRiskValues = (): Record<LombalgiaRiskKey, boolean> => ({
  retencaoOuIncontinenciaUrinaria: false,
  incontinenciaFecal: false,
  anestesiaSela: false,
  historicoCancer: false,
  perdaPeso: false,
  suspeitaNeoplasia: false,
  febre: false,
  imunossupressao: false,
  hemodialise: false,
  drogasInjetaveis: false,
  endocardite: false,
  bacteremia: false,
  idadeAvancada: false,
  corticoideCronico: false,
  traumaSignificativo: false,
  osteoporose: false
})

export const calculateLombalgiaDisposition = (values: Record<LombalgiaRiskKey, boolean>) => {
  const hasCauda = values.retencaoOuIncontinenciaUrinaria || values.incontinenciaFecal || values.anestesiaSela
  const hasCancer = values.historicoCancer || values.perdaPeso || values.suspeitaNeoplasia
  const hasInfection = values.febre || values.imunossupressao || values.hemodialise || values.drogasInjetaveis || values.endocardite || values.bacteremia
  const hasFracture = values.idadeAvancada || values.corticoideCronico || values.traumaSignificativo || values.osteoporose

  if (hasCauda) {
    return {
      category: 'cauda' as const,
      title: 'Suspeita de síndrome da cauda equina',
      nextStep: 'lomb_cauda_equina',
      value: 'cauda_equina',
      note: 'Internação hospitalar, ressonância magnética e avaliação de neurocirurgia de urgência.'
    }
  }
  if (hasCancer) {
    return {
      category: 'neoplasia' as const,
      title: 'Imagem indicada por suspeita de neoplasia',
      nextStep: 'lomb_imagem_neoplasia',
      value: 'neoplasia',
      note: 'Histórico de câncer ou suspeita alta de neoplasia exige investigação por imagem.'
    }
  }
  if (hasInfection) {
    return {
      category: 'infeccao' as const,
      title: 'Imagem indicada por risco de infecção espinhal',
      nextStep: 'lomb_imagem_infeccao',
      value: 'infeccao',
      note: 'Sinais ou fatores de risco para infecção espinhal exigem investigação por imagem.'
    }
  }
  if (hasFracture) {
    return {
      category: 'fratura' as const,
      title: 'Radiografia de coluna indicada',
      nextStep: 'lomb_radiografia_fratura',
      value: 'fratura',
      note: 'Risco de fratura vertebral por compressão: solicitar radiografia de coluna.'
    }
  }
  return {
    category: 'conservador' as const,
    title: 'Sem indicação inicial de imagem',
    nextStep: 'lomb_conservador',
    value: 'conservador',
    note: 'Sem red flags: tratamento conservador por 4 a 6 semanas, AINEs como primeira linha e retorno se piora.'
  }
}

export const buildLombalgiaPrescriptionItems = (): PrescriptionDraft[] => [
  {
    medication: 'Naproxeno',
    dosage: '500 mg VO',
    frequency: '1x/dia',
    duration: '5 dias',
    instructions: 'Evitar se contraindicações a AINEs, doença renal, sangramento digestivo ou alergia.',
    prescribedBy: 'Fluxograma Lombalgia'
  },
  {
    medication: 'Ciclobenzaprina + Cafeína',
    dosage: '5 mg VO',
    frequency: '1 comprimido à noite, 1x/dia',
    duration: '4 dias',
    instructions: 'Usar se suspeita de contratura muscular; orientar sonolência e evitar álcool/direção.',
    prescribedBy: 'Fluxograma Lombalgia'
  },
  {
    medication: 'Tramadol',
    dosage: '50 mg VO',
    frequency: '8/8 horas se dor intensa refratária',
    duration: '3 dias',
    instructions: 'Segunda linha para dor intensa ou refratária. Monitorar náuseas, sonolência e risco de queda.',
    prescribedBy: 'Fluxograma Lombalgia'
  }
]

export const hasLombalgiaPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Lombalgia')
      .map((item) => item.medication)
  )
  return names.has('Naproxeno') && names.has('Ciclobenzaprina + Cafeína')
}
