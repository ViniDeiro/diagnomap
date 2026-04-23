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
      const narrative = generateNarrativeReport()
      
      // Construir texto completo do relatório
      const groupInfo = getGroupInfo(patient.flowchartState.group)
      const classificationText = groupInfo ? `\nCLASSIFICAÇÃO: ${groupInfo.name}
${groupInfo.description}\n` : ''
      
      const fullText = `RELATÓRIO MÉDICO
Sistema Siga o Fluxo
Protocolo de Diagnóstico Clínico - ${patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}

Data do relatório: ${formatDate(new Date())}
Número do protocolo: ${patient.id}${classificationText}

${narrative.introduction}

${narrative.complaints}${narrative.observations ? ` ${narrative.observations}` : ''}

${narrative.physicalExam}

${narrative.laboratoryResults ? `${narrative.laboratoryResults}

` : ''}${narrative.classification ? `${narrative.classification}

` : ''}${narrative.treatment}${narrative.prescriptions ? ` ${narrative.prescriptions}` : ''}

${narrative.followUp}

${narrative.conclusion}

---
Relatório gerado automaticamente pelo Sistema Siga o Fluxo
${formatDate(new Date())}`

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

  const generateNarrativeReport = () => {
    const safeParse = (value?: string) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }

    const formatStepId = (stepId: string) =>
      stepId
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (char) => char.toUpperCase())

    const flowId = patient.selectedFlowchart || 'dengue'
    const flowchart = getFlowchartById(flowId)
    const answers = patient.flowchartState?.answers || {}
    const currentStep = patient.flowchartState?.currentStep
    const history = patient.flowchartState?.history || []
    const stepSequence = Array.from(new Set([...history, currentStep].filter(Boolean))) as string[]

    const tvpPrescriptionMap: Record<string, string> = {
      rivaroxabana: 'Rivaroxabana',
      apixabana: 'Apixabana',
      dabigatrana: 'Dabigatrana',
      edoxabana: 'Edoxabana',
      enoxaparina: 'Enoxaparina',
      hnf: 'Heparina não fracionada',
      varfarina: 'Varfarina'
    }

    const buildDecisionText = (stepId: string, rawAnswer?: string) => {
      if (!rawAnswer) return ''
      const parsed = safeParse(rawAnswer)
      const step = flowchart?.steps?.[stepId]

      if (parsed?.score != null) {
        const classificacao = parsed?.classificacao ? ` (${String(parsed.classificacao).toUpperCase()})` : ''
        return `Escore ${parsed.score}${classificacao}`
      }

      if (Array.isArray(parsed?.opcoesTerapeuticasSelecionadas) && parsed.opcoesTerapeuticasSelecionadas.length > 0) {
        const meds = parsed.opcoesTerapeuticasSelecionadas.map((id: string) => tvpPrescriptionMap[id] || id)
        return `Opções terapêuticas: ${meds.join(', ')}`
      }

      if (Array.isArray(parsed?.sinaisEAchados) && parsed.sinaisEAchados.length > 0) {
        return `Sinais/achados selecionados: ${parsed.sinaisEAchados.length}`
      }

      if (typeof parsed?.decision === 'string' && parsed.decision.trim()) {
        return `Decisão: ${parsed.decision.trim()}`
      }

      if (step?.options?.length) {
        const selectedOption = step.options.find(
          (option) => option.value === rawAnswer || option.nextStep === rawAnswer || option.text === rawAnswer
        )
        if (selectedOption) return selectedOption.text
      }

      if (typeof parsed === 'object' && parsed) return 'Registro estruturado preenchido'
      return rawAnswer
    }

    const timeline = stepSequence.map((stepId, index) => {
      const stepTitle = flowchart?.steps?.[stepId]?.title || formatStepId(stepId)
      const decision = buildDecisionText(stepId, answers[stepId])
      return `${index + 1}. ${stepTitle}${decision ? ` — ${decision}` : ''}`
    })

    const protocolLabels: Record<string, string> = {
      tvp: 'trombose venosa profunda (TVP)',
      dengue: 'dengue'
    }
    const protocolLabel = protocolLabels[flowId] || (flowchart?.name ? `${flowchart.name}` : flowId.toUpperCase())

    const symptomsText = patient.admission.symptoms.length > 0
      ? patient.admission.symptoms.join(', ')
      : ''

    const vs = patient.admission.vitalSigns || {}
    const vitalSummary = [
      vs.temperature != null ? `Temperatura ${vs.temperature} °C` : null,
      vs.heartRate != null ? `FC ${vs.heartRate} bpm` : null,
      vs.respiratoryRate != null ? `FR ${vs.respiratoryRate} irpm` : null,
      vs.bloodPressure ? `PA ${vs.bloodPressure} mmHg` : null,
      vs.oxygenSaturation != null ? `SpO₂ ${vs.oxygenSaturation}%` : null,
      vs.glucose != null ? `Glicemia ${vs.glucose} mg/dL` : null
    ].filter(Boolean).join(' | ')

    const labs = patient.labResults
    const labFindings: string[] = []
    if (labs?.status === 'pending') {
      labFindings.push('Exames laboratoriais solicitados, ainda pendentes.')
    }
    if (labs?.hemoglobin != null) {
      const hbRange = getHbRange()
      labFindings.push(`Hemoglobina ${labs.hemoglobin} g/dL (ref. ${hbRange.min.toFixed(1)}-${hbRange.max.toFixed(1)})`)
    }
    if (labs?.hematocrit != null) {
      if (labs.hemoglobin != null && labs.hemoglobin > 0) {
        const ratio = (labs.hematocrit / labs.hemoglobin).toFixed(2)
        labFindings.push(`Hematócrito ${labs.hematocrit}% (Ht/Hb ${ratio}x)`)
      } else {
        labFindings.push(`Hematócrito ${labs.hematocrit}%`)
      }
    }
    if (labs?.platelets != null) labFindings.push(`Plaquetas ${labs.platelets.toLocaleString('pt-BR')}/mm³`)
    if (labs?.albumin != null) labFindings.push(`Albumina ${labs.albumin} g/dL`)
    if (labs?.transaminases?.alt != null) labFindings.push(`ALT ${labs.transaminases.alt} U/L`)
    if (labs?.transaminases?.ast != null) labFindings.push(`AST ${labs.transaminases.ast} U/L`)

    const groupInfo = getGroupInfo(patient.flowchartState.group)
    const wellsData = safeParse(answers.wells_score)
    const wellsProbability = wellsData?.classificacao
      ? String(wellsData.classificacao).toLowerCase()
      : ''

    const prescriptions = patient.treatment.prescriptions.map((item) => {
      const parts = [item.medication, item.dosage, item.frequency, item.duration].filter(Boolean)
      return parts.join(' - ')
    })
    const dynamicMedsFromAnswers = Object.values(answers)
      .map((value) => safeParse(value))
      .filter((entry) => Array.isArray(entry?.opcoesTerapeuticasSelecionadas))
      .flatMap((entry) => entry.opcoesTerapeuticasSelecionadas as string[])
      .map((id) => tvpPrescriptionMap[id] || id)
    const allMeds = Array.from(new Set([...prescriptions, ...dynamicMedsFromAnswers]))

    const observationsList = [
      patient.generalObservations?.trim() || '',
      ...(patient.treatment.observations || []).map((item) => item?.trim()).filter(Boolean)
    ].filter(Boolean)

    const chronologyText = timeline.length > 0
      ? `As etapas registradas no sistema durante a condução do caso foram: ${timeline.join('; ')}.`
      : ''

    const identificationText = `Paciente do sexo ${patient.gender}, ${patient.age} anos, prontuário nº ${patient.medicalRecord || 'não informado'}, atendido em ${formatDate(patient.admission.date)}, em avaliação conforme protocolo institucional para investigação de ${protocolLabel}.`

    const complaintsText = symptomsText
      ? `No momento do atendimento, há registro estruturado de sintomas iniciais (${symptomsText}), conforme dados inseridos no sistema.`
      : 'No momento do atendimento, não há registro estruturado da queixa principal, tampouco descrição detalhada da história da doença atual ou de fatores de risco associados.'

    const examText = vitalSummary
      ? `Ao exame inicial, foram registrados os seguintes dados clínicos e sinais vitais: ${vitalSummary}.`
      : 'Não foram registrados, no sistema, dados de exame físico ou sinais vitais no momento da avaliação.'

    const labsText = labFindings.length > 0
      ? `Foram documentados os seguintes resultados de exames complementares: ${labFindings.join('; ')}.`
      : 'Da mesma forma, não há resultados de exames laboratoriais ou de imagem disponíveis até o presente momento.'

    const classificationText = flowId === 'tvp' && wellsData?.score != null
      ? `Foi aplicado o escore de Wells para TVP, com pontuação total de ${wellsData.score} ponto${wellsData.score === 1 ? '' : 's'}, classificando o paciente como de probabilidade clínica ${wellsProbability || 'indeterminada'} para trombose venosa profunda.`
      : groupInfo
        ? `A estratificação clínica pelo protocolo institucional classificou o paciente como ${groupInfo.name.toLowerCase()}, compatível com ${groupInfo.description.toLowerCase()}.`
        : 'Até o momento, não há classificação clínica final estruturada no sistema.'

    const prescriptionsText = allMeds.length > 0
      ? `Foram registradas prescrições médicas no sistema: ${allMeds.join('; ')}.`
      : 'Até o momento, não há prescrições médicas formalmente registradas.'

    const conductText = `A conduta seguiu o protocolo clínico institucional, com registro da evolução conforme as etapas preconizadas pelo sistema. ${prescriptionsText}`

    const followUpText = patient.treatment.nextEvaluation
      ? `Paciente orientado quanto à necessidade de acompanhamento clínico e reavaliação, com retorno programado para ${formatDateOnly(patient.treatment.nextEvaluation)}. Foram fornecidas orientações para procura imediata de atendimento em caso de sinais de alarme.`
      : `Paciente orientado quanto à necessidade de acompanhamento clínico e reavaliação conforme evolução do quadro, embora não haja data de retorno agendada no sistema. Foram fornecidas orientações para procura imediata de atendimento em caso de sinais de alarme${flowId === 'tvp' ? ', como piora da dor, aumento de edema em membro, dispneia ou dor torácica' : ''}.`

    const conclusionText = flowId === 'tvp' && wellsData?.score != null
      ? `Conclui-se que o paciente encontra-se em investigação para TVP, com probabilidade clínica ${wellsProbability || 'indeterminada'} segundo escore de Wells, aguardando complementação de dados clínicos e realização de exames para definição diagnóstica e conduta terapêutica.`
      : `Conclui-se que o paciente encontra-se em investigação conforme protocolo institucional de ${protocolLabel}, aguardando complementação de dados clínicos e evolução para definição diagnóstica e terapêutica.`

    const mergedObservations = [
      chronologyText,
      observationsList.length > 0 ? `Observações adicionais registradas: ${observationsList.join('; ')}.` : ''
    ].filter(Boolean).join(' ')

    return {
      introduction: identificationText,
      complaints: complaintsText,
      physicalExam: examText,
      laboratoryResults: labsText,
      classification: classificationText,
      treatment: conductText,
      prescriptions: '',
      shockManagement: '',
      observations: mergedObservations,
      followUp: followUpText,
      conclusion: conclusionText
    }
  }

  const narrative = generateNarrativeReport()

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
                <h2 className="text-2xl font-bold">Relatório Médico Narrativo</h2>
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
                <h1 className="text-3xl font-bold text-slate-800 mb-2">RELATÓRIO MÉDICO</h1>
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

            {/* Narrative Report - Formato Contínuo como Redação Médica */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-slate-800">
                  <p className="text-lg leading-10 text-justify indent-8 font-medium">
                    {narrative.introduction}
                  </p>
                  
                  <p className="text-lg leading-10 text-justify indent-8">
                    {narrative.complaints}
                    {narrative.observations && ` ${narrative.observations}`}
                  </p>
                  
                  <p className="text-lg leading-10 text-justify indent-8">
                    {narrative.physicalExam}
                  </p>
                  
                  {narrative.laboratoryResults && (
                    <p className="text-lg leading-10 text-justify indent-8">
                      {narrative.laboratoryResults}
                    </p>
                  )}
                  
                  {narrative.classification && (
                    <p className="text-lg leading-10 text-justify indent-8">
                      {narrative.classification}
                    </p>
                  )}
                  
                  <p className="text-lg leading-10 text-justify indent-8">
                    {narrative.treatment}
                    {narrative.prescriptions && ` ${narrative.prescriptions}`}
                    {narrative.shockManagement && ` ${narrative.shockManagement}`}
                  </p>
                  
                  <p className="text-lg leading-10 text-justify indent-8">
                    {narrative.followUp}
                  </p>
                  
                  <p className="text-lg leading-10 text-justify indent-8 font-medium">
                    {narrative.conclusion}
                  </p>
                </div>
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
