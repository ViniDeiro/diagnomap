'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Download, 
  Pill,
  Stethoscope,
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
  const isDengue = !patient.selectedFlowchart || patient.selectedFlowchart === 'dengue'
  const flowName = patient.selectedFlowchart ? patient.selectedFlowchart.toUpperCase() : 'DENGUE'

  const tvpPrescriptionTemplates: Record<string, Omit<Prescription, 'id' | 'prescribedAt' | 'prescribedBy'>> = {
    rivaroxabana: {
      medication: 'Rivaroxabana',
      dosage: '15 mg 2x/dia por 21 dias; depois 20 mg 1x/dia; prevenção estendida 10 mg 1x/dia',
      frequency: 'Conforme fase terapêutica',
      duration: 'Conforme avaliação clínica',
      instructions: 'Ajustar duração conforme fator desencadeante e risco de sangramento'
    },
    apixabana: {
      medication: 'Apixabana',
      dosage: '10 mg 2x/dia por 7 dias; depois 5 mg 2x/dia; prevenção estendida 2,5 mg 2x/dia',
      frequency: 'Conforme fase terapêutica',
      duration: 'Conforme avaliação clínica',
      instructions: 'Avaliar interações e função renal/hepática'
    },
    dabigatrana: {
      medication: 'Dabigatrana',
      dosage: '150 mg 2x/dia após 5–10 dias de anticoagulação parenteral',
      frequency: '12/12h',
      duration: 'Conforme avaliação clínica',
      instructions: 'Exigir fase inicial parenteral antes do início'
    },
    edoxabana: {
      medication: 'Edoxabana',
      dosage: '60 mg 1x/dia após 5–10 dias de parenteral; 30 mg se CrCl 15–50 mL/min ou ≤60 kg',
      frequency: '1x/dia',
      duration: 'Conforme avaliação clínica',
      instructions: 'Ajustar dose por função renal e peso'
    },
    enoxaparina: {
      medication: 'Enoxaparina',
      dosage: '1 mg/kg 2x/dia ou 1,5 mg/kg 1x/dia; se CrCl <30: 1 mg/kg 1x/dia',
      frequency: 'Conforme esquema escolhido',
      duration: 'Conforme avaliação clínica',
      instructions: 'Preferir ajuste por peso e função renal'
    },
    hnf: {
      medication: 'Heparina não fracionada (HNF)',
      dosage: 'Bolus 80 U/kg (ou 5.000 U), depois 18 U/kg/h (ou 1.300 U/h)',
      frequency: 'Infusão contínua EV',
      duration: 'Conforme controle laboratorial',
      instructions: 'Ajustar para TTPa entre 1,5 e 2,5 vezes o basal'
    },
    varfarina: {
      medication: 'Varfarina',
      dosage: 'Dose titulada para INR alvo 2–3',
      frequency: '1x/dia',
      duration: 'Conforme avaliação clínica',
      instructions: 'Sobrepor com heparina por ≥5 dias e até INR terapêutico por 24h'
    }
  }

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

  const getDynamicFlowPrescriptions = (): Prescription[] => {
    if (!patient.flowchartState?.answers) return []
    const parsedEntries = Object.values(patient.flowchartState.answers).map((value) => {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    })
    const selectedTherapies = parsedEntries
      .filter(item => item && Array.isArray(item.opcoesTerapeuticasSelecionadas))
      .flatMap(item => item.opcoesTerapeuticasSelecionadas as string[])
    const uniqueTherapies = Array.from(new Set(selectedTherapies))
    return uniqueTherapies
      .filter(id => tvpPrescriptionTemplates[id])
      .map((id) => ({
        id: `flow_${id}`,
        ...tvpPrescriptionTemplates[id],
        prescribedAt: new Date(patient.updatedAt || new Date()),
        prescribedBy: 'Fluxograma Clínico'
      }))
  }

  const allPrescriptions = (() => {
    const merged = [...patient.treatment.prescriptions, ...getDynamicFlowPrescriptions()]
    const dedup = new Map<string, Prescription>()
    merged.forEach((prescription) => {
      const key = `${prescription.medication}_${prescription.dosage}`
      if (!dedup.has(key)) dedup.set(key, prescription)
    })
    return Array.from(dedup.values())
  })()

  // Função para calcular hidratação oral baseada no peso e idade
  const calculateHydration = (weight?: number, age?: number) => {
    if (!weight) return null

    const isAdult = (age ?? patient.age) >= 18
    let perKg: number
    if (isAdult) {
      perKg = 60 // Adultos: 60 mL/kg/dia
    } else {
      // Pediatria: 100 ml/kg/dia até 10 kg; 150 ml/kg/dia de 10–20 kg; 80 ml/kg/dia acima de 20 kg
      if (weight <= 10) perKg = 100
      else if (weight <= 20) perKg = 150
      else perKg = 80
    }

    const totalDaily = Math.round(weight * perKg)
    const withSalts = Math.round(totalDaily / 3) // 1/3 com sais
    const withLiquids = Math.round((totalDaily * 2) / 3) // 2/3 com líquidos caseiros

    return {
      totalDaily,
      withSalts,
      withLiquids,
      liters: (totalDaily / 1000).toFixed(1),
      perKg
    }
  }

  const generatePrescriptionText = () => {
    const hydration = calculateHydration(patient.weight, patient.age)
    const mappedPrescriptions = allPrescriptions.map((prescription, index) => {
      const instructionsLine = prescription.instructions ? `Instruções: ${prescription.instructions}` : ''
      return `${index + 1}. ${prescription.medication}\n   Dosagem: ${prescription.dosage}\n   Frequência: ${prescription.frequency}\n   Duração: ${prescription.duration}\n   ${instructionsLine}`
    }).join('\n\n')

    const prescriptionsText = allPrescriptions.length > 0
      ? `Medicamentos Prescritos:\n${mappedPrescriptions}\n\n`
      : ''

    const followUpLines = patient.flowchartState.group === 'B'
      ? [
          '• Retorno diário para reavaliação clínica e ambulatorial.',
          '• Manter seguimento até 48h após remissão da febre.'
        ]
      : [
          '• Caso não haja defervescência (queda da febre), retornar ao serviço de saúde no 5° dia da doença para nova avaliação.',
          '• Acompanhamento deve ser realizado em nível ambulatorial, com observação dos sinais clínicos e reavaliação periódica.'
        ]

    return [
      'RECEITUÁRIO MÉDICO',
      'Sistema Siga o Fluxo',
      '',
      `Paciente: ${patient.name}`,
      `Idade: ${patient.age} anos`,
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      '',
      `Diagnóstico: ${flowName}`,
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
      ...followUpLines,
      '',
      ...(isDengue ? [
        '4. Medicamentos Contraindicados',
        '• Aspirina (ácido acetilsalicílico) e salicilatos',
        '• Anti-inflamatórios não esteroidais (AINEs): ibuprofeno, diclofenaco, naproxeno, entre outros',
        ''
      ] : []),
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
                <strong>Diagnóstico:</strong> {flowName}
              </div>
            </div>

            {activeTab === 'orientations' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Orientações</h2>
                {isDengue ? (
                <>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">1. Hidratação Oral</h3>
                  {(() => {
                    const hydration = calculateHydration(patient.weight, patient.age)
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
                            <div>§ Adultos: 60 mL/kg/dia</div>
                            <div>§ Pediatria: até 10 kg → 100 mL/kg/dia; 10–20 kg → 150 mL/kg/dia; acima de 20 kg → 80 mL/kg/dia</div>
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
                    {patient.flowchartState.group === 'B' ? (
                      <>
                        <div>• Retorno diário para reavaliação clínica e ambulatorial.</div>
                        <div>• Manter seguimento até 48h após remissão da febre.</div>
                      </>
                    ) : (
                      <>
                        <div>• Caso não haja defervescência, retornar no 5° dia da doença para nova avaliação.</div>
                        <div>• Observação dos sinais clínicos e reavaliação periódica.</div>
                      </>
                    )}
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
                </>
                ) : (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-bold text-slate-800 mb-2">Conduta clínica registrada</h3>
                      <p className="text-slate-700">Fluxo de atendimento {flowName} com decisões registradas em ordem cronológica no relatório narrativo.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-bold text-slate-800 mb-2">Seguimento e segurança</h3>
                      <ul className="space-y-1">
                        <li>• Retorno imediato em piora clínica, dor torácica, dispneia, síncope ou sangramento.</li>
                        <li>• Reavaliação ambulatorial em 1–2 semanas e em 3 meses.</li>
                        <li>• Monitorar adesão, função renal/hepática e interações medicamentosas.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Medicamentos Prescritos</h2>
                {allPrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {allPrescriptions.map((prescription, index) => (
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
                  <p className="text-slate-600">Nenhuma prescrição registrada no atendimento.</p>
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
