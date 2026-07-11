'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'
import DengueFlowchartComplete from '@/components/DengueFlowchartComplete'
import EmergencyFlowchart from '@/components/EmergencyFlowchart'
import EmergencySelector from '@/components/EmergencySelector'
import PatientForm from '@/components/PatientForm'
import PatientDashboard from '@/components/PatientDashboard'
import ReturnVisitScreen from '@/components/ReturnVisitScreen'
import PrescriptionViewer from '@/components/PrescriptionViewer'
import ReportViewer from '@/components/ReportViewer'
import MedicalPrescriptionViewer from '@/components/MedicalPrescriptionViewer'
import { Patient, PatientFormData } from '@/types/patient'

import { EmergencyPatient, EmergencyFlowchart as EmergencyFlowchartType } from '@/types/emergency'
import { patientService } from '@/services/patientService'
import { updatePatientWithFlowLink } from '@/services/patientRepo'
import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { isSupabaseConfigured, supabase } from '@/services/supabaseClient'
import Header from '@/components/Header'
import ProfileScreen from '@/components/ProfileScreen'
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

type AppState = 'loading' | 'dashboard' | 'emergency-selector' | 'new-patient' | 'flowchart' | 'emergency-flowchart' | 'prescriptions' | 'report' | 'medical-prescription' | 'return-visit' | 'return-form' | 'profile'

