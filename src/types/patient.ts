export interface Patient {
  id: string
  name: string
  age: number
  weight?: number
  medicalRecord: string
  admission: {
    date: Date
    time: string
    symptoms: string[]
    vitalSigns?: {
      temperature?: number
      bloodPressure?: string
      heartRate?: number
      respiratoryRate?: number
    }
  }
  flowchartState: {
    currentStep: string
    history: string[]
    answers: Record<string, string>
    progress: number
    group?: 'A' | 'B' | 'C' | 'D'
    lastUpdate: Date
  }
  labResults?: {
    hemoglobin?: number
    hematocrit?: number
    platelets?: number
    albumin?: number
    transaminases?: {
      alt?: number
      ast?: number
    }
    requestDate?: Date
    resultDate?: Date
    status: 'pending' | 'completed' | 'not_requested'
  }
  treatment: {
    prescriptions: Prescription[]
    observations: string[]
    nextEvaluation?: Date
    dischargeDate?: Date
    dischargeCriteria?: string[]
  }
  status: 'active' | 'waiting_labs' | 'discharged' | 'transferred'
  createdAt: Date
  updatedAt: Date
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescribedAt: Date
  prescribedBy: string
}

export interface PatientFormData {
  name: string
  age: number
  weight?: number
  medicalRecord: string
  symptoms: string[]
  vitalSigns?: {
    temperature?: number
    bloodPressure?: string
    heartRate?: number
    respiratoryRate?: number
  }
}

export interface FlowchartStep {
  id: string
  title: string
  description: string
  type: 'question' | 'action' | 'result' | 'group' | 'lab_wait'
  options?: { text: string; nextStep: string; value?: string }[]
  group?: 'A' | 'B' | 'C' | 'D'
  icon?: React.ReactNode
  color?: string
  content?: React.ReactNode
  requiresLabs?: boolean
  generatesPrescription?: boolean
  prescriptionTemplate?: string[]
}

export interface DashboardStats {
  totalPatients: number
  activeFlowcharts: number
  waitingLabs: number
  groupA: number
  groupB: number
  groupC: number
  groupD: number
} 