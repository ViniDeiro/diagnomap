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

interface MedicalPrescriptionViewerProps {
  patient: Patient
  onClose: () => void
}

const MedicalPrescriptionViewer: React.FC<MedicalPrescriptionViewerProps> = ({ patient, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)

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
    
    return `RECEITUÁRIO MÉDICO
Sistema DiagnoMap Pro

Paciente: ${patient.name}
Idade: ${patient.age} anos
Data: ${new Date().toLocaleDateString('pt-BR')}

Diagnóstico: Dengue

Orientações:

 1. Hidratação Oral
${hydration ? 
`• Total diário: ${hydration.totalDaily} mL/dia (${hydration.liters} litros/dia)
§ 1/3 com sais de reidratação oral → ${hydration.withSalts} mL/dia
§ 2/3 com líquidos caseiros → ${hydration.withLiquids} mL/dia (água, suco de frutas, soro caseiro, chás, água de coco etc.)` :
`• Orientação geral:
§ 1/3 com sais de reidratação oral
§ 2/3 com líquidos caseiros (água, suco de frutas, soro caseiro, chás, água de coco etc.)`}
§ Inicialmente, oferecer maior volume para evitar desidratação.

2. Retorno Imediato na presença de sinais de alarme, incluindo:
• Dor abdominal intensa e contínua
• Vômitos persistentes
• Sangramentos de mucosa ou outros sinais de hemorragia
• Letargia ou irritabilidade
• Hipotensão ou tontura
• Diminuição repentina da diurese (urina reduzida)

3. Seguimento Ambulatorial
• Caso não haja defervescência (queda da febre), retornar ao serviço de saúde no 5° dia da doença para nova avaliação.
• Acompanhamento deve ser realizado em nível ambulatorial, com observação dos sinais clínicos e reavaliação periódica.

${patient.treatment.prescriptions.length > 0 ? 
`Medicamentos Prescritos:
${patient.treatment.prescriptions.map((prescription, index) => 
`${index + 1}. ${prescription.medication}
   Dosagem: ${prescription.dosage}
   Frequência: ${prescription.frequency}
   Duração: ${prescription.duration}
   ${prescription.instructions ? `Instruções: ${prescription.instructions}` : ''}`).join('\n\n')}

` : ''}Assinatura do Médico:
__________________________________________________
Dr. Rodrigo Machado / CRM: XXXX.XXX

---
Receituário gerado automaticamente pelo Sistema DiagnoMap Pro
${formatDate(new Date())}`
  }

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
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Receituário Médico</h2>
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
                title="Copiar texto do receituário"
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
                title="Baixar PDF do receituário"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Baixar PDF</span>
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Fechar receituário"
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
                <h1 className="text-3xl font-bold text-slate-800 mb-2">RECEITUÁRIO MÉDICO</h1>
                <p className="text-lg text-slate-600">Sistema DiagnoMap Pro</p>
                <p className="text-sm text-slate-500">Protocolo de Diagnóstico Clínico - {patient.selectedFlowchart?.toUpperCase() || 'DENGUE'}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-600">Data do receituário: {formatDate(new Date())}</p>
                <p className="text-sm text-slate-600">Número do protocolo: {patient.id}</p>
              </div>
            </div>

            {/* Prescription Content */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-slate-800">
                  
                  {/* Patient Info */}
                  <div className="text-lg leading-10 font-medium">
                    <p><strong>Paciente:</strong> {patient.name}</p>
                    <p><strong>Idade:</strong> {patient.age} anos</p>
                    <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  {/* Diagnosis */}
                  <div className="text-lg leading-10 font-medium">
                    <p><strong>Diagnóstico:</strong> Dengue</p>
                  </div>
                  
                  {/* Orientations */}
                  <div className="text-lg leading-10">
                    <h2 className="text-xl font-bold mb-4">Orientações:</h2>
                    
                                         {/* 1. Hydration */}
                     <div className="mb-6">
                       <h3 className="font-bold mb-2">1. Hidratação Oral</h3>
                       <div className="ml-4 space-y-2">
                         {patient.weight && calculateHydration(patient.weight) ? (
                           <>
                             <p>• Total diário: {calculateHydration(patient.weight)!.totalDaily} mL/dia ({calculateHydration(patient.weight)!.liters} litros/dia)</p>
                             <div className="ml-4 space-y-1">
                               <p>§ 1/3 com sais de reidratação oral → {calculateHydration(patient.weight)!.withSalts} mL/dia</p>
                               <p>§ 2/3 com líquidos caseiros → {calculateHydration(patient.weight)!.withLiquids} mL/dia (água, suco de frutas, soro caseiro, chás, água de coco etc.)</p>
                               <p>§ Inicialmente, oferecer maior volume para evitar desidratação.</p>
                             </div>
                           </>
                         ) : (
                           <>
                             <p>• Orientação geral:</p>
                             <div className="ml-4 space-y-1">
                               <p>§ 1/3 com sais de reidratação oral</p>
                               <p>§ 2/3 com líquidos caseiros (água, suco de frutas, soro caseiro, chás, água de coco etc.)</p>
                               <p>§ Inicialmente, oferecer maior volume para evitar desidratação.</p>
                             </div>
                           </>
                         )}
                       </div>
                     </div>

                    {/* 2. Immediate Return */}
                    <div className="mb-6">
                      <h3 className="font-bold mb-2">2. Retorno Imediato na presença de sinais de alarme, incluindo:</h3>
                      <div className="ml-4 space-y-1">
                        <p>• Dor abdominal intensa e contínua</p>
                        <p>• Vômitos persistentes</p>
                        <p>• Sangramentos de mucosa ou outros sinais de hemorragia</p>
                        <p>• Letargia ou irritabilidade</p>
                        <p>• Hipotensão ou tontura</p>
                        <p>• Diminuição repentina da diurese (urina reduzida)</p>
                      </div>
                    </div>

                    {/* 3. Outpatient Follow-up */}
                    <div className="mb-6">
                      <h3 className="font-bold mb-2">3. Seguimento Ambulatorial</h3>
                      <div className="ml-4 space-y-1">
                        <p>• Caso não haja defervescência (queda da febre), retornar ao serviço de saúde no 5° dia da doença para nova avaliação.</p>
                        <p>• Acompanhamento deve ser realizado em nível ambulatorial, com observação dos sinais clínicos e reavaliação periódica.</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Prescriptions */}
                  {patient.treatment.prescriptions.length > 0 && (
                    <div className="text-lg leading-10">
                      <h2 className="text-xl font-bold mb-4">Medicamentos Prescritos:</h2>
                      <div className="space-y-4">
                        {patient.treatment.prescriptions.map((prescription, index) => (
                          <div key={prescription.id} className="ml-4">
                            <p className="font-bold">{index + 1}. {prescription.medication}</p>
                            <div className="ml-4 space-y-1">
                              <p>Dosagem: {prescription.dosage}</p>
                              <p>Frequência: {prescription.frequency}</p>
                              <p>Duração: {prescription.duration}</p>
                              {prescription.instructions && (
                                <p>Instruções: {prescription.instructions}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                                     {/* Doctor Signature */}
                   <div className="text-lg leading-10 mt-8 pt-6 border-t border-slate-300">
                     <p className="font-bold">Assinatura do Médico:</p>
                     <div className="mt-4 space-y-2">
                       <p>__________________________________________________</p>
                       <p>Dr. Rodrigo Machado / CRM: XXXX.XXX</p>
                     </div>
                   </div>
                  
                </div>
              </div>
            </div>

            {/* Footer */}
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
                  <p className="text-sm text-slate-600">Receituário gerado automaticamente pelo sistema</p>
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

export default MedicalPrescriptionViewer 