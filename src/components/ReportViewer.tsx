'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Thermometer,
  Droplets,
  Shield,
  Brain,
  Stethoscope,
  Award,
  Clock,
  Target,
  Zap,
  Clipboard,
  ClipboardCheck
} from 'lucide-react'
import { Patient } from '@/types/patient'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportViewerProps {
  patient: Patient
  onClose: () => void
}

const ReportViewer: React.FC<ReportViewerProps> = ({ patient, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)

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
      const fullText = `RELATÓRIO MÉDICO
Sistema DiagnoMap Pro
Protocolo de Diagnóstico Clínico - ${patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}

Data do relatório: ${formatDate(new Date())}
Número do protocolo: ${patient.id}

${narrative.introduction}

${narrative.complaints}${narrative.observations ? ` ${narrative.observations}` : ''}

${narrative.physicalExam}

${narrative.laboratoryResults ? `${narrative.laboratoryResults}

` : ''}${narrative.classification ? `${narrative.classification}

` : ''}${narrative.treatment}${narrative.prescriptions ? ` ${narrative.prescriptions}` : ''}

${narrative.followUp}

${narrative.conclusion}

---
Relatório gerado automaticamente pelo Sistema DiagnoMap Pro
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
    const groupInfo = getGroupInfo(patient.flowchartState.group)
    const admissionDate = formatDateOnly(patient.admission.date)
    const admissionTime = patient.admission.time
    
    // Usar o sexo definido no cadastro do paciente
    const isFemale = patient.gender === 'feminino'
    const gender = patient.gender
    
    // Construir lista de sintomas de forma mais fluida
    const symptoms = patient.admission.symptoms
    let symptomsText = ''
    if (symptoms.length > 0) {
      const symptomsList = symptoms.map(s => s.toLowerCase())
      if (symptomsList.includes('febre')) {
        symptomsText = 'quadro febril'
        if (symptomsList.length > 1) {
          const otherSymptoms = symptomsList.filter(s => s !== 'febre')
          if (otherSymptoms.length === 1) {
            symptomsText += ` associado a ${otherSymptoms[0]}`
          } else {
            symptomsText += ` acompanhado de ${otherSymptoms.slice(0, -1).join(', ')} e ${otherSymptoms[otherSymptoms.length - 1]}`
          }
        }
      } else {
        if (symptomsList.length === 1) {
          symptomsText = `manifestações clínicas caracterizadas por ${symptomsList[0]}`
        } else if (symptomsList.length === 2) {
          symptomsText = `sintomatologia constituída por ${symptomsList[0]} e ${symptomsList[1]}`
        } else {
          symptomsText = `sintomatologia polimórfica incluindo ${symptomsList.slice(0, -1).join(', ')} e ${symptomsList[symptomsList.length - 1]}`
        }
      }
    }

    // Construir informações sobre febre de forma mais técnica
    let feverInfo = ''
    if (patient.admission.vitalSigns?.temperature) {
      const temp = patient.admission.vitalSigns.temperature
      const days = patient.admission.vitalSigns.feverDays
      
      if (temp >= 39) {
        feverInfo = `hipertermia significativa (${temp}°C)`
      } else if (temp >= 37.8) {
        feverInfo = `febre moderada (${temp}°C)`
      } else {
        feverInfo = `estado subfebril (${temp}°C)`
      }
      
      if (days) {
        if (days === 1) {
          feverInfo += ' com início há 24 horas'
        } else if (days <= 3) {
          feverInfo += ` com evolução de ${days} dias, caracterizando fase febril aguda`
        } else if (days <= 7) {
          feverInfo += ` persistente há ${days} dias, compatível com síndrome febril prolongada`
        } else {
          feverInfo += ` com duração prolongada de ${days} dias`
        }
      }
    }

    // Construir informações sobre sinais vitais de forma mais técnica
    let vitalSignsInfo = ''
    const vs = patient.admission.vitalSigns
    if (vs) {
      const vitals = []
      
      if (vs.bloodPressure) {
        const [systolic, diastolic] = vs.bloodPressure.split('/').map(p => parseInt(p.trim()))
        if (systolic && diastolic) {
          if (systolic < 90 || diastolic < 60) {
            vitals.push(`hipotensão arterial (${vs.bloodPressure} mmHg)`)
          } else if (systolic > 140 || diastolic > 90) {
            vitals.push(`hipertensão arterial (${vs.bloodPressure} mmHg)`)
          } else {
            vitals.push(`pressão arterial dentro dos parâmetros de normalidade (${vs.bloodPressure} mmHg)`)
          }
        }
      }
      
      if (vs.heartRate) {
        if (vs.heartRate > 100) {
          vitals.push(`taquicardia (${vs.heartRate} bpm)`)
        } else if (vs.heartRate < 60) {
          vitals.push(`bradicardia (${vs.heartRate} bpm)`)
        } else {
          vitals.push(`frequência cardíaca regular (${vs.heartRate} bpm)`)
        }
      }
      
      if (vs.respiratoryRate) {
        if (vs.respiratoryRate > 20) {
          vitals.push(`taquipneia (${vs.respiratoryRate} rpm)`)
        } else if (vs.respiratoryRate < 12) {
          vitals.push(`bradipneia (${vs.respiratoryRate} rpm)`)
        } else {
          vitals.push(`padrão respiratório regular (${vs.respiratoryRate} rpm)`)
        }
      }
      
      if (vitals.length > 0) {
        if (vitals.length === 1) {
          vitalSignsInfo = `evidenciando ${vitals[0]}`
        } else if (vitals.length === 2) {
          vitalSignsInfo = `demonstrando ${vitals[0]} e ${vitals[1]}`
        } else {
          vitalSignsInfo = `revelando ${vitals.slice(0, -1).join(', ')} e ${vitals[vitals.length - 1]}`
        }
      }
    }

    // Construir informações sobre exames de forma mais técnica
    let labInfo = ''
    if (patient.labResults && patient.labResults.status === 'completed') {
      const findings = []
      
      if (patient.labResults.hemoglobin) {
        const hb = patient.labResults.hemoglobin
        if (hb < 12) {
          findings.push(`anemia leve com hemoglobina de ${hb} g/dL`)
        } else if (hb < 10) {
          findings.push(`anemia moderada com hemoglobina de ${hb} g/dL`)
        } else {
          findings.push(`níveis de hemoglobina dentro da normalidade (${hb} g/dL)`)
        }
      }
      
      if (patient.labResults.hematocrit) {
        const ht = patient.labResults.hematocrit
        findings.push(`hematócrito de ${ht}%`)
      }
      
      if (patient.labResults.platelets) {
        const plt = patient.labResults.platelets
        if (plt < 100000) {
          findings.push(`trombocitopenia severa (${plt.toLocaleString()}/mm³)`)
        } else if (plt < 150000) {
          findings.push(`trombocitopenia leve (${plt.toLocaleString()}/mm³)`)
        } else {
          findings.push(`contagem plaquetária preservada (${plt.toLocaleString()}/mm³)`)
        }
      }
      
      if (patient.labResults.albumin) {
        const alb = patient.labResults.albumin
        if (alb < 3.5) {
          findings.push(`hipoalbuminemia (${alb} g/dL)`)
        } else {
          findings.push(`níveis de albumina normais (${alb} g/dL)`)
        }
      }
      
      if (patient.labResults.transaminases?.alt || patient.labResults.transaminases?.ast) {
        const alt = patient.labResults.transaminases.alt
        const ast = patient.labResults.transaminases.ast
        if ((alt && alt > 40) || (ast && ast > 40)) {
          findings.push(`elevação das transaminases (ALT: ${alt || 'NR'}, AST: ${ast || 'NR'} U/L)`)
        } else {
          findings.push(`função hepática preservada`)
        }
      }
      
      if (findings.length > 0) {
        labInfo = `A investigação laboratorial complementar evidenciou ${findings.join(', ')}, achados compatíveis com o quadro clínico apresentado.`
      }
    } else if (patient.labResults && patient.labResults.status === 'pending') {
      labInfo = 'Foram solicitados exames laboratoriais complementares para elucidação diagnóstica e estratificação de risco, encontrando-se pendentes de resultado no momento desta avaliação.'
    }

    // Construir informações sobre prescrições de forma mais técnica
    let prescriptionInfo = ''
    if (patient.treatment.prescriptions.length > 0) {
      const medications = patient.treatment.prescriptions.map(p => p.medication.toLowerCase())
      
      // Categorizar medicamentos
      const analgesicos = medications.filter(m => m.includes('paracetamol') || m.includes('dipirona'))
      const hidratacao = medications.filter(m => m.includes('soro') || m.includes('hidratação'))
      const outros = medications.filter(m => !analgesicos.includes(m) && !hidratacao.includes(m))
      
      const treatments = []
      
      if (analgesicos.length > 0) {
        treatments.push('terapia analgésica e antitérmica')
      }
      
      if (hidratacao.length > 0) {
        treatments.push('suporte hidroeletrolítico')
      }
      
      if (outros.length > 0) {
        treatments.push('terapia adjuvante específica')
      }
      
      if (treatments.length > 0) {
        prescriptionInfo = `Instituiu-se protocolo terapêutico baseado em ${treatments.join(', ')}, conforme diretrizes clínicas estabelecidas.`
      }
    }

    // Observações de forma mais técnica
    let observationsInfo = ''
    const allObservations = []
    
    if (patient.generalObservations && patient.generalObservations.trim()) {
      allObservations.push(patient.generalObservations)
    }
    
    if (patient.treatment.observations.length > 0) {
      allObservations.push(...patient.treatment.observations)
    }
    
    if (allObservations.length > 0) {
      observationsInfo = `Observações clínicas relevantes incluem: ${allObservations.join('. ')}.`
    }

    return {
      introduction: `Trata-se de paciente do sexo ${gender}, ${patient.name}, com ${patient.age} anos de idade, ${isFemale ? 'portadora' : 'portador'} do registro hospitalar ${patient.medicalRecord}, que procurou atendimento médico nesta unidade assistencial em ${admissionDate}, às ${admissionTime}, para avaliação de quadro clínico sugestivo de síndrome febril aguda.`,
      
      complaints: symptomsText ? 
        `À anamnese, ${isFemale ? 'a paciente relatou' : 'o paciente relatou'} ${symptomsText}${feverInfo ? `, apresentando ${feverInfo}` : ''}. A história clínica atual sugere processo infeccioso de etiologia viral, com características epidemiológicas compatíveis com arbovirose.` : 
        `${isFemale ? 'A paciente foi submetida' : 'O paciente foi submetido'} à avaliação clínica sistemática para investigação de síndrome febril aguda.`,
      
      physicalExam: vitalSignsInfo ? 
        `O exame físico geral revelou paciente em regular estado geral, ${isFemale ? 'consciente e orientada' : 'consciente e orientado'}, com sinais vitais ${vitalSignsInfo}. O exame segmentar não evidenciou alterações significativas nos demais aparelhos e sistemas.` : 
        `Ao exame físico, ${isFemale ? 'a paciente apresentava-se' : 'o paciente apresentava-se'} em bom estado geral, com exame segmentar dentro dos parâmetros de normalidade.`,
      
      laboratoryResults: labInfo,
      
      classification: groupInfo ? 
        `Após análise criteriosa dos dados clínicos, epidemiológicos e laboratoriais, utilizando-se o protocolo padronizado pelo Ministério da Saúde para manejo de ${patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}, ${isFemale ? 'a paciente foi estratificada' : 'o paciente foi estratificado'} no ${groupInfo.name}. Esta classificação baseia-se na presença de critérios específicos que caracterizam ${groupInfo.risk}, demandando abordagem terapêutica direcionada.` : 
        `${isFemale ? 'A paciente foi submetida' : 'O paciente foi submetido'} à estratificação de risco conforme protocolo institucional.`,
      
      treatment: groupInfo ? 
        `O plano terapêutico instituído contempla ${groupInfo.treatment}, seguindo rigorosamente as diretrizes clínicas preconizadas. Esta abordagem visa otimizar o prognóstico e minimizar o risco de complicações.` : 
        'Foi estabelecido plano terapêutico individualizado conforme necessidades clínicas identificadas.',
      
      prescriptions: prescriptionInfo,
      
      observations: observationsInfo,
      
      followUp: patient.treatment.nextEvaluation ? 
        `Programou-se reavaliação clínica para ${formatDateOnly(patient.treatment.nextEvaluation)}, com orientações específicas para retorno imediato em caso de surgimento de sinais de alarme ou deterioração do quadro clínico.` : 
        `${isFemale ? 'A paciente foi orientada' : 'O paciente foi orientado'} quanto aos sinais de alarme e critérios para retorno, estabelecendo-se seguimento ambulatorial conforme evolução clínica e protocolo assistencial vigente.`,
      
      conclusion: `O atendimento prestado seguiu integralmente os protocolos clínicos estabelecidos pelo Ministério da Saúde, garantindo abordagem baseada em evidências científicas. ${isFemale ? 'A paciente' : 'O paciente'} e/ou responsáveis legais receberam orientações detalhadas sobre a patologia, sinais de alarme, medidas de suporte domiciliar e critérios para retorno ao serviço de saúde. A conduta adotada visa assegurar desfecho clínico favorável e prevenção de complicações, mantendo-se vigilância epidemiológica adequada conforme preconizado pelas autoridades sanitárias.`
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
                <p className="text-blue-100">Sistema DiagnoMap Pro - Protocolo MS 2024</p>
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
                <p className="text-lg text-slate-600">Sistema DiagnoMap Pro</p>
                <p className="text-sm text-slate-500">Protocolo de Diagnóstico Clínico - {patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-600">Data do relatório: {formatDate(new Date())}</p>
                <p className="text-sm text-slate-600">Número do protocolo: {patient.id}</p>
              </div>
            </div>

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
                    <p className="font-bold text-slate-800">DiagnoMap Pro</p>
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