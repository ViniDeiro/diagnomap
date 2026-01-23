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

export interface Patient {
    id: string
    name: string
    birthDate: Date
    age: number
    gender: string
    weight?: number
    allergies: string[]
    medicalRecord: string
    selectedFlowchart: string
    generalObservations: string
    returnCount?: number

    admission: {
        date: Date
        time: string
        symptoms: string[]
        vitalSigns?: {
            temperature?: number
            heartRate?: number
            respiratoryRate?: number
            bloodPressure?: string
            oxygenSaturation?: number
            painLevel?: number
            glucose?: number
            [key: string]: any
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

    treatment: {
        prescriptions: Prescription[]
        observations: string[]
        nextEvaluation?: Date
        dischargeDate?: Date
        dischargeCriteria?: string[]
    }

    status: 'active' | 'waiting_labs' | 'discharged'

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
        status?: string
        [key: string]: any
    }

    createdAt: Date
    updatedAt: Date
}
