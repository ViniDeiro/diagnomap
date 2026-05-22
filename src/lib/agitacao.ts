import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type AgitacaoDisposition = 'moderada_oral' | 'grave_im'

const prescribedBy = 'Fluxograma Agitação Psicomotora'

export const AGITACAO_FOUR_HS = [
  'Hipóxia',
  'Hipoglicemia',
  'Hipertermia',
  'Hipovolemia'
]

export const AGITACAO_MEDICAL_CAUSES = [
  'Delirium',
  'Distúrbios metabólicos: hiper/hipoglicemia, uremia, insuficiência hepática',
  'Hipertireoidismo',
  'Meningite, encefalite e sepse',
  'Síndrome de abstinência',
  'Intoxicação por álcool ou drogas ilícitas',
  'TCE',
  'Longo tempo de espera ou percepção de tratamento ineficaz'
]

export const AGITACAO_SUGGESTED_TESTS = [
  'Glicemia',
  'Eletrólitos',
  'Rastreio infeccioso conforme clínica: hemograma, EAS, RX de tórax',
  'Ureia e creatinina',
  'Função tireoidiana',
  'ECG',
  'Toxicológico em sangue e/ou urina',
  'Neuroimagem quando indicado'
]

export const buildAgitacaoPrescriptionItems = (disposition: AgitacaoDisposition): PrescriptionDraft[] => {
  if (disposition === 'moderada_oral') {
    return [
      {
        medication: 'Diazepam',
        dosage: '5 a 10 mg',
        frequency: 'VO agora e reavaliar',
        duration: 'Dose única no pronto-socorro',
        instructions: 'Via oral é preferencial quando o paciente colabora. Dose máxima diária habitual: 20 mg/dia.',
        prescribedBy
      }
    ]
  }

  return [
    {
      medication: 'Haloperidol',
      dosage: '5 mg/mL',
      frequency: '1 mL IM a cada 30 minutos se necessário',
      duration: 'Até dose máxima de 30 mg/dia',
      instructions: 'Preferir haloperidol se suspeita de intoxicação por álcool. Monitorar efeitos extrapiramidais e QT conforme risco.',
      prescribedBy
    },
    {
      medication: 'Prometazina',
      dosage: '50 mg/2 mL',
      frequency: '2 mL IM',
      duration: 'Dose única no pronto-socorro',
      instructions: 'Não usar se suspeita ou confirmação de abuso/intoxicação por álcool.',
      prescribedBy
    }
  ]
}

export const getAgitacaoMedicationAlternatives = () => [
  'Clonazepam 0,25 mg, 0,5 mg ou 2 mg VO; máximo diário 4 a 6 mg/dia.',
  'Midazolam 5 mg/mL: 5 mL IM; atenção para depressão respiratória.',
  'Diazepam 10 mg/2 mL: 10 mg EV em bolus lento.',
  'Midazolam 5 mg/mL: 5 mL EV em bolus lento; atenção para depressão respiratória.'
]

export const hasAgitacaoPrescriptionSet = (
  prescriptions: Prescription[],
  disposition: AgitacaoDisposition
) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  if (disposition === 'moderada_oral') return names.has('Diazepam')
  return names.has('Haloperidol') && names.has('Prometazina')
}
