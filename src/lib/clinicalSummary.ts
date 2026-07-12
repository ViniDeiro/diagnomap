import { getFlowchartById } from '@/data/emergencyFlowcharts'
import type { Patient } from '@/types/patient'
import type { EmergencyFlowchart, EmergencyStep } from '@/types/emergency'

export type ClinicalSummaryData = {
  chiefComplaint: string
  historyLines: string[]
  examinationLines: string[]
  scoreLines: string[]
  finalTitle: string
  finalDescription: string
  finalNarrative: string
  doctorSignature: string
  conductLines: string[]
  continuousText: string
  text: string
}

type FlowSummaryAnswer = Record<string, unknown>
type FlowSummaryEntry = {
  step: EmergencyStep
  answerLabel: string
  parsed: FlowSummaryAnswer | null
}
type TVPExamSummary = {
  extremities?: { altered?: string }
  cardiac?: { altered?: string }
  pulmonary?: { altered?: string }
}

const houseBrackmannLabels: Record<string, string> = {
  house_i: 'Grau I',
  house_ii: 'Grau II',
  house_iii: 'Grau III',
  house_iv: 'Grau IV',
  house_v: 'Grau V',
  house_vi: 'Grau VI'
}

const antiviralLabels: Record<string, string> = {
  none: 'sem antiviral associado',
  valaciclovir: 'valaciclovir associado',
  aciclovir: 'aciclovir associado',
  famciclovir: 'famciclovir associado'
}

const tvpWellsLabels: Record<string, string> = {
  cancer_ativo: 'câncer ativo',
  paresia_imobilizacao: 'paresia, paralisia ou imobilização de membro inferior',
  restrito_leito_cirurgia: 'restrição ao leito ou cirurgia recente',
  dor_trajeto_venoso: 'dor à palpação no trajeto venoso profundo',
  perna_inteira_edemaciada: 'edema de todo o membro inferior',
  panturrilha_3cm: 'aumento de panturrilha maior ou igual a 3 cm',
  edema_cacifo: 'edema com cacifo limitado ao membro sintomático',
  veias_colaterais: 'veias colaterais superficiais não varicosas',
  tvp_previa: 'TVP prévia documentada',
  diagnostico_alternativo: 'diagnóstico alternativo pelo menos tão provável quanto TVP'
}

const tvpContraindicationLabels: Record<string, string> = {
  abs_sangramento_ativo: 'sangramento ativo maior',
  abs_intracraniano_recente: 'sangramento intracraniano recente',
  abs_neuro_ocular_recente: 'cirurgia neurológica ou ocular recente',
  abs_trombocitopenia_grave: 'plaquetopenia grave',
  abs_risco_critico: 'risco hemorrágico crítico não corrigível',
  rel_trombocitopenia_moderada: 'plaquetopenia moderada',
  rel_hipertensao_nao_controlada: 'hipertensão arterial importante não controlada',
  rel_disfuncao_renal_hepatica: 'disfunção renal ou hepática moderada',
  rel_sangramento_gi_recente: 'sangramento gastrointestinal recente'
}

const tvpTherapyLabels: Record<string, string> = {
  rivaroxabana: 'rivaroxabana',
  apixabana: 'apixabana',
  dabigatrana: 'dabigatrana',
  edoxabana: 'edoxabana',
  enoxaparina: 'enoxaparina',
  hnf: 'heparina não fracionada',
  varfarina: 'varfarina'
}

export const formatClinicalDate = (dateLike?: Date | string) => {
  if (!dateLike) return 'data não informada'
  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return 'data não informada'
  return date.toLocaleDateString('pt-BR')
}

export const formatDoctorSignature = (doctor?: { name?: string | null; crm?: string | null } | null) => {
  const doctorName = doctor?.name?.trim()
  const crm = doctor?.crm?.trim()
  const nameText = doctorName
    ? (/^dr\.?\s|^dra\.?\s/i.test(doctorName) ? doctorName : `Dr(a). ${doctorName}`)
    : 'Médico(a) responsável não informado'
  const crmText = crm ? (/^crm\b/i.test(crm) ? crm : `CRM ${crm}`) : 'CRM não informado'
  return `${nameText}\n${crmText}`
}

export const formatClinicalValue = (value: unknown): string => {
  if (value == null || value === '') return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    if (typeof value === 'boolean') return value ? 'sim' : 'não'
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(formatClinicalValue).filter(Boolean).join('; ')
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, itemValue]) => {
        const formattedValue = formatClinicalValue(itemValue)
        return formattedValue ? `${key}: ${formattedValue}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }
  return String(value)
}

export const parseFlowAnswerForSummary = (raw?: string): FlowSummaryAnswer | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : { decision: parsed }
  } catch {
    return { decision: raw }
  }
}

const uniqueTextItems = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.map((item) => item?.trim()).filter(Boolean) as string[]))

const formatClinicalListText = (items: string[]) => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`
}

const getTVPLegLabel = (value?: string) => {
  if (value === 'left') return 'membro inferior esquerdo'
  if (value === 'right') return 'membro inferior direito'
  if (value === 'other') return 'outra localização informada'
  return 'membro acometido não especificado'
}

const getTVPPocusText = (value?: string) => {
  if (value === 'us_positive' || value === 'repeat_positive') {
    return 'POCUS vascular compressivo positivo, com veia não compressível, achado compatível com TVP proximal no contexto clínico.'
  }
  if (value === 'us_negative' || value === 'repeat_negative') {
    return 'POCUS vascular compressivo negativo, com compressibilidade preservada nas janelas avaliadas.'
  }
  if (value === 'us_inconclusive') {
    return 'POCUS vascular compressivo inconclusivo ou tecnicamente limitado, sem permitir exclusão segura de TVP.'
  }
  return 'Resultado do POCUS vascular não registrado no fluxo.'
}

const buildTVPClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const startData = parseFlowAnswerForSummary(answers.start)
  const clinicalData = parseFlowAnswerForSummary(answers.avaliacao_clinica)
  const examData = parseFlowAnswerForSummary(answers.tvp_exame_fisico)
  const wellsData = parseFlowAnswerForSummary(answers.wells_score)
  const contraData = parseFlowAnswerForSummary(answers.checar_contra_anticoagulacao)
  const treatmentData = parseFlowAnswerForSummary(answers.tratamento_inicial)
  const currentStepData = flowchart.steps[currentStep]
  const doctorSignature = formatDoctorSignature(doctor)

  const selectedLeg = typeof startData?.selectedLeg === 'string' ? startData.selectedLeg : ''
  const selectedLegLabel = typeof startData?.selectedLegLabel === 'string' && startData.selectedLegLabel.trim()
    ? startData.selectedLegLabel.toLowerCase()
    : getTVPLegLabel(selectedLeg)
  const selectedFindings = Array.isArray(clinicalData?.sinaisEAchados)
    ? clinicalData.sinaisEAchados.map((item) => formatClinicalValue(item)).filter(Boolean)
    : []
  const otherFindings = typeof clinicalData?.outrosAchados === 'string' ? clinicalData.outrosAchados.trim() : ''
  const symptoms = uniqueTextItems([
    ...(patient.admission?.symptoms || []),
    ...selectedFindings.filter((item) => /dor|edema|panturrilha|coxa|calor|rubor|cianose|taquicardia|sensibilidade|circunferência/i.test(item)),
    otherFindings
  ])
  const riskFactors = uniqueTextItems([
    ...selectedFindings.filter((item) => /imobilização|cirurgia|trauma|câncer|gravidez|puerpério|estrogênios|trombofilia|TVP\/TEV|prévia/i.test(item))
  ])
  const alertFindings = uniqueTextItems([
    ...selectedFindings.filter((item) => /flegmasia|cianose|dispneia|dor torácica|hemoptise|síncope|iliofemoral|progressão rápida|urgência/i.test(item))
  ])
  const vitalSigns = examData?.sinaisVitais && typeof examData.sinaisVitais === 'object'
    ? examData.sinaisVitais as Record<string, unknown>
    : {}
  const vitalLines = uniqueTextItems([
    vitalSigns.temperature != null ? `temperatura ${String(vitalSigns.temperature).replace('.', ',')} °C` : null,
    vitalSigns.heartRate != null ? `frequência cardíaca ${vitalSigns.heartRate} bpm` : null,
    vitalSigns.respiratoryRate != null ? `frequência respiratória ${vitalSigns.respiratoryRate} irpm` : null,
    vitalSigns.bloodPressure ? `pressão arterial ${vitalSigns.bloodPressure} mmHg` : null,
    vitalSigns.oxygenSaturation != null ? `saturação de oxigênio ${vitalSigns.oxygenSaturation}%` : null,
    vitalSigns.glucose ? `glicemia capilar ${vitalSigns.glucose} mg/dL` : null
  ])
  const exam = examData?.exameFisico && typeof examData.exameFisico === 'object'
    ? examData.exameFisico as TVPExamSummary
    : null
  const directedExamLines = uniqueTextItems([
    ...selectedFindings.filter((item) => /edema|cacifo|circunferência|calor|rubor|veias|palpação|eritema|cianose|palidez|pulsos|Homans/i.test(item)),
    exam?.extremities?.altered ? `extremidades: ${String(exam.extremities.altered).trim()}` : null,
    exam?.cardiac?.altered ? `aparelho cardiovascular: ${String(exam.cardiac.altered).trim()}` : null,
    exam?.pulmonary?.altered ? `aparelho respiratório: ${String(exam.pulmonary.altered).trim()}` : null
  ])

  const wellsScore = typeof wellsData?.score === 'number' ? wellsData.score : undefined
  const wellsClassification = typeof wellsData?.classificacao === 'string' ? wellsData.classificacao : ''
  const wellsCriteria = Array.isArray(wellsData?.criteriosSelecionados)
    ? uniqueTextItems(wellsData.criteriosSelecionados.map((item) => tvpWellsLabels[String(item)] || formatClinicalValue(item)))
    : []
  const pocusValue = answers.pocus_resultado_pre_d_dimero || answers.us_compressiva || answers.repetir_us
  const dDimerText = answers.baixa_probabilidade === 'ddimer_negative'
    ? 'D-dímero negativo.'
    : answers.baixa_probabilidade === 'ddimer_positive'
      ? 'D-dímero positivo.'
      : answers.moderada_probabilidade
        ? 'D-dímero não foi utilizado como etapa inicial por probabilidade clínica moderada/alta.'
        : 'D-dímero não registrado no fluxo.'
  const contraindications = Array.isArray(contraData?.contraindicacoesSelecionadas)
    ? uniqueTextItems(contraData.contraindicacoesSelecionadas.map((item) => tvpContraindicationLabels[String(item)] || formatClinicalValue(item)))
    : []
  const therapies = Array.isArray(treatmentData?.opcoesTerapeuticasSelecionadas)
    ? uniqueTextItems(treatmentData.opcoesTerapeuticasSelecionadas.map((item) => tvpTherapyLabels[String(item)] || formatClinicalValue(item)))
    : []

  const isVascularReferral = currentStep === 'encaminhamento_urgente' || currentStep === 'tvp_aguarda_avaliacao_vascular' || history.includes('tvp_aguarda_avaliacao_vascular')
  const isUrgentVascular = currentStep === 'tvp_urgencia_vascular_concluida' || history.includes('tvp_urgencia_vascular_imediata')
  const isExcluded = currentStep === 'tvp_excluida' || currentStep === 'seguimento_ambulatorial'
  const isTEPInvestigation = currentStep === 'tvp_internacao_investigar_tep'
  const isConfirmed = pocusValue === 'us_positive' || pocusValue === 'repeat_positive' || currentStep === 'anticoagulacao_iniciada' || isVascularReferral || isUrgentVascular

  const chiefComplaint = symptoms.length > 0
    ? formatClinicalListText(symptoms.slice(0, 3))
    : `suspeita clínica de trombose venosa profunda em ${selectedLegLabel}`
  const title = isConfirmed
    ? 'RELATÓRIO MÉDICO - TROMBOSE VENOSA PROFUNDA'
    : isExcluded
      ? 'RELATÓRIO MÉDICO - INVESTIGAÇÃO DE TVP'
      : 'RELATÓRIO MÉDICO - SUSPEITA DE TROMBOSE VENOSA PROFUNDA'
  const finalTitle = currentStepData?.title || flowchart.name
  const finalDescription = currentStepData?.description || flowchart.description
  const conductText = isUrgentVascular
    ? 'Diante de sinais de gravidade vascular, foi indicada internação imediata, monitorização, estabilização clínica e acionamento urgente da Cirurgia Vascular.'
    : isVascularReferral
      ? 'Foi solicitado encaminhamento/avaliação pela Cirurgia Vascular, mantendo responsabilidade assistencial, monitorização e tratamento instituído até transferência formal do caso.'
      : isConfirmed
        ? 'O quadro foi conduzido como TVP confirmada ou altamente provável, com avaliação de contraindicações e instituição de anticoagulação conforme risco clínico e protocolo local.'
        : isExcluded
          ? 'A investigação realizada não sustentou TVP no desfecho do fluxo, sendo indicada alta/seguimento com sinais de retorno e reavaliação se houver piora clínica.'
          : isTEPInvestigation
            ? 'Pela presença de sintomas respiratórios associados, foi indicada internação e investigação imediata de possível tromboembolismo pulmonar.'
            : 'Mantida investigação clínica para TVP conforme estratificação, exame complementar e evolução.'
  const anticoagulationText = contraindications.length > 0
    ? `Na checagem terapêutica, foram registradas contraindicações ou alertas para anticoagulação: ${formatClinicalListText(contraindications)}.`
    : contraData
      ? 'Contraindicações relevantes à anticoagulação foram avaliadas no fluxo e não foram documentadas.'
      : 'Contraindicações à anticoagulação não foram registradas de forma estruturada.'
  const therapyText = therapies.length > 0
    ? `A terapêutica selecionada incluiu ${formatClinicalListText(therapies)}.`
    : 'Não há anticoagulante específico registrado como prescrição final neste relatório.'

  const paragraphs = [
    title,
    '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de ${chiefComplaint}. O atendimento foi conduzido no contexto do fluxograma de TVP, com avaliação dirigida do ${selectedLegLabel}.`,
    '',
    symptoms.length > 0
      ? `Na história da moléstia atual, foram documentados achados compatíveis com suspeita de TVP, incluindo ${formatClinicalListText(symptoms)}.${riskFactors.length > 0 ? ` Como fatores de risco ou contexto predisponente, constaram ${formatClinicalListText(riskFactors)}.` : ''}${alertFindings.length > 0 ? ` Também foram assinalados sinais de alerta: ${formatClinicalListText(alertFindings)}.` : ''}`
      : `Na história da moléstia atual, o fluxo foi iniciado por suspeita clínica de TVP em ${selectedLegLabel}, sem descrição adicional estruturada de sintomas na admissão.`,
    '',
    `${vitalLines.length > 0 ? `Na avaliação inicial, sinais vitais registrados: ${formatClinicalListText(vitalLines)}. ` : ''}${directedExamLines.length > 0 ? `Ao exame físico direcionado, observaram-se ${formatClinicalListText(directedExamLines)}.` : 'O exame físico direcionado de membro inferior não apresentou descrição estruturada suficiente no fluxo, devendo ser correlacionado com a avaliação presencial.'}`,
    '',
    `${wellsScore != null ? `Foi aplicado o escore de Wells para TVP, com ${wellsScore} ponto${wellsScore === 1 ? '' : 's'} e classificação clínica ${wellsClassification || 'não informada'}.` : 'O escore de Wells não foi registrado de forma estruturada.'}${wellsCriteria.length > 0 ? ` Os critérios pontuados foram: ${formatClinicalListText(wellsCriteria)}.` : ''} ${getTVPPocusText(pocusValue)} ${dDimerText}`,
    '',
    `${anticoagulationText} ${therapyText} ${conductText}`,
    '',
    doctorSignature
  ]
  const continuousText = paragraphs.join('\n')

  return {
    chiefComplaint,
    historyLines: symptoms,
    examinationLines: [...vitalLines, ...directedExamLines],
    scoreLines: uniqueTextItems([
      wellsScore != null ? `Wells ${wellsScore} ponto${wellsScore === 1 ? '' : 's'}${wellsClassification ? ` - ${wellsClassification}` : ''}` : null,
      getTVPPocusText(pocusValue),
      dDimerText
    ]),
    finalTitle,
    finalDescription,
    finalNarrative: conductText,
    doctorSignature,
    conductLines: [conductText],
    continuousText,
    text: continuousText
  }
}

