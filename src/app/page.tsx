'use client'

import React, { useState, useEffect } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import DengueFlowchartComplete from '@/components/DengueFlowchartComplete'
import PatientForm from '@/components/PatientForm'
import PatientDashboard from '@/components/PatientDashboard'
import PrescriptionViewer from '@/components/PrescriptionViewer'
import ReportViewer from '@/components/ReportViewer'
import MedicalPrescriptionViewer from '@/components/MedicalPrescriptionViewer'
import { Patient, PatientFormData } from '@/types/patient'
import { patientService } from '@/services/patientService'

type AppState = 'loading' | 'dashboard' | 'new-patient' | 'flowchart' | 'prescriptions' | 'report' | 'medical-prescription'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
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
    setPreviousState(appState) // Guardar o estado atual antes de mudar
    setCurrentPatient(patient)
    setAppState('prescriptions')
  }

  const handleViewReport = (patient: Patient) => {
    setPreviousState(appState) // Guardar o estado atual antes de mudar
    setCurrentPatient(patient)
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

  const handleFlowchartUpdate = (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, group?: 'A' | 'B' | 'C' | 'D') => {
    patientService.updateFlowchartState(patientId, currentStep, history, answers, progress, group)
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePrescriptionsClose = () => {
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

      case 'new-patient':
        return (
          <PatientForm
            onSubmit={handlePatientFormSubmit}
            onCancel={handlePatientFormCancel}
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

      case 'prescriptions':
        return currentPatient ? (
          <PrescriptionViewer
            patient={currentPatient}
            onClose={handlePrescriptionsClose}
            onUpdate={handlePrescriptionsUpdate}
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
