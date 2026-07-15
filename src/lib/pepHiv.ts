import type { Prescription } from '@/types/patient'

type PrescriptionDraft = Omit<Prescription, 'id' | 'prescribedAt'>

export type PepHivScheme = 'preferencial' | 'sem_tenofovir' | 'sem_dolutegravir'

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
  'Procurar infectologista para seguimento, especialmente em caso de dúvidas, eventos adversos, necessidade de ajuste ou continuidade do cuidado.',
  'Orientar retorno imediato se sinais de toxicidade grave, intolerância importante, icterícia, rash extenso ou vômitos persistentes.',
  'A PEP pode ser continuada/acompanhada em unidades de Atenção Primária do SUS; garantir sigilo e referência adequada quando necessário.'
]

export const buildPepHivPrescriptionItems = (scheme: PepHivScheme = 'preferencial'): PrescriptionDraft[] => {
  const regimen = scheme === 'sem_tenofovir'
    ? [
        {
          medication: 'Zidovudina/Lamivudina (AZT/3TC)',
          dosage: '300 mg/150 mg',
          frequency: 'Tomar 1 comprimido VO 12/12h',
          instructions: 'Usar como alternativa quando tenofovir for contraindicado ou indisponível.'
        },
        {
          medication: 'Dolutegravir (DTG)',
          dosage: '50 mg',
          frequency: 'Tomar 1 comprimido VO 1x/dia',
          instructions: 'Tomar junto com zidovudina/lamivudina.'
        }
      ]
    : scheme === 'sem_dolutegravir'
      ? [
          {
            medication: 'Tenofovir/Lamivudina (TDF/3TC)',
            dosage: '300 mg/300 mg',
            frequency: 'Tomar 1 comprimido VO 1x/dia',
            instructions: 'Usar como parte do esquema alternativo sem dolutegravir.'
          },
          {
            medication: 'Darunavir (DRV) + Ritonavir (RTV)',
            dosage: '800 mg + 100 mg',
            frequency: 'Tomar 1 dose VO 1x/dia',
            instructions: 'Usar como alternativa quando dolutegravir for contraindicado ou indisponível.'
          }
        ]
      : [
          {
            medication: 'Tenofovir/Lamivudina (TDF/3TC)',
            dosage: '300 mg/300 mg',
            frequency: 'Tomar 1 comprimido VO 1x/dia',
            instructions: 'Iniciar o quanto antes, no máximo até 72 horas após a exposição.'
          },
          {
            medication: 'Dolutegravir (DTG)',
            dosage: '50 mg',
            frequency: 'Tomar 1 comprimido VO 1x/dia',
            instructions: 'Tomar junto com tenofovir/lamivudina.'
          }
        ]

  return [
    ...regimen.map((item) => ({ ...item, duration: '28 dias', prescribedBy })),
    {
      medication: 'Bromoprida 10 mg ou Ondansetrona 4 mg',
      dosage: '1 comprimido',
      frequency: 'VO a cada 8 horas se enjoo ou vômitos',
      duration: 'Conforme sintomas',
      instructions: 'Usar apenas se necessário para controle de náuseas ou vômitos.',
      prescribedBy
    }
  ]
}

export const hasPepHivPrescriptionSet = (prescriptions: Prescription[]) => {
  const names = new Set(
    prescriptions
      .filter((item) => item.prescribedBy === prescribedBy)
      .map((item) => item.medication)
  )

  return names.has('Tenofovir/Lamivudina (TDF/3TC)') && names.has('Dolutegravir (DTG)')
}
