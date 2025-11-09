import { Patient } from "./patient"

export type EmergencyType = 
  | 'dengue'
  | 'covid19'
  | 'iam' // Infarto Agudo do Miocárdio
  | 'avc' // Acidente Vascular Cerebral
  | 'sepsis'
  | 'trauma'
  | 'stroke'
  | 'cardiac_arrest'
  | 'respiratory_failure'
  | 'pneumonia'
  | 'asthma'
  | 'pulmonary_embolism'
  | 'hypertensive_crisis'
  | 'diabetic_emergency'
  | 'seizure'
  | 'meningitis'
  | 'appendicitis'
  | 'cholecystitis'
  | 'pancreatitis'
  | 'gastrointestinal_bleeding'
  | 'renal_colic'
  | 'acute_kidney_injury'
  | 'burns'
  | 'poisoning'
  | 'drowning'
  | 'hypothermia'
  | 'heat_stroke'
  | 'pediatric_fever'
  | 'pediatric_dehydration'
  | 'pediatric_seizure'
  | 'pediatric_respiratory'
  | 'pediatric_trauma'
  | 'obstetric_bleeding'
  | 'preeclampsia'
  | 'eclampsia'
  | 'preterm_labor'
  | 'uterine_rupture'
  | 'amniotic_embolism'

export interface EmergencyFlowchart {
  id: EmergencyType
  name: string
  description: string
  category: EmergencyCategory
  priority: 'high' | 'medium' | 'low'
  icon: string
  color: string
  steps: Record<string, EmergencyStep>
  initialStep: string
  finalSteps: string[]
  riskGroups?: RiskGroup[]
  medications?: Medication[]
  labTests?: LabTest[]
  procedures?: Procedure[]
}

export type EmergencyCategory = 
  | 'cardiovascular'
  | 'respiratory'
  | 'neurological'
  | 'infectious'
  | 'trauma'
  | 'pediatric'
  | 'obstetric'
  | 'gastrointestinal'
  | 'renal'
  | 'endocrine'
  | 'environmental'
  | 'hematological'
  | 'musculoskeletal'
  | 'dermatological'
  | 'ophthalmological'
  | 'psychiatric'
  | 'metabolic'
  | 'gynecological'
  | 'toxicological'
  | 'oncological'
  | 'otorhinolaryngological'
  | 'allergic'

export interface EmergencyStep {
  id: string
  title: string
  description: string
  type: 'question' | 'action' | 'result' | 'group' | 'lab_wait' | 'medication' | 'procedure'
  options?: EmergencyOption[]
  group?: string
  icon?: string
  color?: string
  content?: string
  requiresLabs?: boolean
  generatesPrescription?: boolean
  prescriptionTemplate?: string[]
  critical?: boolean
  timeSensitive?: boolean
  requiresSpecialist?: boolean
}

export interface EmergencyOption {
  text: string
  nextStep: string
  value?: string
  critical?: boolean
  requiresImmediateAction?: boolean
}

export interface RiskGroup {
  id: string
  name: string
  description: string
  color: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: 'ambulatory' | 'observation' | 'ward' | 'icu' | 'emergency'
  interventions: string[]
}

export interface Medication {
  id: string
  name: string
  dosage: string
  route: 'oral' | 'iv' | 'im' | 'sc' | 'inhalation'
  frequency: string
  duration?: string
  contraindications: string[]
  sideEffects: string[]
  monitoring?: string[]
}

export interface LabTest {
  id: string
  name: string
  urgency: 'routine' | 'urgent' | 'emergency'
  turnaroundTime: string
  criticalValues?: {
    low?: number
    high?: number
    unit: string
  }
}

export interface Procedure {
  id: string
  name: string
  description: string
  urgency: 'routine' | 'urgent' | 'emergency'
  requiresSpecialist: boolean
  complications: string[]
  followUp: string[]
}

export interface EmergencyPatient extends Patient {
  emergencyType: EmergencyType
  emergencyState: {
    currentStep: string
    history: string[]
    answers: Record<string, string>
    progress: number
    riskGroup?: string
    lastUpdate: Date
    timeCritical?: boolean
    specialistConsulted?: boolean
  }
  emergencyVitals?: {
    glasgow?: number
    painScale?: number
    oxygenSaturation?: number
    capnography?: number
    lactate?: number
    troponin?: number
    dDimer?: number
    bloodGlucose?: number
    ketones?: number
  }
  emergencyProcedures?: {
    id: string
    name: string
    performedAt: Date
    performedBy: string
    outcome: string
  }[]
}