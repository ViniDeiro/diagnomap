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
    if (patient.admission.vitalSigns?.temperature != null) {
      const temp = patient.admission.vitalSigns.temperature as number
      const days = patient.admission.vitalSigns.feverDays

      // Parametrização institucional para temperatura
      if (temp < 28) {
        feverInfo = `hipotermia grave (${temp}°C)`
      } else if (temp <= 31.9) {
        feverInfo = `hipotermia moderada (${temp}°C)`
      } else if (temp <= 35.9) {
        feverInfo = `hipotermia leve (${temp}°C)`
      } else if (temp >= 36.0 && temp <= 37.2) {
        feverInfo = `temperatura dentro da normalidade (${temp}°C)`
      } else if (temp <= 37.7) {
        feverInfo = `estado subfebril (${temp}°C)`
      } else if (temp <= 39.9) {
        feverInfo = `febre (${temp}°C)`
      } else if (temp > 40) {
        feverInfo = `hipertermia (${temp}°C)`
      } else {
        // valor limítrofe (≈ 40°C)
        feverInfo = `febre alta (${temp}°C)`
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
          // Adicionar cálculo da Pressão Arterial Média (PAM)
          const pam = vs.pam != null ? Math.round(vs.pam) : Math.round((systolic + 2 * diastolic) / 3)
          vitals.push(`pressão arterial média (PAM) ≈ ${pam} mmHg`)
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

      // Saturação periférica de oxigênio (SpO2)
      if (vs.oxygenSaturation != null) {
        const spo2 = vs.oxygenSaturation
        if (spo2 <= 85) {
          vitals.push(`hipoxemia severa (SpO₂ ${spo2}%)`)
        } else if (spo2 <= 89) {
          vitals.push(`hipoxemia moderada (SpO₂ ${spo2}%)`)
        } else if (spo2 <= 94) {
          vitals.push(`hipoxemia leve (SpO₂ ${spo2}%)`)
        } else {
          vitals.push(`saturação periférica de O₂ preservada (SpO₂ ${spo2}%)`)
        }
      }

      // Glicemia capilar (mg/dL)
      if (vs.glucose) {
        const gStr = vs.glucose.trim().toUpperCase()
        if (gStr === 'HI') {
          vitals.push('hiperglicemia extrema (HI)')
        } else if (gStr === 'LO') {
          vitals.push('hipoglicemia extrema (LO)')
        } else {
          const gVal = parseFloat(gStr)
          if (!isNaN(gVal)) {
            if (gVal >= 200) {
              vitals.push(`hiperglicemia severa (${gVal} mg/dL)`) 
            } else if (gVal >= 151) {
              vitals.push(`hiperglicemia moderada (${gVal} mg/dL)`) 
            } else if (gVal >= 126) {
              vitals.push(`hiperglicemia leve (${gVal} mg/dL)`) 
            } else if (gVal >= 100) {
              vitals.push(`glicemia em faixa de pré-diabetes (${gVal} mg/dL)`) 
            } else if (gVal >= 75) {
              vitals.push(`glicemia dentro da normalidade (${gVal} mg/dL)`) 
            } else if (gVal >= 60) {
              vitals.push(`hipoglicemia leve (${gVal} mg/dL)`) 
            } else if (gVal >= 45) {
              vitals.push(`hipoglicemia moderada (${gVal} mg/dL)`) 
            } else {
              vitals.push(`hipoglicemia severa (${gVal} mg/dL)`) 
            }
          }
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
      
      if (patient.labResults.hemoglobin != null) {
        const hb = patient.labResults.hemoglobin
        const range = getHbRange()
        const refText = `${range.min.toFixed(1)}–${range.max.toFixed(1)} g/dL`
        if (hb < range.min) {
          findings.push(`hemoglobina abaixo da faixa (${hb} g/dL; ref. ${refText})`)
        } else if (hb > range.max) {
          findings.push(`hemoglobina acima da faixa (${hb} g/dL; ref. ${refText})`)
        } else {
          findings.push(`hemoglobina dentro da faixa (${hb} g/dL; ref. ${refText})`)
        }
      }
      
      if (patient.labResults.hematocrit != null) {
        const ht = patient.labResults.hematocrit
        const hb = patient.labResults.hemoglobin
        if (hb != null && hb > 0) {
          const ratio = ht / hb
          const r = ratio.toFixed(1)
          if (ratio >= 2.8 && ratio <= 3.2) {
            findings.push(`hematócrito dentro da faixa (Ht/Hb ${r}x)`) 
          } else if (ratio >= 3.21 && ratio <= 3.59) {
            findings.push(`hematócrito aumentado (Ht/Hb ${r}x)`) 
          } else if (ratio >= 3.6) {
            findings.push(`hemoconcentração (Ht/Hb ${r}x)`) 
          } else {
            findings.push(`razão Ht/Hb ${r}x, abaixo do esperado`) 
          }
        } else {
          findings.push(`hematócrito de ${ht}%`)
        }
      }
      
      if (patient.labResults.platelets != null) {
        const plt = patient.labResults.platelets
        if (plt > 450000) {
          findings.push(`plaquetose (${plt.toLocaleString()}/mm³)`) 
        } else if (plt < 20000) {
          findings.push(`plaquetopenia muito grave (${plt.toLocaleString()}/mm³)`) 
        } else if (plt < 50000) {
          findings.push(`plaquetopenia grave (${plt.toLocaleString()}/mm³)`) 
        } else if (plt < 100000) {
          findings.push(`plaquetopenia moderada (${plt.toLocaleString()}/mm³)`) 
        } else if (plt < 150000) {
          findings.push(`plaquetopenia leve (${plt.toLocaleString()}/mm³)`) 
        } else {
          findings.push(`contagem plaquetária preservada (${plt.toLocaleString()}/mm³)`) 
        }
      }
      
      if (patient.labResults.albumin != null) {
        const alb = patient.labResults.albumin
        if (alb > 5.6) {
          findings.push(`hiperalbuminemia (${alb} g/dL)`) 
        } else if (alb >= 3.5 && alb <= 5.5) {
          findings.push(`albumina dentro da faixa (3,5–5,5 g/dL; medido ${alb} g/dL)`) 
        } else if (alb >= 3.0 && alb < 3.5) {
          findings.push(`hipoalbuminemia leve (${alb} g/dL)`) 
        } else if (alb < 2.0) {
          findings.push(`hipoalbuminemia grave (${alb} g/dL)`) 
        } else {
          findings.push(`hipoalbuminemia moderada (${alb} g/dL)`) 
        }
      }
      
      if (patient.labResults.transaminases?.alt != null || patient.labResults.transaminases?.ast != null) {
        const alt = patient.labResults.transaminases?.alt
        const ast = patient.labResults.transaminases?.ast

        const transFindings: string[] = []

        if (alt != null) {
          if (alt <= 56) transFindings.push(`ALT normal (7–56 U/L; ${alt} U/L)`) 
          else if (alt <= 120) transFindings.push(`ALT elevação leve (57–120 U/L; ${alt} U/L)`) 
          else if (alt <= 220) transFindings.push(`ALT elevação moderada (121–220 U/L; ${alt} U/L)`) 
          else transFindings.push(`ALT elevação grave (≥ 221 U/L; ${alt} U/L)`) 
        }

        if (ast != null) {
          if (ast <= 40) transFindings.push(`AST normal (5–40 U/L; ${ast} U/L)`) 
          else if (ast <= 100) transFindings.push(`AST elevação leve (41–100 U/L; ${ast} U/L)`) 
          else if (ast <= 200) transFindings.push(`AST elevação moderada (101–200 U/L; ${ast} U/L)`) 
          else transFindings.push(`AST elevação grave (≥ 201 U/L; ${ast} U/L)`) 
        }

        if (transFindings.length > 0) {
          findings.push(transFindings.join('; ')) 
        } else {
          findings.push('função hepática preservada') 
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
      introduction: `Paciente ${patient.name}, sexo ${gender}, ${patient.age} anos de idade, sendo realizado atendimento médico às ${admissionTime} do dia ${admissionDate}, para avaliação de quadro clínico sugestivo de síndrome febril aguda.`,
      
      complaints: symptomsText ? 
        `À anamnese, ${isFemale ? 'a paciente relatou' : 'o paciente relatou'} ${symptomsText}${feverInfo ? `, apresentando ${feverInfo}` : ''}. A história clínica atual sugere processo infeccioso de etiologia viral, com características epidemiológicas compatíveis com arbovirose.` : 
        `${isFemale ? 'A paciente foi submetida' : 'O paciente foi submetido'} à avaliação clínica sistemática para investigação de síndrome febril aguda.`,
      
      physicalExam: vitalSignsInfo ? 
        `O exame físico geral revelou paciente em regular estado geral, ${isFemale ? 'consciente e orientada' : 'consciente e orientado'}, com sinais vitais ${vitalSignsInfo}. O exame segmentar não evidenciou alterações significativas nos demais aparelhos e sistemas.` : 
        `Ao exame físico, ${isFemale ? 'a paciente apresentava-se' : 'o paciente apresentava-se'} em bom estado geral, com exame segmentar dentro dos parâmetros de normalidade.`,
      
      laboratoryResults: labInfo,
      
      classification: groupInfo ? 
        (() => {
          // Recuperar fatores de risco específicos do localStorage
          const savedRiskFactors = localStorage.getItem(`risk_factors_${patient.id}`)
          let riskFactorsText = ''
          
          if (savedRiskFactors && groupInfo.name.includes('Grupo B')) {
            try {
              const riskFactors = JSON.parse(savedRiskFactors) as string[]
              if (riskFactors.length > 0) {
                if (riskFactors.length === 1) {
                  riskFactorsText = ` Os fatores de risco identificados incluem: ${riskFactors[0].toLowerCase()}.`
                } else if (riskFactors.length === 2) {
                  riskFactorsText = ` Os fatores de risco identificados incluem: ${riskFactors[0].toLowerCase()} e ${riskFactors[1].toLowerCase()}.`
                } else {
                  riskFactorsText = ` Os fatores de risco identificados incluem: ${riskFactors.slice(0, -1).map(f => f.toLowerCase()).join(', ')} e ${riskFactors[riskFactors.length - 1].toLowerCase()}.`
                }
              }
            } catch (error) {
              console.warn('Erro ao recuperar fatores de risco:', error)
            }
          }

          const diseaseName = patient.selectedFlowchart 
            ? patient.selectedFlowchart.charAt(0).toUpperCase() + patient.selectedFlowchart.slice(1)
            : 'Dengue'
          const groupLetter = patient.flowchartState.group || groupInfo.name.match(/Grupo\s([ABCD])/i)?.[1] || 'B'
          const basePhrase = `${isFemale ? 'A paciente foi submetida' : 'O paciente foi submetido'} à estratificação de risco conforme protocolo institucional, sendo ${isFemale ? 'classificada' : 'classificado'} como Grupo ${groupLetter} de ${diseaseName}.`
          
          return `${basePhrase} Após análise criteriosa dos dados clínicos, epidemiológicos e laboratoriais, utilizando-se o protocolo padronizado pelo Ministério da Saúde para manejo de ${patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}, ${isFemale ? 'a paciente foi estratificada' : 'o paciente foi estratificado'} no ${groupInfo.name}. Esta classificação baseia-se na presença de critérios específicos que caracterizam ${groupInfo.risk}, demandando abordagem terapêutica direcionada.${riskFactorsText}`
        })() : 
        (() => {
          const diseaseName = patient.selectedFlowchart 
            ? patient.selectedFlowchart.charAt(0).toUpperCase() + patient.selectedFlowchart.slice(1)
            : 'Dengue'
          const letter = patient.flowchartState.group || 'A'
          return `${isFemale ? 'A paciente foi submetida' : 'O paciente foi submetido'} à estratificação de risco conforme protocolo institucional, sendo ${isFemale ? 'classificada' : 'classificado'} como Grupo ${letter} de ${diseaseName}.`
        })(),
      
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