const pepHivDecisionLabels: Record<string, string> = {
  material_risco: 'houve contato com material biológico com risco de transmissão do HIV',
  sem_material: 'não houve contato com material biológico de risco para transmissão do HIV',
  risco: 'o tipo de exposição foi classificado como potencialmente transmissor',
  sem_risco: 'o tipo de exposição não foi compatível com risco relevante de transmissão',
  ate_72h: 'o atendimento ocorreu dentro da janela de até 72 horas após a exposição',
  fora_72h: 'o atendimento ocorreu após 72 horas da exposição',
  exposta_positivo: 'a pessoa exposta apresentou teste de HIV positivo ou reagente',
  exposta_negativo: 'a pessoa exposta apresentou teste de HIV negativo ou não reagente',
  fonte_indica: 'a pessoa fonte foi classificada como HIV positiva, reagente ou de status desconhecido',
  fonte_negativa: 'a pessoa fonte foi classificada como HIV negativa',
  risco_30d: 'a pessoa fonte teve exposição de risco nos últimos 30 dias',
  sem_risco_30d: 'não houve exposição de risco recente da pessoa fonte nos últimos 30 dias'
}

const getPepHivDecision = (answers: Record<string, string>, stepId: string) => {
  const parsed = parseFlowAnswerForSummary(answers[stepId])
  const decision = typeof parsed?.decision === 'string' ? parsed.decision : answers[stepId]
  return decision ? pepHivDecisionLabels[decision] || formatClinicalValue(decision) : ''
}

const buildPepHivClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const currentStepData = flowchart.steps[currentStep]
  const doctorSignature = formatDoctorSignature(doctor)
  const materialDecision = getPepHivDecision(answers, 'pep_material_risco')
  const exposureDecision = getPepHivDecision(answers, 'pep_tipo_exposicao')
  const windowDecision = getPepHivDecision(answers, 'pep_janela_72h')
  const exposedDecision = getPepHivDecision(answers, 'pep_exposta_hiv')
  const sourceDecision = getPepHivDecision(answers, 'pep_fonte_hiv')
  const sourceRiskDecision = getPepHivDecision(answers, 'pep_fonte_risco_30d')

  const finalTitle = currentStepData?.title || flowchart.name
  const finalDescription = currentStepData?.description || flowchart.description
  const chiefComplaint = patient.admission?.symptoms?.join('; ') || 'exposição potencial ao HIV com necessidade de avaliação para profilaxia pós-exposição'
  const isPepIndicated = currentStep === 'pep_iniciar'
  const isNoRiskMaterial = currentStep === 'pep_sem_material_risco'
  const isNoRiskExposure = currentStep === 'pep_sem_exposicao_risco'
  const isOutsideWindow = currentStep === 'pep_fora_janela'
  const isExposedPositive = currentStep === 'pep_exposta_hiv_positivo'
  const isSourceLowRisk = currentStep === 'pep_nao_indicada_fonte_sem_risco'

  const decisionLines = uniqueTextItems([
    materialDecision,
    exposureDecision,
    windowDecision,
    exposedDecision,
    sourceDecision,
    sourceRiskDecision
  ])

  const indicationSentence = isPepIndicated
    ? 'A estratificação do risco sustentou indicação de PEP ao HIV, pois houve exposição de risco dentro da janela terapêutica, com pessoa exposta sem evidência de infecção prévia e pessoa fonte positiva, reagente, desconhecida ou com risco recente.'
    : isNoRiskMaterial
      ? 'A PEP ao HIV não foi indicada porque o material envolvido não foi classificado como biologicamente relevante para transmissão do HIV.'
      : isNoRiskExposure
        ? 'A PEP ao HIV não foi indicada porque a via ou o tipo de contato não configurou exposição com risco relevante de transmissão.'
        : isOutsideWindow
          ? 'A PEP ao HIV não foi indicada por atendimento após a janela de 72 horas, período no qual não há benefício comprovado para início da profilaxia.'
          : isExposedPositive
            ? 'A PEP ao HIV não foi indicada porque a pessoa exposta apresentou teste positivo ou reagente, devendo ser encaminhada para cuidado clínico especializado em HIV.'
            : isSourceLowRisk
              ? 'A PEP ao HIV não foi indicada porque a pessoa fonte foi classificada como HIV negativa e sem exposição de risco recente nos últimos 30 dias.'
              : 'A decisão final seguiu a estratificação do fluxograma de PEP ao HIV, considerando risco biológico, tipo de exposição, janela temporal e status sorológico disponível.'

  const conductSentence = isPepIndicated
    ? 'Foi orientado iniciar profilaxia imediatamente, preferencialmente com tenofovir/lamivudina associado a dolutegravir por 28 dias, além de acompanhamento sorológico, avaliação de ISTs e hepatites virais, orientação de adesão e retorno se sinais de toxicidade ou intolerância.'
    : isOutsideWindow
      ? 'Foi orientado manter acompanhamento sorológico da pessoa exposta, avaliar outras ISTs/hepatites conforme contexto e registrar orientações de retorno.'
      : isExposedPositive
        ? 'Foi indicado encaminhamento para acompanhamento clínico especializado, com confirmação diagnóstica e vinculação ao cuidado, sem uso de PEP como profilaxia.'
        : 'Foi orientado que a PEP não é necessária para HIV neste cenário, mantendo aconselhamento, prevenção combinada e reavaliação se surgirem novas informações sobre a exposição.'

  const title = isPepIndicated
    ? 'RELATÓRIO MÉDICO - PROFILAXIA PÓS-EXPOSIÇÃO AO HIV'
    : 'RELATÓRIO MÉDICO - AVALIAÇÃO DE EXPOSIÇÃO AO HIV'
  const finalNarrative = `${indicationSentence} ${conductSentence}`
  const examinationLine = 'Não há necessidade de exame físico específico para definir PEP ao HIV quando a decisão depende principalmente da caracterização da exposição; eventuais lesões, violência sexual, ferimentos ou sinais de IST devem ser avaliados e documentados no atendimento presencial.'

  const paragraphs = [
    title,
    '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de ${chiefComplaint}. A avaliação foi conduzida como urgência médica por possível exposição ao HIV, com objetivo de definir indicação de profilaxia pós-exposição dentro da janela terapêutica.`,
    '',
    decisionLines.length > 0
      ? `Na história da exposição e no raciocínio do fluxo, foi registrado que ${formatClinicalListText(decisionLines)}.`
      : 'Na história da exposição, ainda não há respostas estruturadas suficientes para reconstruir todo o caminho decisório.',
    '',
    examinationLine,
    '',
    `A impressão clínica final foi: ${finalTitle}. ${finalDescription}`,
    '',
    finalNarrative,
    '',
    doctorSignature
  ]
  const continuousText = paragraphs.join('\n')

  return {
    chiefComplaint,
    historyLines: decisionLines,
    examinationLines: [examinationLine],
    scoreLines: uniqueTextItems([
      windowDecision || null,
      exposedDecision || null,
      sourceDecision || sourceRiskDecision || null
    ]),
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines: [conductSentence],
    continuousText,
    text: continuousText
  }
}

