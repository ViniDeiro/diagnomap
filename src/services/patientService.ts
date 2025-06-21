import { Patient, PatientFormData, Prescription, DashboardStats } from '@/types/patient'

class PatientService {
  private storageKey = 'diagnomap_patients'

  // Salvar pacientes no localStorage
  private saveToStorage(patients: Patient[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(patients))
    }
  }

  // Carregar pacientes do localStorage
  private loadFromStorage(): Patient[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) return []
      
      const patients = JSON.parse(data)
      // Converter strings de data de volta para Date objects
      return patients.map((patient: Patient) => ({
        ...patient,
        admission: {
          ...patient.admission,
          date: new Date(patient.admission.date)
        },
        flowchartState: {
          ...patient.flowchartState,
          lastUpdate: new Date(patient.flowchartState.lastUpdate)
        },
        treatment: {
          ...patient.treatment,
          prescriptions: patient.treatment.prescriptions.map((p: Prescription) => ({
            ...p,
            prescribedAt: new Date(p.prescribedAt)
          })),
          nextEvaluation: patient.treatment.nextEvaluation ? new Date(patient.treatment.nextEvaluation) : undefined,
          dischargeDate: patient.treatment.dischargeDate ? new Date(patient.treatment.dischargeDate) : undefined
        },
        labResults: patient.labResults ? {
          ...patient.labResults,
          requestDate: patient.labResults.requestDate ? new Date(patient.labResults.requestDate) : undefined,
          resultDate: patient.labResults.resultDate ? new Date(patient.labResults.resultDate) : undefined
        } : undefined,
        createdAt: new Date(patient.createdAt),
        updatedAt: new Date(patient.updatedAt)
      }))
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
      return []
    }
  }

  // Criar novo paciente
  createPatient(formData: PatientFormData): Patient {
    const id = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const patient: Patient = {
      id,
      name: formData.name,
      age: formData.age,
      weight: formData.weight,
      medicalRecord: formData.medicalRecord,
      admission: {
        date: now,
        time: now.toLocaleTimeString('pt-BR'),
        symptoms: formData.symptoms,
        vitalSigns: formData.vitalSigns
      },
      flowchartState: {
        currentStep: 'start',
        history: [],
        answers: {},
        progress: 0,
        lastUpdate: now
      },
      treatment: {
        prescriptions: [],
        observations: []
      },
      status: 'active',
      createdAt: now,
      updatedAt: now
    }

    const patients = this.loadFromStorage()
    patients.push(patient)
    this.saveToStorage(patients)
    
    return patient
  }

  // Buscar todos os pacientes
  getAllPatients(): Patient[] {
    return this.loadFromStorage()
  }

  // Buscar paciente por ID
  getPatientById(id: string): Patient | null {
    const patients = this.loadFromStorage()
    return patients.find(p => p.id === id) || null
  }

  // Atualizar estado do fluxograma
  updateFlowchartState(patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, group?: 'A' | 'B' | 'C' | 'D'): void {
    const patients = this.loadFromStorage()
    const patientIndex = patients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      patients[patientIndex].flowchartState = {
        currentStep,
        history,
        answers,
        progress,
        group,
        lastUpdate: new Date()
      }
      patients[patientIndex].updatedAt = new Date()
      
      // Se fluxograma foi finalizado, dar alta ao paciente
      if (currentStep === 'end') {
        patients[patientIndex].status = 'discharged'
        patients[patientIndex].treatment.dischargeDate = new Date()
        patients[patientIndex].treatment.dischargeCriteria = [
          'Fluxograma de classificação de risco concluído',
          'Conduta médica definida conforme protocolo',
          'Orientações de retorno fornecidas'
        ]
      }
      // Se chegou em um grupo que requer exames, mudar status
      else if (['group_c_treatment', 'group_d_treatment'].includes(currentStep)) {
        patients[patientIndex].status = 'waiting_labs'
        patients[patientIndex].labResults = {
          status: 'pending',
          requestDate: new Date()
        }
      }
      
      this.saveToStorage(patients)
    }
  }

  // Adicionar resultados de exames
  updateLabResults(patientId: string, results: Partial<Patient['labResults']>): void {
    const patients = this.loadFromStorage()
    const patientIndex = patients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      patients[patientIndex].labResults = {
        ...patients[patientIndex].labResults,
        ...results,
        resultDate: new Date(),
        status: 'completed'
      }
      patients[patientIndex].status = 'active'
      patients[patientIndex].updatedAt = new Date()
      this.saveToStorage(patients)
    }
  }

  // Adicionar prescrição
  addPrescription(patientId: string, prescription: Omit<Prescription, 'id' | 'prescribedAt'>): void {
    const patients = this.loadFromStorage()
    const patientIndex = patients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      const newPrescription: Prescription = {
        ...prescription,
        id: `prescription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prescribedAt: new Date()
      }
      
      patients[patientIndex].treatment.prescriptions.push(newPrescription)
      patients[patientIndex].updatedAt = new Date()
      this.saveToStorage(patients)
    }
  }

  // Gerar prescrições automáticas baseadas no grupo
  generatePrescriptions(patientId: string, group: 'A' | 'B' | 'C' | 'D'): Prescription[] {
    const patient = this.getPatientById(patientId)
    if (!patient) return []

    const prescriptions: Omit<Prescription, 'id' | 'prescribedAt'>[] = []
    const weight = patient.weight || (patient.age >= 18 ? 70 : patient.age * 2 + 10) // Estimativa se não informado

    // Prescrições base para todos os grupos
    prescriptions.push({
      medication: 'Paracetamol',
      dosage: patient.age >= 18 ? '500mg' : '10-15mg/kg',
      frequency: '6/6 horas',
      duration: 'Conforme necessário',
      instructions: 'Para febre acima de 37,5°C. Não usar AAS ou anti-inflamatórios.',
      prescribedBy: 'Sistema DiagnoMap'
    })

    // Hidratação oral para grupos A e B
    if (group === 'A' || group === 'B') {
      const hydrationVolume = patient.age >= 18 ? '60ml/kg/dia' : this.getChildHydrationVolume(weight)
      
      prescriptions.push({
        medication: 'Soro de Reidratação Oral',
        dosage: hydrationVolume,
        frequency: 'Fracionado durante o dia',
        duration: 'Até melhora clínica',
        instructions: '1/3 com SRO, 2/3 com líquidos caseiros (água, chás, água de coco)',
        prescribedBy: 'Sistema DiagnoMap'
      })
    }

    // Hidratação venosa para grupos C e D
    if (group === 'C') {
      prescriptions.push({
        medication: 'Soro Fisiológico 0,9%',
        dosage: '10ml/kg',
        frequency: 'Nos primeiros 10 minutos',
        duration: 'Conforme evolução',
        instructions: 'Reavaliar após 1 hora. Monitorar sinais vitais.',
        prescribedBy: 'Sistema DiagnoMap'
      })
    }

    if (group === 'D') {
      prescriptions.push({
        medication: 'Soro Fisiológico 0,9%',
        dosage: '20ml/kg',
        frequency: 'Em até 20 minutos',
        duration: 'Conforme evolução',
        instructions: 'Cuidados intensivos. Monitoramento contínuo.',
        prescribedBy: 'Sistema DiagnoMap'
      })
    }

    // Adicionar as prescrições ao paciente
    prescriptions.forEach(prescription => {
      this.addPrescription(patientId, prescription)
    })

    return prescriptions.map(p => ({
      ...p,
      id: `prescription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prescribedAt: new Date()
    }))
  }

  // Calcular volume de hidratação para crianças
  private getChildHydrationVolume(weight: number): string {
    if (weight <= 10) return '100ml/kg/dia'
    if (weight <= 20) return '150ml/kg/dia'
    return '80ml/kg/dia'
  }

  // Adicionar observação médica
  addObservation(patientId: string, observation: string): void {
    const patients = this.loadFromStorage()
    const patientIndex = patients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      const timestampedObservation = `${new Date().toLocaleString('pt-BR')}: ${observation}`
      patients[patientIndex].treatment.observations.push(timestampedObservation)
      patients[patientIndex].updatedAt = new Date()
      this.saveToStorage(patients)
    }
  }

  // Dar alta ao paciente
  dischargePatient(patientId: string, criteria: string[]): void {
    const patients = this.loadFromStorage()
    const patientIndex = patients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      patients[patientIndex].status = 'discharged'
      patients[patientIndex].treatment.dischargeDate = new Date()
      patients[patientIndex].treatment.dischargeCriteria = criteria
      patients[patientIndex].updatedAt = new Date()
      this.saveToStorage(patients)
    }
  }

  // Obter estatísticas do dashboard
  getDashboardStats(): DashboardStats {
    const patients = this.loadFromStorage()
    
    return {
      totalPatients: patients.length,
      activeFlowcharts: patients.filter(p => p.status === 'active').length,
      waitingLabs: patients.filter(p => p.status === 'waiting_labs').length,
      groupA: patients.filter(p => p.flowchartState.group === 'A').length,
      groupB: patients.filter(p => p.flowchartState.group === 'B').length,
      groupC: patients.filter(p => p.flowchartState.group === 'C').length,
      groupD: patients.filter(p => p.flowchartState.group === 'D').length
    }
  }

  // Buscar pacientes ativos
  getActivePatients(): Patient[] {
    return this.loadFromStorage().filter(p => p.status === 'active' || p.status === 'waiting_labs')
  }

  // Buscar pacientes aguardando exames
  getPatientsWaitingLabs(): Patient[] {
    return this.loadFromStorage().filter(p => p.status === 'waiting_labs')
  }

  // Deletar paciente (apenas para desenvolvimento)
  deletePatient(patientId: string): void {
    const patients = this.loadFromStorage()
    const filteredPatients = patients.filter(p => p.id !== patientId)
    this.saveToStorage(filteredPatients)
  }

  // Limpar todos os dados (apenas para desenvolvimento)
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }

  // Corrigir progresso de pacientes existentes
  fixExistingPatientsProgress(): void {
    const patients = this.loadFromStorage()
    let updated = false

    patients.forEach(patient => {
      let newProgress = patient.flowchartState.progress
      
      // Se o paciente foi finalizado (currentStep = 'end'), corrigir para 100%
      if (patient.flowchartState.currentStep === 'end' && patient.flowchartState.progress !== 100) {
        newProgress = 100
        updated = true
      }
      // Se está nos steps finais, corrigir para 95%
      else if (patient.flowchartState.currentStep?.startsWith('end_group_') && patient.flowchartState.progress < 95) {
        newProgress = 95
        updated = true
      }

      // Atualizar se necessário
      if (newProgress !== patient.flowchartState.progress) {
        patient.flowchartState.progress = newProgress
        patient.updatedAt = new Date()
      }
    })

    if (updated) {
      this.saveToStorage(patients)
    }
  }
}

export const patientService = new PatientService() 