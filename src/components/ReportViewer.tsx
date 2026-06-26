'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Download, 
  FileText, 
  Stethoscope,
  Zap,
  Clipboard,
  ClipboardCheck
} from 'lucide-react'
import { Patient } from '@/types/patient'
import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { patientService } from '@/services/patientService'
import { getCurrentDoctor, type DoctorProfile } from '@/services/doctorRepo'
import type { PhysicalExamData } from './PhysicalExamForm'
import {
  ANAPHYLAXIS_ADJUNCT_CARDS,
  ANAPHYLAXIS_HOME_ORIENTATIONS,
  calculateAnaphylaxisAdrenalineDose
} from '@/lib/anaphylaxis'
import {
  getOseltamivirDoseText
} from '@/lib/influenza'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportSection {
  title: string
  text?: string
  items?: string[]
}

interface StructuredMedicalReport {
  title: string
  sections: ReportSection[]
}

const TVP_CLASSIC_SIGNS = [
  'Dor unilateral na perna (panturrilha ou coxa), tipo peso/pressão, que piora ao deambular ou ao ficar em pé',
  'Edema unilateral',
  'Sensação de calor, rubor ou mudança de coloração (eritema ou cianose leve) no membro afetado',
  'Rigidez ou sensação de tensão na panturrilha',
  'Sensibilidade à palpação em trajeto venoso profundo',
  'Aumento de circunferência da panturrilha ou coxa comparado ao lado contralateral',
  'Dor à compressão da panturrilha ou ao espremer o gastrocnêmio',
  'Febre baixa inespecífica',
  'Taquicardia'
]

const TVP_PHYSICAL_EXAM_FINDINGS = [
  'Edema assimétrico, frequentemente com cacifo',
  'Aumento da circunferência da panturrilha em relação ao lado oposto',
  'Calor local e rubor; pele brilhante e tensa',
  'Veias superficiais colaterais dilatadas (circulação de derivação)',
  'Dor à palpação profunda da panturrilha ou do trajeto venoso',
  'Eritema (vermelhidão na região)',
  'Cianose (coloração azulada ou arroxeada na região)',
  'Palidez cutânea',
  'Pulsos arteriais preservados: femoral, poplíteo, tibial posterior e pedioso palpáveis e simétricos',
  'Sinal de Homans positivo (dor à dorsiflexão do pé)'
]

const TVP_ALERT_SIGNS = [
  'Edema súbito e importante com dor intensa e cianose: suspeitar flegmasia cerulea dolens (urgência)',
  'Edema que envolve toda a perna, inclusive raiz da coxa/inguinal (possível TVP iliofemoral)',
  'Progressão rápida do edema e dor em horas/dias',
  'Veias superficiais muito proeminentes e tensas',
  'Dor de início recente associada a imobilização, cirurgia recente (≤4 semanas), trauma, câncer ativo, gravidez/puerpério, uso de estrogênios, história prévia de TVP/TEV ou trombofilia',
  'Sintomas respiratórios concomitantes (dispneia súbita, dor torácica pleurítica, hemoptise, síncope): suspeitar embolia pulmonar'
]

const TVP_WELLS_CRITERIA_LABELS: Record<string, string> = {
  cancer_ativo: 'Câncer ativo',
  paresia_imobilizacao: 'Paralisia/paresia ou imobilização com gesso em membro inferior',
  restrito_leito_cirurgia: 'Restrito ao leito por 3 dias ou mais / cirurgia maior nas últimas 12 semanas',
  dor_trajeto_venoso: 'Dor à palpação ao longo do sistema venoso profundo',
  perna_inteira_edemaciada: 'Perna inteira edemaciada',
  panturrilha_3cm: 'Aumento da panturrilha maior ou igual a 3 cm',
  edema_cacifo: 'Edema com cacifo limitado à perna sintomática',
  veias_colaterais: 'Veias colaterais superficiais não varicosas',
  tvp_previa: 'TVP prévia documentada',
  diagnostico_alternativo: 'Diagnóstico alternativo pelo menos tão provável quanto TVP'
}

const TVP_CONTRAINDICATION_LABELS: Record<string, string> = {
  abs_sangramento_ativo: 'Sangramento ativo maior',
  abs_intracraniano_recente: 'Sangramento intracraniano recente',
  abs_neuro_ocular_recente: 'Cirurgia neuro/ocular recente',
  abs_trombocitopenia_grave: 'Plaquetas muito baixas',
  abs_risco_critico: 'Risco hemorrágico crítico não corrigível',
  rel_trombocitopenia_moderada: 'Plaquetopenia moderada',
  rel_hipertensao_nao_controlada: 'Hipertensão arterial importante não controlada',
  rel_disfuncao_renal_hepatica: 'Disfunção renal/hepática moderada',
  rel_sangramento_gi_recente: 'Sangramento gastrointestinal recente'
}

const TVP_THERAPY_LABELS: Record<string, string> = {
  rivaroxabana: 'Rivaroxabana',
  apixabana: 'Apixabana',
  dabigatrana: 'Dabigatrana',
  edoxabana: 'Edoxabana',
  enoxaparina: 'Enoxaparina',
  hnf: 'Heparina não fracionada',
  varfarina: 'Varfarina'
}

const TVP_DURATION_PLAN_LABELS: Record<string, string> = {
  duracao_provocada: 'Duração planejada de 3 meses em evento provocado por fator transitório.',
  duracao_nao_provocada: 'Considerar anticoagulação estendida ou indefinida em caso não provocado/trombofilia persistente.',
  duracao_cancer: 'Manter anticoagulação enquanto houver câncer ativo ou tratamento oncológico em curso.',
  duracao_gravidez: 'Manter HBPM durante a gestação e até 6 semanas pós-parto, com mínimo total de 3 meses.'
}

const ANAPHYLAXIS_DIAGNOSTIC_CRITERIA_LABELS: Record<string, string> = {
  skin_plus_system: 'Pele/mucosa associada a comprometimento respiratório ou cardiovascular',
  two_systems_after_exposure: 'Dois ou mais sistemas acometidos após provável exposição a alérgeno',
  known_allergen_hypotension: 'Hipotensão após exposição a alérgeno sabidamente conhecido'
}

const ANAPHYLAXIS_RESPONSE_LABELS: Record<string, string> = {
  resposta: 'resposta clínica adequada',
  sem_resposta: 'ausência de melhora / piora clínica',
  critico: 'via aérea/choque crítico'
}

const DENGUE_ALARM_SIGN_LABELS: Record<string, string> = {
  dor_abdominal: 'Dor abdominal intensa',
  vomitos_persistentes: 'Vômitos persistentes',
  acumulo_liquidos: 'Acúmulo de líquidos',
  hipotensao_postural: 'Hipotensão postural',
  hepatomegalia: 'Hepatomegalia maior que 2 cm',
  sangramento_mucosa: 'Sangramento de mucosa',
  letargia_irritabilidade: 'Letargia e/ou irritabilidade'
}

const DENGUE_GRAVITY_SIGN_LABELS: Record<string, string> = {
  extravasamento_plasma: 'Extravasamento grave de plasma',
  choque_taquicardia: 'Choque com taquicardia',
  sangramento_grave: 'Sangramento grave',
  comprometimento_orgaos: 'Comprometimento grave de órgãos'
}

const DENGUE_RECOMMENDED_EXAMS_LABELS: Record<string, string> = {
  rx_pa_perfil_laurell: 'Raio X de tórax (PA, perfil e incidência de Laurell)',
  usg_abdome: 'USG de abdome'
}

const DENGUE_OTHER_EXAMS_LABELS: Record<string, string> = {
  glicemia: 'Glicemia',
  ureia: 'Ureia',
  creatinina: 'Creatinina',
  eletrolitos: 'Eletrólitos',
  gasometria: 'Gasometria',
  coagulograma: 'Coagulograma',
  tpae: 'TP/AE',
  ecocardiograma: 'Ecocardiograma'
}

const DENGUE_SUGGESTED_EXAMS_B_LABELS: Record<string, string> = {
  alb: 'Albumina sérica',
  alt: 'Transaminases ALT/TGP',
  ast: 'Transaminases AST/TGO',
  coag: 'Coagulograma'
}

interface ReportViewerProps {
  patient: Patient
  onClose: () => void
}