const ansiedadeDecisionLabels: Record<string, string> = {
  iniciar: 'foi iniciada avaliação estruturada de crise de ansiedade/ataque de pânico no pronto-socorro',
  organico: 'houve suspeita de causa orgânica ou sinal de alerta que impede atribuir o quadro exclusivamente à ansiedade',
  sem_organico: 'não foram identificados sinais de causa orgânica grave após avaliação inicial dirigida',
  melhorou: 'houve melhora clínica com acolhimento, psicoeducação e abordagem não medicamentosa',
  persistente: 'os sintomas persistiram ou houve sofrimento importante apesar da abordagem não medicamentosa',
  avaliacao_saude_mental: 'foi indicado seguimento ou avaliação psicológica/psiquiátrica conforme disponibilidade e contexto clínico'
}

const getAnsiedadeDecision = (answers: Record<string, string>, stepId: string) => {
  const parsed = parseFlowAnswerForSummary(answers[stepId])
  const decision = typeof parsed?.decision === 'string' ? parsed.decision : answers[stepId]
  return decision ? ansiedadeDecisionLabels[decision] || formatClinicalValue(decision) : ''
}

const buildAnsiedadeClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const currentStepData = flowchart.steps[currentStep]
  const doctorSignature = formatDoctorSignature(doctor)
  const initialDecision = getAnsiedadeDecision(answers, 'ansiedade_inicio')
  const organicDecision = getAnsiedadeDecision(answers, 'ansiedade_excluir_organico')
  const nonDrugDecision = getAnsiedadeDecision(answers, 'ansiedade_abordagem_nao_medicamentosa')
  const medicationDecision = getAnsiedadeDecision(answers, 'ansiedade_medicamentosa')
  const decisionLines = uniqueTextItems([
    initialDecision,
    organicDecision,
    nonDrugDecision,
    medicationDecision
  ])

  const finalTitle = currentStepData?.title || flowchart.name
  const finalDescription = currentStepData?.description || flowchart.description
  const chiefComplaint = patient.admission?.symptoms?.join('; ') || 'episódio súbito de ansiedade intensa, medo ou desconforto com sintomas físicos associados'
  const isOrganic = currentStep === 'ansiedade_causa_organica'
  const isDischarge = currentStep === 'ansiedade_alta_orientada'
  const isPsych = currentStep === 'ansiedade_avaliacao_psiquiatrica'
  const hadMedicationStep = history.includes('ansiedade_medicamentosa') || currentStep === 'ansiedade_medicamentosa'

  const clinicalImpression = isOrganic
    ? 'O quadro não deve ser encerrado como crise de ansiedade até investigação e estabilização da causa orgânica suspeita.'
    : isDischarge
      ? 'O quadro foi compatível com crise de ansiedade/ataque de pânico após avaliação inicial sem sinais de causa orgânica grave, com melhora após medidas não medicamentosas.'
      : isPsych
        ? `O quadro foi compatível com crise de ansiedade/ataque de pânico após triagem de segurança, com necessidade de ${hadMedicationStep ? 'abordagem medicamentosa em dose baixa e ' : ''}avaliação ou seguimento em saúde mental.`
        : 'O caso foi conduzido como suspeita de crise de ansiedade/ataque de pânico, mantendo necessidade de reavaliação clínica conforme evolução e sinais de segurança.'

  const conductSentence = isOrganic
    ? 'Foi indicada investigação direcionada conforme manifestação predominante, incluindo possibilidade de síndrome coronariana aguda, arritmia, AVC, hipoxemia, broncoespasmo, intoxicação, hipoglicemia ou outra causa tóxico-metabólica.'
    : isDischarge
      ? 'Foram reforçadas orientações de respiração diafragmática, estratégias de aterramento, redução de estímulos, sinais de retorno e seguimento ambulatorial se recorrência ou prejuízo funcional.'
      : isPsych
        ? 'Foi recomendado solicitar avaliação psicológica/psiquiátrica quando disponível no pronto-socorro ou programar seguimento ambulatorial, com atenção a ideação suicida, risco psicossocial, intoxicação, psicose ou incapacidade de autocuidado.'
        : 'Foi mantida abordagem escalonada, priorizando acolhimento, psicoeducação, respiração diafragmática e benzodiazepínico em dose baixa apenas se persistirem sofrimento importante e não houver contraindicação clínica.'

  const medicationSentence = hadMedicationStep && !isOrganic
    ? 'Na etapa medicamentosa, foi considerado benzodiazepínico em baixa dose, com necessidade de reavaliar resposta clínica, nível de sedação e segurança respiratória, evitando uso em intoxicação por álcool ou outros depressores, hipoxemia, sedação excessiva ou risco respiratório.'
    : ''

  const title = isOrganic
    ? 'RELATÓRIO MÉDICO - SINTOMAS ANSIOSOS COM SUSPEITA DE CAUSA ORGÂNICA'
    : 'RELATÓRIO MÉDICO - CRISE DE ANSIEDADE / ATAQUE DE PÂNICO'
  const finalNarrative = [clinicalImpression, medicationSentence, conductSentence].filter(Boolean).join(' ')
  const examinationLine = isOrganic
    ? 'A avaliação física e complementar deve ser direcionada ao sinal de alerta predominante, incluindo sinais vitais, oximetria, glicemia, ECG, exame neurológico ou avaliação respiratória conforme apresentação.'
    : 'Na avaliação inicial, recomenda-se registrar sinais vitais, oximetria, glicemia quando indicada, exame cardiovascular, respiratório e neurológico direcionado, especialmente quando houver dor torácica, palpitações, dispneia, parestesias ou alteração do nível de consciência.'

  const paragraphs = [
    title,
    '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de ${chiefComplaint}. A avaliação foi conduzida no contexto de sintomas ansiosos agudos no pronto-socorro, com prioridade inicial de excluir causas orgânicas potencialmente graves antes de atribuir o quadro a ansiedade.`,
    '',
    decisionLines.length > 0
      ? `Na história da moléstia atual e no raciocínio do fluxo, foi registrado que ${formatClinicalListText(decisionLines)}.`
      : 'Na história da moléstia atual, ainda não há respostas estruturadas suficientes para reconstruir todo o caminho decisório.',
    '',
    examinationLine,
    '',
    `A impressão clínica final foi: ${finalTitle}. ${finalDescription}`,
    '',
    finalNarrative,
    '',
    doctorSignature
  ]
  const continuousText = paragraphs.join('\n')

  return {
    chiefComplaint,
    historyLines: decisionLines,
    examinationLines: [examinationLine],
    scoreLines: uniqueTextItems([
      organicDecision || null,
      nonDrugDecision || null,
      medicationDecision || null
    ]),
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines: [conductSentence],
    continuousText,
    text: continuousText
  }
}

