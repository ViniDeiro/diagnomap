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

export const isMarkedBloodPressureElevation = (systolic?: number, diastolic?: number, obstetricContext = false) =>
  obstetricContext
    ? (systolic != null && systolic >= 160) || (diastolic != null && diastolic >= 110)
    : (systolic != null && systolic >= 180) || (diastolic != null && diastolic >= 110)

export const isPersistentExtremeBloodPressure = (systolic?: number, diastolic?: number) =>
  (systolic != null && systolic >= 220) || (diastolic != null && diastolic >= 120)

export const classifyHypertensionRoute = ({
  systolic,
  diastolic,
  hasSymptoms,
  hasAcuteOrganDamage,
  hasSituationalTrigger,
  obstetricContext = false
}: {
  systolic?: number
  diastolic?: number
  hasSymptoms: boolean
  hasAcuteOrganDamage: boolean
  hasSituationalTrigger: boolean
  obstetricContext?: boolean
}): HypertensionRoute => {
  void hasSymptoms
  if (!isMarkedBloodPressureElevation(systolic, diastolic, obstetricContext)) return 'chronic'
  if (hasAcuteOrganDamage) return 'emergency'
  if (hasSituationalTrigger) return 'pseudocrisis'
  return 'important_elevation'
}

export const HYPERTENSION_SCENARIO_TARGETS: Record<HypertensionEmergencyScenario, string[]> = {
  aortic_syndrome: [
    'Reduzir rapidamente a PAS para menos de 120 mmHg ou para o menor valor que preserve a perfusão dos órgãos.',
    'Buscar frequência cardíaca entre 60–80 bpm e acionar cirurgia vascular/cardiotorácica.',
    'Iniciar terapia anti-impulso imediatamente, com monitorização contínua e reavaliação frequente.'
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
    'Se a PAS estiver entre 150–220 mmHg e o quadro for leve a moderado, considerar alvo em torno de 140 mmHg, mantendo 130–150 mmHg.',
    'Se a PAS exceder 220 mmHg ou houver hipertensão intracraniana/quadro grave, usar infusão titulável e meta individualizada com neurologia; evitar PAS abaixo de 130 mmHg.'
  ],
  subarachnoid_hemorrhage: [
    'Controlar prontamente hipertensão grave e variabilidade pressórica com agente titulável, evitando hipotensão e hipoperfusão cerebral.',
    'Definir a meta com neurologia/neurocirurgia conforme pressão habitual, estado neurológico, aneurisma tratado ou não e perfusão cerebral.'
  ],
  catecholamine_crisis: [
    'Buscar pressão sistólica abaixo de 140 mmHg durante a primeira hora.',
    'Controlar o estímulo adrenérgico e discutir agente específico com toxicologia/especialista.'
  ],
  acute_coronary_syndrome: [
    'Reduzir a pressão de forma titulada, tratando a isquemia em paralelo e evitando PAS abaixo de 100 mmHg ou perda de perfusão coronariana.',
    'Priorizar nitroglicerina quando não houver contraindicação; avaliar betabloqueador somente sem choque, insuficiência cardíaca aguda, bradicardia ou bloqueio.'
  ],
  pulmonary_edema: [
    'Reduzir pós-carga e congestão com terapia intravenosa titulável, oxigenação e suporte ventilatório conforme necessidade.',
    'Reavaliar perfusão, diurese e esforço respiratório em intervalos curtos.'
  ],
  pregnancy_emergency: [
    'Se PAS ≥160 mmHg ou PAD ≥110 mmHg persistir por 15 minutos, iniciar tratamento urgente e acionar obstetrícia.',
    'Buscar PAS de 140–150 mmHg e PAD de 90–100 mmHg, prevenindo/tratando convulsões e preservando perfusão uteroplacentária.'
  ],
  other: [
    'Na maioria das demais emergências, reduzir aproximadamente 20–25% na primeira hora.',
    'Nas 2–6 horas seguintes, aproximar-se de 160/100 mmHg; depois, normalizar gradualmente em 24–48 horas.'
  ]
}
