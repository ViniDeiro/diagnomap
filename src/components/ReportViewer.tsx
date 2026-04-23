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

interface ReportViewerProps {
  patient: Patient
  onClose: () => void
}

const ReportViewer: React.FC<ReportViewerProps> = ({ patient, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)

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
      const vs = patient.admission.vitalSigns || {}
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
      const labs = patient.labResults
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

    const flowId = patient.selectedFlowchart || 'dengue'
    const flowchart = getFlowchartById(flowId)
    const answers = patient.flowchartState?.answers || {}
    const currentStep = patient.flowchartState?.currentStep || ''
    const symptoms = uniqueItems(patient.admission.symptoms)
    const vitalItems = buildVitalsList()
    const labItems = buildLabItems()
    const prescriptions = uniqueItems(
      patient.treatment.prescriptions.map((item) => {
        const parts = [item.medication, item.dosage, item.frequency, item.duration].filter(Boolean)
        return parts.join(' - ')
      })
    )
    const observations = uniqueItems([
      patient.generalObservations,
      ...(patient.treatment.observations || [])
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
      const isUrgentVascular = currentStep === 'tvp_urgencia_vascular_imediata'
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
        prescriptions.length > 0 ? `Prescrições registradas no sistema: ${prescriptions.join('; ')}.` : null
      ])

      const planItems = uniqueItems([
        treatmentData?.planoDuracaoSelecionado
          ? TVP_DURATION_PLAN_LABELS[treatmentData.planoDuracaoSelecionado] || treatmentData.planoDuracaoSelecionado
          : null,
        patient.treatment.nextEvaluation
          ? `Reavaliação programada para ${formatDateOnly(patient.treatment.nextEvaluation)}.`
          : 'Reavaliação clínica conforme evolução e protocolo institucional.',
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
          {
            title: 'Plano / Acompanhamento',
            items: planItems
          }
        ]
      }
    }

    const groupInfo = getGroupInfo(patient.flowchartState.group)
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
            {patient.flowchartState.group && (
              <div className="mb-8">
                <div className={`${getGroupInfo(patient.flowchartState.group)?.bg} p-6 rounded-xl border-2 ${getGroupInfo(patient.flowchartState.group)?.color.replace('text-', 'border-')}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${getGroupInfo(patient.flowchartState.group)?.color.replace('text-', 'bg-')} rounded-2xl flex items-center justify-center`}>
                      <span className="text-white text-2xl font-bold">{patient.flowchartState.group}</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${getGroupInfo(patient.flowchartState.group)?.color} mb-1`}>
                        {getGroupInfo(patient.flowchartState.group)?.name}
                      </h3>
                      <p className={`text-sm ${getGroupInfo(patient.flowchartState.group)?.color.replace('600', '700')}`}>
                        {getGroupInfo(patient.flowchartState.group)?.description}
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