const ReportViewer: React.FC<ReportViewerProps> = ({ patient, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)
  const [doctorProfile, setDoctorProfile] = React.useState<DoctorProfile | null>(null)
  const activeFlowState = ((patient as Patient & { emergencyState?: Patient['flowchartState'] }).emergencyState?.answers &&
    Object.keys((patient as Patient & { emergencyState?: Patient['flowchartState'] }).emergencyState?.answers || {}).length > Object.keys(patient.flowchartState?.answers || {}).length)
    ? (patient as Patient & { emergencyState?: Patient['flowchartState'] }).emergencyState
    : patient.flowchartState
  const activeGroup = activeFlowState?.group || patient.flowchartState?.group

  React.useEffect(() => {
    let mounted = true
    getCurrentDoctor()
      .then((doctor) => {
        if (mounted) setDoctorProfile(doctor as DoctorProfile | null)
      })
      .catch((error) => {
        console.warn('Não foi possível carregar o médico responsável do relatório:', error)
      })
    return () => {
      mounted = false
    }
  }, [])

  const doctorSignatureText = React.useMemo(() => {
    const doctorName = doctorProfile?.name?.trim()
    const crm = doctorProfile?.crm?.trim()
    const crmText = crm ? (/^crm\b/i.test(crm) ? crm : `CRM ${crm}`) : 'CRM não informado'
    return `Médico responsável: ${doctorName || 'Não informado'}\n${crmText}`
  }, [doctorProfile])

  // Faixas de referência da Hemoglobina por idade/sexo
  const getHbRange = () => {
    const now = new Date()
    const birth = patient.birthDate ? new Date(patient.birthDate) : now
    const diffMonths = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)))
    const ageYears = patient.age

    if (diffMonths < 1) return { min: 16.0, max: 18.0 } // RN
    if (ageYears === 0 && diffMonths >= 1 && diffMonths <= 11) return { min: 10.6, max: 13.0 } // 1–11 meses
    if (ageYears >= 1 && ageYears <= 2) return { min: 11.5, max: 14.5 } // 1–2 anos
    if (ageYears >= 3 && ageYears <= 17) return { min: 11.5, max: 14.5 } // 3–17 anos
    if (ageYears >= 18) {
      return patient.gender === 'masculino'
        ? { min: 12.5, max: 16.5 }
        : { min: 11.5, max: 15.5 }
    }
    return { min: 11.5, max: 14.5 }
  }

  const generatePDF = async () => {
    if (!reportRef.current) return

    try {
      // Configurar o canvas para melhor qualidade
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`relatorio_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const copyReportText = async () => {
    try {
      const report = buildStructuredReport()
      const fullText = [
        report.title,
        `Data do relatório: ${formatDate(new Date())}`,
        `Número do protocolo: ${patient.id}`,
        '',
        ...report.sections.flatMap((section, index) => {
          const content = [`${index + 1}. ${section.title}`]
          if (section.text) content.push(section.text)
          if (section.items?.length) {
            content.push(...section.items.map((item) => `- ${item}`))
          }
          content.push('')
          return content
        }),
        '---',
        'Relatório gerado automaticamente pelo Sistema Siga o Fluxo',
        formatDate(new Date())
      ].join('\n')

      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      
      // Reset do feedback após 2 segundos
      setTimeout(() => {
        setCopied(false)
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao copiar texto:', error)
      alert('Erro ao copiar texto. Tente novamente.')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getGroupInfo = (group?: 'A' | 'B' | 'C' | 'D') => {
    const groupData = {
      A: { 
        name: 'Grupo A - Dengue sem sinais de alarme', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        description: 'Dengue sem sinais de alarme, sem comorbidades. Tratamento ambulatorial com hidratação oral.',
        risk: 'baixo risco',
        treatment: 'tratamento ambulatorial com hidratação oral'
      },
      B: { 
        name: 'Grupo B - Dengue com fatores de risco', 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        description: 'Dengue com fatores de risco ou comorbidades. Observação até resultado dos exames.',
        risk: 'risco moderado com necessidade de observação',
        treatment: 'acompanhamento hospitalar até resultado dos exames laboratoriais'
      },
      C: { 
        name: 'Grupo C - Dengue com sinais de alarme', 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        description: 'Dengue com sinais de alarme. Internação hospitalar para monitorização.',
        risk: 'alto risco com sinais de alarme',
        treatment: 'internação hospitalar para monitorização contínua'
      },
      D: { 
        name: 'Grupo D - Dengue grave', 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        description: 'Dengue grave com extravasamento de plasma ou choque. Tratamento intensivo.',
        risk: 'risco crítico com dengue grave',
        treatment: 'tratamento em unidade de terapia intensiva'
      }
    }
    return group ? groupData[group] : null
  }

  const buildStructuredReport = (): StructuredMedicalReport => {
    const scoreFlowState = (state?: Patient['flowchartState']) => {
      if (!state) return -1
      const answerCount = Object.keys(state.answers || {}).length
      const historyCount = state.history?.length || 0
      const hasRealStep = Boolean(state.currentStep && state.currentStep !== 'start')
      return answerCount * 10 + historyCount * 2 + (hasRealStep ? 1 : 0)
    }
    const scorePatientFlow = (candidate?: Patient & { emergencyState?: Patient['flowchartState'] }) => {
      if (!candidate) return -1
      return Math.max(scoreFlowState(candidate.flowchartState), scoreFlowState(candidate.emergencyState))
    }
    const persistedPatient = patientService.getPatientById(patient.id)
    const localCandidates = patientService.getAllPatients().filter((candidate) =>
      candidate.id === patient.id
      || (!!patient.medicalRecord && candidate.medicalRecord === patient.medicalRecord)
    )
    const patientForReport = [patient, persistedPatient, ...localCandidates]
      .filter(Boolean)
      .reduce((best, candidate) => (
        scorePatientFlow(candidate as Patient & { emergencyState?: Patient['flowchartState'] }) > scorePatientFlow(best as Patient & { emergencyState?: Patient['flowchartState'] })
          ? candidate
          : best
      ), patient) as Patient
    const patientWithEmergencyState = patientForReport as Patient & { emergencyState?: Patient['flowchartState'] }

    const safeParse = (value?: string) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }

    const uniqueItems = (items: Array<string | null | undefined>) =>
      Array.from(new Set(items.map((item) => item?.trim()).filter(Boolean) as string[]))

    const formatWeight = (weight?: number) =>
      typeof weight === 'number' && Number.isFinite(weight) ? `${weight.toFixed(1).replace('.', ',')} kg` : 'não informado'

    const formatGender = (gender?: string) => gender?.trim() || 'não informado'

    const buildVitalsList = () => {
      const vs = patientForReport.admission.vitalSigns || {}
      return uniqueItems([
        vs.temperature != null ? `Temperatura: ${vs.temperature} °C` : null,
        vs.heartRate != null ? `Frequência cardíaca: ${vs.heartRate} bpm` : null,
        vs.respiratoryRate != null ? `Frequência respiratória: ${vs.respiratoryRate} irpm` : null,
        vs.bloodPressure ? `Pressão arterial: ${vs.bloodPressure} mmHg` : null,
        vs.oxygenSaturation != null ? `Saturação de oxigênio: ${vs.oxygenSaturation}%` : null,
        vs.glucose != null ? `Glicemia capilar: ${vs.glucose} mg/dL` : null,
        vs.painLevel != null ? `Escala de dor referida: ${vs.painLevel}/10` : null
      ])
    }

    const buildLabItems = () => {
      const labs = patientForReport.labResults
      const findings: string[] = []
      if (labs?.status === 'pending') findings.push('Exames laboratoriais solicitados, ainda pendentes.')
      if (labs?.hemoglobin != null) {
        const hbRange = getHbRange()
        findings.push(`Hemoglobina: ${labs.hemoglobin} g/dL (referência ${hbRange.min.toFixed(1)}-${hbRange.max.toFixed(1)} g/dL).`)
      }
      if (labs?.hematocrit != null) findings.push(`Hematócrito: ${labs.hematocrit}%.`)
      if (labs?.platelets != null) findings.push(`Plaquetas: ${labs.platelets.toLocaleString('pt-BR')}/mm³.`)
      if (labs?.albumin != null) findings.push(`Albumina: ${labs.albumin} g/dL.`)
      if (labs?.transaminases?.alt != null) findings.push(`ALT: ${labs.transaminases.alt} U/L.`)
      if (labs?.transaminases?.ast != null) findings.push(`AST: ${labs.transaminases.ast} U/L.`)
      return findings
    }

    const flowId = patientForReport.selectedFlowchart || 'dengue'
    const flowchart = getFlowchartById(flowId)
    const emergencyState = patientWithEmergencyState.emergencyState
    const flowchartState = patientForReport.flowchartState
    const selectedState = scoreFlowState(emergencyState) > scoreFlowState(flowchartState)
      ? emergencyState
      : flowchartState
    const answers = selectedState?.answers || {}
    const currentStep = selectedState?.currentStep || ''
    const history = selectedState?.history || []
    const currentGroup = selectedState?.group || patientForReport.flowchartState?.group
    const symptoms = uniqueItems(patientForReport.admission.symptoms)
    const vitalItems = buildVitalsList()
    const labItems = buildLabItems()
    const prescriptions = uniqueItems(
      patientForReport.treatment.prescriptions.map((item) => {
        const parts = [item.medication, item.dosage, item.frequency, item.duration].filter(Boolean)
        return parts.join(' - ')
      })
    )
    const observations = uniqueItems([
      patientForReport.generalObservations,
      ...(patientForReport.treatment.observations || [])
    ])

    if (flowId === 'tvp') {
      const startData = safeParse(answers.start) as { selectedLeg?: string; selectedLegLabel?: string } | null
      const clinicalData = safeParse(answers.avaliacao_clinica) as { sinaisEAchados?: string[]; outrosAchados?: string } | null
      const wellsData = safeParse(answers.wells_score) as {
        score?: number
        classificacao?: string
        criteriosSelecionados?: string[]
      } | null
      const contraData = safeParse(answers.checar_contra_anticoagulacao) as {
        contraindicacoesSelecionadas?: string[]
        possuiContraindicacaoAbsoluta?: boolean
        possuiContraindicacaoRelativa?: boolean
      } | null
      const treatmentData = safeParse(answers.tratamento_inicial) as {
        opcoesTerapeuticasSelecionadas?: string[]
        planoDuracaoSelecionado?: string
      } | null

      const selectedLegNarrative = startData?.selectedLeg === 'left'
        ? 'membro inferior esquerdo'
        : startData?.selectedLeg === 'right'
          ? 'membro inferior direito'
          : startData?.selectedLeg === 'other'
            ? 'outras localizações'
            : 'membro não especificado'

      const selectedClinicalFindings = Array.isArray(clinicalData?.sinaisEAchados) ? clinicalData.sinaisEAchados : []
      const classicSignsSet = new Set(TVP_CLASSIC_SIGNS)
      const physicalExamSet = new Set(TVP_PHYSICAL_EXAM_FINDINGS)
      const alertSignsSet = new Set(TVP_ALERT_SIGNS)

      const symptomItems = uniqueItems([
        ...symptoms,
        ...selectedClinicalFindings.filter((item) => classicSignsSet.has(item)),
        patient.admission.vitalSigns?.heartRate != null && patient.admission.vitalSigns.heartRate >= 100
          ? `Taquicardia documentada (FC ${patient.admission.vitalSigns.heartRate} bpm)`
          : null
      ])

      const physicalExamItems = uniqueItems([
        ...selectedClinicalFindings.filter((item) => physicalExamSet.has(item)),
        ...vitalItems,
        clinicalData?.outrosAchados
      ])

      const alertItems = uniqueItems(selectedClinicalFindings.filter((item) => alertSignsSet.has(item)))
      const wellsCriteria = uniqueItems(
        (wellsData?.criteriosSelecionados || []).map((item) => TVP_WELLS_CRITERIA_LABELS[item] || item)
      )
      const contraindications = uniqueItems(
        (contraData?.contraindicacoesSelecionadas || []).map((item) => TVP_CONTRAINDICATION_LABELS[item] || item)
      )
      const therapies = uniqueItems(
        (treatmentData?.opcoesTerapeuticasSelecionadas || []).map((item) => TVP_THERAPY_LABELS[item] || item)
      )

      const hasPositiveUS = answers.us_compressiva === 'us_positive' || answers.repetir_us === 'repeat_positive'
      const hasNegativeUS = answers.us_compressiva === 'us_negative' || answers.repetir_us === 'repeat_negative'
      const hasPositiveDdimer = answers.baixa_probabilidade === 'ddimer_positive'
      const hasNegativeDdimer = answers.baixa_probabilidade === 'ddimer_negative'
      const vascularEmergencyProtocolApplied = answers.tvp_urgencia_vascular_imediata === 'protocolo_flegmasia_aplicado'
        || history.includes('tvp_urgencia_vascular_imediata')
        || currentStep === 'tvp_urgencia_vascular_concluida'
      const isUrgentVascular = currentStep === 'tvp_urgencia_vascular_imediata'
        || currentStep === 'tvp_urgencia_vascular_concluida'
      const isMandatoryAdmissionInvestigation = currentStep === 'tvp_internacao_investigacao_clinica'
      const isTEPInvestigation = currentStep === 'tvp_internacao_investigar_tep'
      const isExcluded = currentStep === 'tvp_excluida' || currentStep === 'seguimento_ambulatorial'
      const isConfirmed = hasPositiveUS || currentStep === 'anticoagulacao_iniciada' || currentStep === 'encaminhamento_urgente'

      const title = isConfirmed
        ? 'PRONTUÁRIO MÉDICO – TROMBOSE VENOSA PROFUNDA (TVP)'
        : isExcluded
          ? 'PRONTUÁRIO MÉDICO – INVESTIGAÇÃO DE TROMBOSE VENOSA PROFUNDA (TVP)'
          : 'PRONTUÁRIO MÉDICO – SUSPEITA DE TROMBOSE VENOSA PROFUNDA (TVP)'

      const chiefComplaint = symptomItems.find((item) =>
        /dor|edema|panturrilha|coxa|membro/i.test(item)
      ) || `Suspeita clínica de trombose venosa profunda em ${selectedLegNarrative}.`

      const historyTextParts = [
        `Paciente admitido em ${formatDate(patient.admission.date)} para avaliação de quadro compatível com trombose venosa profunda em ${selectedLegNarrative}.`,
        symptomItems.length > 0
          ? `Durante a anamnese e a triagem, foram registrados os seguintes achados clínicos: ${symptomItems.join('; ')}.`
          : 'Durante a admissão, não houve descrição estruturada suficiente da história da doença atual.',
        observations.length > 0 ? `Observações adicionais registradas: ${observations.join('; ')}.` : '',
        alertItems.length > 0 ? `Também foram documentados sinais de alerta: ${alertItems.join('; ')}.` : ''
      ].filter(Boolean).join(' ')

      const evaluationItems = uniqueItems([
        wellsData?.score != null
          ? `Aplicado escore de Wells para TVP, com ${wellsData.score} ponto${wellsData.score === 1 ? '' : 's'} e probabilidade clínica ${String(wellsData.classificacao || 'indeterminada').toLowerCase()}.`
          : null,
        wellsCriteria.length > 0 ? `Critérios pontuados no escore de Wells: ${wellsCriteria.join('; ')}.` : null,
        isUrgentVascular
          ? 'Presença de sinal de gravidade com indicação de urgência vascular e internação imediata.'
          : isTEPInvestigation
            ? 'Presença de sintomas respiratórios associados, com necessidade de internação e investigação imediata de possível tromboembolismo pulmonar.'
            : isMandatoryAdmissionInvestigation
              ? 'Presença de situação clínica de alto risco, com necessidade de internação mandatória e aprofundamento da investigação.'
              : isConfirmed
                ? 'Quadro compatível com TVP confirmada durante a investigação.'
                : isExcluded
                  ? 'Investigação sem evidência final de TVP no fluxo assistencial.'
                  : 'Mantida suspeita clínica de TVP, em investigação conforme protocolo institucional.'
      ])

      const complementaryExamItems = uniqueItems([
        hasNegativeDdimer ? 'D-dímero: negativo.' : null,
        hasPositiveDdimer ? 'D-dímero: positivo.' : null,
        answers.moderada_probabilidade ? 'D-dímero não utilizado nesta etapa, devido à probabilidade clínica moderada/alta.' : null,
        hasPositiveUS ? 'Ultrassonografia Doppler venosa: positiva para trombose venosa profunda.' : null,
        hasNegativeUS ? 'Ultrassonografia Doppler venosa: sem evidência de trombose venosa profunda.' : null,
        answers.us_negativa_conduta === 'high_suspicion' ? 'Mantida suspeita clínica após ultrassonografia inicial negativa, com indicação de repetição do exame em 5 a 7 dias.' : null,
        ...labItems
      ])

      const conductItems = uniqueItems([
        contraData?.possuiContraindicacaoAbsoluta
          ? `Identificadas contraindicações absolutas à anticoagulação: ${contraindications.join('; ')}.`
          : null,
        !contraData?.possuiContraindicacaoAbsoluta && contraData?.possuiContraindicacaoRelativa
          ? `Identificadas contraindicações relativas à anticoagulação: ${contraindications.join('; ')}.`
          : null,
        contraData && !contraData?.possuiContraindicacaoAbsoluta && !contraData?.possuiContraindicacaoRelativa
          ? 'Contraindicações para anticoagulação avaliadas e não identificadas.'
          : null,
        therapies.length === 1 ? `Optado por anticoagulação com ${therapies[0]}.` : null,
        therapies.length > 1 ? `Opções terapêuticas selecionadas: ${therapies.join('; ')}.` : null,
        currentStep === 'anticoagulacao_iniciada' ? 'Paciente anticoagulado.' : null,
        currentStep === 'encaminhamento_urgente' ? 'Solicitada avaliação da Cirurgia Vascular.' : null,
        isUrgentVascular ? 'Indicação de internação hospitalar imediata e acionamento urgente da Cirurgia Vascular.' : null,
        vascularEmergencyProtocolApplied ? 'Protocolo de Flegmasia Cerulea Dolens/ameaça ao membro confirmado no fluxo antes da finalização.' : null,
        isMandatoryAdmissionInvestigation ? 'Indicada internação hospitalar mandatória para aprofundamento e seguimento da investigação clínica.' : null,
        isTEPInvestigation ? 'Indicada internação hospitalar mandatória com investigação imediata de possível tromboembolismo pulmonar.' : null,
        prescriptions.length > 0 ? `Prescrições registradas no sistema: ${prescriptions.join('; ')}.` : null
      ])

      const vascularEmergencyItems = isUrgentVascular
        ? [
            'Realizar ABCDE, monitorização cardíaca contínua, ECG, pressão arterial e frequência respiratória seriadas e oximetria.',
            'Obter dois acessos venosos calibrosos, idealmente 18G ou maior, considerando acesso central conforme necessidade clínica.',
            'Solicitar hemograma, coagulograma, TP, TTPA, fibrinogênio, função renal, eletrólitos, lactato, gasometria e CK.',
            'Solicitar ultrassom Doppler urgente para definir extensão da TVP e comprometimento iliofemoral; se indisponível ou insuficiente, considerar angio-TC venosa ou TC contrastada.',
            'Na ausência de contraindicações, iniciar heparina não fracionada IV, preferida no quadro grave pela reversibilidade e facilidade para intervenção: bolus 80 UI/kg seguido de 18 UI/kg/h, com ajuste pelo TTPA e protocolo institucional.',
            'Considerar SF 0,9% 250-500 mL com reavaliação, evitando sobrecarga em insuficiência cardíaca, doença renal crônica ou hipoxemia.',
            'Instituir analgesia conforme intensidade e manter o membro elevado em 30-45 graus, acima do nível do coração.',
            'Não realizar massagem, compressão agressiva ou deambulação precoce antes da avaliação especializada.',
            'Acionar avaliação presencial imediata da Cirurgia Vascular. Considerar trombólise dirigida por cateter, trombectomia mecânica ou fasciotomia conforme extensão, risco hemorrágico, ameaça ao membro e síndrome compartimental.',
            'Considerar UTI se instabilidade hemodinâmica, TEP associado, dor refratária, necessidade de heparina IV com monitorização intensiva, trombólise, síndrome compartimental, lactato elevado ou disfunção renal.'
          ]
        : []

      const planItems = uniqueItems([
        treatmentData?.planoDuracaoSelecionado
          ? TVP_DURATION_PLAN_LABELS[treatmentData.planoDuracaoSelecionado] || treatmentData.planoDuracaoSelecionado
          : null,
        patient.treatment.nextEvaluation
          ? `Reavaliação programada para ${formatDateOnly(patient.treatment.nextEvaluation)}.`
          : 'Reavaliação clínica conforme evolução e protocolo institucional.',
        isTEPInvestigation ? 'Prosseguir com protocolo institucional para investigação de TEP conforme estabilidade clínica e recursos disponíveis.' : null,
        'Orientado retorno imediato em caso de piora da dor, aumento do edema, dispneia, dor torácica, síncope ou sinais de sangramento.',
        therapies.length > 0 ? 'Monitorização clínica e laboratorial conforme necessidade e esquema anticoagulante adotado.' : null
      ])

      return {
        title,
        sections: [
          {
            title: 'Identificação do Paciente',
            text: `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${formatGender(patient.gender)}, peso ${formatWeight(patient.weight)}, prontuário nº ${patient.medicalRecord || 'não informado'}.`
          },
          {
            title: 'Queixa Principal',
            text: symptomItems.length > 0
              ? chiefComplaint
              : `Suspeita clínica de trombose venosa profunda em ${selectedLegNarrative}.`
          },
          {
            title: 'História da Doença Atual',
            text: historyTextParts
          },
          {
            title: 'Sinais e Sintomas',
            items: symptomItems.length > 0 ? symptomItems : ['Sem sinais e sintomas estruturados registrados no fluxo.']
          },
          {
            title: 'Exame Físico',
            items: physicalExamItems.length > 0 ? physicalExamItems : ['Sem descrição estruturada de exame físico no fluxo.']
          },
          {
            title: 'Avaliação Clínica',
            items: evaluationItems
          },
          {
            title: 'Exames Complementares',
            items: complementaryExamItems.length > 0 ? complementaryExamItems : ['Sem exames complementares registrados no fluxo.']
          },
          {
            title: 'Conduta',
            items: conductItems.length > 0 ? conductItems : ['Conduta ainda não registrada de forma estruturada no sistema.']
          },
          ...(vascularEmergencyItems.length > 0
            ? [{
                title: 'Protocolo de Urgência Vascular / Flegmasia',
                items: vascularEmergencyItems
              }]
            : []),
          {
            title: 'Plano / Acompanhamento',
            items: planItems
          }
        ]
      }
    }

    if (flowId === 'anafilaxia') {
      const criteriaData = safeParse(answers.ana_criterios_wao) as {
        criteriosSelecionados?: string[]
        diagnosticoProvavel?: boolean
      } | null
      const adjunctData = safeParse(answers.ana_tratamento_adjunto) as {
        tratamentosAdjuntosSelecionados?: string[]
      } | null

      const selectedCriteria = uniqueItems(
        (Array.isArray(criteriaData?.criteriosSelecionados) ? criteriaData.criteriosSelecionados : [])
          .map((item) => ANAPHYLAXIS_DIAGNOSTIC_CRITERIA_LABELS[item] || item)
      )
      const selectedAdjuncts = uniqueItems(
        (Array.isArray(adjunctData?.tratamentosAdjuntosSelecionados) ? adjunctData.tratamentosAdjuntosSelecionados : [])
          .map((item) => ANAPHYLAXIS_ADJUNCT_CARDS[item as keyof typeof ANAPHYLAXIS_ADJUNCT_CARDS]?.title || item)
      )
      const responseValue = answers.ana_reavaliacao_5_10 || ''
      const responseText = ANAPHYLAXIS_RESPONSE_LABELS[responseValue] || 'resposta clínica ainda não registrada no fluxo'
      const adrenalineDose = calculateAnaphylaxisAdrenalineDose(patient)
      const doseMg = String(adrenalineDose.doseMg).replace('.', ',')
      const anaphylaxisPrescriptions = uniqueItems(
        patient.treatment.prescriptions
          .filter((item) => item.prescribedBy === 'Fluxograma Anafilaxia')
          .map((item) => [item.medication, item.dosage, item.frequency, item.duration].filter(Boolean).join(' - '))
      )

      const confirmedAnaphylaxis = Boolean(criteriaData?.diagnosticoProvavel || selectedCriteria.length > 0)
      const criticalOutcome = currentStep === 'ana_repetir_adrenalina_internacao' || currentStep === 'ana_internacao_via_aerea_choque'
      const adequateResponse = currentStep === 'ana_observacao_alta' || responseValue === 'resposta'
      const noCriteria = currentStep === 'ana_sem_criterios_observar'

      const historyText = [
        `Paciente admitido em ${formatDate(patient.admission.date)} com quadro clínico suspeito de anafilaxia.`,
        symptoms.length > 0 ? `Sintomas registrados na admissão: ${symptoms.join('; ')}.` : null,
        observations.length > 0 ? `Observações clínicas adicionais: ${observations.join('; ')}.` : null
      ].filter(Boolean).join(' ')

      const diagnosticText = noCriteria
        ? 'Verificados os critérios clínicos diagnósticos, sem preenchimento de critério de anafilaxia no momento. Mantida observação clínica e orientação de reavaliação se houver progressão dos sintomas.'
        : confirmedAnaphylaxis
          ? `Verificados os critérios clínicos diagnósticos e confirmado quadro de anafilaxia, pois o paciente apresentava critério diagnóstico selecionado${selectedCriteria.length > 0 ? `: ${selectedCriteria.join('; ')}` : ''}.`
          : 'Critérios diagnósticos de anafilaxia ainda não foram registrados de forma estruturada no fluxo.'

      const initialManagementItems = noCriteria
        ? ['Mantida observação clínica, revisão da exposição e orientação de retorno imediato se surgirem sintomas respiratórios, circulatórios, laríngeos ou gastrointestinais graves.']
        : uniqueItems([
          'Paciente encaminhado imediatamente para a Sala de Emergência.',
          `Aplicada a medicação adrenalina (1:1000 = 1 mg/mL) ${doseMg} mg IM, conforme protocolo institucional.`,
          'Realizado o ABCDE primário e colocado o paciente em posição de Trendelenburg quando indicado.',
          'Solicitada monitorização contínua (cardíaca + oximetria) e acesso venoso periférico imediato.'
        ])

      const adjunctItems = noCriteria
        ? ['Tratamento adjunto não indicado no fluxo por ausência de critérios de anafilaxia no momento.']
        : uniqueItems([
          selectedAdjuncts.length > 0
            ? `Após as medidas iniciais, verificou-se necessidade de tratamento adjunto devido à presença dos seguintes sinais: ${selectedAdjuncts.join('; ')}.`
            : 'Após as medidas iniciais, não foram registrados sinais específicos para tratamento adjunto no fluxo.',
          anaphylaxisPrescriptions.length > 0
            ? `Sendo prescrita a medicação: ${anaphylaxisPrescriptions.join('; ')}.`
            : 'Sendo prescrita a medicação: __________________________ (campo livre para prescrição médica).'
        ])

      const reevaluationItems = noCriteria
        ? ['Paciente mantido em observação clínica, com orientação de reavaliação se houver progressão de sintomas.']
        : uniqueItems([
          `Paciente reavaliado e apresentava: ${responseText}.`,
          adequateResponse ? 'Realizada observação por 4 horas após estabilização clínica.' : null,
          responseValue === 'sem_resposta' ? 'Devido à ausência de melhora, indicada repetição de adrenalina IM e preparo para internação/suporte avançado.' : null,
          responseValue === 'critico' ? 'Devido a via aérea/choque crítico, indicado manejo avançado imediato e internação.' : null,
          criticalOutcome ? 'Paciente não deve ser considerado para liberação ambulatorial nesta etapa do fluxo.' : null
        ])

      const dischargeItems = adequateResponse
        ? uniqueItems([
          'Prescritas orientações/prescrições pós-alta.',
          ...ANAPHYLAXIS_HOME_ORIENTATIONS,
          anaphylaxisPrescriptions.length > 0 ? `Sugestões de prescrição pós-alta registradas: ${anaphylaxisPrescriptions.join('; ')}.` : null
        ])
        : uniqueItems([
          criticalOutcome
            ? 'Sem indicação de alta nesta etapa; manter internação, monitorização e suporte conforme evolução clínica.'
            : 'Orientações pós-alta ficam condicionadas à estabilização clínica e observação adequada.',
          ...ANAPHYLAXIS_HOME_ORIENTATIONS
        ])

      return {
        title: 'PRONTUÁRIO MÉDICO – EVOLUÇÃO CLÍNICA DE ANAFILAXIA',
        sections: [
          {
            title: 'Identificação do Paciente',
            text: `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${formatGender(patient.gender)}, peso ${formatWeight(patient.weight)}, prontuário nº ${patient.medicalRecord || 'não informado'}.`
          },
          {
            title: 'História Clínica',
            text: historyText
          },
          {
            title: 'Critérios Diagnósticos',
            text: diagnosticText
          },
          {
            title: 'Medidas Iniciais',
            items: initialManagementItems
          },
          {
            title: 'Tratamento Adjunto e Prescrição',
            items: adjunctItems
          },
          {
            title: 'Reavaliação Clínica',
            items: reevaluationItems
          },
          {
            title: 'Observação e Orientações Pós-Alta',
            items: dischargeItems
          },
          {
            title: 'Sinais Vitais / Exame Físico',
            items: vitalItems.length > 0 ? vitalItems : ['Sem sinais vitais estruturados registrados no sistema.']
          }
        ]
      }
    }

    if (flowId === 'dengue') {
      const readLocalArray = (key: string) => {
        if (typeof window === 'undefined') return [] as string[]
        try {
          const raw = localStorage.getItem(key)
          if (!raw) return []
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }
      const readLocalObject = <T,>(key: string): T | null => {
        if (typeof window === 'undefined') return null
        try {
          const raw = localStorage.getItem(key)
          if (!raw) return null
          return JSON.parse(raw) as T
        } catch {
          return null
        }
      }
      const readLocalString = (key: string) => {
        if (typeof window === 'undefined') return ''
        return localStorage.getItem(key) || ''
      }
      const readLocalNumber = (key: string) => {
        const raw = readLocalString(key).replace(',', '.')
        const value = Number(raw)
        return Number.isFinite(value) ? value : undefined
      }

      const alarmData = safeParse(answers.alarm_check) as { grupoC?: string[]; grupoD?: string[] } | null
      const riskFactors = readLocalArray(`risk_factors_${patient.id}`)
      const suggestedExamsB = readLocalArray(`suggested_exams_b_${patient.id}`)
      const recommendedExamsC = readLocalArray(`recommended_exams_c_${patient.id}`)
      const otherExamsC = readLocalArray(`other_exams_c_${patient.id}`)
      const recommendedExamsD = readLocalArray(`recommended_exams_d_${patient.id}`)
      const otherExamsD = readLocalArray(`other_exams_d_${patient.id}`)
      const notificationNumber = answers.dengue_notification_number
        || (typeof window !== 'undefined' ? localStorage.getItem(`dengue_notification_number_${patient.id}`) || '' : '')
      const notificationAcknowledged = (answers.dengue_notification_ack || '') === 'true'
        || (typeof window !== 'undefined' && localStorage.getItem(`dengue_notification_ack_${patient.id}`) === 'true')

      const hb = patient.labResults?.hemoglobin
      const ht = patient.labResults?.hematocrit
      const htHbRatio = hb != null && ht != null && hb > 0 ? ht / hb : undefined

      const alarmSigns = uniqueItems((alarmData?.grupoC || []).map(item => DENGUE_ALARM_SIGN_LABELS[item] || item))
      const gravitySigns = uniqueItems((alarmData?.grupoD || []).map(item => DENGUE_GRAVITY_SIGN_LABELS[item] || item))
      const suggestedExamTexts = uniqueItems(suggestedExamsB.map(item => DENGUE_SUGGESTED_EXAMS_B_LABELS[item] || item))
      const recommendedExamTextsC = uniqueItems(recommendedExamsC.map(item => DENGUE_RECOMMENDED_EXAMS_LABELS[item] || item))
      const otherExamTextsC = uniqueItems(otherExamsC.map(item => DENGUE_OTHER_EXAMS_LABELS[item] || item))
      const recommendedExamTextsD = uniqueItems(recommendedExamsD.map(item => DENGUE_RECOMMENDED_EXAMS_LABELS[item] || item))
      const otherExamTextsD = uniqueItems(otherExamsD.map(item => DENGUE_OTHER_EXAMS_LABELS[item] || item))
      const dengueGroup = currentGroup as 'A' | 'B' | 'C' | 'D' | undefined
      const shockDecisionItems = uniqueItems(readLocalArray(`shock_decisions_${patient.id}`))
      const dIntervalChoice = typeof window !== 'undefined' ? localStorage.getItem(`d_interval_choice_${patient.id}`) || '' : ''
      const dReevaluationItems = uniqueItems(Array.from({ length: 8 }, (_, index) => {
        const tab = index + 1
        const data = readLocalObject<{
          vitals?: { bp?: string; hr?: number; rr?: number; spo2?: number; temp?: number }
          diuresis?: number
          labs?: { hb?: number; ht?: number; plt?: number; alb?: number; alt?: number; ast?: number }
        }>(`d_tab_${tab}_data_${patient.id}`)
        if (!data) return null

        const vitals = uniqueItems([
          data.vitals?.bp ? `PA ${data.vitals.bp} mmHg` : null,
          data.vitals?.hr != null ? `FC ${data.vitals.hr} bpm` : null,
          data.vitals?.rr != null ? `FR ${data.vitals.rr} irpm` : null,
          data.vitals?.spo2 != null ? `SpO2 ${data.vitals.spo2}%` : null,
          data.vitals?.temp != null ? `temperatura ${data.vitals.temp} °C` : null
        ])
        const labs = uniqueItems([
          data.labs?.hb != null ? `Hb ${data.labs.hb} g/dL` : null,
          data.labs?.ht != null ? `Ht ${data.labs.ht}%` : null,
          data.labs?.plt != null ? `plaquetas ${data.labs.plt.toLocaleString('pt-BR')}/mm³` : null,
          data.labs?.alb != null ? `albumina ${data.labs.alb} g/dL` : null,
          data.labs?.alt != null ? `ALT ${data.labs.alt} U/L` : null,
          data.labs?.ast != null ? `AST ${data.labs.ast} U/L` : null
        ])
        const parts = uniqueItems([
          vitals.length > 0 ? `sinais vitais: ${vitals.join(', ')}` : null,
          data.diuresis != null ? `diurese ${data.diuresis} mL/h` : null,
          labs.length > 0 ? `exames: ${labs.join(', ')}` : null
        ])
        return parts.length > 0 ? `${tab}ª reavaliação em UTI - ${parts.join('; ')}.` : null
      }))

      const hasLabDrivenGroupC = dengueGroup === 'C'
        && history.includes('evaluate_labs_b')
        && alarmSigns.length === 0
        && gravitySigns.length === 0

      const chiefComplaint = symptoms.length > 0
        ? symptoms[0]
        : 'Febre aguda com suspeita clínica de dengue.'

      if (dengueGroup === 'D') {
        const admissionDate = patient.admission.date ? formatDateOnly(patient.admission.date) : '__/__/____'
        const dischargeDate = patient.treatment.dischargeDate
          ? formatDateOnly(patient.treatment.dischargeDate)
          : formatDateOnly(new Date())
        const selectedExamsD = uniqueItems([...recommendedExamTextsD, ...otherExamTextsD])
        const relevantExamItems = uniqueItems([
          ...labItems,
          selectedExamsD.length > 0 ? `Exames assinalados no fluxo do Grupo D: ${selectedExamsD.join('; ')}.` : null,
          dReevaluationItems.length > 0 ? `Reavaliações documentadas: ${dReevaluationItems.join(' ')}` : null
        ])
        const treatmentDetails = uniqueItems([
          prescriptions.length > 0 ? `Prescrições/medicações registradas: ${prescriptions.join('; ')}.` : null,
          shockDecisionItems.length > 0 ? `Decisões clínicas registradas no manejo de choque/hemorragia/coagulopatia: ${shockDecisionItems.join('; ')}.` : null,
          dIntervalChoice ? `Intervalo de reavaliação em UTI registrado: ${dIntervalChoice === 'after_expansion' ? 'após cada expansão volêmica, conforme definição da equipe' : dIntervalChoice}.` : null
        ])
        const admissionContext = uniqueItems([
          symptoms.length > 0 ? `Sintomas registrados na admissão: ${symptoms.join('; ')}.` : null,
          alarmSigns.length > 0 ? `Sinais de alarme assinalados: ${alarmSigns.join('; ')}.` : null,
          gravitySigns.length > 0 ? `Critérios de gravidade assinalados: ${gravitySigns.join('; ')}.` : null,
          vitalItems.length > 0 ? `Sinais vitais iniciais: ${vitalItems.join('; ')}.` : null,
          observations.length > 0 ? `Observações registradas: ${observations.join('; ')}.` : null,
          notificationNumber ? `Notificação compulsória registrada sob o número ${notificationNumber}.` : null
        ])

        return {
          title: 'RESUMO DE ALTA HOSPITALAR',
          sections: [
            {
              title: 'Diagnóstico principal',
              text: 'Dengue grave (Grupo D), resolvida.'
            },
            {
              title: 'Datas',
              text: `Data da internação: ${admissionDate}\nData da alta: ${dischargeDate}`
            },
            {
              title: 'História da internação',
              text: [
                'Paciente admitido com quadro clínico compatível com dengue, apresentando inicialmente sinais de alarme, sendo internado para monitorização clínica e tratamento conforme protocolo institucional.',
                'Durante a evolução hospitalar apresentou agravamento clínico, com desenvolvimento de critérios de dengue grave, necessitando internação em Unidade de Terapia Intensiva para monitorização contínua e suporte clínico especializado.',
                admissionContext.length > 0 ? `Dados registrados no sistema: ${admissionContext.join(' ')}` : null
              ].filter(Boolean).join('\n\n')
            },
            {
              title: 'Tratamento realizado',
              text: [
                'Durante a permanência na UTI recebeu tratamento de suporte intensivo, monitorização hemodinâmica contínua, reposição volêmica guiada por parâmetros clínicos e laboratoriais, acompanhamento multiprofissional e realização de exames seriados para avaliação evolutiva.',
                treatmentDetails.length > 0 ? treatmentDetails.join(' ') : null,
                relevantExamItems.length > 0 ? `Exames e controles registrados: ${relevantExamItems.join(' ')}` : null,
                'Após estabilização clínica, apresentou melhora progressiva do estado geral, recuperação hemodinâmica, normalização dos parâmetros laboratoriais e resolução dos sinais de gravidade, possibilitando transferência para unidade de internação convencional.'
              ].filter(Boolean).join('\n\n')
            },
            {
              title: 'Evolução',
              text: 'Paciente evoluiu de forma favorável, sem novas intercorrências após a saída da UTI. Manteve estabilidade clínica, aceitação adequada de dieta, hidratação satisfatória, diurese preservada e melhora progressiva dos exames laboratoriais de controle.'
            },
            {
              title: 'Condição na alta',
              text: 'Paciente em bom estado geral, consciente, orientado, afebril, hemodinamicamente estável, eupneico em ar ambiente, sem sinais de alarme ou critérios atuais de gravidade, apresentando condições clínicas adequadas para alta hospitalar.'
            },
            {
              title: 'Orientações',
              items: [
                'Manter hidratação oral adequada.',
                'Repouso relativo nos próximos dias.',
                'Retorno ambulatorial conforme agendamento.',
                'Procurar imediatamente atendimento médico em caso de sangramentos, vômitos persistentes, dor abdominal intensa, tonturas, síncope, dispneia ou qualquer sinal de piora clínica.'
              ]
            },
            {
              title: 'Alta hospitalar',
              text: 'Paciente recebe alta após recuperação clínica satisfatória de quadro de dengue grave, sem necessidade de suporte intensivo adicional.'
            },
            {
              title: 'Médico responsável',
              text: doctorSignatureText
            }
          ]
        }
      }

      if (dengueGroup === 'C') {
        const admissionDate = patient.admission.date ? formatDateOnly(patient.admission.date) : '__/__/____'
        const dischargeDate = patient.treatment.dischargeDate
          ? formatDateOnly(patient.treatment.dischargeDate)
          : formatDateOnly(new Date())
        const cHb = patient.labResults?.hemoglobin ?? readLocalNumber(`lab_hemoglobin_${patient.id}`)
        const cHt = patient.labResults?.hematocrit ?? readLocalNumber(`lab_hematocrit_${patient.id}`)
        const cPlatelets = patient.labResults?.platelets ?? readLocalNumber(`lab_platelets_${patient.id}`)
        const selectedExamsC = uniqueItems([...recommendedExamTextsC, ...otherExamTextsC])
        const cReevaluationItems = uniqueItems([
          (() => {
            const vitals = uniqueItems([
              readLocalString(`vitals_c_1h_bp_${patient.id}`) ? `PA ${readLocalString(`vitals_c_1h_bp_${patient.id}`)} mmHg` : null,
              readLocalNumber(`vitals_c_1h_hr_${patient.id}`) != null ? `FC ${readLocalNumber(`vitals_c_1h_hr_${patient.id}`)} bpm` : null,
              readLocalNumber(`vitals_c_1h_rr_${patient.id}`) != null ? `FR ${readLocalNumber(`vitals_c_1h_rr_${patient.id}`)} irpm` : null,
              readLocalNumber(`vitals_c_1h_spo2_${patient.id}`) != null ? `SpO2 ${readLocalNumber(`vitals_c_1h_spo2_${patient.id}`)}%` : null,
              readLocalNumber(`vitals_c_1h_temp_${patient.id}`) != null ? `temperatura ${readLocalNumber(`vitals_c_1h_temp_${patient.id}`)} °C` : null,
              readLocalNumber(`diuresis_c_1h_${patient.id}`) != null ? `diurese ${readLocalNumber(`diuresis_c_1h_${patient.id}`)} mL/h` : null
            ])
            return vitals.length > 0 ? `1ª reavaliação: ${vitals.join(', ')}.` : null
          })(),
          (() => {
            const vitals = uniqueItems([
              readLocalString(`vitals_c_2h_bp_${patient.id}`) ? `PA ${readLocalString(`vitals_c_2h_bp_${patient.id}`)} mmHg` : null,
              readLocalNumber(`vitals_c_2h_hr_${patient.id}`) != null ? `FC ${readLocalNumber(`vitals_c_2h_hr_${patient.id}`)} bpm` : null,
              readLocalNumber(`vitals_c_2h_rr_${patient.id}`) != null ? `FR ${readLocalNumber(`vitals_c_2h_rr_${patient.id}`)} irpm` : null,
              readLocalNumber(`vitals_c_2h_spo2_${patient.id}`) != null ? `SpO2 ${readLocalNumber(`vitals_c_2h_spo2_${patient.id}`)}%` : null,
              readLocalNumber(`vitals_c_2h_temp_${patient.id}`) != null ? `temperatura ${readLocalNumber(`vitals_c_2h_temp_${patient.id}`)} °C` : null,
              readLocalNumber(`diuresis_c_2h_${patient.id}`) != null ? `diurese ${readLocalNumber(`diuresis_c_2h_${patient.id}`)} mL/h` : null
            ])
            return vitals.length > 0 ? `2ª reavaliação: ${vitals.join(', ')}.` : null
          })()
        ])
        const cAdmissionFindings = uniqueItems([
          hasLabDrivenGroupC
            ? `aumento progressivo do hematócrito/hemoconcentração${htHbRatio != null ? ` (razão Ht/Hb ${htHbRatio.toFixed(2)}x)` : ''}`
            : null,
          ...alarmSigns
        ])
        const cAdmissionReason = cAdmissionFindings.length > 0
          ? cAdmissionFindings.join('; ')
          : uniqueItems([
              vitalItems.length > 0 ? `alterações clínicas e sinais vitais registrados na admissão (${vitalItems.join('; ')})` : null,
              symptoms.length > 0 ? `quadro sintomático compatível com dengue (${symptoms.join('; ')})` : null,
              'critérios clínicos de alarme registrados no atendimento'
            ]).join('; ')
        const relevantExamText = uniqueItems([
          cHb != null ? `Hemoglobina: ${cHb} g/dL.` : null,
          cHt != null ? `Hematócrito: ${cHt}%.` : null,
          cPlatelets != null ? `Plaquetas: ${cPlatelets.toLocaleString('pt-BR')}/mm³.` : null,
          selectedExamsC.length > 0 ? `Exames assinalados no fluxo: ${selectedExamsC.join('; ')}.` : null,
          cReevaluationItems.length > 0 ? `Controles evolutivos registrados: ${cReevaluationItems.join(' ')}` : null,
          observations.length > 0 ? `Observações em prontuário: ${observations.join('; ')}.` : null
        ])

        return {
          title: 'RESUMO DE ALTA HOSPITALAR',
          sections: [
            {
              title: 'Diagnóstico principal',
              text: 'Dengue com sinais de alarme (Grupo C conforme protocolo do Ministério da Saúde).'
            },
            {
              title: 'Datas',
              text: `Data da internação: ${admissionDate}\nData da alta: ${dischargeDate}`
            },
            {
              title: 'Motivo da internação',
              text: `Paciente admitido com quadro clínico compatível com dengue, apresentando sinais de alarme caracterizados por ${cAdmissionReason}, sendo classificado como Grupo C e indicado para internação hospitalar para monitorização clínica e hidratação venosa.`
            },
            {
              title: 'Exames relevantes na admissão',
              text: relevantExamText.length > 0
                ? relevantExamText.join(' ')
                : 'Hemograma e demais exames complementares conforme descrito em prontuário, sem dados laboratoriais estruturados disponíveis no sistema.'
            },
            {
              title: 'Tratamento realizado',
              text: [
                'Paciente submetido a hidratação venosa conforme protocolo institucional para dengue com sinais de alarme, monitorização clínica seriada, controle de sinais vitais, acompanhamento laboratorial com hemogramas seriados e tratamento sintomático conforme necessidade.',
                prescriptions.length > 0 ? `Medicações/prescrições registradas: ${prescriptions.join('; ')}.` : null
              ].filter(Boolean).join('\n\n')
            },
            {
              title: 'Evolução hospitalar',
              text: 'Apresentou evolução clínica favorável durante a internação, com melhora progressiva do estado geral, estabilização hemodinâmica, resolução dos sinais de alarme, adequada aceitação de dieta e hidratação por via oral. Houve melhora dos parâmetros laboratoriais e ausência de critérios para progressão para dengue grave (Grupo D). Não houve necessidade de suporte em unidade de terapia intensiva, drogas vasoativas, ventilação mecânica ou transfusão de hemocomponentes.'
            },
            {
              title: 'Condição na alta',
              text: 'Paciente em bom estado geral, consciente, orientado, afebril, hemodinamicamente estável, com diurese preservada, tolerando dieta por via oral e sem sinais clínicos de alarme ou de gravidade.'
            },
            {
              title: 'Orientações na alta',
              items: [
                'Manter hidratação oral vigorosa.',
                'Realizar repouso relativo.',
                'Utilizar medicações sintomáticas conforme prescrição médica.',
                'Retornar imediatamente ao serviço de emergência em caso de dor abdominal intensa, vômitos persistentes, sangramentos, tonturas, síncope, dificuldade respiratória, redução da diurese ou qualquer sinal de piora clínica.',
                'Manter acompanhamento ambulatorial conforme orientação médica.'
              ]
            },
            {
              title: 'Médico responsável',
              text: doctorSignatureText
            }
          ]
        }
      }

      const groupNarrative = (() => {
        switch (dengueGroup) {
          case 'A':
            return 'Classificado como Grupo A, compatível com dengue sem sinais de alarme, sem comorbidades ou condições especiais descompensadoras no fluxo atual.'
          case 'B':
            return `Classificado como Grupo B, pela presença de fatores de risco/condições associadas${riskFactors.length > 0 ? `: ${riskFactors.join('; ')}` : ''}.`
          default:
            return 'Caso em avaliação clínica dentro do protocolo institucional de dengue.'
        }
      })()

      const historyNarrative = [
        `Paciente admitido em ${formatDate(patient.admission.date)} para avaliação de quadro suspeito de dengue.`,
        symptoms.length > 0
          ? `Na admissão, apresentava ${symptoms.join('; ')}.`
          : 'Não há descrição estruturada suficiente dos sintomas na admissão.',
        notificationNumber
          ? `Notificação compulsória registrada sob o número ${notificationNumber}.`
          : notificationAcknowledged
            ? 'Notificação compulsória assinalada como realizada no fluxo assistencial.'
            : 'Notificação compulsória ainda não documentada no sistema.',
        observations.length > 0 ? `Observações adicionais registradas durante o atendimento: ${observations.join('; ')}.` : null
      ].filter(Boolean).join(' ')

      const examNarrativeParts = uniqueItems([
        ...labItems,
        dengueGroup === 'B' && suggestedExamTexts.length > 0
          ? `Exames complementares sugeridos/assinalados para o Grupo B: ${suggestedExamTexts.join('; ')}.`
          : null,
      ])

      const conductNarrative = uniqueItems([
        groupNarrative,
        prescriptions.length > 0 ? `Foram registradas as seguintes prescrições no sistema: ${prescriptions.join('; ')}.` : null,
        dengueGroup === 'A'
          ? 'Orientado tratamento ambulatorial com hidratação oral, antitérmico conforme prescrição e vigilância de sinais de alarme.'
          : null,
        dengueGroup === 'B'
          ? 'Mantida observação clínica até resultado dos exames, com hidratação oral e reavaliação seriada.'
          : null,
      ])

      const planNarrative = uniqueItems([
        dengueGroup === 'A'
          ? 'Orientado retorno imediato se surgirem sinais de alarme ou piora clínica, retorno no dia da melhora da febre pela possibilidade de fase crítica e retorno no 5º dia da doença se não houver defervescência.'
          : null,
        dengueGroup === 'B'
          ? 'Programado retorno diário para reavaliação clínica e laboratorial, mantendo seguimento até 48 horas após a remissão da febre.'
          : null,
        'Entregue ou orientada a entrega do cartão de acompanhamento da dengue.'
      ])

      return {
        title: 'PRONTUÁRIO MÉDICO – DENGUE',
        sections: [
          {
            title: 'Identificação do Paciente',
            text: `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${formatGender(patient.gender)}, peso ${formatWeight(patient.weight)}, prontuário nº ${patient.medicalRecord || 'não informado'}.`
          },
          {
            title: 'Diagnóstico e Classificação',
            text: `${groupNarrative} ${notificationNumber ? `Notificação compulsória registrada sob o número ${notificationNumber}.` : ''}`.trim()
          },
          {
            title: 'Queixa Principal',
            text: chiefComplaint
          },
          {
            title: 'História Clínica e Evolução',
            text: historyNarrative
          },
          {
            title: 'Exames Relevantes',
            text: examNarrativeParts.length > 0
              ? examNarrativeParts.join(' ')
              : 'Até o momento, não há exames complementares estruturados registrados no sistema.'
          },
          {
            title: 'Condutas Terapêuticas',
            text: conductNarrative.join(' ')
          },
          {
            title: 'Plano e Orientações',
            text: planNarrative.join(' ')
          }
        ]
      }
    }

    if (flowId === 'influenza') {
      const severityData = safeParse(answers.influenza_sinais_gravidade) as {
        sinaisGravidadeSelecionados?: string[]
        classificadoComoSRAG?: boolean
      } | null
      const riskData = safeParse(answers.influenza_fatores_risco) as {
        fatoresRiscoSelecionados?: string[]
        sinaisPioraSelecionados?: string[]
        indicarOseltamivir?: boolean
      } | null
      const icuData = safeParse(answers.influenza_criterios_uti) as {
        criteriosUTISelecionados?: string[]
        indicarUTI?: boolean
      } | null
      const influenzaPhysicalExamAnswer = safeParse(answers.influenza_exame_fisico) as {
        sinaisVitais?: {
          temperature?: number
          feverDays?: number
          bloodPressure?: string
          heartRate?: number
          respiratoryRate?: number
          oxygenSaturation?: number
          glucose?: string
        }
        exameFisico?: PhysicalExamData
      } | null
      const influenzaPhysicalExam = influenzaPhysicalExamAnswer?.exameFisico
      const influenzaFlowVitalItems = (() => {
        const vitalSigns = influenzaPhysicalExamAnswer?.sinaisVitais
        if (!vitalSigns) return [] as string[]
        return uniqueItems([
          vitalSigns.temperature != null ? `Temperatura: ${vitalSigns.temperature} °C` : null,
          vitalSigns.feverDays != null ? `Tempo de febre: ${vitalSigns.feverDays} dia(s)` : null,
          vitalSigns.heartRate != null ? `Frequência cardíaca: ${vitalSigns.heartRate} bpm` : null,
          vitalSigns.respiratoryRate != null ? `Frequência respiratória: ${vitalSigns.respiratoryRate} irpm` : null,
          vitalSigns.bloodPressure ? `Pressão arterial: ${vitalSigns.bloodPressure} mmHg` : null,
          vitalSigns.oxygenSaturation != null ? `Saturação de oxigênio: ${vitalSigns.oxygenSaturation}%` : null,
          vitalSigns.glucose ? `Glicemia capilar: ${vitalSigns.glucose} mg/dL` : null
        ])
      })()
      const influenzaVitalItems = influenzaFlowVitalItems.length > 0 ? influenzaFlowVitalItems : vitalItems

      const severitySigns = uniqueItems(Array.isArray(severityData?.sinaisGravidadeSelecionados) ? severityData.sinaisGravidadeSelecionados : [])
      const riskFactors = uniqueItems(Array.isArray(riskData?.fatoresRiscoSelecionados) ? riskData.fatoresRiscoSelecionados : [])
      const worseningSigns = uniqueItems(Array.isArray(riskData?.sinaisPioraSelecionados) ? riskData.sinaisPioraSelecionados : [])
      const icuCriteria = uniqueItems(Array.isArray(icuData?.criteriosUTISelecionados) ? icuData.criteriosUTISelecionados : [])

      const hasSRAG = Boolean(severityData?.classificadoComoSRAG || severitySigns.length > 0)
      const hasOseltamivirIndication = Boolean(
        riskData?.indicarOseltamivir
        || riskFactors.length > 0
        || worseningSigns.length > 0
        || hasSRAG
      )
      const icuProtocolApplied = answers.influenza_internacao_uti === 'protocolo_srag_uti_aplicado'
        || history.includes('influenza_internacao_uti')
        || currentStep === 'influenza_uti_protocolo_concluido'
      const viralPanelCollected = Boolean(answers.influenza_painel_viral_enfermaria || answers.influenza_painel_viral_uti)
        || history.includes('influenza_painel_viral_enfermaria')
        || history.includes('influenza_painel_viral_uti')
        || currentStep === 'influenza_painel_viral_enfermaria'
        || currentStep === 'influenza_painel_viral_uti'
      const boardingCareApplied = Boolean(answers.influenza_boarding_enfermaria || answers.influenza_boarding_uti)
        || history.includes('influenza_boarding_enfermaria')
        || history.includes('influenza_boarding_uti')
        || currentStep === 'influenza_boarding_enfermaria'
        || currentStep === 'influenza_boarding_uti'
      const needsICU = Boolean(
        icuData?.indicarUTI
        || icuCriteria.length > 0
        || currentStep === 'influenza_painel_viral_uti'
        || currentStep === 'influenza_boarding_uti'
        || currentStep === 'influenza_internacao_uti'
        || currentStep === 'influenza_uti_protocolo_concluido'
      )
      const oseltamivirDose = getOseltamivirDoseText(patientForReport)
      const influenzaPrescriptionItems = uniqueItems(
        patientForReport.treatment.prescriptions
          .filter((item) => item.prescribedBy === 'Fluxograma Influenza')
          .map((item) => {
            const dosage = item.dosage || ''
            return [
              item.medication,
              dosage,
              item.frequency && !dosage.includes(item.frequency) ? item.frequency : null,
              item.duration && !dosage.includes(item.duration) ? item.duration : null
            ].filter(Boolean).join(' - ')
          })
      )
      const registeredAntibiotics = prescriptions.filter((item) =>
        /ceftriaxona|azitromicina|ampicilina|sulbactam|amoxicilina|piperacilina|cefepime|meropenem|antibiótico/i.test(item)
      )
      const formatClinicalList = (items: string[]) => {
        if (items.length === 0) return ''
        if (items.length === 1) return items[0]
        return `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`
      }
      const influenzaPhysicalExamNarrative = (() => {
        if (!influenzaPhysicalExam) return ''
        const grade = (value?: number) => value ? ` ${value}/4+` : ''
        const generalStateLabels: Record<PhysicalExamData['generalState'], string> = {
          bom: 'bom estado geral',
          regular: 'regular estado geral',
          mal: 'mal estado geral',
          grave: 'grave estado geral',
          pessimo: 'péssimo estado geral'
        }
        const respiration = influenzaPhysicalExam.respiration.status === 'eupneico'
          ? 'eupneico'
          : influenzaPhysicalExam.respiration.status === 'taquipneico'
            ? 'taquipneico'
            : `dispneico${grade(influenzaPhysicalExam.respiration.grade)}`

        return [
          `Ao exame físico, encontrava-se em ${generalStateLabels[influenzaPhysicalExam.generalState]}, ${influenzaPhysicalExam.coloration.status === 'corado' ? 'corado' : `descorado${grade(influenzaPhysicalExam.coloration.grade)}`}, ${influenzaPhysicalExam.hydration.status === 'hidratado' ? 'hidratado' : `desidratado${grade(influenzaPhysicalExam.hydration.grade)}`}, ${influenzaPhysicalExam.cyanosis.status === 'acianotico' ? 'acianótico' : `cianótico${grade(influenzaPhysicalExam.cyanosis.grade)}`} e ${influenzaPhysicalExam.jaundice.status === 'anicterico' ? 'anictérico' : `ictérico${grade(influenzaPhysicalExam.jaundice.grade)}`}.`,
          `${influenzaPhysicalExam.temperature.status === 'afebril' ? 'Afebril' : 'Febril'}${influenzaPhysicalExam.temperature.value != null ? `, com temperatura de ${influenzaPhysicalExam.temperature.value} °C` : ''}, ${respiration}.`,
          `Glasgow ${influenzaPhysicalExam.neuro.glasgow ?? 'não informado'}; ${influenzaPhysicalExam.neuro.altered?.trim() || 'consciente e contactuante'}.`,
          `Ausculta pulmonar: ${influenzaPhysicalExam.pulmonary.altered?.trim() || 'murmúrio vesicular presente bilateralmente, sem ruídos adventícios'}.`,
          `Aparelho cardiovascular: ${influenzaPhysicalExam.cardiac.altered?.trim() || 'bulhas rítmicas, normofonéticas, sem sopros audíveis'}.`,
          influenzaPhysicalExam.extremities.altered?.trim() ? `Extremidades: ${influenzaPhysicalExam.extremities.altered.trim()}.` : null
        ].filter(Boolean).join(' ')
      })()

      const destination = (() => {
        if (needsICU) return 'uti'
        if (currentStep === 'influenza_painel_viral_enfermaria' || currentStep === 'influenza_boarding_enfermaria' || currentStep === 'influenza_internacao_enfermaria') return 'enfermaria'
        if (currentStep === 'influenza_ambulatorial_oseltamivir' || currentStep === 'influenza_ambulatorial_oseltamivir_concluido') return 'ambulatorial_oseltamivir'
        if (currentStep === 'influenza_ambulatorial_sintomaticos' || currentStep === 'influenza_ambulatorial_sintomaticos_concluido') return 'ambulatorial_sintomatico'
        if (hasSRAG) return 'srag_em_avaliacao'
        if (hasOseltamivirIndication) return 'avaliacao_oseltamivir'
        return 'avaliacao'
      })()

      const title = destination === 'uti'
        ? 'RELATÓRIO MÉDICO – SÍNDROME RESPIRATÓRIA AGUDA GRAVE / UTI'
        : destination === 'enfermaria'
          ? 'RELATÓRIO MÉDICO – SÍNDROME RESPIRATÓRIA AGUDA GRAVE / ENFERMARIA'
          : destination === 'ambulatorial_oseltamivir'
            ? 'RELATÓRIO MÉDICO – SÍNDROME GRIPAL COM INDICAÇÃO DE ANTIVIRAL'
            : destination === 'ambulatorial_sintomatico'
              ? 'RELATÓRIO MÉDICO – SÍNDROME GRIPAL / MANEJO AMBULATORIAL'
              : 'RELATÓRIO MÉDICO – SÍNDROME GRIPAL / INFLUENZA'

      const diagnosticImpression = (() => {
        if (destination === 'uti') {
          return 'Quadro compatível com síndrome respiratória aguda grave, com repercussão clínica suficiente para indicação de terapia intensiva. Mantida influenza como etiologia provável, sem prejuízo da investigação de pneumonia viral, coinfecção bacteriana e outros diagnósticos diferenciais conforme evolução.'
        }
        if (destination === 'enfermaria') {
          return 'Quadro compatível com síndrome respiratória aguda grave, sem critérios imediatos de terapia intensiva na avaliação atual, porém com necessidade de internação em enfermaria para antiviral, suporte clínico, monitorização e reavaliação seriada.'
        }
        if (destination === 'ambulatorial_oseltamivir') {
          return 'Síndrome gripal sem critérios atuais de SRAG, mas com risco aumentado de complicações e/ou sinais de piora, motivo pelo qual foi indicado tratamento antiviral e seguimento precoce.'
        }
        if (destination === 'ambulatorial_sintomatico') {
          return 'Síndrome gripal sem sinais de gravidade, fatores de risco relevantes ou evidências de deterioração clínica no momento, permitindo manejo ambulatorial sintomático.'
        }
        if (destination === 'srag_em_avaliacao') {
          return 'Síndrome respiratória aguda grave em avaliação, com necessidade de definição prioritária do nível de internação conforme oxigenação, trabalho respiratório, estado hemodinâmico e presença de disfunções orgânicas.'
        }
        return 'Síndrome gripal/influenza em avaliação, ainda sem definição final de gravidade e destino assistencial.'
      })()

      const clinicalSummary = [
        `Em atendimento em ${formatDate(patientForReport.admission.date)}, por quadro respiratório agudo compatível com síndrome gripal.`,
        symptoms.length > 0
          ? `Relatava ${formatClinicalList(symptoms)}.`
          : 'Os sintomas específicos não foram detalhados no registro de admissão.',
        influenzaVitalItems.length > 0 ? `Na avaliação inicial, apresentava ${formatClinicalList(influenzaVitalItems)}.` : null,
        influenzaPhysicalExamNarrative || null,
        severitySigns.length > 0
          ? `Foram identificados ${formatClinicalList(severitySigns)}, caracterizando sinais de gravidade e enquadramento como síndrome respiratória aguda grave.`
          : 'Não foram identificados sinais de gravidade respiratória ou sistêmica na avaliação registrada.',
        riskFactors.length > 0
          ? `Apresentava ainda ${formatClinicalList(riskFactors)}, aumentando o risco de complicações relacionadas à influenza.`
          : null,
        worseningSigns.length > 0
          ? `Havia sinais de piora clínica, com ${formatClinicalList(worseningSigns)}.`
          : null,
        icuCriteria.length > 0
          ? `Na estratificação para terapia intensiva, foram constatados ${formatClinicalList(icuCriteria)}, justificando indicação de UTI.`
          : hasSRAG && answers.influenza_criterios_uti
            ? 'Na avaliação para terapia intensiva, não foram registrados critérios imediatos de UTI, mantendo-se indicação de internação em enfermaria com vigilância estreita.'
            : null,
        observations.length > 0 ? `Observações clínicas adicionais: ${observations.join('; ')}.` : null
      ].filter(Boolean).join(' ')

      const investigationItems = uniqueItems([
        labItems.length > 0
          ? `Exames já registrados: ${labItems.join(' ')}`
          : null,
        destination === 'enfermaria'
          ? 'Programada investigação hospitalar inicial com hemograma, função renal, eletrólitos, transaminases, PCR e glicemia; gasometria, lactato e coagulograma conforme repercussão clínica.'
          : null,
        destination === 'uti'
          ? 'Programada investigação de SRAG grave com hemograma, função renal, eletrólitos, magnésio, transaminases, bilirrubinas, PCR, gasometria arterial, lactato, coagulograma e glicemia; considerar troponina, hemoculturas e painel viral conforme indicação.'
          : null,
        viralPanelCollected
          ? 'Registrada coleta precoce de amostra respiratória para RT-PCR ou painel viral multiplex quando disponível, incluindo investigação de Influenza, COVID-19 e outros vírus respiratórios conforme plataforma do serviço, sem atrasar o início do tratamento.'
          : destination === 'enfermaria' || destination === 'uti'
            ? 'Indicar coleta precoce de amostra respiratória para RT-PCR ou painel viral multiplex quando disponível, sem atrasar oseltamivir ou suporte clínico.'
            : null,
        destination === 'enfermaria' || destination === 'uti'
          ? 'O plano de investigação inclui radiografia de tórax. Tomografia fica reservada para radiografia inconclusiva, hipoxemia desproporcional, complicações, imunossupressão, piora sem causa definida ou suspeita de tromboembolismo pulmonar.'
          : null
      ])
      const investigationNarrative = investigationItems.join(' ')

      const conductItems = uniqueItems([
        destination === 'ambulatorial_sintomatico'
          ? 'Mantido manejo ambulatorial sintomático, com hidratação oral, controle de febre/dor e orientações de alarme.'
          : null,
        destination === 'ambulatorial_oseltamivir'
          ? `Indicado oseltamivir na dose de ${oseltamivirDose}, associado a medidas sintomáticas e hidratação oral.`
          : null,
        destination === 'enfermaria'
          ? `Indicada internação em enfermaria, isolamento por gotículas, oseltamivir na dose de ${oseltamivirDose}, monitorização seriada, oxigenoterapia conforme necessidade e hidratação individualizada.`
          : null,
        destination === 'uti'
          ? `Indicada internação em UTI. Enquanto aguarda transferência, manter isolamento por gotículas, oseltamivir na dose de ${oseltamivirDose}, monitorização contínua e suporte respiratório/hemodinâmico conforme necessidade.`
          : null,
        destination === 'srag_em_avaliacao'
          ? `Mantida abordagem para SRAG, com oseltamivir na dose de ${oseltamivirDose}, oxigenoterapia conforme necessidade e definição prioritária do nível de internação.`
          : null,
        icuProtocolApplied
          ? 'Registrada aplicação do protocolo de estabilização da SRAG grave no pronto-socorro enquanto aguarda leito de UTI.'
          : null,
        boardingCareApplied
          ? 'Registrado protocolo de boarding do paciente com SRAG/Influenza, mantendo cuidados compatíveis com o nível de complexidade de destino enquanto aguarda leito.'
          : null,
        influenzaPrescriptionItems.length > 0
          ? `Prescrição emitida: ${influenzaPrescriptionItems.join('; ')}.`
          : null,
        registeredAntibiotics.length > 0
          ? `Antibioticoterapia registrada: ${registeredAntibiotics.join('; ')}.`
          : null
      ])
      const conductNarrative = conductItems.join(' ')

      const planItems = uniqueItems([
        destination === 'ambulatorial_sintomatico' || destination === 'ambulatorial_oseltamivir'
          ? 'Reavaliação em 48 a 72 horas, ou antes em caso de piora.'
          : null,
        destination === 'ambulatorial_sintomatico' || destination === 'ambulatorial_oseltamivir'
          ? 'Retorno imediato se dispneia, queda da saturação, confusão, sonolência excessiva, desidratação, hipotensão, febre persistente ou piora do estado geral.'
          : null,
        destination === 'enfermaria'
          ? 'Manter reavaliação clínica e respiratória seriada, com escalonamento para terapia intensiva se houver aumento da necessidade de oxigênio, desconforto respiratório, alteração do nível de consciência, hipotensão, choque ou falência orgânica.'
          : null,
        destination === 'uti'
          ? 'Manter estabilização e monitorização contínua no pronto-socorro até a transferência efetiva para a UTI, com avaliação imediata de intubação se houver falência respiratória iminente, hipoxemia refratária, rebaixamento da consciência ou instabilidade hemodinâmica.'
          : null,
        boardingCareApplied
          ? 'Durante a espera por leito, manter reavaliação frequente, monitorização adequada, oxigenoterapia escalonada conforme necessidade, controle de hidratação, profilaxias, isolamento respiratório, prevenção de deterioração e comunicação clara de critérios de piora.'
          : null,
        hasOseltamivirIndication ? 'Ajustar a dose do oseltamivir à função renal, quando aplicável.' : null,
        patientForReport.treatment.nextEvaluation ? `Reavaliação programada para ${formatDateOnly(patientForReport.treatment.nextEvaluation)}.` : null
      ])
      const planNarrative = planItems.join(' ')

      return {
        title,
        sections: [
          {
            title: 'Identificação do Paciente',
            text: `Paciente ${patientForReport.name || 'não identificado'}, ${patientForReport.age || 'idade não informada'} anos, sexo ${formatGender(patientForReport.gender)}, peso ${formatWeight(patientForReport.weight)}, prontuário nº ${patientForReport.medicalRecord || 'não informado'}.`
          },
          {
            title: 'Queixa Principal',
            text: symptoms[0] || 'Síndrome gripal / quadro respiratório agudo em investigação.'
          },
          {
            title: 'Resumo Clínico',
            text: clinicalSummary
          },
          {
            title: 'Impressão Diagnóstica',
            text: diagnosticImpression
          },
          ...(investigationNarrative
            ? [{
                title: 'Investigação e Monitorização',
                text: investigationNarrative
              }]
            : []),
          {
            title: 'Conduta Médica',
            text: conductNarrative || 'Conduta final ainda não definida no registro atual.'
          },
          {
            title: 'Destino e Plano',
            text: planNarrative || 'Manter avaliação clínica até definição do destino assistencial.'
          },
          {
            title: 'Médico responsável',
            text: doctorSignatureText
          }
        ]
      }
    }

    const isPneumoniaReport = flowId === 'pneumonia' || /pneumonia adquirida na comunidade/i.test(flowchart?.name || '')

    if (isPneumoniaReport) {
      const parseScoreAnswer = (value: string | undefined, prefix: string) => {
        const match = String(value || '').match(new RegExp(`^${prefix}_(\\d+)$`))
        if (match) return Number(match[1])
        const parsed = safeParse(value) as { score?: number } | null
        return typeof parsed?.score === 'number' ? parsed.score : undefined
      }
      const getDecisionAnswer = (value: string | undefined) => {
        const parsed = safeParse(value) as { decision?: string } | null
        return parsed?.decision || value || ''
      }
      const formatScore = (score: number | undefined, max: number) =>
        score != null ? `${score}/${max}` : 'não registrado'
      const criteriaFromObject = (criteria: unknown, labels: Record<string, string>) => {
        if (!criteria || typeof criteria !== 'object') return [] as string[]
        return Object.entries(criteria as Record<string, boolean | number | string>)
          .filter(([, selected]) => selected === true)
          .map(([key]) => labels[key] || key)
      }
      const criteriaFromArray = (items: unknown) => Array.isArray(items) ? uniqueItems(items.map((item) => String(item))) : []

      const crbData = safeParse(answers.pac_crb65_triagem) as { score?: number; criteriosSelecionados?: string[] } | null
      const pacPhysicalExamAnswer = safeParse(answers.pac_exame_fisico) as {
        sinaisVitais?: {
          temperature?: number
          feverDays?: number
          bloodPressure?: string
          heartRate?: number
          respiratoryRate?: number
          oxygenSaturation?: number
          glucose?: string
        }
        exameFisico?: PhysicalExamData
      } | null
      const physicalExamData = pacPhysicalExamAnswer?.exameFisico
      const pacFlowVitalItems = (() => {
        const vitalSigns = pacPhysicalExamAnswer?.sinaisVitais
        if (!vitalSigns) return [] as string[]
        return uniqueItems([
          vitalSigns.temperature != null ? `Temperatura: ${vitalSigns.temperature} °C` : null,
          vitalSigns.feverDays != null ? `Tempo de febre: ${vitalSigns.feverDays} dia(s)` : null,
          vitalSigns.heartRate != null ? `Frequência cardíaca: ${vitalSigns.heartRate} bpm` : null,
          vitalSigns.respiratoryRate != null ? `Frequência respiratória: ${vitalSigns.respiratoryRate} irpm` : null,
          vitalSigns.bloodPressure ? `Pressão arterial: ${vitalSigns.bloodPressure} mmHg` : null,
          vitalSigns.oxygenSaturation != null ? `Saturação de oxigênio: ${vitalSigns.oxygenSaturation}%` : null,
          vitalSigns.glucose ? `Glicemia capilar: ${vitalSigns.glucose} mg/dL` : null
        ])
      })()
      const pacVitalItems = pacFlowVitalItems.length > 0 ? pacFlowVitalItems : vitalItems
      const examRequestData = safeParse(answers.pac_solicitacao_exames) as {
        examesSelecionados?: string[]
        grupos?: Record<string, string[]>
      } | null
      const curbProtocolData = safeParse(answers.pac_curb65_protocolo) as {
        score?: number
        destino?: string
        criterios?: Record<string, boolean | number | string>
      } | null
      const atsData = safeParse(answers.pac_ats_idsa_gravidade) as {
        pacGrave?: boolean
        criteriosMaioresSelecionados?: string[]
        criteriosMenoresSelecionados?: string[]
      } | null
      const dripData = safeParse(answers.pac_drip_enfermaria || answers.pac_drip_uti) as {
        score?: number
        criteriosMaioresSelecionados?: string[]
        criteriosMenoresSelecionados?: string[]
      } | null
      const smartCopData = safeParse(answers.pac_smartcop_enfermaria || answers.pac_smartcop_uti) as {
        score?: number
        criteriosSelecionados?: string[]
      } | null
      const crb65Score = parseScoreAnswer(answers.pac_crb65_triagem, 'crb65')
      const curb65Score = parseScoreAnswer(answers.pac_curb65_protocolo, 'curb65')
      const dripScore = parseScoreAnswer(answers.pac_drip_enfermaria || answers.pac_drip_uti, 'drip')
      const smartCopScore = parseScoreAnswer(answers.pac_smartcop_enfermaria || answers.pac_smartcop_uti, 'smartcop')
      const psiData = safeParse(answers.pac_calcular_psi) as {
        score?: number
        grupo?: string
        destino?: string
        criterios?: Record<string, boolean | number | string>
      } | null
      const curbLegacyData = safeParse(answers.pac_calcular_curb65) as {
        score?: number
        destino?: string
        criterios?: Record<string, boolean | number | string>
      } | null

      const effectiveCurbScore = curb65Score ?? curbLegacyData?.score
      const atsSevere = atsData?.pacGrave ?? answers.pac_ats_idsa_gravidade === 'ats_idsa_pac_grave'
      const atsMinorCount = atsData?.criteriosMenoresSelecionados?.length || 0
      const atsMajorCount = atsData?.criteriosMaioresSelecionados?.length || 0
      const pacICUProtocolApplied = answers.pac_destino_uti === 'protocolo_pac_uti_aplicado'
        || history.includes('pac_destino_uti')
        || currentStep === 'pac_uti_protocolo_concluido'
      const pacWaitingCareApplied = Boolean(answers.pac_cuidados_aguarda_enfermaria || answers.pac_cuidados_aguarda_uti)
        || history.includes('pac_cuidados_aguarda_enfermaria')
        || history.includes('pac_cuidados_aguarda_uti')
        || currentStep === 'pac_cuidados_aguarda_enfermaria'
        || currentStep === 'pac_cuidados_aguarda_uti'
      const destinationAnswer = getDecisionAnswer(answers.pac_destino_protocolo)
      const psiGroup = psiData?.grupo || (currentStep === 'pac_psi_baixo'
        ? 'PORT I/II'
        : currentStep === 'pac_psi_intermediario'
          ? 'PORT III/IV'
          : currentStep === 'pac_psi_alto'
            ? 'PORT V'
            : '')

      const destination = (() => {
        if (currentStep === 'pac_estabilizacao_seguir_sepse') return 'estabilizacao'
        if (currentStep === 'pac_internacao_limitacao') return 'limitador'
        if (destinationAnswer === 'ambulatorio' || currentStep === 'pac_destino_ambulatorial' || currentStep === 'pac_psi_baixo' || currentStep === 'pac_curb_baixo') return 'ambulatorial'
        if (destinationAnswer === 'uti' || currentStep === 'pac_cuidados_aguarda_uti' || currentStep === 'pac_destino_uti' || currentStep === 'pac_uti_protocolo_concluido' || currentStep === 'pac_psi_alto') return 'uti'
        if (destinationAnswer === 'enfermaria' || currentStep === 'pac_cuidados_aguarda_enfermaria' || currentStep === 'pac_destino_enfermaria' || currentStep === 'pac_psi_intermediario' || currentStep === 'pac_curb_intermediario') return 'enfermaria'
        if (currentStep === 'pac_curb_alto') return effectiveCurbScore != null && effectiveCurbScore >= 4 ? 'uti' : 'enfermaria'
        if (atsSevere) return 'uti'
        if (effectiveCurbScore != null && effectiveCurbScore >= 3) return effectiveCurbScore >= 4 ? 'uti' : 'enfermaria'
        if (effectiveCurbScore === 2) return 'enfermaria'
        if (crb65Score != null && crb65Score >= 3) return 'enfermaria'
        if (crb65Score === 0 || effectiveCurbScore === 0 || effectiveCurbScore === 1) return 'ambulatorial'
        return 'avaliacao'
      })()

      const crbRisk = crb65Score == null
        ? 'não registrado'
        : crb65Score === 0
          ? 'baixo risco'
          : crb65Score <= 2
            ? 'risco intermediário, com necessidade de avaliação hospitalar'
            : 'alto risco, com internação recomendada'
      const curbRisk = effectiveCurbScore == null
        ? 'não registrado'
        : effectiveCurbScore <= 1
          ? 'baixo risco, compatível com tratamento ambulatorial se não houver limitadores'
          : effectiveCurbScore === 2
            ? 'risco moderado, com indicação de considerar internação'
            : effectiveCurbScore >= 4
              ? 'risco elevado, com forte indicação de internação e avaliação para UTI'
              : 'risco elevado, com indicação de internação hospitalar'
      const dripRisk = dripScore == null
        ? 'não avaliado neste trecho do fluxo'
        : dripScore >= 4
          ? 'risco aumentado para patógenos resistentes'
          : 'baixo risco para patógenos resistentes'
      const smartCopRisk = smartCopScore == null
        ? 'não avaliado neste trecho do fluxo'
        : smartCopScore <= 2
          ? 'baixo risco de necessidade de ventilação mecânica ou vasopressor'
          : smartCopScore <= 4
            ? 'risco moderado de deterioração respiratória/hemodinâmica'
            : smartCopScore <= 6
              ? 'alto risco de necessidade de suporte intensivo'
              : 'risco muito alto de necessidade de ventilação mecânica e/ou vasopressor'

      const psiLabels: Record<string, string> = {
        residenteCasaRepouso: 'residência em instituição/casa de repouso',
        neoplasiaAtiva: 'neoplasia ativa',
        doencaHepaticaCronica: 'doença hepática crônica',
        insuficienciaCardiaca: 'insuficiência cardíaca',
        doencaCerebrovascular: 'doença cerebrovascular',
        doencaRenalCronica: 'doença renal crônica',
        estadoMentalAlterado: 'alteração do estado mental',
        frMaior30: 'FR >= 30 irpm',
        pasMenor90: 'PAS < 90 mmHg',
        temperaturaExtrema: 'temperatura <35 °C ou >=40 °C',
        fcMaior125: 'FC >= 125 bpm',
        phMenor735: 'pH arterial < 7,35',
        ureiaMaior30: 'ureia/BUN elevado',
        sodioMenor130: 'sódio < 130 mEq/L',
        glicoseMaior250: 'glicose >= 250 mg/dL',
        hematocritoMenor30: 'hematócrito < 30%',
        hipoxemia: 'hipoxemia',
        derramePleural: 'derrame pleural'
      }
      const curbLabels: Record<string, string> = {
        confusaoMental: 'confusão mental',
        ureiaMaior43: 'ureia elevada',
        frMaior30: 'FR >= 30 irpm',
        paBaixa: 'PAS < 90 mmHg ou PAD <= 60 mmHg',
        idadeMaior65: 'idade >= 65 anos'
      }
      const crbCriteria = criteriaFromArray(crbData?.criteriosSelecionados)
      const selectedExamItems = criteriaFromArray(examRequestData?.examesSelecionados)
      const selectedExamGroups = examRequestData?.grupos && typeof examRequestData.grupos === 'object'
        ? Object.entries(examRequestData.grupos)
          .map(([group, items]) => ({
            group,
            items: criteriaFromArray(items)
          }))
          .filter((entry) => entry.items.length > 0)
        : []
      const psiCriteria = criteriaFromObject(psiData?.criterios, psiLabels)
      const curbCriteria = criteriaFromObject(curbProtocolData?.criterios || curbLegacyData?.criterios, curbLabels)
      const atsMajorCriteria = criteriaFromArray(atsData?.criteriosMaioresSelecionados)
      const atsMinorCriteria = criteriaFromArray(atsData?.criteriosMenoresSelecionados)
      const dripMajorCriteria = criteriaFromArray(dripData?.criteriosMaioresSelecionados)
      const dripMinorCriteria = criteriaFromArray(dripData?.criteriosMenoresSelecionados)
      const smartCopCriteria = criteriaFromArray(smartCopData?.criteriosSelecionados)
      const physicalExamItems = (() => {
        if (!physicalExamData) return [] as string[]
        const grade = (value?: number) => value ? ` ${value}/4+` : ''
        const generalStateLabels: Record<PhysicalExamData['generalState'], string> = {
          bom: 'bom estado geral',
          regular: 'regular estado geral',
          mal: 'mal estado geral',
          grave: 'grave estado geral',
          pessimo: 'péssimo estado geral'
        }
        const respiration = physicalExamData.respiration.status === 'eupneico'
          ? 'eupneico'
          : physicalExamData.respiration.status === 'taquipneico'
            ? 'taquipneico'
            : `dispneico${grade(physicalExamData.respiration.grade)}`

        return uniqueItems([
          `Estado geral: ${generalStateLabels[physicalExamData.generalState]}.`,
          `Coloração e hidratação: ${physicalExamData.coloration.status === 'corado' ? 'corado' : `descorado${grade(physicalExamData.coloration.grade)}`}, ${physicalExamData.hydration.status === 'hidratado' ? 'hidratado' : `desidratado${grade(physicalExamData.hydration.grade)}`}.`,
          `Cianose e icterícia: ${physicalExamData.cyanosis.status === 'acianotico' ? 'acianótico' : `cianótico${grade(physicalExamData.cyanosis.grade)}`}, ${physicalExamData.jaundice.status === 'anicterico' ? 'anictérico' : `ictérico${grade(physicalExamData.jaundice.grade)}`}.`,
          `Temperatura e respiração: ${physicalExamData.temperature.status === 'afebril' ? 'afebril' : 'febril'}${physicalExamData.temperature.value != null ? `, temperatura de ${physicalExamData.temperature.value} °C` : ''}; ${respiration}.`,
          `Neurológico: Glasgow ${physicalExamData.neuro.glasgow ?? 'não informado'}; ${physicalExamData.neuro.altered?.trim() || 'consciente, contactuante, pupilas isocóricas e fotorreagentes'}.`,
          `Aparelho cardiovascular: ${physicalExamData.cardiac.altered?.trim() || 'bulhas rítmicas, normofonéticas, sem sopros audíveis'}.`,
          `Aparelho respiratório: ${physicalExamData.pulmonary.altered?.trim() || 'murmúrio vesicular presente bilateralmente, sem ruídos adventícios'}.`,
          `Abdome: ${physicalExamData.abdomen.altered?.trim() || 'plano, normotenso, ruídos hidroaéreos presentes, sem sinais de irritação peritoneal'}.`,
          `Extremidades e perfusão: ${physicalExamData.extremities.altered?.trim() || 'pulsos periféricos simétricos, perfusão preservada, sem edema ou empastamento'}.`
        ])
      })()

      const title = destination === 'uti'
        ? 'PRONTUÁRIO MÉDICO – PAC GRAVE / AVALIAÇÃO PARA UTI'
        : destination === 'enfermaria' || destination === 'limitador'
          ? 'PRONTUÁRIO MÉDICO – PNEUMONIA ADQUIRIDA NA COMUNIDADE / INTERNAÇÃO'
          : destination === 'ambulatorial'
            ? 'PRONTUÁRIO MÉDICO – PNEUMONIA ADQUIRIDA NA COMUNIDADE / MANEJO AMBULATORIAL'
            : 'PRONTUÁRIO MÉDICO – PNEUMONIA ADQUIRIDA NA COMUNIDADE'

      const diagnosisText = (() => {
        if (destination === 'estabilizacao') {
          return 'Paciente avaliado com suspeita de pneumonia adquirida na comunidade, apresentando instabilidade clínica, sepse, insuficiência respiratória ou necessidade de estabilização imediata. Prioridade assistencial definida para sala de emergência, suporte clínico inicial e reavaliação do destino após estabilização.'
        }
        if (destination === 'limitador') {
          return 'Paciente com quadro compatível com pneumonia adquirida na comunidade e presença de limitador para manejo ambulatorial, como impossibilidade de via oral, vulnerabilidade social, doença mental limitante ou incapacidade de adesão segura ao tratamento. Internação indicada independentemente do escore isolado.'
        }
        if (destination === 'uti') {
          return 'Paciente com pneumonia adquirida na comunidade classificada como grave ou de alto risco, com indicação de avaliação para terapia intensiva. A decisão considera critérios ATS/IDSA, escore de gravidade, instabilidade clínica, necessidade de suporte ventilatório/hemodinâmico ou alto risco de deterioração.'
        }
        if (destination === 'enfermaria') {
          return 'Paciente com pneumonia adquirida na comunidade com necessidade de internação hospitalar em enfermaria ou unidade intermediária para antibioticoterapia, monitorização clínica, suporte respiratório se necessário e acompanhamento evolutivo.'
        }
        if (destination === 'ambulatorial') {
          return 'Paciente com quadro compatível com pneumonia adquirida na comunidade, sem critérios atuais de gravidade imediata ou instabilidade clínica registrados no fluxo, com estratificação favorável para tratamento ambulatorial e reavaliação precoce.'
        }
        return 'Paciente em avaliação por suspeita de pneumonia adquirida na comunidade. O fluxo ainda não chegou a uma decisão final de destino, devendo a conduta ser confirmada após completar a estratificação clínica.'
      })()

      const antibioticText = (() => {
        if (destination === 'ambulatorial') {
          return 'Antibioticoterapia ambulatorial conforme perfil clínico, com escolha entre beta-lactâmico, macrolídeo ou associação em pacientes com comorbidades/uso recente de antibiótico, seguindo prescrição médica e protocolo institucional.'
        }
        if (dripScore != null && dripScore >= 4) {
          return 'DRIP >= 4 sugere maior risco de patógenos resistentes. Considerar cobertura ampliada para MRSA/Pseudomonas conforme gravidade, culturas prévias, epidemiologia local e protocolo institucional, sem atrasar antibioticoterapia inicial.'
        }
        if (destination === 'enfermaria') {
          return 'Na ausência de risco aumentado para patógenos resistentes, considerar esquema hospitalar habitual para PAC, como ceftriaxona associada a azitromicina, ajustando conforme alergias, função renal, perfil local, culturas e evolução clínica.'
        }
        if (destination === 'uti' || destination === 'estabilizacao') {
          return 'Em PAC grave, iniciar antibioticoterapia precoce após coleta de culturas quando viável, sem atrasar tratamento. Ajustar cobertura conforme risco de MRSA/Pseudomonas, gravidade, foco infeccioso, epidemiologia local e resposta clínica.'
        }
        return 'Antibioticoterapia deve ser definida conforme gravidade, comorbidades, alergias, risco de resistência e protocolo institucional.'
      })()

      const conductItems = uniqueItems([
        destination === 'ambulatorial' ? 'Tratamento ambulatorial, com antibiótico conforme prescrição, sintomáticos quando indicados e retorno programado em 48 a 72 horas.' : null,
        destination === 'enfermaria' ? 'Indicada internação hospitalar em enfermaria/unidade intermediária, com antibioticoterapia venosa ou oral conforme gravidade, monitorização clínica seriada e suporte de oxigênio se necessário.' : null,
        destination === 'uti' ? 'Solicitada avaliação de terapia intensiva, com monitorização contínua, suporte respiratório/hemodinâmico conforme necessidade, coleta de culturas quando possível e antibioticoterapia precoce.' : null,
        pacICUProtocolApplied ? 'Mantido protocolo de estabilização da PAC grave no pronto-socorro enquanto aguarda transferência efetiva para a UTI.' : null,
        destination === 'estabilizacao' ? 'Priorizada estabilização imediata: monitorização, oxigenoterapia, acesso venoso, avaliação de lactato/culturas, ressuscitação volêmica quando indicada, vasopressor se choque e antibioticoterapia precoce.' : null,
        destination === 'limitador' ? 'Internação indicada por insegurança para tratamento ambulatorial, garantindo via de administração, observação clínica e adesão terapêutica.' : null,
        prescriptions.length > 0 ? `Prescrições registradas no sistema: ${prescriptions.join('; ')}.` : null
      ])

      const destinationText = destination === 'ambulatorial'
        ? 'Manejo ambulatorial'
        : destination === 'enfermaria'
          ? 'Internação em enfermaria/unidade intermediária'
          : destination === 'uti'
            ? 'Avaliação/admissão em UTI'
            : destination === 'estabilizacao'
              ? 'Estabilização imediata'
              : destination === 'limitador'
                ? 'Internação por limitador de segurança ambulatorial'
                : 'Destino ainda não definido'

      const examAndImagingItems = uniqueItems([
        selectedExamItems.length > 0
          ? `Exames solicitados no fluxo: ${selectedExamItems.join('; ')}.`
          : null,
        ...selectedExamGroups.map((entry) => {
          const groupLabel = entry.group === 'basicos'
            ? 'Exames básicos'
            : entry.group === 'gravidade'
              ? 'Conforme gravidade/necessidade clínica'
              : entry.group === 'microbiologia'
                ? 'Investigação microbiológica'
                : entry.group === 'selecionados'
                  ? 'Pacientes selecionados'
                  : entry.group
          return `${groupLabel}: ${entry.items.join('; ')}.`
        }),
        labItems.length > 0
          ? `Exames laboratoriais registrados: ${labItems.join(' ')}`
          : selectedExamItems.length > 0
            ? null
            : 'Não há exames laboratoriais estruturados registrados no sistema para este atendimento.',
        'Imagem na PAC: radiografia de tórax permanece exame inicial amplamente disponível para confirmação de infiltrado e avaliação de derrame pleural ou acometimento multilobar.',
        'POCUS pulmonar pode ser utilizado à beira-leito para pesquisa de consolidação subpleural, broncograma aéreo dinâmico, linhas B focais e derrame pleural, especialmente quando se deseja avaliação rápida sem radiação.',
        destination === 'ambulatorial'
          ? 'TC de tórax não é exame de rotina em PAC típica ambulatorial; reservar para dúvida diagnóstica, discordância clínico-radiológica, imunossupressão, falha terapêutica ou suspeita de complicações/diagnósticos alternativos.'
          : 'Em paciente hospitalizado, revisar RX/POCUS e considerar TC de tórax se imagem inicial for inconclusiva, houver hipoxemia desproporcional, falha terapêutica em 48-72 horas, suspeita de empiema/abscesso/pneumonia necrotizante ou diagnóstico alternativo.'
      ])

      const clinicalDataItems = uniqueItems([
        symptoms.length > 0 ? `Sintomas registrados: ${symptoms.join('; ')}.` : null,
        observations.length > 0 ? `Observações clínicas: ${observations.join('; ')}.` : null
      ])

      const assessmentItems = uniqueItems([
        `CRB-65: ${formatScore(crb65Score, 4)} (${crbRisk}).`,
        crbCriteria.length > 0 ? `Critérios marcados no CRB-65: ${crbCriteria.join('; ')}.` : null,
        `CURB-65: ${formatScore(effectiveCurbScore, 5)} (${curbRisk}).`,
        psiData?.score != null ? `PSI/PORT: ${psiData.score} pontos, ${psiGroup || 'grupo não informado'}, destino sugerido: ${psiData.destino || 'não informado'}.` : null,
        psiCriteria.length > 0 ? `Critérios pontuados no PSI: ${psiCriteria.join('; ')}.` : null,
        curbCriteria.length > 0 ? `Critérios pontuados no CURB-65: ${curbCriteria.join('; ')}.` : null,
        answers.pac_ats_idsa_gravidade
          ? `ATS/IDSA: ${atsSevere
            ? 'indicação de UTI por critério maior ou >=3 critérios menores'
            : atsMinorCount === 2 && atsMajorCount === 0
              ? '2 critérios menores, com indicação de internação em enfermaria'
              : 'sem destino automático pelo ATS/IDSA; correlacionar com os demais escores e julgamento clínico'}.`
          : null,
        atsMajorCriteria.length > 0 ? `Critérios maiores ATS/IDSA: ${atsMajorCriteria.join('; ')}.` : null,
        atsMinorCriteria.length > 0 ? `Critérios menores ATS/IDSA: ${atsMinorCriteria.join('; ')}.` : null,
        `DRIP Score: ${formatScore(dripScore, 8)} (${dripRisk}).`,
        dripMajorCriteria.length > 0 ? `Fatores maiores do DRIP: ${dripMajorCriteria.join('; ')}.` : null,
        dripMinorCriteria.length > 0 ? `Fatores menores do DRIP: ${dripMinorCriteria.join('; ')}.` : null,
        `SMART-COP: ${formatScore(smartCopScore, 11)} (${smartCopRisk}).`,
        smartCopCriteria.length > 0 ? `Critérios marcados no SMART-COP: ${smartCopCriteria.join('; ')}.` : null,
        'PSI/PORT, SCAP, SIPF, SOAR, SOFA e SAPS 3 permanecem como ferramentas complementares de prognóstico, auditoria ou avaliação em sepse/UTI quando aplicáveis.'
      ])

      const planItems = uniqueItems([
        antibioticText,
        destination === 'ambulatorial' ? 'Orientar retorno imediato em dispneia, queda de saturação, confusão, hipotensão, piora do estado geral, febre persistente, intolerância oral ou ausência de melhora clínica.' : null,
        destination === 'ambulatorial' ? 'Reavaliar em 48 a 72 horas ou antes se houver piora.' : null,
        pacWaitingCareApplied ? 'Enquanto aguarda leito hospitalar, manter monitorização clínica, antibioticoterapia precoce, oxigenoterapia titulada, hidratação individualizada, controle de sintomas, profilaxia para tromboembolismo venoso quando não houver contraindicação e reavaliação periódica com critérios de escalonamento.' : null,
        destination === 'enfermaria' ? 'Solicitar ou revisar radiografia de tórax, hemograma, função renal, eletrólitos, marcadores inflamatórios e culturas conforme gravidade e protocolo institucional.' : null,
        destination === 'enfermaria' ? 'Escalonar para UTI se houver aumento da necessidade de oxigênio, desconforto respiratório, hipotensão, alteração do sensório, lactato elevado, choque ou falência orgânica.' : null,
        destination === 'uti' || destination === 'estabilizacao' ? 'Avaliar gasometria, lactato, culturas, necessidade de ventilação mecânica, vasopressor, SOFA e acompanhamento intensivo seriado.' : null,
        destination === 'uti' ? 'Manter monitorização e tratamento no pronto-socorro até a transferência, com comunicação contínua com a equipe da UTI e reavaliação imediata diante de deterioração.' : null,
        patientForReport.treatment.nextEvaluation ? `Reavaliação programada para ${formatDateOnly(patientForReport.treatment.nextEvaluation)}.` : null
      ])

      const historyText = [
        `Paciente admitido em ${formatDate(patientForReport.admission.date)} para avaliação de quadro respiratório compatível com pneumonia adquirida na comunidade.`,
        symptoms.length > 0
          ? `Refere/apresenta ${symptoms.join('; ')}, sendo conduzido conforme protocolo institucional de PAC.`
          : 'Quadro conduzido como suspeita clínica de PAC pelo protocolo institucional; sintomas específicos não foram lançados em campo estruturado.',
        observations.length > 0 ? `Observações clínicas adicionais: ${observations.join('; ')}.` : null,
        `Após aplicação das etapas do fluxo, o destino assistencial registrado foi: ${destinationText}.`
      ].filter(Boolean).join(' ')

      const sections: ReportSection[] = [
        {
          title: 'Identificação do Paciente',
          text: `Paciente ${patientForReport.name || 'não identificado'}, ${patientForReport.age || 'idade não informada'} anos, sexo ${formatGender(patientForReport.gender)}, peso ${formatWeight(patientForReport.weight)}, prontuário nº ${patientForReport.medicalRecord || 'não informado'}.`
        },
        {
          title: 'Queixa Principal',
          text: symptoms[0] || 'Quadro respiratório sugestivo de pneumonia adquirida na comunidade.'
        },
        {
          title: 'História da Doença Atual',
          text: historyText
        },
        ...(clinicalDataItems.length > 0
          ? [{
              title: 'Dados Clínicos Registrados',
              items: clinicalDataItems
            }]
          : []),
        ...(pacVitalItems.length > 0
          ? [{
              title: 'Sinais Vitais',
              items: pacVitalItems
            }]
          : []),
        ...(physicalExamItems.length > 0
          ? [{
              title: 'Exame Físico',
              items: physicalExamItems
            }]
          : []),
        {
          title: 'Impressão Diagnóstica e Destino',
          text: diagnosisText
        },
        {
          title: 'Estratificação de Gravidade',
          items: assessmentItems
        },
        {
          title: 'Exames Complementares e Imagem',
          items: examAndImagingItems
        },
        {
          title: 'Conduta e Tratamento',
          items: conductItems.length > 0 ? conductItems : ['Conduta final ainda não registrada; completar fluxo de PAC para definição de destino.']
        },
        {
          title: 'Plano Terapêutico e Orientações',
          items: planItems
        },
        {
          title: 'Médico responsável',
          text: doctorSignatureText
        }
      ]

      return {
        title,
        sections
      }
    }

    if (flowId === 'paralisia_bell') {
      const criteriaData = safeParse(answers.bell_criterios_obrigatorios) as { criteriosSelecionados?: string[]; todosCriteriosPresentes?: boolean } | null
      const supportData = safeParse(answers.bell_suporte_diagnostico) as { criteriosSuporteSelecionados?: string[] } | null
      const redFlagsData = safeParse(answers.bell_red_flags_ramsay) as { redFlagsSelecionadas?: string[]; possuiRedFlag?: boolean } | null
      const houseData = safeParse(answers.bell_house_brackmann) as { houseBrackmann?: string; houseBrackmannLabel?: string } | null
      const bellMandatoryCriteriaLabels: Record<string, string> = {
        periferica_unilateral: 'Fraqueza ou paralisia facial periférica unilateral, envolvendo fronte, fechamento ocular e comissura labial',
        inicio_agudo: 'Início agudo, com progressão até o pico em 72 horas ou menos',
        sem_causa_identificavel: 'Ausência de causa identificável após avaliação clínica inicial',
        sem_outros_deficits: 'Ausência de outros déficits neurológicos além do VII par craniano'
      }
      const bellSupportCriteriaLabels: Record<string, string> = {
        otalgia_leve: 'Otalgia leve ou dor retroauricular/mastoidea',
        hiperacusia: 'Hiperacusia',
        disgeusia_ageusia: 'Disgeusia ou ageusia nos 2/3 anteriores da língua',
        xeroftalmia: 'Xeroftalmia/redução do lacrimejamento',
        xerostomia: 'Xerostomia/redução da salivação',
        infeccao_viral: 'História recente de infecção viral inespecífica'
      }
      const bellRedFlagLabels: Record<string, string> = {
        testa_poupada: 'Ausência de acometimento da musculatura da testa',
        bilateral: 'Paralisia bilateral',
        progressao_maior_7_dias: 'Progressão dos sintomas por mais de 7 dias',
        recorrencia_frequente: 'Recorrência frequente',
        otalgia_intensa: 'Otalgia intensa',
        vertigem_hipoacusia_disfagia: 'Vertigem, hipoacusia ou disfagia',
        ramsay_hunt: 'Vesículas auriculares ou orais / suspeita de síndrome de Ramsay Hunt',
        trauma_cirurgia: 'História de trauma craniano ou cirurgia otológica',
        massa_parotida: 'Massa parotídea ou suspeita de neoplasia',
        sinais_sistemicos: 'Sinais sistêmicos',
        multiplos_nervos: 'Envolvimento de múltiplos nervos cranianos',
        achados_neurologicos: 'Achados neurológicos adicionais'
      }
      let selectedMandatoryCriteria: string[] = []
      if (Array.isArray(criteriaData?.criteriosSelecionados)) {
        selectedMandatoryCriteria = criteriaData.criteriosSelecionados
      } else if (answers.bell_criterios_obrigatorios === 'criterios_preenchidos') {
        selectedMandatoryCriteria = Object.keys(bellMandatoryCriteriaLabels)
      }
      const mandatoryCriteriaItems = Object.entries(bellMandatoryCriteriaLabels).map(([key, label]) => {
        const wasSelected = selectedMandatoryCriteria.includes(key)
        return `${wasSelected ? 'Presente' : 'Não registrado'}: ${label}.`
      })
      const supportCriteriaItems = uniqueItems(
        (supportData?.criteriosSuporteSelecionados || []).map((item) => bellSupportCriteriaLabels[item] || item)
      )
      const redFlagItems = uniqueItems(
        (redFlagsData?.redFlagsSelecionadas || []).map((item) => bellRedFlagLabels[item] || item)
      )
      const parsedSideData = safeParse(answers.bell_inicio) as { decision?: string } | null
      const sideDecision = parsedSideData?.decision || answers.bell_inicio
      const sideLabel = sideDecision === 'lado_direito'
        ? 'à direita'
        : sideDecision === 'lado_esquerdo'
          ? 'à esquerda'
          : 'lado não especificado'
      const houseLabelMap: Record<string, string> = {
        house_i: 'Grau I',
        house_ii: 'Grau II',
        house_iii: 'Grau III',
        house_iv: 'Grau IV',
        house_v: 'Grau V',
        house_vi: 'Grau VI'
      }
      const houseValue = houseData?.houseBrackmann || answers.bell_house_brackmann
      const houseLabel = houseData?.houseBrackmannLabel || houseLabelMap[houseValue] || 'não informado'
      const additionalFindings = uniqueItems([
        ...symptoms,
        ...observations,
        ...vitalItems
      ])
      const additionalFindingsText = additionalFindings.length > 0
        ? additionalFindings.join(', ')
        : 'assimetria facial, lagoftalmo e desvio da comissura labial'
      const redFlagsText = redFlagsData?.possuiRedFlag
        ? `Foram registrados sinais de alerta no fluxo${redFlagItems.length > 0 ? `: ${redFlagItems.join('; ')}` : ''}, sendo indicada investigação complementar e avaliação especializada conforme suspeita clínica.`
        : 'Diante das características apresentadas, da ausência de sinais de alerta e da evolução típica, o quadro foi considerado compatível com Paralisia de Bell.'
      const centralInvestigationText = redFlagsData?.possuiRedFlag
        ? 'A presença de sinais de alerta impede conduzir o caso como Paralisia de Bell típica isolada até investigação complementar adequada.'
        : 'Não houve achados clínicos sugestivos de paralisia facial central que indicassem necessidade imediata de investigação complementar com exames de imagem ou outros métodos diagnósticos.'
      const diagnosticCriteriaText = criteriaData?.todosCriteriosPresentes
        ? `Critérios diagnósticos obrigatórios registrados como presentes: ${Object.values(bellMandatoryCriteriaLabels).join('; ')}.`
        : selectedMandatoryCriteria.length === Object.keys(bellMandatoryCriteriaLabels).length
          ? `Critérios diagnósticos obrigatórios registrados como presentes: ${Object.values(bellMandatoryCriteriaLabels).join('; ')}.`
        : 'Os critérios obrigatórios para Paralisia de Bell não foram completamente registrados no fluxo, devendo ser reavaliados antes de confirmar a hipótese diagnóstica.'
      const supportCriteriaText = supportCriteriaItems.length > 0
        ? `Critérios de suporte registrados: ${supportCriteriaItems.join('; ')}.`
        : 'Não foram registrados critérios de suporte adicionais no fluxo.'
      const bellEvolutionText = [
        `Paciente ${patient.name || 'não identificado'}, admitido na unidade com quadro sugestivo de neuropatia periférica do nervo facial, de instalação aguda, apresentando paralisia facial periférica unilateral ${sideLabel}. ${diagnosticCriteriaText}`,
        `Durante o exame físico, foram registrados sinais e sintomas adicionais compatíveis com o diagnóstico, incluindo ${additionalFindingsText}, os quais reforçaram a hipótese de paralisia facial periférica idiopática. ${supportCriteriaText} ${centralInvestigationText}`,
        `${redFlagsText} Em seguida, procedeu-se à avaliação do grau de disfunção motora facial por meio da escala de House-Brackmann, classificando o paciente como ${houseLabel}.`,
        'O paciente foi devidamente informado sobre a natureza da patologia, seu curso clínico esperado, possibilidades terapêuticas e prognóstico. Foi instituído tratamento medicamentoso com corticosteroides e antivirais, conforme diretrizes usuais, além de orientações específicas para cuidados oculares locais, visando proteção da superfície ocular durante o período de fechamento palpebral incompleto. Foram realizados também os encaminhamentos pertinentes para acompanhamento e suporte terapêutico adequado.'
      ].join('\n\n')

      return {
        title: 'PRONTUÁRIO MÉDICO – PARALISIA DE BELL',
        sections: [
          {
            title: 'Identificação do Paciente',
            text: `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${formatGender(patient.gender)}, peso ${formatWeight(patient.weight)}, prontuário nº ${patient.medicalRecord || 'não informado'}.`
          },
          {
            title: 'Queixa Principal',
            text: symptoms[0] || 'Paralisia facial periférica aguda.'
          },
          {
            title: 'Evolução em Prontuário',
            text: bellEvolutionText
          },
          {
            title: 'Critérios Diagnósticos Obrigatórios',
            items: mandatoryCriteriaItems
          },
          {
            title: 'Critérios de Suporte',
            items: supportCriteriaItems.length > 0 ? supportCriteriaItems : ['Sem critérios de suporte adicionais registrados.']
          },
          {
            title: 'Red Flags / Critérios de Exclusão',
            items: redFlagItems.length > 0 ? redFlagItems : ['Red flags ausentes no fluxo.']
          },
          {
            title: 'Classificação House-Brackmann',
            text: houseLabel
          }
        ]
      }
    }

    const groupInfo = getGroupInfo(currentGroup)
    return {
      title: `PRONTUÁRIO MÉDICO – ${(flowchart?.name || flowId).toUpperCase()}`,
      sections: [
        {
          title: 'Identificação do Paciente',
          text: `Paciente ${patient.name || 'não identificado'}, ${patient.age || 'idade não informada'} anos, sexo ${formatGender(patient.gender)}, peso ${formatWeight(patient.weight)}, prontuário nº ${patient.medicalRecord || 'não informado'}.`
        },
        {
          title: 'Queixa Principal',
          text: symptoms.length > 0
            ? symptoms[0]
            : `Avaliação clínica conforme protocolo institucional de ${flowchart?.name || flowId}.`
        },
        {
          title: 'História da Doença Atual',
          text: `Paciente admitido em ${formatDate(patient.admission.date)} para seguimento do protocolo ${flowchart?.name || flowId}. ${symptoms.length > 0 ? `Sintomas registrados na admissão: ${symptoms.join('; ')}.` : 'Sem sintomas estruturados descritos na admissão.'} ${observations.length > 0 ? `Observações adicionais: ${observations.join('; ')}.` : ''}`.trim()
        },
        {
          title: 'Sinais e Sintomas',
          items: symptoms.length > 0 ? symptoms : ['Sem sinais e sintomas estruturados registrados no sistema.']
        },
        {
          title: 'Exame Físico',
          items: vitalItems.length > 0 ? vitalItems : ['Sem dados de exame físico ou sinais vitais registrados no sistema.']
        },
        {
          title: 'Avaliação Clínica',
          items: uniqueItems([
            groupInfo ? `Classificação assistencial: ${groupInfo.name}.` : null,
            groupInfo ? groupInfo.description : null,
            currentStep ? `Etapa atual do fluxograma: ${flowchart?.steps?.[currentStep]?.title || currentStep}.` : null
          ])
        },
        {
          title: 'Exames Complementares',
          items: labItems.length > 0 ? labItems : ['Sem exames complementares registrados no sistema.']
        },
        {
          title: 'Conduta',
          items: uniqueItems([
            prescriptions.length > 0 ? `Prescrições registradas: ${prescriptions.join('; ')}.` : null,
            observations.length > 0 ? `Condutas/observações registradas: ${observations.join('; ')}.` : null,
            'Fluxograma seguido conforme protocolo institucional.'
          ])
        },
        {
          title: 'Plano / Acompanhamento',
          items: uniqueItems([
            patient.treatment.nextEvaluation
              ? `Reavaliação programada para ${formatDateOnly(patient.treatment.nextEvaluation)}.`
              : 'Reavaliação conforme evolução clínica.',
            patient.treatment.dischargeDate
              ? `Alta registrada em ${formatDateOnly(patient.treatment.dischargeDate)}.`
              : null,
            'Orientado retorno em caso de piora clínica ou surgimento de sinais de alerta.'
          ])
        }
      ]
    }
  }

  const report = buildStructuredReport()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-slate-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Relatório Médico Estruturado</h2>
                <p className="text-blue-100">Sistema Siga o Fluxo - Protocolo MS 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={copyReportText}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100' 
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copiar texto do relatório"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="w-5 h-5" />
                    <span className="font-medium">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-5 h-5" />
                    <span className="font-medium">Copiar Texto</span>
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={generatePDF}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Baixar PDF do relatório"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Baixar PDF</span>
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Fechar relatório"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div ref={reportRef} className="p-8 bg-white">
            
            {/* Report Header */}
            <div className="border-b-2 border-slate-200 pb-6 mb-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{report.title}</h1>
                <p className="text-lg text-slate-600">Sistema Siga o Fluxo</p>
                <p className="text-sm text-slate-500">Protocolo de Diagnóstico Clínico - {patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-600">Data do relatório: {formatDate(new Date())}</p>
                <p className="text-sm text-slate-600">Número do protocolo: {patient.id}</p>
              </div>
            </div>

            {/* Classificação em Destaque */}
            {activeGroup && (
              <div className="mb-8">
                <div className={`${getGroupInfo(activeGroup)?.bg} p-6 rounded-xl border-2 ${getGroupInfo(activeGroup)?.color.replace('text-', 'border-')}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${getGroupInfo(activeGroup)?.color.replace('text-', 'bg-')} rounded-2xl flex items-center justify-center`}>
                      <span className="text-white text-2xl font-bold">{activeGroup}</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${getGroupInfo(activeGroup)?.color} mb-1`}>
                        {getGroupInfo(activeGroup)?.name}
                      </h3>
                      <p className={`text-sm ${getGroupInfo(activeGroup)?.color.replace('600', '700')}`}>
                        {getGroupInfo(activeGroup)?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report - Formato estruturado por seções */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="space-y-6 text-slate-800">
                {report.sections.map((section, index) => (
                  <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      {index + 1}. {section.title}
                    </h3>
                    {section.text && (
                      <p className="mt-3 text-base leading-8 text-slate-800 whitespace-pre-line">
                        {section.text}
                      </p>
                    )}
                    {section.items && section.items.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {section.items.map((item) => (
                          <li key={`${section.title}-${item}`} className="flex items-start gap-3 text-base leading-7 text-slate-800">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Footer do Relatório */}
            <div className="border-t-2 border-slate-200 pt-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Siga o Fluxo</p>
                    <p className="text-sm text-slate-600">Protocolo Oficial - Ministério da Saúde 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Relatório gerado automaticamente pelo sistema</p>
                  <p className="text-xs text-slate-500">{formatDate(new Date())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ReportViewer
