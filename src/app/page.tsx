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
import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { GasometryFlowchart } from '@/components/GasometryFlowchart'
import { supabase } from '@/services/supabaseClient'

type AppState = 'loading' | 'dashboard' | 'emergency-selector' | 'new-patient' | 'flowchart' | 'emergency-flowchart' | 'gasometry-flowchart' | 'prescriptions' | 'report' | 'medical-prescription' | 'return-visit' | 'return-form'

export default function Home() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [currentEmergencyPatient, setCurrentEmergencyPatient] = useState<EmergencyPatient | null>(null)
  const [selectedFlowchart, setSelectedFlowchart] = useState<EmergencyFlowchartType | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [previousState, setPreviousState] = useState<AppState>('dashboard')
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    let active = true
    async function ensureAuth() {
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
      setTimeout(() => {
        if (!active) return
        setIsFading(true)
        setTimeout(() => {
          if (!active) return
          setAppState('dashboard')
        }, 500)
      }, 2500)
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
    // Caso especial: Gasometria abre o componente dedicado
    if (flowchart.id === 'gasometria') {
      setAppState('gasometry-flowchart')
      return
    }

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
      setAppState('flowchart')
      return
    }

    // Demais protocolos usam o fluxograma genérico de emergência
    setSelectedFlowchart(flowchart)

    if (!currentEmergencyPatient) {
      const emergencyPatient: EmergencyPatient = {
        id: `emergency-${Date.now()}`,
        name: 'Paciente de Emergência',
        birthDate: new Date(),
        age: 0,
        gender: 'masculino',
        medicalRecord: `EM-${Date.now()}`,
        selectedFlowchart: 'dengue', // Mantido para compatibilidade
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
    }

    setAppState('emergency-flowchart')
  }

  const handlePatientFormSubmit = (formData: PatientFormData) => {
    const newPatient = patientService.createPatient(formData)
    setCurrentPatient(newPatient)
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
    setAppState('flowchart')
  }

  const handlePatientFormCancel = () => {
    setAppState('dashboard')
  }

  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatient(patient)
    setAppState('flowchart')
  }

  const handleViewPrescriptions = (patient: Patient) => {
    // Guardar o estado atual antes de mudar e garantir dados frescos do paciente
    setPreviousState(appState)
    const fresh = patientService.getPatientById(patient.id) || patient
    setCurrentPatient(fresh)
    setAppState('prescriptions')
  }

  const handleViewReport = (patient: Patient) => {
    // Guardar o estado atual antes de mudar e garantir dados frescos do paciente
    setPreviousState(appState)
    const fresh = patientService.getPatientById(patient.id) || patient
    setCurrentPatient(fresh)
    setAppState('report')
  }

  const handleViewMedicalPrescription = (patient: Patient) => {
    setPreviousState(appState) // Guardar o estado atual antes de mudar
    setCurrentPatient(patient)
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
      setAppState('flowchart')
    }
  }

  const handleReturnCancel = () => {
    setAppState('dashboard')
    setCurrentPatient(null)
  }

  const handleFlowchartComplete = () => {
    setAppState('dashboard')
    setCurrentPatient(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEmergencyFlowchartComplete = () => {
    setAppState('dashboard')
    setCurrentEmergencyPatient(null)
    setSelectedFlowchart(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleFlowchartUpdate = (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, group?: 'A' | 'B' | 'C' | 'D') => {
    patientService.updateFlowchartState(patientId, currentStep, history, answers, progress, group)
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
          onEmergencySelector={handleEmergencySelector}
          onOpenGasometry={() => setAppState('gasometry-flowchart')}
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
          onEmergencySelector={handleEmergencySelector}
          onOpenGasometry={() => setAppState('gasometry-flowchart')}
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

    if (appState === 'gasometry-flowchart') {
      return (
        <GasometryFlowchart
          onComplete={() => setAppState('dashboard')}
          onCancel={() => setAppState('emergency-selector')}
        />
      )
    }

    // Dashboard and Overlays
    return (
      <>
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
          <DengueFlowchartComplete
            patient={currentPatient}
            onComplete={handleFlowchartComplete}
            onUpdate={handleFlowchartUpdate}
            onBack={() => setAppState('dashboard')}
            onViewPrescriptions={handleViewPrescriptions}
            onViewReport={handleViewReport}
          />
        )}

        {appState === 'prescriptions' && currentPatient && (
          <PrescriptionViewer
            patient={currentPatient}
            onClose={handlePrescriptionsClose}
            onUpdate={handlePrescriptionsUpdate}
            // Mostrar a versão verdinha (mínima) apenas quando vindo do fluxograma
            mode={previousState === 'flowchart' ? 'prescription-only' : 'hydration-only'}
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

  return renderContent()
}
