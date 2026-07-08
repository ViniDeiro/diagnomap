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
import { Patient, Prescription } from '@/types/patient'
import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { patientService } from '@/services/patientService'
import { getCurrentDoctor, type DoctorProfile } from '@/services/doctorRepo'
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
  const [doctorProfile, setDoctorProfile] = React.useState<DoctorProfile | null>(null)
  const livePatient = patientService.getPatientById(patient.id) || patient
  const isDengue = !livePatient.selectedFlowchart || livePatient.selectedFlowchart === 'dengue'
  const isInfluenza = livePatient.selectedFlowchart === 'influenza'
  const isPneumonia = livePatient.selectedFlowchart === 'pneumonia'
  const isSinusitis = livePatient.selectedFlowchart === 'sinusite'
  const isFaringoamigdalite = livePatient.selectedFlowchart === 'faringoamigdalite'
  const isEpistaxe = livePatient.selectedFlowchart === 'epistaxe'
  const isMonoartrite = livePatient.selectedFlowchart === 'monoartrite'
  const isAnsiedade = livePatient.selectedFlowchart === 'crise_ansiedade'
  const isVertigem = livePatient.selectedFlowchart === 'sindrome_vertiginosa'
  const isCefaleia = livePatient.selectedFlowchart === 'cefaleia'
  const isAgitacao = livePatient.selectedFlowchart === 'agitacao_psicomotora'
  const isPepHiv = livePatient.selectedFlowchart === 'pep_hiv'
  const isAnaphylaxis = livePatient.selectedFlowchart === 'anafilaxia'
  const isPancreatitis = livePatient.selectedFlowchart === 'pancreatitis'
  const isCholangitis = livePatient.selectedFlowchart === 'cholangitis'
  const isCholecystitis = livePatient.selectedFlowchart === 'cholecystitis'
  const isAppendicitis = livePatient.selectedFlowchart === 'appendicitis'
  const isLombalgia = livePatient.selectedFlowchart === 'lombalgia'
  const isBell = livePatient.selectedFlowchart === 'paralisia_bell'
  const flowName = getFlowchartById(livePatient.selectedFlowchart || '')?.name || (livePatient.selectedFlowchart ? livePatient.selectedFlowchart.toUpperCase() : 'DENGUE')

  React.useEffect(() => {
    let mounted = true
    getCurrentDoctor()
      .then((doctor) => {
        if (mounted) setDoctorProfile(doctor as DoctorProfile | null)
      })
      .catch((error) => {
        console.warn('Não foi possível carregar o médico responsável pelo receituário:', error)
        if (mounted) setDoctorProfile(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  const doctorSignatureLine = React.useMemo(() => {
    const doctorName = doctorProfile?.name?.trim()
    const crm = doctorProfile?.crm?.trim()
    const nameText = doctorName
      ? (/^dr\.?\s|^dra\.?\s/i.test(doctorName) ? doctorName : `Dr(a). ${doctorName}`)
      : 'Médico(a) responsável não informado'
    const crmText = crm ? (/^crm\b/i.test(crm) ? crm : `CRM ${crm}`) : 'CRM não informado'
    return `${nameText} / ${crmText}`
  }, [doctorProfile])

  const doctorPrescribedBy = doctorProfile?.name?.trim() || 'Médico(a) responsável'

  const parseFlowAnswer = <T,>(stepId: string): T | null => {
    const raw = livePatient.flowchartState?.answers?.[stepId]
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  const bellCriteria = parseFlowAnswer<{ todosCriteriosPresentes?: boolean }>('bell_criterios_obrigatorios')
  const bellRedFlags = parseFlowAnswer<{ possuiRedFlag?: boolean; redFlagsSelecionadas?: string[] }>('bell_red_flags_ramsay')
  const bellHouse = parseFlowAnswer<{ houseBrackmann?: string; houseBrackmannLabel?: string }>('bell_house_brackmann')
  const bellTreatment = parseFlowAnswer<{ corticosteroid?: boolean; antiviral?: string; eyeCare?: boolean; within72Hours?: boolean | null }>('bell_tratamento_clinico')
  const bellCriteriaComplete = bellCriteria?.todosCriteriosPresentes === true
    || livePatient.flowchartState?.answers?.bell_criterios_obrigatorios === 'criterios_preenchidos'
  const bellHasRedFlags = bellRedFlags?.possuiRedFlag === true
    || livePatient.flowchartState?.answers?.bell_red_flags_ramsay === 'red_flags'
  const bellRedFlagsEvaluated = Boolean(livePatient.flowchartState?.answers?.bell_red_flags_ramsay)
  const bellTypicalPath = bellCriteriaComplete && bellRedFlagsEvaluated && !bellHasRedFlags
  const bellDiagnosisLabel = bellTypicalPath ? 'Paralisia de Bell' : 'Paralisia facial periférica em investigação'
  const bellHouseLabels: Record<string, string> = {
    house_i: 'Grau I', house_ii: 'Grau II', house_iii: 'Grau III', house_iv: 'Grau IV', house_v: 'Grau V', house_vi: 'Grau VI'
  }
  const bellHouseLabel = bellHouse?.houseBrackmannLabel || bellHouseLabels[bellHouse?.houseBrackmann || ''] || 'não classificado'
  const bellAntiviralLabels: Record<string, string> = {
    valaciclovir: 'valaciclovir', aciclovir: 'aciclovir', famciclovir: 'famciclovir'
  }
  const bellConductSummary = !bellCriteriaComplete
    ? 'Os critérios clínicos obrigatórios não foram integralmente preenchidos. Paralisia de Bell não confirmada; indicada investigação etiológica dirigida.'
    : bellHasRedFlags
      ? 'Foram identificados sinais de alerta. O quadro não deve ser conduzido como Paralisia de Bell típica isolada até investigação complementar e avaliação especializada.'
      : !bellRedFlagsEvaluated
        ? 'Os critérios iniciais foram preenchidos, porém a avaliação de sinais de alerta ainda não foi concluída.'
      : `Quadro típico classificado como House-Brackmann ${bellHouseLabel}. ${bellTreatment?.corticosteroid ? 'Corticosteroide selecionado.' : 'Corticosteroide não selecionado.'} ${bellTreatment?.antiviral && bellTreatment.antiviral !== 'none' ? `Antiviral associado: ${bellAntiviralLabels[bellTreatment.antiviral] || bellTreatment.antiviral}.` : 'Sem antiviral associado.'} ${bellTreatment?.eyeCare ? 'Proteção ocular prescrita.' : 'Proteção ocular não selecionada.'}`
  const bellSafetyItems = [
    'Retornar imediatamente se houver piora rápida da fraqueza facial, evolução para paralisia completa ou progressão do déficit para outra região.',
    'Retornar imediatamente se surgir fraqueza em braço ou perna, alteração da fala ou marcha, visão dupla, perda de sensibilidade, tontura intensa persistente ou dificuldade para engolir.',
    'Procurar reavaliação diante de dor facial ou retroauricular intensa e progressiva, ou aparecimento de vesículas na orelha, conduto auditivo ou boca.',
    'Retornar imediatamente em caso de dor ocular, vermelhidão importante, sensação intensa de corpo estranho, piora visual ou incapacidade de proteger o olho.',
    'Reavaliar se houver febre, secreção otológica, sinais de infecção, acometimento bilateral ou recorrência.',
    'Programar reavaliação se não houver qualquer melhora, se houver piora progressiva ou se a recuperação permanecer incompleta em cerca de 3 meses.'
  ]

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
    if (!livePatient.flowchartState?.answers) return []
    const parsedEntries = Object.values(livePatient.flowchartState.answers).map((value) => {
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
        prescribedAt: new Date(livePatient.updatedAt || new Date()),
        prescribedBy: doctorPrescribedBy
      }))
  }

  const allPrescriptions = (() => {
    const merged = [...livePatient.treatment.prescriptions, ...getDynamicFlowPrescriptions()]
    const dedup = new Map<string, Prescription>()
    merged.forEach((prescription) => {
      const key = `${prescription.medication}_${prescription.dosage}`
      if (!dedup.has(key)) dedup.set(key, prescription)
    })
    return Array.from(dedup.values())
  })()

  const getInfluenzaDispositionLabel = () => {
    switch (livePatient.flowchartState.currentStep) {
      case 'influenza_ambulatorial_sintomaticos':
        return 'Ambulatorial com tratamento sintomático'
      case 'influenza_ambulatorial_oseltamivir':
        return 'Ambulatorial com oseltamivir'
      case 'influenza_internacao_enfermaria':
        return 'Internação em enfermaria'
      case 'influenza_internacao_uti':
        return 'Internação em unidade intensiva'
      default:
        return 'Em avaliação clínica'
    }
  }

  // Função para calcular hidratação oral baseada no peso e idade
  const calculateHydration = (weight?: number, age?: number) => {
    if (!weight) return null

    const isAdult = (age ?? livePatient.age) >= 18
    let perKg: number
    if (isAdult) {
      perKg = 60 // Adultos: 60 mL/kg/dia
    } else {
      // Pediatria: 130 mL/kg/dia até 10 kg; 100 mL/kg/dia de 10–20 kg; 80 mL/kg/dia acima de 20 kg
      if (weight <= 10) perKg = 130
      else if (weight <= 20) perKg = 100
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
    if (isBell) {
      const mappedPrescriptions = allPrescriptions.map((prescription, index) => (
        `${index + 1}. ${prescription.medication}\n   Dosagem: ${prescription.dosage}\n   Frequência: ${prescription.frequency}\n   Duração: ${prescription.duration}${prescription.instructions ? `\n   Instruções: ${prescription.instructions}` : ''}`
      )).join('\n\n')

      return [
        'ORIENTAÇÕES MÉDICAS - PARALISIA FACIAL PERIFÉRICA',
        '',
        `Paciente: ${patient.name}`,
        `Idade: ${patient.age} anos`,
        `Data: ${new Date().toLocaleDateString('pt-BR')}`,
        '',
        `Diagnóstico/Avaliação: ${bellDiagnosisLabel}`,
        `Conduta: ${bellConductSummary}`,
        '',
        'Sinais para retorno imediato:',
        ...bellSafetyItems.map(item => `• ${item}`),
        '',
        ...(allPrescriptions.length > 0 ? ['Medicamentos prescritos:', mappedPrescriptions, ''] : []),
        'Assinatura do Médico:',
        '__________________________________________________',
        doctorSignatureLine,
        '',
        formatDate(new Date())
      ].join('\n')
    }

    if (isInfluenza || isPneumonia || isSinusitis || isFaringoamigdalite || isEpistaxe || isMonoartrite || isAnsiedade || isVertigem || isCefaleia || isAgitacao || isPepHiv || isAnaphylaxis || isPancreatitis || isCholangitis || isCholecystitis || isAppendicitis || isLombalgia) {
      const mappedPrescriptions = allPrescriptions.map((prescription, index) => {
        const instructionsLine = prescription.instructions ? `Instruções: ${prescription.instructions}` : ''
        return `${index + 1}. ${prescription.medication}\n   Dosagem: ${prescription.dosage}\n   Frequência: ${prescription.frequency}\n   Duração: ${prescription.duration}\n   ${instructionsLine}`
      }).join('\n\n')

      const prescriptionsText = allPrescriptions.length > 0
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
        `Diagnóstico: ${flowName}`,
        `Classificação clínica: ${isInfluenza ? getInfluenzaDispositionLabel() : isSinusitis ? 'Rinossinusite classificada conforme critérios clínicos' : isFaringoamigdalite ? 'Faringoamigdalite estratificada pelo Escore de Centor Modificado' : isEpistaxe ? 'Epistaxe estratificada por estabilidade, controle local e suspeita de origem posterior' : isMonoartrite ? 'Monoartrite aguda estratificada por artrocentese/Janssens' : isAnsiedade ? 'Crise de ansiedade após exclusão de sinais de causa orgânica' : isVertigem ? 'Síndrome vertiginosa estratificada por sinais centrais/HINTS' : isCefaleia ? 'Cefaleia estratificada por sinais de alarme e fenótipo primário' : isAgitacao ? 'Agitação psicomotora classificada por gravidade e etiologia provável' : isPepHiv ? 'PEP ao HIV estratificada por exposição de risco, janela de 72 horas e status sorológico' : isAnaphylaxis ? 'Anafilaxia em seguimento após estabilização/observação' : isPancreatitis ? 'Pancreatite aguda em manejo hospitalar conforme Atlanta 2012' : isCholangitis ? 'Colangite/coledocolitíase em manejo hospitalar conforme Tokyo 2018' : isCholecystitis ? 'Colecistite aguda em manejo hospitalar conforme Tokyo 2018' : isAppendicitis ? 'Apendicite aguda estratificada pelo escore de Alvarado' : isLombalgia ? 'Lombalgia aguda estratificada por sinais de alarme' : 'Pneumonia adquirida na comunidade em seguimento conforme escore de gravidade'}`,
        '',
        'Orientações:',
        '',
        '1. Medidas gerais',
        '• Manter boa hidratação e alimentação fracionada, conforme tolerância.',
        '• Priorizar repouso relativo e controle sintomático.',
        isInfluenza
          ? '• Manter isolamento por gotículas enquanto sintomático: usar máscara, cobrir boca e nariz ao tossir/espirrar, higienizar as mãos, evitar contato próximo com pessoas vulneráveis e manter ambientes ventilados.'
          : isSinusitis
            ? '• Realizar lavagem nasal e evitar uso prolongado de descongestionante nasal.'
            : isFaringoamigdalite
              ? '• Manter hidratação, repouso e medidas locais como gargarejo com água morna e sal, se tolerado.'
              : isEpistaxe
                ? '• Evitar manipulação interna da cavidade nasal, esforços físicos intensos, banhos muito quentes e saunas nos próximos dias.'
              : isMonoartrite
                ? '• Priorizar repouso da articulação, analgesia e reavaliação estreita; artrocentese é o exame-chave quando disponível.'
                : isAnsiedade
                  ? '• Reforçar acolhimento, respiração diafragmática, redução de estímulos e reavaliação após a intervenção.'
                  : isVertigem
                    ? '• Evitar movimentos bruscos, orientar segurança contra quedas e usar sintomáticos pelo menor tempo possível.'
                    : isCefaleia
                      ? '• Manter repouso em ambiente tranquilo, hidratação, sono regular e evitar álcool, drogas e gatilhos reconhecidos.'
                      : isAgitacao
                        ? '• Manter ambiente seguro, reduzir estímulos, abordagem verbal calma e investigação de causa clínica/toxicológica/traumática.'
                        : isPepHiv
                          ? '• Iniciar a PEP o quanto antes quando indicada, manter por 28 dias e garantir acompanhamento sorológico.'
              : isAnaphylaxis
                          ? '• Evitar estritamente o fator causal suspeito ou conhecido até avaliação especializada.'
                          : isPancreatitis
                            ? '• Manter manejo hospitalar com hidratação guiada por metas, analgesia e progressão alimentar conforme tolerância.'
                            : isCholangitis
                              ? '• Manter dieta zero até definição do procedimento, hidratação venosa, analgesia e antibioticoterapia conforme gravidade.'
                              : isCholecystitis
                                ? '• Manter dieta zero, hidratação venosa, analgesia, antibiótico e avaliação da cirurgia geral.'
                                : isAppendicitis
                                  ? '• Manter dieta zero até definição, hidratação venosa, analgesia, antiemético e avaliação da cirurgia geral quando indicado.'
                                  : isLombalgia
                                    ? '• Manter analgesia, compressa morna, repouso curto e retorno gradual às atividades conforme tolerância.'
                            : '• Tomar antibiótico exatamente pelo tempo prescrito, mesmo se houver melhora inicial.',
        '',
        '2. Retorno / reavaliação',
        '• Reavaliar em 48 a 72 horas, ou antes se houver piora do quadro.',
        '• Retornar imediatamente em dispneia, desconforto respiratório, saturação baixa, confusão, desidratação, febre persistente ou agravamento geral.',
        '',
        isInfluenza ? '3. Observações sobre antiviral' : isSinusitis ? '3. Observações sobre rinossinusite' : isFaringoamigdalite ? '3. Observações sobre faringoamigdalite' : isEpistaxe ? '3. Observações sobre epistaxe' : isMonoartrite ? '3. Observações sobre monoartrite' : isAnsiedade ? '3. Observações sobre crise de ansiedade' : isVertigem ? '3. Observações sobre síndrome vertiginosa' : isCefaleia ? '3. Observações sobre cefaleia' : isAgitacao ? '3. Observações sobre agitação psicomotora' : isPepHiv ? '3. Observações sobre PEP ao HIV' : isAnaphylaxis ? '3. Observações sobre anafilaxia' : isPancreatitis ? '3. Observações sobre pancreatite aguda' : isCholangitis ? '3. Observações sobre colangite/coledocolitíase' : isCholecystitis ? '3. Observações sobre colecistite aguda' : isAppendicitis ? '3. Observações sobre apendicite aguda' : isLombalgia ? '3. Observações sobre lombalgia' : '3. Observações sobre pneumonia',
        isInfluenza
          ? '• Oseltamivir tem maior benefício quando iniciado precocemente, preferencialmente nas primeiras 48 horas.'
          : isSinusitis
            ? '• A maioria dos quadros é viral ou alérgica e não necessita antibiótico.'
            : isFaringoamigdalite
              ? '• Coriza, conjuntivite e tosse sugerem etiologia viral; antibiótico deve seguir a estratificação clínica.'
              : isEpistaxe
                ? '• Se houver tampão nasal anterior, reavaliar em cerca de 48 horas para retirada; epistaxe posterior ou sangramento persistente exige avaliação otorrinolaringológica.'
              : isMonoartrite
                ? '• Gota não deve afastar artrite séptica se houver febre, toxemia, imunossupressão, bacteremia suspeita ou líquido sinovial compatível.'
                : isAnsiedade
                  ? '• Atribuir o quadro à ansiedade somente após avaliação clínica dos sinais de alerta orgânicos.'
                  : isVertigem
                    ? '• HINTS só é aplicável em vertigem contínua com nistagmo; sinais centrais exigem investigação de AVC de fossa posterior.'
                    : isCefaleia
                      ? '• A presença de qualquer sinal de alarme deve direcionar investigação de cefaleia secundária; não usar opioides para cefaleia primária.'
                      : isAgitacao
                        ? '• Agitação não é diagnóstico; tratar imediatamente hipóxia, hipoglicemia, hipertermia e hipovolemia quando presentes.'
                        : isPepHiv
                          ? '• A PEP deve ser iniciada até 72 horas após a exposição; após esse período, manter acompanhamento sorológico quando indicado.'
              : isAnaphylaxis
                          ? '• Observar possibilidade de recidiva dos sintomas em até 24 a 72 horas.'
                          : isPancreatitis
                            ? '• Antibiótico não é profilático; usar apenas se houver evidência de infecção sobreposta ou necrose infectada.'
                            : isCholangitis
                              ? '• Antibiótico deve ser precoce na suspeita de colangite e ajustado conforme culturas, função renal e protocolo local.'
                              : isCholecystitis
                                ? '• Antibiótico deve ser ajustado conforme gravidade, culturas, função renal e perfil institucional.'
                                : isAppendicitis
                                  ? '• Antibiótico venoso é indicado quando houver suspeita cirúrgica, apendicite confirmada/complicada ou manejo conservador inicial.'
                                  : isLombalgia
                                    ? '• Não há necessidade de imagem inicial quando não há sinais de alarme; reavaliar se não houver melhora em 4 a 6 semanas.'
                            : '• Radiografia de tórax e reavaliação clínica devem orientar investigação de complicações quando houver piora ou ausência de resposta.',
        isInfluenza
          ? '• Ajustar dose em disfunção renal, quando aplicável.'
          : isSinusitis
            ? '• Procurar atendimento se houver visão dupla, redução visual, proptose, sinais meníngeos, alteração mental, sepse ou dor facial intensa refratária.'
            : isFaringoamigdalite
              ? '• Retornar imediatamente em dificuldade de falar, inchaço intenso no pescoço, queda importante do estado geral, dispneia ou intolerância à via oral.'
              : isEpistaxe
                ? '• Retornar imediatamente se sangramento recorrente ou volumoso, tontura, desmaio, fraqueza, palidez, falta de ar, vômitos com sangue ou piora do estado geral.'
              : isMonoartrite
                ? '• Retornar imediatamente em febre, calafrios, piora da dor, aumento do edema, incapacidade de mobilizar a articulação ou queda do estado geral.'
                : isAnsiedade
                  ? '• Retornar imediatamente se dor torácica, dispneia, síncope, déficit neurológico, confusão, intoxicação suspeita, ideação suicida ou piora importante.'
                  : isVertigem
                    ? '• Retornar imediatamente em tontura persistente e agravante, fraqueza, dormência, turvação visual, dificuldade de fala, alteração visual, cefaleia intensa, vômitos contínuos, desmaio, queda ou trauma.'
                    : isCefaleia
                      ? '• Retornar imediatamente se dor intensa sem melhora, desmaios, fraqueza súbita, perda de visão ou fala, febre alta, rigidez de nuca, vômitos persistentes ou novo déficit neurológico.'
                      : isAgitacao
                        ? '• Reavaliar imediatamente se piora do comportamento, rebaixamento, febre, intoxicação, trauma, hipoglicemia, hipóxia ou risco para si/equipe.'
                        : isPepHiv
                          ? '• Retornar imediatamente se toxicidade grave, rash extenso, icterícia, vômitos persistentes, intolerância medicamentosa importante ou nova exposição.'
              : isAnaphylaxis
                          ? '• Retornar imediatamente se houver urticária difusa, angioedema, dispneia, sibilância, estridor, vômitos repetitivos, tontura ou síncope.'
                          : isPancreatitis
                            ? '• Considerar TC com contraste após 72 horas se suspeita de complicação; considerar CPRE se colangite ou obstrução biliar.'
                            : isCholangitis
                              ? '• Avaliar drenagem biliar por CPRE: urgente na grave, precoce na moderada e se falha clínica na leve.'
                              : isCholecystitis
                                ? '• Colecistectomia laparoscópica precoce é preferencial; se alto risco cirúrgico, considerar drenagem percutânea.'
                                : isAppendicitis
                                  ? '• TC com contraste é preferencial quando disponível; USG é opção em gestantes e crianças, mas exame normal não exclui o diagnóstico.'
                                  : isLombalgia
                                    ? '• Retornar imediatamente se retenção/incontinência urinária, incontinência fecal, anestesia em sela, febre, perda de força ou perda de sensibilidade.'
                            : '• Procurar atendimento antes do retorno programado se surgirem dor torácica, confusão mental, cianose, hipotensão ou intolerância à via oral.',
        '',
        prescriptionsText + 'Assinatura do Médico:',
        '__________________________________________________',
        doctorSignatureLine,
        '',
        '---',
        'Receituário gerado automaticamente pelo Sistema Siga o Fluxo',
        formatDate(new Date())
      ].join('\n')
    }

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
          '• Retornar no dia da melhora da febre, pela possibilidade de início da fase crítica.',
          '• Manter seguimento até 48h após remissão da febre.'
        ]
      : [
          '• Retornar no dia da melhora da febre, pela possibilidade de início da fase crítica.',
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
      doctorSignatureLine,
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
                <strong>Diagnóstico:</strong> {isBell ? bellDiagnosisLabel : flowName}
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
                            <div>§ Pediatria: até 10 kg → 130 mL/kg/dia; 10–20 kg → 100 mL/kg/dia; acima de 20 kg → 80 mL/kg/dia</div>
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
                        <div>• Retornar no dia da melhora da febre, pela possibilidade de início da fase crítica.</div>
                        <div>• Manter seguimento até 48h após remissão da febre.</div>
                      </>
                    ) : (
                      <>
                        <div>• Retornar no dia da melhora da febre, pela possibilidade de início da fase crítica.</div>
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
                ) : isBell ? (
                  <div className="space-y-5 text-lg">
                    <div className={clsx(
                      'rounded-xl border p-4',
                      bellTypicalPath ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'
                    )}>
                      <h3 className="mb-2 font-bold text-slate-900">Conduta clínica registrada</h3>
                      <p className="leading-relaxed text-slate-800">{bellConductSummary}</p>
                    </div>

                    {bellTypicalPath && bellTreatment?.eyeCare && (
                      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                        <h3 className="mb-2 font-bold text-cyan-950">Proteção ocular</h3>
                        <ul className="space-y-1 text-cyan-950">
                          <li>• Utilizar lágrimas artificiais durante o dia conforme prescrição.</li>
                          <li>• Aplicar pomada lubrificante e realizar oclusão palpebral cuidadosa à noite.</li>
                          <li>• Proteger o olho contra vento, poeira e trauma.</li>
                        </ul>
                      </div>
                    )}

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="mb-2 font-bold text-red-950">Retorno imediato e sinais de alerta</h3>
                      <ul className="space-y-2 text-red-950">
                        {bellSafetyItems.map(item => <li key={item}>• {item}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : isInfluenza ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                      <h3 className="font-bold text-cyan-900 mb-2">Classificação atual</h3>
                      <p className="text-cyan-900">{getInfluenzaDispositionLabel()}.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-bold text-slate-800 mb-2">Cuidados gerais</h3>
                      <ul className="space-y-1 text-slate-700">
                        <li>• Manter hidratação oral e alimentação conforme tolerância.</li>
                        <li>• Manter isolamento por gotículas enquanto sintomático: máscara, higiene das mãos, cobrir tosse/espirro, evitar contato próximo com pessoas vulneráveis e manter ambiente ventilado.</li>
                        <li>• Controlar febre, dor e congestão conforme prescrição registrada.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h3 className="font-bold text-amber-900 mb-2">Retorno e sinais de alerta</h3>
                      <ul className="space-y-1 text-amber-900">
                        <li>• Reavaliar em 48 a 72 horas ou antes se houver piora.</li>
                        <li>• Retorno imediato em dispneia, desconforto respiratório, saturação baixa, confusão, desidratação ou febre persistente.</li>
                        <li>• Pacientes com indicação de oseltamivir devem manter adesão completa ao esquema antiviral.</li>
                      </ul>
                    </div>
                  </div>
                ) : isPneumonia ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <h3 className="font-bold text-emerald-900 mb-2">Cuidados gerais</h3>
                      <ul className="space-y-1 text-emerald-900">
                        <li>• Manter hidratação e alimentação conforme tolerância.</li>
                        <li>• Usar antibiótico exatamente pelo tempo prescrito.</li>
                        <li>• Evitar automedicação e revisar alergias antes do início do esquema.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h3 className="font-bold text-amber-900 mb-2">Retorno e sinais de alerta</h3>
                      <ul className="space-y-1 text-amber-900">
                        <li>• Reavaliar em 48 a 72 horas, ou antes se houver piora.</li>
                        <li>• Retornar imediatamente em dispneia, queda de saturação, confusão, hipotensão, dor torácica, vômitos persistentes ou intolerância à via oral.</li>
                        <li>• Considerar nova imagem/investigação se não houver resposta clínica adequada.</li>
                      </ul>
                    </div>
                  </div>
                ) : isSinusitis ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                      <h3 className="font-bold text-teal-900 mb-2">Cuidados gerais</h3>
                      <ul className="space-y-1 text-teal-900">
                        <li>• Realizar lavagem nasal com soro fisiológico.</li>
                        <li>• Usar corticosteroide nasal conforme prescrição.</li>
                        <li>• Evitar descongestionante nasal por mais de 5 dias, pelo risco de rinite medicamentosa.</li>
                        <li>• Não usar antibiótico quando o quadro for viral ou alérgico sem critérios bacterianos.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h3 className="font-bold text-amber-900 mb-2">Retorno e sinais de alerta</h3>
                      <ul className="space-y-1 text-amber-900">
                        <li>• Retornar se sintomas durarem mais de 10 dias ou piorarem após o 5º dia.</li>
                        <li>• Procurar atendimento imediato em visão dupla, redução visual, proptose, sinais meníngeos, alteração mental ou indícios de sepse.</li>
                        <li>• Retornar se cefaleia ou dor facial intensa não responder à medicação oral.</li>
                      </ul>
                    </div>
                  </div>
                ) : isAnaphylaxis ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-red-900 mb-2">Cuidados após anafilaxia</h3>
                      <ul className="space-y-1 text-red-900">
                        <li>• Observar recidiva dos sintomas em até 24 a 72 horas.</li>
                        <li>• Evitar o fator causal, se suspeito ou conhecido.</li>
                        <li>• Encaminhar para especialista/alergologista para elucidar causa e plano de prevenção.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h3 className="font-bold text-amber-900 mb-2">Retorno imediato</h3>
                      <ul className="space-y-1 text-amber-900">
                        <li>• Dispneia, sibilância, estridor ou sensação de fechamento de garganta.</li>
                        <li>• Urticária difusa, angioedema, tontura, síncope ou hipotensão.</li>
                        <li>• Dor abdominal importante, vômitos repetitivos ou piora do estado geral.</li>
                      </ul>
                    </div>
                  </div>
                ) : isLombalgia ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-bold text-slate-900 mb-2">Manejo conservador</h3>
                      <ul className="space-y-1 text-slate-800">
                        <li>• AINEs e analgésicos comuns são primeira linha.</li>
                        <li>• Compressa morna, repouso por períodos curtos e retorno gradual às atividades.</li>
                        <li>• Tratamento conservador por 4 a 6 semanas se não houver sinais de alarme.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-red-900 mb-2">Sinais de retorno imediato</h3>
                      <ul className="space-y-1 text-red-900">
                        <li>• Retenção/incontinência urinária, incontinência fecal ou anestesia em sela.</li>
                        <li>• Febre persistente, imunossupressão, perda de peso ou histórico de neoplasia.</li>
                        <li>• Perda de força/sensibilidade, trauma significativo ou suspeita de fratura.</li>
                      </ul>
                    </div>
                  </div>
                ) : isAppendicitis ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <h3 className="font-bold text-rose-900 mb-2">Manejo hospitalar</h3>
                      <ul className="space-y-1 text-rose-900">
                        <li>• Dieta zero até definição diagnóstica e avaliação da cirurgia geral.</li>
                        <li>• Hidratação venosa, analgesia adequada, antiemético e antibioticoterapia quando indicada.</li>
                        <li>• Beta-hCG em mulheres em idade reprodutiva e EAS para diferencial com ITU.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-red-900 mb-2">Risco e imagem</h3>
                      <ul className="space-y-1 text-red-900">
                        <li>• Alvarado 0-3: baixo risco, considerar diagnósticos alternativos e alta se estável.</li>
                        <li>• Alvarado 4-6: solicitar TC ou USG; se apendicite, acionar cirurgia.</li>
                        <li>• Alvarado 7-10: imagem para confirmar ou conduta cirúrgica direta conforme avaliação.</li>
                      </ul>
                    </div>
                  </div>
                ) : isCholecystitis ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-lime-200 bg-lime-50 p-4">
                      <h3 className="font-bold text-lime-900 mb-2">Manejo hospitalar</h3>
                      <ul className="space-y-1 text-lime-900">
                        <li>• Dieta zero até definição do procedimento e avaliação cirúrgica.</li>
                        <li>• Hidratação EV, analgesia adequada, antiemético e antibioticoterapia.</li>
                        <li>• USG abdominal para avaliar parede vesicular, cálculo impactado e Murphy ultrassonográfico.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-red-900 mb-2">Cirurgia e gravidade</h3>
                      <ul className="space-y-1 text-red-900">
                        <li>• Tokyo I: colecistectomia laparoscópica precoce, idealmente até 72 horas.</li>
                        <li>• Tokyo II: colecistectomia precoce; se alto risco cirúrgico, considerar drenagem percutânea.</li>
                        <li>• Tokyo III: suporte intensivo, controle da disfunção e drenagem/colecistectomia conforme estabilidade.</li>
                      </ul>
                    </div>
                  </div>
                ) : isCholangitis ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <h3 className="font-bold text-emerald-900 mb-2">Manejo hospitalar</h3>
                      <ul className="space-y-1 text-emerald-900">
                        <li>• Dieta zero até definição do procedimento e estabilização clínica.</li>
                        <li>• Hidratação venosa, analgesia, antiemético e antibioticoterapia precoce se colangite.</li>
                        <li>• Solicitar avaliação da cirurgia geral/endoscopia para remoção do cálculo ou drenagem biliar.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-red-900 mb-2">Drenagem e gravidade</h3>
                      <ul className="space-y-1 text-red-900">
                        <li>• Tokyo III: suporte intensivo e drenagem biliar urgente, idealmente em 12-24 horas.</li>
                        <li>• Tokyo II: drenagem precoce, preferencialmente em 24-48 horas.</li>
                        <li>• Tokyo I: drenar se não houver resposta clínica adequada em até 48 horas.</li>
                      </ul>
                    </div>
                  </div>
                ) : isPancreatitis ? (
                  <div className="space-y-5 text-lg">
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <h3 className="font-bold text-orange-900 mb-2">Manejo hospitalar</h3>
                      <ul className="space-y-1 text-orange-900">
                        <li>• Dieta zero inicialmente e progressão para dieta oral pobre em gorduras assim que possível.</li>
                        <li>• Hidratação guiada por metas, preferindo Ringer Lactato quando disponível.</li>
                        <li>• Analgesia adequada, correção hidroeletrolítica e avaliação da cirurgia geral.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-red-900 mb-2">Vigilância de gravidade</h3>
                      <ul className="space-y-1 text-red-900">
                        <li>• Monitorar disfunção orgânica por Marshall e evolução após 48 horas.</li>
                        <li>• Antibiótico apenas se houver evidência de infecção sobreposta ou necrose infectada.</li>
                        <li>• Considerar TC com contraste após 72 horas e CPRE se colangite/obstrução biliar.</li>
                      </ul>
                    </div>
                  </div>
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
                    <div>{doctorSignatureLine}</div>
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
