import { Patient, PatientFormData, Prescription, DashboardStats } from '@/types/patient'

class PatientService {
  private storageKey = 'siga_o_fluxo_patients'

  // Calcular idade a partir da data de nascimento
  private calculateAge(birthDate: Date): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

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
        birthDate: new Date(patient.birthDate),
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
    const age = this.calculateAge(formData.birthDate)
    
    const patient: Patient = {
      id,
      name: formData.name,
      birthDate: formData.birthDate,
      age,
      gender: formData.gender,
      weight: formData.weight,
      allergies: formData.allergies || [],
      medicalRecord: formData.medicalRecord,
      selectedFlowchart: formData.selectedFlowchart,
      generalObservations: formData.generalObservations,
      returnCount: 0,
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
      // Preservar grupo anterior quando não for fornecido
      const previousGroup = patients[patientIndex].flowchartState?.group
      patients[patientIndex].flowchartState = {
        currentStep,
        history,
        answers,
        progress,
        group: group ?? previousGroup,
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
      else if (['wait_labs_b', 'wait_reevaluation_c', 'wait_reevaluation_d'].includes(currentStep)) {
        patients[patientIndex].status = 'waiting_labs'
        patients[patientIndex].labResults = {
          ...patients[patientIndex].labResults,
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
  generatePrescriptions(patientId: string, group: 'A' | 'B' | 'C' | 'D', antipyreticChoice?: 'paracetamol' | 'dipirona'): Prescription[] {
    const patient = this.getPatientById(patientId)
    if (!patient) return []

    const prescriptions: Omit<Prescription, 'id' | 'prescribedAt'>[] = []
    const weight = patient.weight || (patient.age >= 18 ? 70 : patient.age * 2 + 10) // Estimativa se não informado

    // Escolha de antitérmico único
    const choice = (antipyreticChoice || 'paracetamol').toLowerCase()

    // Verificar alergias e bloquear antitérmicos quando aplicável
    const allergies = (patient.allergies || []).map(a => a.toLowerCase())
    const isAllergicTo = (key: 'paracetamol' | 'dipirona') => {
      const synonyms: Record<'paracetamol' | 'dipirona', string[]> = {
        paracetamol: ['paracetamol', 'acetaminofeno', 'acetaminophen'],
        dipirona: ['dipirona', 'metamizol', 'metamizole']
      }
      const set = new Set(synonyms[key])
      return allergies.some(a => set.has(a))
    }

    if (choice === 'dipirona') {
      if (isAllergicTo('dipirona')) {
        this.addObservation(patientId, 'Antitérmico automático não incluído: alergia registrada à Dipirona/Metamizol.')
      } else {
        const pediatricDrops = Math.round((weight * 10) / 25) // 10mg/kg | 500mg/mL ⇒ 25mg/gota
        prescriptions.push({
          medication: 'Dipirona',
          dosage: patient.age >= 18 ? '500–1000 mg' : `10 mg/kg (≈ ${pediatricDrops} gotas/dose, sol. 500mg/mL)`,
          frequency: '6/6 a 8/8 horas',
          duration: 'Conforme necessário',
          instructions: 'Para febre acima de 37,5°C. Não usar AAS ou anti-inflamatórios.',
          prescribedBy: 'Sistema Siga o Fluxo'
        })
      }
    } else {
      if (isAllergicTo('paracetamol')) {
        this.addObservation(patientId, 'Antitérmico automático não incluído: alergia registrada a Paracetamol/Acetaminofeno.')
      } else {
        const minDrops = Math.round(weight * 1) // 10mg/kg ⇒ ~1 gota/kg (200mg/mL, ~10mg/gota)
        const maxDrops = Math.round(weight * 1.5) // 15mg/kg ⇒ ~1.5 gotas/kg
        prescriptions.push({
          medication: 'Paracetamol',
          dosage: patient.age >= 18 ? '500–750 mg' : `10–15 mg/kg (≈ ${minDrops}–${maxDrops} gotas/dose, sol. 200mg/mL)`,
          frequency: '6/6 a 8/8 horas',
          duration: 'Conforme necessário',
          instructions: 'Para febre acima de 37,5°C. Não usar AAS ou anti-inflamatórios.',
          prescribedBy: 'Sistema Siga o Fluxo'
        })
      }
    }

    // Hidratação oral para grupos A e B
    if (['A', 'B'].includes(group)) {
      prescriptions.push({
        medication: 'Solução de Reidratação Oral (SRO)',
        dosage: patient.age >= 18 ? '200–400 ml' : this.getChildHydrationVolume(weight),
        frequency: 'A cada vômito/evacuação',
        duration: 'Até melhora dos sintomas',
        instructions: 'Oferecer em pequenos volumes e frequentemente. Se não tolerar via oral, retornar ao serviço.',
        prescribedBy: 'Sistema Siga o Fluxo'
      })
    }

    // Hidratação venosa para grupos C e D
    if (['C', 'D'].includes(group)) {
      prescriptions.push({
        medication: 'Soro Fisiológico 0,9%',
        dosage: patient.age >= 18 ? '500ml' : `${weight * 10}ml/kg`,
        frequency: 'EV contínuo',
        duration: 'Conforme evolução',
        instructions: 'Controlar balanço hídrico rigorosamente. Reavaliar a cada 2-4 horas.',
        prescribedBy: 'Sistema Siga o Fluxo'
      })
    }

    // Adicionar prescrições ao paciente
    prescriptions.forEach(prescription => {
      this.addPrescription(patientId, prescription)
    })

    return this.getPatientById(patientId)?.treatment.prescriptions || []
  }

  // Calcular volume de hidratação para crianças
  private getChildHydrationVolume(weight: number): string {
    const volume = Math.round(weight * 75) // 75ml/kg/dia
    return `${volume}ml/dia dividido em pequenas quantidades`
  }

  // Adicionar observação
  addObservation(patientId: string, observation: string): void {
    const patients = this.loadFromStorage()
    const patientIndex = patients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      patients[patientIndex].treatment.observations.push(observation)
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
    const patients = this.getAllPatients()
    
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
    return this.getAllPatients().filter(p => p.status === 'active')
  }

  // Buscar pacientes aguardando exames
  getPatientsWaitingLabs(): Patient[] {
    return this.getAllPatients().filter(p => p.status === 'waiting_labs')
  }

  // Deletar paciente
  deletePatient(patientId: string): void {
    const patients = this.loadFromStorage()
    const filteredPatients = patients.filter(p => p.id !== patientId)
    this.saveToStorage(filteredPatients)
  }

  // Limpar todos os dados (usado para testes)
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }

  // Preparar paciente para Retorno: resetar estado e admissão
  prepareReturnVisit(patientId: string): void {
    const patients = this.loadFromStorage()
    const idx = patients.findIndex(p => p.id === patientId)
    if (idx === -1) return

    const now = new Date()

    // Resetar estado do fluxograma e exames
    // Incrementar contador de retornos
    patients[idx].returnCount = (patients[idx].returnCount || 0) + 1
    patients[idx].flowchartState = {
      currentStep: 'start',
      history: [],
      answers: {},
      progress: 0,
      group: undefined,
      lastUpdate: now
    }

    patients[idx].labResults = {
      hemoglobin: undefined,
      hematocrit: undefined,
      platelets: undefined,
      albumin: undefined,
      transaminases: { alt: undefined, ast: undefined },
      requestDate: undefined,
      resultDate: undefined,
      status: 'not_requested'
    }

    // Atualizar admissão para o novo atendimento e limpar dados clínicos para reentrada
    patients[idx].admission = {
      date: now,
      time: now.toLocaleTimeString('pt-BR'),
      symptoms: [],
      vitalSigns: undefined
    }

    patients[idx].status = 'active'
    patients[idx].updatedAt = now
    this.saveToStorage(patients)
  }

  // Atualizar paciente a partir do formulário de retorno (reentrada de dados)
  updatePatientFromForm(patientId: string, formData: PatientFormData): Patient | null {
    const patients = this.loadFromStorage()
    const idx = patients.findIndex(p => p.id === patientId)
    if (idx === -1) return null

    const now = new Date()
    const age = this.calculateAge(formData.birthDate)

    const updated: Patient = {
      ...patients[idx],
      name: formData.name,
      birthDate: formData.birthDate,
      age,
      gender: formData.gender,
      weight: formData.weight,
      allergies: formData.allergies || [],
      medicalRecord: formData.medicalRecord,
      selectedFlowchart: formData.selectedFlowchart,
      generalObservations: formData.generalObservations,
      admission: {
        date: now,
        time: now.toLocaleTimeString('pt-BR'),
        symptoms: formData.symptoms,
        vitalSigns: formData.vitalSigns
      },
      // flowchartState permanece "start" conforme prepareReturnVisit
      flowchartState: {
        ...patients[idx].flowchartState,
        currentStep: 'start',
        history: [],
        answers: {},
        progress: 0,
        group: undefined,
        lastUpdate: now
      },
      status: 'active',
      updatedAt: now
    }

    patients[idx] = updated
    this.saveToStorage(patients)
    return updated
  }

  // Limpar chaves de localStorage associadas ao paciente (fluxo, exames, antitérmicos)
  clearPatientLocalData(patientId: string): void {
    if (typeof window === 'undefined') return
    const keys = [
      // Antitérmicos por grupo
      `antipyretic_a_${patientId}`,
      `antipyretic_b_${patientId}`,
      `antipyretic_c_${patientId}`,
      `antipyretic_d_${patientId}`,
      // Exames gerais
      `lab_hemoglobin_${patientId}`,
      `lab_hematocrit_${patientId}`,
      `lab_platelets_${patientId}`,
      `lab_albumin_${patientId}`,
      `lab_alt_${patientId}`,
      `lab_ast_${patientId}`,
      // Exames grupo B específicos
      `lab_hemoglobin_b_${patientId}`,
      `lab_hematocrit_b_${patientId}`,
      `lab_platelets_b_${patientId}`,
      `lab_albumin_b_${patientId}`,
      `lab_alt_b_${patientId}`,
      `lab_ast_b_${patientId}`,
      // Sugestões de exames do grupo B
      `suggested_exams_b_${patientId}`,
      // Fatores de risco
      `risk_factors_${patientId}`
    ]
    keys.forEach(k => {
      try { localStorage.removeItem(k) } catch {}
    })
  }

  // Corrigir progresso de pacientes existentes
  fixExistingPatientsProgress(): void {
    const patients = this.loadFromStorage()
    const updatedPatients = patients.map(patient => {
      // Se o progresso está zerado mas tem histórico, calcular progresso baseado no histórico
      if (patient.flowchartState.progress === 0 && patient.flowchartState.history.length > 0) {
        const totalSteps = 15 // Número estimado de passos no fluxograma
        const completedSteps = patient.flowchartState.history.length
        patient.flowchartState.progress = Math.min((completedSteps / totalSteps) * 100, 100)
      }
      
      // Se tem grupo definido mas progresso baixo, assumir que está quase completo
      if (patient.flowchartState.group && patient.flowchartState.progress < 80) {
        patient.flowchartState.progress = 85
      }
      
      return patient
    })
    
    this.saveToStorage(updatedPatients)
  }
}

export const patientService = new PatientService()