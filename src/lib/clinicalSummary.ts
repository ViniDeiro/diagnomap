import { getFlowchartById } from '@/data/emergencyFlowcharts'
import type { Patient } from '@/types/patient'
import type { EmergencyFlowchart, EmergencyStep } from '@/types/emergency'
import { getOseltamivirDoseText } from '@/lib/influenza'
import { getPneumoniaSmartCopRisk } from '@/lib/pneumonia'
import { parseUniversalClinicalAssessment, summarizeUniversalPhysicalExam, UNIVERSAL_ASSESSMENT_ANSWER_KEY } from '@/components/UniversalClinicalAssessment'

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
type PneumoniaExamSummary = {
  generalState?: string
  coloration?: { status?: string; grade?: number }
  hydration?: { status?: string; grade?: number }
  cyanosis?: { status?: string; grade?: number }
  jaundice?: { status?: string; grade?: number }
  temperature?: { status?: string; value?: number }
  respiration?: { status?: string; grade?: number }
  neuro?: { glasgow?: number; altered?: string }
  pulmonary?: { altered?: string }
  cardiac?: { altered?: string }
  abdomen?: { altered?: string }
  extremities?: { altered?: string }
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

const abcdeDomainLabels: Record<string, string> = {
  airway: 'A — via aérea',
  breathing: 'B — respiração',
  circulation: 'C — circulação',
  disability: 'D — estado neurológico',
  exposure: 'E — exposição e exame completo'
}

const anaphylaxisAirwayThreatLabels: Record<string, string> = {
  stridor: 'estridor progressivo',
  voice_change: 'mudança progressiva da voz',
  saliva_difficulty: 'sialorreia ou dificuldade para deglutir saliva',
  tongue_edema: 'edema importante de língua ou orofaringe',
  neck_edema: 'edema cervical relevante',
  limited_mouth: 'abertura oral limitada',
  rapid_progression: 'edema em rápida progressão',
  difficult_airway: 'previsão de via aérea difícil'
}

const anaphylaxisAirwayActionLabels: Record<string, string> = {
  expert_help: 'operador experiente acionado',
  surgical_team: 'equipe apta a acesso cervical avisada precocemente',
  difficult_airway_cart: 'material de via aérea difícil preparado',
  oxygenation: 'estratégia de oxigenação organizada',
  limited_attempts: 'tentativas limitadas com mudança planejada de estratégia',
  front_neck_ready: 'acesso frontal de emergência deixado pronto'
}

const anaphylaxisPocusActionLabels: Record<string, string> = {
  mark_cricothyroid: 'membrana cricotireóidea localizada/marcada com POCUS',
  confirm_tracheal: 'POCUS selecionado como complemento à confirmação traqueal',
  bilateral_lung: 'deslizamento pleural bilateral selecionado como verificação complementar',
  focused_shock: 'POCUS focal integrado à avaliação do choque'
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
  const selectedLegLabel = selectedLeg
    ? getTVPLegLabel(selectedLeg)
    : typeof startData?.selectedLegLabel === 'string' && /esquerd/i.test(startData.selectedLegLabel)
      ? 'membro inferior esquerdo'
      : typeof startData?.selectedLegLabel === 'string' && /direit/i.test(startData.selectedLegLabel)
        ? 'membro inferior direito'
        : 'membro acometido não especificado'
  const selectedFindings = Array.isArray(clinicalData?.sinaisEAchados)
    ? clinicalData.sinaisEAchados.map((item) => formatClinicalValue(item)).filter(Boolean)
    : []
  const otherFindings = typeof clinicalData?.outrosAchados === 'string' ? clinicalData.outrosAchados.trim() : ''
  const respiratoryAlertPattern = /dispneia|dor torácica|hemoptise|síncope|embolia pulmonar|tromboembolismo pulmonar/i
  const limbThreatPattern = /flegmasia|cianose|palidez|ameaça ao membro|déficit sensitivo|déficit motor|iliofemoral|progressão rápida/i
  const riskFactorPattern = /imobilização|cirurgia|trauma|câncer|gravidez|puerpério|estrogênios|trombofilia|TVP\/TEV|prévia/i
  const allReportedFindings = uniqueTextItems([
    patient.admission?.chiefComplaint,
    ...(patient.admission?.symptoms || []),
    ...selectedFindings,
    otherFindings
  ])
  const hasRespiratoryAlert = allReportedFindings.some((item) => respiratoryAlertPattern.test(item))
  const hasLimbThreat = allReportedFindings.some((item) => limbThreatPattern.test(item))
  const symptoms = uniqueTextItems([
    ...allReportedFindings.filter((item) =>
      !respiratoryAlertPattern.test(item)
      && !limbThreatPattern.test(item)
      && !riskFactorPattern.test(item)
      && /dor|edema|panturrilha|coxa|calor|rubor|cianose|taquicardia|sensibilidade|circunferência|assimetria/i.test(item)
    )
  ])
  const riskFactors = uniqueTextItems([
    ...allReportedFindings.filter((item) => riskFactorPattern.test(item))
  ])
  const vascularAlertFindings = uniqueTextItems([
    ...allReportedFindings.filter((item) => limbThreatPattern.test(item))
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
  const wellsClassificationLabel = /baix/i.test(wellsClassification)
    ? 'baixa probabilidade clínica'
    : /moder/i.test(wellsClassification)
      ? 'probabilidade clínica moderada'
      : /alt/i.test(wellsClassification)
        ? 'alta probabilidade clínica'
        : wellsClassification || (wellsScore == null
          ? 'classificação não informada'
          : wellsScore <= 0
            ? 'baixa probabilidade clínica'
            : wellsScore <= 2
              ? 'probabilidade clínica moderada'
              : 'alta probabilidade clínica')
  const wellsCriteria = Array.isArray(wellsData?.criteriosSelecionados)
    ? uniqueTextItems(wellsData.criteriosSelecionados.map((item) => tvpWellsLabels[String(item)] || formatClinicalValue(item)))
    : []
  // O exame vascular mais recente deve prevalecer no resumo.
  const pocusValue = answers.repetir_us || answers.us_compressiva || answers.pocus_resultado_pre_d_dimero
  const normalizedPocus = String(pocusValue || '').toLowerCase()
  const hasPositiveImaging = normalizedPocus.includes('us_positive') || normalizedPocus.includes('repeat_positive')
  const hasNegativeImaging = normalizedPocus.includes('us_negative') || normalizedPocus.includes('repeat_negative')
  const hasInconclusiveImaging = normalizedPocus.includes('us_inconclusive')
  const dDimerValue = answers.tvp_d_dimero_alerta || answers.baixa_probabilidade
  const normalizedDDimer = String(dDimerValue || '').toLowerCase()
  const hasNegativeDDimer = normalizedDDimer.includes('ddimer_negative')
  const hasPositiveDDimer = normalizedDDimer.includes('ddimer_positive')
  const confirmedLocation = answers.classificar_extensao_tvp === 'proximal'
    ? 'proximal'
    : answers.classificar_extensao_tvp === 'distal'
      ? 'distal'
      : ''
  const dDimerEligibility = answers.d_dimero_elegibilidade
  const contraindications = Array.isArray(contraData?.contraindicacoesSelecionadas)
    ? uniqueTextItems(contraData.contraindicacoesSelecionadas.map((item) => tvpContraindicationLabels[String(item)] || formatClinicalValue(item)))
    : []
  const therapies = Array.isArray(treatmentData?.opcoesTerapeuticasSelecionadas)
    ? uniqueTextItems(treatmentData.opcoesTerapeuticasSelecionadas.map((item) => tvpTherapyLabels[String(item)] || formatClinicalValue(item)))
    : []

  const path = new Set([...history, currentStep])
  const isVascularReferral = path.has('encaminhamento_urgente') || path.has('tvp_aguarda_avaliacao_vascular')
  const isUrgentVascular = path.has('tvp_urgencia_vascular_imediata') || path.has('tvp_urgencia_vascular_concluida') || path.has('tvp_internacao_uti')
  const isExcluded = (currentStep === 'tvp_excluida' || currentStep === 'seguimento_ambulatorial') && !hasPositiveImaging
  const isTEPInvestigation = path.has('tvp_internacao_investigar_tep')
  const isInvestigationAdmission = path.has('tvp_internacao_investigacao_clinica')
  const isPendingRepeatImaging = path.has('repetir_us') && !hasPositiveImaging && !isExcluded
  const isAnticoagulated = therapies.length > 0 || path.has('anticoagulacao_iniciada')
  const isConfirmed = hasPositiveImaging || (!isExcluded && (path.has('anticoagulacao_iniciada') || (isVascularReferral && !isUrgentVascular)))

  const recordedChiefComplaint = patient.admission?.chiefComplaint?.trim() || ''
  const chiefComplaintLooksLikeChecklist = /sintomas respiratórios concomitantes|suspeitar embolia pulmonar/i.test(recordedChiefComplaint)
  const chiefComplaint = recordedChiefComplaint && !chiefComplaintLooksLikeChecklist
    ? recordedChiefComplaint
    : (hasRespiratoryAlert
      ? 'sintomas respiratórios associados, com preocupação para possível tromboembolismo pulmonar'
      : symptoms.length > 0
        ? formatClinicalListText(symptoms.slice(0, 3))
        : `suspeita clínica de trombose venosa profunda em ${selectedLegLabel}`)
  const title = 'RELATÓRIO MÉDICO - TROMBOSE VENOSA PROFUNDA'
  const finalTitle = currentStepData?.title || flowchart.name
  const finalDescription = currentStepData?.description || flowchart.description
  const conductText = isUrgentVascular
    ? 'Foi indicada interrupção do fluxo ambulatorial, internação imediata, monitorização contínua, estabilização clínica e avaliação presencial urgente pela Cirurgia Vascular. Manter vigilância de perfusão distal, progressão do edema, dor, déficit sensitivo ou motor e sinais de embolia pulmonar enquanto a equipe especializada não assumir formalmente o caso.'
    : isVascularReferral
      ? 'Foi solicitada avaliação prioritária pela Cirurgia Vascular. O paciente deve permanecer internado ou em observação monitorizada, mantendo o tratamento instituído e a responsabilidade assistencial da equipe de emergência até a transferência formal do caso.'
      : isTEPInvestigation
        ? 'Pela presença de sintomas respiratórios ou sinais de possível embolização, foi indicada internação e investigação imediata de tromboembolismo pulmonar, com monitorização e suporte conforme estabilidade clínica.'
        : isInvestigationAdmission
          ? 'Foi indicada internação para aprofundamento da investigação, monitorização clínica e obtenção de imagem vascular definitiva, sem liberação para seguimento ambulatorial nesta etapa.'
          : isConfirmed
            ? 'O quadro foi conduzido como TVP confirmada, com anticoagulação terapêutica quando não contraindicada, orientação sobre risco hemorrágico e sinais de embolia pulmonar, além de seguimento clínico e revisão da duração do tratamento conforme fator desencadeante.'
            : isExcluded
              ? 'A estratégia diagnóstica não demonstrou TVP no desfecho registrado. Orienta-se investigar diagnósticos diferenciais e retornar imediatamente diante de progressão do edema ou da dor, cianose, dispneia, dor torácica, hemoptise, síncope ou outra piora clínica.'
              : isPendingRepeatImaging
                ? 'A investigação permanece inconclusiva. Deve-se realizar ultrassonografia venosa completa ou repetir o exame em 5 a 7 dias, antecipando a reavaliação diante de piora ou aparecimento de sinais de alarme.'
                : 'A investigação de TVP permanece em andamento e a conduta definitiva depende da integração entre probabilidade clínica, imagem vascular e evolução.'
  const absoluteContraindication = contraData?.possuiContraindicacaoAbsoluta === true
  const anticoagulationText = isExcluded
    ? 'Como a investigação não demonstrou TVP no desfecho registrado, não houve indicação de iniciar anticoagulação terapêutica por este fluxo.'
    : absoluteContraindication
      ? `Foi documentada contraindicação absoluta à anticoagulação${contraindications.length ? `: ${formatClinicalListText(contraindications)}` : ''}. Não iniciar ou suspender temporariamente a anticoagulação e discutir imediatamente estratégia alternativa com a Cirurgia Vascular.`
      : contraindications.length > 0
        ? `Foram registrados alertas ou contraindicações relativas à anticoagulação: ${formatClinicalListText(contraindications)}. A relação entre benefício trombótico e risco hemorrágico deve ser individualizada.`
        : contraData
          ? 'A segurança para anticoagulação foi avaliada, sem documentação de contraindicações formais no atendimento.'
          : 'A avaliação de contraindicações para anticoagulação não foi registrada durante este atendimento.'
  const therapyText = isExcluded
    ? ''
    : therapies.length > 0
    ? `A terapêutica antitrombótica selecionada foi ${formatClinicalListText(therapies)}, devendo constar em prescrição própria a dose, a via, o horário de início, os ajustes clínicos e a duração planejada.`
    : isAnticoagulated
      ? 'Consta início de anticoagulação, porém o fármaco, a dose e o esquema posológico não foram documentados neste relatório.'
      : 'Não foi documentada definição de esquema anticoagulante específico até o momento.'
  const specialContextText = path.has('conduta_gestante')
    ? 'No contexto de gestação ou puerpério, foi indicada estratégia com heparina de baixo peso molecular, com ajuste individual e manutenção pelo período recomendado no fluxo; durante a gestação, evitar varfarina e anticoagulantes orais diretos.'
    : path.has('conduta_cancer')
      ? 'No contexto de câncer ativo, a escolha e a duração da anticoagulação devem considerar risco hemorrágico, interações medicamentosas, localização tumoral, função renal e manutenção enquanto houver doença ou tratamento oncológico ativo.'
      : ''
  const wellsSentence = wellsScore != null
    ? `A probabilidade clínica pré-teste foi classificada como ${wellsClassificationLabel}, com escore de Wells igual a ${wellsScore} ponto${wellsScore === 1 ? '' : 's'}.${wellsCriteria.length > 0 ? ` Contribuíram para o escore ${formatClinicalListText(wellsCriteria)}.` : ''}`
    : 'A probabilidade clínica pré-teste pelo escore de Wells não foi documentada durante esta avaliação.'
  const imagingAndLaboratorySentence = hasPositiveImaging
    ? `${wellsScore != null && /baix/i.test(wellsClassificationLabel) ? 'Embora a probabilidade clínica inicial tenha sido baixa, a' : 'A'} ultrassonografia Doppler venosa demonstrou trombose venosa profunda${confirmedLocation ? ` de localização ${confirmedLocation}` : ''}.${hasPositiveDDimer ? ' O D-dímero também foi positivo; embora inespecífico, o resultado é concordante com a investigação, sem substituir o achado de imagem.' : hasNegativeDDimer ? ' O D-dímero foi negativo, resultado que não afasta trombose diante da imagem vascular positiva.' : dDimerEligibility === 'ddimer_limited' ? ' O D-dímero foi evitado por baixa utilidade clínica neste contexto.' : ''}`
    : hasNegativeImaging && hasPositiveDDimer
      ? 'O Doppler venoso inicial foi negativo, porém o D-dímero foi positivo. Se a suspeita clínica persistir, permanece indicada repetição da ultrassonografia conforme o protocolo.'
      : hasNegativeImaging && hasNegativeDDimer
        ? `O Doppler venoso não demonstrou trombose e o D-dímero foi negativo${/baix/i.test(wellsClassificationLabel) ? ', combinação que reduz significativamente a probabilidade de TVP no cenário de baixa probabilidade clínica' : ''}.`
        : hasInconclusiveImaging
          ? 'A avaliação ultrassonográfica vascular foi inconclusiva ou tecnicamente limitada, não permitindo excluir TVP; permanece indicada complementação diagnóstica.'
          : hasNegativeImaging
            ? 'O Doppler venoso não demonstrou trombose, devendo o resultado ser interpretado com a probabilidade clínica e a necessidade de exame seriado.'
            : 'Não foi documentado resultado conclusivo de imagem vascular nesta avaliação.'
  const diagnosticInterpretation = `${wellsSentence} ${imagingAndLaboratorySentence}`

  const diagnosticImpression = hasPositiveImaging
    ? `Os achados obtidos são compatíveis com trombose venosa profunda${confirmedLocation ? ` ${confirmedLocation}` : ''} em ${selectedLegLabel}.`
    : isExcluded
      ? 'A estratégia diagnóstica aplicada não sustentou trombose venosa profunda no desfecho atual.'
      : isConfirmed
        ? 'O conjunto clínico e a conduta instituída sustentam o diagnóstico de trombose venosa profunda, embora o resultado confirmatório da imagem não esteja descrito no documento.'
        : hasInconclusiveImaging
          ? 'A investigação permanece inconclusiva, sem possibilidade de excluir trombose venosa profunda até complementação da imagem vascular.'
          : hasNegativeImaging && hasPositiveDDimer
            ? 'A suspeita de trombose venosa profunda permanece em investigação e ainda não há confirmação diagnóstica.'
            : 'Não há confirmação definitiva de trombose venosa profunda nos dados disponíveis até o momento.'
  const respiratoryImpression = hasRespiratoryAlert || isTEPInvestigation
    ? 'A presença de sintomas respiratórios associados impõe preocupação com possível embolia pulmonar concomitante e requer investigação imediata conforme a estabilidade clínica.'
    : ''
  const vascularSeverityImpression = hasLimbThreat
    ? 'Os sinais de comprometimento venoso extenso ou ameaça ao membro configuram emergência vascular.'
    : isUrgentVascular
      ? 'A gravidade clínica registrada motivou abordagem vascular em caráter de urgência.'
      : ''
  const diagnosticConclusion = [diagnosticImpression, respiratoryImpression, vascularSeverityImpression].filter(Boolean).join(' ')
  const finalNarrative = `Conclusão: ${diagnosticConclusion} ${conductText}`

  const historyNarrative = [
    symptoms.length > 0
      ? `Na história clínica, foram registrados sintomas locais compatíveis com doença tromboembólica venosa, incluindo ${formatClinicalListText(symptoms)}.`
      : `A investigação foi motivada por suspeita clínica de trombose venosa profunda em ${selectedLegLabel}.`,
    riskFactors.length > 0
      ? `Como fatores predisponentes, foram identificados ${formatClinicalListText(riskFactors)}.`
      : '',
    hasRespiratoryAlert
      ? 'Também foram identificados sintomas respiratórios de alerta, levantando a possibilidade de embolia pulmonar associada.'
      : '',
    vascularAlertFindings.length > 0
      ? `Foram ainda observados sinais de possível comprometimento venoso extenso ou ameaça ao membro: ${formatClinicalListText(vascularAlertFindings)}.`
      : ''
  ].filter(Boolean).join(' ')
  const examinationNarrative = `${vitalLines.length > 0 ? `Na avaliação inicial, foram registrados ${formatClinicalListText(vitalLines)}. ` : ''}${directedExamLines.length > 0 ? `Ao exame físico direcionado do ${selectedLegLabel}, observaram-se ${formatClinicalListText(directedExamLines)}.` : `O exame físico direcionado do ${selectedLegLabel} não apresentou registro estruturado suficiente no fluxo aplicado, devendo seus achados ser correlacionados com a avaliação presencial realizada pela equipe assistente.`}`
  const antithromboticNarrative = [anticoagulationText, therapyText, specialContextText].filter(Boolean).join(' ')

  const paragraphs = [
    title,
    '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de ${chiefComplaint.replace(/[.]+$/, '')}. Durante a avaliação, foram analisados fatores clínicos de risco, sinais de gravidade, probabilidade pré-teste pelo escore de Wells, marcadores laboratoriais e achados de imagem vascular.`,
    '',
    historyNarrative,
    '',
    examinationNarrative,
    '',
    diagnosticInterpretation,
    '',
    antithromboticNarrative,
    '',
    finalNarrative,
    '',
    doctorSignature,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`
  ]
  const continuousText = paragraphs.join('\n')

  return {
    chiefComplaint,
    historyLines: [historyNarrative],
    examinationLines: [examinationNarrative],
    scoreLines: [diagnosticInterpretation],
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines: uniqueTextItems([antithromboticNarrative, conductText]),
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
    ? 'Foi orientado iniciar profilaxia imediatamente, preferencialmente com tenofovir/lamivudina associado a dolutegravir por 28 dias, além de acompanhamento com infectologista, seguimento sorológico, avaliação de ISTs e hepatites virais, orientação de adesão e retorno se sinais de toxicidade ou intolerância.'
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

const ansiedadeRouteAlertLabels: Record<string, string> = {
  sca: 'suspeita de síndrome coronariana aguda',
  arritmia: 'suspeita de arritmia',
  neurologico: 'suspeita de AVC ou outra causa neurológica',
  respiratorio_toxico: 'suspeita de causa respiratória ou tóxica'
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
  const organicAnswer = parseFlowAnswerForSummary(answers.ansiedade_excluir_organico)
  const selectedRouteAlerts = Array.isArray(organicAnswer?.routeAlerts)
    ? organicAnswer.routeAlerts
        .filter((item): item is string => typeof item === 'string')
        .map((item) => ansiedadeRouteAlertLabels[item])
        .filter(Boolean)
    : []
  const routeAlertDecision = selectedRouteAlerts.length > 0
    ? `foram selecionados sinais que direcionam a investigação para ${formatClinicalListText(selectedRouteAlerts)}`
    : ''
  const nonDrugDecision = getAnsiedadeDecision(answers, 'ansiedade_abordagem_nao_medicamentosa')
  const medicationDecision = getAnsiedadeDecision(answers, 'ansiedade_medicamentosa')
  const decisionLines = uniqueTextItems([
    initialDecision,
    organicDecision,
    routeAlertDecision,
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
      routeAlertDecision || null,
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

const buildInfluenzaClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const physicalAnswer = parseFlowAnswerForSummary(answers.influenza_exame_fisico)
  const severity = parseFlowAnswerForSummary(answers.influenza_sinais_gravidade)
  const risk = parseFlowAnswerForSummary(answers.influenza_fatores_risco)
  const icu = parseFlowAnswerForSummary(answers.influenza_criterios_uti)
  const viralPanel = parseFlowAnswerForSummary(answers.influenza_painel_viral_enfermaria || answers.influenza_painel_viral_uti)
  const exam = physicalAnswer?.exameFisico && typeof physicalAnswer.exameFisico === 'object'
    ? physicalAnswer.exameFisico as PneumoniaExamSummary
    : null
  const savedVitals = physicalAnswer?.sinaisVitais && typeof physicalAnswer.sinaisVitais === 'object'
    ? physicalAnswer.sinaisVitais as Record<string, unknown>
    : {}
  const vitals = { ...(patient.admission?.vitalSigns || {}), ...savedVitals }
  const path = new Set([...history, currentStep])
  const current = flowchart.steps[currentStep]

  const severitySigns = Array.isArray(severity?.sinaisGravidadeSelecionados)
    ? uniqueTextItems(severity.sinaisGravidadeSelecionados.map(String))
    : []
  const riskFactors = Array.isArray(risk?.fatoresRiscoSelecionados)
    ? uniqueTextItems(risk.fatoresRiscoSelecionados.map(String))
    : []
  const worseningSigns = Array.isArray(risk?.sinaisPioraSelecionados)
    ? uniqueTextItems(risk.sinaisPioraSelecionados.map(String))
    : []
  const icuCriteria = Array.isArray(icu?.criteriosUTISelecionados)
    ? uniqueTextItems(icu.criteriosUTISelecionados.map(String))
    : []
  const requestedExams = Array.isArray(viralPanel?.examesSolicitados)
    ? uniqueTextItems(viralPanel.examesSolicitados.map(String))
    : []
  const severityDecision = String(severity?.decision || answers.influenza_sinais_gravidade || '')
  const icuDecision = String(icu?.decision || answers.influenza_criterios_uti || '')
  const hasSRAG = severity?.classificadoComoSRAG === true
    || severitySigns.length > 0
    || severityDecision === 'srag'
    || path.has('influenza_criterios_uti')
    || path.has('influenza_painel_viral_enfermaria')
    || path.has('influenza_painel_viral_uti')
  const needsICU = icu?.indicarUTI === true
    || icuCriteria.length > 0
    || icuDecision === 'uti'
    || path.has('influenza_painel_viral_uti')
    || path.has('influenza_boarding_uti')
    || path.has('influenza_internacao_uti')
    || path.has('influenza_uti_protocolo_concluido')
  const isWard = !needsICU && (
    path.has('influenza_painel_viral_enfermaria')
    || path.has('influenza_boarding_enfermaria')
    || path.has('influenza_internacao_enfermaria')
  )
  const isAmbulatoryOseltamivir = path.has('influenza_ambulatorial_oseltamivir') || path.has('influenza_ambulatorial_oseltamivir_concluido')
  const isAmbulatorySymptomatic = path.has('influenza_ambulatorial_sintomaticos') || path.has('influenza_ambulatorial_sintomaticos_concluido')
  const isBoarding = path.has('influenza_boarding_uti') || path.has('influenza_boarding_enfermaria')
  const hasOseltamivirIndication = hasSRAG || risk?.indicarOseltamivir === true || riskFactors.length > 0 || worseningSigns.length > 0 || isAmbulatoryOseltamivir
  const oseltamivirDose = getOseltamivirDoseText(patient)

  const numeric = (value: unknown) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
    const match = String(value ?? '').trim().replace(',', '.').match(/-?\d+(?:\.\d+)?/)
    return match ? Number(match[0]) : undefined
  }
  const vitalItems = uniqueTextItems([
    numeric(vitals.temperature) != null ? `temperatura ${String(numeric(vitals.temperature)).replace('.', ',')} °C` : null,
    numeric(vitals.feverDays) != null ? `febre há ${numeric(vitals.feverDays)} dia(s)` : null,
    numeric(vitals.heartRate) != null ? `frequência cardíaca ${numeric(vitals.heartRate)} bpm` : null,
    numeric(vitals.respiratoryRate) != null ? `frequência respiratória ${numeric(vitals.respiratoryRate)} irpm` : null,
    vitals.bloodPressure ? `pressão arterial ${vitals.bloodPressure} mmHg` : null,
    numeric(vitals.oxygenSaturation) != null ? `saturação de oxigênio ${numeric(vitals.oxygenSaturation)}%` : null,
    vitals.glucose ? `glicemia capilar ${vitals.glucose} mg/dL` : null
  ])
  const grade = (value: unknown) => numeric(value) ? ` ${numeric(value)}/4+` : ''
  const generalLabels: Record<string, string> = {
    bom: 'bom estado geral',
    regular: 'regular estado geral',
    mal: 'mal estado geral',
    grave: 'grave estado geral',
    pessimo: 'péssimo estado geral'
  }
  const physicalItems = exam ? uniqueTextItems([
    generalLabels[String(exam.generalState)] || null,
    exam.coloration?.status === 'corado' ? 'corado' : exam.coloration?.status ? `descorado${grade(exam.coloration.grade)}` : null,
    exam.hydration?.status === 'hidratado' ? 'hidratado' : exam.hydration?.status ? `desidratado${grade(exam.hydration.grade)}` : null,
    exam.cyanosis?.status === 'acianotico' ? 'acianótico' : exam.cyanosis?.status ? `cianótico${grade(exam.cyanosis.grade)}` : null,
    exam.jaundice?.status === 'anicterico' ? 'anictérico' : exam.jaundice?.status ? `ictérico${grade(exam.jaundice.grade)}` : null,
    exam.temperature?.status === 'afebril' ? 'afebril' : exam.temperature?.status === 'febril' ? 'febril' : null,
    exam.respiration?.status === 'eupneico' ? 'eupneico' : exam.respiration?.status === 'taquipneico' ? 'taquipneico' : exam.respiration?.status ? `dispneico${grade(exam.respiration.grade)}` : null,
    exam.neuro?.glasgow != null ? `Glasgow ${exam.neuro.glasgow}` : null
  ]) : []
  const systemExamItems = exam ? uniqueTextItems([
    exam.pulmonary?.altered?.trim() ? `Ausculta pulmonar: ${exam.pulmonary.altered.trim()}` : null,
    exam.cardiac?.altered?.trim() ? `Aparelho cardiovascular: ${exam.cardiac.altered.trim()}` : null,
    exam.neuro?.altered?.trim() ? `Neurológico: ${exam.neuro.altered.trim()}` : null,
    exam.extremities?.altered?.trim() ? `Extremidades: ${exam.extremities.altered.trim()}` : null
  ]) : []
  const examinationLines = uniqueTextItems([
    vitalItems.length ? `Sinais vitais: ${vitalItems.join(', ')}` : null,
    physicalItems.length ? `Ao exame físico: ${physicalItems.join(', ')}` : null,
    ...systemExamItems
  ])

  const chiefComplaint = patient.admission?.chiefComplaint?.trim()
    || patient.admission?.symptoms?.filter(Boolean).join('; ')
    || 'quadro respiratório agudo compatível com síndrome gripal'
  const symptomText = patient.admission?.symptoms?.filter(Boolean).join(', ')
  const durationText = patient.admission?.complaintDuration?.trim()
  const historySentence = [
    `Na história da moléstia atual, consta quadro respiratório agudo com queixa de ${chiefComplaint.replace(/[.]+$/, '')}`,
    durationText ? `com evolução há ${durationText.replace(/[.]+$/, '')}` : null,
    symptomText && symptomText.toLowerCase() !== chiefComplaint.toLowerCase() ? `associado a ${symptomText.replace(/[.]+$/, '')}` : null,
    patient.generalObservations?.trim() ? `Observações adicionais: ${patient.generalObservations.trim().replace(/[.]+$/, '')}` : null
  ].filter(Boolean).join(', ') + '.'
  const examinationSentence = examinationLines.length
    ? `Na avaliação clínica e semiológica, foram registrados: ${examinationLines.join('; ')}.`
    : 'Sinais vitais e exame físico estruturado não foram registrados neste caminho, devendo ser complementados na avaliação presencial.'
  const severitySentence = [
    severitySigns.length
      ? `Foram identificados sinais de gravidade compatíveis com SRAG: ${formatClinicalListText(severitySigns)}`
      : hasSRAG
        ? 'O caso foi classificado como síndrome respiratória aguda grave; os critérios específicos não estão disponíveis no registro estruturado'
        : 'Não foram registrados critérios de síndrome respiratória aguda grave',
    riskFactors.length ? `Fatores de risco para complicações: ${formatClinicalListText(riskFactors)}` : null,
    worseningSigns.length ? `Sinais de piora clínica: ${formatClinicalListText(worseningSigns)}` : null,
    icuCriteria.length
      ? `Critérios para terapia intensiva: ${formatClinicalListText(icuCriteria)}`
      : needsICU
        ? 'Foi indicada terapia intensiva; os critérios específicos não estão disponíveis no registro estruturado'
        : null
  ].filter(Boolean).join('. ') + '.'
  const investigationSentence = requestedExams.length
    ? `Foi registrada coleta respiratória e solicitação dos seguintes exames: ${formatClinicalListText(requestedExams)}. A investigação etiológica não deve atrasar o início do antiviral nem as medidas de suporte indicadas.`
    : hasSRAG
      ? 'Em razão da classificação como SRAG, recomenda-se coleta respiratória precoce para RT-PCR ou painel viral e investigação laboratorial e radiológica conforme gravidade, sem atrasar o tratamento.'
      : 'Não há exames complementares estruturados registrados neste caminho.'

  const prescribedItems = uniqueTextItems(
    patient.treatment.prescriptions
      .filter((item) => item.prescribedBy === 'Fluxograma Influenza')
      .map((item) => [item.medication, item.dosage, item.frequency, item.duration].filter(Boolean).join(' - '))
  )
  const treatmentSentence = hasOseltamivirIndication
    ? `Foi indicado oseltamivir ${oseltamivirDose}, com ajuste à função renal quando aplicável.${prescribedItems.length ? ` Prescrição registrada: ${formatClinicalListText(prescribedItems)}.` : ''}`
    : isAmbulatorySymptomatic
      ? 'Foi definido tratamento sintomático, hidratação, repouso relativo e orientação de sinais de alarme, sem indicação obrigatória de antiviral pelo checklist atual.'
      : 'A indicação definitiva de antiviral ainda não foi registrada neste caminho.'
  const diagnosticImpression = needsICU
    ? 'o quadro é compatível com síndrome respiratória aguda grave, com indicação de terapia intensiva e risco de deterioração respiratória ou hemodinâmica.'
    : isWard
      ? 'o quadro é compatível com síndrome respiratória aguda grave, sem critério imediato de UTI no registro atual, porém com indicação de internação hospitalar e vigilância clínica.'
      : isAmbulatoryOseltamivir
        ? 'trata-se de síndrome gripal sem critérios atuais de SRAG, mas com indicação de antiviral por risco de complicação ou piora clínica.'
        : isAmbulatorySymptomatic
          ? 'trata-se de síndrome gripal sem sinais de gravidade ou fatores de risco relevantes registrados, permitindo manejo ambulatorial sintomático.'
          : hasSRAG
            ? 'há síndrome respiratória aguda grave ainda em estratificação quanto ao nível de internação.'
            : 'o quadro permanece em avaliação para síndrome gripal ou influenza, sem desfecho assistencial definitivo registrado.'
  const conductSentence = needsICU
    ? `Manter internação e estabilização no pronto-socorro até a transferência efetiva para a UTI, com isolamento respiratório, monitorização contínua, oxigenoterapia e escalonamento do suporte ventilatório ou hemodinâmico conforme necessidade.${isBoarding ? ' A indisponibilidade de leito não deve atrasar as medidas compatíveis com cuidado intensivo.' : ''}`
    : isWard
      ? `Manter internação em enfermaria, isolamento por gotículas, oseltamivir ${oseltamivirDose}, oxigenoterapia conforme necessidade e reavaliação clínica e respiratória seriada.${isBoarding ? ' Enquanto aguarda leito, manter os cuidados correspondentes ao nível de internação indicado.' : ''}`
      : isAmbulatoryOseltamivir
        ? 'Orientar hidratação, medidas sintomáticas, reavaliação em 48 a 72 horas e retorno imediato diante de dispneia, hipoxemia, confusão, hipotensão, desidratação ou piora do estado geral.'
        : isAmbulatorySymptomatic
          ? 'Orientar hidratação, repouso relativo, controle de febre e dor, reavaliação em 48 a 72 horas e retorno imediato diante de sinais de alarme.'
          : 'Completar a avaliação de gravidade e definir tratamento e destino assistencial conforme evolução clínica.'
  const finalNarrative = `Conclusão: ${diagnosticImpression} ${conductSentence}`
  const doctorSignature = formatDoctorSignature(doctor)
  const title = 'RELATÓRIO MÉDICO - INFLUENZA / SÍNDROME GRIPAL'
  const continuousText = [
    title, '',
    `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de "${chiefComplaint.replace(/[.]+$/, '')}". Durante a avaliação, foi realizada investigação estruturada para síndrome gripal e influenza, com registro de sinais vitais, exame físico, critérios de SRAG, fatores de risco, necessidade de antiviral e definição do nível de cuidado.`, '',
    historySentence, '',
    examinationSentence, '',
    severitySentence, '',
    investigationSentence, '',
    treatmentSentence, '',
    finalNarrative, '',
    doctorSignature,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`
  ].join('\n')

  return {
    chiefComplaint,
    historyLines: [historySentence],
    examinationLines,
    scoreLines: uniqueTextItems([...severitySigns, ...riskFactors, ...worseningSigns, ...icuCriteria, ...requestedExams]),
    finalTitle: current?.title || flowchart.name,
    finalDescription: current?.description || flowchart.description,
    finalNarrative,
    doctorSignature,
    conductLines: [conductSentence],
    continuousText,
    text: continuousText
  }
}

const buildPneumoniaClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const parsedExam = parseFlowAnswerForSummary(answers.pac_exame_fisico)
  const exam = parsedExam?.exameFisico && typeof parsedExam.exameFisico === 'object'
    ? parsedExam.exameFisico as PneumoniaExamSummary
    : null
  const savedVitals = parsedExam?.sinaisVitais && typeof parsedExam.sinaisVitais === 'object'
    ? parsedExam.sinaisVitais as Record<string, unknown>
    : {}
  const vitals = { ...(patient.admission?.vitalSigns || {}), ...savedVitals }
  const labData = parseFlowAnswerForSummary(answers.pac_resultados_exames)
  const labResults = labData?.resultados && typeof labData.resultados === 'object'
    ? labData.resultados as Record<string, unknown>
    : {}
  const examRequest = parseFlowAnswerForSummary(answers.pac_solicitacao_exames)
  const ats = parseFlowAnswerForSummary(answers.pac_ats_idsa_gravidade)
  const drip = parseFlowAnswerForSummary(answers.pac_drip_enfermaria || answers.pac_drip_uti)
  const smartCop = parseFlowAnswerForSummary(answers.pac_smartcop_enfermaria || answers.pac_smartcop_uti)
  const psi = parseFlowAnswerForSummary(answers.pac_calcular_psi)
  const curbSaved = parseFlowAnswerForSummary(answers.pac_curb65_protocolo || answers.pac_calcular_curb65)
  const current = flowchart.steps[currentStep]
  const path = new Set([...history, currentStep])

  const numeric = (value: unknown) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
    const normalized = String(value ?? '').trim().replace(',', '.').match(/-?\d+(?:\.\d+)?/)
    return normalized ? Number(normalized[0]) : undefined
  }
  const savedScore = (parsed: FlowSummaryAnswer | null, raw: string | undefined, prefix: string) => {
    const structuredScore = numeric(parsed?.score)
    if (structuredScore != null) return structuredScore
    const legacyMatch = String(raw || '').match(new RegExp(`${prefix}_(\\d+(?:[.,]\\d+)?)`, 'i'))
    return legacyMatch ? numeric(legacyMatch[1]) : undefined
  }
  const pressure = String(vitals.bloodPressure || '').match(/(\d{2,3})\D+(\d{2,3})/)
  const systolic = pressure ? Number(pressure[1]) : undefined
  const diastolic = pressure ? Number(pressure[2]) : undefined
  const respiratoryRate = numeric(vitals.respiratoryRate)
  const heartRate = numeric(vitals.heartRate)
  const saturation = numeric(vitals.oxygenSaturation)
  const temperature = numeric(vitals.temperature)
  const glasgow = numeric(exam?.neuro?.glasgow)
  const neuroAltered = String(exam?.neuro?.altered || '').trim()
  const confusion = (glasgow != null && glasgow < 15) || /confus|desorient|rebaix|sonol|torpor|agita/i.test(neuroAltered)
  const lowPressure = (systolic != null && systolic < 90) || (diastolic != null && diastolic <= 60)
  const tachypnea = respiratoryRate != null && respiratoryRate >= 30
  const advancedAge = Number(patient.age) >= 65
  const crbCriteria = uniqueTextItems([
    confusion ? 'confusão mental nova' : null,
    tachypnea ? 'frequência respiratória ≥ 30 irpm' : null,
    lowPressure ? 'PAS < 90 mmHg ou PAD ≤ 60 mmHg' : null,
    advancedAge ? 'idade ≥ 65 anos' : null
  ])
  const crbScore = crbCriteria.length
  const objectiveCrbComplete = respiratoryRate != null && systolic != null && diastolic != null && glasgow != null
  const ureaEntry = Object.entries(labResults).find(([key]) => /ureia|urea|bun/i.test(key))
  const urea = numeric(ureaEntry?.[1])
  const elevatedUrea = urea != null ? urea > 43 : Boolean((curbSaved?.criterios as Record<string, unknown> | undefined)?.ureiaMaior43)
  const curbScore = crbScore + (elevatedUrea ? 1 : 0)

  const atsMajor = Array.isArray(ats?.criteriosMaioresSelecionados) ? ats.criteriosMaioresSelecionados.map(String) : []
  const atsMinor = Array.isArray(ats?.criteriosMenoresSelecionados) ? ats.criteriosMenoresSelecionados.map(String) : []
  const atsDecision = String(ats?.decision || '')
  const atsSevere = ats?.pacGrave === true || atsMajor.length >= 1 || atsMinor.length >= 3 || ['ats_idsa_uti', 'ats_idsa_pac_grave'].includes(atsDecision)
  const dripScore = savedScore(drip, answers.pac_drip_enfermaria || answers.pac_drip_uti, 'drip')
  const smartCopScore = savedScore(smartCop, answers.pac_smartcop_enfermaria || answers.pac_smartcop_uti, 'smartcop')
  const smartCopRisk = smartCopScore != null ? getPneumoniaSmartCopRisk(smartCopScore) : null
  const psiScore = savedScore(psi, answers.pac_calcular_psi, 'psi')

  const destination = (() => {
    if (path.has('pac_estabilizacao_seguir_sepse')) return 'estabilizacao'
    if (path.has('pac_internacao_limitacao')) return 'limitador'
    if (path.has('pac_cuidados_aguarda_uti') || path.has('pac_destino_uti') || path.has('pac_uti_protocolo_concluido') || path.has('pac_psi_alto')) return 'uti'
    if (path.has('pac_cuidados_aguarda_enfermaria') || path.has('pac_destino_enfermaria') || path.has('pac_psi_intermediario') || path.has('pac_curb_intermediario')) return 'enfermaria'
    if (path.has('pac_destino_ambulatorial') || path.has('pac_psi_baixo') || path.has('pac_curb_baixo')) return 'ambulatorial'
    if (atsSevere) return 'uti'
    return 'avaliacao'
  })()
  const smartCopGuidance = smartCopRisk
    ? destination === 'uti' && ['none', 'low'].includes(smartCopRisk.level)
      ? `${smartCopRisk.description} Como a indicação de UTI foi definida por outros critérios de gravidade, a pontuação baixa no SMART-COP não reverte o destino assistencial.`
      : smartCopRisk.description
    : null

  const chiefComplaint = patient.admission?.chiefComplaint?.trim()
    || patient.admission?.symptoms?.filter(Boolean).join('; ')
    || 'quadro respiratório sugestivo de pneumonia adquirida na comunidade'
  const symptomText = patient.admission?.symptoms?.filter(Boolean).join(', ')
  const durationText = patient.admission?.complaintDuration?.trim()
  const historyNarrative = [
    `Paciente em avaliação por ${chiefComplaint.replace(/[.]+$/, '')}`,
    durationText ? `com evolução há ${durationText.replace(/[.]+$/, '')}` : null,
    symptomText && symptomText.toLowerCase() !== chiefComplaint.toLowerCase() ? `apresentando ${symptomText.replace(/[.]+$/, '')}` : null,
    patient.generalObservations?.trim() ? `Observações clínicas adicionais: ${patient.generalObservations.trim().replace(/[.]+$/, '')}` : null
  ].filter(Boolean).join(', ') + '.'

  const generalLabels: Record<string, string> = { bom: 'bom estado geral', regular: 'regular estado geral', mal: 'mal estado geral', grave: 'grave estado geral', pessimo: 'péssimo estado geral' }
  const grade = (value: unknown) => numeric(value) ? ` ${numeric(value)}/4+` : ''
  const physicalItems = exam ? uniqueTextItems([
    generalLabels[String(exam.generalState)] || null,
    exam.coloration?.status === 'corado' ? 'corado' : exam.coloration?.status ? `descorado${grade(exam.coloration?.grade)}` : null,
    exam.hydration?.status === 'hidratado' ? 'hidratado' : exam.hydration?.status ? `desidratado${grade(exam.hydration?.grade)}` : null,
    exam.cyanosis?.status === 'acianotico' ? 'acianótico' : exam.cyanosis?.status ? `cianótico${grade(exam.cyanosis?.grade)}` : null,
    exam.jaundice?.status === 'anicterico' ? 'anictérico' : exam.jaundice?.status ? `ictérico${grade(exam.jaundice?.grade)}` : null,
    exam.temperature?.status === 'afebril' ? 'afebril' : exam.temperature?.status === 'febril' ? 'febril' : null,
    exam.respiration?.status === 'eupneico' ? 'eupneico' : exam.respiration?.status === 'taquipneico' ? 'taquipneico' : exam.respiration?.status ? `dispneico${grade(exam.respiration?.grade)}` : null,
    glasgow != null ? `Glasgow ${glasgow}` : null
  ]) : []
  const systemExamItems = exam ? uniqueTextItems([
    exam.pulmonary?.altered?.trim() ? `Aparelho respiratório: ${exam.pulmonary.altered.trim()}` : 'Aparelho respiratório sem alterações adicionais registradas no campo descritivo',
    exam.cardiac?.altered?.trim() ? `Aparelho cardiovascular: ${exam.cardiac.altered.trim()}` : null,
    exam.abdomen?.altered?.trim() ? `Abdome: ${exam.abdomen.altered.trim()}` : null,
    neuroAltered ? `Neurológico: ${neuroAltered}` : null,
    exam.extremities?.altered?.trim() ? `Extremidades: ${exam.extremities.altered.trim()}` : null
  ]) : []
  const vitalItems = uniqueTextItems([
    temperature != null ? `temperatura ${String(temperature).replace('.', ',')} °C` : null,
    numeric(vitals.feverDays) != null ? `febre há ${numeric(vitals.feverDays)} dia(s)` : null,
    heartRate != null ? `FC ${heartRate} bpm` : null,
    respiratoryRate != null ? `FR ${respiratoryRate} irpm` : null,
    systolic != null && diastolic != null ? `PA ${systolic}/${diastolic} mmHg` : null,
    saturation != null ? `SpO₂ ${saturation}%` : null,
    vitals.glucose ? `glicemia capilar ${vitals.glucose} mg/dL` : null
  ])

  const requestedExams = Array.isArray(examRequest?.examesSelecionados) ? examRequest.examesSelecionados.map(String) : []
  const recordedLabs = Object.entries(labResults)
    .filter(([, value]) => String(value ?? '').trim())
    .map(([name, value]) => `${name}: ${String(value).trim()}`)
  const scoreLines = uniqueTextItems([
    `CRB-65 ${crbScore}/4 (${crbScore === 0 ? 'baixo risco' : crbScore <= 2 ? 'risco intermediário' : 'alto risco'})${objectiveCrbComplete ? ', recalculado a partir dos dados objetivos registrados' : ', calculado com os dados objetivos disponíveis'}`,
    crbCriteria.length ? `Critérios CRB-65 presentes: ${formatClinicalListText(crbCriteria)}` : 'Nenhum critério CRB-65 objetivo identificado nos dados registrados',
    urea != null || curbSaved ? `CURB-65 ${curbScore}/5 (${curbScore <= 1 ? 'baixo risco' : curbScore === 2 ? 'risco moderado' : 'alto risco'})` : null,
    psiScore != null ? `PSI/PORT ${psiScore} pontos${psi?.grupo ? `, ${psi.grupo}` : ''}${psi?.destino ? `, com destino sugerido: ${psi.destino}` : ''}` : null,
    ats ? `ATS/IDSA: ${atsSevere ? 'PAC grave' : 'sem critérios suficientes para PAC grave'}${atsMajor.length || atsMinor.length ? ` (${atsMajor.length} maior(es) e ${atsMinor.length} menor(es))` : '; critérios específicos não documentados'}` : null,
    atsMajor.length ? `Critérios maiores ATS/IDSA: ${formatClinicalListText(atsMajor)}` : null,
    atsMinor.length ? `Critérios menores ATS/IDSA: ${formatClinicalListText(atsMinor)}` : null,
    dripScore != null ? `DRIP ${dripScore} (${dripScore >= 4 ? 'risco aumentado para patógenos resistentes' : 'baixo risco para patógenos resistentes'})` : null,
    smartCopScore != null && smartCopRisk ? `SMART-COP ${smartCopScore} (${smartCopRisk.label.toLowerCase()})` : null
  ])

  const title = 'RELATÓRIO MÉDICO - PNEUMONIA ADQUIRIDA NA COMUNIDADE'
  const impression = destination === 'uti'
    ? 'Quadro conduzido como pneumonia adquirida na comunidade grave, com indicação de terapia intensiva e risco de deterioração respiratória e/ou hemodinâmica.'
    : destination === 'enfermaria'
      ? 'Pneumonia adquirida na comunidade com indicação de internação hospitalar para antibioticoterapia, monitorização e suporte clínico.'
      : destination === 'limitador'
        ? 'Pneumonia adquirida na comunidade com limitador para manejo ambulatorial, justificando internação independentemente do escore isolado.'
        : destination === 'ambulatorial'
          ? 'Pneumonia adquirida na comunidade sem critérios atuais de gravidade ou limitadores registrados, com manejo ambulatorial e reavaliação precoce.'
          : 'Suspeita de pneumonia adquirida na comunidade ainda em estratificação clínica e prognóstica.'
  const conductItems = uniqueTextItems([
    destination === 'uti' ? 'Manter monitorização contínua, oxigenoterapia titulada, antibioticoterapia precoce, suporte hemodinâmico/ventilatório conforme necessidade e comunicação com a equipe da UTI.' : null,
    destination === 'uti' && path.has('pac_cuidados_aguarda_uti') ? 'Enquanto aguarda leito, reavaliar em intervalos de 30 a 60 minutos ou imediatamente diante de deterioração.' : null,
    destination === 'enfermaria' || destination === 'limitador' ? 'Internação em enfermaria ou unidade intermediária, com antibioticoterapia, controle de sintomas, oxigênio se necessário e reavaliação seriada.' : null,
    destination === 'ambulatorial' ? 'Tratamento ambulatorial conforme prescrição, orientações de retorno e reavaliação em 48 a 72 horas.' : null,
    dripScore != null && dripScore >= 4 ? 'Considerar cobertura ampliada para patógenos resistentes conforme epidemiologia, culturas, gravidade e protocolo institucional.' : null,
    smartCopGuidance,
    destination === 'uti' || destination === 'estabilizacao' ? 'Avaliar gasometria, lactato, culturas, função renal, eletrólitos e disfunção orgânica conforme disponibilidade e contexto clínico.' : null,
    destination === 'ambulatorial' ? 'Orientar retorno imediato em caso de piora da dispneia, hipoxemia, confusão, hipotensão, febre persistente, intolerância oral ou piora do estado geral.' : null
  ])
  const doctorSignature = formatDoctorSignature(doctor)
  const examinationLines = uniqueTextItems([
    vitalItems.length ? `Sinais vitais: ${vitalItems.join(', ')}` : null,
    physicalItems.length ? `Estado geral: ${physicalItems.join(', ')}` : null,
    ...systemExamItems
  ])
  const investigationLines = uniqueTextItems([
    requestedExams.length ? `Exames solicitados: ${requestedExams.join('; ')}` : null,
    recordedLabs.length ? `Resultados disponíveis: ${recordedLabs.join('; ')}` : null
  ])
  const finalNarrative = `${impression} ${conductItems.join(' ')}`.trim()
  const identificationSentence = `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${patient.gender || 'não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de "${chiefComplaint.replace(/[.]+$/, '')}". Durante a avaliação, foi realizada investigação estruturada para pneumonia adquirida na comunidade, com registro da história clínica, sinais vitais, exame físico, exames complementares e escores de gravidade para definição do destino assistencial.`
  const examinationSentence = examinationLines.length
    ? `Na avaliação clínica e semiológica, foram registrados: ${examinationLines.join('; ')}.`
    : 'Na avaliação clínica e semiológica, não foram registrados sinais vitais ou achados de exame físico estruturado, devendo esses dados ser complementados e correlacionados com a avaliação presencial.'
  const investigationSentence = investigationLines.length
    ? `Quanto à investigação complementar, constam: ${investigationLines.join('; ')}.`
    : 'Não há exames complementares solicitados ou resultados laboratoriais registrados até o momento.'
  const severitySentence = scoreLines.length
    ? `A estratificação de gravidade demonstrou: ${scoreLines.join('; ')}.`
    : 'A estratificação prognóstica ainda não foi concluída neste caminho do fluxo.'
  const conclusionSentence = `Conclusão: ${impression}`
  const planSentence = conductItems.length
    ? conductItems.join(' ')
    : 'Recomenda-se completar a avaliação clínica e a estratificação de gravidade antes da definição do tratamento e do destino assistencial.'
  const continuousSections = [
    title, '',
    identificationSentence, '',
    historyNarrative, '',
    examinationSentence, '',
    investigationSentence, '',
    severitySentence, '',
    `${conclusionSentence} ${planSentence}`, '',
    doctorSignature,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`
  ]
  const continuousText = continuousSections.join('\n')
  return {
    chiefComplaint,
    historyLines: [historyNarrative],
    examinationLines,
    scoreLines: [...scoreLines, ...investigationLines],
    finalTitle: current?.title || flowchart.name,
    finalDescription: current?.description || flowchart.description,
    finalNarrative,
    doctorSignature,
    conductLines: conductItems,
    continuousText,
    text: continuousText
  }
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

const buildGecaClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const currentStepData = flowchart.steps[currentStep]
  const path = new Set([...history, currentStep])
  const decisionLines = history.reduce<string[]>((lines, stepId) => {
    const step = flowchart.steps[stepId]
    if (!step) return lines
    const answer = getAnswerDecision(flowchart, stepId, answers[stepId])
    if (answer) lines.push(`${step.title}: ${answer}`)
    return lines
  }, [])

  const profileLabels: Record<string, string> = {
    aguda_aquosa: 'diarreia aguda aquosa, sem sangue ou muco',
    aguda_inflamatoria_disenteria: 'diarreia aguda inflamatória/disentérica, com sangue e/ou muco',
    persistente_14_dias: 'diarreia persistente, com duração igual ou superior a 14 dias'
  }
  const hydrationLabels: Record<string, string> = {
    plano_a_sem_desidratacao: 'sem sinais de desidratação (Plano A)',
    plano_b_com_desidratacao: 'com desidratação, sem critérios de gravidade (Plano B)',
    plano_c_desidratacao_grave: 'com desidratação grave (Plano C)'
  }
  const alarmAnswer = parseFlowAnswerForSummary(answers.geca_sinais_alarme)
  const alarmDecision = typeof alarmAnswer?.decision === 'string'
    ? alarmAnswer.decision
    : answers.geca_sinais_alarme
  const selectedAlarmLabels = Array.isArray(alarmAnswer?.sinaisSelecionadosLabels)
    ? alarmAnswer.sinaisSelecionadosLabels.filter((item): item is string => typeof item === 'string')
    : []
  const entryAnswer = parseFlowAnswerForSummary(answers.geca_inicio)
  const entryEvacuations = typeof entryAnswer?.evacuacoesUltimas24h === 'number' ? entryAnswer.evacuacoesUltimas24h : null
  const entryDurationDays = typeof entryAnswer?.duracaoDias === 'number' ? entryAnswer.duracaoDias : null
  const entryConsistency = typeof entryAnswer?.consistencia === 'string' ? entryAnswer.consistencia : ''
  const entryRelevantIncrease = entryAnswer?.aumentoRelevanteEmRelacaoAoHabito === true
  const entryCriticalLabels = Array.isArray(entryAnswer?.sinaisCriticosLabels)
    ? entryAnswer.sinaisCriticosLabels.filter((item): item is string => typeof item === 'string')
    : []
  const planCAnswer = parseFlowAnswerForSummary(answers.geca_plano_c)
  const directedExamAnswer = parseFlowAnswerForSummary(answers.geca_exames_dirigidos)
  const selectedDirectedExamLabels = Array.isArray(directedExamAnswer?.examesSelecionadosLabels)
    ? directedExamAnswer.examesSelecionadosLabels.filter((item): item is string => typeof item === 'string')
    : []
  const diarrheaDurationAnswer = parseFlowAnswerForSummary(answers.geca_diarreia_persistente)
  const diarrheaDurationDecision = typeof diarrheaDurationAnswer?.decision === 'string'
    ? diarrheaDurationAnswer.decision
    : answers.geca_diarreia_persistente
  const diarrheaDurationDays = typeof diarrheaDurationAnswer?.duracaoDias === 'number'
    ? diarrheaDurationAnswer.duracaoDias
    : null
  const antibioticIndicationAnswer = parseFlowAnswerForSummary(answers.geca_indicacao_antibiotico)
  const antibioticIndicationDecision = typeof antibioticIndicationAnswer?.decision === 'string'
    ? antibioticIndicationAnswer.decision
    : answers.geca_indicacao_antibiotico
  const selectedAntibioticCriteriaLabels = Array.isArray(antibioticIndicationAnswer?.criteriosSelecionadosLabels)
    ? antibioticIndicationAnswer.criteriosSelecionadosLabels.filter((item): item is string => typeof item === 'string')
    : []
  const stecScreeningAnswer = parseFlowAnswerForSummary(answers.geca_triagem_stec)
  const stecScreeningDecision = typeof stecScreeningAnswer?.decision === 'string'
    ? stecScreeningAnswer.decision
    : answers.geca_triagem_stec
  const selectedStecCriteriaLabels = Array.isArray(stecScreeningAnswer?.criteriosSelecionadosLabels)
    ? stecScreeningAnswer.criteriosSelecionadosLabels.filter((item): item is string => typeof item === 'string')
    : []
  const antibioticSelectionAnswer = parseFlowAnswerForSummary(answers.geca_antibioticos)
  const antibioticSchemeLabel = typeof antibioticSelectionAnswer?.esquemaSelecionadoLabel === 'string'
    ? antibioticSelectionAnswer.esquemaSelecionadoLabel
    : ''
  const antibioticRegimen = typeof antibioticSelectionAnswer?.posologia === 'string'
    ? antibioticSelectionAnswer.posologia
    : ''
  const supportAnswer = parseFlowAnswerForSummary(answers.geca_suporte_sintomatico)
  const selectedSupportActionLabels = Array.isArray(supportAnswer?.condutasSelecionadasLabels)
    ? supportAnswer.condutasSelecionadasLabels.filter((item): item is string => typeof item === 'string')
    : []
  const supportSafetyLabels = Array.isArray(supportAnswer?.orientacoesSegurancaLabels)
    ? supportAnswer.orientacoesSegurancaLabels.filter((item): item is string => typeof item === 'string')
    : []
  const dispositionAnswer = parseFlowAnswerForSummary(answers.geca_destino)
  const dispositionDecision = typeof dispositionAnswer?.decision === 'string'
    ? dispositionAnswer.decision
    : answers.geca_destino
  const dischargeCriteriaLabels = Array.isArray(dispositionAnswer?.criteriosAltaLabels)
    ? dispositionAnswer.criteriosAltaLabels.filter((item): item is string => typeof item === 'string')
    : []
  const admissionCriteriaLabels = Array.isArray(dispositionAnswer?.criteriosInternacaoLabels)
    ? dispositionAnswer.criteriosInternacaoLabels.filter((item): item is string => typeof item === 'string')
    : []
  const planCMonitoring = planCAnswer?.monitorizacaoInicial && typeof planCAnswer.monitorizacaoInicial === 'object'
    ? planCAnswer.monitorizacaoInicial as Record<string, unknown>
    : null
  const planCBalance = planCAnswer?.balancoHidrico && typeof planCAnswer.balancoHidrico === 'object'
    ? planCAnswer.balancoHidrico as Record<string, unknown>
    : null
  const planCVolumes = planCAnswer?.volumesCalculados && typeof planCAnswer.volumesCalculados === 'object'
    ? planCAnswer.volumesCalculados as Record<string, unknown>
    : null
  const planCMonitoringLines = planCMonitoring
    ? uniqueTextItems([
        planCMonitoring.heartRate ? `FC ${planCMonitoring.heartRate} bpm` : null,
        planCMonitoring.bloodPressure ? `PA ${planCMonitoring.bloodPressure} mmHg` : null,
        planCMonitoring.respiratoryRate ? `FR ${planCMonitoring.respiratoryRate} irpm` : null,
        planCMonitoring.oxygenSaturation ? `SpO₂ ${planCMonitoring.oxygenSaturation}%` : null,
        planCMonitoring.temperature ? `temperatura ${planCMonitoring.temperature} °C` : null,
        planCMonitoring.glucose ? `glicemia ${planCMonitoring.glucose} mg/dL` : null,
        planCMonitoring.capillaryRefill ? `TEC ${planCMonitoring.capillaryRefill} s` : null,
        planCMonitoring.urineOutput ? `diurese ${planCMonitoring.urineOutput} mL/kg/h` : null
      ])
    : []
  const planCReassessment = parseFlowAnswerForSummary(answers.geca_reavaliacao_plano_c)
  const planCReassessmentDecision = typeof planCReassessment?.decision === 'string'
    ? planCReassessment.decision
    : answers.geca_reavaliacao_plano_c
  const planCReassessmentClinical = planCReassessment?.sinaisClinicos && typeof planCReassessment.sinaisClinicos === 'object'
    ? planCReassessment.sinaisClinicos as Record<string, unknown>
    : null
  const planCReassessmentBalance = planCReassessment?.balancoHidrico && typeof planCReassessment.balancoHidrico === 'object'
    ? planCReassessment.balancoHidrico as Record<string, unknown>
    : null
  const improvementLabels = Array.isArray(planCReassessment?.criteriosMelhoraLabels)
    ? planCReassessment.criteriosMelhoraLabels.filter((item): item is string => typeof item === 'string')
    : []
  const instabilityLabels = Array.isArray(planCReassessment?.criteriosInstabilidadeLabels)
    ? planCReassessment.criteriosInstabilidadeLabels.filter((item): item is string => typeof item === 'string')
    : []
  const planCReassessmentClinicalLines = planCReassessmentClinical
    ? uniqueTextItems([
        planCReassessmentClinical.heartRate ? `FC ${planCReassessmentClinical.heartRate} bpm` : null,
        planCReassessmentClinical.bloodPressure ? `PA ${planCReassessmentClinical.bloodPressure} mmHg` : null,
        planCReassessmentClinical.respiratoryRate ? `FR ${planCReassessmentClinical.respiratoryRate} irpm` : null,
        planCReassessmentClinical.oxygenSaturation ? `SpO₂ ${planCReassessmentClinical.oxygenSaturation}%` : null,
        planCReassessmentClinical.temperature ? `temperatura ${planCReassessmentClinical.temperature} °C` : null,
        planCReassessmentClinical.capillaryRefill ? `TEC ${planCReassessmentClinical.capillaryRefill} s` : null,
        planCReassessmentClinical.urineOutput ? `diurese ${planCReassessmentClinical.urineOutput} mL/kg/h` : null,
        planCReassessmentClinical.mentalStatus ? `estado mental ${formatClinicalValue(planCReassessmentClinical.mentalStatus)}` : null
      ])
    : []
  const profile = profileLabels[answers.geca_perfil_diarreia] || 'padrão das fezes ainda não classificado'
  const hydration = hydrationLabels[answers.geca_classificacao_hidratacao]
    || (alarmDecision === 'com_sinal_alarme' ? 'com sinal de alarme, conduzido pelo Plano C' : 'estado de hidratação ainda não classificado')
  const symptoms = uniqueTextItems([
    patient.admission?.chiefComplaint,
    ...(patient.admission?.symptoms || [])
  ])
  const chiefComplaint = symptoms.length > 0
    ? formatClinicalListText(symptoms)
    : profile

  const universalAssessment = parseUniversalClinicalAssessment(answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY])
  const vitalSigns = { ...(patient.admission?.vitalSigns || {}), ...(universalAssessment?.sinaisVitais || {}) }
  const vitalLines = uniqueTextItems([
    vitalSigns?.temperature != null ? `temperatura ${String(vitalSigns.temperature).replace('.', ',')} °C` : null,
    vitalSigns?.heartRate != null ? `frequência cardíaca ${vitalSigns.heartRate} bpm` : null,
    vitalSigns?.respiratoryRate != null ? `frequência respiratória ${vitalSigns.respiratoryRate} irpm` : null,
    vitalSigns?.bloodPressure ? `pressão arterial ${vitalSigns.bloodPressure} mmHg` : null,
    vitalSigns?.oxygenSaturation != null ? `saturação de oxigênio ${vitalSigns.oxygenSaturation}%` : null,
    vitalSigns?.glucose != null ? `glicemia capilar ${vitalSigns.glucose} mg/dL` : null
  ])

  const examinationLines = uniqueTextItems([
    vitalLines.length > 0 ? `Sinais vitais: ${vitalLines.join(', ')}` : null,
    ...summarizeUniversalPhysicalExam(universalAssessment?.exameFisico),
    `Avaliação do estado de hidratação: ${hydration}.`,
    planCMonitoringLines.length > 0 ? `Monitorização inicial do Plano C: ${planCMonitoringLines.join(', ')}.` : null,
    planCReassessmentClinicalLines.length > 0 ? `Reavaliação após expansão: ${planCReassessmentClinicalLines.join(', ')}.` : null,
    alarmDecision === 'com_sinal_alarme'
      ? `Foram identificados sinais de alarme que exigiram estabilização imediata${selectedAlarmLabels.length > 0 ? `: ${selectedAlarmLabels.join('; ')}.` : '.'}`
      : alarmDecision === 'sem_sinal_alarme'
        ? 'Não foram selecionados sinais de alarme imediato na triagem.'
        : null
  ])

  const scoreLines = uniqueTextItems([
    entryEvacuations != null || entryDurationDays != null
      ? `Porta de entrada: ${entryEvacuations != null ? `${entryEvacuations} evacuação(ões) em 24 horas` : 'frequência não informada'}; ${entryDurationDays != null ? `${entryDurationDays} dia(s) de duração` : 'duração não informada'}; ${entryConsistency === 'amolecidas_liquidas' ? 'fezes amolecidas/líquidas' : 'sem alteração relevante da consistência'}${entryRelevantIncrease ? '; aumento relevante em relação ao hábito' : ''}.`
      : null,
    entryCriticalLabels.length > 0 ? `Sinais críticos identificados na porta de entrada: ${entryCriticalLabels.join('; ')}.` : null,
    `Padrão clínico: ${profile}.`,
    `Classificação hídrica: ${hydration}.`,
    typeof planCAnswer?.cristaloideLabel === 'string' && planCAnswer.cristaloideLabel
      ? `Cristaloide selecionado no Plano C: ${planCAnswer.cristaloideLabel}${planCVolumes?.first != null && planCVolumes?.second != null ? `; 1ª etapa ${planCVolumes.first} mL e 2ª etapa ${planCVolumes.second} mL` : ''}.`
      : null,
    planCBalance && typeof planCBalance.saldoMl === 'number'
      ? `Balanço hídrico registrado: entradas ${formatClinicalValue(planCBalance.totalEntradasMl)} mL, saídas ${formatClinicalValue(planCBalance.totalSaidasMl)} mL, saldo ${formatClinicalValue(planCBalance.saldoMl)} mL.`
      : null,
    planCReassessmentBalance && typeof planCReassessmentBalance.saldoMl === 'number'
      ? `Balanço na reavaliação: entradas ${formatClinicalValue(planCReassessmentBalance.totalEntradasMl)} mL, saídas ${formatClinicalValue(planCReassessmentBalance.totalSaidasMl)} mL, saldo ${formatClinicalValue(planCReassessmentBalance.saldoMl)} mL.`
      : null,
    improvementLabels.length > 0 ? `Critérios de melhora registrados: ${improvementLabels.join('; ')}.` : null,
    instabilityLabels.length > 0 ? `Critérios de instabilidade registrados: ${instabilityLabels.join('; ')}.` : null,
    answers.geca_indicacao_exames === 'exames_indicados' ? 'Houve indicação de investigação complementar dirigida.' : null,
    selectedDirectedExamLabels.length > 0
      ? `Exames complementares selecionados: ${selectedDirectedExamLabels.join('; ')}.`
      : null,
    diarrheaDurationDecision === 'persistente'
      ? `Duração igual ou superior a 14 dias${diarrheaDurationDays != null ? ` (${diarrheaDurationDays} dias)` : ''}, direcionando investigação de diarreia persistente.`
      : diarrheaDurationDecision === 'aguda'
        ? `Diarreia aguda com menos de 14 dias${diarrheaDurationDays != null ? ` (${diarrheaDurationDays} dias)` : ''}.`
        : null,
    antibioticIndicationDecision === 'antibiotico_indicado'
      ? `Foram reconhecidos critérios clínicos para considerar antibioticoterapia${selectedAntibioticCriteriaLabels.length > 0 ? `: ${selectedAntibioticCriteriaLabels.join('; ')}` : ''}.`
      : null,
    antibioticIndicationDecision === 'antibiotico_nao_indicado' ? 'Não foram reconhecidos critérios para antibiótico empírico.' : null,
    stecScreeningDecision === 'suspeita_stec_shu'
      ? `Suspeita de STEC/SHU: antibiótico empírico e antiperistáltico contraindicados até esclarecimento${selectedStecCriteriaLabels.length > 0 ? `; achados: ${selectedStecCriteriaLabels.join('; ')}` : ''}.`
      : stecScreeningDecision === 'sem_suspeita_stec'
        ? 'Não foram selecionados achados sugestivos de STEC/SHU na triagem.'
        : null,
    antibioticSchemeLabel
      ? `Esquema antimicrobiano selecionado: ${antibioticSchemeLabel}${antibioticRegimen ? ` — ${antibioticRegimen}` : ''}.`
      : null,
    selectedSupportActionLabels.length > 0
      ? `Condutas de suporte registradas: ${selectedSupportActionLabels.join('; ')}.`
      : null,
    dispositionDecision === 'alta_segura'
      ? `Critérios de alta segura confirmados${dischargeCriteriaLabels.length > 0 ? `: ${dischargeCriteriaLabels.join('; ')}` : ''}.`
      : dispositionDecision === 'internacao_observacao'
        ? `Critérios para observação/internação identificados${admissionCriteriaLabels.length > 0 ? `: ${admissionCriteriaLabels.join('; ')}` : ''}.`
        : null
  ])

  const conductLines = uniqueTextItems([
    path.has('geca_plano_a') || path.has('geca_alta_plano_a')
      ? 'Foi instituído o Plano A, com SRO/líquidos após as perdas, manutenção da alimentação e orientações de retorno.'
      : null,
    path.has('geca_plano_b')
      ? 'Foi instituído o Plano B no serviço de saúde, com SRO em pequenos volumes e reavaliação seriada.'
      : null,
    answers.geca_reavaliacao_plano_b === 'reidratado_plano_a'
      ? 'Após a terapia de reidratação oral, desapareceram os sinais de desidratação e o cuidado foi convertido para o Plano A.'
      : null,
    answers.geca_reavaliacao_plano_b === 'falha_plano_b' || path.has('geca_falha_plano_b')
      ? 'Houve persistência da desidratação ou falha da terapia de reidratação oral, indicando gastróclise e/ou encaminhamento hospitalar.'
      : null,
    path.has('geca_plano_c')
      ? `Foi iniciado o Plano C, com cristaloide isotônico por via endovenosa, monitorização contínua e reavaliação da perfusão e das perdas${Array.isArray(planCAnswer?.abcdeConcluido) ? `; ${planCAnswer.abcdeConcluido.length} domínio(s) do ABCDE foram registrados` : ''}.`
      : null,
    planCReassessmentDecision === 'melhora_apos_plano_c'
      ? 'Na reavaliação, houve melhora hemodinâmica; foi indicada manutenção em ambiente hospitalar/observação, com reposição conforme necessidade e progressão da hidratação oral.'
      : null,
    planCReassessmentDecision === 'instabilidade_persistente'
      ? 'Na reavaliação, persistiram choque ou instabilidade; foi indicada transferência imediata com estabilização e suporte avançado durante a passagem do cuidado.'
      : null,
    path.has('geca_exames_dirigidos')
      ? `A investigação complementar foi orientada pela gravidade, padrão das fezes, imunidade e contexto epidemiológico${selectedDirectedExamLabels.length > 0 ? `, com seleção de: ${selectedDirectedExamLabels.join('; ')}` : ''}.`
      : null,
    path.has('geca_antibioticos')
      ? `Foi selecionada antibioticoterapia para cenário específico, após triagem de contraindicações e de suspeita de STEC${antibioticSchemeLabel ? `: ${antibioticSchemeLabel}${antibioticRegimen ? ` (${antibioticRegimen})` : ''}` : ''}.`
      : null,
    path.has('geca_suporte_sintomatico')
      ? `Foi definido plano de suporte com hidratação, alimentação e sintomáticos individualizados${selectedSupportActionLabels.length > 0 ? `: ${selectedSupportActionLabels.join('; ')}` : ''}${supportSafetyLabels.length > 0 ? `; orientações de segurança confirmadas: ${supportSafetyLabels.join('; ')}` : ''}.`
      : null,
    path.has('geca_suspeita_stec_shu')
      ? 'Diante da suspeita de STEC/SHU, foi indicada investigação de toxina Shiga, hemólise, plaquetas e função renal, sem antibiótico empírico ou antiperistáltico.'
      : null,
    path.has('geca_investigacao_persistente')
      ? 'O quadro foi direcionado para investigação de diarreia persistente e tratamento etiológico, mantendo hidratação e suporte nutricional.'
      : null,
    path.has('geca_internacao_observacao')
      ? 'Foi indicada observação/internação para reposição, monitorização, investigação e progressão para via oral conforme resposta.'
      : null,
    path.has('geca_transferencia_emergencia')
      ? 'Foi indicada transferência imediata para serviço de maior complexidade, mantendo estabilização e reavaliações até a passagem formal do cuidado.'
      : null
  ])

  const finalTitle = currentStepData?.title || flowchart.name
  const finalDescription = currentStepData?.description || flowchart.description
  const finalNarrative = conductLines.length > 0
    ? conductLines.join(' ')
    : `A avaliação encontra-se na etapa ${finalTitle}. ${finalDescription}`
  const doctorSignature = formatDoctorSignature(doctor)
  const historyLines = decisionLines.slice(-12)
  const identification = `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}.`
  const continuousText = [
    'RELATÓRIO MÉDICO - GASTROENTERITE AGUDA',
    '',
    `${identification} Apresentou ${chiefComplaint}, com classificação clínica compatível com ${profile}.`,
    '',
    examinationLines.length > 0
      ? `Na avaliação inicial, registrou-se ${examinationLines.join(' ')}`
      : 'Sinais vitais e achados objetivos do exame físico não foram registrados no fluxo.',
    '',
    scoreLines.length > 0 ? `A estratificação demonstrou: ${scoreLines.join(' ')}` : null,
    '',
    finalNarrative,
    '',
    'Orientou-se reavaliação imediata diante de piora das perdas, vômitos repetidos, sangue nas fezes, febre alta persistente, muita sede, redução da diurese, prostração, síncope, dor abdominal intensa ou incapacidade de ingerir líquidos.',
    '',
    doctorSignature
  ].filter((item): item is string => item != null).join('\n')
  const text = [
    'RESUMO CLÍNICO SEMIOLÓGICO - GECA', '', 'Identificação e contexto', identification,
    '', 'Queixa principal / HMA', chiefComplaint,
    '', 'Padrão clínico e hidratação', scoreLines.map((item) => `- ${item}`).join('\n'),
    '', 'Caminho percorrido', historyLines.length > 0 ? historyLines.map((item) => `- ${item}`).join('\n') : '- Avaliação inicial.',
    '', 'Exame e dados objetivos', examinationLines.length > 0 ? examinationLines.map((item) => `- ${item}`).join('\n') : '- Não registrados.',
    '', 'Síntese final e conduta', finalNarrative,
    '', 'Médico responsável', doctorSignature
  ].join('\n')

  return {
    chiefComplaint,
    historyLines,
    examinationLines,
    scoreLines,
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines,
    continuousText,
    text
  }
}

const getUniversalAssessmentNarrative = (answers: Record<string, string>) => {
  const assessment = parseUniversalClinicalAssessment(answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY])
  const vitals = assessment?.sinaisVitais
  const vitalItems = uniqueTextItems([
    vitals?.temperature != null ? `temperatura ${String(vitals.temperature).replace('.', ',')} °C` : null,
    vitals?.bloodPressure ? `pressão arterial ${vitals.bloodPressure} mmHg` : null,
    vitals?.heartRate != null ? `frequência cardíaca ${vitals.heartRate} bpm` : null,
    vitals?.respiratoryRate != null ? `frequência respiratória ${vitals.respiratoryRate} irpm` : null,
    vitals?.oxygenSaturation != null ? `saturação periférica ${vitals.oxygenSaturation}%` : null,
    vitals?.glucose != null ? `glicemia capilar ${vitals.glucose} mg/dL` : null
  ])
  return {
    vitalItems,
    examItems: summarizeUniversalPhysicalExam(assessment?.exameFisico)
  }
}

const buildNarrativeSummary = ({
  patient, title, chiefComplaint, historyNarrative, examinationLines, scoreLines, finalTitle,
  finalDescription, impression, conductLines, doctor
}: {
  patient: Patient
  title: string
  chiefComplaint: string
  historyNarrative: string
  examinationLines: string[]
  scoreLines: string[]
  finalTitle: string
  finalDescription: string
  impression: string
  conductLines: string[]
  doctor?: { name?: string | null; crm?: string | null } | null
}): ClinicalSummaryData => {
  const doctorSignature = formatDoctorSignature(doctor)
  const identification = `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${patient.gender || 'não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}.`
  const examinationNarrative = examinationLines.length
    ? `Ao exame e na avaliação objetiva, foram registrados ${examinationLines.join('; ')}.`
    : 'Não há sinais vitais ou achados de exame físico estruturado disponíveis neste registro; esses dados devem ser conferidos na avaliação presencial.'
  const stratificationNarrative = scoreLines.length
    ? `A investigação e a estratificação clínica demonstraram ${scoreLines.join('; ')}.`
    : 'A investigação e a estratificação ainda não possuem dados estruturados suficientes para uma conclusão definitiva.'
  const finalNarrative = `${impression} ${conductLines.join(' ')}`.trim()
  const continuousText = [
    title, '', identification, '',
    historyNarrative, '', examinationNarrative, '', stratificationNarrative, '',
    `Impressão clínica: ${impression}`, '',
    conductLines.length ? `Conduta e destino: ${conductLines.join(' ')}` : null, '',
    doctorSignature, `Gerado em: ${new Date().toLocaleString('pt-BR')}`
  ].filter((item): item is string => item != null).join('\n')
  return {
    chiefComplaint,
    historyLines: [historyNarrative],
    examinationLines,
    scoreLines,
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines,
    continuousText,
    text: continuousText
  }
}

const buildAVCClinicalSummary = (
  patient: Patient, flowchart: EmergencyFlowchart, currentStep: string, history: string[], answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
) => {
  const data = parseFlowAnswerForSummary(answers.avc_caso_estruturado) || {}
  const path = new Set([...history, currentStep])
  const current = flowchart.steps[currentStep]
  const universal = getUniversalAssessmentNarrative(answers)
  const symptoms = Array.isArray(data.symptoms) ? data.symptoms.map(String) : patient.admission?.symptoms || []
  const chiefComplaint = patient.admission?.chiefComplaint?.trim() || formatClinicalListText(symptoms) || 'déficit neurológico focal de início agudo'
  const onset = data.onsetUnknown === true
    ? 'com horário de início desconhecido'
    : data.wakeUpStroke === true
      ? 'percebido ao despertar, com último momento bem previamente registrado'
      : data.onsetDate || data.onsetTime
        ? `com início informado em ${data.onsetDate ? formatClinicalDate(String(data.onsetDate)) : 'data não registrada'}${data.onsetTime ? ` às ${data.onsetTime}` : ''}`
        : 'sem horário de início documentado'
  const historyNarrative = `Paciente avaliado por ${chiefComplaint.replace(/[.]+$/, '')}, ${onset}.${symptoms.length ? ` As manifestações registradas foram ${formatClinicalListText(symptoms)}.` : ''}`
  const cincinnati = Array.isArray(data.cincinnati) ? data.cincinnati.map(String) : []
  const examLines = uniqueTextItems([
    universal.vitalItems.length ? `sinais vitais: ${universal.vitalItems.join(', ')}` : null,
    ...universal.examItems,
    data.glucose != null ? `glicemia capilar ${data.glucose} mg/dL${data.glucoseCorrected ? ', com alteração corrigida antes da reavaliação neurológica' : ''}` : null,
    cincinnati.length ? `teste AVEI/Cincinnati com ${cincinnati.length} alteração(ões) registrada(s)` : null
  ])
  const windowLabels: Record<string, string> = { ate_45h: 'até 4,5 horas', '45_6h': 'entre 4,5 e 6 horas', '6_9h': 'entre 6 e 9 horas', '9_24h': 'entre 9 e 24 horas', mais_24h: 'acima de 24 horas', desconhecida: 'desconhecida' }
  const imagingLabels: Record<string, string> = { hemorragia: 'hemorragia intracraniana demonstrada', sem_hemorragia: 'sem hemorragia na imagem inicial', inconclusiva: 'imagem inicial inconclusiva' }
  const vesselLabels: Record<string, string> = { grande_anterior: 'oclusão de grande vaso em circulação anterior', m2_dominante: 'oclusão M2 dominante', medio_distal: 'oclusão de vaso médio/distal', basilar: 'oclusão da artéria basilar', sem_ogv: 'sem oclusão de grande vaso tratável' }
  const scoreLines = uniqueTextItems([
    typeof data.nihss === 'number' ? `NIHSS ${data.nihss} ponto(s)${data.disablingDeficit ? ', com déficit incapacitante' : ', sem déficit incapacitante marcado'}` : null,
    typeof data.premorbidRankin === 'number' ? `Rankin modificada prévia ${data.premorbidRankin}` : null,
    data.currentBloodPressure ? `pressão arterial na avaliação para reperfusão ${data.currentBloodPressure} mmHg` : null,
    data.timeWindow ? `janela terapêutica ${windowLabels[String(data.timeWindow)] || String(data.timeWindow)}` : null,
    data.imagingResult ? imagingLabels[String(data.imagingResult)] || null : null,
    data.vesselTerritory ? vesselLabels[String(data.vesselTerritory)] || null : null,
    typeof data.aspects === 'number' ? `ASPECTS ${data.aspects}` : null,
    typeof data.pcAspects === 'number' ? `pc-ASPECTS ${data.pcAspects}` : null,
    Array.isArray(data.exams) && data.exams.length ? `exames selecionados: ${formatClinicalListText(data.exams.map(String))}` : null
  ])
  const isHemorrhagic = data.imagingResult === 'hemorragia' || path.has('avc_hemorragico_destino')
  const receivedThrombolysis = data.receivedThrombolysis === true || path.has('avc_trombolitico')
  const thrombectomy = path.has('avc_desfecho_trombectomia') || /trombect/i.test(String(data.outcome || ''))
  const impression = isHemorrhagic
    ? 'Quadro compatível com acidente vascular cerebral hemorrágico, com necessidade de manejo neurocrítico.'
    : `Quadro conduzido como acidente vascular cerebral isquêmico agudo${receivedThrombolysis ? ', submetido à trombólise intravenosa' : ''}${thrombectomy ? ' e com indicação de trombectomia mecânica' : ''}.`
  const conduct = uniqueTextItems([
    receivedThrombolysis ? `Foi administrado ${data.thrombolytic === 'tenecteplase' ? 'tenecteplase' : 'alteplase'}${data.thrombolyticDose ? `, conforme cálculo registrado: ${data.thrombolyticDose}` : ''}, seguido de vigilância pós-reperfusão.` : null,
    thrombectomy ? 'Foi indicada transferência imediata para centro com capacidade de terapia endovascular, sem interromper os cuidados de suporte.' : null,
    !receivedThrombolysis && !thrombectomy && !isHemorrhagic ? 'Foram definidos cuidados clínicos, prevenção de complicações e prevenção secundária conforme etiologia e contraindicações.' : null,
    'O paciente foi destinado à UTI ou unidade neurocrítica, mantendo monitorização neurológica, hemodinâmica e respiratória até a transferência formal do cuidado.'
  ])
  return buildNarrativeSummary({ patient, title: 'RELATÓRIO MÉDICO - ACIDENTE VASCULAR CEREBRAL', chiefComplaint, historyNarrative, examinationLines: examLines, scoreLines, finalTitle: current?.title || flowchart.name, finalDescription: current?.description || flowchart.description, impression, conductLines: conduct, doctor })
}

const buildAsthmaClinicalSummary = (
  patient: Patient, flowchart: EmergencyFlowchart, currentStep: string, history: string[], answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
) => {
  const path = new Set([...history, currentStep])
  const current = flowchart.steps[currentStep]
  const initial = parseFlowAnswerForSummary(answers.asma_avaliacao_inicial)
  const reevaluation = parseFlowAnswerForSummary(answers.asma_reavaliacao_1h)
  const values = initial?.values && typeof initial.values === 'object' ? initial.values as Record<string, unknown> : {}
  const reValues = reevaluation?.values && typeof reevaluation.values === 'object' ? reevaluation.values as Record<string, unknown> : {}
  const flags = initial?.flags && typeof initial.flags === 'object' ? initial.flags as Record<string, unknown> : {}
  const universal = getUniversalAssessmentNarrative(answers)
  const chiefComplaint = patient.admission?.chiefComplaint?.trim() || patient.admission?.symptoms?.join('; ') || 'dispneia e broncoespasmo compatíveis com exacerbação asmática'
  const severeFlags: Record<string, string> = { usoMusculatura: 'uso de musculatura acessória', incapazFrases: 'incapacidade de falar frases completas', falaPalavras: 'fala entrecortada em palavras', cianose: 'cianose', confusao: 'confusão ou agitação', exaustao: 'exaustão respiratória', toraxSilente: 'tórax silencioso', sonolencia: 'sonolência ou rebaixamento' }
  const selectedFlags = Object.entries(flags).filter(([, value]) => value === true).map(([key]) => severeFlags[key] || key)
  const severity = path.has('asma_tratamento_1h_grave_vida') || path.has('asma_falencia_respiratoria') || currentStep === 'asma_uti' || currentStep === 'asma_intubacao'
    ? 'grave ou ameaçadora à vida'
    : path.has('asma_tratamento_1h_leve_moderada')
      ? 'moderada'
      : 'leve'
  const historyNarrative = `Paciente com ${chiefComplaint.replace(/[.]+$/, '')}, avaliado no pronto-socorro como exacerbação asmática ${severity}.${selectedFlags.length ? ` Na chegada, apresentava ${formatClinicalListText(selectedFlags)}.` : ''}`
  const initialMeasures = uniqueTextItems([
    values.sato2 != null ? `SpO₂ inicial ${values.sato2}%` : null, values.fr != null ? `FR inicial ${values.fr} irpm` : null,
    values.fc != null ? `FC inicial ${values.fc} bpm` : null, values.pfe != null ? `PFE inicial ${values.pfe}% do previsto/melhor pessoal` : null,
    values.paco2 != null ? `PaCO₂ ${values.paco2} mmHg` : null
  ])
  const reMeasures = uniqueTextItems([
    reValues.sato2Re != null ? `SpO₂ após uma hora ${reValues.sato2Re}%` : null,
    reValues.frRe != null ? `FR após uma hora ${reValues.frRe} irpm` : null,
    reValues.pfeRe != null ? `PFE após uma hora ${reValues.pfeRe}%` : null
  ])
  const examLines = uniqueTextItems([universal.vitalItems.length ? `sinais vitais: ${universal.vitalItems.join(', ')}` : null, ...universal.examItems, initialMeasures.length ? initialMeasures.join(', ') : null, reMeasures.length ? reMeasures.join(', ') : null])
  const treatmentItems = uniqueTextItems([
    path.has('asma_saba_leve_moderada') || path.has('asma_nebulizacao_grave_vida') ? 'beta-2 agonista de curta duração em doses repetidas' : null,
    path.has('asma_nebulizacao_grave_vida') ? 'ipratrópio associado na primeira hora' : null,
    [...path].some(step => step.includes('corticoide')) ? 'corticoide sistêmico precoce' : null,
    [...path].some(step => step.includes('o2_')) ? 'oxigênio suplementar titulado' : null,
    path.has('asma_magnesio_grave_vida') || path.has('asma_resgate_magnesio') ? 'sulfato de magnésio 2 g EV' : null,
    path.has('asma_adrenalina_anafilaxia') ? 'adrenalina IM por anafilaxia associada' : null
  ])
  const response = path.has('asma_resposta_boa') || currentStep === 'asma_alta_final' ? 'boa resposta ao tratamento inicial' : path.has('asma_resposta_incompleta') ? 'resposta parcial, com necessidade de observação e broncodilatação seriada' : path.has('asma_resposta_ma') || path.has('asma_falencia_respiratoria') ? 'má resposta ou deterioração clínica' : 'resposta terapêutica ainda em avaliação'
  const destination = currentStep === 'asma_alta_final' ? 'alta do pronto-socorro' : currentStep === 'asma_internacao' ? 'internação hospitalar' : currentStep === 'asma_uti' ? 'internação em UTI' : currentStep === 'asma_intubacao' ? 'intubação orotraqueal e ventilação mecânica' : current?.title || 'conduta em definição'
  const impression = `Exacerbação asmática classificada como ${severity}, com ${response}.`
  const conduct = uniqueTextItems([
    treatmentItems.length ? `Foram instituídos ${formatClinicalListText(treatmentItems)}.` : null,
    `O destino assistencial definido foi ${destination}.`,
    currentStep === 'asma_alta_final' ? 'Na alta, foram orientados tratamento controlador e de resgate, curso curto de corticoide oral quando indicado, revisão da técnica inalatória, plano de ação escrito, retorno precoce e sinais de alarme.' : null,
    currentStep === 'asma_internacao' ? 'Manter broncodilatação, corticoide sistêmico, oxigenação e reavaliação seriada em ambiente hospitalar.' : null,
    currentStep === 'asma_uti' || currentStep === 'asma_intubacao' ? 'Manter cuidado intensivo, vigilância de falência ventilatória e estratégia ventilatória que reduza hiperinsuflação dinâmica.' : null
  ])
  return buildNarrativeSummary({ patient, title: 'RELATÓRIO MÉDICO - EXACERBAÇÃO ASMÁTICA', chiefComplaint, historyNarrative, examinationLines: examLines, scoreLines: uniqueTextItems([`gravidade inicial: ${severity}`, `resposta após tratamento: ${response}`, treatmentItems.length ? `tratamento realizado: ${formatClinicalListText(treatmentItems)}` : null]), finalTitle: current?.title || flowchart.name, finalDescription: current?.description || flowchart.description, impression, conductLines: conduct, doctor })
}

const buildAnaphylaxisClinicalSummary = (
  patient: Patient, flowchart: EmergencyFlowchart, currentStep: string, history: string[], answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
) => {
  const path = new Set([...history, currentStep])
  const current = flowchart.steps[currentStep]
  const recognition = parseFlowAnswerForSummary(answers.ana_inicio)
  const preparation = parseFlowAnswerForSummary(answers.ana_preparo_imediato)
  const criteria = parseFlowAnswerForSummary(answers.ana_criterios_wao)
  const adjunct = parseFlowAnswerForSummary(answers.ana_tratamento_adjunto)
  const airway = parseFlowAnswerForSummary(answers.ana_via_aerea_avancada)
  const universal = getUniversalAssessmentNarrative(answers)
  const chiefComplaint = patient.admission?.chiefComplaint?.trim() || patient.admission?.symptoms?.join('; ') || 'reação sistêmica aguda com suspeita de anafilaxia'
  const findings = Array.isArray(recognition?.achadosSelecionados) ? recognition.achadosSelecionados.map(String) : []
  const systems = Array.isArray(recognition?.sistemasAcometidos) ? recognition.sistemasAcometidos.map(String) : []
  const systemLabels: Record<string, string> = { pele: 'pele e mucosas', respiratorio: 'sistema respiratório', cardiovascular: 'sistema cardiovascular', gastrointestinal: 'trato gastrointestinal' }
  const historyNarrative = `Paciente avaliado por ${chiefComplaint.replace(/[.]+$/, '')}, com início agudo e suspeita de reação de hipersensibilidade sistêmica.${systems.length ? ` Houve comprometimento de ${formatClinicalListText(systems.map(item => systemLabels[item] || item))}.` : ''}`
  const examLines = uniqueTextItems([
    universal.vitalItems.length ? `sinais vitais: ${universal.vitalItems.join(', ')}` : null,
    ...universal.examItems,
    findings.length ? `manifestações selecionadas: ${formatClinicalListText(findings)}` : null,
    Array.isArray(airway?.sinaisAmeacaSelecionados) && airway.sinaisAmeacaSelecionados.length ? `ameaça à via aérea: ${airway.sinaisAmeacaSelecionados.map(item => anaphylaxisAirwayThreatLabels[String(item)] || String(item)).join('; ')}` : null
  ])
  const criteriaSelected = Array.isArray(criteria?.criteriosSelecionados) ? criteria.criteriosSelecionados.map(String) : []
  const prepared = Array.isArray(preparation?.medidasSelecionadas) ? preparation.medidasSelecionadas.map(String) : []
  const abcde = Array.isArray(preparation?.abcdeSelecionado) ? preparation.abcdeSelecionado.map(String) : []
  const adjuncts = Array.isArray(adjunct?.tratamentosAdjuntosSelecionados) ? adjunct.tratamentosAdjuntosSelecionados.map(String) : []
  const likely = criteria?.diagnosticoProvavel === true || path.has('ana_adrenalina_im')
  const refractory = path.has('ana_repetir_adrenalina_internacao') || path.has('ana_via_aerea_avancada') || currentStep === 'ana_internacao_via_aerea_choque'
  const impression = likely
    ? `Anafilaxia clinicamente provável${refractory ? ', com resposta insuficiente às medidas iniciais ou ameaça à vida' : ', com resposta ao tratamento registrada no percurso'}.`
    : 'Os critérios clínicos para anafilaxia não foram preenchidos no momento da avaliação, permanecendo indicada observação e reavaliação diante de progressão.'
  const observation = path.has('ana_observacao_alta') ? 'alta após período de observação e resolução dos sintomas' : path.has('ana_observacao_prolongada') ? 'observação prolongada ou internação pelo risco de recorrência' : currentStep === 'ana_internacao_via_aerea_choque' ? 'internação em unidade de cuidado intensivo' : 'reavaliação clínica seriada'
  const conduct = uniqueTextItems([
    likely ? 'Foi priorizada adrenalina intramuscular na face anterolateral da coxa, sem aguardar exames complementares.' : null,
    prepared.length ? `A preparação simultânea incluiu ${prepared.length} medida(s) registrada(s), com ${abcde.length} domínio(s) do ABCDE documentado(s).` : null,
    adjuncts.length ? `Foram selecionadas medidas adjuntas conforme as manifestações: ${formatClinicalListText(adjuncts)}.` : null,
    refractory ? 'Diante de refratariedade ou ameaça à via aérea, foram acionados suporte avançado, equipe experiente e planejamento de via aérea difícil, mantendo tratamento da anafilaxia em paralelo.' : null,
    `O destino definido foi ${observation}.`,
    path.has('ana_observacao_alta') ? 'Na alta, orientar evitação do desencadeante, plano escrito, prescrição de adrenalina autoinjetável quando disponível e retorno imediato em caso de recorrência.' : null
  ])
  const scoreLines = uniqueTextItems([
    criteriaSelected.length ? `${criteriaSelected.length} padrão(ões) diagnóstico(s) WAO selecionado(s)` : null,
    abcde.length ? `ABCDE registrado: ${abcde.map(item => abcdeDomainLabels[item] || item).join('; ')}` : null,
    refractory ? 'anafilaxia refratária ou ameaça à vida identificada no percurso' : null
  ])
  return buildNarrativeSummary({ patient, title: 'RELATÓRIO MÉDICO - ANAFILAXIA', chiefComplaint, historyNarrative, examinationLines: examLines, scoreLines, finalTitle: current?.title || flowchart.name, finalDescription: current?.description || flowchart.description, impression, conductLines: conduct, doctor })
}

const buildHypertensionClinicalSummary = (
  patient: Patient, flowchart: EmergencyFlowchart, currentStep: string, answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
) => {
  const data = parseFlowAnswerForSummary(answers.hipertensao_caso_estruturado) || {}
  const current = flowchart.steps[currentStep]
  const universal = getUniversalAssessmentNarrative(answers)
  const symptomLabels: Record<string, string> = { neurologic: 'déficit neurológico, confusão, convulsão ou cefaleia abrupta', chest: 'dor torácica ou dorsal', dyspnea: 'dispneia ou sinais de edema pulmonar', visual: 'alteração visual aguda', renal: 'oligúria ou piora renal', pregnancy: 'sinais de gravidade na gestação/puerpério', nonspecific: 'sintomas inespecíficos' }
  const organLabels: Record<string, string> = { encephalopathy: 'encefalopatia hipertensiva', stroke: 'evento cerebrovascular agudo', aorta: 'síndrome aórtica aguda', coronary: 'síndrome coronariana aguda', pulmonary_edema: 'edema agudo de pulmão', renal: 'injúria renal aguda', pregnancy: 'pré-eclâmpsia grave/eclâmpsia/HELLP', catecholamine: 'crise catecolaminérgica' }
  const scenarioLabels: Record<string, string> = { aortic_syndrome: 'síndrome aórtica aguda', encephalopathy: 'encefalopatia hipertensiva', ischemic_stroke_lysis: 'AVC isquêmico candidato à trombólise', ischemic_stroke_no_lysis: 'AVC isquêmico sem trombólise', intracerebral_hemorrhage: 'hemorragia intracerebral', subarachnoid_hemorrhage: 'hemorragia subaracnoide', catecholamine_crisis: 'crise catecolaminérgica', acute_coronary_syndrome: 'síndrome coronariana aguda', pulmonary_edema: 'edema agudo de pulmão', pregnancy_emergency: 'emergência hipertensiva na gestação', other: 'outra lesão aguda de órgão-alvo' }
  const routeLabels: Record<string, string> = { chronic: 'hipertensão crônica descompensada, sem quadro agudo tempo-dependente', emergency: 'emergência hipertensiva com lesão aguda de órgão-alvo', important_elevation: 'elevação pressórica importante sem lesão aguda demonstrada', pseudocrisis: 'pseudocrise hipertensiva associada a fator precipitante' }
  const symptoms = Array.isArray(data.symptoms) ? data.symptoms.map(item => symptomLabels[String(item)] || String(item)) : []
  const organDamage = Array.isArray(data.organDamage) ? data.organDamage.map(item => organLabels[String(item)] || String(item)) : []
  const chiefComplaint = patient.admission?.chiefComplaint?.trim() || formatClinicalListText(symptoms) || 'elevação importante da pressão arterial'
  const pressure = data.systolic != null && data.diastolic != null ? `${data.systolic}/${data.diastolic} mmHg` : 'não registrada'
  const historyNarrative = `Paciente avaliado por ${chiefComplaint.replace(/[.]+$/, '')}, com pressão arterial inicial de ${pressure}.${symptoms.length ? ` Os sintomas associados foram ${formatClinicalListText(symptoms)}.` : ' Não foram documentados sintomas agudos específicos no formulário estruturado.'}`
  const examLines = uniqueTextItems([
    universal.vitalItems.length ? `sinais vitais: ${universal.vitalItems.join(', ')}` : null,
    ...universal.examItems,
    data.pressureAfterRest ? `pressão após repouso e nova aferição: ${data.pressureAfterRest} mmHg` : null,
    organDamage.length ? `lesão aguda de órgão-alvo identificada: ${formatClinicalListText(organDamage)}` : 'sem lesão aguda de órgão-alvo selecionada'
  ])
  const route = String(data.route || '')
  const scenario = data.scenario ? scenarioLabels[String(data.scenario)] || String(data.scenario) : ''
  const scoreLines = uniqueTextItems([
    route ? `classificação: ${routeLabels[route] || route}` : null,
    scenario ? `cenário predominante: ${scenario}` : null,
    Array.isArray(data.exams) && data.exams.length ? `exames direcionados selecionados: ${formatClinicalListText(data.exams.map(String))}` : null,
    data.selectedIVAgent ? `agente intravenoso selecionado: ${String(data.selectedIVAgent)}` : null,
    data.selectedOralPlan ? `plano oral selecionado: ${String(data.selectedOralPlan)}` : null
  ])
  const impression = routeLabels[route] ? `${routeLabels[route][0].toUpperCase()}${routeLabels[route].slice(1)}.` : 'Elevação pressórica ainda em classificação quanto à presença de lesão aguda de órgão-alvo.'
  const conduct = uniqueTextItems([
    route === 'emergency' ? `Foi indicado tratamento intravenoso titulável orientado pelo cenário de ${scenario || 'lesão de órgão-alvo'}, com metas específicas e redução controlada da pressão.` : null,
    route === 'emergency' ? 'Manter monitorização contínua, investigação dirigida e cuidado em CTI até estabilização e transferência formal.' : null,
    route === 'important_elevation' ? 'Após repouso e nova aferição, foi definido ajuste cauteloso do tratamento oral, sem redução abrupta da pressão, com seguimento precoce.' : null,
    route === 'pseudocrisis' ? 'Foi priorizado o tratamento do fator precipitante, observação da resposta e reavaliação da pressão antes da alta.' : null,
    route === 'chronic' ? 'Foi orientada revisão do tratamento anti-hipertensivo habitual, adesão, fatores associados e acompanhamento ambulatorial.' : null,
    data.disposition ? `Destino registrado: ${String(data.disposition)}.` : null
  ])
  return buildNarrativeSummary({ patient, title: 'RELATÓRIO MÉDICO - AVALIAÇÃO HIPERTENSIVA', chiefComplaint, historyNarrative, examinationLines: examLines, scoreLines, finalTitle: current?.title || flowchart.name, finalDescription: current?.description || flowchart.description, impression, conductLines: conduct, doctor })
}

const dengueAlarmLabels: Record<string, string> = {
  dor_abdominal: 'dor abdominal intensa e contínua',
  vomitos_persistentes: 'vômitos persistentes',
  acumulo_liquidos: 'sinais de acúmulo de líquidos',
  hipotensao_postural: 'hipotensão postural ou lipotímia',
  hepatomegalia: 'hepatomegalia superior a 2 cm',
  sangramento_mucosa: 'sangramento de mucosa',
  letargia_irritabilidade: 'letargia ou irritabilidade',
  hematocrito_progressivo: 'elevação progressiva do hematócrito'
}

const dengueGravityLabels: Record<string, string> = {
  extravasamento_plasma: 'extravasamento plasmático grave',
  choque_taquicardia: 'choque ou repercussão hemodinâmica',
  sangramento_grave: 'sangramento grave',
  comprometimento_orgaos: 'comprometimento grave de órgãos'
}

const inferDengueGroup = (patient: Patient, currentStep: string, history: string[]) => {
  if (patient.flowchartState?.group) return patient.flowchartState.group
  const path = new Set([...history, currentStep])
  if ([...path].some((step) => step === 'group_d' || step === 'group_d_shock' || step.startsWith('d_') || step === 'treatment_d' || step === 'end_group_d')) return 'D'
  if ([...path].some((step) => step === 'group_c' || step.startsWith('maintenance_c') || step === 'treatment_c' || step === 'end_group_c')) return 'C'
  if ([...path].some((step) => step === 'group_b' || step === 'wait_labs_b' || step === 'evaluate_labs_b' || step === 'end_group_b')) return 'B'
  if ([...path].some((step) => step === 'group_a' || step === 'hydration_a' || step === 'end_group_a')) return 'A'
  return undefined
}

const buildDengueClinicalSummary = (
  patient: Patient,
  flowchart: EmergencyFlowchart,
  currentStep: string,
  history: string[],
  answers: Record<string, string>,
  doctor?: { name?: string | null; crm?: string | null } | null
): ClinicalSummaryData => {
  const currentStepData = flowchart.steps[currentStep]
  const group = inferDengueGroup(patient, currentStep, history)
  const path = new Set([...history, currentStep])
  const assessment = parseUniversalClinicalAssessment(answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY])
  const vitals = assessment?.sinaisVitais || patient.admission?.vitalSigns || {}
  const physicalExam = assessment?.exameFisico
  const alarmAnswer = parseFlowAnswerForSummary(answers.alarm_check)
  const alarmKeys = Array.isArray(alarmAnswer?.grupoC) ? alarmAnswer.grupoC.map(String) : []
  const gravityKeys = Array.isArray(alarmAnswer?.grupoD) ? alarmAnswer.grupoD.map(String) : []
  const alarmSigns = alarmKeys.map((item) => dengueAlarmLabels[item] || item)
  const gravitySigns = gravityKeys.map((item) => dengueGravityLabels[item] || item)
  const symptoms = uniqueTextItems(patient.admission?.symptoms || [])
  const chiefComplaint = patient.admission?.chiefComplaint?.trim()
    || (symptoms.length > 0 ? formatClinicalListText(symptoms) : 'síndrome febril aguda em investigação para dengue')
  const doctorSignature = formatDoctorSignature(doctor)

  const vitalLines = uniqueTextItems([
    typeof vitals.temperature === 'number' ? `temperatura de ${vitals.temperature.toLocaleString('pt-BR')} °C` : null,
    typeof vitals.bloodPressure === 'string' && vitals.bloodPressure ? `pressão arterial de ${vitals.bloodPressure} mmHg` : null,
    typeof vitals.heartRate === 'number' ? `frequência cardíaca de ${vitals.heartRate} bpm` : null,
    typeof vitals.respiratoryRate === 'number' ? `frequência respiratória de ${vitals.respiratoryRate} irpm` : null,
    typeof vitals.oxygenSaturation === 'number' ? `saturação periférica de oxigênio de ${vitals.oxygenSaturation}%` : null,
    typeof vitals.glucose === 'string' && vitals.glucose ? `glicemia capilar de ${vitals.glucose} mg/dL` : null,
    typeof vitals.glucose === 'number' ? `glicemia capilar de ${vitals.glucose} mg/dL` : null
  ])
  const physicalLines = summarizeUniversalPhysicalExam(physicalExam)
  const examinationNarrative = [
    vitalLines.length > 0 ? `Na avaliação inicial, apresentava ${formatClinicalListText(vitalLines)}.` : '',
    physicalLines.length > 0 ? `Ao exame físico, registrou-se ${formatClinicalListText(physicalLines.map((item) => item.replace(/^[^:]+:\s*/, '').toLowerCase()))}.` : ''
  ].filter(Boolean).join(' ')

  const labs = patient.labResults
  const laboratoryLines = uniqueTextItems([
    typeof labs?.hemoglobin === 'number' ? `hemoglobina ${labs.hemoglobin.toLocaleString('pt-BR')} g/dL` : null,
    typeof labs?.hematocrit === 'number' ? `hematócrito ${labs.hematocrit.toLocaleString('pt-BR')}%` : null,
    typeof labs?.platelets === 'number' ? `plaquetas ${labs.platelets.toLocaleString('pt-BR')}/mm³` : null,
    typeof labs?.albumin === 'number' ? `albumina ${labs.albumin.toLocaleString('pt-BR')} g/dL` : null,
    typeof labs?.transaminases?.alt === 'number' ? `ALT/TGP ${labs.transaminases.alt.toLocaleString('pt-BR')} U/L` : null,
    typeof labs?.transaminases?.ast === 'number' ? `AST/TGO ${labs.transaminases.ast.toLocaleString('pt-BR')} U/L` : null
  ])
  const hematocritSeries = (() => {
    try {
      const parsed = JSON.parse(answers.dengue_hematocrit_series || '[]') as Array<{ value?: unknown }>
      return parsed.map((item) => Number(item.value)).filter((value) => Number.isFinite(value))
    } catch { return [] as number[] }
  })()
  const hemoconcentrationText = answers.dengue_hemoconcentration_assessment === 'progressive_rise_compatible'
    ? 'A série do hematócrito apresentou elevação progressiva compatível com hemoconcentração no contexto clínico.'
    : answers.dengue_hemoconcentration_assessment === 'fall_with_improvement'
      ? 'Observou-se queda do hematócrito acompanhada de melhora clínica após hidratação.'
      : answers.dengue_hemoconcentration_assessment === 'fall_with_instability_or_bleeding'
        ? 'A queda do hematócrito ocorreu com instabilidade ou suspeita de sangramento, exigindo investigação de hemorragia.'
        : hematocritSeries.length > 0
          ? `Foi registrada série de hematócrito (${hematocritSeries.map((value) => `${value}%`).join(' → ')}), ainda sem interpretação conclusiva documentada.`
          : ''

  const classificationText = group === 'A'
    ? 'O paciente foi classificado no Grupo A, sem sinais de alarme, gravidade ou condições especiais registradas no caminho atual.'
    : group === 'B'
      ? 'O paciente foi classificado no Grupo B, sem sinais de alarme ou gravidade, porém com condição clínica que exige avaliação complementar e acompanhamento mais próximo.'
      : group === 'C'
        ? `O paciente foi classificado no Grupo C por apresentar sinal de alarme${alarmSigns.length > 1 ? 's' : ''}${alarmSigns.length > 0 ? `, incluindo ${formatClinicalListText(alarmSigns)}` : ''}, sem critério de dengue grave documentado neste momento.`
        : group === 'D'
          ? `O paciente foi classificado no Grupo D por critério de dengue grave${gravitySigns.length > 0 ? `, com registro de ${formatClinicalListText(gravitySigns)}` : ''}.`
          : 'A classificação definitiva de risco ainda não foi concluída no fluxo.'

  const conductText = group === 'A'
    ? `${path.has('hydration_a') || path.has('end_group_a') ? 'Foi definido manejo ambulatorial com hidratação oral orientada, tratamento sintomático seguro e vigilância de sinais de alarme.' : 'O caso encontra-se em organização do manejo ambulatorial e das orientações de hidratação.'}${path.has('end_group_a') ? ' Foram fornecidas orientações de retorno durante a fase crítica e em caso de piora.' : ''}`
    : group === 'B'
      ? `${path.has('evaluate_labs_b') || path.has('end_group_b') ? 'Foram indicados hemograma e avaliação seriada do hematócrito, mantendo hidratação oral e reavaliação clínica.' : 'Foi indicada investigação laboratorial e observação clínica antes da definição do destino.'}${path.has('end_group_b') ? ' Mantido seguimento diário até 48 horas após a remissão da febre, conforme evolução.' : ''}`
      : group === 'C'
        ? `${path.has('treatment_c') || [...path].some((step) => step.startsWith('maintenance_c')) || path.has('end_group_c') ? 'Foi instituída hidratação venosa, com monitorização clínica, diurese, sinais vitais e hematócrito seriado, ajustando-se a reposição conforme a resposta.' : 'Foi indicada internação para hidratação venosa e monitorização seriada, sem atrasar a avaliação de possível deterioração.'}${path.has('end_group_c') ? ' Após resposta favorável e cumprimento dos critérios de segurança, o fluxo avançou para avaliação de alta.' : ''}`
        : group === 'D'
          ? `${path.has('treatment_d') || path.has('group_d_shock') || [...path].some((step) => step.startsWith('d_')) || path.has('end_group_d') ? 'Foi iniciado manejo de dengue grave com reposição volêmica imediata, monitorização contínua e reavaliações clínicas e laboratoriais frequentes, incluindo investigação de choque, sangramento e disfunção orgânica.' : 'Foi indicada estabilização imediata e transferência para unidade de cuidado intensivo.'}${path.has('end_group_d') ? ' O encerramento do fluxo ocorreu após registro dos critérios clínicos de recuperação e segurança.' : ''}`
          : 'A conduta permanece condicionada à conclusão da classificação de risco.'

  const prescriptions = uniqueTextItems((patient.treatment?.prescriptions || []).map((item) => [item.medication, item.dosage, item.frequency, item.duration].filter(Boolean).join(' ')))
  const observations = uniqueTextItems(patient.treatment?.observations || [])
  const notification = answers.dengue_notification_number?.trim()
  const finalTitle = group ? `Dengue — Grupo ${group}` : (currentStepData?.title || 'Dengue em classificação')
  const finalDescription = classificationText
  const finalNarrative = [
    classificationText,
    conductText,
    prescriptions.length > 0 ? `Medicações registradas: ${formatClinicalListText(prescriptions)}.` : '',
    notification ? `Notificação compulsória registrada sob o número ${notification}.` : '',
    observations.length > 0 ? `Observações clínicas adicionais: ${formatClinicalListText(observations)}.` : ''
  ].filter(Boolean).join(' ')
  const historyNarrative = `Paciente atendido por ${chiefComplaint.replace(/[.;]+$/, '')}${patient.admission?.complaintDuration ? `, com duração informada de ${patient.admission.complaintDuration}` : ''}. ${symptoms.length > 1 ? `Foram também registrados ${formatClinicalListText(symptoms.slice(1))}.` : ''} A avaliação foi direcionada à pesquisa de sinais de alarme e critérios de gravidade.`
  const investigationNarrative = [
    laboratoryLines.length > 0 ? `Exames disponíveis: ${formatClinicalListText(laboratoryLines)}.` : 'Não há resultados laboratoriais estruturados disponíveis até esta etapa.',
    hemoconcentrationText
  ].filter(Boolean).join(' ')
  const safetyText = group === 'A' || group === 'B'
    ? 'Orientado retorno imediato diante de dor abdominal intensa, vômitos persistentes, sangramento, tontura ou síncope, sonolência ou irritabilidade, dispneia, redução da diurese ou piora do estado geral.'
    : 'Manter vigilância para choque, sangramento, disfunção orgânica, piora da perfusão, redução da diurese e alteração do nível de consciência, com escalonamento imediato do suporte quando necessário.'
  const identification = `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, ${patient.gender || 'gênero não informado'}, atendido em ${formatClinicalDate(patient.admission?.date)}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}.`
  const continuousText = [
    'RELATÓRIO MÉDICO — DENGUE', '', identification, '',
    historyNarrative, '', examinationNarrative || 'Sinais vitais e exame físico não foram registrados de forma estruturada.', '',
    classificationText, '', investigationNarrative, '', conductText, '', safetyText, '',
    notification ? `Notificação compulsória: ${notification}.` : '',
    doctorSignature
  ].filter((item, index, array) => item !== '' || array[index - 1] !== '').join('\n')

  return {
    chiefComplaint,
    historyLines: [historyNarrative],
    examinationLines: examinationNarrative ? [examinationNarrative] : [],
    scoreLines: [classificationText, investigationNarrative],
    finalTitle,
    finalDescription,
    finalNarrative,
    doctorSignature,
    conductLines: [conductText, safetyText],
    continuousText,
    text: continuousText
  }
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

  if (flowchart.id === 'influenza') {
    return buildInfluenzaClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'pneumonia') {
    return buildPneumoniaClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
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

  if (flowchart.id === 'geca') {
    return buildGecaClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'dengue') {
    return buildDengueClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'avc') {
    return buildAVCClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'anafilaxia') {
    return buildAnaphylaxisClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'asthma') {
    return buildAsthmaClinicalSummary(patient, flowchart, currentStep, history, answers, options?.doctor)
  }

  if (flowchart.id === 'hipertensao') {
    return buildHypertensionClinicalSummary(patient, flowchart, currentStep, answers, options?.doctor)
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

  const universalAssessment = parseUniversalClinicalAssessment(answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY])
  const universalVitals = universalAssessment?.sinaisVitais
  const universalExaminationLines = [
    universalVitals ? formatClinicalValue(universalVitals) : '',
    ...summarizeUniversalPhysicalExam(universalAssessment?.exameFisico)
  ].filter(Boolean).map((line, index) => index === 0 ? `Sinais vitais: ${line}` : `Exame físico: ${line}`)

  const pathSteps = new Set([...history, currentStep])
  const abcdeExaminationLines = Object.entries(answers)
    .filter(([key]) => key.startsWith('__abcde__:') && pathSteps.has(key.slice('__abcde__:'.length)))
    .flatMap(([key, raw]) => {
      const parsed = parseFlowAnswerForSummary(raw)
      const selected = Array.isArray(parsed?.dominiosSelecionados) ? parsed.dominiosSelecionados.map(String) : []
      if (selected.length === 0) return []
      const stepId = key.slice('__abcde__:'.length)
      const stepTitle = flowchart.steps[stepId]?.title || 'Etapa de estabilização'
      return [`ABCDE em ${stepTitle}: ${selected.map((item) => abcdeDomainLabels[item] || item).join('; ')}`]
    })

  const examinationLines = [
    ...universalExaminationLines,
    ...abcdeExaminationLines,
    ...answerEntries.flatMap((entry) => {
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
  ]

  const anaphylaxisAirwayLines = answerEntries.flatMap((entry) => {
    if (entry.step.id !== 'ana_via_aerea_avancada') return []
    const threats = Array.isArray(entry.parsed?.sinaisAmeacaSelecionados) ? entry.parsed.sinaisAmeacaSelecionados.map(String) : []
    if (threats.length === 0) return []
    return [`Ameaça à via aérea: ${threats.map((item) => anaphylaxisAirwayThreatLabels[item] || item).join('; ')}`]
  })
  examinationLines.push(...anaphylaxisAirwayLines)

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
  const anaphylaxisAirwayConduct = answerEntries.flatMap((entry) => {
    if (entry.step.id !== 'ana_via_aerea_avancada') return []
    const actions = Array.isArray(entry.parsed?.medidasViaAereaSelecionadas) ? entry.parsed.medidasViaAereaSelecionadas.map(String) : []
    const pocus = Array.isArray(entry.parsed?.medidasPocusSelecionadas) ? entry.parsed.medidasPocusSelecionadas.map(String) : []
    return uniqueTextItems([
      actions.length > 0 ? `Plano de via aérea registrado: ${actions.map((item) => anaphylaxisAirwayActionLabels[item] || item).join('; ')}.` : null,
      entry.parsed?.cicoDeclarado === true ? 'Cenário CICO/obstrução completa declarado, com acesso frontal de emergência indicado conforme protocolo institucional.' : null,
      pocus.length > 0 ? `POCUS complementar registrado: ${pocus.map((item) => anaphylaxisPocusActionLabels[item] || item).join('; ')}.` : null
    ])
  })
  const finalNarrative = [
    `Ao final do fluxograma, o caso foi direcionado para: ${finalTitle}.`,
    finalDescription,
    finalAnswer ? `A decisão clínica mais recente registrada foi: ${finalAnswer}.` : '',
    ...anaphylaxisAirwayConduct,
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
