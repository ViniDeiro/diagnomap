'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Download, 
  Pill,
  Stethoscope,
  Zap,
  Clipboard,
  ClipboardCheck
} from 'lucide-react'
import { Patient } from '@/types/patient'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import clsx from 'clsx'

interface MedicalPrescriptionViewerProps {
  patient: Patient
  onClose: () => void
}

const MedicalPrescriptionViewer: React.FC<MedicalPrescriptionViewerProps> = ({ patient, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'orientations' | 'prescriptions'>('orientations')

  const generatePDF = async () => {
    if (!reportRef.current) return

    try {
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

      pdf.save(`receituario_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const copyReportText = async () => {
    try {
      const prescriptionText = generatePrescriptionText()
      await navigator.clipboard.writeText(prescriptionText)
      setCopied(true)
      
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

  // Função para calcular hidratação oral baseada no peso
  const calculateHydration = (weight?: number) => {
    if (!weight) return null
    
    const totalDaily = Math.round(weight * 60) // mL/dia
    const withSalts = Math.round(totalDaily / 3) // 1/3 com sais
    const withLiquids = Math.round((totalDaily * 2) / 3) // 2/3 com líquidos caseiros
    
    return {
      totalDaily,
      withSalts,
      withLiquids,
      liters: (totalDaily / 1000).toFixed(1)
    }
  }

  const generatePrescriptionText = () => {
    const hydration = calculateHydration(patient.weight)
    const meds = patient.treatment.prescriptions.map(p => p.medication.toLowerCase())
    const chosenAntipyretic = meds.find(m => m.includes('paracetamol'))
      ? 'Paracetamol'
      : meds.find(m => m.includes('dipirona'))
        ? 'Dipirona'
        : null

    const antipyreticBlock = (() => {
      if (chosenAntipyretic === 'Paracetamol') {
        return [
          '• Paracetamol: adultos 500–750 mg VO a cada 6–8h (máx 3 g/dia)',
          `• Pediátrico: 10–15 mg/kg VO a cada 6–8h${patient.weight ? ` (≈ ${Math.round(patient.weight)}–${Math.round(patient.weight * 1.5)} gotas/dose, sol. 200mg/mL)` : ''}`
        ].join('\n')
      }
      if (chosenAntipyretic === 'Dipirona') {
        return [
          '• Dipirona: adultos 500–1000 mg VO a cada 6–8h (máx 4 g/dia)',
          `• Pediátrico: 10 mg/kg VO a cada 6–8h${patient.weight ? ` (≈ ${Math.round((patient.weight * 10) / 25)} gotas/dose, sol. 500mg/mL)` : ''}`
        ].join('\n')
      }
      return [
        '• Dipirona: adultos 500–1000 mg VO a cada 6–8h (máx 4 g/dia)',
        '• Paracetamol: adultos 500–750 mg VO a cada 6–8h (máx 3 g/dia)',
        '• Crianças: Paracetamol 10–15 mg/kg VO a cada 6–8h (máx 60 mg/kg/dia); Dipirona 10 mg/kg VO a cada 6–8h'
      ].join('\n')
    })()

    const mappedPrescriptions = patient.treatment.prescriptions.map((prescription, index) => {
      const instructionsLine = prescription.instructions ? `Instruções: ${prescription.instructions}` : ''
      return `${index + 1}. ${prescription.medication}\n   Dosagem: ${prescription.dosage}\n   Frequência: ${prescription.frequency}\n   Duração: ${prescription.duration}\n   ${instructionsLine}`
    }).join('\n\n')

    const prescriptionsText = patient.treatment.prescriptions.length > 0
      ? `Medicamentos Prescritos:\n${mappedPrescriptions}\n\n`
      : ''

    return [
      'RECEITUÁRIO MÉDICO',
      'Sistema Siga o Fluxo',
      '',
      `Paciente: ${patient.name}`,
      `Idade: ${patient.age} anos`,
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      '',
      'Diagnóstico: Dengue',
      `Classificação: ${patient.flowchartState.group ? `Grupo ${patient.flowchartState.group}` : 'Não classificado'}`,
      '',
      'Orientações:',
      '',
      ' 1. Hidratação Oral',
      hydration
        ? `• Total diário: ${hydration.totalDaily} mL/dia (${hydration.liters} litros/dia)\n§ 1/3 com sais de reidratação oral → ${hydration.withSalts} mL/dia\n§ 2/3 com líquidos caseiros → ${hydration.withLiquids} mL/dia (água, suco de frutas, soro caseiro, chás, água de coco etc.)`
        : '• Orientação geral:\n§ 1/3 com sais de reidratação oral\n§ 2/3 com líquidos caseiros (água, suco de frutas, soro caseiro, chás, água de coco etc.)',
      '§ Inicialmente, oferecer maior volume para evitar desidratação.',
      '',
      '2. Retorno Imediato na presença de sinais de alarme, incluindo:',
      '• Dor abdominal intensa e contínua',
      '• Vômitos persistentes',
      '• Sangramentos de mucosa ou outros sinais de hemorragia',
      '• Letargia ou irritabilidade',
      '• Hipotensão ou tontura',
      '• Diminuição repentina da diurese (urina reduzida)',
      '',
      '3. Seguimento Ambulatorial',
      '• Caso não haja defervescência (queda da febre), retornar ao serviço de saúde no 5° dia da doença para nova avaliação.',
      '• Acompanhamento deve ser realizado em nível ambulatorial, com observação dos sinais clínicos e reavaliação periódica.',
      '',
      `4. ${chosenAntipyretic ? 'Antitérmico Prescrito' : 'Antitérmicos Permitidos'}`,
      antipyreticBlock,
      '',
      '5. Medicamentos Contraindicados',
      '• Aspirina (ácido acetilsalicílico) e salicilatos',
      '• Anti-inflamatórios não esteroidais (AINEs): ibuprofeno, diclofenaco, naproxeno, entre outros',
      '',
      prescriptionsText + 'Assinatura do Médico:',
      '__________________________________________________',
      'Dr. Rodrigo Machado / CRM: XXXX.XXX',
      '',
      '---',
      'Receituário gerado automaticamente pelo Sistema Siga o Fluxo',
      formatDate(new Date())
    ].join('\n')
  }

  const chosenAntipyreticLabel = (() => {
    const meds = patient.treatment.prescriptions.map(p => p.medication.toLowerCase())
    if (meds.find(m => m.includes('paracetamol'))) return 'Paracetamol'
    if (meds.find(m => m.includes('dipirona'))) return 'Dipirona'
    return null
  })()
  return (
    <div />
  )
}

export default MedicalPrescriptionViewer