export default function Home() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [currentEmergencyPatient, setCurrentEmergencyPatient] = useState<EmergencyPatient | null>(null)
  const [selectedFlowchart, setSelectedFlowchart] = useState<EmergencyFlowchartType | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [previousState, setPreviousState] = useState<AppState>('dashboard')
  const [isFading, setIsFading] = useState(false)
  const [safetyAlertRequired, setSafetyAlertRequired] = useState(false)
  const [safetyAlertChecks, setSafetyAlertChecks] = useState({
    read: false,
    aware: false,
    committed: false
  })

  useEffect(() => {
    let active = true
    async function ensureAuth() {
      const shouldOpenDashboardDirectly =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('view') === 'dashboard'

      if (!isSupabaseConfigured) {
        if (shouldOpenDashboardDirectly) {
          window.history.replaceState(null, '', '/')
          setAppState('dashboard')
          return
        }
        setTimeout(() => {
          if (!active) return
          setIsFading(true)
          setTimeout(() => {
            if (!active) return
            setAppState('dashboard')
          }, 500)
        }, 1200)
        return
      }
      try {
        const { data: userRes } = await supabase.auth.getUser()
        const user = userRes?.user
        if (!user) {
          setTimeout(() => {
            if (!active) return
            setIsFading(true)
            setTimeout(() => {
              if (!active) return
              router.replace('/login')
            }, 500)
          }, 4000)
          return
        }
        if (shouldOpenDashboardDirectly) {
          window.history.replaceState(null, '', '/')
          setAppState('dashboard')
          return
        }
        setTimeout(() => {
          if (!active) return
          setIsFading(true)
          setTimeout(() => {
            if (!active) return
            setAppState('dashboard')
          }, 500)
        }, 2500)
      } catch {
        setTimeout(() => {
          if (!active) return
          setIsFading(true)
          setTimeout(() => {
            if (!active) return
            setAppState('dashboard')
          }, 500)
        }, 1200)
      }
    }
    ensureAuth()
    return () => { active = false }
  }, [])

  const handleNewPatient = () => {
    setAppState('new-patient')
  }

  const handleEmergencySelector = () => {
    setAppState('emergency-selector')
  }

  const handleSelectEmergencyFlowchart = (flowchart: EmergencyFlowchartType) => {
    // Caso especial: Dengue deve usar o fluxo completo dedicado
    if (flowchart.id === 'dengue') {
      const quickPatient = patientService.createPatient({
        name: 'Paciente de Emergência',
        birthDate: new Date('2000-01-01'),
        gender: 'masculino',
        medicalRecord: `EM-${Date.now()}`,
        selectedFlowchart: 'dengue',
        generalObservations: '',
        symptoms: [],
        vitalSigns: {}
      })
      setCurrentPatient(quickPatient)
      setSafetyAlertRequired(true)
      setSafetyAlertChecks({ read: false, aware: false, committed: false })
      setAppState('flowchart')
      return
    }

    // Demais protocolos usam o fluxograma genérico de emergência
    setSelectedFlowchart(flowchart)

    const emergencyPatient: EmergencyPatient = {
      id: `emergency-${Date.now()}`,
      name: 'Paciente de Emergência',
      birthDate: new Date(),
      age: 0,
      gender: 'masculino',
      medicalRecord: `EM-${Date.now()}`,
      selectedFlowchart: flowchart.id,
      admission: {
        date: new Date(),
        time: new Date().toLocaleTimeString(),
        symptoms: []
      },
      flowchartState: {
        currentStep: flowchart.initialStep,
        history: [],
        answers: {},
        progress: 0,
        lastUpdate: new Date()
      },
      labResults: {
        status: 'not_requested'
      },
      treatment: {
        prescriptions: [],
        observations: []
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      emergencyType: flowchart.id,
      emergencyState: {
        currentStep: flowchart.initialStep,
        history: [],
        answers: {},
        progress: 0,
        lastUpdate: new Date()
      }
    } as EmergencyPatient
    setCurrentEmergencyPatient(emergencyPatient)

    setSafetyAlertRequired(true)
    setSafetyAlertChecks({ read: false, aware: false, committed: false })
    setAppState('emergency-flowchart')
  }

  const handlePatientFormSubmit = (formData: PatientFormData) => {
    const newPatient = patientService.createPatient(formData)
    setCurrentPatient(newPatient)
    setRefreshTrigger(prev => prev + 1)
    setSafetyAlertRequired(true)
    setSafetyAlertChecks({ read: false, aware: false, committed: false })
    setAppState('flowchart')
  }

  // Redirecionamento automático para grupos C/D vindo do PatientForm
  const handleSeverityRedirect = (formData: PatientFormData, group: 'C' | 'D') => {
    const newPatient = patientService.createPatient(formData)
    const targetStep = group === 'D' ? 'group_d' : 'group_c'
    try {
      // Inicializa o estado do fluxograma já no grupo detectado
      patientService.updateFlowchartState(newPatient.id, targetStep, ['start'], {}, 20, group)
    } catch (e) {
      // Falha não bloqueia navegação
      console.warn('Falha ao atualizar estado para severidade inicial:', e)
    }
    // Buscar o paciente atualizado (o objeto criado inicialmente ainda tem currentStep='start')
    const fresh = patientService.getPatientById(newPatient.id) || newPatient
    setCurrentPatient(fresh)
    setRefreshTrigger(prev => prev + 1)
    setSafetyAlertRequired(true)
    setSafetyAlertChecks({ read: false, aware: false, committed: false })
    setAppState('flowchart')
  }

  const handlePatientFormCancel = () => {
    setAppState('dashboard')
  }

  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatient(patient)
    setSafetyAlertRequired(true)
    setSafetyAlertChecks({ read: false, aware: false, committed: false })
    setAppState('flowchart')
  }

  const getFreshPatient = (patient: Patient) => {
    const localPatient = patientService.getPatientById(patient.id)
    return localPatient || patient
  }

  const handleViewPrescriptions = (patient: Patient) => {
    // Guardar o estado atual antes de mudar e garantir dados frescos do paciente
    setPreviousState(appState)
    setCurrentPatient(getFreshPatient(patient))
    setAppState('prescriptions')
  }

  const handleViewReport = (patient: Patient) => {
    // Guardar o estado atual antes de mudar e garantir dados frescos do paciente
    setPreviousState(appState)
    setCurrentPatient(getFreshPatient(patient))
    setAppState('report')
  }

  const handleViewMedicalPrescription = (patient: Patient) => {
    setPreviousState(appState) // Guardar o estado atual antes de mudar
    setCurrentPatient(getFreshPatient(patient))
    setAppState('medical-prescription')
  }

  const handleReturnVisit = (patient: Patient) => {
    setCurrentPatient(patient)
    setAppState('return-visit')
  }

  const handleStartReturn = () => {
    if (!currentPatient) return
    // Limpar dados temporários e preparar retorno
    patientService.clearPatientLocalData(currentPatient.id)
    patientService.prepareReturnVisit(currentPatient.id)
    // Atualizar referência local com dados preparados
    const fresh = patientService.getPatientById(currentPatient.id)
    if (fresh) setCurrentPatient(fresh)
    setAppState('return-form')
  }

  const handleReturnFormSubmit = (formData: PatientFormData) => {
    if (!currentPatient) return
    const updated = patientService.updatePatientFromForm(currentPatient.id, formData)
    if (updated) {
      setCurrentPatient(updated)
      setSafetyAlertRequired(true)
      setSafetyAlertChecks({ read: false, aware: false, committed: false })
      setAppState('flowchart')
    }
  }

  const handleReturnCancel = () => {
    setAppState('dashboard')
    setCurrentPatient(null)
  }

  const handleFlowchartComplete = () => {
    setSafetyAlertRequired(false)
    setAppState('dashboard')
    setCurrentPatient(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEmergencyFlowchartComplete = () => {
    setSafetyAlertRequired(false)
    setAppState('dashboard')
    setCurrentEmergencyPatient(null)
    setSelectedFlowchart(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleFlowchartUpdate = async (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, group?: 'A' | 'B' | 'C' | 'D') => {
    const storagePatient = patientService.getPatientById(patientId)
      || patientService.getAllPatients().find((storedPatient) =>
        !!currentPatient?.medicalRecord && storedPatient.medicalRecord === currentPatient.medicalRecord
      )
    const storagePatientId = storagePatient?.id || patientId

    patientService.updateFlowchartState(storagePatientId, currentStep, history, answers, progress, group)
    const lastUpdate = new Date()
    setCurrentPatient((prev) => {
      if (
        !prev
        || (prev.id !== patientId && prev.id !== storagePatientId && prev.medicalRecord !== storagePatient?.medicalRecord)
      ) return prev
      return {
        ...prev,
        id: storagePatientId,
        flowchartState: {
          currentStep,
          history,
          answers,
          progress,
          group: group ?? prev.flowchartState?.group,
          lastUpdate
        },
        updatedAt: lastUpdate
      }
    })

    try {
      const updatedPatient = patientService.getPatientById(storagePatientId)
      if (updatedPatient) {
        setCurrentPatient(updatedPatient)
      }
      await updatePatientWithFlowLink(storagePatientId, {
        flowchart_state: {
          currentStep,
          history,
          answers,
          progress,
          group: group ?? currentPatient?.flowchartState?.group ?? null,
          lastUpdate: lastUpdate.toISOString()
        }
      })
    } catch (error) {
      console.warn('Falha ao persistir estado do fluxograma no Supabase:', error)
    }
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEmergencyFlowchartUpdate = (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => {
    if (currentEmergencyPatient) {
      const updatedPatient: EmergencyPatient = {
        ...currentEmergencyPatient,
        emergencyState: {
          currentStep,
          history,
          answers,
          progress,
          riskGroup,
          lastUpdate: new Date()
        }
      }
      setCurrentEmergencyPatient(updatedPatient)
    }
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePrescriptionsClose = () => {
    // Atualizar dados do paciente para preservar progresso e prescrições
    if (currentPatient) {
      const updatedPatient = patientService.getPatientById(currentPatient.id)
      if (updatedPatient) {
        setCurrentPatient(updatedPatient)
      }
    }
    // Voltar para o estado anterior (dashboard ou flowchart)
    setAppState(previousState)
    if (previousState === 'dashboard') {
      setCurrentPatient(null)
    }
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePrescriptionsUpdate = () => {
    if (currentPatient) {
      // Recarregar dados do paciente
      const updatedPatient = patientService.getPatientById(currentPatient.id)
      if (updatedPatient) {
        setCurrentPatient(updatedPatient)
      }
    }
    setRefreshTrigger(prev => prev + 1)
  }

  const handleReportClose = () => {
    // Voltar para o estado anterior (dashboard ou flowchart)
    setAppState(previousState)
    if (previousState === 'dashboard') {
      setCurrentPatient(null)
    }
  }

  const handleMedicalPrescriptionClose = () => {
    // Voltar para o estado anterior (dashboard ou flowchart)
    setAppState(previousState)
    if (previousState === 'dashboard') {
      setCurrentPatient(null)
    }
  }

  const shouldShowSafetyAlert = Boolean(
    safetyAlertRequired &&
    (appState === 'flowchart' || appState === 'emergency-flowchart')
  )
  const canConfirmSafetyAlert = safetyAlertChecks.read && safetyAlertChecks.aware && safetyAlertChecks.committed
  const handleConfirmSafetyAlert = () => {
    if (!canConfirmSafetyAlert) return
    setSafetyAlertRequired(false)
    setSafetyAlertChecks({ read: false, aware: false, committed: false })
  }

  const isDashboardActive = ['dashboard', 'prescriptions', 'report', 'medical-prescription'].includes(appState)
  const renderContent = () => {
    if (appState === 'loading') {
      return (
        <div className={`transition-opacity duration-500 ease-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <LoadingScreen />
        </div>
      )
    }

    if (appState === 'emergency-selector') {
      return (
        <EmergencySelector
          onSelectFlowchart={handleSelectEmergencyFlowchart}
          selectedFlowchart={selectedFlowchart?.id}
        />
      )
    }

    if (appState === 'new-patient') {
      return (
        <PatientForm
          onSubmit={handlePatientFormSubmit}
          onCancel={handlePatientFormCancel}
          onSeverityRedirect={handleSeverityRedirect}
        />
      )
    }

    if (appState === 'return-visit') {
      return currentPatient ? (
        <ReturnVisitScreen
          patient={currentPatient}
          onCancel={handleReturnCancel}
          onStartReturn={handleStartReturn}
        />
      ) : null
    }

    if (appState === 'return-form') {
      return currentPatient ? (
        <PatientForm
          onSubmit={handleReturnFormSubmit}
          onCancel={handleReturnCancel}
          initialStep={4}
          presetFlowchart={'dengue'}
          skipFlowSelection={true}
          mode={'return'}
          onSeverityRedirect={handleSeverityRedirect}
          initialData={{
            name: currentPatient.name,
            birthDate: new Date(currentPatient.birthDate),
            gender: currentPatient.gender,
            weight: currentPatient.weight,
            allergies: currentPatient.allergies || [],
            medicalRecord: currentPatient.medicalRecord,
            selectedFlowchart: currentPatient.selectedFlowchart,
            generalObservations: currentPatient.generalObservations,
            symptoms: currentPatient.admission?.symptoms || [],
            chiefComplaint: currentPatient.admission?.chiefComplaint || currentPatient.admission?.symptoms?.[0] || '',
            complaintDuration: currentPatient.admission?.complaintDuration || '',
            vitalSigns: currentPatient.admission?.vitalSigns || {
              temperature: undefined,
              feverDays: undefined,
              bloodPressure: '',
              pam: undefined,
              heartRate: undefined,
              respiratoryRate: undefined,
              oxygenSaturation: undefined,
              glucose: undefined
            }
          }}
        />
      ) : null
    }

    // Flowchart rendering is now handled below to support background persistence

    if (appState === 'emergency-flowchart') {
      return currentEmergencyPatient && selectedFlowchart ? (
        <EmergencyFlowchart
          patient={currentEmergencyPatient}
          flowchart={selectedFlowchart}
          onComplete={handleEmergencyFlowchartComplete}
          onUpdate={handleEmergencyFlowchartUpdate}
        />
      ) : null
    }

    if (appState === 'profile') {
      return (
        <ProfileScreen 
          onBack={() => setAppState('dashboard')}
          onSignOut={() => router.replace('/login')}
        />
      )
    }

    // Dashboard and Overlays
    return (
      <>
        {/* Renderizar Header apenas se não estiver em loading, login ou em fluxogramas */}
        {appState !== 'flowchart' && 
         <Header onProfileClick={() => setAppState('profile')} />
        }

        {(appState === 'dashboard' || (isDashboardActive && previousState !== 'flowchart')) && (
          <PatientDashboard
            refreshTrigger={refreshTrigger}
            onNewPatient={handleNewPatient}
            onSelectPatient={handleSelectPatient}
            onViewPrescriptions={handleViewPrescriptions}
            onViewReport={handleViewReport}
            onViewMedicalPrescription={handleViewMedicalPrescription}
            onReturnVisit={handleReturnVisit}
          />
        )}

        {(appState === 'flowchart' || (isDashboardActive && previousState === 'flowchart')) && currentPatient && (
          currentPatient.selectedFlowchart === 'dengue' || !currentPatient.selectedFlowchart ? (
            <DengueFlowchartComplete
              patient={currentPatient}
              onComplete={handleFlowchartComplete}
              onUpdate={handleFlowchartUpdate}
              onBack={() => setAppState('dashboard')}
              onViewPrescriptions={handleViewPrescriptions}
              onViewReport={handleViewReport}
              onViewMedicalPrescription={handleViewMedicalPrescription}
            />
          ) : (
            (() => {
              const genericFlowchart = getFlowchartById(currentPatient.selectedFlowchart)
              if (genericFlowchart) {
                // Adaptar Patient -> EmergencyPatient para uso no fluxo genérico
                const emergencyPatientAdapter: EmergencyPatient = {
                  id: currentPatient.id,
                  name: currentPatient.name,
                  birthDate: new Date(currentPatient.birthDate),
                  age: currentPatient.age,
                  gender: currentPatient.gender,
                  weight: currentPatient.weight,
                  medicalRecord: currentPatient.medicalRecord,
                  selectedFlowchart: currentPatient.selectedFlowchart,
                  admission: {
                    date: new Date(currentPatient.admission?.date || currentPatient.createdAt || new Date()),
                    time: new Date(currentPatient.admission?.date || currentPatient.createdAt || new Date()).toLocaleTimeString(),
                    symptoms: currentPatient.admission?.symptoms || [],
                    chiefComplaint: currentPatient.admission?.chiefComplaint,
                    complaintDuration: currentPatient.admission?.complaintDuration,
                    vitalSigns: currentPatient.admission?.vitalSigns
                  },
                  flowchartState: {
                    currentStep: genericFlowchart.initialStep,
                    history: [],
                    answers: {},
                    progress: 0,
                    lastUpdate: new Date(),
                    ...currentPatient.flowchartState
                  },
                  labResults: { status: 'not_requested' },
                  treatment: {
                    prescriptions: [],
                    observations: []
                  },
                  status: 'active',
                  createdAt: new Date(currentPatient.createdAt || new Date()),
                  updatedAt: new Date(currentPatient.updatedAt || new Date()),
                  emergencyType: currentPatient.selectedFlowchart as any,
                  emergencyState: {
                    currentStep: genericFlowchart.initialStep,
                    history: [],
                    answers: {},
                    progress: 0,
                    lastUpdate: new Date(),
                    ...currentPatient.flowchartState
                  }
                }

                return (
                  <EmergencyFlowchart
                    patient={emergencyPatientAdapter}
                    flowchart={genericFlowchart}
                    onComplete={handleFlowchartComplete}
                    onBack={() => setAppState('dashboard')}
                    onUpdate={(pid, step, hist, ans, prog, risk) => {
                      // Usa o handler padrão que atualiza o Patient no storage
                      handleFlowchartUpdate(pid, step, hist, ans, prog, risk as any)
                    }}
                  />
                )
              }
              return null
            })()
          )
        )}

        {appState === 'prescriptions' && currentPatient && (
          <PrescriptionViewer
            patient={currentPatient}
            onClose={handlePrescriptionsClose}
            onUpdate={handlePrescriptionsUpdate}
            // Mostrar a versão verdinha (mínima) com as prescrições ativas
            mode="prescription-only"
          />
        )}

        {appState === 'report' && currentPatient && (
          <ReportViewer
            patient={currentPatient}
            onClose={handleReportClose}
          />
        )}

        {appState === 'medical-prescription' && currentPatient && (
          <MedicalPrescriptionViewer
            patient={currentPatient}
            onClose={handleMedicalPrescriptionClose}
          />
        )}
      </>
    )
  }

  return (
    <>
      {renderContent()}

      {shouldShowSafetyAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-red-300 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-5 py-5 text-white sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-100">Alerta obrigatório</p>
                  <h2 className="mt-1 text-xl font-extrabold leading-tight sm:text-2xl">
                    Alerta de segurança do paciente
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-red-50">
                    Verificação de alergias e hipersensibilidades antes de qualquer conduta terapêutica.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[calc(92vh-116px)] overflow-y-auto p-5 sm:p-7">
              <div className="rounded-2xl border-l-4 border-red-600 bg-red-50 p-4 text-red-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
                  <div className="space-y-3 text-sm leading-relaxed sm:text-base">
                    <p className="font-extrabold uppercase">
                      ALERTA DE SEGURANÇA DO PACIENTE - VERIFICAÇÃO DE ALERGIAS E HIPERSENSIBILIDADES
                    </p>
                    <p>A segurança do paciente constitui responsabilidade fundamental de todo profissional de saúde.</p>
                    <p>
                      Antes da prescrição, preparo, dispensação ou administração de qualquer medicamento, contraste,
                      imunobiológico, hemoderivado ou outra substância com potencial de desencadear reações adversas, é
                      imprescindível que o profissional realize investigação ativa sobre a existência de alergias,
                      hipersensibilidades, reações adversas prévias e demais informações relevantes relacionadas ao histórico do paciente.
                    </p>
                    <p>
                      Além da obtenção dessas informações, é dever do profissional assegurar que elas sejam registradas
                      de forma clara, completa e visível no prontuário, bem como revisar os registros existentes antes da
                      tomada de qualquer decisão terapêutica.
                    </p>
                    <p>
                      A ausência de questionamento adequado, o registro incompleto ou a falha na conferência das informações
                      previamente documentadas podem resultar em eventos adversos graves, incluindo reações anafiláticas,
                      danos permanentes e óbito.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-red-200 bg-white p-4">
                <p className="text-sm font-extrabold uppercase tracking-wide text-red-900">
                  Ao prosseguir na utilização desta plataforma, o usuário declara estar ciente de que:
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-800">
                  <li>• Deve investigar ativamente a existência de alergias e hipersensibilidades antes da administração de medicamentos ou substâncias potencialmente alergênicas;</li>
                  <li>• Deve registrar de maneira adequada as informações obtidas no prontuário ou sistema institucional correspondente;</li>
                  <li>• Deve conferir os registros de alergias e alertas clínicos antes da prescrição, preparo ou administração de qualquer tratamento;</li>
                  <li>• Deve seguir os protocolos institucionais vigentes, as boas práticas assistenciais e as normas aplicáveis à segurança do paciente;</li>
                  <li>• Reconhece que as informações disponibilizadas nesta plataforma possuem caráter educacional e de apoio à prática profissional, não substituindo a avaliação clínica individualizada nem os procedimentos de segurança obrigatórios de sua instituição.</li>
                </ul>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Confirmação do usuário</h3>
                <div className="mt-3 space-y-3">
                  {[
                    { key: 'read' as const, label: 'Li e compreendi as orientações acima.' },
                    { key: 'aware' as const, label: 'Estou ciente da importância da investigação, do registro e da conferência de alergias e hipersensibilidades antes da administração de medicamentos e demais intervenções assistenciais.' },
                    { key: 'committed' as const, label: 'Comprometo-me a adotar as medidas necessárias para a promoção da segurança do paciente e para a prevenção de eventos adversos evitáveis.' }
                  ].map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 transition-colors hover:border-red-200 hover:bg-red-50/40">
                      <input
                        type="checkbox"
                        checked={safetyAlertChecks[item.key]}
                        onChange={(event) => setSafetyAlertChecks(prev => ({ ...prev, [item.key]: event.target.checked }))}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  O fluxograma será liberado somente após a confirmação dos três itens.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmSafetyAlert}
                  disabled={!canConfirmSafetyAlert}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-700/20 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar e iniciar fluxograma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
