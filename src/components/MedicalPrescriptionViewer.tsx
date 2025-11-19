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
    // Removido bloco de antitérmico das orientações; somente aparecerá em "Medicamentos Prescritos".

    const antipyreticPrescriptions = patient.treatment.prescriptions.filter(p => {
      const m = p.medication.toLowerCase()
      return m.includes('paracetamol') || m.includes('dipirona')
    })

    const mappedPrescriptions = antipyreticPrescriptions.map((prescription, index) => {
      const instructionsLine = prescription.instructions ? `Instruções: ${prescription.instructions}` : ''
      return `${index + 1}. ${prescription.medication}\n   Dosagem: ${prescription.dosage}\n   Frequência: ${prescription.frequency}\n   Duração: ${prescription.duration}\n   ${instructionsLine}`
    }).join('\n\n')

    const prescriptionsText = antipyreticPrescriptions.length > 0
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
      '4. Medicamentos Contraindicados',
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-slate-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Receituário Médico</h2>
                <p className="text-blue-100">Sistema Siga o Fluxo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={copyReportText}
                className={clsx('flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200', copied ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30')}
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
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <div className="mt-4 px-2">
            <div className="inline-flex rounded-xl overflow-hidden border border-white/20">
              <button
                className={clsx('px-4 py-2 text-sm font-medium transition-colors', activeTab === 'orientations' ? 'bg-white/20 text-white' : 'bg-white/10 text-blue-100 hover:bg-white/20')}
                onClick={() => setActiveTab('orientations')}
              >
                Orientações
              </button>
              <button
                className={clsx('px-4 py-2 text-sm font-medium transition-colors', activeTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-white/10 text-blue-100 hover:bg-white/20')}
                onClick={() => setActiveTab('prescriptions')}
              >
                Medicamentos Prescritos
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(90vh-160px)] overflow-y-auto">
          <div ref={reportRef} className="p-8 bg-white">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">RECEITUÁRIO MÉDICO</h1>
              <div className="flex items-center justify-center space-x-2">
                <Stethoscope className="w-5 h-5 text-slate-600" />
                <span className="text-slate-600">Sistema Siga o Fluxo</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-2 gap-8 text-lg">
                <div>
                  <strong>Paciente:</strong> {patient.name}
                </div>
                <div>
                  <strong>Idade:</strong> {patient.age} anos
                </div>
              </div>
              <div className="mt-4 text-lg">
                <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
              </div>
              {patient.flowchartState.group && (
                <div className="mt-2 text-lg">
                  <strong>Classificação:</strong> Grupo {patient.flowchartState.group}
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="text-lg">
                <strong>Diagnóstico:</strong> Dengue
              </div>
            </div>

            {activeTab === 'orientations' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Orientações</h2>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">1. Hidratação Oral</h3>
                  {(() => {
                    const hydration = calculateHydration(patient.weight)
                    return (
                      <div className="space-y-2 text-lg">
                        {hydration ? (
                          <>
                            <div>• Total diário: {hydration.totalDaily} mL/dia ({hydration.liters} litros/dia)</div>
                            <div>§ 1/3 com sais de reidratação oral → {hydration.withSalts} mL/dia</div>
                            <div>§ 2/3 com líquidos caseiros → {hydration.withLiquids} mL/dia (água, suco de frutas, soro caseiro, chás, água de coco etc.)</div>
                          </>
                        ) : (
                          <>
                            <div>• Orientação geral:</div>
                            <div>§ 1/3 com sais de reidratação oral</div>
                            <div>§ 2/3 com líquidos caseiros (água, suco de frutas, soro caseiro, chás, água de coco etc.)</div>
                          </>
                        )}
                        <div className="mt-2">§ Inicialmente, oferecer maior volume para evitar desidratação.</div>
                      </div>
                    )
                  })()}
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">2. Retorno Imediato em sinais de alarme</h3>
                  <div className="text-lg space-y-1">
                    <div>• Dor abdominal intensa e contínua</div>
                    <div>• Vômitos persistentes</div>
                    <div>• Sangramentos de mucosa ou outros sinais de hemorragia</div>
                    <div>• Letargia ou irritabilidade</div>
                    <div>• Hipotensão ou tontura</div>
                    <div>• Diminuição repentina da diurese (urina reduzida)</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">3. Seguimento Ambulatorial</h3>
                  <div className="text-lg space-y-1">
                    <div>• Caso não haja defervescência, retornar no 5° dia da doença para nova avaliação.</div>
                    <div>• Observação dos sinais clínicos e reavaliação periódica.</div>
                  </div>
                </div>

            {/* Removido: Antitérmico nas Orientações. O antitérmico aparecerá apenas em "Medicamentos Prescritos". */}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">4. Medicamentos Contraindicados</h3>
                  <div className="text-lg space-y-1">
                    <div>• Aspirina (ácido acetilsalicílico) e salicilatos</div>
                    <div>• AINEs: ibuprofeno, diclofenaco, naproxeno, entre outros</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Medicamentos Prescritos</h2>
                {patient.treatment.prescriptions.filter(p => {
                  const m = p.medication.toLowerCase()
                  return m.includes('paracetamol') || m.includes('dipirona')
                }).length > 0 ? (
                  <div className="space-y-4">
                    {patient.treatment.prescriptions.filter(p => {
                      const m = p.medication.toLowerCase()
                      return m.includes('paracetamol') || m.includes('dipirona')
                    }).map((prescription, index) => (
                      <div key={prescription.id} className="border-l-4 border-slate-400 pl-6 text-lg">
                        <div className="font-bold">{index + 1}. {prescription.medication}</div>
                        <div className="ml-4 mt-2 space-y-1">
                          <div>Dosagem: {prescription.dosage}</div>
                          <div>Frequência: {prescription.frequency}</div>
                          <div>Duração: {prescription.duration}</div>
                          {prescription.instructions && (
                            <div>Instruções: {prescription.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">Nenhum antitérmico prescrito no momento.</p>
                )}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="text-lg">
                    <strong>Assinatura do Médico:</strong>
                  </div>
                  <div className="mt-8 space-y-2 text-lg">
                    <div>__________________________________________________</div>
                    <div>Dr. Rodrigo Machado / CRM: XXXX.XXX</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MedicalPrescriptionViewer