import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

const prescribedBy = 'Fluxograma PEP HIV'

export const PEP_HIV_RISK_MATERIALS = [
  'Sangue',
  'Semen',
  'Fluidos vaginais',
  'Liquidos de serosas: peritoneal, pleural ou pericardico',
  'Liquido amniotico',
  'Liquor'
]

export const PEP_HIV_RISK_EXPOSURES = [
  'Percutanea',
  'Membranas mucosas',
  'Exposicao sexual desprotegida',
  'Cutanea em pele nao integra',
  'Mordedura com presenca de sangue'
]

export const PEP_HIV_ALTERNATIVE_SCHEMES = [
  'Se impossibilidade de tenofovir: zidovudina/lamivudina 300/150 mg VO de 12/12h por 28 dias + dolutegravir 50 mg VO 1x/dia por 28 dias.',
  'Se impossibilidade de dolutegravir: tenofovir/lamivudina 300/300 mg VO 1x/dia por 28 dias + darunavir 800 mg + ritonavir 100 mg VO 1x/dia por 28 dias.'
]

export const PEP_HIV_FOLLOW_UP_ORIENTATIONS = [
  'A PEP deve ser iniciada ate 72 horas apos a exposicao, com maior beneficio quanto mais precoce.',
  'Repetir testagem para HIV 30 dias apos a exposicao, mesmo com PEP completa.',
  'Considerar risco de outras ISTs e encaminhar para acompanhamento sorologico.',
  'Orientar retorno imediato se sinais de toxicidade grave, intolerancia importante, ictericia, rash extenso ou vomitos persistentes.',
  'A PEP pode ser continuada/acompanhada em unidades de Atencao Primaria do SUS; garantir sigilo e referencia adequada quando necessario.'
]

export const buildPepHivPrescriptionItems = (): PrescriptionDraft[] => [
  {
    medication: 'Tenofovir/Lamivudina (TDF/3TC)',
    dosage: '300 mg/300 mg',
    frequency: 'Tomar 1 comprimido VO 1x/dia',
    duration: '28 dias',
    instructions: 'Iniciar o quanto antes, no maximo ate 72 horas apos a exposicao.',
    prescribedBy
  },
  {
    medication: 'Dolutegravir (DTG)',
    dosage: '50 mg',
    frequency: 'Tomar 1 comprimido VO 1x/dia',
    duration: '28 dias',
    instructions: 'Tomar junto com tenofovir/lamivudina.',
    prescribedBy
  },
  {
    medication: 'Bromoprida 10 mg ou Ondansetrona 4 mg',
    dosage: '1 comprimido',
    frequency: 'VO a cada 8 horas se enjoo ou vomitos',
    duration: 'Conforme sintomas',
    instructions: 'Usar apenas se necessario para controle de nauseas ou vomitos.',
    prescribedBy
  }
]

export const hasPepHivPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  return names.has('Tenofovir/Lamivudina (TDF/3TC)') && names.has('Dolutegravir (DTG)')
}
