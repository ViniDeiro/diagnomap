export type HypertensionEmergencyScenario =
  | 'aortic_syndrome'
  | 'encephalopathy'
  | 'ischemic_stroke_lysis'
  | 'ischemic_stroke_no_lysis'
  | 'intracerebral_hemorrhage'
  | 'subarachnoid_hemorrhage'
  | 'catecholamine_crisis'
  | 'acute_coronary_syndrome'
  | 'pulmonary_edema'
  | 'pregnancy_emergency'
  | 'other'

export type HypertensionRoute = 'chronic' | 'emergency' | 'important_elevation' | 'pseudocrisis'

export const isMarkedBloodPressureElevation = (systolic?: number, diastolic?: number) =>
  (systolic != null && systolic >= 180) || (diastolic != null && diastolic >= 110)

export const classifyHypertensionRoute = ({
  systolic,
  diastolic,
  hasSymptoms,
  hasAcuteOrganDamage,
  hasSituationalTrigger
}: {
  systolic?: number
  diastolic?: number
  hasSymptoms: boolean
  hasAcuteOrganDamage: boolean
  hasSituationalTrigger: boolean
}): HypertensionRoute => {
  if (!isMarkedBloodPressureElevation(systolic, diastolic) || !hasSymptoms) return 'chronic'
  if (hasAcuteOrganDamage) return 'emergency'
  if (hasSituationalTrigger) return 'pseudocrisis'
  return 'important_elevation'
}

export const HYPERTENSION_SCENARIO_TARGETS: Record<HypertensionEmergencyScenario, string[]> = {
  aortic_syndrome: [
    'Reduzir rapidamente a pressão sistólica para a faixa de 90–120 mmHg, se perfusão permitir.',
    'Buscar frequência cardíaca abaixo de 60 bpm e acionar cirurgia vascular/cardiotorácica.',
    'O objetivo deve ser atingido, idealmente, nos primeiros 20 minutos.'
  ],
  encephalopathy: [
    'Reduzir a pressão de forma controlada, em torno de 20–25% na primeira hora.',
    'Evitar normalização abrupta para preservar a autorregulação cerebral.'
  ],
  ischemic_stroke_lysis: [
    'Antes da reperfusão intravenosa, manter abaixo de 185/110 mmHg.',
    'Após trombólise, manter abaixo de 180/105 mmHg e seguir o protocolo de AVC.'
  ],
  ischemic_stroke_no_lysis: [
    'Na ausência de reperfusão, geralmente não reduzir enquanto permanecer abaixo de 220/120 mmHg.',
    'Tratar antes desse limite apenas quando outra emergência simultânea exigir redução.'
  ],
  intracerebral_hemorrhage: [
    'Quando a sistólica estiver acima de 220 mmHg, usar infusão titulável e vigilância frequente.',
    'Considerar alvo de pressão sistólica ao redor de 180 mmHg, individualizado com neurologia.'
  ],
  subarachnoid_hemorrhage: [
    'Se a sistólica exceder 180 mmHg, promover queda gradual ao longo de 24–72 horas.',
    'Alinhar a meta com neurologia/neurocirurgia e o risco de ressangramento.'
  ],
  catecholamine_crisis: [
    'Buscar pressão sistólica abaixo de 140 mmHg durante a primeira hora.',
    'Controlar o estímulo adrenérgico e discutir agente específico com toxicologia/especialista.'
  ],
  acute_coronary_syndrome: [
    'Reduzir a pressão sem comprometer perfusão coronariana e tratar a síndrome isquêmica em paralelo.',
    'Preferir agente titulável compatível com dor/isquemia e monitorização contínua.'
  ],
  pulmonary_edema: [
    'Reduzir pós-carga e congestão com terapia intravenosa titulável, oxigenação e suporte ventilatório conforme necessidade.',
    'Reavaliar perfusão, diurese e esforço respiratório em intervalos curtos.'
  ],
  pregnancy_emergency: [
    'Acionar imediatamente obstetrícia; tratar pressão grave e prevenir/tratar convulsões conforme protocolo obstétrico.',
    'Evitar fármacos contraindicados na gestação e avaliar pré-eclâmpsia, eclâmpsia ou HELLP.'
  ],
  other: [
    'Na maioria das demais emergências, reduzir aproximadamente 20–25% na primeira hora.',
    'Nas 2–6 horas seguintes, aproximar-se de 160/100 mmHg; depois, normalizar gradualmente em 24–48 horas.'
  ]
}