const formatStructuredAnswer = (parsed: FlowSummaryAnswer | null) => {
  if (!parsed) return ''
  const lines: string[] = []
  const houseValue = typeof parsed.houseBrackmann === 'string' ? parsed.houseBrackmann : ''
  const houseLabel = typeof parsed.houseBrackmannLabel === 'string'
    ? parsed.houseBrackmannLabel
    : houseBrackmannLabels[houseValue]
  if (houseLabel) lines.push(`House-Brackmann ${houseLabel}`)
  if (typeof parsed.within72Hours === 'boolean') {
    lines.push(parsed.within72Hours ? 'janela terapêutica até 72 horas' : 'janela terapêutica superior a 72 horas')
  }
  if (typeof parsed.corticosteroid === 'boolean') {
    lines.push(parsed.corticosteroid ? 'corticosteroide selecionado' : 'corticosteroide não selecionado')
  }
  if (typeof parsed.antiviral === 'string') {
    lines.push(antiviralLabels[parsed.antiviral] || `antiviral: ${parsed.antiviral}`)
  }
  if (typeof parsed.eyeCare === 'boolean') {
    lines.push(parsed.eyeCare ? 'proteção ocular selecionada' : 'proteção ocular não selecionada')
  }
  return lines.join('; ')
}

const getAnswerDecision = (flowchart: EmergencyFlowchart, stepId: string, raw?: string) => {
  const parsed = parseFlowAnswerForSummary(raw)
  const decision = typeof parsed?.decision === 'string' ? parsed.decision : ''
  if (decision) {
    const step = flowchart.steps[stepId]
    const matchedOption = step?.options?.find((option) => option.value === decision || option.nextStep === decision)
    return matchedOption?.text || formatClinicalValue(decision)
  }
  return formatStructuredAnswer(parsed)
}

const buildTEPClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const exam = parseFlowAnswerForSummary(answers.tep_exame_fisico)
  const wells = parseFlowAnswerForSummary(answers.tep_wells)
  const perc = parseFlowAnswerForSummary(answers.tep_perc)
  const years = parseFlowAnswerForSummary(answers.tep_years)
  const spesi = parseFlowAnswerForSummary(answers.tep_spesi)
  const category = parseFlowAnswerForSummary(answers.tep_categoria)
  const contraindications = parseFlowAnswerForSummary(answers.tep_trombolise_contra)
  const current = flowchart.steps[currentStep]
  const vital = exam?.sinaisVitais && typeof exam.sinaisVitais === 'object' ? exam.sinaisVitais as Record<string, unknown> : {}
  const physical = exam?.exameFisico && typeof exam.exameFisico === 'object' ? exam.exameFisico as Record<string, unknown> : {}
  const vitalLines = uniqueTextItems([
    vital.bloodPressure ? `PA ${vital.bloodPressure} mmHg` : null,
    vital.heartRate != null ? `FC ${vital.heartRate} bpm` : null,
    vital.respiratoryRate != null ? `FR ${vital.respiratoryRate} irpm` : null,
    vital.oxygenSaturation != null ? `SpO₂ ${vital.oxygenSaturation}%` : null,
    vital.temperature != null ? `temperatura ${String(vital.temperature).replace('.', ',')} °C` : null,
    vital.glucose ? `glicemia ${vital.glucose} mg/dL` : null
  ])
  const examLines = Object.entries(physical).flatMap(([system, value]) => {
    if (!value || typeof value !== 'object') return []
    const record = value as Record<string, unknown>
    const altered = typeof record.altered === 'string' ? record.altered.trim() : ''
    return altered ? [`${system}: ${altered}`] : []
  })
  const scoreLines = uniqueTextItems([
    typeof wells?.score === 'number' ? `Wells ${String(wells.score).replace('.', ',')} (${formatClinicalValue(wells.classificacao)})` : null,
    perc?.resultado ? `PERC ${formatClinicalValue(perc.resultado)}` : null,
    years?.dDimero != null ? `YEARS: ${Array.isArray(years.criteriosSelecionados) ? years.criteriosSelecionados.length : 0} critério(s), D-dímero ${years.dDimero} ng/mL, corte ${years.pontoDeCorte} ng/mL (${formatClinicalValue(years.resultado)})` : null,
    typeof spesi?.score === 'number' ? `sPESI ${spesi.score} (${formatClinicalValue(spesi.classificacao)})` : null,
    category?.categoria ? `categoria de risco ${category.categoria}` : null
  ])
  const decisions = history.map((stepId) => {
    const step = flowchart.steps[stepId]
    const decision = getAnswerDecision(flowchart, stepId, answers[stepId])
    return step && decision ? `${step.title}: ${decision}` : ''
  }).filter(Boolean)
  const isExcluded = currentStep === 'tep_excluido'
  const isOutpatient = currentStep === 'tep_alta'
  const isIcu = currentStep === 'tep_uti' || history.includes('tep_instavel_conduta')
  const isConfirmed = isOutpatient || isIcu || currentStep === 'tep_internacao' || history.includes('tep_spesi')
  const absoluteContra = contraindications?.contraindicaoAbsoluta === true
  const impression = isExcluded
    ? 'A estratégia diagnóstica aplicada excluiu TEP agudo no contexto clínico registrado.'
    : isConfirmed
      ? `Tromboembolismo pulmonar confirmado ou sustentado pela investigação, classificado como risco ${category?.categoria || 'ainda não definido'}.`
      : 'Suspeita de tromboembolismo pulmonar em investigação, ainda sem desfecho diagnóstico final registrado.'
  const conduct = isIcu
    ? `Indicados suporte intensivo, anticoagulação quando segura e avaliação imediata de reperfusão${absoluteContra ? ', evitando trombólise sistêmica devido à contraindicação absoluta registrada e priorizando estratégia por cateter ou cirúrgica' : ''}.`
    : isOutpatient
      ? 'Paciente direcionado a tratamento ambulatorial por baixo risco, com anticoagulação, seguimento precoce, plano de duração terapêutica e sinais de alarme.'
      : currentStep === 'tep_internacao'
        ? 'Indicada internação para anticoagulação, monitorização de deterioração hemodinâmica/respiratória e reavaliação de biomarcadores e ventrículo direito.'
        : isExcluded
          ? 'Orientada investigação de diagnósticos diferenciais e retorno imediato diante de piora respiratória, dor torácica, síncope, hemoptise ou hipoxemia.'
          : 'Prosseguir com a estratégia diagnóstica conforme probabilidade pré-teste e estabilidade clínica.'
  const chiefComplaint = patient.admission?.chiefComplaint || patient.admission?.symptoms?.join('; ') || 'suspeita clínica de tromboembolismo pulmonar'
  const doctorSignature = formatDoctorSignature(doctor)
  const finalTitle = current?.title || flowchart.name
  const finalDescription = current?.description || flowchart.description
  const historyLines = decisions.slice(-10)
  const examinationLines = [...(vitalLines.length ? [`Sinais vitais: ${vitalLines.join(', ')}`] : []), ...examLines]
  const finalNarrative = `${impression} ${conduct}`
  const text = [
    'RESUMO CLÍNICO SEMIOLÓGICO - TEP', '', 'Identificação e contexto',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}.`,
    '', 'Queixa principal / HMA', chiefComplaint,
    '', 'Sinais vitais e exame físico', examinationLines.length ? examinationLines.map(item => `- ${item}`).join('\n') : '- Não registrados.',
    '', 'Raciocínio diagnóstico e estratificação', scoreLines.length ? scoreLines.map(item => `- ${item}`).join('\n') : '- Estratificação ainda não concluída.',
    '', 'Caminho percorrido', historyLines.length ? historyLines.map(item => `- ${item}`).join('\n') : '- Avaliação inicial.',
    '', 'Impressão clínica e conduta', finalNarrative, '', 'Médico responsável', doctorSignature
  ].join('\n')
  const continuousText = [
    'RELATÓRIO MÉDICO - TROMBOEMBOLISMO PULMONAR', '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, avaliado(a) por ${chiefComplaint}.`,
    examinationLines.length ? `Na avaliação objetiva, foram registrados ${examinationLines.join('; ')}.` : 'Sinais vitais e exame físico ainda não foram registrados.',
    scoreLines.length ? `A estratificação demonstrou ${scoreLines.join('; ')}.` : 'A estratificação diagnóstica ainda está em andamento.',
    impression, conduct, '', doctorSignature
  ].join('\n\n')
  return { chiefComplaint, historyLines, examinationLines, scoreLines, finalTitle, finalDescription, finalNarrative, doctorSignature, conductLines: [conduct], continuousText, text }
}

