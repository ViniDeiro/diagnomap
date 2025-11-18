'use client'

import React, { useState, useEffect } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import DengueFlowchartComplete from '@/components/DengueFlowchartComplete'
import EmergencyFlowchart from '@/components/EmergencyFlowchart'
import EmergencySelector from '@/components/EmergencySelector'
import PatientForm from '@/components/PatientForm'
import PatientDashboard from '@/components/PatientDashboard'
import PrescriptionViewer from '@/components/PrescriptionViewer'
import ReportViewer from '@/components/ReportViewer'
import MedicalPrescriptionViewer from '@/components/MedicalPrescriptionViewer'
import { Patient, PatientFormData } from '@/types/patient'
import { EmergencyPatient, EmergencyFlowchart as EmergencyFlowchartType } from '@/types/emergency'
import { patientService } from '@/services/patientService'
import { getFlowchartById } from '@/data/emergencyFlowcharts'

type AppState = 'loading' | 'dashboard' | 'emergency-selector' | 'new-patient' | 'flowchart' | 'emergency-flowchart' | 'prescriptions' | 'report' | 'medical-prescription'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [currentEmergencyPatient, setCurrentEmergencyPatient] = useState<EmergencyPatient | null>(null)
  const [selectedFlowchart, setSelectedFlowchart] = useState<EmergencyFlowchartType | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [previousState, setPreviousState] = useState<AppState>('dashboard')

  useEffect(() => {
    // Simular carregamento inicial - tempo estendido para apreciar o design premium
    const timer = setTimeout(() => {
      setAppState('dashboard')
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  const handleNewPatient = () => {
    setAppState('new-patient')
  }

  const handleEmergencySelector = () => {
    setAppState('emergency-selector')
  }

  const handleSelectEmergencyFlowchart = (flowchart: EmergencyFlowchartType) => {
    setSelectedFlowchart(flowchart)
    
    // Criar paciente de emergência se não existir
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
    setRefreshTrigger(prev => prev + 1)
  }

  const handleMedicalPrescriptionClose = () => {
    // Voltar para o estado anterior (dashboard ou flowchart)
    setAppState(previousState)
    if (previousState === 'dashboard') {
      setCurrentPatient(null)
    }
    setRefreshTrigger(prev => prev + 1)
  }

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <LoadingScreen />

      case 'dashboard':
        return (
          <PatientDashboard
            key={refreshTrigger}
            onNewPatient={handleNewPatient}
            onSelectPatient={handleSelectPatient}
            onViewPrescriptions={handleViewPrescriptions}
            onViewReport={handleViewReport}
            onViewMedicalPrescription={handleViewMedicalPrescription}
          />
        )

      case 'emergency-selector':
        return (
          <EmergencySelector
            onSelectFlowchart={handleSelectEmergencyFlowchart}
            selectedFlowchart={selectedFlowchart?.id}
          />
        )

      case 'new-patient':
        return (
          <PatientForm
            onSubmit={handlePatientFormSubmit}
            onCancel={handlePatientFormCancel}
            onEmergencySelector={handleEmergencySelector}
          />
        )

      case 'flowchart':
        return currentPatient ? (
          <DengueFlowchartComplete
            patient={currentPatient}
            onComplete={handleFlowchartComplete}
            onUpdate={handleFlowchartUpdate}
            onBack={() => setAppState('dashboard')}
            onViewPrescriptions={handleViewPrescriptions}
            onViewReport={handleViewReport}
          />
        ) : null

      case 'emergency-flowchart':
        return currentEmergencyPatient && selectedFlowchart ? (
          <EmergencyFlowchart
            patient={currentEmergencyPatient}
            flowchart={selectedFlowchart}
            onComplete={handleEmergencyFlowchartComplete}
            onUpdate={handleEmergencyFlowchartUpdate}
          />
        ) : null

      case 'prescriptions':
        return currentPatient ? (
          <PrescriptionViewer
            patient={currentPatient}
            onClose={handlePrescriptionsClose}
            onUpdate={handlePrescriptionsUpdate}
            mode={'prescription-only'}
          />
        ) : null

      case 'report':
        return currentPatient ? (
          <ReportViewer
            patient={currentPatient}
            onClose={handleReportClose}
          />
        ) : null

      case 'medical-prescription':
        return currentPatient ? (
          <MedicalPrescriptionViewer
            patient={currentPatient}
            onClose={handleMedicalPrescriptionClose}
          />
        ) : null

      default:
        return <LoadingScreen />
    }
  }

  return renderContent()
}
