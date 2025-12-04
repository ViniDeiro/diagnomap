'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Calendar,
  Weight,
  FileText,
  Thermometer,
  Activity,
  Save,
  AlertCircle,
  ArrowLeft,
  Stethoscope,
  Heart,
  Target,
  Shield,
  MessageSquare,
  Clock,
  Users
} from 'lucide-react'
import { PatientFormData } from '@/types/patient'
import { clsx } from 'clsx'
import EmergencySelector from './EmergencySelector'
import SeverityAlertModal from './SeverityAlertModal'

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void
  onCancel: () => void
  onEmergencySelector: () => void
  // Caso especial para abrir o fluxo dedicado de Gasometria
  onOpenGasometry?: () => void
  // Opções para cenários específicos (ex.: Retorno)
  initialStep?: number // passo inicial do wizard (1–4)
  presetFlowchart?: 'dengue' | 'zika' | 'chikungunya' // define o fluxograma inicialmente
  skipFlowSelection?: boolean // se true, não exige seleção do fluxograma
  // Dados iniciais (pré-preenchimento) e modo de uso
  initialData?: PatientFormData
  mode?: 'new' | 'return'
  // Redirecionamento automático quando detectamos severidade nos sinais vitais iniciais
  onSeverityRedirect?: (data: PatientFormData, group: 'C' | 'D') => void
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, onCancel, onEmergencySelector, onOpenGasometry, onSeverityRedirect, initialStep, presetFlowchart, skipFlowSelection, initialData, mode = 'new' }) => {
  // Função para gerar ID automático
  const generatePatientId = (): string => {
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const timestamp = Date.now().toString().slice(-3)
    return `${random}${timestamp}`
  }

  // Helpers de classificação e cor de sinais vitais
  const badge = (label: string, tone: 'blue' | 'blue-dark' | 'yellow' | 'orange' | 'red' | 'black') => {
    const tones: Record<typeof tone, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      'blue-dark': 'bg-blue-200 text-blue-900 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      black: 'bg-black text-white border-black'
    } as any
    // Alinha o chip com a borda esquerda da caixa de input
    return (
      <span className={clsx('mt-2 ml-0 inline-flex items-center px-2 py-1 border rounded-full text-xs font-semibold', tones[tone])}>
        {label}
      </span>
    )
  }

  const classifyHR = (hr?: number) => {
    if (hr == null) return null
    if (hr >= 160) return badge('Taquicardia severa', 'red')
    if (hr >= 131) return badge('Taquicardia moderada', 'orange')
    if (hr > 100) return badge('Taquicardia leve', 'yellow')
    if (hr >= 60) return badge('Normal', 'blue')
    if (hr >= 50) return badge('Bradicardia leve', 'yellow')
    if (hr >= 35) return badge('Bradicardia moderada', 'orange')
    return badge('Bradicardia severa', 'red')
  }

  const classifyRR = (rr?: number) => {
    if (rr == null) return null
    if (rr >= 40) return badge('Taquipneia severa', 'red')
    if (rr >= 31) return badge('Taquipneia moderada', 'orange')
    if (rr >= 21) return badge('Taquipneia leve', 'yellow')
    if (rr >= 14) return badge('Normal', 'blue')
    if (rr >= 12) return badge('Bradipneia leve', 'yellow')
    if (rr >= 9) return badge('Bradipneia moderada', 'orange')
    return badge('Bradipneia severa', 'red')
  }

  const classifySpO2 = (spo2?: number) => {
    if (spo2 == null) return null
    if (spo2 <= 85) return badge('Hipoxemia severa', 'red')
    if (spo2 <= 89) return badge('Hipoxemia moderada', 'orange')
    if (spo2 <= 94) return badge('Hipoxemia leve', 'yellow')
    return badge('Normal', 'blue')
  }

  // Classificação detalhada de temperatura conforme parametrização institucional
  const classifyTemp = (t?: number) => {
    if (t == null || isNaN(t)) return null
    // Hipotermias primeiro
    if (t < 28) return badge('Hipotermia grave (< 28°C)', 'red')
    if (t <= 31.9) return badge('Hipotermia moderada (28–31,9°C)', 'orange')
    if (t <= 35.9) return badge('Hipotermia leve (32–35,9°C)', 'yellow')
    // Faixas normais e febris
    if (t <= 37.2 && t >= 36.0) return badge('Normal (36,0–37,2°C)', 'blue')
    if (t <= 37.7) return badge('Sub-febril (37,3–37,7°C)', 'yellow')
    if (t <= 39.9) return badge('Febre (37,8–39,9°C)', 'orange')
    // Hipertermia
    if (t > 40) return badge('Hipertermia (> 40°C)', 'red')
    // Valores fora do padrão mas não encaixados (ex.: 37.25, 40 exatamente)
    if (t > 39.9 && t <= 40) return badge('Febre alta (≈ 40°C)', 'orange')
    return null
  }

  const classifyBP = (bp?: string) => {
    if (!bp) return null
    const [sStr, dStr] = bp.split('/')
    const s = parseInt(sStr)
    const d = parseInt(dStr)
    if (isNaN(s) || isNaN(d)) return null
    // Ordem prioriza hipotensões para evitar classificação incorreta quando um componente está baixo
    const scores: Array<{ cond: boolean; chip: React.ReactElement }> = [
      // Hipotensão
      { cond: s < 70 || d < 49, chip: badge('Hipotensão severa', 'red') },
      { cond: (s >= 70 && s <= 84) || (d >= 49 && d <= 54), chip: badge('Hipotensão moderada', 'orange') },
      { cond: (s >= 85 && s <= 99) || (d >= 55 && d <= 59), chip: badge('Hipotensão leve', 'yellow') },
      // Hipertensão
      { cond: s >= 180 || d >= 110, chip: badge('Hipertensão grave', 'red') },
      { cond: (s >= 160 && s <= 179) || (d >= 100 && d <= 109), chip: badge('Hipertensão moderada', 'orange') },
      { cond: (s >= 140 && s <= 159) || (d >= 90 && d <= 99), chip: badge('Hipertensão leve', 'yellow') },
      // PA aumentada
      { cond: (s >= 120 && s <= 139) || (d >= 80 && d <= 89), chip: badge('PA aumentada', 'blue-dark') },
      // PA normal exige ambos componentes na faixa
      { cond: (s >= 100 && s <= 119) && (d >= 60 && d <= 79), chip: badge('PA normal', 'blue') },
    ]
    return scores.find(sv => sv.cond)?.chip || null
  }

  // Calcula a Pressão Arterial Média (PAM) a partir da PA "sistolica/diastolica"
  const calculatePAM = (bp?: string): number | undefined => {
    if (!bp) return undefined
    const [sStr, dStr] = bp.split('/')
    const s = parseInt(sStr)
    const d = parseInt(dStr)
    if (isNaN(s) || isNaN(d)) return undefined
    return Math.round((s + 2 * d) / 3)
  }

  // Exibe um chip com o valor da PAM calculada
  const renderPAMChip = (bp?: string) => {
    const pam = calculatePAM(bp)
    if (pam == null) return null
    return badge(`PAM ≈ ${pam} mmHg`, 'blue-dark')
  }

  // Entrada livre de PA: não força formatação durante digitação.
  // Aceita parcial até 3 dígitos por segmento e 1 barra.
  const isBPPartialAllowed = (val: string) => /^\d{0,3}(\/\d{0,3})?$/.test(val)
  const isBPCompleteValid = (val: string) => /^\d{2,3}\/\d{2,3}$/.test(val)

  const classifyGlucose = (g?: string) => {
    if (!g) return null
    const valStr = g.trim().toUpperCase()
    if (valStr === 'HI') return badge('Hiperglicemia extrema (HI)', 'black')
    if (valStr === 'LO') return badge('Hipoglicemia extrema (LO)', 'black')
    const v = parseFloat(valStr)
    if (isNaN(v)) return null
    // Hiperglicemias
    if (v > 200) return badge('Hiperglicemia severa', 'red')
    if (v >= 151) return badge('Hiperglicemia moderada', 'orange')
    if (v >= 126) return badge('Hiperglicemia leve', 'yellow')
    // Faixas elevadas e normais
    if (v >= 100) return badge('Glicemia elevada', 'blue-dark')
    if (v >= 75) return badge('Glicemia normal', 'blue')
    // Hipoglicemias
    if (v >= 60) return badge('Hipoglicemia leve', 'yellow')
    if (v >= 45) return badge('Hipoglicemia moderada', 'orange')
    return badge('Hipoglicemia severa', 'red')
  }

  // Estado do modal de severidade
  const [severityModalOpen, setSeverityModalOpen] = useState(false)
  const [severityLevel, setSeverityLevel] = useState<'yellow' | 'red' | null>(null)
  const [severityTrigger, setSeverityTrigger] = useState<string | undefined>(undefined)
  // Assinatura do último achado severo exibido; usada para evitar reabertura redundante
  const [lastSeveritySig, setLastSeveritySig] = useState<string | null>(null)
  // Campo que disparou a última severidade exibida
  const [lastTriggeredField, setLastTriggeredField] = useState<
    | null
    | 'temperature'
    | 'feverDays'
    | 'bloodPressure'
    | 'heartRate'
    | 'respiratoryRate'
    | 'oxygenSaturation'
    | 'glucose'
  >(null)
  // Campo atualmente em edição para evitar disparo de modal durante digitação
  const [editingField, setEditingField] = useState<
    | null
    | 'temperature'
    | 'feverDays'
    | 'bloodPressure'
    | 'heartRate'
    | 'respiratoryRate'
    | 'oxygenSaturation'
    | 'glucose'
  >(null)

  const [formData, setFormData] = useState<PatientFormData>(() => {
    if (initialData) {
      // Garantir defaults para campos opcionais
      return {
        ...initialData,
        selectedFlowchart: initialData.selectedFlowchart ?? (presetFlowchart ?? 'dengue'),
        allergies: initialData.allergies ?? [],
        symptoms: initialData.symptoms ?? [],
        vitalSigns: initialData.vitalSigns ?? {
          temperature: undefined,
          feverDays: undefined,
          bloodPressure: '',
          pam: undefined,
          heartRate: undefined,
          respiratoryRate: undefined
        }
      }
    }
    return {
      name: '',
      birthDate: new Date('2000-01-01'), // Data padrão ao invés de data atual
      gender: 'masculino',
      selectedFlowchart: presetFlowchart ?? 'dengue',
      generalObservations: '',
      weight: undefined,
      allergies: [],
      medicalRecord: generatePatientId(),
      symptoms: [],
      vitalSigns: {
        temperature: undefined,
        feverDays: undefined,
        bloodPressure: '',
        pam: undefined,
        heartRate: undefined,
        respiratoryRate: undefined
      }
    }
  })

  // Controle de texto da data de nascimento em formato pt-BR (dd/mm/aaaa)
  const [birthDateText, setBirthDateText] = useState<string>('')
  const [bpText, setBpText] = useState<string>('')

  const formatDateBR = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return ''
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).padStart(4, '0')
    return `${day}/${month}/${year}`
  }

  const parseDateBR = (text: string): Date | null => {
    const m = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.exec(text)
    if (!m) return null
    const day = Number(m[1])
    const month = Number(m[2])
    const year = Number(m[3])
    const d = new Date(year, month - 1, day)
    // Validar consistência (evita datas como 31/02)
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null
    }
    return d
  }

  // Sincronizar a visualização de texto com a data do estado
  useEffect(() => {
    setBirthDateText(formatDateBR(formData.birthDate))
  }, [formData.birthDate])

  // Sincronizar texto da PA quando houver atualização explícita do estado (após validação)
  useEffect(() => {
    setBpText(prev => formData.vitalSigns?.bloodPressure ?? prev)
  }, [formData.vitalSigns?.bloodPressure])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState<number>(initialStep && initialStep >= 1 && initialStep <= 4 ? initialStep : 1)
  // Controle explícito: usuário deve clicar para selecionar o fluxo
  const [hasSelectedFlow, setHasSelectedFlow] = useState<boolean>(!!skipFlowSelection)

  // Seleção de fluxograma é feita via EmergencySelector

  const emergencyOption = {
    value: 'emergency',
    label: 'Emergência',
    color: 'from-red-600 to-red-700',
    icon: <Shield className="w-8 h-8" />,
    description: 'Protocolos de emergência e urgência médica'
  }

  const dengueSymptoms = [
    'Febre',
    'Cefaleia',
    'Dor retro-orbitária',
    'Mialgia',
    'Artralgia',
    'Náuseas',
    'Vômitos',
    'Exantema',
    'Petéquias',
    'Dor abdominal',
    'Sangramento espontâneo',
    'Letargia',
    'Irritabilidade'
  ]

  const calculateAge = (birthDate: Date): number => {
    if (!birthDate || isNaN(birthDate.getTime())) {
      return 0
    }

    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return Math.max(0, age)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const isReturn = mode === 'return'

    if (!isReturn) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }

      if (!formData.birthDate || isNaN(formData.birthDate.getTime())) {
        newErrors.birthDate = 'Data de nascimento é obrigatória'
      } else {
        const age = calculateAge(formData.birthDate)
        if (age < 0 || age > 120) {
          newErrors.birthDate = 'Data de nascimento inválida'
        }
        // Verificar se a data não é no futuro
        if (formData.birthDate.getTime() > new Date().getTime()) {
          newErrors.birthDate = 'Data de nascimento não pode ser no futuro'
        }
      }

      if (!formData.gender) {
        newErrors.gender = 'Sexo é obrigatório'
      }

      if (formData.symptoms.length === 0) {
        newErrors.symptoms = 'Selecione pelo menos um sintoma'
      }
    }

    if (formData.vitalSigns?.temperature && !formData.vitalSigns?.feverDays) {
      newErrors.feverDays = 'Informe há quantos dias o paciente está com febre'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Detecta severidade a partir dos sinais vitais informados e sugere grupo
  const detectSeverityFromVitals = (): { level: 'yellow' | 'red'; trigger: string; group: 'C' | 'D' } | null => {
    const v = formData.vitalSigns || {}

    // Temperatura
    if (v.temperature != null) {
      const t = v.temperature
      if (t < 28) return { level: 'red', trigger: 'Hipotermia grave (<28°C)', group: 'D' }
      if (t > 40) return { level: 'red', trigger: 'Hipertermia (>40°C)', group: 'D' }
    }

    // Pressão arterial
    if (v.bloodPressure) {
      const [sStr, dStr] = v.bloodPressure.split('/')
      const s = parseInt(sStr)
      const d = parseInt(dStr)
      if (!isNaN(s) && !isNaN(d)) {
        if (s < 70 || d < 49) return { level: 'red', trigger: 'Hipotensão severa', group: 'D' }
        if (s >= 180 || d >= 110) return { level: 'red', trigger: 'Hipertensão grave', group: 'D' }
      }
    }

    // Frequência cardíaca
    if (v.heartRate != null) {
      const hr = v.heartRate
      if (hr >= 160 || hr < 35) return { level: 'red', trigger: 'Alteração severa de FC', group: 'D' }
    }

    // Frequência respiratória
    if (v.respiratoryRate != null) {
      const rr = v.respiratoryRate
      if (rr >= 40 || rr < 9) return { level: 'red', trigger: 'Alteração severa de FR', group: 'D' }
    }

    // SpO₂
    if (v.oxygenSaturation != null) {
      const spo2 = v.oxygenSaturation
      if (spo2 <= 85) return { level: 'red', trigger: 'Hipoxemia severa (SpO₂ ≤85%)', group: 'D' }
    }

    // Glicemia capilar
    if (v.glucose) {
      const g = v.glucose.trim().toUpperCase()
      if (g === 'HI') return { level: 'red', trigger: 'Hiperglicemia extrema (HI)', group: 'D' }
      if (g === 'LO') return { level: 'red', trigger: 'Hipoglicemia extrema (LO)', group: 'D' }
      const num = parseFloat(g)
      if (!isNaN(num)) {
        if (num < 45) return { level: 'red', trigger: 'Hipoglicemia severa', group: 'D' }
        if (num > 200) return { level: 'red', trigger: 'Hiperglicemia severa', group: 'D' }
        if (num >= 45 && num < 60) return { level: 'yellow', trigger: 'Hipoglicemia moderada', group: 'C' }
      }
    }

    return null
  }

  // Detecta severidade apenas para um campo específico (usado no onBlur)
  type VitalField = 'temperature' | 'feverDays' | 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'oxygenSaturation' | 'glucose'
  const detectSeverityForField = (
    field: VitalField,
    override?: string | number | undefined
  ): { level: 'yellow' | 'red'; trigger: string; group: 'C' | 'D' } | null => {
    const v = formData.vitalSigns || {}
    switch (field) {
      case 'temperature': {
        const t = typeof override === 'number' ? (override as number) : v.temperature
        if (t == null) return null
        if (t < 28) return { level: 'red', trigger: 'Hipotermia grave (<28°C)', group: 'D' }
        if (t > 40) return { level: 'red', trigger: 'Hipertermia (>40°C)', group: 'D' }
        return null
      }
      case 'bloodPressure': {
        const bp = typeof override === 'string' ? (override as string) : v.bloodPressure
        if (!bp) return null
        const [sStr, dStr] = bp.split('/')
        const s = parseInt(sStr)
        const d = parseInt(dStr)
        if (isNaN(s) || isNaN(d)) return null
        if (s < 70 || d < 49) return { level: 'red', trigger: 'Hipotensão severa', group: 'D' }
        if (s >= 180 || d >= 110) return { level: 'red', trigger: 'Hipertensão grave', group: 'D' }
        // Moderados: caixa amarela
        if ((s >= 160 && s <= 179) || (d >= 100 && d <= 109)) {
          return { level: 'yellow', trigger: 'Hipertensão moderada', group: 'C' }
        }
        return null
      }
      case 'heartRate': {
        const hr = typeof override === 'number' ? (override as number) : v.heartRate
        if (hr == null) return null
        if (hr >= 160 || hr < 35) return { level: 'red', trigger: 'Alteração severa de FC', group: 'D' }
        // Taquicardia moderada: caixa amarela
        if (hr >= 131 && hr < 160) return { level: 'yellow', trigger: 'Taquicardia moderada', group: 'C' }
        return null
      }
      case 'respiratoryRate': {
        const rr = typeof override === 'number' ? (override as number) : v.respiratoryRate
        if (rr == null) return null
        if (rr >= 40 || rr < 9) return { level: 'red', trigger: 'Alteração severa de FR', group: 'D' }
        return null
      }
      case 'oxygenSaturation': {
        const spo2 = typeof override === 'number' ? (override as number) : v.oxygenSaturation
        if (spo2 == null) return null
        if (spo2 <= 85) return { level: 'red', trigger: 'Hipoxemia severa (SpO₂ ≤85%)', group: 'D' }
        return null
      }
      case 'glucose': {
        const g = typeof override === 'string' ? (override as string) : v.glucose
        if (!g) return null
        const valStr = g.trim().toUpperCase()
        if (valStr === 'HI') return { level: 'red', trigger: 'Hiperglicemia extrema (HI)', group: 'D' }
        if (valStr === 'LO') return { level: 'red', trigger: 'Hipoglicemia extrema (LO)', group: 'D' }
        const num = parseFloat(valStr)
        if (isNaN(num)) return null
        if (num < 45) return { level: 'red', trigger: 'Hipoglicemia severa', group: 'D' }
        if (num > 200) return { level: 'red', trigger: 'Hiperglicemia severa', group: 'D' }
        if (num >= 45 && num < 60) return { level: 'yellow', trigger: 'Hipoglicemia moderada', group: 'C' }
        return null
      }
      case 'feverDays':
      default:
        return null
    }
  }

  // Dispara modal apenas quando o campo severo perde foco
  const handleFieldBlur = (field: VitalField, override?: string | number | undefined) => {
    setEditingField(null)
    const sev = detectSeverityForField(field, override)
    const sig = sev ? `${field}:${sev.level}:${sev.trigger}` : null
    if (sev) {
      if (sig !== lastSeveritySig) {
        setSeverityLevel(sev.level)
        setSeverityTrigger(sev.trigger)
        setSeverityModalOpen(true)
        setLastSeveritySig(sig)
        setLastTriggeredField(field)
      }
    } else {
      // Só limpa a assinatura se o próprio campo que gerou a severidade foi normalizado
      if (lastTriggeredField === field) {
        setLastSeveritySig(null)
        setLastTriggeredField(null)
      }
    }
  }

  // Modal passa a ser disparado no onBlur do campo severo; sem auto-abrir por efeito
  useEffect(() => {
    // Intencionalmente não dispara modal aqui.
  }, [formData.vitalSigns, currentStep, editingField])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        age: calculateAge(formData.birthDate)
      }
      const sev = detectSeverityFromVitals()
      if (sev && onSeverityRedirect) {
        onSeverityRedirect(dataToSubmit, sev.group)
      } else {
        onSubmit(dataToSubmit)
      }
    }
  }

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">

      {/* Premium Medical Header */}
      <div className="relative bg-white shadow-xl border-b border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-6"
          >
            <motion.button
              onClick={onCancel}
              className="group p-3 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl border border-slate-300 shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-700" />
            </motion.button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
                  <User className="w-7 h-7 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Novo Atendimento
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                    Cadastro de Paciente
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {[
                { step: 1, label: 'Fluxograma', icon: Target },
                { step: 2, label: 'Dados Pessoais', icon: User },
                { step: 3, label: 'Sintomas Clínicos', icon: Heart },
                { step: 4, label: 'Sinais Vitais', icon: Activity }
              ].map(({ step, label, icon: Icon }) => (
                <div key={step} className="flex items-center space-x-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    currentStep >= step
                      ? "bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-lg"
                      : "bg-slate-100 text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={clsx(
                    "font-medium",
                    currentStep >= step ? "text-slate-800" : "text-slate-400"
                  )}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
        >
          {/* Card Header */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-slate-400 to-blue-600"></div>

          <form onSubmit={handleSubmit} className="p-8">

            {/* Step 1: Seleção do Fluxograma */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Seleção do Fluxograma</h2>
                    <p className="text-slate-600">Escolha o protocolo de atendimento adequado</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <EmergencySelector
                    selectedFlowchart={formData.selectedFlowchart}
                    onSelectFlowchart={(flowchart) => {
                      if (flowchart.id === 'gasometria') {
                        // Abrir o fluxo dedicado de gasometria, se disponível
                        onOpenGasometry?.()
                        return
                      }
                      setFormData(prev => ({ ...prev, selectedFlowchart: flowchart.id as "dengue" | "zika" | "chikungunya" }))
                      setHasSelectedFlow(true)
                      setCurrentStep(2)
                    }}
                    onOpenGasometry={onOpenGasometry}
                  />
                  {!hasSelectedFlow && (
                    <p className="text-sm text-red-600 mt-2">Selecione um fluxograma para continuar.</p>
                  )}
                </div>

                <div className="flex justify-end pt-6">
                  <motion.button
                    type="button"
                    onClick={() => hasSelectedFlow && setCurrentStep(2)}
                    className={`px-8 py-4 rounded-xl transition-all duration-300 font-semibold flex items-center space-x-2 ${hasSelectedFlow
                      ? "bg-gradient-to-r from-blue-600 to-slate-700 text-white hover:shadow-xl"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    whileHover={{ scale: hasSelectedFlow ? 1.02 : 1 }}
                    whileTap={{ scale: hasSelectedFlow ? 0.98 : 1 }}
                    disabled={!hasSelectedFlow}
                  >
                    <span>Próximo: Dados Pessoais</span>
                    <User className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Dados Pessoais */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dados Pessoais</h2>
                    <p className="text-slate-600">Informações básicas do paciente</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Nome */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={clsx(
                          "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.name ? "border-red-400 bg-red-50" : ""
                        )}
                        placeholder="Digite o nome completo do paciente"
                      />
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Sexo */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Sexo *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: 'masculino' }))}
                        className={clsx(
                          "p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-3",
                          formData.gender === 'masculino'
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-slate-50 shadow-lg"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-800">Masculino</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: 'feminino' }))}
                        className={clsx(
                          "p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-3",
                          formData.gender === 'feminino'
                            ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Users className="w-5 h-5 text-pink-600" />
                        <span className="font-semibold text-slate-800">Feminino</span>
                      </motion.button>
                    </div>
                    {errors.gender && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.gender}
                      </motion.p>
                    )}
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Data de Nascimento *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={birthDateText}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '')
                          const trimmed = raw.slice(0, 8)
                          let masked = trimmed
                            .replace(/(\d{2})(\d)/, '$1/$2')
                            .replace(/(\d{2})(\d)/, '$1/$2')
                          setBirthDateText(masked)
                          const parsed = parseDateBR(masked)
                          if (parsed) {
                            setFormData(prev => ({ ...prev, birthDate: parsed }))
                            setErrors(prev => ({ ...prev, birthDate: '' }))
                          }
                        }}
                        onBlur={() => {
                          const parsed = parseDateBR(birthDateText)
                          if (!parsed) {
                            setErrors(prev => ({ ...prev, birthDate: 'Data de nascimento inválida' }))
                            return
                          }
                          if (parsed.getTime() > new Date().getTime()) {
                            setErrors(prev => ({ ...prev, birthDate: 'Data de nascimento não pode ser no futuro' }))
                            return
                          }
                          setFormData(prev => ({ ...prev, birthDate: parsed }))
                          setBirthDateText(formatDateBR(parsed))
                          setErrors(prev => ({ ...prev, birthDate: '' }))
                        }}
                        className={clsx(
                          "w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.birthDate ? "border-red-400 bg-red-50" : ""
                        )}
                      />
                    </div>
                    {formData.birthDate && !isNaN(formData.birthDate.getTime()) && (
                      <p className="mt-2 text-sm text-slate-600">
                        Idade: {calculateAge(formData.birthDate)} anos
                      </p>
                    )}
                    {errors.birthDate && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.birthDate}
                      </motion.p>
                    )}
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Peso (kg)
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Opcional"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Alergias */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Alergias (separe com vírgula)
                    </label>
                    <input
                      type="text"
                      value={(formData.allergies || []).join(', ')}
                      onChange={(e) => {
                        const raw = e.target.value
                        const list = raw
                          .split(',')
                          .map(v => v.trim())
                          .filter(v => v.length > 0)
                        setFormData(prev => ({ ...prev, allergies: list }))
                      }}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                      placeholder="Ex.: Dipirona, Paracetamol"
                    />
                    {formData.allergies && formData.allergies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.allergies.map((a, i) => (
                          <span key={`${a}-${i}`} className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700 border border-red-200">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ID do Paciente */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      ID do Paciente *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.medicalRecord}
                        readOnly
                        className="w-full pl-12 pr-6 py-4 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                        placeholder="ID gerado automaticamente"
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      ID gerado automaticamente e não pode ser alterado
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Próximo: Sintomas</span>
                    <Heart className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Sintomas */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sintomas Clínicos</h2>
                    <p className="text-slate-600">Selecione os sintomas apresentados pelo paciente</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dengueSymptoms.map((symptom, index) => (
                    <motion.button
                      key={symptom}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSymptomToggle(symptom)}
                      className={clsx(
                        "p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium",
                        formData.symptoms.includes(symptom)
                          ? "bg-gradient-to-r from-blue-50 to-slate-50 border-blue-500 text-blue-700 shadow-lg"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{symptom}</span>
                        {formData.symptoms.includes(symptom) && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {errors.symptoms && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center bg-red-50 px-4 py-3 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {errors.symptoms}
                  </motion.p>
                )}

                {/* Observações Gerais */}
                <div className="mt-8">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                    Observações Gerais
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <textarea
                      value={formData.generalObservations || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, generalObservations: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium resize-none"
                      placeholder="Observações adicionais sobre o paciente ou sintomas não listados..."
                      rows={4}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Use este campo para anotar qualquer informação adicional importante sobre o paciente
                  </p>
                </div>

                <div className="flex justify-between pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Próximo: Sinais Vitais</span>
                    <Activity className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Sinais Vitais */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sinais Vitais</h2>
                    <p className="text-slate-600">Registre os sinais vitais do paciente</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Temperatura */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Temperatura (°C)
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.temperature || ''}
                        onFocus={() => setEditingField('temperature')}
                        onBlur={(e) => handleFieldBlur('temperature', parseFloat(e.target.value) || undefined)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            temperature: parseFloat(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 38.5"
                        step="0.1"
                        min="30"
                        max="45"
                      />
                      {classifyTemp(formData.vitalSigns?.temperature)}
                    </div>
                  </div>

                  {/* Dias de Febre */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Há quantos dias de febre?
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.feverDays || ''}
                        onFocus={() => setEditingField('feverDays')}
                        onBlur={() => handleFieldBlur('feverDays')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            feverDays: parseInt(e.target.value) || undefined
                          }
                        }))}
                        className={clsx(
                          "w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.feverDays ? "border-red-400 bg-red-50" : ""
                        )}
                        placeholder="Ex: 3"
                        min="0"
                        max="30"
                      />
                    </div>
                    {errors.feverDays && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.feverDays}
                      </motion.p>
                    )}
                  </div>

                  {/* Pressão Arterial */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Pressão Arterial (mmHg)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={bpText}
                        onFocus={() => setEditingField('bloodPressure')}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/[^\d]/g, '')
                          let formatted = raw

                          if (raw.length >= 3) {
                            const firstThree = parseInt(raw.slice(0, 3))
                            if (firstThree > 299) {
                              // Sistólica de 2 dígitos (ex: 90, 80)
                              formatted = `${raw.slice(0, 2)}/${raw.slice(2, 5)}`
                            } else {
                              // Sistólica de 3 dígitos (ex: 120, 110)
                              if (raw.length > 3) {
                                formatted = `${raw.slice(0, 3)}/${raw.slice(3, 6)}`
                              }
                            }
                          }

                          setBpText(formatted)

                          if (isBPCompleteValid(formatted)) {
                            const pamVal = calculatePAM(formatted)
                            setFormData(prev => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                bloodPressure: formatted,
                                pam: pamVal
                              }
                            }))
                            setErrors(prev => ({ ...prev, bloodPressure: '' }))
                          }
                        }}
                        onBlur={(e) => {
                          setEditingField(null)
                          const val = e.target.value
                          if (!val) {
                            setFormData(prev => ({
                              ...prev,
                              vitalSigns: { ...prev.vitalSigns, bloodPressure: undefined, pam: undefined }
                            }))
                            return
                          }
                          if (!isBPCompleteValid(val)) {
                            // Tenta recuperar se o usuário digitou tudo junto (ex: 12080)
                            const raw = val.replace(/[^\d]/g, '')
                            let recovered = val
                            if (raw.length >= 3) {
                              const firstThree = parseInt(raw.slice(0, 3))
                              if (firstThree > 299) {
                                recovered = `${raw.slice(0, 2)}/${raw.slice(2, 5)}`
                              } else if (raw.length > 3) {
                                recovered = `${raw.slice(0, 3)}/${raw.slice(3, 6)}`
                              }
                            }

                            if (isBPCompleteValid(recovered)) {
                              setBpText(recovered)
                              const pamVal = calculatePAM(recovered)
                              setFormData(prev => ({
                                ...prev,
                                vitalSigns: {
                                  ...prev.vitalSigns,
                                  bloodPressure: recovered,
                                  pam: pamVal
                                }
                              }))
                              setErrors(prev => ({ ...prev, bloodPressure: '' }))
                              handleFieldBlur('bloodPressure', recovered)
                              return
                            }

                            setErrors(prev => ({ ...prev, bloodPressure: 'Formato inválido. Use o padrão 120/80.' }))
                            return
                          }
                          const pamVal = calculatePAM(val)
                          setFormData(prev => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              bloodPressure: val,
                              pam: pamVal
                            }
                          }))
                          handleFieldBlur('bloodPressure', val)
                        }}
                        inputMode="numeric"
                        maxLength={7}
                        className={clsx(
                          "w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.bloodPressure ? "border-red-400 bg-red-50" : ""
                        )}
                        placeholder="Ex: 120/80"
                      />
                      {errors.bloodPressure && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {errors.bloodPressure}
                        </motion.p>
                      )}
                      {classifyBP(formData.vitalSigns?.bloodPressure)}
                      {renderPAMChip(formData.vitalSigns?.bloodPressure)}
                    </div>
                  </div>

                  {/* Frequência Cardíaca */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Frequência Cardíaca (bpm)
                    </label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.heartRate || ''}
                        onFocus={() => setEditingField('heartRate')}
                        onBlur={(e) => handleFieldBlur('heartRate', parseInt(e.target.value) || undefined)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            heartRate: parseInt(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 80"
                        min="30"
                        max="200"
                      />
                      {classifyHR(formData.vitalSigns?.heartRate)}
                    </div>
                  </div>

                  {/* Frequência Respiratória */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Frequência Respiratória (rpm)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.respiratoryRate || ''}
                        onFocus={() => setEditingField('respiratoryRate')}
                        onBlur={(e) => handleFieldBlur('respiratoryRate', parseInt(e.target.value) || undefined)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            respiratoryRate: parseInt(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 20"
                        min="10"
                        max="60"
                      />
                      {classifyRR(formData.vitalSigns?.respiratoryRate)}
                    </div>
                  </div>

                  {/* Saturação de O2 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Saturação de O2 (SpO₂ %)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.oxygenSaturation ?? ''}
                        onFocus={() => setEditingField('oxygenSaturation')}
                        onBlur={(e) => handleFieldBlur('oxygenSaturation', parseInt(e.target.value) || undefined)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            oxygenSaturation: parseInt(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 97"
                        min="50"
                        max="100"
                      />
                      {classifySpO2(formData.vitalSigns?.oxygenSaturation)}
                    </div>
                  </div>

                  {/* Glicemia Capilar */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Glicemia Capilar (mg/dL)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.vitalSigns?.glucose ?? ''}
                        onFocus={() => setEditingField('glucose')}
                        onBlur={(e) => handleFieldBlur('glucose', e.target.value)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            glucose: e.target.value
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 95 ou LO/HI"
                      />
                      {classifyGlucose(formData.vitalSigns?.glucose)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-5 h-5" />
                    <span>Salvar Paciente</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
        {/* Modal de severidade */}
        <SeverityAlertModal
          isOpen={severityModalOpen}
          onClose={() => { setSeverityModalOpen(false); setLastSeveritySig(null) }}
          level={severityLevel || 'yellow'}
          triggerTitle={severityTrigger}
          autoRedirect={false}
        />
      </div>
    </div>
  )
}

export default PatientForm