export function buildClinicalSummary(
  patient: Patient,
  options?: {
    flowchart?: EmergencyFlowchart
    currentStep?: string
    history?: string[]
    answers?: Record<string, string>
    doctor?: { name?: string | null; crm?: string | null } | null
  }
): ClinicalSummaryData {
  const flowchart = options?.flowchart || getFlowchartById(patient.selectedFlowchart || '') || getFlowchartById('dengue')
  const currentStep = options?.currentStep || patient.flowchartState?.currentStep || flowchart?.initialStep || ''
  const history = options?.history || patient.flowchartState?.history || []
  const answers = options?.answers || patient.flowchartState?.answers || {}
  const currentStepData = flowchart?.steps[currentStep]

  if (!flowchart) {
    const fallbackText = 'Resumo clínico indisponível: fluxograma não encontrado.'
    return {
      chiefComplaint: fallbackText,
      historyLines: [],
      examinationLines: [],
      scoreLines: [],
      finalTitle: 'Resumo clínico',
      finalDescription: fallbackText,
      finalNarrative: fallbackText,
      doctorSignature: formatDoctorSignature(options?.doctor),
      conductLines: [fallbackText],
      continuousText: fallbackText,
      text: fallbackText
    }
  }

  if (flowchart.id === 'tvp') {
    return buildTVPClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'tep') {
    return buildTEPClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'pep_hiv') {
    return buildPepHivClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'crise_ansiedade') {
    return buildAnsiedadeClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  const answerEntries = history.reduce<FlowSummaryEntry[]>((entries, stepId) => {
    const step = flowchart.steps[stepId]
    if (!step) return entries
    const rawAnswer = answers[stepId]
    const answerLabel = getAnswerDecision(flowchart, stepId, rawAnswer)
    const parsed = parseFlowAnswerForSummary(rawAnswer)
    entries.push({ step, answerLabel, parsed })
    return entries
  }, [])

  const chiefComplaint = answerEntries
    .map((entry) => formatClinicalValue(entry.parsed?.queixaPrincipal))
    .find(Boolean)
    || patient.admission?.symptoms?.join('; ')
    || currentStepData?.description
    || flowchart.description

  const historyLines = answerEntries
    .filter((entry) => entry.answerLabel)
    .map((entry) => `${entry.step.title}: ${entry.answerLabel}`)
    .slice(-8)

  const examinationLines = answerEntries.flatMap((entry) => {
    const lines: string[] = []
    const vitalSigns = formatClinicalValue(entry.parsed?.sinaisVitais)
    const physicalExam = formatClinicalValue(entry.parsed?.exameFisico)
    const findings = formatClinicalValue(entry.parsed?.sinaisEAchados || entry.parsed?.achadosSelecionados)
    const notes = formatClinicalValue(entry.parsed?.observacoes || entry.parsed?.outrosAchados)
    if (vitalSigns) lines.push(`Sinais vitais: ${vitalSigns}`)
    if (physicalExam) lines.push(`Exame físico: ${physicalExam}`)
    if (findings) lines.push(`Achados semiológicos: ${findings}`)
    if (notes) lines.push(`Observações clínicas: ${notes}`)
    return lines
  })

  const scoreLines = answerEntries.flatMap((entry) => {
    const lines: string[] = []
    const score = formatClinicalValue(entry.parsed?.score || entry.parsed?.pontuacaoMaximaMarshall)
    const classification = formatClinicalValue(
      entry.parsed?.classificacao
      || entry.parsed?.classificacaoAtlanta
      || entry.parsed?.destino
      || entry.parsed?.gravidade
      || entry.parsed?.risco
      || entry.parsed?.grupo
      || entry.parsed?.status
    )
    const selectedCriteria = formatClinicalValue(
      entry.parsed?.criteriosSelecionados
      || entry.parsed?.criterios
      || entry.parsed?.redFlagsSelecionadas
      || entry.parsed?.examesSelecionados
      || entry.parsed?.examesSolicitados
    )
    if (score || classification) lines.push(`${entry.step.title}: ${[score ? `pontuação ${score}` : '', classification].filter(Boolean).join(' - ')}`)
    if (selectedCriteria) lines.push(`${entry.step.title}: ${selectedCriteria}`)
    return lines
  })

  const finalTitle = currentStepData?.title || flowchart.name
  const finalDescription = currentStepData?.description || flowchart.description
  const finalAnswer = answerEntries.at(-1)?.answerLabel
  const finalNarrative = [
    `Ao final do fluxograma, o caso foi direcionado para: ${finalTitle}.`,
    finalDescription,
    finalAnswer ? `A decisão clínica mais recente registrada foi: ${finalAnswer}.` : '',
    currentStepData?.critical ? 'Por se tratar de etapa crítica, recomenda-se manter monitorização clínica, reavaliação seriada e escalonamento de cuidado conforme gravidade.' : ''
  ].filter(Boolean).join(' ')
  const conductLines = [
    finalNarrative
  ].filter(Boolean)
  const doctorSignature = formatDoctorSignature(options?.doctor)

  const textSections = [
    'RESUMO CLÍNICO SEMIOLÓGICO',
    '',
    'Identificação e contexto',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}. Fluxograma aplicado: ${flowchart.name}.`,
    '',
    'Queixa principal / motivo do atendimento',
    chiefComplaint,
    '',
    'História da moléstia atual e raciocínio do fluxo',
    historyLines.length > 0 ? historyLines.map((line) => `- ${line}`).join('\n') : '- Caminho clínico ainda sem respostas estruturadas registradas.',
    '',
    'Sinais, sintomas e exame físico',
    examinationLines.length > 0 ? Array.from(new Set(examinationLines)).map((line) => `- ${line}`).join('\n') : '- Sem sinais vitais ou exame físico estruturado registrados neste fluxo.',
    '',
    'Exames, critérios e estratificação',
    scoreLines.length > 0 ? Array.from(new Set(scoreLines)).slice(-10).map((line) => `- ${line}`).join('\n') : '- Sem exames, escores ou critérios estruturados registrados neste caminho.',
    '',
    'Impressão clínica',
    `${finalTitle}. ${finalDescription}`,
    '',
    'Síntese final e conduta',
    finalNarrative,
    '',
    'Médico responsável',
    doctorSignature
  ]
  const continuousSections = [
    'RELATÓRIO MÉDICO',
    '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, no contexto do fluxograma ${flowchart.name}. A queixa principal ou motivo do atendimento registrado foi: ${chiefComplaint}.`,
    '',
    historyLines.length > 0
      ? `Durante o raciocínio clínico estruturado, foram percorridas as seguintes decisões principais: ${historyLines.join('; ')}.`
      : 'Durante o raciocínio clínico estruturado, ainda não há respostas suficientes registradas para descrever o caminho percorrido.',
    '',
    examinationLines.length > 0
      ? `Na avaliação semiológica, constam: ${Array.from(new Set(examinationLines)).join('; ')}.`
      : 'Sinais vitais e exame físico estruturado não foram registrados neste fluxo, devendo ser correlacionados com a avaliação clínica presencial.',
    '',
    scoreLines.length > 0
      ? `Quanto à investigação, critérios e estratificação, foram registrados: ${Array.from(new Set(scoreLines)).slice(-10).join('; ')}.`
      : 'Não foram registrados exames, escores ou critérios complementares estruturados neste caminho.',
    '',
    finalNarrative,
    '',
    doctorSignature
  ]

  return {
    chiefComplaint,
    historyLines,
    examinationLines: Array.from(new Set(examinationLines)),
    scoreLines: Array.from(new Set(scoreLines)).slice(-10),
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines,
    continuousText: continuousSections.join('\n'),
    text: textSections.join('\n')
  }
}
