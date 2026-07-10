import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

const prescribedBy = 'Fluxograma PEP HIV'

export const PEP_HIV_RISK_MATERIALS = [
  'Sangue',
  'Sêmen',
  'Fluidos vaginais',
  'Líquidos de serosas: peritoneal, pleural ou pericárdico',
  'Líquido amniótico',
  'Líquor'
]

export const PEP_HIV_RISK_EXPOSURES = [
  'Percutânea',
  'Membranas mucosas',
  'Exposição sexual desprotegida',
  'Cutânea em pele não íntegra',
  'Mordedura com presença de sangue'
]

export const PEP_HIV_ALTERNATIVE_SCHEMES = [
  'Se impossibilidade de tenofovir: zidovudina/lamivudina 300/150 mg VO de 12/12h por 28 dias + dolutegravir 50 mg VO 1x/dia por 28 dias.',
  'Se impossibilidade de dolutegravir: tenofovir/lamivudina 300/300 mg VO 1x/dia por 28 dias + darunavir 800 mg + ritonavir 100 mg VO 1x/dia por 28 dias.'
]

export const PEP_HIV_FOLLOW_UP_ORIENTATIONS = [
  'A PEP deve ser iniciada até 72 horas após a exposição, com maior benefício quanto mais precoce.',
  'Repetir testagem para HIV 30 dias após a exposição, mesmo com PEP completa.',
  'Considerar risco de outras ISTs e hepatites virais; encaminhar para acompanhamento sorológico conforme protocolo local.',
  'Orientar retorno imediato se sinais de toxicidade grave, intolerância importante, icterícia, rash extenso ou vômitos persistentes.',
  'A PEP pode ser continuada/acompanhada em unidades de Atenção Primária do SUS; garantir sigilo e referência adequada quando necessário.'
]

export const buildPepHivPrescriptionItems = (): PrescriptionDraft[] => [
  {
    medication: 'Tenofovir/Lamivudina (TDF/3TC)',
    dosage: '300 mg/300 mg',
    frequency: 'Tomar 1 comprimido VO 1x/dia',
    duration: '28 dias',
    instructions: 'Iniciar o quanto antes, no máximo até 72 horas após a exposição.',
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
    frequency: 'VO a cada 8 horas se enjoo ou vômitos',
    duration: 'Conforme sintomas',
    instructions: 'Usar apenas se necessário para controle de náuseas ou vômitos.',
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
