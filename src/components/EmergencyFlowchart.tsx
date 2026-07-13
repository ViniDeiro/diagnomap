'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Heart, 
  Stethoscope, 
  Activity, 
  CheckCircle,
  Brain,
  Target,
  Zap,
  RotateCcw,
  Timer,
  Thermometer,
  UserCheck,
  Pill,
  Syringe,
  Microscope,
  ArrowLeft,
  Info,
  ScanLine,
  Clipboard,
  ClipboardCheck,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyPatient, EmergencyFlowchart as EmergencyFlowchartType, EmergencyOption, EmergencyStep, EmergencyType } from '@/types/emergency'
import { patientService } from '@/services/patientService'
import { getCurrentDoctor, type DoctorProfile } from '@/services/doctorRepo'
import PhysicalExamForm, { type PhysicalExamData } from './PhysicalExamForm'
import TEPAssessment from './TEPAssessment'
import {
  INFLUENZA_SEVERITY_SIGNS,
  INFLUENZA_RISK_FACTORS,
  INFLUENZA_WORSENING_SIGNS,
  INFLUENZA_ICU_CRITERIA,
  INFLUENZA_ICU_CRITERIA_INFO,
  buildInfluenzaPrescriptionItems,
  hasInfluenzaPrescriptionSet
} from '@/lib/influenza'
import {
  PNEUMONIA_COMORBIDITIES_FOR_AMBULATORY_ATB,
  PNEUMONIA_PSEUDOMONAS_RISK_FACTORS,
  PneumoniaCurbFieldKey,
  PneumoniaCurbValues,
  PneumoniaPsiFieldKey,
  PneumoniaPsiValues,
  buildPneumoniaPrescriptionItems,
  calculatePneumoniaCurb65,
  calculatePneumoniaPsi,
  defaultCurbValues,
  defaultPsiValues,
  hasPneumoniaPrescriptionSet
} from '@/lib/pneumonia'
import {
  SinusitisEtiology,
  buildSinusitisPrescriptionItems,
  hasSinusitisPrescriptionSet
} from '@/lib/sinusitis'
import {
  FaringoamigdaliteDisposition,
  buildFaringoamigdalitePrescriptionItems,
  getFaringoamigdaliteAntibioticAlternatives,
  hasFaringoamigdalitePrescriptionSet
} from '@/lib/faringoamigdalite'
import {
  MonoartriteDisposition,
  buildMonoartritePrescriptionItems,
  getMonoartriteGoutAlternatives,
  MONOARTRITE_SEPTIC_ANTIBIOTIC_OPTIONS,
  hasMonoartritePrescriptionSet
} from '@/lib/monoartrite'
import {
  ANSIEDADE_NON_PHARMACOLOGICAL_STEPS,
  ANSIEDADE_ORGANIC_RED_FLAGS,
  buildAnsiedadePrescriptionItems,
  getAnsiedadeMedicationAlternatives,
  hasAnsiedadePrescriptionSet
} from '@/lib/ansiedade'
import {
  VertigemDisposition,
  buildVertigemPrescriptionItems,
  getVertigemAntivertigoAlternatives,
  hasVertigemPrescriptionSet
} from '@/lib/vertigem'
import {
  CefaleiaDisposition,
  buildCefaleiaPrescriptionItems,
  getCefaleiaPsMedicationOptions,
  hasCefaleiaPrescriptionSet
} from '@/lib/cefaleia'
import {
  AgitacaoDisposition,
  buildAgitacaoPrescriptionItems,
  getAgitacaoMedicationAlternatives,
  hasAgitacaoPrescriptionSet
} from '@/lib/agitacao'
import {
  PEP_HIV_ALTERNATIVE_SCHEMES,
  PEP_HIV_FOLLOW_UP_ORIENTATIONS,
  PEP_HIV_RISK_EXPOSURES,
  PEP_HIV_RISK_MATERIALS,
  buildPepHivPrescriptionItems,
  hasPepHivPrescriptionSet
} from '@/lib/pepHiv'
import {
  ANAPHYLAXIS_ADJUNCT_CARDS,
  ANAPHYLAXIS_HOME_ORIENTATIONS,
  AnaphylaxisAdjunctKey,
  buildAnaphylaxisDischargePrescriptionItems,
  calculateAnaphylaxisAdrenalineDose,
  hasAnaphylaxisDischargePrescriptionSet
} from '@/lib/anaphylaxis'
import {
  PANCREATITIS_ICU_CRITERIA,
  PancreatitisBisapKey,
  PancreatitisMarshallValues,
  buildPancreatitisHospitalPrescriptionItems,
  calculatePancreatitisBisap,
  calculatePancreatitisMarshall,
  defaultPancreatitisBisapValues,
  defaultPancreatitisMarshallValues,
  hasPancreatitisPrescriptionSet
} from '@/lib/pancreatitis'
import {
  CHOLANGITIS_DIAGNOSIS_ITEMS,
  CHOLANGITIS_MODERATE_CRITERIA,
  CHOLANGITIS_SEVERE_CRITERIA,
  CholangitisDiagnosisKey,
  CholangitisSeverity,
  CholangitisSeverityKey,
  buildCholangitisPrescriptionItems,
  calculateCholangitisDiagnosis,
  calculateCholangitisSeverity,
  defaultCholangitisDiagnosisValues,
  defaultCholangitisSeverityValues,
  getCholangitisAntibioticOptions,
  hasCholangitisPrescriptionSet
} from '@/lib/cholangitis'
import {
  CHOLECYSTITIS_MODERATE_CRITERIA,
  CHOLECYSTITIS_SEVERE_CRITERIA,
  CholecystitisAntibioticScheme,
  CholecystitisSeverity,
  CholecystitisSeverityKey,
  buildCholecystitisPrescriptionItems,
  calculateCholecystitisSeverity,
  defaultCholecystitisSeverityValues,
  hasCholecystitisPrescriptionSet
} from '@/lib/cholecystitis'
import {
  APPENDICITIS_ALVARADO_ITEMS,
  AppendicitisAlvaradoKey,
  AppendicitisAntibioticScheme,
  buildAppendicitisPrescriptionItems,
  buildAppendicitisLowRiskPrescriptionItems,
  calculateAppendicitisAlvarado,
  defaultAppendicitisAlvaradoValues,
  getAppendicitisAntibioticOptions,
  hasAppendicitisPrescriptionSet
} from '@/lib/appendicitis'
import {
  LOMBALGIA_RISK_ITEMS,
  LombalgiaRiskKey,
  buildLombalgiaPrescriptionItems,
  calculateLombalgiaDisposition,
  defaultLombalgiaRiskValues,
  hasLombalgiaPrescriptionSet
} from '@/lib/lombalgia'
import { buildClinicalSummary } from '@/lib/clinicalSummary'

type GasometryFieldKey = 'ph' | 'pco2' | 'hco3' | 'be' | 'po2' | 'sodium' | 'chloride' | 'albumin'
type AsthmaInitialFieldKey = 'sato2' | 'fr' | 'fc' | 'pfe' | 'paco2'
type AsthmaReevalFieldKey = 'sato2Re' | 'frRe' | 'pfeRe'
type TVPLegSide = 'left' | 'right' | 'other'
type TVPPrescriptionPreview = {
  therapyId: string
  title: string
  content: string[]
}

type InfluenzaPrescriptionPreview = {
  title: string
  includeOseltamivir: boolean
  content: string[]
}

type PneumoniaPrescriptionPreview = {
  title: string
  hasComorbidityOrRecentAtb: boolean
  content: string[]
}

type SinusitisPrescriptionPreview = {
  title: string
  etiology: SinusitisEtiology
  content: string[]
}

type FaringoamigdalitePrescriptionPreview = {
  title: string
  disposition: FaringoamigdaliteDisposition
  content: string[]
}

type MonoartritePrescriptionPreview = {
  title: string
  disposition: MonoartriteDisposition
  content: string[]
}

type AnsiedadePrescriptionPreview = {
  title: string
  content: string[]
}

type VertigemPrescriptionPreview = {
  title: string
  disposition: VertigemDisposition
  content: string[]
}

type CefaleiaPrescriptionPreview = {
  title: string
  disposition: CefaleiaDisposition
  content: string[]
}

type AgitacaoPrescriptionPreview = {
  title: string
  disposition: AgitacaoDisposition
  content: string[]
}

type PepHivPrescriptionPreview = {
  title: string
  content: string[]
}

type AnaphylaxisPrescriptionPreview = {
  title: string
  content: string[]
}

type AnaphylaxisAdjunctPrescriptionPreview = {
  title: string
  content: string[]
}

type AnaphylaxisCriteriaKey = 'skin_plus_system' | 'two_systems_after_exposure' | 'known_allergen_hypotension'

type AnaphylaxisCriteriaInfo = {
  title: string
  description: string
  images: Array<{
    src: string
    alt: string
    caption: string
  }>
}

type PneumoniaReferenceImageKey = 'ct' | 'pocus' | 'blue' | 'blueAlgorithm' | 'lus'

const PNEUMONIA_REFERENCE_IMAGES: Record<PneumoniaReferenceImageKey, {
  title: string
  src: string
  alt: string
}> = {
  ct: {
    title: 'TC de Tórax',
    src: '/tc de torax.jpeg',
    alt: 'Imagem de referência de TC de tórax'
  },
  pocus: {
    title: 'POCUS Pulmonar',
    src: '/Novo%20POCUS%20pulmao.png',
    alt: 'Imagem de referência de POCUS pulmonar'
  },
  blue: {
    title: 'Protocolo BLUE',
    src: '/protocolo blue.jpeg',
    alt: 'Imagem de referência do protocolo BLUE'
  },
  blueAlgorithm: {
    title: 'Algoritmo do Protocolo BLUE',
    src: '/algoritimo.jpeg',
    alt: 'Algoritmo de decisão do protocolo BLUE'
  },
  lus: {
    title: 'LUS - Lung Ultrasound',
    src: '/LUS.jpeg',
    alt: 'Imagem de referência do Lung Ultrasound'
  }
}

type ZoomableImageModalProps = {
  title: string
  description?: string
  src: string
  alt: string
  onClose: () => void
  maxWidthClassName?: string
}

const ZoomableImageModal: React.FC<ZoomableImageModalProps> = ({
  title,
  description,
  src,
  alt,
  onClose,
  maxWidthClassName = 'max-w-6xl'
}) => {
  const [zoom, setZoom] = useState(100)
  const [imageFailed, setImageFailed] = useState(false)
  const canZoomOut = zoom > 75
  const canZoomIn = zoom < 300

  const imageStyle: React.CSSProperties = {
    width: `${zoom}%`
  }

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-[80] inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-xl ring-1 ring-white/30 transition-colors hover:bg-slate-800"
        title="Fechar imagem"
        aria-label="Fechar imagem"
      >
        <X className="h-6 w-6" />
      </button>
      <div className={clsx('flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl', maxWidthClassName)}>
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h4 className="text-lg font-extrabold text-slate-950">{title}</h4>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom(value => Math.max(75, value - 25))}
              disabled={!canZoomOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Diminuir zoom"
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="min-w-14 text-center text-sm font-bold tabular-nums text-slate-700">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom(value => Math.min(300, value + 25))}
              disabled={!canZoomIn}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
              title="Restaurar zoom"
              aria-label="Restaurar zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              title="Fechar"
              aria-label="Fechar imagem"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
          {imageFailed ? (
            <div className="flex min-h-[45vh] items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-950">
              <div>
                <p className="text-lg font-extrabold">Imagem não encontrada</p>
                <p className="mt-2 text-sm leading-relaxed">
                  Verifique se o arquivo está na pasta public com este nome: <strong>{src.replace(/^\//, '')}</strong>
                </p>
              </div>
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              style={imageStyle}
              onError={() => setImageFailed(true)}
              className="mx-auto block h-auto min-w-0 max-w-none rounded-xl"
            />
          )}
        </div>
      </div>
    </div>
  )
}

type FlowVitalSigns = {
  temperature?: number
  feverDays?: number
  bloodPressure?: string
  heartRate?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  glucose?: string
}

type PneumoniaLabResults = Record<string, string>

const defaultFlowVitalSigns = (patient: EmergencyPatient): FlowVitalSigns => {
  const vitalSigns = patient.admission?.vitalSigns || {}

  return {
    temperature: typeof vitalSigns.temperature === 'number' ? vitalSigns.temperature : undefined,
    bloodPressure: typeof vitalSigns.bloodPressure === 'string' ? vitalSigns.bloodPressure : undefined,
    heartRate: typeof vitalSigns.heartRate === 'number' ? vitalSigns.heartRate : undefined,
    respiratoryRate: typeof vitalSigns.respiratoryRate === 'number' ? vitalSigns.respiratoryRate : undefined,
    oxygenSaturation: typeof vitalSigns.oxygenSaturation === 'number' ? vitalSigns.oxygenSaturation : undefined,
    glucose: vitalSigns.glucose != null ? String(vitalSigns.glucose) : undefined
  }
}

const ANAPHYLAXIS_REFERENCE_IMAGES = {
  skin: {
    src: '/anaphylaxis-skin-mucosa.png',
    alt: 'Anafilaxia com acometimento de pele e mucosas',
    caption: 'Pele e mucosas: prurido, urticária, angioedema de lábios, língua ou úvula.'
  },
  respiratory: {
    src: '/anaphylaxis-respiratory.png',
    alt: 'Anafilaxia com comprometimento respiratório',
    caption: 'Respiração: dispneia, broncoespasmo, hipoxemia ou desconforto respiratório.'
  },
  gastrointestinal: {
    src: '/anaphylaxis-gi-vomiting.png',
    alt: 'Anafilaxia com dor abdominal e vômitos',
    caption: 'Gastrointestinal: dor abdominal forte, vômitos ou sintomas persistentes.'
  },
  hypotension: {
    src: '/anaphylaxis-hypotension-incontinence.png',
    alt: 'Anafilaxia com hipotensão, síncope e incontinência',
    caption: 'Circulação/neurológico: queda de pressão, síncope, má perfusão ou incontinência.'
  }
} as const

const ANAPHYLAXIS_DIAGNOSTIC_CRITERIA: Array<{
  key: AnaphylaxisCriteriaKey
  label: string
  detail: string
  info: AnaphylaxisCriteriaInfo
}> = [
  {
    key: 'skin_plus_system',
    label: 'Pele/mucosa + comprometimento respiratório ou cardiovascular',
    detail: 'Início agudo, em minutos ou poucas horas, com prurido, urticária ou angioedema e pelo menos um sinal respiratório ou de má perfusão.',
    info: {
      title: 'Pele/mucosa associada a outro sistema',
      description: 'Use este critério quando houver acometimento de pele ou mucosas junto de sinais respiratórios ou circulatórios.',
      images: [
        ANAPHYLAXIS_REFERENCE_IMAGES.skin,
        ANAPHYLAXIS_REFERENCE_IMAGES.respiratory,
        ANAPHYLAXIS_REFERENCE_IMAGES.hypotension
      ]
    }
  },
  {
    key: 'two_systems_after_exposure',
    label: 'Dois ou mais sistemas após provável exposição a alérgeno',
    detail: 'Após exposição provável, marcar quando houver combinação de pele/mucosas, respiratório, redução da PA/má perfusão ou sintomas gastrointestinais persistentes.',
    info: {
      title: 'Dois ou mais sistemas envolvidos',
      description: 'Este critério cobre a combinação rápida de manifestações em sistemas diferentes após contato com provável alérgeno.',
      images: [
        ANAPHYLAXIS_REFERENCE_IMAGES.skin,
        ANAPHYLAXIS_REFERENCE_IMAGES.respiratory,
        ANAPHYLAXIS_REFERENCE_IMAGES.gastrointestinal,
        ANAPHYLAXIS_REFERENCE_IMAGES.hypotension
      ]
    }
  },
  {
    key: 'known_allergen_hypotension',
    label: 'Hipotensão após exposição a alérgeno sabidamente conhecido',
    detail: 'Após exposição conhecida para o paciente, considerar em adultos PAS < 90 mmHg ou queda > 30% da pressão habitual; em crianças, usar ponto de corte por idade.',
    info: {
      title: 'Hipotensão após alérgeno conhecido',
      description: 'Mesmo sem manifestação cutânea, hipotensão após contato com alérgeno conhecido já fecha critério diagnóstico.',
      images: [
        ANAPHYLAXIS_REFERENCE_IMAGES.hypotension
      ]
    }
  }
]

type PancreatitisPrescriptionPreview = {
  title: string
  includeAntibiotic: boolean
  content: string[]
}

type CholangitisPrescriptionPreview = {
  title: string
  severity: CholangitisSeverity
  antibioticScheme: 'cefepime_metronidazole' | 'piperacillin_tazobactam' | 'ceftriaxone_metronidazole'
  content: string[]
}

type CholecystitisPrescriptionPreview = {
  title: string
  severity: CholecystitisSeverity
  antibioticScheme: CholecystitisAntibioticScheme
  content: string[]
}

type CholecystitisSurgeryConsultPreview = {
  title: string
  content: string[]
}

const getCholecystitisAntibioticChoices = (stepId?: string): Array<{
  value: CholecystitisAntibioticScheme
  label: string
  group: 'Monoterapia' | 'Associação'
}> => {
  if (stepId === 'cole_grave') {
    return [
      { value: 'piperacillin_tazobactam', label: 'Piperacilina + Tazobactam 4,5 g EV de 6/6 horas', group: 'Monoterapia' },
      { value: 'ertapenem', label: 'Ertapeném 1 g EV de 24/24 horas', group: 'Monoterapia' },
      { value: 'meropenem', label: 'Meropeném 1 g EV de 8/8 horas', group: 'Monoterapia' },
      { value: 'cefepime_metronidazole', label: 'Metronidazol 500 mg EV de 8/8 horas + Cefepime 2 g EV de 8/8 horas', group: 'Associação' },
      { value: 'ceftazidime_metronidazole', label: 'Metronidazol 500 mg EV de 8/8 horas + Ceftazidima 2 g EV de 8/8 horas', group: 'Associação' }
    ]
  }

  if (stepId === 'cole_moderada') {
    return [
      { value: 'piperacillin_tazobactam', label: 'Piperacilina + Tazobactam 4,5 g EV de 6/6 horas', group: 'Monoterapia' },
      { value: 'ertapenem', label: 'Ertapeném 1 g EV de 24/24 horas', group: 'Monoterapia' },
      { value: 'ceftriaxone_metronidazole', label: 'Metronidazol 500 mg EV de 8/8 horas + Ceftriaxona 2 g EV de 24/24 horas', group: 'Associação' },
      { value: 'ciprofloxacin_metronidazole', label: 'Metronidazol 500 mg EV de 8/8 horas + Ciprofloxacino 500 mg EV de 12/12 horas', group: 'Associação' }
    ]
  }

  return [
    { value: 'ampicillin_sulbactam', label: 'Ampicilina + Sulbactam 3 g EV de 6/6 horas', group: 'Monoterapia' },
    { value: 'ertapenem', label: 'Ertapeném 1 g EV de 24/24 horas', group: 'Monoterapia' },
    { value: 'ceftriaxone_metronidazole', label: 'Metronidazol 500 mg EV de 8/8 horas + Ceftriaxona 2 g EV de 24/24 horas', group: 'Associação' },
    { value: 'ciprofloxacin_metronidazole', label: 'Metronidazol 500 mg EV de 8/8 horas + Ciprofloxacino 500 mg EV de 12/12 horas', group: 'Associação' }
  ]
}

type AppendicitisPrescriptionPreview = {
  title: string
  antibioticScheme: AppendicitisAntibioticScheme
  includeAntibiotics: boolean
  content: string[]
}

type LombalgiaPrescriptionPreview = {
  title: string
  content: string[]
}

type BellCriteriaKey = 'periferica_unilateral' | 'inicio_agudo' | 'sem_causa_identificavel' | 'sem_outros_deficits'
type BellSupportKey = 'otalgia_leve' | 'hiperacusia' | 'disgeusia_ageusia' | 'xeroftalmia' | 'xerostomia' | 'infeccao_viral'
type BellPhysicalExamKey =
  | 'assimetria_repouso' | 'queda_comissura' | 'sulco_nasolabial' | 'lagoftalmo' | 'fenda_palpebral' | 'rugas_frontais_ausentes'
  | 'sobrancelha_reduzida' | 'franzir_testa_reduzido' | 'fechamento_ocular_incompleto' | 'resistencia_ocular_reduzida' | 'fenomeno_bell' | 'sinal_cilios'
  | 'sorriso_assimetrico' | 'desvio_boca' | 'fraqueza_labio_superior' | 'escape_ar' | 'bochecha_insuficiente'
  | 'bico_reduzido' | 'assobio_reduzido' | 'labio_inferior_reduzido' | 'platisma_reduzido'
  | 'paladar_alterado' | 'hiperacusia' | 'olho_seco' | 'boca_seca' | 'dor_retroauricular' | 'lacrimejamento_alterado'
  | 'pares_cranianos_normais' | 'forca_membros_normal' | 'sensibilidade_normal' | 'coordenacao_normal' | 'fala_normal' | 'marcha_normal'
  | 'deficit_neurologico_adicional'
type BellRedFlagKey =
  | 'testa_poupada'
  | 'bilateral'
  | 'progressao_maior_7_dias'
  | 'recorrencia_frequente'
  | 'otalgia_intensa'
  | 'vertigem_hipoacusia_disfagia'
  | 'ramsay_hunt'
  | 'trauma_cirurgia'
  | 'massa_parotida'
  | 'sinais_sistemicos'
  | 'multiplos_nervos'
  | 'achados_neurologicos'
type FeedbackTone = 'slate' | 'emerald' | 'amber' | 'red'

const BELL_DIAGNOSTIC_CRITERIA: Array<{ key: BellCriteriaKey; label: string; detail: string }> = [
  {
    key: 'periferica_unilateral',
    label: 'Fraqueza ou paralisia facial periférica unilateral',
    detail: 'Envolve fronte, fechamento ocular e comissura labial no mesmo hemiface.'
  },
  {
    key: 'inicio_agudo',
    label: 'Início agudo, com pico em 72 horas ou menos',
    detail: 'Instalação súbita, sem progressão lenta ou padrão recorrente.'
  },
  {
    key: 'sem_causa_identificavel',
    label: 'Ausência de causa identificável na avaliação inicial',
    detail: 'Sem trauma, otite/mastoidite, lesão estrutural, neoplasia ou outra causa evidente.'
  },
  {
    key: 'sem_outros_deficits',
    label: 'Ausência de outros déficits neurológicos',
    detail: 'Sem alteração de consciência, ataxia, disartria, hemiparesia ou outros sinais focais.'
  }
]

const BELL_SUPPORT_CRITERIA: Array<{ key: BellSupportKey; label: string; detail: string }> = [
  {
    key: 'otalgia_leve',
    label: 'Otalgia leve',
    detail: 'Dor retroauricular ou mastoidea.'
  },
  {
    key: 'hiperacusia',
    label: 'Hiperacusia',
    detail: 'Hipersensibilidade a sons.'
  },
  {
    key: 'disgeusia_ageusia',
    label: 'Disgeusia ou ageusia nos 2/3 anteriores da língua',
    detail: 'Alteração ou redução do paladar nos 2/3 anteriores da língua.'
  },
  {
    key: 'xeroftalmia',
    label: 'Xeroftalmia',
    detail: 'Redução do lacrimejamento.'
  },
  {
    key: 'xerostomia',
    label: 'Xerostomia',
    detail: 'Redução da salivação.'
  },
  {
    key: 'infeccao_viral',
    label: 'História recente de infecção viral inespecífica',
    detail: 'Pródromo viral recente pode reforçar a hipótese clínica.'
  }
]

const BELL_PHYSICAL_EXAM_GROUPS: Array<{
  title: string
  instruction: string
  items: Array<{ key: BellPhysicalExamKey; label: string }>
}> = [
  {
    title: 'Inspeção em repouso',
    instruction: 'Observe antes de solicitar qualquer movimento.',
    items: [
      { key: 'assimetria_repouso', label: 'Assimetria facial em repouso' },
      { key: 'queda_comissura', label: 'Queda da comissura labial' },
      { key: 'sulco_nasolabial', label: 'Apagamento do sulco nasolabial' },
      { key: 'lagoftalmo', label: 'Lagoftalmo' },
      { key: 'fenda_palpebral', label: 'Alargamento da fenda palpebral' },
      { key: 'rugas_frontais_ausentes', label: 'Ausência de rugas frontais' }
    ]
  },
  {
    title: 'Terço superior e testa',
    instruction: 'Peça para levantar as sobrancelhas e franzir a testa.',
    items: [
      { key: 'sobrancelha_reduzida', label: 'Elevação da sobrancelha reduzida no lado acometido' },
      { key: 'franzir_testa_reduzido', label: 'Movimento da testa reduzido ou ausente' }
    ]
  },
  {
    title: 'Avaliação ocular',
    instruction: 'Peça para fechar suavemente e depois com força, tentando abrir as pálpebras.',
    items: [
      { key: 'fechamento_ocular_incompleto', label: 'Fechamento ocular incompleto' },
      { key: 'resistencia_ocular_reduzida', label: 'Resistência à abertura palpebral reduzida' },
      { key: 'fenomeno_bell', label: 'Fenômeno de Bell visível' },
      { key: 'sinal_cilios', label: 'Sinal dos cílios presente' }
    ]
  },
  {
    title: 'Terço médio e bochechas',
    instruction: 'Peça para sorrir, mostrar os dentes e insuflar as bochechas.',
    items: [
      { key: 'sorriso_assimetrico', label: 'Sorriso assimétrico' },
      { key: 'desvio_boca', label: 'Desvio da boca para o lado saudável' },
      { key: 'fraqueza_labio_superior', label: 'Fraqueza do lábio superior' },
      { key: 'escape_ar', label: 'Escape de ar pelo lado acometido' },
      { key: 'bochecha_insuficiente', label: 'Incapacidade de manter a bochecha insuflada' }
    ]
  },
  {
    title: 'Terço inferior e platisma',
    instruction: 'Peça para fazer bico, assobiar, mostrar os dentes inferiores e tensionar o pescoço.',
    items: [
      { key: 'bico_reduzido', label: 'Movimento de bico reduzido' },
      { key: 'assobio_reduzido', label: 'Incapacidade ou dificuldade para assobiar' },
      { key: 'labio_inferior_reduzido', label: 'Mobilidade do lábio inferior reduzida' },
      { key: 'platisma_reduzido', label: 'Contração do platisma reduzida' }
    ]
  },
  {
    title: 'Sintomas associados ao VII par',
    instruction: 'Pergunte sobre sintomas que ajudam a localizar a lesão.',
    items: [
      { key: 'paladar_alterado', label: 'Alteração do paladar' },
      { key: 'hiperacusia', label: 'Hiperacusia' },
      { key: 'olho_seco', label: 'Xeroftalmia (olho seco)' },
      { key: 'boca_seca', label: 'Xerostomia (boca seca)' },
      { key: 'dor_retroauricular', label: 'Dor retroauricular' },
      { key: 'lacrimejamento_alterado', label: 'Lacrimejamento alterado' }
    ]
  },
  {
    title: 'Rastreio neurológico',
    instruction: 'Registre os componentes examinados para excluir causas centrais ou múltiplas neuropatias.',
    items: [
      { key: 'pares_cranianos_normais', label: 'Demais pares cranianos sem alterações' },
      { key: 'forca_membros_normal', label: 'Força preservada nos quatro membros' },
      { key: 'sensibilidade_normal', label: 'Sensibilidade preservada' },
      { key: 'coordenacao_normal', label: 'Coordenação preservada' },
      { key: 'fala_normal', label: 'Fala sem alterações' },
      { key: 'marcha_normal', label: 'Marcha sem alterações' },
      { key: 'deficit_neurologico_adicional', label: 'Déficit neurológico adicional identificado' }
    ]
  }
]

const BELL_RED_FLAGS: Array<{ key: BellRedFlagKey; label: string; detail: string }> = [
  {
    key: 'testa_poupada',
    label: 'Ausência de acometimento da musculatura da testa',
    detail: 'A musculatura da testa costuma ser poupada na paralisia facial central.'
  },
  {
    key: 'bilateral',
    label: 'Paralisia bilateral',
    detail: 'Acometimento bilateral exige investigação adicional e afasta Bell típica.'
  },
  {
    key: 'progressao_maior_7_dias',
    label: 'Progressão dos sintomas por mais de 7 dias',
    detail: 'Progressão prolongada sugere evolução atípica e outra etiologia.'
  },
  {
    key: 'recorrencia_frequente',
    label: 'Recorrência frequente',
    detail: 'Episódios repetidos exigem investigação de causas secundárias.'
  },
  {
    key: 'otalgia_intensa',
    label: 'Otalgia intensa',
    detail: 'Dor otológica intensa aumenta suspeita de acometimento otológico ou Ramsay Hunt.'
  },
  {
    key: 'vertigem_hipoacusia_disfagia',
    label: 'Vertigem, hipoacusia ou disfagia',
    detail: 'Sintomas cocleovestibulares ou disfagia sugerem acometimento além do VII par.'
  },
  {
    key: 'ramsay_hunt',
    label: 'Vesículas auriculares ou orais, suspeita de síndrome de Ramsay Hunt',
    detail: 'Vesículas, dor otológica intensa e sintomas auditivos/vestibulares mudam a hipótese diagnóstica.'
  },
  {
    key: 'trauma_cirurgia',
    label: 'História de trauma craniano ou cirurgias otológicas',
    detail: 'Pode indicar lesão traumática ou iatrogênica do nervo facial.'
  },
  {
    key: 'massa_parotida',
    label: 'Massa parotídea ou suspeita de neoplasia',
    detail: 'Lesões estruturais podem comprimir ou infiltrar o nervo facial.'
  },
  {
    key: 'sinais_sistemicos',
    label: 'Sinais sistêmicos',
    detail: 'Febre, perda de peso ou rigidez de nuca sugerem etiologia infecciosa, inflamatória ou neoplásica.'
  },
  {
    key: 'multiplos_nervos',
    label: 'Envolvimento de múltiplos nervos cranianos',
    detail: 'Acometimento de outros pares cranianos não é esperado em Bell típica.'
  },
  {
    key: 'achados_neurologicos',
    label: 'Achados neurológicos adicionais',
    detail: 'Ataxia, diplopia, paresias ou alterações de sensibilidade exigem investigação neurológica.'
  }
]

const defaultBellCriteriaChecks = (): Record<BellCriteriaKey, boolean> => ({
  periferica_unilateral: false,
  inicio_agudo: false,
  sem_causa_identificavel: false,
  sem_outros_deficits: false
})

const defaultBellSupportChecks = (): Record<BellSupportKey, boolean> => ({
  otalgia_leve: false,
  hiperacusia: false,
  disgeusia_ageusia: false,
  xeroftalmia: false,
  xerostomia: false,
  infeccao_viral: false
})

const defaultBellRedFlagChecks = (): Record<BellRedFlagKey, boolean> => ({
  testa_poupada: false,
  bilateral: false,
  progressao_maior_7_dias: false,
  recorrencia_frequente: false,
  otalgia_intensa: false,
  vertigem_hipoacusia_disfagia: false,
  ramsay_hunt: false,
  trauma_cirurgia: false,
  massa_parotida: false,
  sinais_sistemicos: false,
  multiplos_nervos: false,
  achados_neurologicos: false
})

const bellHouseGradeLabels: Record<string, string> = {
  house_i: 'Grau I',
  house_ii: 'Grau II',
  house_iii: 'Grau III',
  house_iv: 'Grau IV',
  house_v: 'Grau V',
  house_vi: 'Grau VI'
}

type BellAntiviralChoice = 'none' | 'valaciclovir' | 'aciclovir' | 'famciclovir'

const gasometryFieldConfig: Array<{ key: GasometryFieldKey; label: string; unit: string; min: number; max: number; required: boolean }> = [
  { key: 'ph', label: 'pH', unit: '', min: 6.8, max: 7.8, required: true },
  { key: 'pco2', label: 'PaCO2', unit: 'mmHg', min: 10, max: 120, required: true },
  { key: 'hco3', label: 'HCO3-', unit: 'mEq/L', min: 3, max: 60, required: true },
  { key: 'be', label: 'BE', unit: 'mEq/L', min: -40, max: 40, required: false },
  { key: 'po2', label: 'PaO2', unit: 'mmHg', min: 20, max: 600, required: false },
  { key: 'sodium', label: 'Na+', unit: 'mEq/L', min: 100, max: 180, required: false },
  { key: 'chloride', label: 'Cl-', unit: 'mEq/L', min: 60, max: 150, required: false },
  { key: 'albumin', label: 'Albumina', unit: 'g/dL', min: 0.5, max: 6.5, required: false }
]

const gasometryFieldInfo: Record<GasometryFieldKey, string[]> = {
  ph: [
    'Henderson-Hasselbalch: pH = 6,10 + log[HCO3/(0,03×PaCO2)].',
    'Cortes: <7,35 acidemia | 7,35–7,45 normal | >7,45 alcalemia.'
  ],
  pco2: [
    'PaCO2 define eixo respiratório inicial.',
    'Cortes: >45 sugere acidose respiratória | <35 sugere alcalose respiratória.'
  ],
  hco3: [
    'Winter na acidose metabólica: PaCO2 esperada = 1,5×HCO3 + 8 ±2.',
    'Alcalose metabólica: PaCO2 esperada = HCO3 + 15 ±2.',
    'Delta/Delta usa ΔHCO3 = 24 - HCO3.'
  ],
  be: [
    'BE auxilia leitura metabólica global.',
    'Referência aproximada: -2 a +2 mEq/L.'
  ],
  po2: [
    'PaO2 avalia oxigenação e gravidade respiratória.',
    'Hipoxemia relevante quando PaO2 < 60 mmHg.'
  ],
  sodium: [
    'Ânion Gap: AG = Na - (HCO3 + Cl).',
    'Necessário para diferenciar acidose metabólica hiperclorêmica vs AG elevado.'
  ],
  chloride: [
    'Ânion Gap: AG = Na - (HCO3 + Cl).',
    'Cloro elevado favorece padrão hiperclorêmico.'
  ],
  albumin: [
    'Correção de Figge: AGcorr = AG + [(4 - albumina)×2,5].',
    'Usar quando albumina estiver reduzida.'
  ]
}

const asthmaInitialFieldConfig: Array<{ key: AsthmaInitialFieldKey; label: string; unit: string; min: number; max: number; required: boolean }> = [
  { key: 'sato2', label: 'SatO2', unit: '%', min: 50, max: 100, required: true },
  { key: 'fr', label: 'FR', unit: 'irpm', min: 8, max: 60, required: true },
  { key: 'fc', label: 'FC', unit: 'bpm', min: 30, max: 220, required: true },
  { key: 'pfe', label: 'PFE', unit: '% previsto', min: 0, max: 100, required: true },
  { key: 'paco2', label: 'PaCO2', unit: 'mmHg', min: 10, max: 120, required: false }
]

const asthmaReevalFieldConfig: Array<{ key: AsthmaReevalFieldKey; label: string; unit: string; min: number; max: number; required: boolean }> = [
  { key: 'sato2Re', label: 'SatO2 reavaliação', unit: '%', min: 50, max: 100, required: true },
  { key: 'frRe', label: 'FR reavaliação', unit: 'irpm', min: 8, max: 60, required: true },
  { key: 'pfeRe', label: 'PFE reavaliação', unit: '% previsto', min: 0, max: 100, required: true }
]

const asthmaInitialInfo: Record<AsthmaInitialFieldKey, string[]> = {
  sato2: ['Se SatO2 < 94%, iniciar O2 suplementar.', 'Meta usual no PS: SatO2 93–95%.'],
  fr: ['FR > 30 sugere gravidade.', 'FR 25–30 costuma indicar exacerbação moderada.'],
  fc: ['FC > 120 é marcador de maior gravidade.', 'Interpretar junto de dispneia e esforço respiratório.'],
  pfe: ['PFE (% do previsto): >70 leve, 40–69 moderada, <40 grave.', 'Usar maior valor de 3 tentativas.'],
  paco2: ['PaCO2 normal/elevada em crise grave é sinal de fadiga.', 'Hipercapnia progressiva indica risco de falência respiratória.']
}

const asthmaReevalInfo: Record<AsthmaReevalFieldKey, string[]> = {
  sato2Re: ['Persistência de hipoxemia após 1h sugere falha terapêutica.', 'Manter alvo de SatO2 93–95%.'],
  frRe: ['FR mantendo elevada sugere resposta parcial ou ruim.', 'Queda da FR com conforto respiratório sugere melhora.'],
  pfeRe: ['PFE >70% favorece alta assistida.', 'PFE 40–69%: resposta parcial; <40%: escalonar.']
}

const pneumoniaPsiSections: Array<{ title: string; tone: string; items: Array<{ key: PneumoniaPsiFieldKey; label: string; points: number | string }> }> = [
  {
    title: 'Fatores demográficos',
    tone: 'border-sky-200 bg-sky-50',
    items: [
      { key: 'residenteCasaRepouso', label: 'Residente de casa de repouso', points: '+10' }
    ]
  },
  {
    title: 'Comorbidades',
    tone: 'border-indigo-200 bg-indigo-50',
    items: [
      { key: 'neoplasiaAtiva', label: 'Neoplasia ativa', points: '+30' },
      { key: 'doencaHepaticaCronica', label: 'Doença hepática crônica', points: '+20' },
      { key: 'insuficienciaCardiaca', label: 'Insuficiência cardíaca', points: '+10' },
      { key: 'doencaCerebrovascular', label: 'Doença cerebrovascular', points: '+10' },
      { key: 'doencaRenalCronica', label: 'Doença renal crônica', points: '+10' }
    ]
  },
  {
    title: 'Exame físico',
    tone: 'border-amber-200 bg-amber-50',
    items: [
      { key: 'estadoMentalAlterado', label: 'Estado mental alterado', points: '+20' },
      { key: 'frMaior30', label: 'FR > 30 irpm', points: '+20' },
      { key: 'pasMenor90', label: 'PAS < 90 mmHg', points: '+20' },
      { key: 'temperaturaExtrema', label: 'Temperatura < 35°C ou > 40°C', points: '+15' },
      { key: 'fcMaior125', label: 'FC > 125 bpm', points: '+10' }
    ]
  },
  {
    title: 'Exames laboratoriais e imagem',
    tone: 'border-violet-200 bg-violet-50',
    items: [
      { key: 'phMenor735', label: 'pH < 7,35', points: '+30' },
      { key: 'ureiaMaior30', label: 'Ureia > 30 mg/dL', points: '+20' },
      { key: 'sodioMenor130', label: 'Sódio < 130 mEq/L', points: '+20' },
      { key: 'glicoseMaior250', label: 'Glicose > 250 mg/dL', points: '+10' },
      { key: 'hematocritoMenor30', label: 'Hematócrito < 30%', points: '+10' },
      { key: 'hipoxemia', label: 'PaO2 < 60% ou SpO2 < 90%', points: '+10' },
      { key: 'derramePleural', label: 'Derrame pleural', points: '+10' }
    ]
  }
]

const pneumoniaCurbItems: Array<{ key: PneumoniaCurbFieldKey; label: string }> = [
  { key: 'confusaoMental', label: 'Confusão mental' },
  { key: 'ureiaMaior43', label: 'Ureia > 43 mg/dL' },
  { key: 'frMaior30', label: 'Frequência respiratória ≥ 30 irpm' },
  { key: 'paBaixa', label: 'PAS < 90 mmHg ou PAD < 60 mmHg' },
  { key: 'idadeMaior65', label: 'Idade ≥ 65 anos' }
]

const pneumoniaCrbItems = [
  'Confusão mental nova',
  'Frequência respiratória ≥ 30 irpm',
  'PAS < 90 mmHg ou PAD ≤ 60 mmHg',
  'Idade ≥ 65 anos'
]

const pneumoniaExamGroups = [
  {
    key: 'basicos',
    title: 'Exames básicos',
    description: 'Pacote inicial para a maioria dos pacientes com suspeita de PAC.',
    tone: 'border-sky-200 bg-sky-50 text-sky-950',
    items: [
      'Hemograma completo',
      'Ureia',
      'Creatinina',
      'Sódio',
      'Potássio',
      'Glicemia',
      'Proteína C Reativa (PCR)'
    ]
  },
  {
    key: 'gravidade',
    title: 'Conforme gravidade ou necessidade clínica',
    description: 'Úteis em hipoxemia, desconforto respiratório, sepse, comorbidades ou necessidade de internação.',
    tone: 'border-amber-200 bg-amber-50 text-amber-950',
    items: [
      'Gasometria arterial',
      'Lactato sérico',
      'Procalcitonina (PCT)',
      'Função hepática (AST, ALT, bilirrubinas, FA, GGT)',
      'Coagulograma (TP/INR, TTPA)',
      'Albumina'
    ]
  },
  {
    key: 'microbiologia',
    title: 'Investigação microbiológica',
    description: 'Principalmente em pacientes internados, graves, com falha terapêutica ou risco epidemiológico.',
    tone: 'border-violet-200 bg-violet-50 text-violet-950',
    items: [
      'Hemoculturas (2 pares)',
      'Cultura e bacterioscopia de escarro',
      'Pesquisa viral respiratória (Influenza, SARS-CoV-2 e outros conforme disponibilidade)',
      'Antígeno urinário para Pneumococo',
      'Antígeno urinário para Legionella'
    ]
  },
  {
    key: 'selecionados',
    title: 'Pacientes selecionados',
    description: 'Direcionar conforme imunossupressão, epidemiologia, recorrência, exposição ou diagnóstico diferencial.',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    items: [
      'Sorologias específicas conforme contexto epidemiológico',
      'Pesquisa de fungos',
      'Pesquisa para micobactérias (BAAR, teste molecular para tuberculose)',
      'Testes para imunossupressão (HIV, por exemplo)'
    ]
  }
]

const pneumoniaInitialLabPackage = [
  'Hemograma completo',
  'Ureia',
  'Creatinina',
  'Sódio',
  'Potássio',
  'Glicemia',
  'Proteína C Reativa (PCR)'
]

const influenzaExamRequestGroups = [
  {
    title: 'Coleta respiratória e microbiologia',
    tone: 'border-cyan-200 bg-cyan-50',
    items: [
      'RT-PCR para vírus respiratórios / painel viral multiplex',
      'Hemoculturas (2 pares)',
      'Cultura e bacterioscopia de escarro',
      'Aspirado traqueal ou lavado broncoalveolar, se intubado'
    ]
  },
  {
    title: 'Laboratório inicial e gravidade',
    tone: 'border-blue-200 bg-blue-50',
    items: [
      'Hemograma completo',
      'Ureia e creatinina',
      'Sódio, potássio e magnésio',
      'Função hepática e bilirrubinas',
      'Proteína C Reativa (PCR)',
      'Procalcitonina',
      'Gasometria arterial',
      'Lactato sérico',
      'Coagulograma',
      'Glicemia',
      'Troponina, se indicada'
    ]
  },
  {
    title: 'Imagem',
    tone: 'border-violet-200 bg-violet-50',
    items: [
      'Radiografia de tórax',
      'Tomografia de tórax, se indicada',
      'Ultrassom pulmonar / POCUS, se indicado'
    ]
  }
]

const influenzaDefaultRequestedExams = [
  'RT-PCR para vírus respiratórios / painel viral multiplex',
  'Hemograma completo',
  'Ureia e creatinina',
  'Sódio, potássio e magnésio',
  'Função hepática e bilirrubinas',
  'Proteína C Reativa (PCR)',
  'Gasometria arterial',
  'Lactato sérico',
  'Coagulograma',
  'Glicemia',
  'Radiografia de tórax'
]

const pneumoniaLabResultConfig: Record<string, { placeholder: string; unit?: string; inputMode?: 'decimal' | 'numeric' | 'text' }> = {
  'Hemograma completo': { placeholder: 'Ex.: Hb 12,5; leucócitos 14.200; plaquetas 180.000', inputMode: 'text' },
  'Ureia': { placeholder: 'Ex.: 52', unit: 'mg/dL', inputMode: 'decimal' },
  'Creatinina': { placeholder: 'Ex.: 1,2', unit: 'mg/dL', inputMode: 'decimal' },
  'Sódio': { placeholder: 'Ex.: 136', unit: 'mEq/L', inputMode: 'decimal' },
  'Potássio': { placeholder: 'Ex.: 4,1', unit: 'mEq/L', inputMode: 'decimal' },
  'Glicemia': { placeholder: 'Ex.: 118', unit: 'mg/dL', inputMode: 'decimal' },
  'Proteína C Reativa (PCR)': { placeholder: 'Ex.: 86', unit: 'mg/L', inputMode: 'decimal' },
  'Gasometria arterial': { placeholder: 'Ex.: pH 7,34; PaO2 58; PaCO2 42; HCO3 22', inputMode: 'text' },
  'Lactato sérico': { placeholder: 'Ex.: 2,4', unit: 'mmol/L', inputMode: 'decimal' },
  'Procalcitonina (PCT)': { placeholder: 'Ex.: 0,8', unit: 'ng/mL', inputMode: 'decimal' },
  'Função hepática (AST, ALT, bilirrubinas, FA, GGT)': { placeholder: 'Informe os resultados disponíveis', inputMode: 'text' },
  'Coagulograma (TP/INR, TTPA)': { placeholder: 'Ex.: INR 1,1; TTPA 31 s', inputMode: 'text' },
  'Albumina': { placeholder: 'Ex.: 3,2', unit: 'g/dL', inputMode: 'decimal' }
}

const parseClinicalNumber = (value?: string | number) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (!value?.trim()) return undefined
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.').match(/-?\d+(?:\.\d+)?/)
  if (!normalized) return undefined
  const parsed = Number(normalized[0])
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseBloodPressure = (value?: string) => {
  const matches = value?.match(/(\d{2,3})\s*[xX\/]\s*(\d{2,3})/)
  if (!matches) return { systolic: undefined, diastolic: undefined }
  return { systolic: Number(matches[1]), diastolic: Number(matches[2]) }
}

const getPatientAgeForScore = (patient: EmergencyPatient) => {
  const registeredAge = parseClinicalNumber(patient.age)
  if (registeredAge != null) return registeredAge
  if (!patient.birthDate) return undefined
  const birthDate = new Date(patient.birthDate)
  if (Number.isNaN(birthDate.getTime())) return undefined
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDelta = today.getMonth() - birthDate.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) age -= 1
  return age >= 0 ? age : undefined
}

const parseSavedPhysicalExamAnswer = (value?: string, patient?: EmergencyPatient) => {
  if (!value) {
    return {
      sinaisVitais: patient ? defaultFlowVitalSigns(patient) : undefined,
      exameFisico: defaultPneumoniaPhysicalExam()
    }
  }

  try {
    const parsed = JSON.parse(value)
    return {
      sinaisVitais: {
        ...(patient ? defaultFlowVitalSigns(patient) : {}),
        ...(parsed?.sinaisVitais || {})
      } as FlowVitalSigns,
      exameFisico: {
        ...defaultPneumoniaPhysicalExam(),
        ...(parsed?.exameFisico || {})
      } as PhysicalExamData
    }
  } catch {
    return {
      sinaisVitais: patient ? defaultFlowVitalSigns(patient) : undefined,
      exameFisico: defaultPneumoniaPhysicalExam()
    }
  }
}

const parseSavedPneumoniaCrbCriteria = (value?: string) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed?.criteriosSelecionados)
      ? parsed.criteriosSelecionados.filter((item: unknown): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

const defaultPneumoniaPhysicalExam = (): PhysicalExamData => ({
  generalState: 'bom',
  coloration: { status: 'corado' },
  hydration: { status: 'hidratado' },
  cyanosis: { status: 'acianotico' },
  jaundice: { status: 'anicterico' },
  temperature: { status: 'afebril' },
  respiration: { status: 'eupneico' },
  neuro: { glasgow: 15, altered: '' },
  cardiac: { altered: '' },
  pulmonary: { altered: '' },
  abdomen: { altered: '' },
  extremities: { altered: '' }
})

const pneumoniaAtsIdsaMajorItems = [
  'Necessidade de ventilação mecânica invasiva',
  'Choque séptico com necessidade de vasopressor'
]

const pneumoniaAtsIdsaMinorItems = [
  'Frequência respiratória ≥ 30 irpm',
  'Relação PaO2/FiO2 ≤ 250',
  'Infiltrado multilobar',
  'Confusão/desorientação',
  'Uremia (BUN ≥ 20 mg/dL)',
  'Leucopenia (< 4.000/mm3)',
  'Plaquetopenia (< 100.000/mm3)',
  'Hipotermia (< 36°C)',
  'Hipotensão necessitando reposição volêmica agressiva'
]

const pneumoniaSmartCopItems: Array<{ label: string; points: number }> = [
  { label: 'PAS < 90 mmHg', points: 2 },
  { label: 'Comprometimento multilobar', points: 1 },
  { label: 'Albumina < 3,5 g/dL', points: 1 },
  { label: 'FR ≥25/min (<50 anos) ou ≥30/min (≥50 anos)', points: 1 },
  { label: 'FC ≥ 125 bpm', points: 1 },
  { label: 'Confusão aguda', points: 1 },
  { label: 'Hipoxemia significativa para a idade', points: 2 },
  { label: 'pH arterial < 7,35', points: 2 }
]

const pneumoniaDripMajorItems = [
  'Antibiótico nos últimos 60 dias',
  'Instituição de longa permanência',
  'Alimentação por sonda enteral',
  'História prévia de infecção por germe resistente',
  'Colonização prévia por germe resistente'
]

const pneumoniaDripMinorItems = [
  'Hospitalização nos últimos 60 dias',
  'Doença pulmonar crônica, principalmente DPOC/bronquiectasias',
  'Estado funcional dependente',
  'Uso de bloqueador de ácido gástrico (IBP/H2)',
  'Ferida crônica',
  'Colonização por MRSA em passado remoto'
]

const pneumoniaScapItems: Array<{ label: string; points: number }> = [
  { label: 'pH arterial < 7,30', points: 13 },
  { label: 'PAS < 90 mmHg', points: 11 },
  { label: 'Frequência respiratória > 30 irpm', points: 9 },
  { label: 'PaO2/FiO2 < 250', points: 6 },
  { label: 'BUN > 30 mg/dL', points: 5 },
  { label: 'Idade ≥ 80 anos', points: 5 },
  { label: 'Confusão mental', points: 5 },
  { label: 'Infiltrado multilobar ou bilateral', points: 5 }
]

const pneumoniaSoarItems = [
  'Saturação de O2 reduzida',
  'Desorientação ou confusão',
  'Idade avançada',
  'Frequência respiratória elevada'
]

const anaphylaxisAdjunctOrder: AnaphylaxisAdjunctKey[] = [
  'hypotension',
  'stridor',
  'dyspnea',
  'urticaria',
  'vomiting'
]

const pancreatitisBisapItems: Array<{ key: PancreatitisBisapKey; label: string }> = [
  { key: 'bunMaior25', label: 'Ureia/BUN > 25 mg/dL' },
  { key: 'alteracaoMental', label: 'Alteração do nível de consciência' },
  { key: 'sirs', label: 'Dois ou mais critérios de SIRS' },
  { key: 'idadeMaior60', label: 'Idade > 60 anos' },
  { key: 'derramePleural', label: 'Derrame pleural' }
]

const pancreatitisMarshallSystems: Array<{ key: keyof Pick<PancreatitisMarshallValues, 'cardiovascular' | 'respiratory' | 'renal'>; title: string; options: string[] }> = [
  {
    key: 'cardiovascular',
    title: 'Cardiovascular - PA sistólica',
    options: [
      '> 90 mmHg',
      '< 90 responde a hidratação venosa',
      '< 90 não responde a hidratação venosa',
      '< 90 com pH < 7,3',
      '< 90 com pH < 7,2'
    ]
  },
  {
    key: 'respiratory',
    title: 'Respiratório - PaO2/FiO2',
    options: [
      '> 400',
      '301 a 400',
      '201 a 300',
      '191 a 200',
      '< 101'
    ]
  },
  {
    key: 'renal',
    title: 'Renal - Creatinina',
    options: [
      '< 1,4 mg/dL',
      '1,4 a 1,8 mg/dL',
      '1,9 a 3,6 mg/dL',
      '3,6 a 4,9 mg/dL',
      '> 4,9 mg/dL'
    ]
  }
]

const tvpClassicSigns = [
  'Dor unilateral na perna (panturrilha ou coxa), tipo peso/pressão, que piora ao deambular ou ao ficar em pé',
  'Edema unilateral',
  'Sensação de calor, rubor ou mudança de coloração (eritema ou cianose leve) no membro afetado',
  'Rigidez ou sensação de tensão na panturrilha',
  'Sensibilidade à palpação em trajeto venoso profundo',
  'Aumento de circunferência da panturrilha ou coxa comparado ao lado contralateral',
  'Dor à compressão da panturrilha ou ao espremer o gastrocnêmio',
  'Febre baixa inespecífica',
  'Taquicardia'
]
//exame fisico deixar aberto direto
const tvpPhysicalExamFindings = [
  'Edema assimétrico, com cacifo presente',
  'Edema assimétrico, sem cacifo presente',
  'Aumento da circunferência da panturrilha em relação ao lado oposto',
  'Calor local e rubor; pele brilhante e tensa',
  'Veias superficiais colaterais dilatadas (circulação de derivação)',
  'Dor à palpação profunda da panturrilha ou do trajeto venoso',
  'Eritema (vermelhidão na região)',
  'Cianose (coloração azulada ou arroxeada na região)',
  'Palidez cutânea',
  'Pulsos arteriais preservados: femoral, poplíteo, tibial posterior e pedioso palpáveis e simétricos',
  'Sinal de Homans positivo (dor à dorsiflexão do pé)'
]

const tvpAlertSigns = [
  'Edema súbito e importante com dor intensa e cianose: suspeitar flegmasia cerulea dolens (urgência)',
  'Edema que envolve toda a perna, inclusive raiz da coxa/inguinal (possível TVP iliofemoral)',
  'Progressão rápida do edema e dor em horas/dias',
  'Veias superficiais muito proeminentes e tensas',
  'Dor de início recente associada a imobilização, cirurgia recente (≤4 semanas), trauma, câncer ativo, gravidez/puerpério, uso de estrogênios, história prévia de TVP/TEV ou trombofilia',
  'Sintomas respiratórios concomitantes (dispneia súbita, dor torácica pleurítica, hemoptise, síncope): suspeitar embolia pulmonar'
]

const tvpVascularSurgeryAlertSigns = tvpAlertSigns.slice(0, 4)
const tvpRespiratoryTEPAlertSigns = [tvpAlertSigns[5]]

const flegmasiaReferenceImages = [
  '/flegmasia.jpeg',
  '/flegmasia-1.jpg',
  '/flegmasia-3.jpeg',
  '/flegmasia-4.jpg'
]

const dpocSinaisGravidadeItems = [
  'SatO₂ < 88% ou SpO₂ < 90% em ar ambiente',
  'FR ≥ 25 a 30 irpm',
  'FC ≥ 110 bpm',
  'Rebaixamento de consciência / Alteração do estado mental',
  'Uso de musculatura acessória / Acidose (pH < 7,35)',
  'Instabilidade hemodinâmica / Comorbidades descompensadas'
]

const dpocAnthonisenItems = [
  'Aumento da dispneia',
  'Aumento do volume do escarro',
  'Escarro purulento'
]

const tvpWellsCriteria = [
  { id: 'cancer_ativo', text: 'Câncer ativo (tratamento nos últimos 6 meses ou paliativo)', score: 1 },
  { id: 'paresia_imobilizacao', text: 'Paralisia/paresia ou imobilização com gesso em membro inferior', score: 1 },
  { id: 'restrito_leito_cirurgia', text: 'Restrito ao leito ≥3 dias ou cirurgia maior nos últimos 12 semanas com anestesia', score: 1 },
  { id: 'dor_trajeto_venoso', text: 'Dor à palpação ao longo do sistema venoso profundo', score: 1 },
  { id: 'perna_inteira_edemaciada', text: 'Perna inteira edemaciada', score: 1 },
  { id: 'panturrilha_3cm', text: 'Aumento de panturrilha ≥3 cm vs lado assintomático (10 cm abaixo da tuberosidade tibial)', score: 1 },
  { id: 'edema_cacifo', text: 'Edema com cacifo limitado à perna sintomática', score: 1 },
  { id: 'veias_colaterais', text: 'Veias colaterais superficiais (não varicosas)', score: 1 },
  { id: 'tvp_previa', text: 'TVP prévia documentada', score: 1 },
  { id: 'diagnostico_alternativo', text: 'Diagnóstico alternativo pelo menos tão provável quanto TVP', score: -2 }
]

const tvpAnticoagContraindications = [
  { id: 'abs_sangramento_ativo', text: 'Sangramento ativo maior (GI, intracraniano ou hemoptise significativa)', severity: 'absoluta' },
  { id: 'abs_intracraniano_recente', text: 'Sangramento intracraniano recente', severity: 'absoluta' },
  { id: 'abs_neuro_ocular_recente', text: 'Cirurgia neuro/ocular recente', severity: 'absoluta' },
  { id: 'abs_trombocitopenia_grave', text: 'Plaquetas muito baixas (ex.: < 50 mil)', severity: 'absoluta' },
  { id: 'abs_risco_critico', text: 'Risco hemorrágico crítico não corrigível', severity: 'absoluta' },
  { id: 'rel_trombocitopenia_moderada', text: 'Plaquetopenia moderada', severity: 'relativa' },
  { id: 'rel_hipertensao_nao_controlada', text: 'HAS importante não controlada (ex.: PAS >= 180 ou PAD >= 110)', severity: 'relativa' },
  { id: 'rel_disfuncao_renal_hepatica', text: 'Disfunção renal/hepática moderada', severity: 'relativa' },
  { id: 'rel_sangramento_gi_recente', text: 'Sangramento gastrointestinal recente (ex.: < 4 semanas)', severity: 'relativa' }
]

const tvpTherapeuticOptions = [
  { id: 'rivaroxabana', group: 'DOAC', text: 'Rivaroxabana: 15 mg 2x/dia por 21 dias; depois 20 mg 1x/dia; estendida 10 mg 1x/dia' },
  { id: 'apixabana', group: 'DOAC', text: 'Apixabana: 10 mg 2x/dia por 7 dias; depois 5 mg 2x/dia; estendida 2,5 mg 2x/dia' },
  { id: 'dabigatrana', group: 'DOAC', text: 'Dabigatrana: 150 mg 2x/dia após 5–10 dias de anticoagulação parenteral' },
  { id: 'edoxabana', group: 'DOAC', text: 'Edoxabana: 60 mg 1x/dia após 5–10 dias de parenteral; 30 mg se CrCl 15–50 mL/min ou ≤60 kg' },
  { id: 'enoxaparina', group: 'Parenteral', text: 'Enoxaparina: 1 mg/kg 2x/dia ou 1,5 mg/kg 1x/dia; se CrCl <30: 1 mg/kg 1x/dia' },
  { id: 'hnf', group: 'Parenteral', text: 'HNF EV: bolus 80 U/kg (ou 5.000 U), depois 18 U/kg/h (ou 1.300 U/h), ajustar TTPa 1,5–2,5x basal' },
  { id: 'varfarina', group: 'VKA', text: 'Varfarina: alvo INR 2–3; sobrepor com heparina por ≥5 dias e INR terapêutico por 24h' }
]

const isTVPICUDisposition = (currentStep: string, history: string[]) =>
  currentStep === 'tvp_internacao_uti' || history.includes('tvp_internacao_uti')

const tvpAnticoagulationConsiderations = [
  {
    id: 'consideracoes_tratamento_tvp',
    title: 'Considerações Essenciais sobre tratamento da TVP',
    paragraphs: [
      'A anticoagulação na TVP deve começar com anticoagulante parenteral, podendo ser utilizada HBPM (enoxaparina) ou HNF (heparina não fracionada).',
      'No mesmo dia, inicia-se a varfarina e mantém-se anticoagulação concomitante com heparina.',
      'Essa sobreposição é necessária porque, nos primeiros dias, a varfarina pode gerar efeito pró-coagulante paradoxal e transitório, pela redução mais rápida da proteína C (e também da proteína S) em relação aos fatores pró-coagulantes vitamina K-dependentes (II, VII, IX e X).',
      'Essa combinação deve ser mantida por pelo menos cinco dias, com monitorização diária do INR até faixa terapêutica entre 2,0 e 3,0.',
      'A heparina só deve ser suspensa quando o INR permanecer nessa faixa por 48 horas consecutivas.'
    ]
  },
  {
    id: 'consideracoes_duracao_tvp',
    title: 'Considerações Essenciais sobre a duração do tratamento da TVP',
    paragraphs: [
      'A duração da anticoagulação depende do contexto clínico e do risco de recorrência; em geral, manter por no mínimo 3 meses.',
      'TVP provocada por fator transitório (como cirurgia ou imobilização) costuma exigir apenas 3 meses.',
      'TVP não provocada, recorrente ou associada a trombofilias pode demandar anticoagulação prolongada ou indefinida.',
      'Em pacientes com câncer ativo, manter enquanto houver atividade tumoral ou tratamento oncológico em curso.'
    ]
  },
  {
    id: 'consideracoes_noac_tvp',
    title: 'Considerações Essenciais sobre os NOACs (novos anticoagulantes orais)',
    paragraphs: [
      'NOACs como rivaroxabana, apixabana, dabigatrana e edoxabana são alternativas práticas aos anticoagulantes tradicionais.',
      'Têm início de ação rápido e geralmente não exigem monitorização rotineira de INR.',
      'Não são adequados para todos: evitar em prótese valvar mecânica, algumas trombofilias de alto risco e insuficiência renal avançada.',
      'A escolha entre NOACs e varfarina deve considerar perfil clínico, comorbidades, risco de sangramento e adesão.',
      'Ajustes na Insuficiência Renal (ClCr):',
      '• Dabigatrana: Contraindicada se ClCr ≤ 15 mL/min ou diálise. Reduzir dose para 75 mg 12/12h se ClCr 15-30 mL/min.',
      '• Edoxabana: Contraindicada se ClCr ≤ 15 mL/min ou diálise. Reduzir para 30 mg 1x/dia se ClCr 15-50 mL/min.',
      '• Apixabana: Sem contraindicação absoluta pelo FDA (pode ser usada em doença renal terminal e hemodiálise). Dose reduzida para 2,5 mg 12/12h se houver ≥2 critérios: Creatinina ≥ 1,5 mg/dL, Idade ≥ 80 anos ou Peso ≤ 60 kg. Caso contrário, 5 mg 12/12h.',
      '• Rivaroxabana: Evitar se ClCr ≤ 15 mL/min (dados limitados). Reduzir dose para 15 mg 1x/dia se ClCr 15-50 mL/min.'
    ]
  }
]

const tvpNoacHighRiskNotes = [
  {
    id: 'saf_triplo',
    title: 'SAF (síndrome antifosfolípide), especialmente triplo positivo',
    summary: 'Evitar NOAC; preferir varfarina.',
    details: [
      'SAF (síndrome antifosfolípide) é uma condição autoimune pró-trombótica, na qual o paciente produz anticorpos antifosfolípides associados a trombose venosa, trombose arterial e complicações obstétricas.',
      'Quando falamos em "triplo positivo", significa positividade para os 3 principais anticorpos da SAF: anticoagulante lúpico, anticorpo anticardiolipina e anticorpo anti-beta-2-glicoproteína I.',
      'Esse perfil "triplo positivo" identifica um subgrupo de risco trombótico muito mais alto, com maior chance de recorrência, especialmente se houver eventos arteriais.',
      'Nesses casos, os NOACs têm pior sustentação de evidência e podem estar associados a maior risco de recorrência trombótica.',
      'Conduta prática usual: evitar NOAC e preferir varfarina, com alvo de INR individualizado conforme perfil clínico e acompanhamento especializado.'
    ]
  },
  {
    id: 'def_antitrombina_grave',
    title: 'Deficiência grave de antitrombina',
    summary: 'Evitar NOAC como primeira escolha; considerar varfarina.',
    details: [
      'Condição de alto risco trombótico, muitas vezes com evidência limitada para NOAC.',
      'Em casos graves/hereditários severos, especialistas frequentemente preferem varfarina.',
      'Heparina também pode ter resposta reduzida, pois depende da antitrombina.'
    ]
  },
  {
    id: 'trombofilia_combinada',
    title: 'Trombofilias combinadas (múltiplos defeitos)',
    summary: 'Risco cumulativo elevado; tendência a preferir varfarina.',
    details: [
      'Exemplos: Fator V Leiden + mutação da protrombina, ou associação com SAF.',
      'Quanto maior o risco trombótico combinado, menor a segurança de extrapolar evidência de NOAC.',
      'Decisão deve ser individualizada, com tendência prática a varfarina em cenários de alto risco.'
    ]
  },
  {
    id: 'arterial_associada',
    title: 'História de trombose arterial associada à trombofilia',
    summary: 'Evitar NOAC; considerar varfarina.',
    details: [
      'NOAC tem validação mais robusta para trombose venosa e fibrilação atrial.',
      'Quando há componente arterial importante, costuma-se priorizar varfarina.',
      'Revisar evento prévio, perfil de risco e acompanhamento especializado.'
    ]
  }
]

const varfarinaDietGuidanceSections = [
  {
    id: 'principio',
    title: 'Princípio fundamental',
    bullets: [
      'Não é proibir vitamina K, e sim manter consistência alimentar.',
      'Evite grandes variações de um dia para o outro.'
    ]
  },
  {
    id: 'vitamina_k',
    title: 'Alimentos ricos em vitamina K (atenção maior)',
    bullets: [
      'Folhas verde-escuras: couve, espinafre, brócolis, rúcula, agrião e alface escura/romana.',
      'Outros: repolho, couve-de-bruxelas, salsinha e chá verde.',
      'Pode consumir, mas sem mudanças bruscas na quantidade habitual.'
    ]
  },
  {
    id: 'interferencias',
    title: 'Produtos que interferem no INR',
    bullets: [
      'Álcool: uso agudo pode elevar INR; uso crônico pode reduzir INR.',
      'Fitoterápicos/chás: ginkgo biloba, ginseng, erva de São João e alho em altas doses podem alterar efeito.',
      'Outros: fígado, abacate, soja/derivados e óleos vegetais (canola/soja) podem gerar variação.'
    ]
  },
  {
    id: 'orientacao_pratica',
    title: 'Orientação prática ao paciente',
    bullets: [
      'Pode comer de tudo, mantendo padrão semelhante diariamente.',
      'Evitar mudanças súbitas de dieta (ex.: detox rica em folhas verdes).',
      'Avisar a equipe antes de iniciar suplementos, chás ou fitoterápicos.'
    ]
  },
  {
    id: 'dica',
    title: 'Dica de ambulatório',
    bullets: [
      'INR descontrolado sem causa aparente: investigar mudança alimentar, dieta nova, chás/suplementos e episódio de álcool.'
    ]
  }
]

const varfarinaDrugInteractionSections = [
  {
    id: 'mecanismo',
    title: 'Por que a varfarina interage tanto?',
    bullets: [
      'Metabolismo hepático (principalmente CYP2C9 e CYP3A4), flora intestinal e ligação proteica influenciam diretamente o INR.',
      'Inibidor enzimático tende a elevar INR; indutor enzimático tende a reduzir INR.'
    ]
  },
  {
    id: 'aumentam_inr',
    title: 'Medicamentos que aumentam INR (risco de sangramento)',
    bullets: [
      'Antibióticos: metronidazol, sulfametoxazol-trimetoprima, ciprofloxacino, claritromicina e eritromicina.',
      'Antifúngicos: fluconazol, itraconazol e voriconazol.',
      'Cardiovasculares: amiodarona e propafenona.',
      'Outros: omeprazol (leve/moderado), paracetamol em uso prolongado e sertralina.'
    ]
  },
  {
    id: 'diminuem_inr',
    title: 'Medicamentos que diminuem INR (reduzem efeito)',
    bullets: [
      'Indutores enzimáticos: rifampicina, carbamazepina, fenitoína e fenobarbital.',
      'Fitoterápico clássico: erva de São João (hipericão).'
    ]
  },
  {
    id: 'sangramento_sem_inr',
    title: 'Perigoso mesmo com INR “normal”',
    bullets: [
      'AINEs (ex.: ibuprofeno, diclofenaco), AAS, clopidogrel e ISRS podem aumentar sangramento sem alterar muito o INR.',
      'Se possível, evitar associação sem avaliação do risco-benefício.'
    ]
  },
  {
    id: 'top5',
    title: 'Top 5 que mais desorganizam INR',
    bullets: [
      'Sulfametoxazol-trimetoprima, metronidazol, amiodarona, fluconazol e rifampicina (esta tende a reduzir INR).',
      'Ao iniciar, suspender ou trocar medicação, repetir INR em 3 a 5 dias.'
    ]
  }
]

const parseTVPSelectedLeg = (raw?: string): TVPLegSide | '' => {
  if (!raw) return ''
  if (raw === 'left' || raw === 'right' || raw === 'other') return raw
  try {
    const parsed = JSON.parse(raw)
    return parsed?.selectedLeg === 'left' || parsed?.selectedLeg === 'right' || parsed?.selectedLeg === 'other' ? parsed.selectedLeg : ''
  } catch {
    return ''
  }
}

const TVPLegIllustration: React.FC<{ side: TVPLegSide; selected: boolean }> = ({ side, selected }) => {
  if (side === 'other') {
    return (
      <img
        src="/tvp-other-sites.png"
        alt="Trombose em outras localidades além de membros inferiores"
        className={clsx(
          'aspect-[4/3] w-full rounded-xl border border-slate-200 bg-white object-contain transition-all',
          selected ? 'brightness-105 saturate-110' : 'opacity-95 group-hover:opacity-100'
        )}
        loading="lazy"
      />
    )
  }

  return (
    <img
      src={
        side === 'left'
          ? '/tvp-left-leg.png'
          : '/tvp-right-leg.png'
      }
      alt={side === 'left' ? 'Perna esquerda com sinais de trombose venosa profunda' : 'Perna direita com sinais de trombose venosa profunda'}
      className={clsx(
        'aspect-[4/3] w-full rounded-xl border border-slate-200 bg-white object-contain transition-all',
        selected ? 'brightness-105 saturate-110' : 'opacity-95 group-hover:opacity-100'
      )}
      loading="lazy"
    />
  )
}

interface EmergencyFlowchartProps {
  patient: EmergencyPatient
  flowchart: EmergencyFlowchartType
  onComplete: () => void
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
  onBack?: () => void
  onSwitchFlowchart?: (targetFlowchart: EmergencyType) => void
}

const EmergencyFlowchart: React.FC<EmergencyFlowchartProps> = ({ 
  patient, 
  flowchart, 
  onComplete, 
  onUpdate,
  onBack,
  onSwitchFlowchart
}) => {
  const resolveCurrentStep = useCallback((step?: string) => {
    if (step && flowchart.steps[step]) return step
    if (flowchart.steps[flowchart.initialStep]) return flowchart.initialStep
    return Object.keys(flowchart.steps)[0]
  }, [flowchart.initialStep, flowchart.steps])
  const [currentStep, setCurrentStep] = useState(resolveCurrentStep(patient.emergencyState.currentStep))
  const [history, setHistory] = useState<string[]>(patient.emergencyState.history || [])
  const [answers, setAnswers] = useState<Record<string, string>>(patient.emergencyState.answers || {})
  const [progress, setProgress] = useState(patient.emergencyState.progress || 0)
  const [selectedClinicalFindings, setSelectedClinicalFindings] = useState<string[]>([])
  const [otherClinicalFinding, setOtherClinicalFinding] = useState('')
  const [selectedTVPLeg, setSelectedTVPLeg] = useState<TVPLegSide | ''>('')
  const [selectedWellsCriteria, setSelectedWellsCriteria] = useState<string[]>([])
  const [selectedContraindications, setSelectedContraindications] = useState<string[]>([])
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
  const [selectedDurationPlan, setSelectedDurationPlan] = useState<string>('')
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({})
  const [wellsInfoOpen, setWellsInfoOpen] = useState(false)
  const [tvpOtherLocationsImageOpen, setTVPOtherLocationsImageOpen] = useState(false)
  const [tvpPocusInfoOpen, setTVPPocusInfoOpen] = useState(false)
  const [tvpPocusPointsImageOpen, setTVPPocusPointsImageOpen] = useState(false)
  const [tvpCacifoImageOpen, setTVPCacifoImageOpen] = useState(false)
  const [tvpWellsIntroOpen, setTVPWellsIntroOpen] = useState(false)
  const [pendingTVPWellsOption, setPendingTVPWellsOption] = useState<{ nextStep: string; value?: string } | null>(null)
  const [tvpConfirmadaOpen, setTVPConfirmadaOpen] = useState(false)
  const [pendingTVPConfirmadaOption, setPendingTVPConfirmadaOption] = useState<{ nextStep: string; value?: string } | null>(null)
  const [tvpAnticoagConsiderationsOpen, setTVPAnticoagConsiderationsOpen] = useState(false)
  const [tvpPrescriptionPreview, setTVPPrescriptionPreview] = useState<TVPPrescriptionPreview | null>(null)
  const [tvpRiskBenefitGuideOpen, setTVPRiskBenefitGuideOpen] = useState(false)
  const [tvpNoacInfoOpen, setTVPNoacInfoOpen] = useState<string | null>(null)
  const [varfarinaDietInfoOpen, setVarfarinaDietInfoOpen] = useState(false)
  const [pepHivGuideOpen, setPepHivGuideOpen] = useState(false)
  const [ansiedadeGuideOpen, setAnsiedadeGuideOpen] = useState(false)
  const [asthmaSoundInfoOpen, setAsthmaSoundInfoOpen] = useState(false)
  const [influenzaSeveritySigns, setInfluenzaSeveritySigns] = useState<string[]>([])
  const [influenzaRiskFactors, setInfluenzaRiskFactors] = useState<string[]>([])
  const [influenzaWorseningSigns, setInfluenzaWorseningSigns] = useState<string[]>([])
  const [influenzaICUCriteria, setInfluenzaICUCriteria] = useState<string[]>([])
  const [influenzaICUInfoOpen, setInfluenzaICUInfoOpen] = useState<string | null>(null)
  const [influenzaExamRequestOpen, setInfluenzaExamRequestOpen] = useState(false)
  const [influenzaSelectedExams, setInfluenzaSelectedExams] = useState<string[]>(influenzaDefaultRequestedExams)
  const [influenzaPrescriptionPreview, setInfluenzaPrescriptionPreview] = useState<InfluenzaPrescriptionPreview | null>(null)
  const [influenzaPrescriptionCopied, setInfluenzaPrescriptionCopied] = useState(false)
  const [influenzaPrescriptionGeneratedSteps, setInfluenzaPrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [influenzaPhysicalExam, setInfluenzaPhysicalExam] = useState<PhysicalExamData>(defaultPneumoniaPhysicalExam)
  const [influenzaVitalSigns, setInfluenzaVitalSigns] = useState<FlowVitalSigns>(() => defaultFlowVitalSigns(patient))
  const [tvpPhysicalExam, setTVPPhysicalExam] = useState<PhysicalExamData>(defaultPneumoniaPhysicalExam)
  const [tvpVitalSigns, setTVPVitalSigns] = useState<FlowVitalSigns>(() => defaultFlowVitalSigns(patient))
  const [tepPhysicalExam, setTEPPhysicalExam] = useState<PhysicalExamData>(defaultPneumoniaPhysicalExam)
  const [tepVitalSigns, setTEPVitalSigns] = useState<FlowVitalSigns>(() => defaultFlowVitalSigns(patient))
  const [pneumoniaPhysicalExam, setPneumoniaPhysicalExam] = useState<PhysicalExamData>(defaultPneumoniaPhysicalExam)
  const [pneumoniaVitalSigns, setPneumoniaVitalSigns] = useState<FlowVitalSigns>(() => defaultFlowVitalSigns(patient))
  const [pneumoniaPsiValues, setPneumoniaPsiValues] = useState<PneumoniaPsiValues>(() => defaultPsiValues(patient))
  const [pneumoniaCurbValues, setPneumoniaCurbValues] = useState<PneumoniaCurbValues>(() => defaultCurbValues(patient))
  const [pneumoniaComorbidities, setPneumoniaComorbidities] = useState<string[]>([])
  const [pneumoniaPseudomonasRisk, setPneumoniaPseudomonasRisk] = useState<string[]>([])
  const [pneumoniaCrbCriteria, setPneumoniaCrbCriteria] = useState<string[]>([])
  const [pneumoniaSelectedExams, setPneumoniaSelectedExams] = useState<string[]>(pneumoniaInitialLabPackage)
  const [pneumoniaLabResults, setPneumoniaLabResults] = useState<PneumoniaLabResults>({})
  const [pneumoniaRxInfoOpen, setPneumoniaRxInfoOpen] = useState(false)
  const [pneumoniaRxImageOpen, setPneumoniaRxImageOpen] = useState(false)
  const [pneumoniaCtInfoOpen, setPneumoniaCtInfoOpen] = useState(false)
  const [pneumoniaReferenceImage, setPneumoniaReferenceImage] = useState<PneumoniaReferenceImageKey | null>(null)
  const [keepPneumoniaPocusDetailsOpen, setKeepPneumoniaPocusDetailsOpen] = useState(false)
  const [pneumoniaAtsIdsaMajorCriteria, setPneumoniaAtsIdsaMajorCriteria] = useState<string[]>([])
  const [pneumoniaAtsIdsaMinorCriteria, setPneumoniaAtsIdsaMinorCriteria] = useState<string[]>([])
  const [pneumoniaSmartCopCriteria, setPneumoniaSmartCopCriteria] = useState<string[]>([])
  const [pneumoniaDripMajorCriteria, setPneumoniaDripMajorCriteria] = useState<string[]>([])
  const [pneumoniaDripMinorCriteria, setPneumoniaDripMinorCriteria] = useState<string[]>([])
  const [pneumoniaScapCriteria, setPneumoniaScapCriteria] = useState<string[]>([])
  const [pneumoniaSoarCriteria, setPneumoniaSoarCriteria] = useState<string[]>([])
  const [pneumoniaSipfValues, setPneumoniaSipfValues] = useState({ fc: '', pas: '', pf: '' })
  const [pneumoniaPrescriptionPreview, setPneumoniaPrescriptionPreview] = useState<PneumoniaPrescriptionPreview | null>(null)
  const [pneumoniaPrescriptionCopied, setPneumoniaPrescriptionCopied] = useState(false)
  const [pneumoniaPrescriptionGenerated, setPneumoniaPrescriptionGenerated] = useState(false)
  const [sinusitisPrescriptionPreview, setSinusitisPrescriptionPreview] = useState<SinusitisPrescriptionPreview | null>(null)
  const [sinusitisPrescriptionCopied, setSinusitisPrescriptionCopied] = useState(false)
  const [sinusitisPrescriptionGeneratedSteps, setSinusitisPrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [faringoamigdalitePrescriptionPreview, setFaringoamigdalitePrescriptionPreview] = useState<FaringoamigdalitePrescriptionPreview | null>(null)
  const [faringoamigdalitePrescriptionCopied, setFaringoamigdalitePrescriptionCopied] = useState(false)
  const [faringoamigdalitePrescriptionGeneratedSteps, setFaringoamigdalitePrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [monoartritePrescriptionPreview, setMonoartritePrescriptionPreview] = useState<MonoartritePrescriptionPreview | null>(null)
  const [monoartritePrescriptionCopied, setMonoartritePrescriptionCopied] = useState(false)
  const [monoartritePrescriptionGeneratedSteps, setMonoartritePrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [ansiedadePrescriptionPreview, setAnsiedadePrescriptionPreview] = useState<AnsiedadePrescriptionPreview | null>(null)
  const [ansiedadePrescriptionCopied, setAnsiedadePrescriptionCopied] = useState(false)
  const [ansiedadePrescriptionGenerated, setAnsiedadePrescriptionGenerated] = useState(false)
  const [vertigemPrescriptionPreview, setVertigemPrescriptionPreview] = useState<VertigemPrescriptionPreview | null>(null)
  const [vertigemPrescriptionCopied, setVertigemPrescriptionCopied] = useState(false)
  const [vertigemPrescriptionGeneratedSteps, setVertigemPrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [cefaleiaPrescriptionPreview, setCefaleiaPrescriptionPreview] = useState<CefaleiaPrescriptionPreview | null>(null)
  const [cefaleiaPrescriptionCopied, setCefaleiaPrescriptionCopied] = useState(false)
  const [cefaleiaPrescriptionGeneratedSteps, setCefaleiaPrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [agitacaoPrescriptionPreview, setAgitacaoPrescriptionPreview] = useState<AgitacaoPrescriptionPreview | null>(null)
  const [agitacaoPrescriptionCopied, setAgitacaoPrescriptionCopied] = useState(false)
  const [agitacaoPrescriptionGeneratedSteps, setAgitacaoPrescriptionGeneratedSteps] = useState<Record<string, boolean>>({})
  const [pepHivPrescriptionPreview, setPepHivPrescriptionPreview] = useState<PepHivPrescriptionPreview | null>(null)
  const [pepHivPrescriptionCopied, setPepHivPrescriptionCopied] = useState(false)
  const [pepHivPrescriptionGenerated, setPepHivPrescriptionGenerated] = useState(false)
  const [selectedAnaphylaxisAdjuncts, setSelectedAnaphylaxisAdjuncts] = useState<AnaphylaxisAdjunctKey[]>([])
  const [selectedAnaphylaxisCriteria, setSelectedAnaphylaxisCriteria] = useState<AnaphylaxisCriteriaKey[]>([])
  const [anaphylaxisCriteriaInfo, setAnaphylaxisCriteriaInfo] = useState<AnaphylaxisCriteriaInfo | null>(null)
  const [anaphylaxisEmergencyAllocationOpen, setAnaphylaxisEmergencyAllocationOpen] = useState(false)
  const [pendingAnaphylaxisEmergencyOption, setPendingAnaphylaxisEmergencyOption] = useState<{ nextStep: string; value?: string } | null>(null)
  const [anaphylaxisAdrenalinePrescriptionOpen, setAnaphylaxisAdrenalinePrescriptionOpen] = useState(false)
  const [anaphylaxisAdrenalinePrescriptionCopied, setAnaphylaxisAdrenalinePrescriptionCopied] = useState(false)
  const [anaphylaxisRepeatPrescriptionOpen, setAnaphylaxisRepeatPrescriptionOpen] = useState(false)
  const [anaphylaxisRepeatPrescriptionCopied, setAnaphylaxisRepeatPrescriptionCopied] = useState(false)
  const [anaphylaxisManagementAlertOpen, setAnaphylaxisManagementAlertOpen] = useState(false)
  const [pendingAnaphylaxisManagementOption, setPendingAnaphylaxisManagementOption] = useState<{ nextStep: string; value?: string } | null>(null)
  const [anaphylaxisAdjunctPrescriptionPreview, setAnaphylaxisAdjunctPrescriptionPreview] = useState<AnaphylaxisAdjunctPrescriptionPreview | null>(null)
  const [anaphylaxisAdjunctPrescriptionCopied, setAnaphylaxisAdjunctPrescriptionCopied] = useState(false)
  const [anaphylaxisPrescriptionPreview, setAnaphylaxisPrescriptionPreview] = useState<AnaphylaxisPrescriptionPreview | null>(null)
  const [anaphylaxisPrescriptionCopied, setAnaphylaxisPrescriptionCopied] = useState(false)
  const [anaphylaxisPrescriptionGenerated, setAnaphylaxisPrescriptionGenerated] = useState(false)
  const [rabiesBiteImageOpen, setRabiesBiteImageOpen] = useState(false)
  const [pancreatitisBisapValues, setPancreatitisBisapValues] = useState<Record<PancreatitisBisapKey, boolean>>(() => defaultPancreatitisBisapValues(patient))
  const [pancreatitisMarshallValues, setPancreatitisMarshallValues] = useState<PancreatitisMarshallValues>(() => defaultPancreatitisMarshallValues())
  const [pancreatitisIcuCriteria, setPancreatitisIcuCriteria] = useState<string[]>([])
  const [pancreatitisIncludeAntibiotic, setPancreatitisIncludeAntibiotic] = useState(false)
  const [pancreatitisPrescriptionPreview, setPancreatitisPrescriptionPreview] = useState<PancreatitisPrescriptionPreview | null>(null)
  const [pancreatitisPrescriptionCopied, setPancreatitisPrescriptionCopied] = useState(false)
  const [pancreatitisPrescriptionGenerated, setPancreatitisPrescriptionGenerated] = useState(false)
  const [cholangitisDiagnosisValues, setCholangitisDiagnosisValues] = useState<Record<CholangitisDiagnosisKey, boolean>>(() => defaultCholangitisDiagnosisValues())
  const [cholangitisSeverityValues, setCholangitisSeverityValues] = useState<Record<CholangitisSeverityKey, boolean>>(() => defaultCholangitisSeverityValues(patient))
  const [cholangitisAntibioticScheme, setCholangitisAntibioticScheme] = useState<CholangitisPrescriptionPreview['antibioticScheme']>('cefepime_metronidazole')
  const [cholangitisPrescriptionPreview, setCholangitisPrescriptionPreview] = useState<CholangitisPrescriptionPreview | null>(null)
  const [cholangitisPrescriptionCopied, setCholangitisPrescriptionCopied] = useState(false)
  const [cholangitisPrescriptionGenerated, setCholangitisPrescriptionGenerated] = useState(false)
  const [cholecystitisSeverityValues, setCholecystitisSeverityValues] = useState<Record<CholecystitisSeverityKey, boolean>>(() => defaultCholecystitisSeverityValues())
  const [cholecystitisAntibioticScheme, setCholecystitisAntibioticScheme] = useState<CholecystitisAntibioticScheme>('ceftriaxone_metronidazole')
  const [cholecystitisPrescriptionPreview, setCholecystitisPrescriptionPreview] = useState<CholecystitisPrescriptionPreview | null>(null)
  const [cholecystitisPrescriptionCopied, setCholecystitisPrescriptionCopied] = useState(false)
  const [cholecystitisPrescriptionGenerated, setCholecystitisPrescriptionGenerated] = useState(false)
  const [cholecystitisSurgeryConsultPreview, setCholecystitisSurgeryConsultPreview] = useState<CholecystitisSurgeryConsultPreview | null>(null)
  const [cholecystitisSurgeryConsultCopied, setCholecystitisSurgeryConsultCopied] = useState(false)
  const [appendicitisAlvaradoValues, setAppendicitisAlvaradoValues] = useState<Record<AppendicitisAlvaradoKey, boolean>>(() => defaultAppendicitisAlvaradoValues())
  const [appendicitisAntibioticScheme, setAppendicitisAntibioticScheme] = useState<AppendicitisAntibioticScheme>('ceftriaxone_metronidazole')
  const [appendicitisIncludeAntibiotics, setAppendicitisIncludeAntibiotics] = useState(true)
  const [appendicitisPrescriptionPreview, setAppendicitisPrescriptionPreview] = useState<AppendicitisPrescriptionPreview | null>(null)
  const [appendicitisPrescriptionCopied, setAppendicitisPrescriptionCopied] = useState(false)
  const [appendicitisPrescriptionGenerated, setAppendicitisPrescriptionGenerated] = useState(false)
  const [lombalgiaRiskValues, setLombalgiaRiskValues] = useState<Record<LombalgiaRiskKey, boolean>>(() => defaultLombalgiaRiskValues())
  const [lombalgiaPrescriptionPreview, setLombalgiaPrescriptionPreview] = useState<LombalgiaPrescriptionPreview | null>(null)
  const [lombalgiaPrescriptionCopied, setLombalgiaPrescriptionCopied] = useState(false)
  const [lombalgiaPrescriptionGenerated, setLombalgiaPrescriptionGenerated] = useState(false)
  const [flegmasiaGalleryOpen, setFlegmasiaGalleryOpen] = useState(false)
  const [cincinnatiInfoOpen, setCincinnatiInfoOpen] = useState(false)
  const [bellFacialNerveOpen, setBellFacialNerveOpen] = useState(false)
  const [bellCranioOpen, setBellCranioOpen] = useState(false)
  const [bellCheekInflationImageOpen, setBellCheekInflationImageOpen] = useState(false)
  const [pendingBellSide, setPendingBellSide] = useState<{ label: string; value: string } | null>(null)
  const [bellChiefComplaint, setBellChiefComplaint] = useState('')
  const [bellPhysicalExamFindings, setBellPhysicalExamFindings] = useState<BellPhysicalExamKey[]>([])
  const [bellPhysicalExamNotes, setBellPhysicalExamNotes] = useState('')
  const [bellCriteriaChecks, setBellCriteriaChecks] = useState<Record<BellCriteriaKey, boolean>>(() => defaultBellCriteriaChecks())
  const [bellSupportChecks, setBellSupportChecks] = useState<Record<BellSupportKey, boolean>>(() => defaultBellSupportChecks())
  const [bellRedFlagChecks, setBellRedFlagChecks] = useState<Record<BellRedFlagKey, boolean>>(() => defaultBellRedFlagChecks())
  const [bellRamsayInfoOpen, setBellRamsayInfoOpen] = useState(false)
  const [bellLagophthalmosInfoOpen, setBellLagophthalmosInfoOpen] = useState(false)
  const [bellPhenomenonInfoOpen, setBellPhenomenonInfoOpen] = useState(false)
  const [selectedBellHouseGrade, setSelectedBellHouseGrade] = useState('')
  const [bellTreatmentTimingOpen, setBellTreatmentTimingOpen] = useState(false)
  const [bellDocumentCopied, setBellDocumentCopied] = useState(false)
  const [clinicalSummaryCopied, setClinicalSummaryCopied] = useState(false)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [bellWithin72Hours, setBellWithin72Hours] = useState<boolean | null>(null)
  const [bellUseCorticosteroid, setBellUseCorticosteroid] = useState(false)
  const [bellAntiviralChoice, setBellAntiviralChoice] = useState<BellAntiviralChoice>('none')
  const [bellUseEyeCare, setBellUseEyeCare] = useState(false)
  const [gasometryDraft, setGasometryDraft] = useState<Record<GasometryFieldKey, string>>({
    ph: '',
    pco2: '',
    hco3: '',
    be: '',
    po2: '',
    sodium: '',
    chloride: '',
    albumin: ''
  })
  const [gasometryInfoOpen, setGasometryInfoOpen] = useState<GasometryFieldKey | null>(null)
  const [asthmaInitialDraft, setAsthmaInitialDraft] = useState<Record<AsthmaInitialFieldKey, string>>({
    sato2: '',
    fr: '',
    fc: '',
    pfe: '',
    paco2: ''
  })
  const [asthmaReevalDraft, setAsthmaReevalDraft] = useState<Record<AsthmaReevalFieldKey, string>>({
    sato2Re: '',
    frRe: '',
    pfeRe: ''
  })
  const [asthmaFlags, setAsthmaFlags] = useState({
    usoMusculatura: false,
    incapazFrases: false,
    falaPalavras: false,
    cianose: false,
    confusao: false,
    exaustao: false,
    toraxSilente: false,
    sonolencia: false
  })
  const [asthmaReevalFlags, setAsthmaReevalFlags] = useState({
    melhoraClinica: false,
    necessidadeBroncoRepetido: false
  })

  // DPOC States
  const [dpocSinaisGravidade, setDpocSinaisGravidade] = useState<string[]>([])
  const [dpocAnthonisen, setDpocAnthonisen] = useState<string[]>([])

  const updatePneumoniaVitalSign = <K extends keyof FlowVitalSigns>(key: K, value: FlowVitalSigns[K]) => {
    setPneumoniaVitalSigns(prev => ({ ...prev, [key]: value }))
  }

  const updateInfluenzaVitalSign = <K extends keyof FlowVitalSigns>(key: K, value: FlowVitalSigns[K]) => {
    setInfluenzaVitalSigns(prev => ({ ...prev, [key]: value }))
  }

  const updateTVPVitalSign = <K extends keyof FlowVitalSigns>(key: K, value: FlowVitalSigns[K]) => {
    setTVPVitalSigns(prev => ({ ...prev, [key]: value }))
  }

  const updateTEPVitalSign = <K extends keyof FlowVitalSigns>(key: K, value: FlowVitalSigns[K]) => {
    setTEPVitalSigns(prev => ({ ...prev, [key]: value }))
  }

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const vitalBadge = (label: string, tone: 'blue' | 'blue-dark' | 'yellow' | 'orange' | 'red' | 'black') => {
    const tones: Record<typeof tone, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      'blue-dark': 'bg-blue-200 text-blue-900 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      black: 'bg-black text-white border-black'
    } as Record<typeof tone, string>

    return (
      <span className={clsx('mt-2 inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold', tones[tone])}>
        {label}
      </span>
    )
  }

  const classifyTemperature = (temperature?: number) => {
    if (temperature == null || Number.isNaN(temperature)) return null
    if (temperature < 28) return vitalBadge('Hipotermia grave', 'red')
    if (temperature <= 31.9) return vitalBadge('Hipotermia moderada', 'orange')
    if (temperature <= 35.9) return vitalBadge('Hipotermia leve', 'yellow')
    if (temperature >= 36 && temperature <= 37.2) return vitalBadge('Normal', 'blue')
    if (temperature <= 37.7) return vitalBadge('Subfebril', 'yellow')
    if (temperature <= 40) return vitalBadge('Febre', 'orange')
    return vitalBadge('Hipertermia', 'red')
  }

  const classifyHeartRate = (heartRate?: number) => {
    if (heartRate == null) return null
    if (heartRate >= 160) return vitalBadge('Taquicardia severa', 'red')
    if (heartRate >= 131) return vitalBadge('Taquicardia moderada', 'orange')
    if (heartRate > 100) return vitalBadge('Taquicardia leve', 'yellow')
    if (heartRate >= 60) return vitalBadge('Normal', 'blue')
    if (heartRate >= 50) return vitalBadge('Bradicardia leve', 'yellow')
    if (heartRate >= 35) return vitalBadge('Bradicardia moderada', 'orange')
    return vitalBadge('Bradicardia severa', 'red')
  }

  const classifyRespiratoryRate = (respiratoryRate?: number) => {
    if (respiratoryRate == null) return null
    if (respiratoryRate >= 40) return vitalBadge('Taquipneia severa', 'red')
    if (respiratoryRate >= 31) return vitalBadge('Taquipneia moderada', 'orange')
    if (respiratoryRate >= 21) return vitalBadge('Taquipneia leve', 'yellow')
    if (respiratoryRate >= 14) return vitalBadge('Normal', 'blue')
    if (respiratoryRate >= 12) return vitalBadge('Bradipneia leve', 'yellow')
    if (respiratoryRate >= 9) return vitalBadge('Bradipneia moderada', 'orange')
    return vitalBadge('Bradipneia severa', 'red')
  }

  const classifyOxygenSaturation = (oxygenSaturation?: number) => {
    if (oxygenSaturation == null) return null
    if (oxygenSaturation <= 85) return vitalBadge('Hipoxemia severa', 'red')
    if (oxygenSaturation <= 89) return vitalBadge('Hipoxemia moderada', 'orange')
    if (oxygenSaturation <= 94) return vitalBadge('Hipoxemia leve', 'yellow')
    return vitalBadge('Normal', 'blue')
  }

  const calculateMeanArterialPressure = (bloodPressure?: string) => {
    if (!bloodPressure) return undefined
    const [systolicText, diastolicText] = bloodPressure.split('/')
    const systolic = Number.parseInt(systolicText, 10)
    const diastolic = Number.parseInt(diastolicText, 10)
    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return undefined
    return Math.round((systolic + 2 * diastolic) / 3)
  }

  const classifyBloodPressure = (bloodPressure?: string) => {
    if (!bloodPressure) return null
    const [systolicText, diastolicText] = bloodPressure.split('/')
    const systolic = Number.parseInt(systolicText, 10)
    const diastolic = Number.parseInt(diastolicText, 10)
    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null

    if (systolic < 70 || diastolic < 49) return vitalBadge('Hipotensão severa', 'red')
    if ((systolic >= 70 && systolic <= 84) || (diastolic >= 49 && diastolic <= 54)) return vitalBadge('Hipotensão moderada', 'orange')
    if ((systolic >= 85 && systolic <= 99) || (diastolic >= 55 && diastolic <= 59)) return vitalBadge('Hipotensão leve', 'yellow')
    if (systolic >= 180 || diastolic >= 110) return vitalBadge('Hipertensão grave', 'red')
    if ((systolic >= 160 && systolic <= 179) || (diastolic >= 100 && diastolic <= 109)) return vitalBadge('Hipertensão moderada', 'orange')
    if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) return vitalBadge('Hipertensão leve', 'yellow')
    if ((systolic >= 120 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return vitalBadge('PA aumentada', 'blue-dark')
    if (systolic >= 100 && systolic <= 119 && diastolic >= 60 && diastolic <= 79) return vitalBadge('PA normal', 'blue')
    return null
  }

  const classifyGlucoseValue = (glucose?: string) => {
    if (!glucose) return null
    const normalized = glucose.trim().toUpperCase()
    if (normalized === 'HI') return vitalBadge('Hiperglicemia extrema', 'black')
    if (normalized === 'LO') return vitalBadge('Hipoglicemia extrema', 'black')
    const value = Number.parseFloat(normalized)
    if (!Number.isFinite(value)) return null
    if (value > 200) return vitalBadge('Hiperglicemia severa', 'red')
    if (value >= 151) return vitalBadge('Hiperglicemia moderada', 'orange')
    if (value >= 126) return vitalBadge('Hiperglicemia leve', 'yellow')
    if (value >= 100) return vitalBadge('Glicemia elevada', 'blue-dark')
    if (value >= 75) return vitalBadge('Glicemia normal', 'blue')
    if (value >= 60) return vitalBadge('Hipoglicemia leve', 'yellow')
    if (value >= 45) return vitalBadge('Hipoglicemia moderada', 'orange')
    return vitalBadge('Hipoglicemia severa', 'red')
  }

  const formatBloodPressureInput = (value: string) => {
    const digits = value.replace(/[^\d]/g, '').slice(0, 6)
    if (digits.length <= 3) return digits
    const firstThree = Number.parseInt(digits.slice(0, 3), 10)
    const systolicLength = firstThree > 299 ? 2 : 3
    return `${digits.slice(0, systolicLength)}/${digits.slice(systolicLength)}`
  }

  // Carregar estado do paciente na inicialização
  useEffect(() => {
    // Só atualiza se o ID do paciente mudar ou se for inicialização, evitando reset durante a navegação
    if (patient.id) {
      const safeStep = resolveCurrentStep(patient.emergencyState.currentStep)
      setCurrentStep(safeStep)
      setHistory(patient.emergencyState.history || [])
      setAnswers(patient.emergencyState.answers || {})
      setProgress(patient.emergencyState.progress || 0)
    }
  }, [
    patient.id,
    patient.emergencyState.currentStep,
    patient.emergencyState.history,
    patient.emergencyState.answers,
    patient.emergencyState.progress,
    flowchart.id,
    resolveCurrentStep
  ])

  // Função para calcular progresso baseado no fluxograma específico
  const calculateProgress = (currentStep: string, history: string[]): number => {
    const pathSteps = [...history, currentStep]
    const totalSteps = Object.keys(flowchart.steps).length
    
    if (flowchart.finalSteps.includes(currentStep)) {
      return 100
    }
    
    const completedSteps = pathSteps.length
    return Math.min((completedSteps / totalSteps) * 100, 95)
  }

  // Função para obter ícone baseado no tipo de step
  const getStepIcon = (step: EmergencyStep) => {
    switch (step.type) {
      case 'question':
        return <Brain className="w-6 h-6" />
      case 'action':
        return <Activity className="w-6 h-6" />
      case 'result':
        return <CheckCircle className="w-6 h-6" />
      case 'group':
        return <Target className="w-6 h-6" />
      case 'lab_wait':
        return <Microscope className="w-6 h-6" />
      case 'medication':
        return <Pill className="w-6 h-6" />
      case 'procedure':
        return <Syringe className="w-6 h-6" />
      default:
        return <Stethoscope className="w-6 h-6" />
    }
  }

  // Função para obter cor baseada na criticidade
  const getStepColor = (step: EmergencyStep) => {
    if (step.critical) return 'from-red-600 to-red-800'
    if (step.timeSensitive) return 'from-orange-500 to-red-600'
    if (step.requiresSpecialist) return 'from-purple-500 to-purple-700'
    return step.color || 'from-blue-500 to-cyan-600'
  }

  const handleAnswer = (nextStep: string, value?: string) => {
    if (flowchart.id === 'tvp') {
      try {
        const savedClinicalEvaluation = JSON.parse(answers.avaliacao_clinica || '{}')
        const savedFindings = Array.isArray(savedClinicalEvaluation?.sinaisEAchados)
          ? savedClinicalEvaluation.sinaisEAchados
          : []
        const hasSavedAlert = savedFindings.some((item: unknown) =>
          typeof item === 'string' && tvpAlertSigns.includes(item)
        )
        if (hasSavedAlert) {
          if (currentStep === 'wells_score') {
            nextStep = 'pocus_antes_d_dimero'
            value = 'alerta_investigacao_obrigatoria'
          } else if (currentStep === 'pocus_antes_d_dimero') {
            nextStep = 'pocus_resultado_pre_d_dimero'
          } else if (currentStep === 'pocus_resultado_pre_d_dimero') {
            nextStep = 'tvp_d_dimero_alerta'
            value = `${value || 'pocus_registrado'}_com_alerta`
          } else if (currentStep === 'tvp_d_dimero_alerta' || currentStep === 'baixa_probabilidade') {
            nextStep = 'tvp_urgencia_vascular_imediata'
            value = `${value || 'd_dimero_registrado'}_com_alerta`
          } else {
            const isAllowedAlertTransition =
              nextStep === 'wells_score' ||
              currentStep === 'tvp_urgencia_vascular_imediata' ||
              currentStep === 'tvp_aguarda_avaliacao_vascular' ||
              currentStep === 'tvp_internacao_uti'

            if (!isAllowedAlertTransition) {
              nextStep = 'tvp_urgencia_vascular_imediata'
              value = 'alerta_gravidade_confirmado'
            }
          }
        }
      } catch {
        // Mantém a navegação padrão apenas quando não existe checklist salvo válido.
      }
    }

    const newHistory = [...history, currentStep]
    const isTVPLegSelection = flowchart.id === 'tvp' && currentStep === 'start'
    const isTVPClinicalEvaluation = flowchart.id === 'tvp' && currentStep === 'avaliacao_clinica'
    const isTVPWellsScore = flowchart.id === 'tvp' && currentStep === 'wells_score'
    const isTVPContraCheck = flowchart.id === 'tvp' && currentStep === 'checar_contra_anticoagulacao'
    const isTVPTreatmentInitial = flowchart.id === 'tvp' && currentStep === 'tratamento_inicial'
    const isInfluenzaSeverityStep = flowchart.id === 'influenza' && currentStep === 'influenza_sinais_gravidade'
    const isInfluenzaRiskStep = flowchart.id === 'influenza' && currentStep === 'influenza_fatores_risco'
    const isInfluenzaICUStep = flowchart.id === 'influenza' && currentStep === 'influenza_criterios_uti'
    const isInfluenzaPhysicalExamStep = flowchart.id === 'influenza' && currentStep === 'influenza_exame_fisico'
    const isTVPPhysicalExamStep = flowchart.id === 'tvp' && currentStep === 'tvp_exame_fisico'
    const isTEPPhysicalExamStep = flowchart.id === 'tep' && currentStep === 'tep_exame_fisico'
    const isInfluenzaViralPanelStep = flowchart.id === 'influenza' && ['influenza_painel_viral_enfermaria', 'influenza_painel_viral_uti'].includes(currentStep)
    const isPneumoniaPhysicalExamStep = flowchart.id === 'pneumonia' && currentStep === 'pac_exame_fisico'
    const isPneumoniaCrbProtocolStep = flowchart.id === 'pneumonia' && currentStep === 'pac_crb65_triagem'
    const isPneumoniaExamRequestStep = flowchart.id === 'pneumonia' && currentStep === 'pac_solicitacao_exames'
    const isPneumoniaLabResultsStep = flowchart.id === 'pneumonia' && currentStep === 'pac_resultados_exames'
    const isPneumoniaCurbProtocolStep = flowchart.id === 'pneumonia' && currentStep === 'pac_curb65_protocolo'
    const isPneumoniaAtsIdsaProtocolStep = flowchart.id === 'pneumonia' && currentStep === 'pac_ats_idsa_gravidade'
    const isPneumoniaDripProtocolStep = flowchart.id === 'pneumonia' && ['pac_drip_enfermaria', 'pac_drip_uti'].includes(currentStep)
    const isPneumoniaSmartCopProtocolStep = flowchart.id === 'pneumonia' && ['pac_smartcop_enfermaria', 'pac_smartcop_uti'].includes(currentStep)
    const isPneumoniaPsiStep = flowchart.id === 'pneumonia' && currentStep === 'pac_calcular_psi'
    const isPneumoniaCurbStep = flowchart.id === 'pneumonia' && currentStep === 'pac_calcular_curb65'
    const isAnaphylaxisCriteriaStep = flowchart.id === 'anafilaxia' && currentStep === 'ana_criterios_wao'
    const isAnaphylaxisAdjunctStep = flowchart.id === 'anafilaxia' && currentStep === 'ana_tratamento_adjunto'
    const isPancreatitisBisapStep = flowchart.id === 'pancreatitis' && currentStep === 'pan_bisap'
    const isPancreatitisMarshallStep = flowchart.id === 'pancreatitis' && currentStep === 'pan_marshall_atlanta'
    const isCholangitisDiagnosisStep = flowchart.id === 'cholangitis' && currentStep === 'colangite_tokyo_diagnostico'
    const isCholangitisSeverityStep = flowchart.id === 'cholangitis' && currentStep === 'colangite_tokyo_gravidade'
    const isCholecystitisSeverityStep = flowchart.id === 'cholecystitis' && currentStep === 'cole_tokyo_gravidade'
    const isAppendicitisAlvaradoStep = flowchart.id === 'appendicitis' && currentStep === 'apend_alvarado'
    const isLombalgiaRiskStep = flowchart.id === 'lombalgia' && currentStep === 'lomb_red_flags'
    const isBellPhysicalExamStep = flowchart.id === 'paralisia_bell' && currentStep === 'bell_exame_fisico'
    const isBellCriteriaStep = flowchart.id === 'paralisia_bell' && currentStep === 'bell_criterios_obrigatorios'
    const isBellSupportStep = flowchart.id === 'paralisia_bell' && currentStep === 'bell_suporte_diagnostico'
    const isBellRedFlagsStep = flowchart.id === 'paralisia_bell' && currentStep === 'bell_red_flags_ramsay'
    const isBellHouseStep = flowchart.id === 'paralisia_bell' && currentStep === 'bell_house_brackmann'
    const psiResult = calculatePneumoniaPsi(pneumoniaPsiValues, patient)
    const curbResult = calculatePneumoniaCurb65(pneumoniaCurbValues)
    const pancreatitisBisapResult = calculatePancreatitisBisap(pancreatitisBisapValues)
    const pancreatitisMarshallResult = calculatePancreatitisMarshall(pancreatitisMarshallValues)
    const cholangitisDiagnosisResult = calculateCholangitisDiagnosis(cholangitisDiagnosisValues)
    const cholangitisSeverityResult = calculateCholangitisSeverity(cholangitisSeverityValues)
    const cholecystitisSeverityResult = calculateCholecystitisSeverity(cholecystitisSeverityValues)
    const appendicitisAlvaradoResult = calculateAppendicitisAlvarado(appendicitisAlvaradoValues)
    const lombalgiaDispositionResult = calculateLombalgiaDisposition(lombalgiaRiskValues)
    const legSelectionAnswer = JSON.stringify({
      decision: value || nextStep,
      selectedLeg: selectedTVPLeg,
      selectedLegLabel: selectedTVPLeg === 'left' ? 'Perna Esquerda' : selectedTVPLeg === 'right' ? 'Perna Direita' : selectedTVPLeg === 'other' ? 'Outras localizações' : ''
    })
    const bellSideAnswer = JSON.stringify({
      decision: value || nextStep,
      ladoAcometido: value,
      ladoAcometidoLabel: value === 'lado_direito' ? 'direito' : value === 'lado_esquerdo' ? 'esquerdo' : '',
      queixaPrincipal: bellChiefComplaint.trim()
    })
    const clinicalEvaluationAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisEAchados: selectedClinicalFindings,
      outrosAchados: otherClinicalFinding.trim()
    })
    const wellsScoreAnswer = JSON.stringify({
      decision: value || nextStep,
      score: wellsScoreTotal,
      classificacao: wellsRisk,
      criteriosSelecionados: selectedWellsCriteria
    })
    const contraCheckAnswer = JSON.stringify({
      decision: value || nextStep,
      contraindicacoesSelecionadas: selectedContraindications,
      possuiContraindicacaoAbsoluta: hasAbsoluteContraindication,
      possuiContraindicacaoRelativa: hasRelativeContraindication,
      solicitarAvaliacaoCirurgiaoVascular: hasAbsoluteContraindication || (hasRelativeContraindication && nextStep === 'tvp_aguarda_avaliacao_vascular')
    })
    const treatmentAnswer = JSON.stringify({
      decision: value || nextStep,
      opcoesTerapeuticasSelecionadas: selectedTherapies.filter(
        (therapyId) => therapyId !== 'hnf' || isTVPICUDisposition(currentStep, history)
      ),
      planoDuracaoSelecionado: selectedDurationPlan,
      solicitarAvaliacaoCirurgiaoVascular: true
    })
    const influenzaSeverityAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisGravidadeSelecionados: influenzaSeveritySigns,
      classificadoComoSRAG: influenzaSeveritySigns.length > 0
    })
    const influenzaRiskAnswer = JSON.stringify({
      decision: value || nextStep,
      fatoresRiscoSelecionados: influenzaRiskFactors,
      sinaisPioraSelecionados: influenzaWorseningSigns,
      indicarOseltamivir: influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
    })
    const influenzaICUAnswer = JSON.stringify({
      decision: value || nextStep,
      criteriosUTISelecionados: influenzaICUCriteria,
      indicarUTI: influenzaICUCriteria.length > 0
    })
    const influenzaPhysicalExamAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisVitais: influenzaVitalSigns,
      exameFisico: influenzaPhysicalExam
    })
    const tvpPhysicalExamAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisVitais: tvpVitalSigns,
      exameFisico: tvpPhysicalExam
    })
    const tepPhysicalExamAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisVitais: tepVitalSigns,
      exameFisico: tepPhysicalExam
    })
    const influenzaViralPanelAnswer = JSON.stringify({
      decision: value || nextStep,
      examesSolicitados: influenzaSelectedExams
    })
    const pneumoniaPhysicalExamAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisVitais: pneumoniaVitalSigns,
      exameFisico: pneumoniaPhysicalExam
    })
    const pneumoniaCrbProtocolAnswer = JSON.stringify({
      decision: value || nextStep,
      score: pneumoniaCrbScore,
      criteriosSelecionados: pneumoniaCrbCriteria
    })
    const pneumoniaExamRequestAnswer = JSON.stringify({
      decision: value || nextStep,
      examesSelecionados: pneumoniaSelectedExams,
      grupos: Object.fromEntries(
        pneumoniaExamGroups.map((group) => [
          group.key,
          group.items.filter((item) => pneumoniaSelectedExams.includes(item))
        ])
      )
    })
    const pneumoniaLabResultsAnswer = JSON.stringify({
      decision: value || nextStep,
      resultados: pneumoniaLabResults,
      criteriosCurbPreenchidosAutomaticamente: pneumoniaAutomaticCurbValues
    })
    const pneumoniaCurbProtocolAnswer = JSON.stringify({
      decision: value || nextStep,
      score: pneumoniaCurbResult.score,
      destino: pneumoniaCurbResult.disposition,
      criterios: pneumoniaCurbValues
    })
    const pneumoniaAtsIdsaProtocolAnswer = JSON.stringify({
      decision: value || nextStep,
      pacGrave: pneumoniaAtsIdsaSevere,
      criteriosMaioresSelecionados: pneumoniaAtsIdsaMajorCriteria,
      criteriosMenoresSelecionados: pneumoniaAtsIdsaMinorCriteria
    })
    const pneumoniaDripProtocolAnswer = JSON.stringify({
      decision: value || nextStep,
      score: pneumoniaDripScore,
      criteriosMaioresSelecionados: pneumoniaDripMajorCriteria,
      criteriosMenoresSelecionados: pneumoniaDripMinorCriteria
    })
    const pneumoniaSmartCopProtocolAnswer = JSON.stringify({
      decision: value || nextStep,
      score: pneumoniaSmartCopScore,
      criteriosSelecionados: pneumoniaSmartCopCriteria
    })
    const pneumoniaPsiAnswer = JSON.stringify({
      decision: value || nextStep,
      score: psiResult.score,
      grupo: psiResult.group,
      destino: psiResult.disposition,
      criterios: pneumoniaPsiValues
    })
    const pneumoniaCurbAnswer = JSON.stringify({
      decision: value || nextStep,
      score: curbResult.score,
      destino: curbResult.disposition,
      criterios: pneumoniaCurbValues
    })
    const anaphylaxisCriteriaAnswer = JSON.stringify({
      decision: value || nextStep,
      criteriosSelecionados: selectedAnaphylaxisCriteria,
      diagnosticoProvavel: selectedAnaphylaxisCriteria.length > 0
    })
    const anaphylaxisAdjunctAnswer = JSON.stringify({
      decision: value || nextStep,
      tratamentosAdjuntosSelecionados: selectedAnaphylaxisAdjuncts
    })
    const pancreatitisBisapAnswer = JSON.stringify({
      decision: value || nextStep,
      score: pancreatitisBisapResult.score,
      altoRisco: pancreatitisBisapResult.highRisk,
      criteriosSelecionados: pancreatitisBisapValues
    })
    const pancreatitisMarshallAnswer = JSON.stringify({
      decision: value || nextStep,
      pontuacaoMaximaMarshall: pancreatitisMarshallResult.maxScore,
      possuiFalenciaOrganica: pancreatitisMarshallResult.hasOrganFailure,
      classificacaoAtlanta: pancreatitisMarshallResult.title,
      valores: pancreatitisMarshallValues,
      criteriosUTISelecionados: pancreatitisIcuCriteria
    })
    const cholangitisDiagnosisAnswer = JSON.stringify({
      decision: value || nextStep,
      status: cholangitisDiagnosisResult.status,
      grupos: {
        inflamacaoSistemica: cholangitisDiagnosisResult.hasA,
        colestase: cholangitisDiagnosisResult.hasB,
        imagem: cholangitisDiagnosisResult.hasC
      },
      criteriosSelecionados: cholangitisDiagnosisValues
    })
    const cholangitisSeverityAnswer = JSON.stringify({
      decision: value || nextStep,
      gravidade: cholangitisSeverityResult.severity,
      tokyo: cholangitisSeverityResult.tokyo,
      criteriosSelecionados: cholangitisSeverityValues
    })
    const cholecystitisSeverityAnswer = JSON.stringify({
      decision: value || nextStep,
      gravidade: cholecystitisSeverityResult.severity,
      tokyo: cholecystitisSeverityResult.tokyo,
      criteriosSelecionados: cholecystitisSeverityValues
    })
    const appendicitisAlvaradoAnswer = JSON.stringify({
      decision: value || nextStep,
      score: appendicitisAlvaradoResult.score,
      risco: appendicitisAlvaradoResult.risk,
      criteriosSelecionados: appendicitisAlvaradoValues
    })
    const lombalgiaRiskAnswer = JSON.stringify({
      decision: value || nextStep,
      destino: lombalgiaDispositionResult.category,
      classificacao: lombalgiaDispositionResult.title,
      criteriosSelecionados: lombalgiaRiskValues
    })
    const bellCriteriaAnswer = JSON.stringify({
      decision: value || nextStep,
      criteriosSelecionados: BELL_DIAGNOSTIC_CRITERIA.filter((item) => bellCriteriaChecks[item.key]).map((item) => item.key),
      todosCriteriosPresentes: BELL_DIAGNOSTIC_CRITERIA.every((item) => bellCriteriaChecks[item.key])
    })
    const bellPhysicalExamAnswer = JSON.stringify({
      decision: value || nextStep,
      achadosSelecionados: bellPhysicalExamFindings,
      observacoes: bellPhysicalExamNotes.trim(),
      deficitNeurologicoAdicional: bellPhysicalExamFindings.includes('deficit_neurologico_adicional')
    })
    const bellSupportAnswer = JSON.stringify({
      decision: value || nextStep,
      criteriosSuporteSelecionados: BELL_SUPPORT_CRITERIA.filter((item) => bellSupportChecks[item.key]).map((item) => item.key)
    })
    const bellRedFlagsAnswer = JSON.stringify({
      decision: value || nextStep,
      redFlagsSelecionadas: BELL_RED_FLAGS.filter((item) => bellRedFlagChecks[item.key]).map((item) => item.key),
      possuiRedFlag: BELL_RED_FLAGS.some((item) => bellRedFlagChecks[item.key])
    })
    const bellHouseAnswer = JSON.stringify({
      decision: value || nextStep,
      houseBrackmann: selectedBellHouseGrade,
      houseBrackmannLabel: bellHouseGradeLabels[selectedBellHouseGrade] || ''
    })
    const newAnswers = {
      ...answers,
      [currentStep]: isTVPLegSelection
        ? legSelectionAnswer
        : isBellSideSelection
          ? bellSideAnswer
        : isTVPClinicalEvaluation
          ? clinicalEvaluationAnswer
          : isTVPWellsScore
            ? wellsScoreAnswer
            : isTVPContraCheck
              ? contraCheckAnswer
              : isTVPTreatmentInitial
                ? treatmentAnswer
                : isInfluenzaSeverityStep
                  ? influenzaSeverityAnswer
                  : isInfluenzaRiskStep
                    ? influenzaRiskAnswer
                    : isInfluenzaICUStep
                      ? influenzaICUAnswer
                      : isInfluenzaPhysicalExamStep
                        ? influenzaPhysicalExamAnswer
                      : isInfluenzaViralPanelStep
                        ? influenzaViralPanelAnswer
                      : isTVPPhysicalExamStep
                        ? tvpPhysicalExamAnswer
                      : isTEPPhysicalExamStep
                        ? tepPhysicalExamAnswer
                      : isPneumoniaPhysicalExamStep
                          ? pneumoniaPhysicalExamAnswer
                          : isPneumoniaCrbProtocolStep
                            ? pneumoniaCrbProtocolAnswer
                          : isPneumoniaExamRequestStep
                            ? pneumoniaExamRequestAnswer
                          : isPneumoniaLabResultsStep
                            ? pneumoniaLabResultsAnswer
                          : isPneumoniaCurbProtocolStep
                            ? pneumoniaCurbProtocolAnswer
                            : isPneumoniaAtsIdsaProtocolStep
                              ? pneumoniaAtsIdsaProtocolAnswer
                              : isPneumoniaDripProtocolStep
                                ? pneumoniaDripProtocolAnswer
                                : isPneumoniaSmartCopProtocolStep
                                  ? pneumoniaSmartCopProtocolAnswer
                                  : isPneumoniaPsiStep
                                    ? pneumoniaPsiAnswer
                                    : isPneumoniaCurbStep
                                      ? pneumoniaCurbAnswer
                                    : isAnaphylaxisCriteriaStep
                                      ? anaphylaxisCriteriaAnswer
                                      : isAnaphylaxisAdjunctStep
                                        ? anaphylaxisAdjunctAnswer
                                        : isPancreatitisBisapStep
                                          ? pancreatitisBisapAnswer
                                          : isPancreatitisMarshallStep
                                            ? pancreatitisMarshallAnswer
                                            : isCholangitisDiagnosisStep
                                              ? cholangitisDiagnosisAnswer
                                              : isCholangitisSeverityStep
                                                ? cholangitisSeverityAnswer
                                                : isCholecystitisSeverityStep
                                                  ? cholecystitisSeverityAnswer
                                                  : isAppendicitisAlvaradoStep
                                                    ? appendicitisAlvaradoAnswer
                                                    : isLombalgiaRiskStep
                                                      ? lombalgiaRiskAnswer
                                                      : isBellPhysicalExamStep
                                                        ? bellPhysicalExamAnswer
                                                      : isBellCriteriaStep
                                                        ? bellCriteriaAnswer
                                                        : isBellSupportStep
                                                          ? bellSupportAnswer
                                                          : isBellRedFlagsStep
                                                            ? bellRedFlagsAnswer
                                                            : isBellHouseStep
                                                              ? bellHouseAnswer
                                                              : value || nextStep
    }
    const newProgress = calculateProgress(nextStep, newHistory)

    setCurrentStep(nextStep)
    setHistory(newHistory)
    setAnswers(newAnswers)
    setProgress(newProgress)

    // Determinar grupo de risco se aplicável
    const currentStepData = flowchart.steps[currentStep]
    const riskGroup = currentStepData.group

    onUpdate(patient.id, nextStep, newHistory, newAnswers, newProgress, riskGroup)

    if (flowchart.finalSteps.includes(nextStep)) {
      // No automatic completion
    }
  }

  const handleOptionSelect = (option: EmergencyOption) => {
    const requiresTVPWellsIntro = flowchart.id === 'tvp' && currentStepData?.id === 'avaliacao_clinica' && option.nextStep === 'wells_score'
    const requiresTVPConfirmada = flowchart.id === 'tvp' && option.nextStep === 'checar_contra_anticoagulacao'
    const requiresAnaphylaxisManagementAlert = flowchart.id === 'anafilaxia' && currentStepData?.id === 'ana_adrenalina_im' && option.nextStep === 'ana_tratamento_adjunto'
    
    if (requiresTVPWellsIntro) {
      setPendingTVPWellsOption({ nextStep: option.nextStep, value: option.value })
      setTVPWellsIntroOpen(true)
      return
    }

    if (requiresTVPConfirmada) {
      setPendingTVPConfirmadaOption({ nextStep: option.nextStep, value: option.value })
      setTVPConfirmadaOpen(true)
      return
    }

    if (requiresAnaphylaxisManagementAlert) {
      setPendingAnaphylaxisManagementOption({ nextStep: option.nextStep, value: option.value })
      setAnaphylaxisManagementAlertOpen(true)
      return
    }

    handleAnswer(option.nextStep, option.value)
  }

  const handlePneumoniaLabsAndAutomaticCurb = () => {
    const curbResult = calculatePneumoniaCurb65(pneumoniaAutomaticCurbValues)
    const nextStep = curbResult.score <= 1 ? 'pac_conduta_ambulatorial' : 'pac_ats_idsa_gravidade'
    const newHistory = [...history, currentStep]
    const labAnswer = JSON.stringify({
      decision: nextStep,
      resultados: pneumoniaLabResults,
      criteriosCurbPreenchidosAutomaticamente: pneumoniaAutomaticCurbValues,
      scoreCurb65: curbResult.score,
      destinoCurb65: curbResult.disposition
    })
    const curbAnswer = JSON.stringify({
      decision: nextStep,
      score: curbResult.score,
      destino: curbResult.disposition,
      criterios: pneumoniaAutomaticCurbValues,
      preenchimentoAutomatico: true
    })
    const newAnswers = {
      ...answers,
      [currentStep]: labAnswer,
      pac_curb65_protocolo: curbAnswer
    }
    const newProgress = calculateProgress(nextStep, newHistory)

    setPneumoniaCurbValues(pneumoniaAutomaticCurbValues)
    setCurrentStep(nextStep)
    setHistory(newHistory)
    setAnswers(newAnswers)
    setProgress(newProgress)
    onUpdate(patient.id, nextStep, newHistory, newAnswers, newProgress)
  }

  const buildTVPPrescriptionPreview = useCallback((therapyId: string): TVPPrescriptionPreview => {
    const hasValidWeight = typeof patient.weight === 'number' && patient.weight > 0
    const patientWeight = hasValidWeight ? patient.weight as number : null

    if (therapyId === 'rivaroxabana') {
      return {
        therapyId,
        title: 'Prescrição - Rivaroxabana',
        content: [
          'Fase inicial: 15 mg VO a cada 12h por 21 dias.',
          'Fase de manutenção: 20 mg VO 1x/dia após o 21º dia.',
          'Prevenção estendida (quando indicada): 10 mg VO 1x/dia.',
          'Administrar com alimento e reavaliar risco de sangramento periodicamente.'
        ]
      }
    }

    if (therapyId === 'apixabana') {
      return {
        therapyId,
        title: 'Prescrição - Apixabana',
        content: [
          'Fase inicial: 10 mg VO a cada 12h por 7 dias.',
          'Fase de manutenção: 5 mg VO a cada 12h a partir do 8º dia.',
          'Prevenção estendida (quando indicada): 2,5 mg VO a cada 12h.',
          'Avaliar função renal/hepática e interações medicamentosas.'
        ]
      }
    }

    if (therapyId === 'dabigatrana') {
      return {
        therapyId,
        title: 'Prescrição - Dabigatrana',
        content: [
          'Requer anticoagulação parenteral prévia por 5 a 10 dias.',
          'Após fase parenteral: 150 mg VO a cada 12h.',
          'Manter acompanhamento clínico para sangramento e função renal.',
          'Evitar abrir/triturar cápsulas.'
        ]
      }
    }

    if (therapyId === 'edoxabana') {
      return {
        therapyId,
        title: 'Prescrição - Edoxabana',
        content: [
          'Requer anticoagulação parenteral prévia por 5 a 10 dias.',
          'Dose padrão: 60 mg VO 1x/dia.',
          'Reduzir para 30 mg VO 1x/dia se ClCr 15-50 mL/min ou peso <= 60 kg.',
          'Monitorar risco de sangramento e função renal durante seguimento.'
        ]
      }
    }

    if (therapyId === 'enoxaparina') {
      if (!patientWeight) {
        return {
          therapyId,
          title: 'Prescrição - Enoxaparina',
          content: [
            'Peso não informado no cadastro. Para cálculo individualizado, preencha o peso do paciente.',
            'Esquema terapêutico padrão: 1 mg/kg SC a cada 12h, ou 1,5 mg/kg SC 1x/dia.',
            'Se ClCr < 30 mL/min: preferir 1 mg/kg SC 1x/dia.',
            'Monitorar sangramento, função renal e contagem plaquetária.'
          ]
        }
      }

      const dose12h = Math.round(patientWeight * 1)
      const dose24h = Math.round(patientWeight * 1.5)
      return {
        therapyId,
        title: 'Prescrição - Enoxaparina',
        content: [
          `Peso: ${patientWeight.toFixed(1)} kg.`,
          `Dose terapêutica sugerida: Enoxaparina ${dose12h} mg SC a cada 12h.`,
          `Alternativa: Enoxaparina ${dose24h} mg SC 1x/dia.`,
          `Se ClCr < 30 mL/min: Enoxaparina ${dose12h} mg SC 1x/dia.`,
          'Reavaliar função renal e risco de sangramento diariamente.'
        ]
      }
    }

    if (therapyId === 'hnf') {
      if (!patientWeight) {
        return {
          therapyId,
          title: 'Prescrição - Heparina não fracionada (HNF)',
          content: [
            'Peso não informado no cadastro. Para cálculo individualizado, preencha o peso do paciente.',
            'Esquema padrão: bolus EV 80 U/kg (ou 5.000 U) seguido de infusão contínua 18 U/kg/h.',
            'Preparação da solução: heparina 5.000 U/mL, diluir 5 mL em 245 mL de SF 0,9% (concentração final 100 U/mL).',
            'Ajustar infusão para TTPa alvo de 1,5 a 2,5 vezes o basal, com coleta 6 horas após bolus e após cada ajuste.'
          ]
        }
      }

      const bolusUnits = Math.round(patientWeight * 80)
      const infusionUnitsHour = Math.round(patientWeight * 18)
      const infusionMlHour = (infusionUnitsHour / 100).toFixed(1)
      return {
        therapyId,
        title: 'Prescrição - Heparina não fracionada (HNF)',
        content: [
          `Peso: ${patientWeight.toFixed(1)} kg.`,
          `Bolus inicial: ${bolusUnits} U EV (considerar teto de 5.000 U conforme protocolo institucional).`,
          `Infusão contínua inicial: ${infusionUnitsHour} U/h EV.`,
          `Se diluição padrão 25.000 U em 250 mL (100 U/mL): iniciar em ${infusionMlHour} mL/h.`,
          'Preparação da solução: heparina 5.000 U/mL, diluir 5 mL em 245 mL de SF 0,9% (concentração final 100 U/mL).',
          'Ajustes pelo TTPa (protocolo prático):',
          'TTPa < 35: bolus 80 U/kg e aumentar infusão em 4 U/kg/h.',
          'TTPa 35-45: bolus 40 U/kg e aumentar infusão em 2 U/kg/h.',
          'TTPa 46-60: manter esquema atual (faixa terapêutica local).',
          'TTPa 61-80: reduzir infusão em 2 U/kg/h.',
          'TTPa > 110: pausar infusão por 60 min e reiniciar reduzindo 4 U/kg/h.'
        ]
      }
    }

    return {
      therapyId,
      title: 'Como prescrever varfarina',
      content: [
        'Início concomitante com heparina: iniciar varfarina no mesmo dia da HNF/HBPM.',
        'Dose inicial usual: 5 mg/dia (considerar 10 mg apenas em perfil jovem, baixo risco de sangramento e sem comorbidades relevantes).',
        'Monitorar INR diariamente nos primeiros dias.',
        'Ajuste por INR (resumo prático): INR < 1,5 aumentar dose; INR 2,0-3,0 manter; INR > 3,5 reduzir/omitir e reavaliar risco de sangramento.',
        'Suspender HNF/HBPM somente após pelo menos 5 dias de sobreposição e INR entre 2,0 e 3,0 por 48 horas consecutivas.',
        'Cuidados essenciais: revisar interações medicamentosas/alimentares, orientar sinais de sangramento e adesão.'
      ]
    }
  }, [patient.weight])

  const buildInfluenzaPrescriptionPreview = useCallback((includeOseltamivir: boolean): InfluenzaPrescriptionPreview => {
    const prescriptionItems = buildInfluenzaPrescriptionItems(patient, includeOseltamivir)
    const content = [
      includeOseltamivir
        ? 'Esquema terapêutico ambulatorial para paciente com fatores de risco ou piora clínica, com indicação de oseltamivir.'
        : 'Esquema sintomático ambulatorial para síndrome gripal sem sinal de gravidade e sem indicação imediata de antiviral.',
      '',
      ...prescriptionItems.flatMap((item, index) => [
        `${index + 1}. ${item.medication}`,
        `   Dosagem: ${item.dosage}`,
        `   Frequência: ${item.frequency}`,
        `   Duração: ${item.duration}`,
        item.instructions ? `   Instruções: ${item.instructions}` : '',
        ''
      ]).filter(Boolean),
      'Medidas não farmacológicas:',
      '• Manter hidratação e alimentação adequadas.',
      '• Usar máscara enquanto sintomático, higienizar as mãos, cobrir boca/nariz ao tossir ou espirrar, evitar contato próximo com pessoas vulneráveis e manter ambientes ventilados.',
      '• Reavaliar em 48 a 72 horas ou antes se houver piora clínica.',
      '• Orientar retorno imediato em dispneia, desconforto respiratório, saturação baixa, confusão, vômitos persistentes ou sinais de desidratação.'
    ]

    return {
      title: includeOseltamivir ? 'Prescrição - Influenza com Oseltamivir' : 'Prescrição - Tratamento Sintomático da Síndrome Gripal',
      includeOseltamivir,
      content
    }
  }, [patient])

  const getPersistedInfluenzaPrescriptions = useCallback(() => {
    const freshPatient = patientService.getPatientById(patient.id)
    return (freshPatient?.treatment.prescriptions || patient.treatment.prescriptions || []).filter(
      (item) => item.prescribedBy === 'Fluxograma Influenza'
    )
  }, [patient.id, patient.treatment.prescriptions])

  const goBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1]
      const newHistory = history.slice(0, -1)
      const validAnsweredSteps = new Set(newHistory)
      const newAnswers = Object.fromEntries(
        Object.entries(answers).filter(([stepId]) => validAnsweredSteps.has(stepId))
      )
      const newProgress = calculateProgress(previousStep, newHistory)

      setCurrentStep(previousStep)
      setHistory(newHistory)
      setAnswers(newAnswers)
      setProgress(newProgress)

      onUpdate(patient.id, previousStep, newHistory, newAnswers, newProgress)
    }
  }

  const restart = () => {
    setCurrentStep(flowchart.initialStep)
    setHistory([])
    setAnswers({})
    setProgress(0)
    setGasometryInfoOpen(null)
    setCincinnatiInfoOpen(false)
    setTVPWellsIntroOpen(false)
    setPendingTVPWellsOption(null)
    setTVPConfirmadaOpen(false)
    setPendingTVPConfirmadaOption(null)
    setTVPAnticoagConsiderationsOpen(false)
    setTVPPrescriptionPreview(null)
    setTVPRiskBenefitGuideOpen(false)
    setTVPNoacInfoOpen(null)
    setVarfarinaDietInfoOpen(false)
    setInfluenzaSeveritySigns([])
    setInfluenzaRiskFactors([])
    setInfluenzaWorseningSigns([])
    setInfluenzaICUCriteria([])
    setInfluenzaExamRequestOpen(false)
    setInfluenzaSelectedExams(influenzaDefaultRequestedExams)
    setInfluenzaPrescriptionPreview(null)
    setInfluenzaPrescriptionCopied(false)
    setInfluenzaPrescriptionGeneratedSteps({})
    setInfluenzaPhysicalExam(defaultPneumoniaPhysicalExam())
    setInfluenzaVitalSigns(defaultFlowVitalSigns(patient))
    setTVPPhysicalExam(defaultPneumoniaPhysicalExam())
    setTVPVitalSigns(defaultFlowVitalSigns(patient))
    setTEPPhysicalExam(defaultPneumoniaPhysicalExam())
    setTEPVitalSigns(defaultFlowVitalSigns(patient))
    setPepHivGuideOpen(false)
    setAnsiedadeGuideOpen(false)
    setPneumoniaPhysicalExam(defaultPneumoniaPhysicalExam())
    setPneumoniaVitalSigns(defaultFlowVitalSigns(patient))
    setPneumoniaCrbCriteria([])
    setPneumoniaSelectedExams(pneumoniaInitialLabPackage)
    setPneumoniaLabResults({})
    setPneumoniaRxInfoOpen(false)
    setPneumoniaRxImageOpen(false)
    setPneumoniaCtInfoOpen(false)
    setPneumoniaAtsIdsaMajorCriteria([])
    setPneumoniaAtsIdsaMinorCriteria([])
    setPneumoniaSmartCopCriteria([])
    setPneumoniaDripMajorCriteria([])
    setPneumoniaDripMinorCriteria([])
    setPneumoniaScapCriteria([])
    setPneumoniaSoarCriteria([])
    setPneumoniaSipfValues({ fc: '', pas: '', pf: '' })
    setGasometryDraft({
      ph: '',
      pco2: '',
      hco3: '',
      be: '',
      po2: '',
      sodium: '',
      chloride: '',
      albumin: ''
    })
    setAsthmaInitialDraft({
      sato2: '',
      fr: '',
      fc: '',
      pfe: '',
      paco2: ''
    })
    setAsthmaReevalDraft({
      sato2Re: '',
      frRe: '',
      pfeRe: ''
    })
    setAsthmaFlags({
      usoMusculatura: false,
      incapazFrases: false,
      falaPalavras: false,
      cianose: false,
      confusao: false,
      exaustao: false,
      toraxSilente: false,
      sonolencia: false
    })
    setAsthmaReevalFlags({
      melhoraClinica: false,
      necessidadeBroncoRepetido: false
    })
    setDpocSinaisGravidade([])
    setDpocAnthonisen([])
    setBellCriteriaChecks(defaultBellCriteriaChecks())
    setBellSupportChecks(defaultBellSupportChecks())
    setBellRedFlagChecks(defaultBellRedFlagChecks())
    setBellChiefComplaint('')
    setBellPhysicalExamFindings([])
    setBellPhysicalExamNotes('')
    setBellRamsayInfoOpen(false)
    setBellLagophthalmosInfoOpen(false)
    setBellPhenomenonInfoOpen(false)
    setBellCheekInflationImageOpen(false)
    setSelectedBellHouseGrade('')
    setBellTreatmentTimingOpen(false)
    setBellDocumentCopied(false)
    setClinicalSummaryCopied(false)
    setRabiesBiteImageOpen(false)
    setBellWithin72Hours(null)
    setBellUseCorticosteroid(false)
    setBellAntiviralChoice('none')
    setBellUseEyeCare(false)
    onUpdate(patient.id, flowchart.initialStep, [], {}, 0)
  }

  const currentStepData = flowchart.steps[currentStep]
  useEffect(() => {
    let mounted = true
    getCurrentDoctor()
      .then((doctor) => {
        if (mounted) setDoctorProfile(doctor as DoctorProfile | null)
      })
      .catch((error) => {
        console.warn('Não foi possível carregar o médico responsável do resumo:', error)
        if (mounted) setDoctorProfile(null)
      })
    return () => {
      mounted = false
    }
  }, [])
  const clinicalSummaryData = useMemo(() => {
    return buildClinicalSummary(patient, {
      flowchart,
      currentStep,
      history,
      answers,
      doctor: doctorProfile
    })
  }, [answers, currentStep, doctorProfile, flowchart, history, patient])
  const tvpSelectedLegFromAnswers = useMemo(() => parseTVPSelectedLeg(answers.start), [answers])
  const tvpSelectedLegLabel = tvpSelectedLegFromAnswers === 'left' ? 'Perna Esquerda' : tvpSelectedLegFromAnswers === 'right' ? 'Perna Direita' : tvpSelectedLegFromAnswers === 'other' ? 'Outras Localizações' : ''
  const isTVPLegSelection = flowchart.id === 'tvp' && currentStepData?.id === 'start'
  const isBellSideSelection = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_inicio'
  const isBellPhysicalExamStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_exame_fisico'
  const isBellCriteriaStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_criterios_obrigatorios'
  const isBellSupportStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_suporte_diagnostico'
  const isBellRedFlagsStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_red_flags_ramsay'
  const isBellHouseStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_house_brackmann'
  const isBellTreatmentStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_tratamento_clinico'
  const isBellPrescriptionStep = flowchart.id === 'paralisia_bell' && currentStepData?.id === 'bell_prescricao_cuidados'
  const isBellReferralStep = flowchart.id === 'paralisia_bell' && (currentStepData?.id === 'bell_encaminhamento_neuro' || currentStepData?.id === 'bell_encaminhamento_otorrino')
  const isBellFinalReportStep = flowchart.id === 'paralisia_bell' && [
    'bell_criterios_nao_preenchidos',
    'bell_red_flags_investigar',
    'bell_prescricao_cuidados',
    'bell_encaminhamento_neuro',
    'bell_encaminhamento_otorrino',
    'bell_finalizado'
  ].includes(currentStepData?.id || '')
  const isBellDynamicDocumentStep = isBellPrescriptionStep || isBellReferralStep || isBellFinalReportStep
  const allBellCriteriaChecked = BELL_DIAGNOSTIC_CRITERIA.every((item) => bellCriteriaChecks[item.key])
  const hasBellRedFlagChecked = BELL_RED_FLAGS.some((item) => bellRedFlagChecks[item.key])
  const bellSelectedSideLabel = useMemo(() => {
    const raw = answers.bell_inicio
    if (raw === 'lado_direito') return 'direito'
    if (raw === 'lado_esquerdo') return 'esquerdo'
    try {
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.decision === 'lado_direito') return 'direito'
      if (parsed?.decision === 'lado_esquerdo') return 'esquerdo'
      if (parsed?.ladoAcometido === 'lado_direito') return 'direito'
      if (parsed?.ladoAcometido === 'lado_esquerdo') return 'esquerdo'
    } catch {
      return 'não informado'
    }
    return 'não informado'
  }, [answers.bell_inicio])
  const bellSelectedHouseLabel = useMemo(() => {
    const raw = answers.bell_house_brackmann || selectedBellHouseGrade
    try {
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.houseBrackmannLabel) return parsed.houseBrackmannLabel
      if (parsed?.houseBrackmann) return bellHouseGradeLabels[parsed.houseBrackmann] || 'não informado'
    } catch {}
    return bellHouseGradeLabels[raw] || 'não informado'
  }, [answers.bell_house_brackmann, selectedBellHouseGrade])
  const bellSelectedHouseValue = useMemo(() => {
    const raw = answers.bell_house_brackmann || selectedBellHouseGrade
    try {
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.houseBrackmann) return parsed.houseBrackmann as string
    } catch {}
    return raw
  }, [answers.bell_house_brackmann, selectedBellHouseGrade])
  const bellIsNormalFunction = bellSelectedHouseValue === 'house_i'
  const bellHasIncompleteEyeClosure = ['house_iv', 'house_v', 'house_vi'].includes(bellSelectedHouseValue)
  const bellAntiviralMayBenefit = ['house_iv', 'house_v', 'house_vi'].includes(bellSelectedHouseValue)
  const bellAntiviralStronglyConsider = ['house_v', 'house_vi'].includes(bellSelectedHouseValue)
  const bellTreatmentSelection = useMemo(() => ({
    houseBrackmann: bellSelectedHouseValue,
    within72Hours: bellWithin72Hours,
    corticosteroid: bellUseCorticosteroid,
    antiviral: bellAntiviralChoice,
    eyeCare: bellUseEyeCare
  }), [bellAntiviralChoice, bellSelectedHouseValue, bellUseCorticosteroid, bellUseEyeCare, bellWithin72Hours])
  const bellAdmissionDateLabel = useMemo(() => {
    const date = patient.admission?.date ? new Date(patient.admission.date) : null
    if (!date || Number.isNaN(date.getTime())) return 'data não informada'
    return date.toLocaleDateString('pt-BR')
  }, [patient.admission?.date])
  const parseBellAnswer = useCallback((stepId: string) => {
    const raw = answers[stepId]
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return { decision: raw }
    }
  }, [answers])
  const getBellSelectedLabels = <T extends string>(
    selectedKeys: unknown,
    items: Array<{ key: T; label: string }>
  ) => {
    if (!Array.isArray(selectedKeys)) return []
    return items.filter((item) => selectedKeys.includes(item.key)).map((item) => item.label)
  }
  const bellSavedTreatmentSelection = useMemo(() => {
    const parsed = parseBellAnswer('bell_tratamento_clinico')
    if (parsed && typeof parsed === 'object' && 'houseBrackmann' in parsed) return parsed
    return bellTreatmentSelection
  }, [bellTreatmentSelection, parseBellAnswer])
  const bellClinicalReportText = useMemo(() => {
    const physicalExamAnswer = parseBellAnswer('bell_exame_fisico')
    const criteriaAnswer = parseBellAnswer('bell_criterios_obrigatorios')
    const supportAnswer = parseBellAnswer('bell_suporte_diagnostico')
    const redFlagsAnswer = parseBellAnswer('bell_red_flags_ramsay')
    const sideAnswer = parseBellAnswer('bell_inicio')
    const chiefComplaintText = typeof sideAnswer?.queixaPrincipal === 'string' && sideAnswer.queixaPrincipal.trim()
      ? sideAnswer.queixaPrincipal.trim()
      : bellChiefComplaint.trim() || 'queixa de alteração facial referida pelo paciente'
    const selectedPhysicalExamLabels = getBellSelectedLabels(
      physicalExamAnswer?.achadosSelecionados || bellPhysicalExamFindings,
      BELL_PHYSICAL_EXAM_GROUPS.flatMap((group) => group.items)
    )
    const selectedCriteriaLabels = getBellSelectedLabels(
      criteriaAnswer?.criteriosSelecionados || BELL_DIAGNOSTIC_CRITERIA.filter((item) => bellCriteriaChecks[item.key]).map((item) => item.key),
      BELL_DIAGNOSTIC_CRITERIA
    )
    const selectedSupportLabels = getBellSelectedLabels(
      supportAnswer?.criteriosSuporteSelecionados || BELL_SUPPORT_CRITERIA.filter((item) => bellSupportChecks[item.key]).map((item) => item.key),
      BELL_SUPPORT_CRITERIA
    )
    const selectedRedFlagLabels = getBellSelectedLabels(
      redFlagsAnswer?.redFlagsSelecionadas || BELL_RED_FLAGS.filter((item) => bellRedFlagChecks[item.key]).map((item) => item.key),
      BELL_RED_FLAGS
    )
    const treatmentData = bellSavedTreatmentSelection
    const selectedAntiviral = treatmentData?.antiviral || 'none'
    const selectedAntiviralLabel = selectedAntiviral === 'valaciclovir'
      ? 'Valaciclovir'
      : selectedAntiviral === 'aciclovir'
        ? 'Aciclovir'
        : selectedAntiviral === 'famciclovir'
          ? 'Famciclovir'
          : 'Não selecionado'
    const proseList = (items: string[]) => {
      if (items.length === 0) return ''
      if (items.length === 1) return items[0]
      return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
    }
    const hasAllCriteria = Boolean(criteriaAnswer?.todosCriteriosPresentes || allBellCriteriaChecked)
    const hasRedFlags = Boolean(redFlagsAnswer?.possuiRedFlag || hasBellRedFlagChecked)
    const examSentence = selectedPhysicalExamLabels.length > 0
      ? `No exame físico direcionado, foram registrados os seguintes achados: ${proseList(selectedPhysicalExamLabels)}.`
      : 'No exame físico direcionado, não foram registrados achados objetivos no checklist estruturado.'
    const examObservation = physicalExamAnswer?.observacoes || bellPhysicalExamNotes
      ? ` Como observação adicional, consta: ${physicalExamAnswer?.observacoes || bellPhysicalExamNotes}.`
      : ''
    const criteriaSentence = hasAllCriteria
      ? `A avaliação dos critérios obrigatórios sustenta o padrão clínico de paralisia facial periférica unilateral aguda, com ${selectedCriteriaLabels.length > 0 ? proseList(selectedCriteriaLabels) : 'critérios obrigatórios registrados como presentes'}.`
      : `A avaliação dos critérios obrigatórios ficou incompleta${selectedCriteriaLabels.length > 0 ? `, apesar do registro de ${proseList(selectedCriteriaLabels)}` : ''}. Dessa forma, o quadro não deve ser assumido como Paralisia de Bell típica até investigação complementar.`
    const supportSentence = selectedSupportLabels.length > 0
      ? `Foram ainda observados elementos de suporte compatíveis com acometimento do nervo facial, incluindo ${proseList(selectedSupportLabels)}.`
      : 'Não foram registrados critérios de suporte adicionais; a interpretação permanece baseada nos critérios obrigatórios e na ausência ou presença de sinais de alerta.'
    const redFlagSentence = hasRedFlags
      ? `Durante a triagem de segurança, foram identificados sinais de alerta: ${selectedRedFlagLabels.length > 0 ? proseList(selectedRedFlagLabels) : 'red flags registradas no fluxo'}. Esses achados tornam inadequado tratar o caso como Paralisia de Bell isolada sem investigação etiológica dirigida.`
      : 'Na triagem de segurança, não foram registrados sinais de alerta ou elementos sugestivos de Ramsay Hunt no checklist aplicado.'
    const treatmentSentence = treatmentData?.houseBrackmann
      ? `A gravidade funcional foi classificada pela escala de House-Brackmann como ${bellHouseGradeLabels[treatmentData.houseBrackmann] || bellSelectedHouseLabel}. A janela terapêutica foi registrada como ${treatmentData.within72Hours === true ? 'até 72 horas' : treatmentData.within72Hours === false ? 'superior a 72 horas' : 'não informada'}. Na conduta, ${treatmentData.corticosteroid ? 'foi selecionado corticosteroide' : 'não foi selecionado corticosteroide'}, ${selectedAntiviral === 'none' ? 'sem antiviral associado' : `com associação de ${selectedAntiviralLabel}`} e ${treatmentData.eyeCare ? 'com orientação de proteção ocular' : 'sem proteção ocular selecionada no fluxo'}.`
      : 'A classificação House-Brackmann e a conduta medicamentosa não foram registradas neste caminho do fluxo.'
    const conclusionSentence = currentStepData?.id === 'bell_criterios_nao_preenchidos'
      ? 'Conclusão: os critérios mínimos para Paralisia de Bell típica não foram preenchidos. Recomenda-se reavaliar o padrão da paralisia facial e investigar causas centrais, infecciosas, otológicas, estruturais ou sistêmicas conforme história e exame físico.'
      : currentStepData?.id === 'bell_red_flags_investigar'
        ? 'Conclusão: há sinais de alerta ou suspeita de diagnóstico alternativo associado. O caso deve ser conduzido como paralisia facial periférica atípica até esclarecimento, com investigação direcionada e avaliação especializada conforme a suspeita predominante.'
        : hasAllCriteria && !hasRedFlags
          ? 'Conclusão: o conjunto clínico é compatível com Paralisia de Bell típica, sem sinais de alarme registrados no fluxo. A conduta deve priorizar tratamento precoce quando indicado, proteção ocular e seguimento clínico para monitorar recuperação funcional.'
          : 'Conclusão: os dados disponíveis exigem cautela diagnóstica. Recomenda-se complementar a avaliação clínica antes de firmar Paralisia de Bell como hipótese isolada.'
    const followUpSentence = currentStepData?.id === 'bell_encaminhamento_neuro'
      ? 'Foi indicado encaminhamento à Neurologia para seguimento da recuperação facial, avaliação de necessidade de neuroimagem ou eletroneuromiografia, exclusão de diagnósticos diferenciais e orientação de reabilitação quando indicada.'
      : currentStepData?.id === 'bell_encaminhamento_otorrino'
        ? 'Foi indicado encaminhamento à Otorrinolaringologia para avaliação de possível etiologia otológica, orelha média/mastoide, sintomas cocleovestibulares e necessidade de exames complementares.'
        : currentStepData?.id === 'bell_prescricao_cuidados'
          ? 'Foram registradas prescrição e orientações de cuidados, com atenção especial à proteção ocular e aos sinais de retorno.'
          : 'Orientar retorno imediato diante de piora neurológica, alteração de consciência, cefaleia intensa, febre, dor otológica importante, vesículas, vertigem, hipoacusia, sintomas oculares ou progressão fora do padrão esperado.'
    const referralSentence = isBellReferralStep
      ? currentStepData?.id === 'bell_encaminhamento_otorrino'
        ? 'Solicito avaliação pela Otorrinolaringologia para investigação de causa otológica, avaliação de orelha média e mastoide, definição de exames complementares e seguimento funcional.'
        : 'Solicito avaliação pela Neurologia para acompanhamento da recuperação facial, definição de necessidade de neuroimagem ou eletroneuromiografia, exclusão de causas alternativas e orientação de reabilitação quando indicada.'
      : ''

    const lines = [
      'RELATÓRIO MÉDICO - PARALISIA FACIAL',
      '',
      `Paciente ${patient.name || 'não identificado'}, atendido em ${bellAdmissionDateLabel}${patient.admission?.time ? ` às ${patient.admission.time}` : ''}, com queixa principal de "${chiefComplaintText}". Durante a avaliação, foi observado acometimento facial do lado ${bellSelectedSideLabel}, motivo pelo qual foi realizada investigação estruturada para diferenciar paralisia facial central de periférica, documentar achados do VII par craniano, verificar critérios diagnósticos obrigatórios para Paralisia de Bell, pesquisar sinais de suporte e excluir sinais de alerta, incluindo possibilidade de síndrome de Ramsay Hunt ou outras etiologias.`,
      '',
      `${examSentence}${examObservation}`,
      '',
      `${criteriaSentence} ${supportSentence}`,
      '',
      redFlagSentence,
      '',
      treatmentSentence,
      '',
      `${conclusionSentence} ${followUpSentence}`,
      ...(referralSentence ? ['', referralSentence] : []),
      '',
      clinicalSummaryData.doctorSignature,
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`
    ]

    return lines.join('\n')
  }, [
    allBellCriteriaChecked,
    bellAdmissionDateLabel,
    bellChiefComplaint,
    bellCriteriaChecks,
    bellPhysicalExamFindings,
    bellPhysicalExamNotes,
    bellRedFlagChecks,
    bellSelectedHouseLabel,
    bellSelectedSideLabel,
    bellSupportChecks,
    bellSavedTreatmentSelection,
    clinicalSummaryData.doctorSignature,
    currentStepData?.id,
    hasBellRedFlagChecked,
    isBellReferralStep,
    parseBellAnswer,
    patient.admission?.time,
    patient.name
  ])
  const bellPrescriptionText = useMemo(() => {
    const treatmentData = bellSavedTreatmentSelection
    const savedHouseLabel = bellHouseGradeLabels[treatmentData?.houseBrackmann] || bellSelectedHouseLabel
    const savedIsNormalFunction = treatmentData?.houseBrackmann === 'house_i'
    const savedUseCorticosteroid = Boolean(treatmentData?.corticosteroid)
    const savedAntiviralChoice = (treatmentData?.antiviral || 'none') as BellAntiviralChoice
    const savedUseEyeCare = Boolean(treatmentData?.eyeCare)
    const lines = ['Prescrição e cuidados - Paralisia de Bell', '', `Classificação: House-Brackmann ${savedHouseLabel}.`]
    let item = 1
    if (savedIsNormalFunction) {
      lines.push(`${item++}. Função facial normal (House-Brackmann I): sem indicação de tratamento farmacológico para Paralisia de Bell.`)
    } else if (savedUseCorticosteroid) {
      lines.push(`${item++}. Prednisona 60 mg VO 1x/dia por 5 dias, seguida de redução de 10 mg/dia até completar 10 dias.`)
    } else {
      lines.push(`${item++}. Corticosteroide não selecionado pelo médico; registrar justificativa clínica.`)
    }

    const antiviralLines: Record<Exclude<BellAntiviralChoice, 'none'>, string> = {
      valaciclovir: 'Valaciclovir 1.000 mg VO a cada 8 horas por 7 dias.',
      aciclovir: 'Aciclovir 400 mg VO cinco vezes ao dia por 10 dias.',
      famciclovir: 'Famciclovir 500 mg VO a cada 8 horas por 7 dias.'
    }
    if (savedAntiviralChoice !== 'none') lines.push(`${item++}. ${antiviralLines[savedAntiviralChoice]} Usar somente associado ao corticosteroide.`)

    if (savedUseEyeCare) {
      lines.push(`${item++}. Lágrimas artificiais sem conservantes: 1 gota no olho acometido a cada 1 a 2 horas durante o dia.`)
      lines.push(`${item++}. Pomada lubrificante oftálmica à noite.`)
      lines.push(`${item++}. Oclusão palpebral noturna cuidadosa com fita hipoalergênica e óculos de proteção contra vento e poeira.`)
      lines.push(`${item++}. Avaliação oftalmológica se dor ocular, hiperemia, fotofobia, alteração visual ou sinais de exposição/lesão corneana.`)
    }
    return lines.join('\n')
  }, [bellSavedTreatmentSelection, bellSelectedHouseLabel])
  const currentBellDocumentText = isBellTreatmentStep
    ? bellPrescriptionText
    : isBellPrescriptionStep
      ? `${bellClinicalReportText}\n\nPRESCRIÇÃO E CUIDADOS\n\n${bellPrescriptionText}`
      : bellClinicalReportText
  const finalClinicalReportText = flowchart.id === 'paralisia_bell'
    ? currentBellDocumentText
    : clinicalSummaryData.continuousText
  const copyFinalClinicalReportText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(finalClinicalReportText)
      setClinicalSummaryCopied(true)
      setTimeout(() => setClinicalSummaryCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar resumo clínico:', error)
      alert('Não foi possível copiar o resumo clínico. Tente novamente.')
    }
  }, [finalClinicalReportText])
  const copyBellDocumentText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentBellDocumentText)
      setBellDocumentCopied(true)
      setTimeout(() => setBellDocumentCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar documento da Paralisia de Bell:', error)
      alert('Não foi possível copiar o texto. Tente novamente.')
    }
  }, [currentBellDocumentText])
  const handleGenerateBellTreatmentPrescription = () => {
    const prescriptionItems = []
    if (bellUseCorticosteroid && !bellIsNormalFunction) {
      prescriptionItems.push({
        medication: 'Prednisona',
        dosage: '60 mg VO',
        frequency: '1 vez ao dia',
        duration: '10 dias com desmame',
        instructions: 'Usar 60 mg/dia por 5 dias e reduzir 10 mg/dia até completar 10 dias. Iniciar preferencialmente nas primeiras 72 horas.',
        prescribedBy: 'Fluxograma Paralisia de Bell'
      })
    }
    const antiviralPrescriptions = {
      valaciclovir: { medication: 'Valaciclovir', dosage: '1.000 mg VO', frequency: 'a cada 8 horas', duration: '7 dias' },
      aciclovir: { medication: 'Aciclovir', dosage: '400 mg VO', frequency: '5 vezes ao dia', duration: '10 dias' },
      famciclovir: { medication: 'Famciclovir', dosage: '500 mg VO', frequency: 'a cada 8 horas', duration: '7 dias' }
    }
    if (bellAntiviralChoice !== 'none') {
      prescriptionItems.push({
        ...antiviralPrescriptions[bellAntiviralChoice],
        instructions: 'Associar ao corticosteroide; não utilizar antiviral isoladamente. Ajustar à função renal quando aplicável.',
        prescribedBy: 'Fluxograma Paralisia de Bell'
      })
    }
    if (bellUseEyeCare) {
      prescriptionItems.push({
        medication: 'Lágrimas artificiais sem conservantes',
        dosage: '1 gota no olho acometido',
        frequency: 'a cada 1 a 2 horas durante o dia',
        duration: 'enquanto houver lagoftalmo ou ressecamento ocular',
        instructions: 'Associar proteção ocular, pomada lubrificante à noite e oclusão palpebral noturna quando necessário.',
        prescribedBy: 'Fluxograma Paralisia de Bell'
      })
      prescriptionItems.push({
        medication: 'Pomada lubrificante oftálmica',
        dosage: 'aplicar no olho acometido',
        frequency: 'à noite',
        duration: 'enquanto houver exposição ocular',
        instructions: 'Usar antes da oclusão palpebral noturna com fita hipoalergênica, se indicado.',
        prescribedBy: 'Fluxograma Paralisia de Bell'
      })
    }
    patientService.replacePrescriptionsByPrescriber(
      patient.id,
      'Fluxograma Paralisia de Bell',
      prescriptionItems
    )

    setBellDocumentCopied(false)
    handleAnswer('bell_prescricao_cuidados', JSON.stringify(bellTreatmentSelection))
  }
  const isTVPClinicalEvaluation = flowchart.id === 'tvp' && currentStepData?.id === 'avaliacao_clinica'
  const isTVPWellsScore = flowchart.id === 'tvp' && currentStepData?.id === 'wells_score'
  const isTVPContraCheck = flowchart.id === 'tvp' && currentStepData?.id === 'checar_contra_anticoagulacao'
  const isTVPTreatmentInitial = flowchart.id === 'tvp' && currentStepData?.id === 'tratamento_inicial'
  const isTVPWaitingForVascularStep = flowchart.id === 'tvp' && currentStepData?.id === 'tvp_aguarda_avaliacao_vascular'
  const hasTVPICUDisposition = flowchart.id === 'tvp' && isTVPICUDisposition(currentStep, history)
  const availableTVPTherapeuticOptions = tvpTherapeuticOptions.filter(
    (item) => item.id !== 'hnf' || hasTVPICUDisposition
  )
  const availableSelectedTherapies = selectedTherapies.filter(
    (therapyId) => therapyId !== 'hnf' || hasTVPICUDisposition
  )
  const isTVPVascularReferralStep = flowchart.id === 'tvp' && [
    'encaminhamento_urgente',
    'tvp_urgencia_vascular_concluida'
  ].includes(currentStepData?.id || '')
  const tvpReferralSymptoms = selectedClinicalFindings.filter((item) => tvpClassicSigns.includes(item))
  const tvpReferralRiskFactors = [
    ...selectedWellsCriteria.map((criterionId) => tvpWellsCriteria.find((item) => item.id === criterionId)?.text),
    ...selectedClinicalFindings.filter((item) => /imobilização|cirurgia|trauma|câncer|gravidez|estrogênios|trombofilia|TVP\/TEV/i.test(item))
  ].filter((item): item is string => Boolean(item))
  const tvpReferralTherapies = availableSelectedTherapies
    .map((therapyId) => tvpTherapeuticOptions.find((item) => item.id === therapyId))
    .filter((item): item is (typeof tvpTherapeuticOptions)[number] => Boolean(item))
  const tvpReferralHasEdema = selectedClinicalFindings.some((item) => /edema|aumento da circunferência/i.test(item))
  const tvpReferralHasAsymmetry = selectedClinicalFindings.some((item) => /assimétrico|lado contralateral|lado oposto/i.test(item))
  const tvpReferralHasVenousPain = selectedClinicalFindings.some((item) => /trajeto venoso|palpação profunda/i.test(item))
  const tvpReferralHasPreservedPulses = selectedClinicalFindings.some((item) => /pulsos arteriais preservados/i.test(item))
  const tvpReferralHasIschemia = selectedClinicalFindings.some((item) => /cianose|palidez|flegmasia|ameaça ao membro/i.test(item))
  const tvpReferralDdimer = answers.baixa_probabilidade === 'ddimer_positive'
    ? 'positivo'
    : answers.baixa_probabilidade === 'ddimer_negative'
      ? 'negativo'
      : 'não realizado ou não informado'
  const tvpPocusResult = answers.pocus_resultado_pre_d_dimero || answers.us_compressiva
  const tvpReferralUltrasound = tvpPocusResult === 'us_positive' || answers.repetir_us === 'repeat_positive'
    ? 'POCUS compressivo de 3 pontos positivo para TVP, com veia não compressível.'
    : tvpPocusResult === 'us_negative' || answers.repetir_us === 'repeat_negative'
      ? 'POCUS compressivo de 3 pontos negativo nas janelas avaliadas.'
      : tvpPocusResult === 'us_inconclusive'
        ? 'POCUS compressivo de 3 pontos inconclusivo ou tecnicamente limitado.'
        : 'Resultado não informado no fluxo.'
  const persistedTVPClinicalFindings = useMemo(() => {
    try {
      const savedClinicalEvaluation = JSON.parse(answers.avaliacao_clinica || '{}')
      return Array.isArray(savedClinicalEvaluation?.sinaisEAchados)
        ? savedClinicalEvaluation.sinaisEAchados.filter((item: unknown): item is string => typeof item === 'string')
        : []
    } catch {
      return []
    }
  }, [answers.avaliacao_clinica])
  const activeTVPClinicalFindings: string[] = isTVPClinicalEvaluation
    ? selectedClinicalFindings
    : persistedTVPClinicalFindings
  const hasTVPAlertSignSelected = useMemo(
    () => activeTVPClinicalFindings.some((item) => tvpAlertSigns.includes(item)),
    [activeTVPClinicalFindings]
  )
  const hasTVPVascularAlertSelected = useMemo(
    () => activeTVPClinicalFindings.some((item) => tvpVascularSurgeryAlertSigns.includes(item)),
    [activeTVPClinicalFindings]
  )
  const hasTVPRespiratoryAlertSelected = useMemo(
    () => activeTVPClinicalFindings.some((item) => tvpRespiratoryTEPAlertSigns.includes(item)),
    [activeTVPClinicalFindings]
  )
  const isAVCCincinnatiStep = flowchart.id === 'avc' && currentStepData?.id === 'avaliacao_cincinnati_fast'
  const wellsScoreTotal = selectedWellsCriteria.reduce((acc, criterionId) => {
    const criterion = tvpWellsCriteria.find(item => item.id === criterionId)
    return acc + (criterion?.score || 0)
  }, 0)
  const wellsRisk = wellsScoreTotal <= 0 ? 'baixa' : wellsScoreTotal <= 2 ? 'moderada' : 'alta'
  const wellsNextStep = wellsScoreTotal <= 0 ? 'pocus_antes_d_dimero' : 'moderada_probabilidade'
  const wellsDecisionValue = wellsScoreTotal <= 0 ? 'low' : wellsScoreTotal <= 2 ? 'moderate' : 'high'
  const tvpWellsDestination = hasTVPAlertSignSelected ? 'pocus_antes_d_dimero' : wellsNextStep
  const tvpWellsDecisionValue = hasTVPAlertSignSelected ? 'alerta_investigacao_obrigatoria' : wellsDecisionValue
  const hasAbsoluteContraindication = selectedContraindications.some(item => item.startsWith('abs_'))
  const hasRelativeContraindication = selectedContraindications.some(item => item.startsWith('rel_'))
  const hasSelectedTherapy = availableSelectedTherapies.length > 0
  const isSectionOpen = (key: string, defaultValue = true) => sectionOpen[key] ?? defaultValue
  const toggleSection = (key: string) => setSectionOpen(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))
  const isGasometryFlow = flowchart.id === 'gasometria'
  const isAsthmaFlow = flowchart.id === 'asthma'
  const isAsthmaStartStep = flowchart.id === 'asthma' && currentStepData?.id === 'asma_tipo'
  const isInfluenzaSeverityStep = flowchart.id === 'influenza' && currentStepData?.id === 'influenza_sinais_gravidade'
  const isInfluenzaRiskStep = flowchart.id === 'influenza' && currentStepData?.id === 'influenza_fatores_risco'
  const isInfluenzaICUStep = flowchart.id === 'influenza' && currentStepData?.id === 'influenza_criterios_uti'
  const isInfluenzaPhysicalExamStep = flowchart.id === 'influenza' && currentStepData?.id === 'influenza_exame_fisico'
  const isTVPPhysicalExamStep = flowchart.id === 'tvp' && currentStepData?.id === 'tvp_exame_fisico'
  const isTEPPhysicalExamStep = flowchart.id === 'tep' && currentStepData?.id === 'tep_exame_fisico'
  const isTEPAssessmentStep = flowchart.id === 'tep' && ['tep_wells', 'tep_perc', 'tep_years', 'tep_spesi', 'tep_categoria', 'tep_tratamento', 'tep_trombolise_contra'].includes(currentStepData?.id || '')
  const isInfluenzaViralPanelStep = flowchart.id === 'influenza' && ['influenza_painel_viral_enfermaria', 'influenza_painel_viral_uti'].includes(currentStepData?.id || '')
  const isInfluenzaAmbulatoryConductStep = flowchart.id === 'influenza' && ['influenza_ambulatorial_sintomaticos', 'influenza_ambulatorial_oseltamivir'].includes(currentStepData?.id || '')
  const isInfluenzaAmbulatoryFinalStep = isInfluenzaAmbulatoryConductStep
  const isPneumoniaPsiStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_calcular_psi'
  const isPneumoniaCurbStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_calcular_curb65'
  const isPneumoniaIntroStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_inicio'
  const isPneumoniaPhysicalExamStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_exame_fisico'
  const isPneumoniaCrbStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_crb65_triagem'
  const isPneumoniaExamRequestStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_solicitacao_exames'
  const isPneumoniaLabResultsStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_resultados_exames'
  const isPneumoniaCurbProtocolStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_curb65_protocolo'
  const isPneumoniaAtsIdsaStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_ats_idsa_gravidade'
  const isPneumoniaDripStep = flowchart.id === 'pneumonia' && ['pac_drip_enfermaria', 'pac_drip_uti'].includes(currentStepData?.id || '')
  const isPneumoniaSmartCopStep = flowchart.id === 'pneumonia' && ['pac_smartcop_enfermaria', 'pac_smartcop_uti'].includes(currentStepData?.id || '')
  const isPneumoniaAmbulatoryConductStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_conduta_ambulatorial'
  const isPneumoniaWardDestinationStep = flowchart.id === 'pneumonia' && currentStepData?.id === 'pac_destino_enfermaria'
  const isPneumoniaAmbulatoryPrescriptionStep = isPneumoniaAmbulatoryConductStep
  const currentRespiratoryVitalSigns = isTEPPhysicalExamStep
    ? tepVitalSigns
    : isTVPPhysicalExamStep
    ? tvpVitalSigns
    : isInfluenzaPhysicalExamStep
      ? influenzaVitalSigns
      : pneumoniaVitalSigns
  const updateCurrentRespiratoryVitalSign = isTEPPhysicalExamStep
    ? updateTEPVitalSign
    : isTVPPhysicalExamStep
    ? updateTVPVitalSign
    : isInfluenzaPhysicalExamStep
      ? updateInfluenzaVitalSign
      : updatePneumoniaVitalSign
  const isSinusitisPrescriptionFinalStep = flowchart.id === 'sinusite' && ['rino_alergica', 'rino_viral', 'rino_bacteriana', 'rino_reavaliar_sem_antibiotico'].includes(currentStepData?.id || '')
  const isFaringoamigdalitePrescriptionFinalStep = flowchart.id === 'faringoamigdalite' && ['faringo_alta_sintomatica', 'faringo_considerar_antibiotico', 'faringo_bacteriana_antibiotico'].includes(currentStepData?.id || '')
  const isMonoartritePrescriptionFinalStep = flowchart.id === 'monoartrite' && ['mono_gota_tratamento', 'mono_artrite_septica_internacao'].includes(currentStepData?.id || '')
  const isAnsiedadeMedicationStep = flowchart.id === 'crise_ansiedade' && currentStepData?.id === 'ansiedade_medicamentosa'
  const isVertigemPrescriptionFinalStep = flowchart.id === 'sindrome_vertiginosa' && ['vertigem_neurite_vestibular', 'vertigem_vppb_hipotensao'].includes(currentStepData?.id || '')
  const isCefaleiaPrescriptionFinalStep = flowchart.id === 'cefaleia' && ['cefaleia_tensional', 'cefaleia_migranea', 'cefaleia_salvas'].includes(currentStepData?.id || '')
  const isAgitacaoPrescriptionFinalStep = flowchart.id === 'agitacao_psicomotora' && ['agitacao_moderada_medicacao_oral', 'agitacao_grave_contencao_quimica'].includes(currentStepData?.id || '')
  const isPepHivPrescriptionFinalStep = flowchart.id === 'pep_hiv' && currentStepData?.id === 'pep_iniciar'
  const isAnaphylaxisCriteriaStep = flowchart.id === 'anafilaxia' && currentStepData?.id === 'ana_criterios_wao'
  const isAnaphylaxisAdrenalineStep = flowchart.id === 'anafilaxia' && currentStepData?.id === 'ana_adrenalina_im'
  const isAnaphylaxisAdjunctStep = flowchart.id === 'anafilaxia' && currentStepData?.id === 'ana_tratamento_adjunto'
  const isAnaphylaxisDischargeStep = flowchart.id === 'anafilaxia' && currentStepData?.id === 'ana_observacao_alta'
  const isAnaphylaxisRepeatAdrenalineFinalStep = flowchart.id === 'anafilaxia' && currentStepData?.id === 'ana_repetir_adrenalina_internacao'
  const isPancreatitisBisapStep = flowchart.id === 'pancreatitis' && currentStepData?.id === 'pan_bisap'
  const isPancreatitisMarshallStep = flowchart.id === 'pancreatitis' && currentStepData?.id === 'pan_marshall_atlanta'
  const isPancreatitisTreatmentFinalStep = flowchart.id === 'pancreatitis' && ['pan_leve', 'pan_moderada', 'pan_grave', 'pan_uti'].includes(currentStepData?.id || '')
  const isCholangitisDiagnosisStep = flowchart.id === 'cholangitis' && currentStepData?.id === 'colangite_tokyo_diagnostico'
  const isCholangitisSeverityStep = flowchart.id === 'cholangitis' && currentStepData?.id === 'colangite_tokyo_gravidade'
  const isCholangitisTreatmentFinalStep = flowchart.id === 'cholangitis' && ['colangite_leve', 'colangite_moderada', 'colangite_grave', 'coledocolitiase_sem_colangite'].includes(currentStepData?.id || '')
  const isCholecystitisSeverityStep = flowchart.id === 'cholecystitis' && currentStepData?.id === 'cole_tokyo_gravidade'
  const isCholecystitisTreatmentFinalStep = flowchart.id === 'cholecystitis' && ['cole_leve', 'cole_moderada', 'cole_grave'].includes(currentStepData?.id || '')
  const isAppendicitisAlvaradoStep = flowchart.id === 'appendicitis' && currentStepData?.id === 'apend_alvarado'
  const isAppendicitisTreatmentFinalStep = flowchart.id === 'appendicitis' && ['apend_cirurgia_emergencia', 'apend_baixo_risco', 'apend_moderado_risco', 'apend_alto_risco'].includes(currentStepData?.id || '')
  const isLombalgiaRiskStep = flowchart.id === 'lombalgia' && currentStepData?.id === 'lomb_red_flags'
  const isLombalgiaConservativeFinalStep = flowchart.id === 'lombalgia' && currentStepData?.id === 'lomb_conservador'
  const sinusitisCurrentEtiology: SinusitisEtiology = currentStepData?.id === 'rino_bacteriana'
    ? 'bacterial'
    : currentStepData?.id === 'rino_alergica'
      ? 'allergic'
      : 'viral'
  const faringoamigdaliteCurrentDisposition: FaringoamigdaliteDisposition = currentStepData?.id === 'faringo_bacteriana_antibiotico'
    ? 'bacterial'
    : currentStepData?.id === 'faringo_considerar_antibiotico'
      ? 'consider_antibiotic'
      : 'symptomatic'
  const monoartriteCurrentDisposition: MonoartriteDisposition = currentStepData?.id === 'mono_artrite_septica_internacao'
    ? 'septic'
    : 'gout'
  const vertigemCurrentDisposition: VertigemDisposition = currentStepData?.id === 'vertigem_neurite_vestibular'
    ? 'neurite'
    : 'vppb'
  const cefaleiaCurrentDisposition: CefaleiaDisposition = currentStepData?.id === 'cefaleia_migranea'
    ? 'migranea'
    : currentStepData?.id === 'cefaleia_salvas'
      ? 'salvas'
      : 'tensional'
  const agitacaoCurrentDisposition: AgitacaoDisposition = currentStepData?.id === 'agitacao_grave_contencao_quimica'
    ? 'grave_im'
    : 'moderada_oral'
  const pneumoniaPsiResult = useMemo(() => calculatePneumoniaPsi(pneumoniaPsiValues, patient), [patient, pneumoniaPsiValues])
  const pneumoniaCurbResult = useMemo(() => calculatePneumoniaCurb65(pneumoniaCurbValues), [pneumoniaCurbValues])
  const pneumoniaResultExams = useMemo(
    () => pneumoniaSelectedExams.filter((exam) => pneumoniaLabResultConfig[exam]),
    [pneumoniaSelectedExams]
  )
  const pneumoniaAutomaticCurbValues = useMemo<PneumoniaCurbValues>(() => {
    const savedPhysicalExam = parseSavedPhysicalExamAnswer(answers.pac_exame_fisico, patient)
    const savedCrbCriteria = parseSavedPneumoniaCrbCriteria(answers.pac_crb65_triagem)
    const combinedCrbCriteria = new Set([...savedCrbCriteria, ...pneumoniaCrbCriteria])
    const sourceVitalSigns = answers.pac_exame_fisico ? savedPhysicalExam.sinaisVitais : pneumoniaVitalSigns
    const sourcePhysicalExam = answers.pac_exame_fisico ? savedPhysicalExam.exameFisico : pneumoniaPhysicalExam
    const urea = parseClinicalNumber(pneumoniaLabResults.Ureia)
    const respiratoryRate = parseClinicalNumber(sourceVitalSigns?.respiratoryRate)
    const bloodPressure = parseBloodPressure(sourceVitalSigns?.bloodPressure)
    const patientAge = getPatientAgeForScore(patient)
    const hasConfusion = (sourcePhysicalExam.neuro.glasgow != null && sourcePhysicalExam.neuro.glasgow < 15)
      || Boolean(sourcePhysicalExam.neuro.altered?.trim())
      || combinedCrbCriteria.has('Confusão mental nova')
    const hasHighRespiratoryRate = combinedCrbCriteria.has('Frequência respiratória ≥ 30 irpm')
      || (respiratoryRate != null && respiratoryRate >= 30)
    const hasLowBloodPressure = combinedCrbCriteria.has('PAS < 90 mmHg ou PAD ≤ 60 mmHg')
      || (bloodPressure.systolic != null && bloodPressure.systolic < 90)
      || (bloodPressure.diastolic != null && bloodPressure.diastolic <= 60)
    const hasAge65 = combinedCrbCriteria.has('Idade ≥ 65 anos')
      || (patientAge != null && patientAge >= 65)

    return {
      confusaoMental: hasConfusion,
      ureiaMaior43: urea != null && urea > 43,
      frMaior30: hasHighRespiratoryRate,
      paBaixa: hasLowBloodPressure,
      idadeMaior65: hasAge65
    }
  }, [answers.pac_crb65_triagem, answers.pac_exame_fisico, patient, pneumoniaCrbCriteria, pneumoniaLabResults.Ureia, pneumoniaPhysicalExam, pneumoniaVitalSigns])
  const pneumoniaAutomaticCurbDetails = useMemo<Record<PneumoniaCurbFieldKey, string>>(() => {
    const savedPhysicalExam = parseSavedPhysicalExamAnswer(answers.pac_exame_fisico, patient)
    const savedCrbCriteria = parseSavedPneumoniaCrbCriteria(answers.pac_crb65_triagem)
    const combinedCrbCriteria = new Set([...savedCrbCriteria, ...pneumoniaCrbCriteria])
    const sourceVitalSigns = answers.pac_exame_fisico ? savedPhysicalExam.sinaisVitais : pneumoniaVitalSigns
    const sourcePhysicalExam = answers.pac_exame_fisico ? savedPhysicalExam.exameFisico : pneumoniaPhysicalExam
    const urea = parseClinicalNumber(pneumoniaLabResults.Ureia)
    const respiratoryRate = parseClinicalNumber(sourceVitalSigns?.respiratoryRate)
    const bloodPressure = sourceVitalSigns?.bloodPressure?.trim()
    const patientAge = getPatientAgeForScore(patient)
    const glasgow = sourcePhysicalExam.neuro.glasgow
    const altered = sourcePhysicalExam.neuro.altered?.trim()

    return {
      confusaoMental: combinedCrbCriteria.has('Confusão mental nova')
        ? 'Marcado no CRB-65: confusão mental nova'
        : altered
        ? `Exame físico: ${altered}`
        : glasgow != null
          ? `Glasgow ${glasgow}`
          : 'Exame físico: sem alteração registrada',
      ureiaMaior43: urea != null ? `Ureia ${urea} mg/dL` : 'Ureia não informada nos exames',
      frMaior30: combinedCrbCriteria.has('Frequência respiratória ≥ 30 irpm')
        ? 'Marcado no CRB-65: frequência respiratória ≥ 30 irpm'
        : respiratoryRate != null
          ? `FR ${respiratoryRate} irpm`
          : 'FR não informada nos sinais vitais',
      paBaixa: combinedCrbCriteria.has('PAS < 90 mmHg ou PAD ≤ 60 mmHg')
        ? 'Marcado no CRB-65: hipotensão'
        : bloodPressure
          ? `PA ${bloodPressure} mmHg`
          : 'PA não informada nos sinais vitais',
      idadeMaior65: combinedCrbCriteria.has('Idade ≥ 65 anos')
        ? 'Marcado no CRB-65: idade ≥ 65 anos'
        : patientAge != null
          ? `Idade do cadastro: ${patientAge} anos`
          : 'Idade não informada no cadastro'
    }
  }, [answers.pac_crb65_triagem, answers.pac_exame_fisico, patient, pneumoniaCrbCriteria, pneumoniaLabResults.Ureia, pneumoniaPhysicalExam, pneumoniaVitalSigns])
  const savedPneumoniaCurbScore = useMemo(() => {
    const raw = answers.pac_curb65_protocolo || answers.pac_calcular_curb65
    if (!raw) return undefined
    try {
      const parsed = JSON.parse(raw) as { score?: unknown }
      return typeof parsed.score === 'number' ? parsed.score : undefined
    } catch {
      const match = String(raw).match(/curb65_(\d+)/)
      return match ? Number(match[1]) : undefined
    }
  }, [answers.pac_calcular_curb65, answers.pac_curb65_protocolo])
  const effectivePneumoniaCurbScore = savedPneumoniaCurbScore ?? pneumoniaCurbResult.score
  const pneumoniaCrbScore = pneumoniaCrbCriteria.length
  const pneumoniaCrbInterpretation = pneumoniaCrbScore === 0
    ? 'Baixo risco'
    : pneumoniaCrbScore <= 2
      ? 'Considerar avaliação hospitalar'
      : 'Alto risco - internação recomendada'
  const pneumoniaAtsIdsaSevere = pneumoniaAtsIdsaMajorCriteria.length > 0 || pneumoniaAtsIdsaMinorCriteria.length >= 3
  const pneumoniaCurbIndicatesHospitalization = effectivePneumoniaCurbScore >= 2
  const pneumoniaAtsIdsaNextStep = pneumoniaAtsIdsaSevere
    ? 'pac_drip_uti'
    : pneumoniaAtsIdsaMinorCriteria.length === 2
      ? 'pac_drip_enfermaria'
      : pneumoniaCurbIndicatesHospitalization
        ? 'pac_drip_enfermaria'
        : 'pac_destino_protocolo'
  const pneumoniaAtsIdsaActionLabel = pneumoniaAtsIdsaSevere
    ? 'Seguir para UTI'
    : pneumoniaAtsIdsaMinorCriteria.length === 2 || pneumoniaCurbIndicatesHospitalization
      ? 'Seguir para enfermaria'
      : 'Definir destino'
  const pneumoniaSmartCopScore = pneumoniaSmartCopCriteria.reduce((total, label) => {
    const item = pneumoniaSmartCopItems.find((criterion) => criterion.label === label)
    return total + (item?.points || 0)
  }, 0)
  const pneumoniaSmartCopInterpretation = pneumoniaSmartCopScore <= 2
    ? 'Baixo risco'
    : pneumoniaSmartCopScore <= 4
      ? 'Risco moderado'
      : pneumoniaSmartCopScore <= 6
        ? 'Alto risco'
        : 'Risco muito alto'
  const pneumoniaDripScore = (pneumoniaDripMajorCriteria.length * 2) + pneumoniaDripMinorCriteria.length
  const savedPneumoniaDripScore = useMemo(() => {
    const raw = answers.pac_drip_enfermaria || answers.pac_drip_uti
    if (!raw) return undefined
    try {
      const parsed = JSON.parse(raw) as { score?: unknown }
      return typeof parsed.score === 'number' ? parsed.score : undefined
    } catch {
      const match = String(raw).match(/drip_(\d+)/)
      return match ? Number(match[1]) : undefined
    }
  }, [answers.pac_drip_enfermaria, answers.pac_drip_uti])
  const effectivePneumoniaDripScore = savedPneumoniaDripScore ?? pneumoniaDripScore
  const pneumoniaDripInterpretation = pneumoniaDripScore >= 4
    ? 'Maior risco de patógenos resistentes - considerar cobertura ampliada conforme contexto'
    : 'Baixo risco de patógenos resistentes'
  const pneumoniaScapScore = pneumoniaScapCriteria.reduce((total, label) => {
    const item = pneumoniaScapItems.find((criterion) => criterion.label === label)
    return total + (item?.points || 0)
  }, 0)
  const pneumoniaScapInterpretation = pneumoniaScapScore >= 20
    ? 'PAC grave - alto risco de VM/choque/mortalidade'
    : pneumoniaScapScore >= 10
      ? 'PAC grave - considerar UTI'
      : 'Sem critérios de PAC grave pelo SCAP'
  const pneumoniaSipfFc = Number(String(pneumoniaSipfValues.fc).replace(',', '.'))
  const pneumoniaSipfPas = Number(String(pneumoniaSipfValues.pas).replace(',', '.'))
  const pneumoniaSipfPf = Number(String(pneumoniaSipfValues.pf).replace(',', '.'))
  const pneumoniaSipfShockIndex = Number.isFinite(pneumoniaSipfFc) && Number.isFinite(pneumoniaSipfPas) && pneumoniaSipfPas > 0
    ? pneumoniaSipfFc / pneumoniaSipfPas
    : undefined
  const pneumoniaSipfRiskPoints = [
    pneumoniaSipfShockIndex != null && pneumoniaSipfShockIndex >= 0.9,
    Number.isFinite(pneumoniaSipfPf) && pneumoniaSipfPf <= 250
  ].filter(Boolean).length
  const pneumoniaSipfShockIndexLabel = Number.isFinite(pneumoniaSipfShockIndex)
    ? Number(pneumoniaSipfShockIndex).toFixed(2)
    : '--'
  const pneumoniaSipfInterpretation = pneumoniaSipfRiskPoints === 0
    ? 'Sem sinal de alto risco pelos parâmetros preenchidos'
    : pneumoniaSipfRiskPoints === 1
      ? 'Risco aumentado - interpretar com o quadro clínico'
      : 'Alto risco - considerar UTI'
  const pneumoniaSoarScore = pneumoniaSoarCriteria.length
  const pneumoniaSoarInterpretation = pneumoniaSoarScore <= 1
    ? 'Baixo risco'
    : pneumoniaSoarScore === 2
      ? 'Risco intermediário'
      : 'Alto risco de mortalidade hospitalar'
  const influenzaWorseningSuggestsSRAG = influenzaWorseningSigns.some((item) =>
    item.includes('Alterações do estado mental') || item.includes('Desidratação')
  )
  const influenzaSeverityIsReassessment = useMemo(() => {
    const raw = answers.influenza_fatores_risco
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw) as { decision?: string }
      return parsed.decision === 'reavaliar_srag_por_piora'
    } catch {
      return raw === 'reavaliar_srag_por_piora'
    }
  }, [answers.influenza_fatores_risco])
  const savedInfluenzaRiskAssessment = useMemo(() => {
    const raw = answers.influenza_fatores_risco
    if (!raw) return { riskFactors: [] as string[], worseningSigns: [] as string[] }
    try {
      const parsed = JSON.parse(raw) as { fatoresRiscoSelecionados?: unknown; sinaisPioraSelecionados?: unknown }
      return {
        riskFactors: Array.isArray(parsed.fatoresRiscoSelecionados) ? parsed.fatoresRiscoSelecionados.map(String) : [],
        worseningSigns: Array.isArray(parsed.sinaisPioraSelecionados) ? parsed.sinaisPioraSelecionados.map(String) : []
      }
    } catch {
      return { riskFactors: [] as string[], worseningSigns: [] as string[] }
    }
  }, [answers.influenza_fatores_risco])
  const influenzaHasAmbulatoryOseltamivirIndication = influenzaRiskFactors.length > 0
    || influenzaWorseningSigns.length > 0
    || savedInfluenzaRiskAssessment.riskFactors.length > 0
    || savedInfluenzaRiskAssessment.worseningSigns.length > 0
  const anaphylaxisAdrenalineDose = useMemo(() => calculateAnaphylaxisAdrenalineDose(patient), [patient])
  const pancreatitisBisapResult = useMemo(() => calculatePancreatitisBisap(pancreatitisBisapValues), [pancreatitisBisapValues])
  const pancreatitisMarshallResult = useMemo(() => calculatePancreatitisMarshall(pancreatitisMarshallValues), [pancreatitisMarshallValues])
  const cholangitisDiagnosisResult = useMemo(() => calculateCholangitisDiagnosis(cholangitisDiagnosisValues), [cholangitisDiagnosisValues])
  const cholangitisSeverityResult = useMemo(() => calculateCholangitisSeverity(cholangitisSeverityValues), [cholangitisSeverityValues])
  const cholecystitisSeverityResult = useMemo(() => calculateCholecystitisSeverity(cholecystitisSeverityValues), [cholecystitisSeverityValues])
  const appendicitisAlvaradoResult = useMemo(() => calculateAppendicitisAlvarado(appendicitisAlvaradoValues), [appendicitisAlvaradoValues])
  const lombalgiaDispositionResult = useMemo(() => calculateLombalgiaDisposition(lombalgiaRiskValues), [lombalgiaRiskValues])
  const hasPneumoniaComorbidityOrRecentAtb = pneumoniaComorbidities.length > 0

  const isDpocSinaisGravidade = flowchart.id === 'dpoc_exacerbado' && currentStepData?.id === 'sinais_gravidade'
  const isDpocAnthonisenAmbulatorial = flowchart.id === 'dpoc_exacerbado' && currentStepData?.id === 'indicacao_atb'
  const isDpocAnthonisenHospitalar = flowchart.id === 'dpoc_exacerbado' && currentStepData?.id === 'indicacao_atb_hospitalar'
  const isDpocAnthonisen = isDpocAnthonisenAmbulatorial || isDpocAnthonisenHospitalar
  const hasInfluenzaPrescriptionForCurrentStep = useMemo(() => {
    if (!isInfluenzaAmbulatoryFinalStep || !currentStepData) return false
    const includeOseltamivir = currentStepData.id === 'influenza_ambulatorial_oseltamivir'
    return influenzaPrescriptionGeneratedSteps[currentStepData.id]
      || hasInfluenzaPrescriptionSet(getPersistedInfluenzaPrescriptions(), includeOseltamivir)
  }, [currentStepData, getPersistedInfluenzaPrescriptions, influenzaPrescriptionGeneratedSteps, isInfluenzaAmbulatoryFinalStep])

  const handleOpenInfluenzaPrescription = useCallback(() => {
    if (!currentStepData || !isInfluenzaAmbulatoryFinalStep) return

    const includeOseltamivir = currentStepData.id === 'influenza_ambulatorial_oseltamivir'
    const draftItems = buildInfluenzaPrescriptionItems(patient, includeOseltamivir)
    patientService.replacePrescriptionsByPrescriber(patient.id, 'Fluxograma Influenza', draftItems)

    setInfluenzaPrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setInfluenzaPrescriptionPreview(buildInfluenzaPrescriptionPreview(includeOseltamivir))
    setInfluenzaPrescriptionCopied(false)

    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildInfluenzaPrescriptionPreview,
    currentStep,
    currentStepData,
    history,
    isInfluenzaAmbulatoryFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyInfluenzaPrescriptionText = useCallback(async () => {
    if (!influenzaPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(influenzaPrescriptionPreview.content.join('\n'))
      setInfluenzaPrescriptionCopied(true)
      setTimeout(() => setInfluenzaPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da influenza:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [influenzaPrescriptionPreview])

  const buildPneumoniaPrescriptionPreview = useCallback((hasComorbidityOrRecentAtb: boolean): PneumoniaPrescriptionPreview => {
    const items = buildPneumoniaPrescriptionItems(patient, hasComorbidityOrRecentAtb)
    const content = [
      hasComorbidityOrRecentAtb
        ? 'ESQUEMA TERAPÊUTICO PARA PAC AMBULATORIAL COM COMORBIDADES/FATORES DE RISCO OU USO DE ATB NOS ÚLTIMOS 3 MESES'
        : 'ESQUEMA TERAPÊUTICO PARA PAC AMBULATORIAL SEM COMORBIDADES E SEM USO DE ATB NOS ÚLTIMOS 3 MESES',
      '',
      'RECEITA MÉDICA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'ALÉM DAS MEDICAÇÕES, ORIENTE RETORNO EM CASO DE NÃO MELHORA E/OU PIORA DOS SINTOMAS EM 48 A 72 HORAS.',
      'INGESTA HÍDRICA E ALIMENTAÇÃO ADEQUADA.'
    ].filter(Boolean)

    return {
      title: 'Prescrição ambulatorial da PAC',
      hasComorbidityOrRecentAtb,
      content
    }
  }, [patient])

  const getPersistedPneumoniaPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Pneumonia')
  }, [patient])

  const handleOpenPneumoniaPrescription = useCallback(() => {
    if (!isPneumoniaAmbulatoryPrescriptionStep) return

    const draftItems = buildPneumoniaPrescriptionItems(patient, hasPneumoniaComorbidityOrRecentAtb)
    const persisted = getPersistedPneumoniaPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setPneumoniaPrescriptionGenerated(true)
    setPneumoniaPrescriptionPreview(buildPneumoniaPrescriptionPreview(hasPneumoniaComorbidityOrRecentAtb))
    setPneumoniaPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildPneumoniaPrescriptionPreview,
    currentStep,
    getPersistedPneumoniaPrescriptions,
    hasPneumoniaComorbidityOrRecentAtb,
    history,
    isPneumoniaAmbulatoryPrescriptionStep,
    onUpdate,
    patient,
    progress
  ])

  const copyPneumoniaPrescriptionText = useCallback(async () => {
    if (!pneumoniaPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(pneumoniaPrescriptionPreview.content.join('\n'))
      setPneumoniaPrescriptionCopied(true)
      setTimeout(() => setPneumoniaPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da pneumonia:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [pneumoniaPrescriptionPreview])

  const buildSinusitisPrescriptionPreview = useCallback((etiology: SinusitisEtiology): SinusitisPrescriptionPreview => {
    const items = buildSinusitisPrescriptionItems(etiology)
    const titleByEtiology = {
      viral: 'Prescrição para rinossinusite viral',
      allergic: 'Prescrição para rinossinusite alérgica',
      bacterial: 'Prescrição para rinossinusite bacteriana'
    }
    const content = [
      titleByEtiology[etiology].toUpperCase(),
      '',
      'RECEITA MÉDICA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'ALÉM DAS MEDICAÇÕES, ORIENTE MEDIDAS NÃO FARMACOLÓGICAS.',
      etiology === 'bacterial'
        ? 'RETORNAR SE PIORA, FEBRE PERSISTENTE, SINAIS ORBITÁRIOS/NEUROLÓGICOS OU AUSÊNCIA DE RESPOSTA CLÍNICA.'
        : 'A MAIORIA DOS QUADROS NÃO BACTERIANOS NÃO NECESSITA ANTIBIÓTICO E COSTUMA EVOLUIR COM MELHORA ESPONTÂNEA.',
      'RETORNAR EM FEBRE PERSISTENTE, QUEDA DO ESTADO GERAL, TONTEIRA, DESMAIOS, VISÃO DUPLA OU DIMINUIÇÃO DA ACUIDADE VISUAL.'
    ].filter(Boolean)

    return {
      title: titleByEtiology[etiology],
      etiology,
      content
    }
  }, [])

  const getPersistedSinusitisPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Rinossinusite')
  }, [patient])

  const handleOpenSinusitisPrescription = useCallback(() => {
    if (!currentStepData || !isSinusitisPrescriptionFinalStep) return

    const etiology = sinusitisCurrentEtiology
    const draftItems = buildSinusitisPrescriptionItems(etiology)
    const persisted = getPersistedSinusitisPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setSinusitisPrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setSinusitisPrescriptionPreview(buildSinusitisPrescriptionPreview(etiology))
    setSinusitisPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildSinusitisPrescriptionPreview,
    currentStep,
    currentStepData,
    getPersistedSinusitisPrescriptions,
    history,
    isSinusitisPrescriptionFinalStep,
    onUpdate,
    patient,
    progress,
    sinusitisCurrentEtiology
  ])

  const copySinusitisPrescriptionText = useCallback(async () => {
    if (!sinusitisPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(sinusitisPrescriptionPreview.content.join('\n'))
      setSinusitisPrescriptionCopied(true)
      setTimeout(() => setSinusitisPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da rinossinusite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [sinusitisPrescriptionPreview])

  const buildFaringoamigdalitePrescriptionPreview = useCallback((disposition: FaringoamigdaliteDisposition): FaringoamigdalitePrescriptionPreview => {
    const items = buildFaringoamigdalitePrescriptionItems(disposition)
    const titleByDisposition = {
      symptomatic: 'Prescrição sintomática para faringoamigdalite',
      consider_antibiotic: 'Prescrição para faringoamigdalite bacteriana provável',
      bacterial: 'Prescrição para faringoamigdalite bacteriana'
    }
    const content = [
      titleByDisposition[disposition].toUpperCase(),
      '',
      'RECEITA MÉDICA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'ALÉM DAS MEDICAÇÕES, ORIENTE MEDIDAS NÃO FARMACOLÓGICAS.',
      '- Gargarejo com água morna e sal e chás podem aliviar sintomas.',
      '- Repouso e hidratação adequada.',
      '- Retornar se febre persistente apesar das medicações, dificuldade de falar, inchaço intenso no pescoço ou queda intensa do estado geral.',
      ...(disposition === 'symptomatic'
        ? []
        : [
            '',
            'OUTRAS OPÇÕES DE ANTIBIOTICOTERAPIA:',
            ...getFaringoamigdaliteAntibioticAlternatives().map((item) => `- ${item}`)
          ])
    ].filter(Boolean)

    return {
      title: titleByDisposition[disposition],
      disposition,
      content
    }
  }, [])

  const getPersistedFaringoamigdalitePrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Faringoamigdalite')
  }, [patient])

  const handleOpenFaringoamigdalitePrescription = useCallback(() => {
    if (!currentStepData || !isFaringoamigdalitePrescriptionFinalStep) return

    const disposition = faringoamigdaliteCurrentDisposition
    const draftItems = buildFaringoamigdalitePrescriptionItems(disposition)
    const persisted = getPersistedFaringoamigdalitePrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setFaringoamigdalitePrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setFaringoamigdalitePrescriptionPreview(buildFaringoamigdalitePrescriptionPreview(disposition))
    setFaringoamigdalitePrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildFaringoamigdalitePrescriptionPreview,
    currentStep,
    currentStepData,
    faringoamigdaliteCurrentDisposition,
    getPersistedFaringoamigdalitePrescriptions,
    history,
    isFaringoamigdalitePrescriptionFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyFaringoamigdalitePrescriptionText = useCallback(async () => {
    if (!faringoamigdalitePrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(faringoamigdalitePrescriptionPreview.content.join('\n'))
      setFaringoamigdalitePrescriptionCopied(true)
      setTimeout(() => setFaringoamigdalitePrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da faringoamigdalite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [faringoamigdalitePrescriptionPreview])

  const buildMonoartritePrescriptionPreview = useCallback((disposition: MonoartriteDisposition): MonoartritePrescriptionPreview => {
    const items = buildMonoartritePrescriptionItems(disposition)
    const titleByDisposition = {
      gout: 'Prescrição para crise de gota',
      septic: 'Conduta inicial para artrite séptica'
    }
    const content = [
      titleByDisposition[disposition].toUpperCase(),
      '',
      disposition === 'septic'
        ? 'INTERNAÇÃO E ANTIBIOTICOTERAPIA EV'
        : 'PRESCRIÇÃO NA PRÁTICA NO PRONTO-SOCORRO',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      ...(disposition === 'gout'
        ? [
            'OUTRAS OPÇÕES PARA GOTA:',
            ...getMonoartriteGoutAlternatives().map((item) => `- ${item}`),
            '',
            'ORIENTAÇÃO:',
            '- Se dor de difícil controle, febre, calafrios, queda do estado geral ou suspeita infecciosa, reavaliar imediatamente e considerar artrocentese.'
          ]
        : [
            'ESQUEMAS CONFORME GRAM / PERFIL CLÍNICO:',
            ...MONOARTRITE_SEPTIC_ANTIBIOTIC_OPTIONS.map((item) => `- ${item}`),
            '',
            'ORIENTAÇÃO:',
            '- Todo paciente com suspeita de artrite séptica deve ser internado para coleta de líquido sinovial, antibioticoterapia EV e ajuste conforme culturas.'
          ])
    ].filter(Boolean)

    return {
      title: titleByDisposition[disposition],
      disposition,
      content
    }
  }, [])

  const getPersistedMonoartritePrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Monoartrite')
  }, [patient])

  const handleOpenMonoartritePrescription = useCallback(() => {
    if (!currentStepData || !isMonoartritePrescriptionFinalStep) return

    const disposition = monoartriteCurrentDisposition
    const draftItems = buildMonoartritePrescriptionItems(disposition)
    const persisted = getPersistedMonoartritePrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setMonoartritePrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setMonoartritePrescriptionPreview(buildMonoartritePrescriptionPreview(disposition))
    setMonoartritePrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildMonoartritePrescriptionPreview,
    currentStep,
    currentStepData,
    getPersistedMonoartritePrescriptions,
    history,
    isMonoartritePrescriptionFinalStep,
    monoartriteCurrentDisposition,
    onUpdate,
    patient,
    progress
  ])

  const copyMonoartritePrescriptionText = useCallback(async () => {
    if (!monoartritePrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(monoartritePrescriptionPreview.content.join('\n'))
      setMonoartritePrescriptionCopied(true)
      setTimeout(() => setMonoartritePrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da monoartrite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [monoartritePrescriptionPreview])

  const buildAnsiedadePrescriptionPreview = useCallback((): AnsiedadePrescriptionPreview => {
    const items = buildAnsiedadePrescriptionItems()
    const content = [
      'ABORDAGEM MEDICAMENTOSA NA CRISE DE ANSIEDADE',
      '',
      'PRESCRIÇÃO NA PRÁTICA NO PRONTO-SOCORRO',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'OUTRAS OPÇÕES:',
      ...getAnsiedadeMedicationAlternatives().map((item) => `- ${item}`),
      '',
      'ORIENTAÇÃO:',
      '- Reavaliar resposta clínica, nível de sedação e segurança respiratória.',
      '- Solicitar avaliação psicológica/psiquiátrica quando disponível ou encaminhar seguimento ambulatorial conforme caso.',
      '- Retornar imediatamente se dor torácica, dispneia, síncope, déficit neurológico, confusão, ideação suicida ou piora importante.'
    ].filter(Boolean)

    return {
      title: 'Conduta medicamentosa da crise de ansiedade',
      content
    }
  }, [])

  const getPersistedAnsiedadePrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Crise de Ansiedade')
  }, [patient])

  const handleOpenAnsiedadePrescription = useCallback(() => {
    if (!isAnsiedadeMedicationStep) return

    const draftItems = buildAnsiedadePrescriptionItems()
    const persisted = getPersistedAnsiedadePrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setAnsiedadePrescriptionGenerated(true)
    setAnsiedadePrescriptionPreview(buildAnsiedadePrescriptionPreview())
    setAnsiedadePrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildAnsiedadePrescriptionPreview,
    currentStep,
    getPersistedAnsiedadePrescriptions,
    history,
    isAnsiedadeMedicationStep,
    onUpdate,
    patient,
    progress
  ])

  const copyAnsiedadePrescriptionText = useCallback(async () => {
    if (!ansiedadePrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(ansiedadePrescriptionPreview.content.join('\n'))
      setAnsiedadePrescriptionCopied(true)
      setTimeout(() => setAnsiedadePrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar conduta da crise de ansiedade:', error)
      alert('Não foi possível copiar a conduta. Tente novamente.')
    }
  }, [ansiedadePrescriptionPreview])

  const buildVertigemPrescriptionPreview = useCallback((disposition: VertigemDisposition): VertigemPrescriptionPreview => {
    const items = buildVertigemPrescriptionItems(disposition)
    const titleByDisposition = {
      neurite: 'Receita para neurite vestibular',
      vppb: 'Receita sintomática para VPPB'
    }
    const content = [
      titleByDisposition[disposition].toUpperCase(),
      '',
      'RECEITA MÉDICA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'OUTRAS OPÇÕES ANTIVERTIGINOSAS NO PS:',
      ...getVertigemAntivertigoAlternatives().map((item) => `- ${item}`),
      '',
      'ORIENTAÇÕES:',
      '- Usar sintomáticos vestibulares apenas pelo menor tempo possível, preferencialmente até 3 dias.',
      disposition === 'vppb'
        ? '- Agendar/realizar manobras de reposicionamento canalicular, como Epley ou Semont, conforme lado acometido.'
        : '- Orientar reabilitação vestibular e retorno se surgirem sintomas neurológicos ou piora importante.',
      '- Retornar imediatamente em tontura persistente e agravante, fraqueza, dormência, turvação visual, dificuldade de fala, alteração visual, cefaleia intensa, vômitos contínuos, desmaio, queda ou trauma.'
    ].filter(Boolean)

    return {
      title: titleByDisposition[disposition],
      disposition,
      content
    }
  }, [])

  const getPersistedVertigemPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Síndrome Vertiginosa')
  }, [patient])

  const handleOpenVertigemPrescription = useCallback(() => {
    if (!currentStepData || !isVertigemPrescriptionFinalStep) return

    const disposition = vertigemCurrentDisposition
    const draftItems = buildVertigemPrescriptionItems(disposition)
    const persisted = getPersistedVertigemPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setVertigemPrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setVertigemPrescriptionPreview(buildVertigemPrescriptionPreview(disposition))
    setVertigemPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildVertigemPrescriptionPreview,
    currentStep,
    currentStepData,
    getPersistedVertigemPrescriptions,
    history,
    isVertigemPrescriptionFinalStep,
    onUpdate,
    patient,
    progress,
    vertigemCurrentDisposition
  ])

  const copyVertigemPrescriptionText = useCallback(async () => {
    if (!vertigemPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(vertigemPrescriptionPreview.content.join('\n'))
      setVertigemPrescriptionCopied(true)
      setTimeout(() => setVertigemPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da síndrome vertiginosa:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [vertigemPrescriptionPreview])

  const buildCefaleiaPrescriptionPreview = useCallback((disposition: CefaleiaDisposition): CefaleiaPrescriptionPreview => {
    const items = buildCefaleiaPrescriptionItems(disposition)
    const titleByDisposition = {
      tensional: 'Receita para cefaleia tensional',
      migranea: 'Receita para cefaleia migrânea',
      salvas: 'Conduta para cefaleia em salvas'
    }
    const content = [
      titleByDisposition[disposition].toUpperCase(),
      '',
      disposition === 'salvas' ? 'CONDUTA NO PRONTO-SOCORRO' : 'RECEITA MÉDICA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'OPÇÕES PRÁTICAS NO PS:',
      ...getCefaleiaPsMedicationOptions(disposition).map((item) => `- ${item}`),
      '',
      'ALÉM DAS MEDICAÇÕES, ORIENTE:',
      '- Não usar álcool ou outros tipos de drogas; manter sono regular e evitar situações de estresse.',
      '- Não usar opioides como tramadol ou codeína sem orientação médica.',
      '- Retornar imediatamente se dor de cabeça ficar intensa e não melhorar, desmaios, fraqueza súbita, perda de visão/fala, febre alta ou vômitos sem melhora.'
    ].filter(Boolean)

    return {
      title: titleByDisposition[disposition],
      disposition,
      content
    }
  }, [])

  const getPersistedCefaleiaPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Cefaleia')
  }, [patient])

  const handleOpenCefaleiaPrescription = useCallback(() => {
    if (!currentStepData || !isCefaleiaPrescriptionFinalStep) return

    const disposition = cefaleiaCurrentDisposition
    const draftItems = buildCefaleiaPrescriptionItems(disposition)
    const persisted = getPersistedCefaleiaPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setCefaleiaPrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setCefaleiaPrescriptionPreview(buildCefaleiaPrescriptionPreview(disposition))
    setCefaleiaPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildCefaleiaPrescriptionPreview,
    cefaleiaCurrentDisposition,
    currentStep,
    currentStepData,
    getPersistedCefaleiaPrescriptions,
    history,
    isCefaleiaPrescriptionFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyCefaleiaPrescriptionText = useCallback(async () => {
    if (!cefaleiaPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(cefaleiaPrescriptionPreview.content.join('\n'))
      setCefaleiaPrescriptionCopied(true)
      setTimeout(() => setCefaleiaPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da cefaleia:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [cefaleiaPrescriptionPreview])

  const buildAgitacaoPrescriptionPreview = useCallback((disposition: AgitacaoDisposition): AgitacaoPrescriptionPreview => {
    const items = buildAgitacaoPrescriptionItems(disposition)
    const titleByDisposition = {
      moderada_oral: 'Conduta para agitação moderada',
      grave_im: 'Contenção química na agitação grave'
    }
    const content = [
      titleByDisposition[disposition].toUpperCase(),
      '',
      disposition === 'grave_im' ? 'CONTENÇÃO QUÍMICA' : 'MEDICAÇÃO VIA ORAL',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'OUTRAS OPÇÕES:',
      ...getAgitacaoMedicationAlternatives().map((item) => `- ${item}`),
      '',
      'SEGURANÇA:',
      '- Investigar e tratar hipóxia, hipoglicemia, hipertermia e hipovolemia.',
      '- Usar contenção física pelo menor tempo possível, apenas como ponte até a contenção química quando necessária.',
      '- Monitorar sinais vitais e nível de sedação; atenção para depressão respiratória.',
      '- Se suspeita de intoxicação por álcool, evitar prometazina e benzodiazepínicos; preferir haloperidol.'
    ].filter(Boolean)

    return {
      title: titleByDisposition[disposition],
      disposition,
      content
    }
  }, [])

  const getPersistedAgitacaoPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Agitação Psicomotora')
  }, [patient])

  const handleOpenAgitacaoPrescription = useCallback(() => {
    if (!currentStepData || !isAgitacaoPrescriptionFinalStep) return

    const disposition = agitacaoCurrentDisposition
    const draftItems = buildAgitacaoPrescriptionItems(disposition)
    const persisted = getPersistedAgitacaoPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setAgitacaoPrescriptionGeneratedSteps((prev) => ({ ...prev, [currentStepData.id]: true }))
    setAgitacaoPrescriptionPreview(buildAgitacaoPrescriptionPreview(disposition))
    setAgitacaoPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    agitacaoCurrentDisposition,
    answers,
    buildAgitacaoPrescriptionPreview,
    currentStep,
    currentStepData,
    getPersistedAgitacaoPrescriptions,
    history,
    isAgitacaoPrescriptionFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyAgitacaoPrescriptionText = useCallback(async () => {
    if (!agitacaoPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(agitacaoPrescriptionPreview.content.join('\n'))
      setAgitacaoPrescriptionCopied(true)
      setTimeout(() => setAgitacaoPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar conduta da agitação psicomotora:', error)
      alert('Não foi possível copiar a conduta. Tente novamente.')
    }
  }, [agitacaoPrescriptionPreview])

  const buildPepHivPrescriptionPreview = useCallback((): PepHivPrescriptionPreview => {
    const items = buildPepHivPrescriptionItems()
    const content = [
      'PROFILAXIA PÓS-EXPOSIÇÃO (PEP) AO HIV',
      '',
      'RECEITA MÉDICA',
      '',
      'USO ORAL',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'ESQUEMAS ALTERNATIVOS:',
      ...PEP_HIV_ALTERNATIVE_SCHEMES.map((item) => `- ${item}`),
      '',
      'ALÉM DAS MEDICAÇÕES, ORIENTE:',
      ...PEP_HIV_FOLLOW_UP_ORIENTATIONS.map((item) => `- ${item}`)
    ].filter(Boolean)

    return {
      title: 'Receita de PEP ao HIV',
      content
    }
  }, [])

  const getPersistedPepHivPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma PEP HIV')
  }, [patient])

  const handleOpenPepHivPrescription = useCallback(() => {
    if (!currentStepData || !isPepHivPrescriptionFinalStep) return

    const draftItems = buildPepHivPrescriptionItems()
    const persisted = getPersistedPepHivPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setPepHivPrescriptionGenerated(true)
    setPepHivPrescriptionPreview(buildPepHivPrescriptionPreview())
    setPepHivPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildPepHivPrescriptionPreview,
    currentStep,
    currentStepData,
    getPersistedPepHivPrescriptions,
    history,
    isPepHivPrescriptionFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyPepHivPrescriptionText = useCallback(async () => {
    if (!pepHivPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(pepHivPrescriptionPreview.content.join('\n'))
      setPepHivPrescriptionCopied(true)
      setTimeout(() => setPepHivPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição de PEP HIV:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [pepHivPrescriptionPreview])

  const toggleAnaphylaxisCriterion = useCallback((key: AnaphylaxisCriteriaKey) => {
    setSelectedAnaphylaxisCriteria((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    )
  }, [])

  const openAnaphylaxisEmergencyAllocation = useCallback((nextStep: string, value?: string) => {
    if (selectedAnaphylaxisCriteria.length === 0) return
    setPendingAnaphylaxisEmergencyOption({ nextStep, value })
    setAnaphylaxisEmergencyAllocationOpen(true)
  }, [selectedAnaphylaxisCriteria.length])

  const getAnaphylaxisAdrenalinePrescriptionText = useCallback(() => {
    const doseMg = String(anaphylaxisAdrenalineDose.doseMg).replace('.', ',')
    return `Adrenalina (1mg/1ml): aplicar ${doseMg}mg IM na face antero-lateral da coxa.`
  }, [anaphylaxisAdrenalineDose.doseMg])

  const getAnaphylaxisRepeatPrescriptionText = useCallback(() => {
    const doseMg = String(anaphylaxisAdrenalineDose.doseMg).replace('.', ',')
    return `Adrenalina (1mg/1ml): repetir ${doseMg}mg IM na face antero-lateral da coxa. Manter ABCDE, oxigênio alto fluxo, expansão volêmica e monitorização.`
  }, [anaphylaxisAdrenalineDose.doseMg])

  const copyAnaphylaxisAdrenalinePrescriptionText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getAnaphylaxisAdrenalinePrescriptionText())
      setAnaphylaxisAdrenalinePrescriptionCopied(true)
      setTimeout(() => setAnaphylaxisAdrenalinePrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição sugerida da adrenalina:', error)
      alert('Não foi possível copiar a prescrição sugerida. Tente novamente.')
    }
  }, [getAnaphylaxisAdrenalinePrescriptionText])

  const copyAnaphylaxisRepeatPrescriptionText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getAnaphylaxisRepeatPrescriptionText())
      setAnaphylaxisRepeatPrescriptionCopied(true)
      setTimeout(() => setAnaphylaxisRepeatPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição de repetição da adrenalina:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [getAnaphylaxisRepeatPrescriptionText])

  const buildAnaphylaxisAdjunctPrescriptionPreview = useCallback((selected: AnaphylaxisAdjunctKey[]): AnaphylaxisAdjunctPrescriptionPreview => {
    const uniqueSelected = anaphylaxisAdjunctOrder.filter((key) => selected.includes(key))
    const content = [
      'TRATAMENTO ADJUNTO APÓS ADRENALINA - ANAFILAXIA',
      '',
      'MEDIDAS GERAIS',
      '- Manter monitorização cardíaca contínua, oximetria, acesso venoso e reavaliação em 5-10 minutos.',
      '- Tratamento adjunto não substitui adrenalina IM. Repetir adrenalina se resposta insuficiente conforme protocolo.',
      ''
    ]

    uniqueSelected.forEach((key) => {
      if (key === 'hypotension') {
        content.push(
          'HIPOTENSÃO / COLAPSO',
          '- SF 0,9% ou Ringer lactato: 500-1000 mL IV/IO em bolus rápido; repetir conforme PA/perfusão, até 2 L em adultos.',
          '- Manter posição supina com membros inferiores elevados, salvo desconforto respiratório importante.',
          '- Se hipotensão refratária após volume e adrenalina IM: considerar noradrenalina, vasopressina ou dopamina conforme protocolo institucional.',
          ''
        )
      }

      if (key === 'stridor') {
        content.push(
          'ESTRIDOR / ENVOLVIMENTO LARÍNGEO',
          '- Oxigênio em alto fluxo.',
          '- Adrenalina nebulizada 1 mg/mL: 3-5 mL pura, conforme protocolo local.',
          '- Hidrocortisona 100-200 mg IV/IM/IO ou metilprednisolona 40-80 mg IV/IM/IO.',
          '- Acionar suporte avançado de via aérea; considerar IOT precoce ou cricotireoidostomia se piora.',
          ''
        )
      }

      if (key === 'dyspnea') {
        content.push(
          'DISPNEIA / BRONCOESPASMO',
          '- Oxigênio em alto fluxo.',
          '- Salbutamol spray 100 mcg com espaçador: 4-8 jatos a cada 20 minutos, até 3 doses em 1 hora.',
          '- Alternativa: fenoterol 10-20 gotas +/- brometo de ipratrópio 40 gotas em nebulização.',
          '- Se uso de beta-bloqueador ou broncoespasmo refratário: considerar glucagon conforme protocolo institucional.',
          ''
        )
      }

      if (key === 'urticaria') {
        content.push(
          'URTICÁRIA / SINTOMAS CUTÂNEOS',
          '- Fexofenadina 180 mg VO: 1 comprimido/dose; repetir em 20 minutos se necessário.',
          '- Difenidramina 25-50 mg IM/IV/IO a cada 4-6 horas, máximo 50 mg/dose.',
          '- Prometazina 25-50 mg IM a cada 4-6 horas, máximo 50 mg/dose.',
          '- Prednisolona 40 mg VO ou hidrocortisona 100-200 mg IV/IM/IO ou metilprednisolona 40-80 mg IV/IM/IO.',
          ''
        )
      }

      if (key === 'vomiting') {
        content.push(
          'NÁUSEAS / VÔMITOS',
          '- Ondansetrona 8 mg SL.',
          '- Alternativa: ondansetrona 8 mg IV lenta em SF 0,9% 50 mL em 15 minutos.',
          '- Reavaliar perfusão, risco de broncoaspiração e necessidade de expansão volêmica.',
          ''
        )
      }
    })

    content.push(
      'OBSERVAÇÃO',
      '- Ajustar doses em pediatria, gestantes, idosos frágeis, insuficiência renal/hepática e conforme protocolo institucional.'
    )

    return {
      title: uniqueSelected.length > 0
        ? `Prescrição sugerida - ${uniqueSelected.map((key) => ANAPHYLAXIS_ADJUNCT_CARDS[key].title).join(' + ')}`
        : 'Prescrição sugerida - tratamento adjunto',
      content
    }
  }, [])

  const handleOpenAnaphylaxisAdjunctPrescription = useCallback(() => {
    setAnaphylaxisAdjunctPrescriptionPreview(buildAnaphylaxisAdjunctPrescriptionPreview(selectedAnaphylaxisAdjuncts))
    setAnaphylaxisAdjunctPrescriptionCopied(false)
  }, [buildAnaphylaxisAdjunctPrescriptionPreview, selectedAnaphylaxisAdjuncts])

  const copyAnaphylaxisAdjunctPrescriptionText = useCallback(async () => {
    if (!anaphylaxisAdjunctPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(anaphylaxisAdjunctPrescriptionPreview.content.join('\n'))
      setAnaphylaxisAdjunctPrescriptionCopied(true)
      setTimeout(() => setAnaphylaxisAdjunctPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição adjunta da anafilaxia:', error)
      alert('Não foi possível copiar a prescrição sugerida. Tente novamente.')
    }
  }, [anaphylaxisAdjunctPrescriptionPreview])

  const buildAnaphylaxisPrescriptionPreview = useCallback((): AnaphylaxisPrescriptionPreview => {
    const items = buildAnaphylaxisDischargePrescriptionItems(patient)
    const content = [
      'ORIENTAÇÕES E PRESCRIÇÃO DOMICILIAR APÓS ANAFILAXIA',
      '',
      'RECEITA MÉDICA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'ORIENTAÇÕES:',
      ...ANAPHYLAXIS_HOME_ORIENTATIONS.map((item) => `- ${item}`)
    ].filter(Boolean)

    return {
      title: 'Prescrição pós-anafilaxia',
      content
    }
  }, [patient])

  const getPersistedAnaphylaxisPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Anafilaxia')
  }, [patient])

  const handleOpenAnaphylaxisPrescription = useCallback(() => {
    if (!isAnaphylaxisDischargeStep) return

    const draftItems = buildAnaphylaxisDischargePrescriptionItems(patient)
    const persisted = getPersistedAnaphylaxisPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setAnaphylaxisPrescriptionGenerated(true)
    setAnaphylaxisPrescriptionPreview(buildAnaphylaxisPrescriptionPreview())
    setAnaphylaxisPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildAnaphylaxisPrescriptionPreview,
    currentStep,
    getPersistedAnaphylaxisPrescriptions,
    history,
    isAnaphylaxisDischargeStep,
    onUpdate,
    patient,
    progress
  ])

  const copyAnaphylaxisPrescriptionText = useCallback(async () => {
    if (!anaphylaxisPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(anaphylaxisPrescriptionPreview.content.join('\n'))
      setAnaphylaxisPrescriptionCopied(true)
      setTimeout(() => setAnaphylaxisPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da anafilaxia:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [anaphylaxisPrescriptionPreview])

  const buildPancreatitisPrescriptionPreview = useCallback((includeAntibiotic: boolean): PancreatitisPrescriptionPreview => {
    const items = buildPancreatitisHospitalPrescriptionItems(patient, includeAntibiotic)
    const content = [
      'CUIDADOS E PRESCRIÇÃO HOSPITALAR NA PANCREATITE AGUDA',
      '',
      'DIETA',
      '- Dieta zero inicialmente; iniciar dieta oral pobre em gorduras assim que houver melhora da dor e peristaltismo preservado, idealmente em até 24h.',
      '- Preferir via oral/enteral; se não tolerar, considerar parenteral e manter via enteral mínima quando possível.',
      '',
      'PRESCRIÇÃO',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      includeAntibiotic
        ? 'ANTIBIÓTICO: indicado por evidência de infecção sobreposta/necrose infectada.'
        : 'ANTIBIÓTICOS: não recomendados como profilaxia; iniciar apenas se evidência de infecção sobreposta.'
    ].filter(Boolean)

    return {
      title: 'Prescrição hospitalar da pancreatite aguda',
      includeAntibiotic,
      content
    }
  }, [patient])

  const getPersistedPancreatitisPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Pancreatite Aguda')
  }, [patient])

  const handleOpenPancreatitisPrescription = useCallback(() => {
    if (!isPancreatitisTreatmentFinalStep) return

    const draftItems = buildPancreatitisHospitalPrescriptionItems(patient, pancreatitisIncludeAntibiotic)
    const persisted = getPersistedPancreatitisPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setPancreatitisPrescriptionGenerated(true)
    setPancreatitisPrescriptionPreview(buildPancreatitisPrescriptionPreview(pancreatitisIncludeAntibiotic))
    setPancreatitisPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildPancreatitisPrescriptionPreview,
    currentStep,
    getPersistedPancreatitisPrescriptions,
    history,
    isPancreatitisTreatmentFinalStep,
    onUpdate,
    pancreatitisIncludeAntibiotic,
    patient,
    progress
  ])

  const copyPancreatitisPrescriptionText = useCallback(async () => {
    if (!pancreatitisPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(pancreatitisPrescriptionPreview.content.join('\n'))
      setPancreatitisPrescriptionCopied(true)
      setTimeout(() => setPancreatitisPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da pancreatite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [pancreatitisPrescriptionPreview])

  const buildCholangitisPrescriptionPreview = useCallback((
    severity: CholangitisSeverity,
    antibioticScheme: CholangitisPrescriptionPreview['antibioticScheme'],
    includeAntibiotics = true
  ): CholangitisPrescriptionPreview => {
    const items = buildCholangitisPrescriptionItems(severity, antibioticScheme, includeAntibiotics)
    const content = [
      severity === 'moderada'
        ? 'SUGESTÃO DE PRESCRIÇÃO PARA PACIENTE ADULTO COM COLANGITE AGUDA GRAU II'
        : severity === 'grave'
          ? 'SUGESTÃO DE PRESCRIÇÃO PARA COLANGITE AGUDA GRAVE - TOKYO III'
          : 'SUGESTÃO DE PRESCRIÇÃO PARA COLANGITE/COLEDOCOLITÍASE',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'NÃO ESQUEÇA',
      '- Internação e/ou transferência para avaliação da cirurgia geral/endoscopia.',
      '- Jejum até definição do procedimento.',
      includeAntibiotics
        ? severity === 'grave'
          ? '- Drenagem biliar urgente, idealmente em 12-24 horas após estabilização.'
          : severity === 'moderada'
            ? '- Drenagem biliar precoce, preferencialmente em 24-48 horas.'
            : '- Drenagem biliar se não houver resposta clínica adequada em até 48 horas.'
        : '- Antibioticoterapia apenas se houver suspeita de colangite associada.',
      '- Individualizar alergias, função renal, culturas, comorbidades e protocolo local.'
    ].filter(Boolean)

    return {
      title: 'Prescrição colangite / coledocolitíase',
      severity,
      antibioticScheme,
      content
    }
  }, [])

  const getPersistedCholangitisPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Colangite / Coledocolitíase')
  }, [patient])

  const handleOpenCholangitisPrescription = useCallback(() => {
    if (!isCholangitisTreatmentFinalStep) return

    const severity = currentStepData?.id === 'colangite_grave'
      ? 'grave'
      : currentStepData?.id === 'colangite_moderada'
        ? 'moderada'
        : 'leve'
    const antibioticScheme = currentStepData?.id === 'colangite_grave'
      ? 'piperacillin_tazobactam'
      : currentStepData?.id === 'colangite_moderada'
        ? cholangitisAntibioticScheme
        : 'ceftriaxone_metronidazole'
    const includeAntibiotics = currentStepData?.id !== 'coledocolitiase_sem_colangite'

    const draftItems = buildCholangitisPrescriptionItems(severity, antibioticScheme, includeAntibiotics)
    const persisted = getPersistedCholangitisPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setCholangitisPrescriptionGenerated(true)
    setCholangitisPrescriptionPreview(buildCholangitisPrescriptionPreview(severity, antibioticScheme, includeAntibiotics))
    setCholangitisPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildCholangitisPrescriptionPreview,
    cholangitisAntibioticScheme,
    currentStep,
    currentStepData,
    getPersistedCholangitisPrescriptions,
    history,
    isCholangitisTreatmentFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyCholangitisPrescriptionText = useCallback(async () => {
    if (!cholangitisPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(cholangitisPrescriptionPreview.content.join('\n'))
      setCholangitisPrescriptionCopied(true)
      setTimeout(() => setCholangitisPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da colangite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [cholangitisPrescriptionPreview])

  const buildCholecystitisPrescriptionPreview = useCallback((
    severity: CholecystitisSeverity,
    antibioticScheme: CholecystitisAntibioticScheme
  ): CholecystitisPrescriptionPreview => {
    const items = buildCholecystitisPrescriptionItems(severity, antibioticScheme)
    const content = [
      severity === 'moderada'
        ? 'SUGESTÃO DE PRESCRIÇÃO PARA PACIENTE ADULTO COM COLECISTITE AGUDA GRAU II'
        : severity === 'grave'
          ? 'SUGESTÃO DE PRESCRIÇÃO PARA COLECISTITE AGUDA GRAVE - TOKYO III'
          : 'SUGESTÃO DE PRESCRIÇÃO PARA COLECISTITE AGUDA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'NÃO ESQUEÇA',
      '- Internação e/ou transferência para avaliação da cirurgia geral.',
      '- Jejum até definição do procedimento.',
      severity === 'grave'
        ? '- Suporte intensivo, controle da disfunção e considerar drenagem percutânea e/ou colecistectomia.'
        : severity === 'moderada'
          ? '- Colecistectomia laparoscópica precoce; se alto risco cirúrgico, considerar drenagem percutânea.'
          : '- Colecistectomia laparoscópica precoce, idealmente até 72 horas.',
      '- Individualizar alergias, função renal, culturas, comorbidades e protocolo local.'
    ].filter(Boolean)

    return {
      title: 'Prescrição colecistite aguda',
      severity,
      antibioticScheme,
      content
    }
  }, [])

  const getPersistedCholecystitisPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Colecistite Aguda')
  }, [patient])

  const handleOpenCholecystitisPrescription = useCallback(() => {
    if (!isCholecystitisTreatmentFinalStep) return

    const severity = currentStepData?.id === 'cole_grave'
      ? 'grave'
      : currentStepData?.id === 'cole_moderada'
        ? 'moderada'
        : 'leve'
    const antibioticScheme = cholecystitisAntibioticScheme

    const draftItems = buildCholecystitisPrescriptionItems(severity, antibioticScheme)
    const persisted = getPersistedCholecystitisPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setCholecystitisPrescriptionGenerated(true)
    setCholecystitisPrescriptionPreview(buildCholecystitisPrescriptionPreview(severity, antibioticScheme))
    setCholecystitisPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildCholecystitisPrescriptionPreview,
    cholecystitisAntibioticScheme,
    currentStep,
    currentStepData,
    getPersistedCholecystitisPrescriptions,
    history,
    isCholecystitisTreatmentFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyCholecystitisPrescriptionText = useCallback(async () => {
    if (!cholecystitisPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(cholecystitisPrescriptionPreview.content.join('\n'))
      setCholecystitisPrescriptionCopied(true)
      setTimeout(() => setCholecystitisPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da colecistite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [cholecystitisPrescriptionPreview])

  const buildCholecystitisSurgeryConsultPreview = useCallback((): CholecystitisSurgeryConsultPreview => {
    return {
      title: 'Interconsulta - Cirurgia Geral',
      content: [
        'INTERCONSULTA - CIRURGIA GERAL',
        '',
        'Solicito avaliação da Cirurgia Geral.',
        '',
        `Paciente ${patient.name || '________________________________'} com quadro clínico compatível com colecistite aguda, apresentando dor em hipocôndrio direito, associada a náuseas e/ou vômitos, com evolução há _____ horas/dias. Ao exame físico, apresenta dor à palpação em hipocôndrio direito, com sinal de Murphy clínico positivo.`,
        '',
        'Exames laboratoriais evidenciam leucocitose de ________, PCR de ________, bilirrubina total de ________ mg/dL, bilirrubina direta de ________ mg/dL, AST ________ U/L, ALT ________ U/L, FA ________ U/L e GGT ________ U/L.',
        '',
        'Ultrassonografia abdominal demonstra presença de colelitíase associada a espessamento da parede vesicular de _____ mm, distensão vesicular, líquido perivesicular e/ou Murphy ultrassonográfico positivo, compatível com colecistite aguda.',
        '',
        'Paciente encontra-se em jejum, recebendo hidratação venosa, analgesia, antieméticos e antibioticoterapia empírica.',
        '',
        'Solicito avaliação especializada para definição de conduta cirúrgica e programação terapêutica.',
        '',
        'Atenciosamente,',
        '',
        'Dr(a). ____________________',
        'CRM ____________________'
      ]
    }
  }, [patient.name])

  const handleOpenCholecystitisSurgeryConsult = useCallback(() => {
    setCholecystitisSurgeryConsultPreview(buildCholecystitisSurgeryConsultPreview())
    setCholecystitisSurgeryConsultCopied(false)
  }, [buildCholecystitisSurgeryConsultPreview])

  const copyCholecystitisSurgeryConsultText = useCallback(async () => {
    if (!cholecystitisSurgeryConsultPreview) return
    try {
      await navigator.clipboard.writeText(cholecystitisSurgeryConsultPreview.content.join('\n'))
      setCholecystitisSurgeryConsultCopied(true)
      setTimeout(() => setCholecystitisSurgeryConsultCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar interconsulta da colecistite:', error)
      alert('Não foi possível copiar a interconsulta. Tente novamente.')
    }
  }, [cholecystitisSurgeryConsultPreview])

  const buildAppendicitisPrescriptionPreview = useCallback((
    antibioticScheme: AppendicitisAntibioticScheme,
    includeAntibiotics: boolean,
    outpatient = false
  ): AppendicitisPrescriptionPreview => {
    const items = outpatient
      ? buildAppendicitisLowRiskPrescriptionItems()
      : buildAppendicitisPrescriptionItems(antibioticScheme, includeAntibiotics)
    const content = [
      outpatient
        ? 'SUGESTÃO DE PRESCRIÇÃO SINTOMÁTICA - BAIXO RISCO PARA APENDICITE'
        : 'SUGESTÃO DE PRESCRIÇÃO PARA PACIENTE ADULTO COM APENDICITE AGUDA',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'NÃO ESQUEÇA',
      outpatient
        ? '- Orientar sinais de alarme e retorno imediato se piora clínica.'
        : '- Internação e/ou transferência para avaliação da cirurgia geral.',
      outpatient
        ? '- Considerar diagnósticos alternativos e reavaliação se persistir dúvida.'
        : '- Jejum até definição do procedimento.',
      outpatient
        ? '- Não usar antibiótico empírico se baixa probabilidade e sem sinais infecciosos relevantes.'
        : includeAntibiotics
          ? '- Manter antibioticoterapia venosa enquanto aguarda conduta cirúrgica ou manejo conservador inicial.'
          : '- Se baixa probabilidade e alta, manter apenas sintomáticos e orientação de retorno.',
      '- Individualizar alergias, função renal, culturas, comorbidades e protocolo local.'
    ].filter(Boolean)

    return {
      title: 'Prescrição apendicite aguda',
      antibioticScheme,
      includeAntibiotics,
      content
    }
  }, [])

  const getPersistedAppendicitisPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Apendicite Aguda')
  }, [patient])

  const handleOpenAppendicitisPrescription = useCallback(() => {
    if (!isAppendicitisTreatmentFinalStep) return

    const outpatient = currentStepData?.id === 'apend_baixo_risco'
    const includeAntibiotics = !outpatient && appendicitisIncludeAntibiotics
    const draftItems = outpatient
      ? buildAppendicitisLowRiskPrescriptionItems()
      : buildAppendicitisPrescriptionItems(appendicitisAntibioticScheme, includeAntibiotics)
    const persisted = getPersistedAppendicitisPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setAppendicitisPrescriptionGenerated(true)
    setAppendicitisPrescriptionPreview(buildAppendicitisPrescriptionPreview(appendicitisAntibioticScheme, includeAntibiotics, outpatient))
    setAppendicitisPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    appendicitisAntibioticScheme,
    appendicitisIncludeAntibiotics,
    buildAppendicitisPrescriptionPreview,
    currentStep,
    currentStepData,
    getPersistedAppendicitisPrescriptions,
    history,
    isAppendicitisTreatmentFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyAppendicitisPrescriptionText = useCallback(async () => {
    if (!appendicitisPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(appendicitisPrescriptionPreview.content.join('\n'))
      setAppendicitisPrescriptionCopied(true)
      setTimeout(() => setAppendicitisPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da apendicite:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [appendicitisPrescriptionPreview])

  const buildLombalgiaPrescriptionPreview = useCallback((): LombalgiaPrescriptionPreview => {
    const items = buildLombalgiaPrescriptionItems()
    const content = [
      'RECEITA MÉDICA - LOMBALGIA AGUDA',
      '',
      'USO ORAL',
      '',
      ...items.flatMap((item, index) => [
        `${index + 1}) ${item.medication} ${item.dosage}`,
        `- ${item.frequency.toUpperCase()}, ${item.duration.toUpperCase()}.`,
        item.instructions ? `- ${item.instructions}` : '',
        ''
      ]),
      'ALÉM DAS MEDICAÇÕES, ORIENTE MEDIDAS NÃO FARMACOLÓGICAS.',
      '- Compressa com água morna de 8/8 horas na região acometida.',
      '- Repouso por períodos curtos; retomar atividades e exercícios assim que possível.',
      '- Retornar se não houver melhora, dor intensa, perda de força/sensibilidade, retenção urinária/incontinência fecal, desmaios ou febre alta.'
    ].filter(Boolean)

    return {
      title: 'Prescrição lombalgia',
      content
    }
  }, [])

  const getPersistedLombalgiaPrescriptions = useCallback(() => {
    const livePatient = patientService.getPatientById(patient.id) || patient
    return livePatient.treatment.prescriptions.filter(item => item.prescribedBy === 'Fluxograma Lombalgia')
  }, [patient])

  const handleOpenLombalgiaPrescription = useCallback(() => {
    if (!isLombalgiaConservativeFinalStep) return

    const draftItems = buildLombalgiaPrescriptionItems()
    const persisted = getPersistedLombalgiaPrescriptions()
    const existingKeys = new Set(persisted.map((item) => `${item.medication}_${item.dosage}`))

    draftItems.forEach((item) => {
      const key = `${item.medication}_${item.dosage}`
      if (!existingKeys.has(key)) {
        patientService.addPrescription(patient.id, item)
      }
    })

    setLombalgiaPrescriptionGenerated(true)
    setLombalgiaPrescriptionPreview(buildLombalgiaPrescriptionPreview())
    setLombalgiaPrescriptionCopied(false)
    onUpdate(patient.id, currentStep, history, answers, progress)
  }, [
    answers,
    buildLombalgiaPrescriptionPreview,
    currentStep,
    getPersistedLombalgiaPrescriptions,
    history,
    isLombalgiaConservativeFinalStep,
    onUpdate,
    patient,
    progress
  ])

  const copyLombalgiaPrescriptionText = useCallback(async () => {
    if (!lombalgiaPrescriptionPreview) return
    try {
      await navigator.clipboard.writeText(lombalgiaPrescriptionPreview.content.join('\n'))
      setLombalgiaPrescriptionCopied(true)
      setTimeout(() => setLombalgiaPrescriptionCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar prescrição da lombalgia:', error)
      alert('Não foi possível copiar a prescrição. Tente novamente.')
    }
  }, [lombalgiaPrescriptionPreview])

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  const toNumber = useCallback((value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'string') return null
    const normalized = value.replace(',', '.').trim()
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }, [])

  const normalizeGasometryInput = (key: GasometryFieldKey, raw: string, finalize = false) => {
    let normalized = raw.replace(',', '.').replace(/[^\d.-]/g, '')
    const dotIndex = normalized.indexOf('.')
    if (dotIndex >= 0) {
      normalized = normalized.slice(0, dotIndex + 1) + normalized.slice(dotIndex + 1).replace(/\./g, '')
    }
    if (key === 'ph') {
      const digitsOnly = normalized.replace(/\D/g, '')
      if (digitsOnly.length === 2) normalized = `${digitsOnly[0]}.${digitsOnly[1]}`
      if (digitsOnly.length >= 3) normalized = `${digitsOnly[0]}.${digitsOnly.slice(1, 3)}`
      if (finalize && /^\d$/.test(digitsOnly)) normalized = `${digitsOnly}.0`
    }
    return normalized
  }

  const formatGasometryNumber = (value: number | null, digits = 2) => value === null ? '--' : value.toFixed(digits)

  const validateNumericDraft = useCallback(<K extends string>(
    draft: Record<K, string>,
    config: Array<{ key: K; min: number; max: number; required: boolean; unit: string }>
  ) => {
    const parsed = {} as Record<K, number | null>
    const errors = {} as Record<K, string | null>
    config.forEach((field) => {
      const value = toNumber(draft[field.key])
      parsed[field.key] = value
      if (value === null) {
        errors[field.key] = field.required ? 'Obrigatório para o fluxo' : null
        return
      }
      if (value < field.min || value > field.max) {
        errors[field.key] = `Faixa fisiológica: ${field.min} a ${field.max} ${field.unit}`.trim()
        return
      }
      errors[field.key] = null
    })
    const hasHardError = config.some((field) => {
      if (field.required && parsed[field.key] === null) return true
      return !!errors[field.key]
    })
    return { parsed, errors, hasHardError }
  }, [toNumber])

  const savedGasometryLabs = useMemo(() => {
    const raw = answers['coleta_parametros']
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Record<string, number>
      return parsed
    } catch {
      return null
    }
  }, [answers])

  const gasometryValidation = useMemo(
    () => validateNumericDraft(gasometryDraft, gasometryFieldConfig),
    [gasometryDraft, validateNumericDraft]
  )

  const savedAsthmaInitial = useMemo(() => {
    const raw = answers['asma_avaliacao_inicial']
    if (!raw) return null
    try {
      return JSON.parse(raw) as {
        values: Record<string, number>
        flags: typeof asthmaFlags
      }
    } catch {
      return null
    }
  }, [answers])

  const savedAsthmaReeval = useMemo(() => {
    const raw = answers['asma_reavaliacao_1h']
    if (!raw) return null
    try {
      return JSON.parse(raw) as {
        values: Record<string, number>
        flags: typeof asthmaReevalFlags
      }
    } catch {
      return null
    }
  }, [answers])

  const asthmaInitialValidation = useMemo(
    () => validateNumericDraft(asthmaInitialDraft, asthmaInitialFieldConfig),
    [asthmaInitialDraft, validateNumericDraft]
  )

  const asthmaReevalValidation = useMemo(
    () => validateNumericDraft(asthmaReevalDraft, asthmaReevalFieldConfig),
    [asthmaReevalDraft, validateNumericDraft]
  )

  const requiredGasometryReady = !gasometryValidation.hasHardError
  const requiredAsthmaInitialReady = !asthmaInitialValidation.hasHardError
  const requiredAsthmaReevalReady = !asthmaReevalValidation.hasHardError

  const getGasometryFieldFeedback = (key: GasometryFieldKey, value: number | null) => {
    if (value === null) return { tone: 'slate', text: 'Aguardando preenchimento' }
    if (key === 'ph') return value < 7.35 ? { tone: 'red', text: 'Acidemia' } : value > 7.45 ? { tone: 'amber', text: 'Alcalemia' } : { tone: 'emerald', text: 'pH normal' }
    if (key === 'pco2') return value > 45 ? { tone: 'red', text: 'Retenção de CO2 (>45)' } : value < 35 ? { tone: 'amber', text: 'Hipocapnia (<35)' } : { tone: 'emerald', text: 'Faixa normal (35–45)' }
    if (key === 'hco3') return value < 22 ? { tone: 'red', text: 'Baixo (<22)' } : value > 27 ? { tone: 'amber', text: 'Elevado (>27)' } : { tone: 'emerald', text: 'Faixa normal (22–27)' }
    if (key === 'be') return value < -2 ? { tone: 'red', text: 'Déficit de base' } : value > 2 ? { tone: 'amber', text: 'Excesso de base' } : { tone: 'emerald', text: 'Próximo do normal' }
    if (key === 'po2') return value < 40 ? { tone: 'red', text: 'Hipoxemia grave (<40)' } : value < 60 ? { tone: 'red', text: 'Hipoxemia moderada (40–59)' } : value < 80 ? { tone: 'amber', text: 'Hipoxemia leve (60–79)' } : { tone: 'emerald', text: 'Oxigenação adequada (≥80)' }
    if (key === 'sodium') return value < 135 ? { tone: 'amber', text: 'Hiponatremia' } : value > 145 ? { tone: 'amber', text: 'Hipernatremia' } : { tone: 'emerald', text: 'Faixa usual' }
    if (key === 'chloride') return value < 98 ? { tone: 'amber', text: 'Hipocloremia' } : value > 107 ? { tone: 'amber', text: 'Hipercloremia' } : { tone: 'emerald', text: 'Faixa usual' }
    if (key === 'albumin') return value < 3.5 ? { tone: 'amber', text: 'Baixa (corrigir AG)' } : { tone: 'emerald', text: 'Faixa usual' }
    return { tone: 'slate', text: 'Sem classificação' }
  }

  const getAsthmaFieldFeedback = (key: AsthmaInitialFieldKey | AsthmaReevalFieldKey, value: number | null): { tone: FeedbackTone; text: string } => {
    if (value === null) return { tone: 'slate', text: 'Aguardando preenchimento' }

    if (key === 'sato2' || key === 'sato2Re') {
      if (value < 90) return { tone: 'red', text: 'Hipoxemia grave' }
      if (value <= 95) return { tone: 'amber', text: 'Hipoxemia / resposta incompleta' }
      return { tone: 'emerald', text: 'Saturação adequada' }
    }

    if (key === 'fr' || key === 'frRe') {
      if (value > 30) return { tone: 'red', text: 'Taquipneia grave' }
      if (value >= 25) return { tone: 'amber', text: 'Taquipneia moderada' }
      return { tone: 'emerald', text: 'FR mais favorável' }
    }

    if (key === 'fc') {
      if (value > 120) return { tone: 'red', text: 'Taquicardia grave' }
      if (value >= 110) return { tone: 'amber', text: 'Taquicardia moderada' }
      return { tone: 'emerald', text: 'FC mais favorável' }
    }

    if (key === 'pfe' || key === 'pfeRe') {
      if (value < 40) return { tone: 'red', text: 'PFE grave (<40%)' }
      if (value <= 69) return { tone: 'amber', text: 'PFE moderado (40–69%)' }
      return { tone: 'emerald', text: 'PFE favorável (≥70%)' }
    }

    if (key === 'paco2') {
      if (value >= 45) return { tone: 'red', text: 'Hipercapnia / risco de fadiga' }
      if (value >= 35) return { tone: 'amber', text: 'PaCO2 normal em crise importante: atenção' }
      return { tone: 'emerald', text: 'Hipocapnia compatível com hiperventilação' }
    }

    return { tone: 'slate', text: 'Sem classificação' }
  }

  const getFeedbackToneClass = (tone: FeedbackTone) => {
    if (tone === 'red') return 'border-red-300 bg-red-50 text-red-700'
    if (tone === 'amber') return 'border-amber-300 bg-amber-50 text-amber-700'
    if (tone === 'emerald') return 'border-emerald-300 bg-emerald-50 text-emerald-700'
    return 'border-slate-300 bg-slate-50 text-slate-600'
  }

  const gasometryStepOptions = useMemo(() => {
    if (!isGasometryFlow || !currentStepData) return null
    const pick = (nextStep: string) => currentStepData.options?.find(option => option.nextStep === nextStep)
    const labs = savedGasometryLabs || gasometryValidation.parsed
    const ph = labs.ph ?? null
    const pco2 = labs.pco2 ?? null
    const hco3 = labs.hco3 ?? null
    const na = labs.sodium ?? null
    const cl = labs.chloride ?? null
    const albumin = labs.albumin ?? null
    if (currentStepData.id === 'avaliar_ph' && ph !== null) {
      return [pick(ph < 7.35 ? 'acidemia_eixo' : ph <= 7.45 ? 'ph_normal_checar' : 'alcalemia_eixo')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidemia_eixo' && pco2 !== null && hco3 !== null) {
      const list = []
      if (pco2 > 45) list.push(pick('acidose_respiratoria_classificar'))
      if (hco3 < 22) list.push(pick('acidose_metabolica_winter'))
      return list.filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'ph_normal_checar' && pco2 !== null && hco3 !== null) {
      const normalAcidBase = pco2 >= 35 && pco2 <= 45 && hco3 >= 22 && hco3 <= 26
      const po2 = labs.po2 ?? null

      if (normalAcidBase) {
        if (po2 !== null) {
           if (po2 < 40) return [pick('equilibrio_acido_base_com_hipoxemia_grave')].filter(Boolean) as EmergencyOption[]
           if (po2 < 60) return [pick('equilibrio_acido_base_com_hipoxemia_moderada')].filter(Boolean) as EmergencyOption[]
           if (po2 < 80) return [pick('equilibrio_acido_base_com_hipoxemia_leve')].filter(Boolean) as EmergencyOption[]
        }
        return [pick('gasometria_normal')].filter(Boolean) as EmergencyOption[]
      }

      return [pick('disturbio_misto_ph_normal')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_respiratoria_classificar' && pco2 !== null && hco3 !== null) {
      const delta = (pco2 - 40) / 10
      const acute = 24 + delta
      const chronic = 24 + 4 * delta
      const isAcute = Math.abs(hco3 - acute) <= Math.abs(hco3 - chronic)
      return [pick(isAcute ? 'acidose_respiratoria_aguda' : 'acidose_respiratoria_cronica')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_metabolica_winter' && pco2 !== null && hco3 !== null) {
      return [pick('acidose_metabolica_ag')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_metabolica_ag' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      return [pick(agCorr <= 12 ? 'acidose_metabolica_hipercloremica' : 'acidose_metabolica_delta_delta')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_metabolica_delta_delta' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      const deltaHco3 = 24 - hco3
      if (deltaHco3 <= 0) return [pick('acidose_metabolica_ag_alto')].filter(Boolean) as EmergencyOption[]
      const ratio = (agCorr - 10) / deltaHco3
      const next = ratio > 2 ? 'acidose_metabolica_ag_alto_alcalose' : ratio < 1 ? 'acidose_metabolica_ag_alto_acidose_normo_ag' : 'acidose_metabolica_ag_alto'
      return [pick(next)].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'alcalemia_eixo' && pco2 !== null && hco3 !== null) {
      const list = []
      if (hco3 > 27) list.push(pick('alcalose_metabolica_compensacao'))
      if (pco2 < 35) list.push(pick('alcalose_respiratoria_compensacao'))
      return list.filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'alcalose_metabolica_compensacao' && pco2 !== null && hco3 !== null) {
      const expected = hco3 + 15
      const within = pco2 >= expected - 2 && pco2 <= expected + 2
      return [pick(within ? 'alcalose_metabolica_compensada' : 'alcalose_metabolica_mista')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'alcalose_respiratoria_compensacao' && pco2 !== null && hco3 !== null) {
      const delta = (40 - pco2) / 10
      const acute = 24 - 2 * delta
      const chronic = 24 - 5 * delta
      const acuteOk = hco3 >= acute - 2 && hco3 <= acute + 2
      const chronicOk = hco3 >= chronic - 2 && hco3 <= chronic + 2
      const next = chronicOk ? 'alcalose_respiratoria_cronica' : acuteOk ? 'alcalose_respiratoria_aguda' : 'alcalose_respiratoria_mista'
      return [pick(next)].filter(Boolean) as EmergencyOption[]
    }
    return null
  }, [isGasometryFlow, currentStepData, savedGasometryLabs, gasometryValidation.parsed])

  const asthmaStepOptions = useMemo(() => {
    if (!isAsthmaFlow || !currentStepData) return null
    const pick = (nextStep: string) => currentStepData.options?.find(option => option.nextStep === nextStep)
    const initial = savedAsthmaInitial?.values || asthmaInitialValidation.parsed
    const reeval = savedAsthmaReeval?.values || asthmaReevalValidation.parsed
    const sat = initial.sato2 ?? null
    const fr = initial.fr ?? null
    const fc = initial.fc ?? null
    const pfe = initial.pfe ?? null
    const paco2 = initial.paco2 ?? null
    const satRe = reeval.sato2Re ?? null
    const frRe = reeval.frRe ?? null
    const pfeRe = reeval.pfeRe ?? null
    const flags = savedAsthmaInitial?.flags || asthmaFlags
    const reFlags = savedAsthmaReeval?.flags || asthmaReevalFlags

    if (currentStepData.id === 'asma_classificacao_gravidade' && sat !== null && fr !== null && fc !== null && pfe !== null) {
      const ameacaVida = flags.toraxSilente || flags.cianose || flags.confusao || flags.exaustao || flags.sonolencia || (paco2 !== null && paco2 >= 45)
      if (ameacaVida) return [pick('asma_tratamento_1h_grave_vida')].filter(Boolean) as EmergencyOption[]
      const grave = fr > 30 || fc > 120 || sat < 90 || pfe < 40 || flags.falaPalavras
      if (grave) return [pick('asma_tratamento_1h_grave_vida')].filter(Boolean) as EmergencyOption[]
      const moderada = (fr >= 25 && fr <= 30) || (sat >= 90 && sat < 95) || (pfe >= 40 && pfe <= 69) || flags.incapazFrases || flags.usoMusculatura
      return [pick(moderada ? 'asma_tratamento_1h_leve_moderada' : 'asma_tratamento_1h_leve_moderada')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_decisao_1h' && satRe !== null && frRe !== null && pfeRe !== null) {
      const melhora = pfeRe > 70 && satRe >= 94 && frRe < 25 && reFlags.melhoraClinica
      if (melhora) return [pick('asma_resposta_boa')].filter(Boolean) as EmergencyOption[]
      const parcial = (pfeRe >= 40 && pfeRe <= 69) || (satRe >= 90 && satRe < 94) || reFlags.necessidadeBroncoRepetido
      if (parcial) return [pick('asma_resposta_incompleta')].filter(Boolean) as EmergencyOption[]
      return [pick('asma_resposta_ma')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_escalonamento') {
      if (flags.exaustao || flags.confusao || flags.toraxSilente || (paco2 !== null && paco2 >= 45)) {
        return [pick('asma_falencia_respiratoria')].filter(Boolean) as EmergencyOption[]
      }
      return [pick('asma_resgate_magnesio')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_falencia_respiratoria') {
      return [pick('asma_intubacao'), pick('asma_uti')].filter(Boolean) as EmergencyOption[]
    }

    return null
  }, [
    isAsthmaFlow,
    currentStepData,
    savedAsthmaInitial,
    savedAsthmaReeval,
    asthmaInitialValidation.parsed,
    asthmaReevalValidation.parsed,
    asthmaFlags,
    asthmaReevalFlags
  ])

  const gasometryStepNarrative = useMemo(() => {
    if (!isGasometryFlow || !currentStepData) return null
    const labs = savedGasometryLabs || gasometryValidation.parsed
    const ph = labs.ph ?? null
    const pco2 = labs.pco2 ?? null
    const hco3 = labs.hco3 ?? null
    const na = labs.sodium ?? null
    const cl = labs.chloride ?? null
    const albumin = labs.albumin ?? null
    if (currentStepData.id === 'avaliar_ph' && ph !== null) {
      return ph < 7.35
        ? `Acidemia identificada porque pH=${formatGasometryNumber(ph)} (<7,35).`
        : ph <= 7.45
          ? `pH normal identificado porque pH=${formatGasometryNumber(ph)} (7,35–7,45).`
          : `Alcalemia identificada porque pH=${formatGasometryNumber(ph)} (>7,45).`
    }
    if (currentStepData.id === 'acidemia_eixo' && pco2 !== null && hco3 !== null) {
      const reasons = []
      if (pco2 > 45) reasons.push(`PaCO2=${formatGasometryNumber(pco2, 1)} >45 sugere acidose respiratória`)
      if (hco3 < 22) reasons.push(`HCO3=${formatGasometryNumber(hco3, 1)} <22 sugere acidose metabólica`)
      return reasons.length ? reasons.join(' | ') : 'Valores não atendem critérios clássicos de eixo único.'
    }
    if (currentStepData.id === 'ph_normal_checar' && pco2 !== null && hco3 !== null) {
      const normal = pco2 >= 35 && pco2 <= 45 && hco3 >= 22 && hco3 <= 26
      return normal
        ? `pH normal com PaCO2=${formatGasometryNumber(pco2, 1)} e HCO3=${formatGasometryNumber(hco3, 1)} em faixa normal. Verificando oxigenação...`
        : `pH normal, porém PaCO2=${formatGasometryNumber(pco2, 1)} e/ou HCO3=${formatGasometryNumber(hco3, 1)} alterados, sugerindo distúrbio misto.`
    }
    if (currentStepData.id === 'gasometria_normal') {
      const labs = savedGasometryLabs || gasometryValidation.parsed
      const po2 = labs.po2 ?? null
      return po2 !== null 
        ? `Gasometria normal: Equilíbrio ácido-base preservado e PaO2=${formatGasometryNumber(po2, 1)} (Adequada).`
        : `Gasometria normal: Equilíbrio ácido-base preservado (PaO2 não informada).`
    }
    if (currentStepData.id === 'equilibrio_acido_base_com_hipoxemia_leve') {
       const labs = savedGasometryLabs || gasometryValidation.parsed
       const po2 = labs.po2 ?? 0
       return `Hipoxemia Leve: PaO2=${formatGasometryNumber(po2, 1)} (60-79 mmHg).`
    }
    if (currentStepData.id === 'equilibrio_acido_base_com_hipoxemia_moderada') {
       const labs = savedGasometryLabs || gasometryValidation.parsed
       const po2 = labs.po2 ?? 0
       return `Hipoxemia Moderada: PaO2=${formatGasometryNumber(po2, 1)} (40-59 mmHg).`
    }
    if (currentStepData.id === 'equilibrio_acido_base_com_hipoxemia_grave') {
       const labs = savedGasometryLabs || gasometryValidation.parsed
       const po2 = labs.po2 ?? 0
       return `Hipoxemia Grave: PaO2=${formatGasometryNumber(po2, 1)} (<40 mmHg).`
    }
    if (currentStepData.id === 'acidose_metabolica_winter' && pco2 !== null && hco3 !== null) {
      const expected = 1.5 * hco3 + 8
      const low = expected - 2
      const high = expected + 2
      const compensation =
        pco2 < low
          ? 'PaCO2 abaixo do esperado, sugerindo alcalose respiratória associada.'
          : pco2 > high
            ? 'PaCO2 acima do esperado, sugerindo acidose respiratória associada.'
            : 'PaCO2 dentro da faixa esperada para compensação.'
      return `Winter: PaCO2 esperada ${formatGasometryNumber(low, 1)}–${formatGasometryNumber(high, 1)}. PaCO2 medida=${formatGasometryNumber(pco2, 1)}. ${compensation} Prosseguindo para cálculo do Ânion Gap.`
    }
    if (currentStepData.id === 'acidose_metabolica_ag' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      return albumin !== null
        ? `AG=${formatGasometryNumber(ag, 1)} e AG corrigido=${formatGasometryNumber(agCorr, 1)} (albumina ${formatGasometryNumber(albumin, 1)}).`
        : `AG=${formatGasometryNumber(ag, 1)} sem correção de albumina.`
    }
    if (currentStepData.id === 'acidose_metabolica_delta_delta' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      const deltaHco3 = 24 - hco3
      const ratio = deltaHco3 > 0 ? (agCorr - 10) / deltaHco3 : null
      return ratio === null
        ? 'Δ/Δ não aplicável pois ΔHCO3 <= 0.'
        : `ΔAG=${formatGasometryNumber(agCorr - 10, 1)} | ΔHCO3=${formatGasometryNumber(deltaHco3, 1)} | Δ/Δ=${formatGasometryNumber(ratio, 2)}.`
    }
    if (currentStepData.id === 'alcalemia_eixo' && pco2 !== null && hco3 !== null) {
      const reasons = []
      if (hco3 > 27) reasons.push(`HCO3=${formatGasometryNumber(hco3, 1)} >27 sugere alcalose metabólica`)
      if (pco2 < 35) reasons.push(`PaCO2=${formatGasometryNumber(pco2, 1)} <35 sugere alcalose respiratória`)
      return reasons.length ? reasons.join(' | ') : 'Sem critério clássico de eixo único na alcalemia.'
    }
    if (currentStepData.id === 'alcalose_metabolica_compensacao' && pco2 !== null && hco3 !== null) {
      const expected = hco3 + 15
      return `PaCO2 esperada na alcalose metabólica: ${formatGasometryNumber(expected - 2, 1)}–${formatGasometryNumber(expected + 2, 1)}. Medida=${formatGasometryNumber(pco2, 1)}.`
    }
    if (currentStepData.id === 'alcalose_respiratoria_compensacao' && pco2 !== null && hco3 !== null) {
      const delta = (40 - pco2) / 10
      const acute = 24 - 2 * delta
      const chronic = 24 - 5 * delta
      return `HCO3 esperado agudo ${formatGasometryNumber(acute - 2, 1)}–${formatGasometryNumber(acute + 2, 1)} | crônico ${formatGasometryNumber(chronic - 2, 1)}–${formatGasometryNumber(chronic + 2, 1)}. Medido=${formatGasometryNumber(hco3, 1)}.`
    }
    return null
  }, [isGasometryFlow, currentStepData, savedGasometryLabs, gasometryValidation.parsed])

  const asthmaStepNarrative = useMemo(() => {
    if (!isAsthmaFlow || !currentStepData) return null
    const initial = savedAsthmaInitial?.values || asthmaInitialValidation.parsed
    const reeval = savedAsthmaReeval?.values || asthmaReevalValidation.parsed
    const sat = initial.sato2 ?? null
    const fr = initial.fr ?? null
    const fc = initial.fc ?? null
    const pfe = initial.pfe ?? null
    const paco2 = initial.paco2 ?? null
    const satRe = reeval.sato2Re ?? null
    const frRe = reeval.frRe ?? null
    const pfeRe = reeval.pfeRe ?? null
    const flags = savedAsthmaInitial?.flags || asthmaFlags

    if (currentStepData.id === 'asma_classificacao_gravidade' && sat !== null && fr !== null && fc !== null && pfe !== null) {
      if (flags.toraxSilente || flags.cianose || flags.confusao || flags.exaustao || flags.sonolencia || (paco2 !== null && paco2 >= 45)) {
        return `Ameaça à vida: sinais críticos e/ou PaCO2 ${paco2 ?? '--'} indicam risco de falência respiratória.`
      }
      if (fr > 30 || fc > 120 || sat < 90 || pfe < 40 || flags.falaPalavras) {
        return `Crise grave: FR ${fr}, FC ${fc}, SatO2 ${sat}% e PFE ${pfe}% sugerem necessidade de manejo agressivo.`
      }
      if ((fr >= 25 && fr <= 30) || (sat >= 90 && sat < 95) || (pfe >= 40 && pfe <= 69) || flags.incapazFrases || flags.usoMusculatura) {
        return `Crise moderada: parâmetros intermediários com necessidade de tratamento intensivo no PS.`
      }
      return `Crise leve: parâmetros sem critérios de gravidade imediata.`
    }
    if (currentStepData.id === 'asma_tratamento_1h_grave_vida') {
      return 'Crise grave/risco de vida: iniciar oxigênio, broncodilatação combinada e corticoide IV de forma imediata.'
    }
    if (currentStepData.id === 'asma_o2_leve_moderada' && sat !== null) {
      return sat < 94 ? `SatO2 ${sat}%: indicar oxigênio suplementar com meta 93–95%.` : `SatO2 ${sat}%: manter monitorização e suporte conforme resposta.`
    }
    if (currentStepData.id === 'asma_decisao_1h' && satRe !== null && frRe !== null && pfeRe !== null) {
      return `Reavaliação 1h: SatO2 ${satRe}%, FR ${frRe}, PFE ${pfeRe}% para decidir alta, observação ou escalonamento.`
    }
    if (currentStepData.id === 'asma_escalonamento') {
      return 'Sem resposta adequada após terapia inicial: iniciar sequência de terapias de resgate e reavaliar necessidade de UTI.'
    }
    if (currentStepData.id === 'asma_falencia_respiratoria') {
      return 'Sinais de exaustão/hipercapnia/consciência alterada exigem via aérea avançada e suporte intensivo.'
    }
    return null
  }, [
    isAsthmaFlow,
    currentStepData,
    savedAsthmaInitial,
    savedAsthmaReeval,
    asthmaInitialValidation.parsed,
    asthmaReevalValidation.parsed,
    asthmaFlags
  ])

  useEffect(() => {
    if (!isGasometryFlow || currentStepData?.id !== 'coleta_parametros') return
    if (!savedGasometryLabs) return
    setGasometryDraft({
      ph: savedGasometryLabs.ph != null ? String(savedGasometryLabs.ph) : '',
      pco2: savedGasometryLabs.pco2 != null ? String(savedGasometryLabs.pco2) : '',
      hco3: savedGasometryLabs.hco3 != null ? String(savedGasometryLabs.hco3) : '',
      be: savedGasometryLabs.be != null ? String(savedGasometryLabs.be) : '',
      po2: savedGasometryLabs.po2 != null ? String(savedGasometryLabs.po2) : '',
      sodium: savedGasometryLabs.sodium != null ? String(savedGasometryLabs.sodium) : '',
      chloride: savedGasometryLabs.chloride != null ? String(savedGasometryLabs.chloride) : '',
      albumin: savedGasometryLabs.albumin != null ? String(savedGasometryLabs.albumin) : ''
    })
  }, [isGasometryFlow, currentStepData?.id, savedGasometryLabs])

  useEffect(() => {
    if (!isAsthmaFlow || currentStepData?.id !== 'asma_avaliacao_inicial') return
    if (!savedAsthmaInitial) return
    setAsthmaInitialDraft({
      sato2: savedAsthmaInitial.values?.sato2 != null ? String(savedAsthmaInitial.values.sato2) : '',
      fr: savedAsthmaInitial.values?.fr != null ? String(savedAsthmaInitial.values.fr) : '',
      fc: savedAsthmaInitial.values?.fc != null ? String(savedAsthmaInitial.values.fc) : '',
      pfe: savedAsthmaInitial.values?.pfe != null ? String(savedAsthmaInitial.values.pfe) : '',
      paco2: savedAsthmaInitial.values?.paco2 != null ? String(savedAsthmaInitial.values.paco2) : ''
    })
    if (savedAsthmaInitial.flags) {
      setAsthmaFlags(savedAsthmaInitial.flags)
    }
  }, [isAsthmaFlow, currentStepData?.id, savedAsthmaInitial])

  useEffect(() => {
    if (!isAsthmaFlow || currentStepData?.id !== 'asma_reavaliacao_1h') return
    if (!savedAsthmaReeval) return
    setAsthmaReevalDraft({
      sato2Re: savedAsthmaReeval.values?.sato2Re != null ? String(savedAsthmaReeval.values.sato2Re) : '',
      frRe: savedAsthmaReeval.values?.frRe != null ? String(savedAsthmaReeval.values.frRe) : '',
      pfeRe: savedAsthmaReeval.values?.pfeRe != null ? String(savedAsthmaReeval.values.pfeRe) : ''
    })
    if (savedAsthmaReeval.flags) {
      setAsthmaReevalFlags(savedAsthmaReeval.flags)
    }
  }, [isAsthmaFlow, currentStepData?.id, savedAsthmaReeval])

  useEffect(() => {
    if (!isTVPLegSelection) {
      setSelectedTVPLeg('')
      return
    }
    const savedLeg = parseTVPSelectedLeg(answers[currentStep])
    setSelectedTVPLeg(savedLeg)
  }, [isTVPLegSelection, answers, currentStep])

  useEffect(() => {
    if (!keepPneumoniaPocusDetailsOpen) return

    const frame = window.requestAnimationFrame(() => {
      const details = document.querySelector<HTMLDetailsElement>('[data-pac-pocus-details="true"]')
      if (details) details.open = true
    })

    return () => window.cancelAnimationFrame(frame)
  }, [keepPneumoniaPocusDetailsOpen, pneumoniaReferenceImage])

  useEffect(() => {
    if (!isTVPClinicalEvaluation) {
      setSelectedClinicalFindings([])
      setOtherClinicalFinding('')
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedClinicalFindings([])
      setOtherClinicalFinding('')
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const achados = Array.isArray(parsed?.sinaisEAchados) ? parsed.sinaisEAchados : []
      const outros = typeof parsed?.outrosAchados === 'string' ? parsed.outrosAchados : ''
      setSelectedClinicalFindings(achados)
      setOtherClinicalFinding(outros)
    } catch {
      setSelectedClinicalFindings([])
      setOtherClinicalFinding('')
    }
  }, [isTVPClinicalEvaluation, answers, currentStep])

  useEffect(() => {
    if (!isTVPWellsScore) {
      setSelectedWellsCriteria([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedWellsCriteria([])
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const criteria = Array.isArray(parsed?.criteriosSelecionados) ? parsed.criteriosSelecionados : []
      setSelectedWellsCriteria(criteria)
    } catch {
      setSelectedWellsCriteria([])
    }
  }, [isTVPWellsScore, answers, currentStep])

  useEffect(() => {
    if (!isTVPContraCheck) {
      setSelectedContraindications([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedContraindications([])
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const items = Array.isArray(parsed?.contraindicacoesSelecionadas) ? parsed.contraindicacoesSelecionadas : []
      setSelectedContraindications(items)
    } catch {
      setSelectedContraindications([])
    }
  }, [isTVPContraCheck, answers, currentStep])

  useEffect(() => {
    if (!isTVPTreatmentInitial) {
      setSelectedTherapies([])
      setSelectedDurationPlan('')
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedTherapies([])
      setSelectedDurationPlan('')
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const therapies = Array.isArray(parsed?.opcoesTerapeuticasSelecionadas)
        ? parsed.opcoesTerapeuticasSelecionadas.filter(
            (therapyId: unknown) => typeof therapyId === 'string' && (therapyId !== 'hnf' || hasTVPICUDisposition)
          )
        : []
      const duration = typeof parsed?.planoDuracaoSelecionado === 'string' ? parsed.planoDuracaoSelecionado : ''
      setSelectedTherapies(therapies)
      setSelectedDurationPlan(duration)
    } catch {
      setSelectedTherapies([])
      setSelectedDurationPlan('')
    }
  }, [isTVPTreatmentInitial, answers, currentStep, hasTVPICUDisposition])

  useEffect(() => {
    if (!isInfluenzaSeverityStep) {
      setInfluenzaSeveritySigns([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setInfluenzaSeveritySigns([])
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const items = Array.isArray(parsed?.sinaisGravidadeSelecionados) ? parsed.sinaisGravidadeSelecionados : []
      setInfluenzaSeveritySigns(items)
    } catch {
      setInfluenzaSeveritySigns([])
    }
  }, [isInfluenzaSeverityStep, answers, currentStep])

  useEffect(() => {
    if (!isInfluenzaRiskStep) {
      setInfluenzaRiskFactors([])
      setInfluenzaWorseningSigns([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setInfluenzaRiskFactors([])
      setInfluenzaWorseningSigns([])
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const riskItems = Array.isArray(parsed?.fatoresRiscoSelecionados) ? parsed.fatoresRiscoSelecionados : []
      const worseningItems = Array.isArray(parsed?.sinaisPioraSelecionados) ? parsed.sinaisPioraSelecionados : []
      setInfluenzaRiskFactors(riskItems)
      setInfluenzaWorseningSigns(worseningItems)
    } catch {
      setInfluenzaRiskFactors([])
      setInfluenzaWorseningSigns([])
    }
  }, [isInfluenzaRiskStep, answers, currentStep])

  useEffect(() => {
    if (!isInfluenzaICUStep) {
      setInfluenzaICUCriteria([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setInfluenzaICUCriteria([])
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const items = Array.isArray(parsed?.criteriosUTISelecionados) ? parsed.criteriosUTISelecionados : []
      setInfluenzaICUCriteria(items)
    } catch {
      setInfluenzaICUCriteria([])
    }
  }, [isInfluenzaICUStep, answers, currentStep])

  useEffect(() => {
    if (!isAVCCincinnatiStep) {
      setCincinnatiInfoOpen(false)
    }
  }, [isAVCCincinnatiStep])

  useEffect(() => {
    if (!isInfluenzaAmbulatoryFinalStep) {
      setInfluenzaPrescriptionPreview(null)
      setInfluenzaPrescriptionCopied(false)
    }
  }, [isInfluenzaAmbulatoryFinalStep])

  useEffect(() => {
    if (!isPneumoniaPsiStep) {
      setPneumoniaPsiValues(defaultPsiValues(patient))
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criterios) setPneumoniaPsiValues({ ...defaultPsiValues(patient), ...parsed.criterios })
    } catch {
      setPneumoniaPsiValues(defaultPsiValues(patient))
    }
  }, [answers, currentStep, isPneumoniaPsiStep, patient])

  useEffect(() => {
    if (!isPneumoniaCurbStep && !isPneumoniaCurbProtocolStep) {
      setPneumoniaCurbValues(defaultCurbValues(patient))
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      if (isPneumoniaCurbProtocolStep) {
        setPneumoniaCurbValues(pneumoniaAutomaticCurbValues)
      }
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criterios) setPneumoniaCurbValues({ ...defaultCurbValues(patient), ...parsed.criterios })
    } catch {
      setPneumoniaCurbValues(isPneumoniaCurbProtocolStep ? pneumoniaAutomaticCurbValues : defaultCurbValues(patient))
    }
  }, [answers, currentStep, isPneumoniaCurbProtocolStep, isPneumoniaCurbStep, patient, pneumoniaAutomaticCurbValues])

  useEffect(() => {
    if (!isInfluenzaPhysicalExamStep) return
    const saved = answers[currentStep]
    if (!saved) {
      setInfluenzaPhysicalExam(defaultPneumoniaPhysicalExam())
      setInfluenzaVitalSigns(defaultFlowVitalSigns(patient))
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.sinaisVitais) {
        setInfluenzaVitalSigns({
          ...defaultFlowVitalSigns(patient),
          ...parsed.sinaisVitais
        })
      }
      if (parsed?.exameFisico) {
        setInfluenzaPhysicalExam({
          ...defaultPneumoniaPhysicalExam(),
          ...parsed.exameFisico
        })
      }
    } catch {
      setInfluenzaPhysicalExam(defaultPneumoniaPhysicalExam())
      setInfluenzaVitalSigns(defaultFlowVitalSigns(patient))
    }
  }, [answers, currentStep, isInfluenzaPhysicalExamStep, patient])

  useEffect(() => {
    if (!isInfluenzaViralPanelStep) {
      setInfluenzaExamRequestOpen(false)
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed?.examesSolicitados)) {
        setInfluenzaSelectedExams(parsed.examesSolicitados.map((item: unknown) => String(item)))
      }
    } catch {
      setInfluenzaSelectedExams(influenzaDefaultRequestedExams)
    }
  }, [answers, currentStep, isInfluenzaViralPanelStep])

  useEffect(() => {
    if (!isTVPPhysicalExamStep) return
    const saved = answers.tvp_exame_fisico
    if (!saved) {
      setTVPPhysicalExam(defaultPneumoniaPhysicalExam())
      setTVPVitalSigns(defaultFlowVitalSigns(patient))
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.sinaisVitais) {
        setTVPVitalSigns({ ...defaultFlowVitalSigns(patient), ...parsed.sinaisVitais })
      }
      if (parsed?.exameFisico) {
        setTVPPhysicalExam({ ...defaultPneumoniaPhysicalExam(), ...parsed.exameFisico })
      }
    } catch {
      setTVPPhysicalExam(defaultPneumoniaPhysicalExam())
      setTVPVitalSigns(defaultFlowVitalSigns(patient))
    }
  }, [answers.tvp_exame_fisico, isTVPPhysicalExamStep, patient])

  useEffect(() => {
    if (!isTEPPhysicalExamStep) return
    const saved = answers.tep_exame_fisico
    if (!saved) {
      setTEPPhysicalExam(defaultPneumoniaPhysicalExam())
      setTEPVitalSigns(defaultFlowVitalSigns(patient))
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.sinaisVitais) setTEPVitalSigns({ ...defaultFlowVitalSigns(patient), ...parsed.sinaisVitais })
      if (parsed?.exameFisico) setTEPPhysicalExam({ ...defaultPneumoniaPhysicalExam(), ...parsed.exameFisico })
    } catch {
      setTEPPhysicalExam(defaultPneumoniaPhysicalExam())
      setTEPVitalSigns(defaultFlowVitalSigns(patient))
    }
  }, [answers.tep_exame_fisico, isTEPPhysicalExamStep, patient])

  useEffect(() => {
    if (!isPneumoniaPhysicalExamStep) return
    const saved = answers[currentStep]
    if (!saved) {
      setPneumoniaPhysicalExam(defaultPneumoniaPhysicalExam())
      setPneumoniaVitalSigns(defaultFlowVitalSigns(patient))
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.sinaisVitais) {
        setPneumoniaVitalSigns({
          ...defaultFlowVitalSigns(patient),
          ...parsed.sinaisVitais
        })
      }
      if (parsed?.exameFisico) {
        setPneumoniaPhysicalExam({
          ...defaultPneumoniaPhysicalExam(),
          ...parsed.exameFisico
        })
      }
    } catch {
      setPneumoniaPhysicalExam(defaultPneumoniaPhysicalExam())
      setPneumoniaVitalSigns(defaultFlowVitalSigns(patient))
    }
  }, [answers, currentStep, isPneumoniaPhysicalExamStep, patient])

  useEffect(() => {
    if (!isPneumoniaExamRequestStep) return
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed?.examesSelecionados)) {
        setPneumoniaSelectedExams(parsed.examesSelecionados.map((item: unknown) => String(item)))
      }
    } catch {
      setPneumoniaSelectedExams(pneumoniaInitialLabPackage)
    }
  }, [answers, currentStep, isPneumoniaExamRequestStep])

  useEffect(() => {
    if (!isPneumoniaLabResultsStep) return
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.resultados && typeof parsed.resultados === 'object') {
        setPneumoniaLabResults(parsed.resultados as PneumoniaLabResults)
      }
    } catch {
      setPneumoniaLabResults({})
    }
  }, [answers, currentStep, isPneumoniaLabResultsStep])

  useEffect(() => {
    if (!isPneumoniaAmbulatoryPrescriptionStep) {
      setPneumoniaComorbidities([])
      setPneumoniaPseudomonasRisk([])
      setPneumoniaPrescriptionPreview(null)
      setPneumoniaPrescriptionCopied(false)
      setPneumoniaPrescriptionGenerated(false)
    }
  }, [isPneumoniaAmbulatoryPrescriptionStep])

  useEffect(() => {
    if (!isSinusitisPrescriptionFinalStep) {
      setSinusitisPrescriptionPreview(null)
      setSinusitisPrescriptionCopied(false)
    }
  }, [isSinusitisPrescriptionFinalStep])

  useEffect(() => {
    if (!isFaringoamigdalitePrescriptionFinalStep) {
      setFaringoamigdalitePrescriptionPreview(null)
      setFaringoamigdalitePrescriptionCopied(false)
    }
  }, [isFaringoamigdalitePrescriptionFinalStep])

  useEffect(() => {
    if (!isMonoartritePrescriptionFinalStep) {
      setMonoartritePrescriptionPreview(null)
      setMonoartritePrescriptionCopied(false)
    }
  }, [isMonoartritePrescriptionFinalStep])

  useEffect(() => {
    if (!isAnsiedadeMedicationStep) {
      setAnsiedadePrescriptionPreview(null)
      setAnsiedadePrescriptionCopied(false)
      setAnsiedadePrescriptionGenerated(false)
    }
  }, [isAnsiedadeMedicationStep])

  useEffect(() => {
    if (!isVertigemPrescriptionFinalStep) {
      setVertigemPrescriptionPreview(null)
      setVertigemPrescriptionCopied(false)
    }
  }, [isVertigemPrescriptionFinalStep])

  useEffect(() => {
    if (!isCefaleiaPrescriptionFinalStep) {
      setCefaleiaPrescriptionPreview(null)
      setCefaleiaPrescriptionCopied(false)
    }
  }, [isCefaleiaPrescriptionFinalStep])

  useEffect(() => {
    if (!isAgitacaoPrescriptionFinalStep) {
      setAgitacaoPrescriptionPreview(null)
      setAgitacaoPrescriptionCopied(false)
    }
  }, [isAgitacaoPrescriptionFinalStep])

  useEffect(() => {
    if (!isPepHivPrescriptionFinalStep) {
      setPepHivPrescriptionPreview(null)
      setPepHivPrescriptionCopied(false)
      setPepHivPrescriptionGenerated(false)
    }
  }, [isPepHivPrescriptionFinalStep])

  useEffect(() => {
    if (!isAnaphylaxisCriteriaStep) {
      setSelectedAnaphylaxisCriteria([])
      setAnaphylaxisCriteriaInfo(null)
      setAnaphylaxisEmergencyAllocationOpen(false)
      setPendingAnaphylaxisEmergencyOption(null)
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      const validKeys = ANAPHYLAXIS_DIAGNOSTIC_CRITERIA.map((item) => item.key)
      const items = Array.isArray(parsed?.criteriosSelecionados)
        ? parsed.criteriosSelecionados.filter((item: string) => validKeys.includes(item as AnaphylaxisCriteriaKey))
        : []
      setSelectedAnaphylaxisCriteria(items)
    } catch {
      setSelectedAnaphylaxisCriteria([])
    }
  }, [answers, currentStep, isAnaphylaxisCriteriaStep])

  useEffect(() => {
    if (!isBellSideSelection) return
    const saved = answers.bell_inicio
    if (!saved) {
      setBellChiefComplaint('')
      return
    }
    try {
      const parsed = JSON.parse(saved)
      setBellChiefComplaint(typeof parsed?.queixaPrincipal === 'string' ? parsed.queixaPrincipal : '')
    } catch {
      setBellChiefComplaint('')
    }
  }, [answers.bell_inicio, isBellSideSelection])

  useEffect(() => {
    if (!isBellPhysicalExamStep) return
    const saved = answers.bell_exame_fisico
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      setBellPhysicalExamFindings(Array.isArray(parsed?.achadosSelecionados) ? parsed.achadosSelecionados : [])
      setBellPhysicalExamNotes(typeof parsed?.observacoes === 'string' ? parsed.observacoes : '')
    } catch {
      setBellPhysicalExamFindings([])
      setBellPhysicalExamNotes('')
    }
  }, [answers.bell_exame_fisico, isBellPhysicalExamStep])

  useEffect(() => {
    if (!isBellCriteriaStep) {
      setBellCriteriaChecks(defaultBellCriteriaChecks())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      const selected = Array.isArray(parsed?.criteriosSelecionados) ? parsed.criteriosSelecionados : []
      setBellCriteriaChecks({
        ...defaultBellCriteriaChecks(),
        ...Object.fromEntries(
          BELL_DIAGNOSTIC_CRITERIA.map((item) => [item.key, selected.includes(item.key)])
        )
      } as Record<BellCriteriaKey, boolean>)
    } catch {
      setBellCriteriaChecks(defaultBellCriteriaChecks())
    }
  }, [answers, currentStep, isBellCriteriaStep])

  useEffect(() => {
    if (!isBellRedFlagsStep) {
      setBellRedFlagChecks(defaultBellRedFlagChecks())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      const selected = Array.isArray(parsed?.redFlagsSelecionadas) ? parsed.redFlagsSelecionadas : []
      setBellRedFlagChecks({
        ...defaultBellRedFlagChecks(),
        ...Object.fromEntries(
          BELL_RED_FLAGS.map((item) => [item.key, selected.includes(item.key)])
        )
      } as Record<BellRedFlagKey, boolean>)
    } catch {
      setBellRedFlagChecks(defaultBellRedFlagChecks())
    }
  }, [answers, currentStep, isBellRedFlagsStep])

  useEffect(() => {
    if (!isBellSupportStep) {
      setBellSupportChecks(defaultBellSupportChecks())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      const selected = Array.isArray(parsed?.criteriosSuporteSelecionados) ? parsed.criteriosSuporteSelecionados : []
      setBellSupportChecks({
        ...defaultBellSupportChecks(),
        ...Object.fromEntries(
          BELL_SUPPORT_CRITERIA.map((item) => [item.key, selected.includes(item.key)])
        )
      } as Record<BellSupportKey, boolean>)
    } catch {
      setBellSupportChecks(defaultBellSupportChecks())
    }
  }, [answers, currentStep, isBellSupportStep])

  useEffect(() => {
    if (!isBellHouseStep) {
      setSelectedBellHouseGrade('')
      setBellTreatmentTimingOpen(false)
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      setSelectedBellHouseGrade(typeof parsed?.houseBrackmann === 'string' ? parsed.houseBrackmann : saved)
    } catch {
      setSelectedBellHouseGrade(saved)
    }
  }, [answers, currentStep, isBellHouseStep])

  useEffect(() => {
    setBellDocumentCopied(false)
  }, [currentStep, isBellDynamicDocumentStep])

  useEffect(() => {
    if (!isBellTreatmentStep) {
      return
    }
    const saved = answers.bell_tratamento_clinico
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.within72Hours === 'boolean') setBellWithin72Hours(parsed.within72Hours)
        if (typeof parsed?.corticosteroid === 'boolean') setBellUseCorticosteroid(parsed.corticosteroid)
        if (['none', 'valaciclovir', 'aciclovir', 'famciclovir'].includes(parsed?.antiviral)) setBellAntiviralChoice(parsed.antiviral)
        if (typeof parsed?.eyeCare === 'boolean') setBellUseEyeCare(parsed.eyeCare)
        return
      } catch {}
    }
    setBellWithin72Hours(null)
    setBellUseCorticosteroid(bellSelectedHouseValue !== 'house_i')
    setBellAntiviralChoice('none')
    setBellUseEyeCare(['house_iv', 'house_v', 'house_vi'].includes(bellSelectedHouseValue))
  }, [answers.bell_tratamento_clinico, bellSelectedHouseValue, isBellTreatmentStep])

  useEffect(() => {
    if (!isAnaphylaxisAdjunctStep) {
      setSelectedAnaphylaxisAdjuncts([])
      setAnaphylaxisAdjunctPrescriptionPreview(null)
      setAnaphylaxisAdjunctPrescriptionCopied(false)
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      const items = Array.isArray(parsed?.tratamentosAdjuntosSelecionados)
        ? parsed.tratamentosAdjuntosSelecionados.filter((item: string) => anaphylaxisAdjunctOrder.includes(item as AnaphylaxisAdjunctKey))
        : []
      setSelectedAnaphylaxisAdjuncts(items)
    } catch {
      setSelectedAnaphylaxisAdjuncts([])
    }
  }, [answers, currentStep, isAnaphylaxisAdjunctStep])

  useEffect(() => {
    if (!isAnaphylaxisDischargeStep) {
      setAnaphylaxisPrescriptionPreview(null)
      setAnaphylaxisPrescriptionCopied(false)
      setAnaphylaxisPrescriptionGenerated(false)
    }
  }, [isAnaphylaxisDischargeStep])

  useEffect(() => {
    if (!isAnaphylaxisAdrenalineStep) {
      setAnaphylaxisAdrenalinePrescriptionOpen(false)
      setAnaphylaxisAdrenalinePrescriptionCopied(false)
      setAnaphylaxisManagementAlertOpen(false)
      setPendingAnaphylaxisManagementOption(null)
    }
  }, [isAnaphylaxisAdrenalineStep])

  useEffect(() => {
    if (!isAnaphylaxisRepeatAdrenalineFinalStep) {
      setAnaphylaxisRepeatPrescriptionOpen(false)
      setAnaphylaxisRepeatPrescriptionCopied(false)
    }
  }, [isAnaphylaxisRepeatAdrenalineFinalStep])

  useEffect(() => {
    if (!isPancreatitisBisapStep) {
      setPancreatitisBisapValues(defaultPancreatitisBisapValues(patient))
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criteriosSelecionados) {
        setPancreatitisBisapValues({ ...defaultPancreatitisBisapValues(patient), ...parsed.criteriosSelecionados })
      }
    } catch {
      setPancreatitisBisapValues(defaultPancreatitisBisapValues(patient))
    }
  }, [answers, currentStep, isPancreatitisBisapStep, patient])

  useEffect(() => {
    if (!isPancreatitisMarshallStep) {
      setPancreatitisMarshallValues(defaultPancreatitisMarshallValues())
      setPancreatitisIcuCriteria([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.valores) {
        setPancreatitisMarshallValues({ ...defaultPancreatitisMarshallValues(), ...parsed.valores })
      }
      if (Array.isArray(parsed?.criteriosUTISelecionados)) {
        setPancreatitisIcuCriteria(parsed.criteriosUTISelecionados)
      }
    } catch {
      setPancreatitisMarshallValues(defaultPancreatitisMarshallValues())
      setPancreatitisIcuCriteria([])
    }
  }, [answers, currentStep, isPancreatitisMarshallStep])

  useEffect(() => {
    if (!isPancreatitisTreatmentFinalStep) {
      setPancreatitisIncludeAntibiotic(false)
      setPancreatitisPrescriptionPreview(null)
      setPancreatitisPrescriptionCopied(false)
      setPancreatitisPrescriptionGenerated(false)
    }
  }, [isPancreatitisTreatmentFinalStep])

  useEffect(() => {
    if (!isCholangitisDiagnosisStep) {
      setCholangitisDiagnosisValues(defaultCholangitisDiagnosisValues())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criteriosSelecionados) {
        setCholangitisDiagnosisValues({ ...defaultCholangitisDiagnosisValues(), ...parsed.criteriosSelecionados })
      }
    } catch {
      setCholangitisDiagnosisValues(defaultCholangitisDiagnosisValues())
    }
  }, [answers, currentStep, isCholangitisDiagnosisStep])

  useEffect(() => {
    if (!isCholangitisSeverityStep) {
      setCholangitisSeverityValues(defaultCholangitisSeverityValues(patient))
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criteriosSelecionados) {
        setCholangitisSeverityValues({ ...defaultCholangitisSeverityValues(patient), ...parsed.criteriosSelecionados })
      }
    } catch {
      setCholangitisSeverityValues(defaultCholangitisSeverityValues(patient))
    }
  }, [answers, currentStep, isCholangitisSeverityStep, patient])

  useEffect(() => {
    if (!isCholangitisTreatmentFinalStep) {
      setCholangitisAntibioticScheme('cefepime_metronidazole')
      setCholangitisPrescriptionPreview(null)
      setCholangitisPrescriptionCopied(false)
      setCholangitisPrescriptionGenerated(false)
    }
  }, [isCholangitisTreatmentFinalStep])

  useEffect(() => {
    if (!isCholecystitisSeverityStep) {
      setCholecystitisSeverityValues(defaultCholecystitisSeverityValues())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criteriosSelecionados) {
        setCholecystitisSeverityValues({ ...defaultCholecystitisSeverityValues(), ...parsed.criteriosSelecionados })
      }
    } catch {
      setCholecystitisSeverityValues(defaultCholecystitisSeverityValues())
    }
  }, [answers, currentStep, isCholecystitisSeverityStep])

  useEffect(() => {
    if (!isCholecystitisTreatmentFinalStep) {
      setCholecystitisAntibioticScheme('ceftriaxone_metronidazole')
      setCholecystitisPrescriptionPreview(null)
      setCholecystitisPrescriptionCopied(false)
      setCholecystitisPrescriptionGenerated(false)
      return
    }

    const choices = getCholecystitisAntibioticChoices(currentStepData?.id)
    if (!choices.some((option) => option.value === cholecystitisAntibioticScheme)) {
      setCholecystitisAntibioticScheme(choices[0]?.value || 'ceftriaxone_metronidazole')
    }
  }, [cholecystitisAntibioticScheme, currentStepData?.id, isCholecystitisTreatmentFinalStep])

  useEffect(() => {
    if (!isAppendicitisAlvaradoStep) {
      setAppendicitisAlvaradoValues(defaultAppendicitisAlvaradoValues())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criteriosSelecionados) {
        setAppendicitisAlvaradoValues({ ...defaultAppendicitisAlvaradoValues(), ...parsed.criteriosSelecionados })
      }
    } catch {
      setAppendicitisAlvaradoValues(defaultAppendicitisAlvaradoValues())
    }
  }, [answers, currentStep, isAppendicitisAlvaradoStep])

  useEffect(() => {
    if (!isAppendicitisTreatmentFinalStep) {
      setAppendicitisAntibioticScheme('ceftriaxone_metronidazole')
      setAppendicitisIncludeAntibiotics(true)
      setAppendicitisPrescriptionPreview(null)
      setAppendicitisPrescriptionCopied(false)
      setAppendicitisPrescriptionGenerated(false)
    }
  }, [isAppendicitisTreatmentFinalStep])

  useEffect(() => {
    if (!isLombalgiaRiskStep) {
      setLombalgiaRiskValues(defaultLombalgiaRiskValues())
      return
    }
    const saved = answers[currentStep]
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.criteriosSelecionados) {
        setLombalgiaRiskValues({ ...defaultLombalgiaRiskValues(), ...parsed.criteriosSelecionados })
      }
    } catch {
      setLombalgiaRiskValues(defaultLombalgiaRiskValues())
    }
  }, [answers, currentStep, isLombalgiaRiskStep])

  useEffect(() => {
    if (!isLombalgiaConservativeFinalStep) {
      setLombalgiaPrescriptionPreview(null)
      setLombalgiaPrescriptionCopied(false)
      setLombalgiaPrescriptionGenerated(false)
    }
  }, [isLombalgiaConservativeFinalStep])

  useEffect(() => {
    if (isTVPClinicalEvaluation) {
      setSectionOpen({
        tvp_clinical_0: true,
        tvp_clinical_1: true,
        tvp_clinical_2: false,
        tvp_clinical_other: true
      })
      return
    }
    if (isTVPWellsScore) {
      setSectionOpen({
        tvp_wells_criteria: true,
        tvp_wells_interpretation: true
      })
      return
    }
    if (isTVPContraCheck) {
      setSectionOpen({
        tvp_treatment_contra: true
      })
      return
    }
    if (isTVPTreatmentInitial) {
      setSectionOpen({
        tvp_treatment_therapies: true,
        tvp_treatment_duration: false,
        tvp_treatment_guidance: false
      })
    }
  }, [currentStep, isTVPClinicalEvaluation, isTVPWellsScore, isTVPContraCheck, isTVPTreatmentInitial])

  useEffect(() => {
    if (isTVPTreatmentInitial) {
      setTVPAnticoagConsiderationsOpen(true)
      return
    }
    setTVPAnticoagConsiderationsOpen(false)
  }, [isTVPTreatmentInitial])

  if (!currentStepData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">Erro no Fluxograma</h3>
          <p className="text-gray-600">Step não encontrado: {currentStep}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Premium Medical Header */}
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-glass border-b border-white/40 dark:border-slate-800/60 sticky top-0 z-50 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-slate-50/5 to-indigo-600/5"></div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            {/* Left - Patient Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
                  <Stethoscope className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  {patient.name || 'Paciente Sem Nome'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {patient.age ? `${patient.age} anos` : 'Idade não informada'} • {patient.medicalRecord || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              {onBack && (
                <motion.button
                  onClick={onBack}
                  className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 text-slate-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </motion.button>
              )}

              <motion.button
                onClick={goBack}
                disabled={history.length === 0}
                className={clsx(
                  "group flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 font-medium",
                  history.length > 0
                    ? "bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border-amber-300 text-amber-700 shadow-lg hover:shadow-xl"
                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                )}
                whileHover={history.length > 0 ? { scale: 1.02 } : {}}
                whileTap={history.length > 0 ? { scale: 0.98 } : {}}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </motion.button>

              <motion.button
                onClick={restart}
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border border-blue-300 text-blue-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flowchart-card p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{flowchart.name}</h3>
                {flowchart.id === 'anafilaxia' ? (
                  <p className="max-w-4xl text-sm leading-relaxed text-slate-700">
                    A anafilaxia é uma <strong>reação alérgica grave e de início rápido</strong>, causada pela liberação maciça de mediadores inflamatórios após contato com um alérgeno. Pode afetar <strong>pele, respiração, circulação e trato gastrointestinal</strong>, evoluindo rapidamente para <strong>instabilidade hemodinâmica</strong> e risco de morte. O tratamento deve ser <strong>imediato</strong>, com <strong>adrenalina intramuscular</strong> como primeira escolha.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">{flowchart.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
              <div className={clsx(
                "px-3 py-1 rounded-xl text-sm font-bold border",
                flowchart.priority === 'high' ? "bg-red-100 text-red-800 border-red-200" :
                flowchart.priority === 'medium' ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                "bg-green-100 text-green-800 border-green-200"
              )}>
                {flowchart.priority.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-4 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-slate-600 h-4 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Conteúdo Principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flowchart-card overflow-hidden"
          >
            {/* Header do Step */}
            <div className={clsx(
              "p-6 text-white",
              `bg-gradient-to-r ${getStepColor(currentStepData)}`
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStepIcon(currentStepData)}
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                      <span>{currentStepData.title}</span>
                      {flowchart.id === 'atendimento_antirrabico' && currentStepData.id === 'raiva_tipo_contato' && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setRabiesBiteImageOpen(true)
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/20 text-sm font-black text-white shadow-sm transition-colors hover:bg-white/30"
                          title="Ver referência visual de mordedura"
                          aria-label="Ver referência visual de mordedura"
                        >
                          i
                        </button>
                      )}
                    </h2>
                    <p className="text-sm opacity-90">{currentStepData.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {currentStepData.critical && (
                    <div className="flex items-center space-x-1 bg-red-500 bg-opacity-20 px-2 py-1 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">CRÍTICO</span>
                    </div>
                  )}
                  {currentStepData.timeSensitive && (
                    <div className="flex items-center space-x-1 bg-orange-500 bg-opacity-20 px-2 py-1 rounded">
                      <Timer className="w-4 h-4" />
                      <span className="text-xs">TEMPO</span>
                    </div>
                  )}
                  {currentStepData.requiresSpecialist && (
                    <div className="flex items-center space-x-1 bg-purple-500 bg-opacity-20 px-2 py-1 rounded">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs">ESPECIALISTA</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo do Step */}
            <div className="p-6">
              {isBellSideSelection && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                  <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
                    <div className="flex flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-800 p-5 text-white sm:p-7">
                      <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-50">
                          <Brain className="h-4 w-4" />
                          Avaliação inicial
                        </div>
                        <h3 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                          Paralisia facial periférica aguda
                        </h3>
                        <p className="mt-4 text-base leading-relaxed text-blue-50 sm:text-lg">
                          A paralisia de Bell é uma neuropatia periférica aguda do nervo facial (VII par craniano). Caracteriza‑se por instalação súbita de fraqueza ou paralisia unilateral dos músculos da expressão facial, sem causa identificável na avaliação inicial.
Descrita em 1821 por Sir Charles Bell, é a forma mais comum de paralisia facial periférica idiopática. O quadro resulta de uma disfunção súbita do nervo facial ao longo de seu trajeto intratemporal, geralmente associada a um processo inflamatório de provável origem viral, restrito ao próprio nervo.
                        </p>
                      </div>

                      <div className="mt-8 space-y-4">
                        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                          <p className="text-sm font-semibold leading-relaxed text-blue-50">
                            A Paralisia de Bell costuma envolver toda a hemiface: fronte, fechamento ocular e comissura labial.
                            A Preservação da fronte acende alerta para causas centrais.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBellFacialNerveOpen(true)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm transition-colors hover:bg-blue-50"
                          title="Ver imagem do nervo facial"
                        >
                          <Info className="h-4 w-4" />
                          Ver nervo facial
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 sm:p-5">
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                            Selecione o lado suspeito
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Defina o lado acometido e siga para os critérios diagnosticos obrigatórios da Paralisia de Bell.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        {[
                          {
                            label: 'Lado direito',
                            src: '/paralisia%20de%20bell/Lado%20direito.png',
                            value: 'lado_direito'
                          },
                          {
                            label: 'Lado esquerdo',
                            src: '/paralisia%20de%20bell/Lado%20esquerdo.png',
                            value: 'lado_esquerdo'
                          }
                        ].map((item) => (
                          <motion.button
                            key={item.value}
                            type="button"
                            onClick={() => setPendingBellSide({ label: item.label, value: item.value })}
                            className="group overflow-hidden rounded-2xl border-2 border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <img
                              src={item.src}
                              alt={`Paralisia facial do ${item.label.toLowerCase()}`}
                              className="aspect-[3/4] w-full bg-slate-100 object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4 sm:p-5">
                              <span className="text-base font-extrabold text-slate-950 sm:text-lg">
                                {item.label}
                              </span>
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
                                <ChevronRight className="h-5 w-5" />
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                        <label className="block text-xs font-bold uppercase tracking-wide text-blue-700">
                          Queixa principal
                        </label>
                        <textarea
                          value={bellChiefComplaint}
                          onChange={(event) => setBellChiefComplaint(event.target.value)}
                          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                          placeholder="Ex: paciente refere boca torta e dificuldade para fechar o olho direito desde hoje pela manhã."
                        />
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          Escreva a queixa do paciente, sem transformar em diagnóstico. Esse texto entrará no resumo clínico do relatório.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isBellPhysicalExamStep && (
                <div className="mb-8 space-y-5">
                  <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-blue-800 to-cyan-700 px-5 py-5 text-white sm:px-6">
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <Stethoscope className="h-6 w-6" />
                        </span>
                        <div>
                          <h3 className="text-xl font-extrabold">Exame físico da suspeita de Paralisia de Bell</h3>
                          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-blue-50">
                            Confirme o padrão periférico do VII par craniano e procure alterações que indiquem diagnóstico alternativo. Marque somente os achados efetivamente observados.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2 border-b border-blue-100 bg-blue-50 p-4 text-xs font-semibold text-blue-950 sm:grid-cols-4 sm:p-5">
                      {['Repouso', 'Testa', 'Olhos', 'Boca e bochechas', 'Lábios', 'Platisma', 'Sintomas do VII par', 'Neurológico completo'].map((step, index) => (
                        <div key={step} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[10px] text-white">{index + 1}</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {BELL_PHYSICAL_EXAM_GROUPS.map((group) => (
                      <section key={group.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h4 className="font-extrabold text-slate-950">{group.title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{group.instruction}</p>
                        <div className="mt-3 grid gap-2">
                          {group.items.map((item) => {
                            const checked = bellPhysicalExamFindings.includes(item.key)
                            const isNeurologicDeficit = item.key === 'deficit_neurologico_adicional'
                            return (
                              <label
                                key={item.key}
                                className={clsx(
                                  'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                                  checked
                                    ? isNeurologicDeficit ? 'border-red-400 bg-red-50' : 'border-blue-400 bg-blue-50'
                                    : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => setBellPhysicalExamFindings((current) => (
                                    checked ? current.filter((key) => key !== item.key) : [...current, item.key]
                                  ))}
                                  className={clsx('mt-0.5 h-4 w-4 rounded border-slate-300', isNeurologicDeficit ? 'text-red-600' : 'text-blue-600')}
                                />
                                <span className={clsx('flex flex-1 items-center gap-2 text-sm leading-relaxed', isNeurologicDeficit ? 'font-bold text-red-900' : 'text-slate-800')}>
                                  <span>{item.label}</span>
                                  {item.key === 'lagoftalmo' && (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setBellLagophthalmosInfoOpen(true)
                                      }}
                                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-white text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                                      title="O que é lagoftalmo?"
                                      aria-label="O que é lagoftalmo?"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {item.key === 'fenomeno_bell' && (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setBellPhenomenonInfoOpen(true)
                                      }}
                                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-white text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                                      title="O que é Fenômeno de Bell?"
                                      aria-label="O que é Fenômeno de Bell?"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {item.key === 'bochecha_insuficiente' && (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setBellCheekInflationImageOpen(true)
                                      }}
                                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-white text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                                      title="Ver teste de insuflar bochecha"
                                      aria-label="Ver teste de insuflar bochecha"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>

                  {bellPhysicalExamFindings.includes('deficit_neurologico_adicional') && (
                    <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-red-950">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <h4 className="font-extrabold">Déficit neurológico adicional identificado</h4>
                          <p className="mt-1 text-sm">Questionar o diagnóstico de Paralisia de Bell isolada e investigar causa central ou envolvimento de outros nervos cranianos.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="mb-2 block text-sm font-extrabold text-slate-950" htmlFor="bell-physical-exam-notes">Outros achados do exame</label>
                    <textarea
                      id="bell-physical-exam-notes"
                      value={bellPhysicalExamNotes}
                      onChange={(event) => setBellPhysicalExamNotes(event.target.value)}
                      rows={3}
                      placeholder="Descreva lateralidade, intensidade, achados oculares, déficits adicionais ou outras observações relevantes."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex justify-end rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <button
                      type="button"
                      onClick={() => handleAnswer('bell_criterios_obrigatorios', 'exame_fisico_registrado')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-800 sm:w-auto"
                    >
                      Salvar exame e seguir para critérios obrigatórios
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {bellLagophthalmosInfoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-blue-800 to-cyan-700 px-5 py-4 text-white">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                          Exame ocular
                        </p>
                        <h4 className="mt-1 text-xl font-extrabold">Lagoftalmo na Paralisia de Bell</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBellLagophthalmosInfoOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
                        title="Fechar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-h-0 space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-slate-800">
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h5 className="text-base font-extrabold text-slate-950">Definição</h5>
                        <p className="mt-2">
                          Lagoftalmo é a incapacidade de realizar o fechamento completo das pálpebras por fraqueza ou paralisia do músculo orbicular dos olhos, inervado pelo nervo facial (VII par craniano).
                        </p>
                        <p className="mt-2">
                          Na Paralisia de Bell, ocorre por acometimento periférico do nervo facial, impedindo o fechamento palpebral adequado durante o piscar e o sono.
                        </p>
                      </section>

                      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <h5 className="text-base font-extrabold text-amber-950">Risco ocular</h5>
                        <p className="mt-2">
                          A exposição da córnea e do filme lacrimal aumenta o risco de ceratite por exposição, abrasões, úlceras de córnea e redução da acuidade visual.
                        </p>
                      </section>

                      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <h5 className="text-base font-extrabold text-blue-950">Como avaliar no exame físico</h5>
                        <p className="mt-2">
                          Solicite ao paciente que feche os olhos normalmente e, em seguida, com força. Observe fechamento incompleto da pálpebra, exposição escleral, persistência dos cílios visíveis (sinal dos cílios) e Fenômeno de Bell.
                        </p>
                        <p className="mt-2">
                          O Fenômeno de Bell é caracterizado pela rotação superior do globo ocular ao tentar fechar a pálpebra.
                        </p>
                      </section>

                      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <h5 className="text-base font-extrabold text-emerald-950">Conduta prática</h5>
                        <p className="mt-2">
                          A identificação do lagoftalmo é fundamental, pois a proteção ocular imediata com lubrificantes, pomadas oftálmicas e oclusão noturna, quando indicada, é uma das medidas mais importantes no tratamento da Paralisia de Bell.
                        </p>
                      </section>
                    </div>

                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setBellLagophthalmosInfoOpen(false)}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                      >
                        Entendi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {bellPhenomenonInfoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-blue-800 to-cyan-700 px-5 py-4 text-white">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                          Exame ocular
                        </p>
                        <h4 className="mt-1 text-xl font-extrabold">Fenômeno de Bell</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBellPhenomenonInfoOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
                        title="Fechar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-h-0 space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-slate-800">
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h5 className="text-base font-extrabold text-slate-950">Definição</h5>
                        <p className="mt-2">
                          Fenômeno de Bell é um reflexo fisiológico de proteção ocular caracterizado pela rotação superior e discreta abdução do globo ocular durante a tentativa de fechamento das pálpebras.
                        </p>
                      </section>

                      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <h5 className="text-base font-extrabold text-blue-950">Por que fica visível na Paralisia de Bell?</h5>
                        <p className="mt-2">
                          Em indivíduos saudáveis, esse movimento geralmente passa despercebido, pois é ocultado pelo fechamento completo das pálpebras.
                        </p>
                        <p className="mt-2">
                          Na Paralisia de Bell, devido à fraqueza do músculo orbicular dos olhos e ao fechamento palpebral incompleto (lagoftalmo), o fenômeno torna-se facilmente visível durante o exame físico.
                        </p>
                      </section>

                      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <h5 className="text-base font-extrabold text-emerald-950">Interpretação clínica</h5>
                        <p className="mt-2">
                          Sua presença não representa um sinal patológico, mas sim um reflexo normal que se torna evidente pela incapacidade de o paciente ocluir totalmente o olho afetado.
                        </p>
                        <p className="mt-2">
                          A identificação do Fenômeno de Bell auxilia na confirmação do comprometimento periférico do nervo facial e reforça a necessidade de proteção ocular para prevenir lesões da córnea decorrentes da exposição.
                        </p>
                      </section>
                    </div>

                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setBellPhenomenonInfoOpen(false)}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                      >
                        Entendi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isBellCriteriaStep && (
                <div className="mb-8 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h4 className="text-base font-extrabold text-amber-950">Critérios obrigatórios do diagnóstico</h4>
                    <p className="mt-1 text-sm text-amber-900">
                      Marque todos os critérios presentes. Só siga como Paralisia de Bell se todos estiverem confirmados.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {BELL_DIAGNOSTIC_CRITERIA.map((item) => {
                      const checked = bellCriteriaChecks[item.key]
                      return (
                        <label
                          key={item.key}
                          className={clsx(
                            'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                            checked ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-amber-300'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            checked={checked}
                            onChange={(event) => {
                              setBellCriteriaChecks((prev) => ({ ...prev, [item.key]: event.target.checked }))
                            }}
                          />
                          <span className="flex-1">
                            <span className="block text-sm font-extrabold text-slate-950">{item.label}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-slate-600">{item.detail}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className={clsx('text-sm font-semibold', allBellCriteriaChecked ? 'text-emerald-700' : 'text-amber-700')}>
                      {allBellCriteriaChecked
                        ? 'Todos os critérios foram marcados. Pode seguir para critérios de suporte.'
                        : 'Ainda faltam critérios obrigatórios para confirmar suspeita de Bell.'}
                    </span>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleAnswer('bell_criterios_nao_preenchidos', 'criterios_nao_preenchidos')}
                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
                      >
                        Critérios incompletos
                      </button>
                      <button
                        type="button"
                        disabled={!allBellCriteriaChecked}
                        onClick={() => handleAnswer('bell_suporte_diagnostico', 'criterios_preenchidos')}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors',
                          allBellCriteriaChecked
                            ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                            : 'cursor-not-allowed bg-slate-200 text-slate-500'
                        )}
                      >
                        Seguir
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setBellCranioOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                      title="Ver imagem do VII par craniano"
                    >
                      <Info className="h-4 w-4" />
                      VII par craniano
                    </button>
                  </div>
                </div>
              )}

              {isBellSupportStep && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-amber-200 bg-[#f4dbaf] shadow-sm">
                  <div className="mx-auto max-w-4xl p-5 sm:p-6">
                    <section className="space-y-5">
                      <div className="text-center">
                        <h4 className="text-xl font-extrabold text-slate-950">
                          Critérios Diagnósticos de Suporte (não obrigatórios)
                        </h4>
                        <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-900">
                          A presença dos itens abaixo reforça o diagnóstico de Paralisia de Bell. Marque os sinais presentes.
                        </p>
                      </div>

                      <div className="grid gap-2">
                        {BELL_SUPPORT_CRITERIA.map((item) => {
                          const checked = bellSupportChecks[item.key]
                          return (
                            <label
                              key={item.key}
                              className={clsx(
                                'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 transition-colors',
                                checked
                                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                                  : 'border-amber-300 bg-white/50 hover:border-blue-300 hover:bg-blue-50/70'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                                checked={checked}
                                onChange={(event) => {
                                  setBellSupportChecks((prev) => ({ ...prev, [item.key]: event.target.checked }))
                                }}
                              />
                              <span className="flex-1">
                                <span className="block text-sm font-extrabold text-slate-950">{item.label}</span>
                                <span className="mt-1 block text-sm leading-relaxed text-slate-700">{item.detail}</span>
                              </span>
                            </label>
                          )
                        })}
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleAnswer('bell_red_flags_ramsay', 'suporte_verificado')}
                          className="w-full rounded-full border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100 sm:w-auto sm:min-w-[340px]"
                        >
                          Critérios de suporte verificados, seguir fluxo.
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {isBellRedFlagsStep && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-orange-200 bg-[#f6d2ab] shadow-sm">
                  <div className="p-5 text-center sm:p-6">
                    <h4 className="mx-auto max-w-5xl text-xl font-extrabold leading-snug text-slate-950 sm:text-2xl">
                      O diagnóstico da paralisia de Bell é clínico e de exclusão, baseado na avaliação detalhada da história e exame físico do paciente, buscando afastar paralisia facial central (PFC) e causas secundárias de paralisia facial periférica (PFP).
                    </h4>
                  </div>

                  <div className="grid gap-5 px-4 pb-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.48fr)]">
                    <section className="space-y-4">
                      <div>
                        <h5 className="text-base font-extrabold text-slate-950">
                          Critérios de Exclusão (Red Flags)
                        </h5>
                        <p className="mt-4 text-sm font-bold leading-relaxed text-slate-950">
                          A presença de qualquer um dos itens abaixo afasta o diagnóstico de Paralisia de Bell até investigação adicional:
                        </p>
                      </div>

                      <div className="grid gap-2">
                        {BELL_RED_FLAGS.map((item) => {
                          const checked = bellRedFlagChecks[item.key]
                          return (
                            <label
                              key={item.key}
                              className={clsx(
                                'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 transition-colors',
                                checked
                                  ? 'border-red-400 bg-red-50 shadow-sm'
                                  : 'border-orange-300 bg-white/45 hover:border-red-300 hover:bg-red-50/70'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-slate-400 text-red-600 focus:ring-red-500"
                                checked={checked}
                                onChange={(event) => {
                                  setBellRedFlagChecks((prev) => ({ ...prev, [item.key]: event.target.checked }))
                                }}
                              />
                              <span className="flex-1">
                                <span className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                                  {item.label}
                                  {item.key === 'ramsay_hunt' && (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setBellRamsayInfoOpen(true)
                                      }}
                                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-white text-slate-900 transition-colors hover:bg-slate-100"
                                      title="O que é Síndrome de Ramsay Hunt?"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </span>
                                <span className="mt-1 block text-sm leading-relaxed text-slate-600">{item.detail}</span>
                              </span>
                            </label>
                          )
                        })}
                      </div>

                      <div className="grid gap-3 pt-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleAnswer('bell_sem_exames', 'sem_red_flags')}
                          disabled={hasBellRedFlagChecked}
                          className={clsx(
                            'rounded-full border-2 px-4 py-3 text-sm font-semibold transition-colors',
                            hasBellRedFlagChecked
                              ? 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400'
                              : 'border-blue-500 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          )}
                        >
                          Critérios de exclusão ausentes, seguir fluxo.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer('bell_red_flags_investigar', 'red_flags')}
                          disabled={!hasBellRedFlagChecked}
                          className={clsx(
                            'rounded-full border-2 px-4 py-3 text-sm font-semibold transition-colors',
                            hasBellRedFlagChecked
                              ? 'border-blue-500 bg-red-100 text-red-800 hover:bg-red-200'
                              : 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400'
                          )}
                        >
                          Critérios de exclusão presentes, interromper fluxo.
                        </button>
                      </div>
                    </section>

                    <section className="flex items-center justify-center">
                      <img
                        src="/paralisia%20de%20bell/red%20flag.png"
                        alt="Sinais de alerta em Paralisia de Bell"
                        className="w-full max-w-sm rounded-xl object-contain"
                      />
                    </section>
                  </div>
                </div>
              )}

              {bellRamsayInfoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-blue-800 to-cyan-700 px-5 py-4 text-white">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                          Diferencial obrigatório
                        </p>
                        <h4 className="mt-1 text-xl font-extrabold">
                          Síndrome de Ramsay Hunt vs Paralisia de Bell
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBellRamsayInfoOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
                        title="Fechar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-h-0 overflow-y-auto p-5">
                      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)]">
                        <div className="space-y-4 text-sm leading-relaxed text-slate-800">
                          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h5 className="text-base font-extrabold text-slate-950">Visão geral</h5>
                            <p className="mt-2">
                              Este documento apresenta uma descrição objetiva da síndrome de Ramsay Hunt e esclarece, de forma concisa, como ela difere da Paralisia de Bell. O foco é identificar causas, sinais clínicos, prognóstico e abordagem terapêutica.
                            </p>
                          </section>

                          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <h5 className="text-base font-extrabold text-blue-950">Descrição</h5>
                            <p className="mt-2">
                              A síndrome de Ramsay Hunt é uma condição neurológica causada pela reativação do vírus varicela-zóster, o mesmo que causa catapora e herpes-zóster, afetando principalmente o nervo facial (VII) e, muitas vezes, o nervo vestibulococlear (VIII). O resultado típico é paralisia facial periférica, dor intensa no ouvido e erupções com bolhas na região da orelha.
                            </p>
                          </section>

                          <section className="rounded-xl border border-slate-200 bg-white p-4">
                            <h5 className="text-base font-extrabold text-slate-950">Diferenças objetivas</h5>
                            <div className="mt-3 grid gap-3">
                              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="font-extrabold text-red-950">Ramsay Hunt</p>
                                <p className="mt-1">
                                  Paralisia facial periférica acompanhada de dor otológica intensa, erupções vesiculares na orelha, conduto auditivo ou aurícula e, frequentemente, sintomas cocleovestibulares como zumbido, vertigem e hipoacusia.
                                </p>
                              </div>
                              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                <p className="font-extrabold text-emerald-950">Paralisia de Bell</p>
                                <p className="mt-1">
                                  Paralisia facial periférica isolada; pode haver dor retroauricular leve, mas sem vesículas e sem comprometimento auditivo ou vestibular típico.
                                </p>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="space-y-4">
                          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <img
                              src="/paralisia%20de%20bell/sinfrome%20de%20hamsay%20hunt%20x%20paralisia%20de%20bell.png"
                              alt="Comparação entre Síndrome de Ramsay Hunt e Paralisia de Bell"
                              className="w-full object-contain"
                            />
                          </figure>
                          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <img
                              src="/paralisia%20de%20bell/red%20flag.png"
                              alt="Sinais de alerta em Paralisia de Bell"
                              className="w-full object-contain"
                            />
                          </figure>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setBellRamsayInfoOpen(false)}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                      >
                        Entendi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isBellHouseStep && (
                <div className="mb-8 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.62fr)] lg:items-start">
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs leading-relaxed text-slate-800 sm:text-sm">
                          A <strong>Escala de House-Brackmann</strong> classifica a gravidade da paralisia facial periférica.
                          Selecione o grau compatível com o exame; a escolha ficará marcada e liberará a próxima etapa.
                        </p>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        {[
                          { value: 'house_i', label: 'Grau I', description: 'Função facial normal.' },
                          { value: 'house_ii', label: 'Grau II', description: 'Fraqueza leve; simetria normal em repouso e fechamento ocular completo sem esforço.' },
                          { value: 'house_iii', label: 'Grau III', description: 'Disfunção moderada; fechamento ocular completo e boa movimentação da testa com esforço.' },
                          { value: 'house_iv', label: 'Grau IV', description: 'Disfunção grave; fechamento ocular incompleto, testa sem movimento e boca assimétrica.' },
                          { value: 'house_v', label: 'Grau V', description: 'Movimento mínimo; pouca capacidade de sorrir, franzir a testa ou fechar completamente o olho.' },
                          { value: 'house_vi', label: 'Grau VI', description: 'Ausência de movimentos faciais.' }
                        ].map((grade) => {
                          const selected = selectedBellHouseGrade === grade.value
                          return (
                            <button
                              key={grade.value}
                              type="button"
                              onClick={() => setSelectedBellHouseGrade(grade.value)}
                              className={clsx(
                                'flex min-h-[86px] w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-all',
                                selected
                                  ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40'
                              )}
                            >
                              <span
                                className={clsx(
                                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                                  selected
                                    ? 'border-cyan-600 bg-cyan-600 text-white'
                                    : 'border-slate-300 bg-white text-transparent'
                                )}
                                aria-hidden="true"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </span>
                              <span>
                                <span className="block text-sm font-extrabold text-slate-950">{grade.label}</span>
                                <span className="mt-0.5 block text-xs leading-snug text-slate-700">{grade.description}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <img
                        src="/paralisia%20de%20bell/escala%20de%20house.png"
                        alt="Escala de House-Brackmann"
                        className="mx-auto max-h-[260px] w-full rounded-xl object-contain sm:max-h-[300px] lg:max-h-[360px]"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className={clsx('text-sm font-medium', selectedBellHouseGrade ? 'text-emerald-700' : 'text-amber-700')}>
                      {selectedBellHouseGrade
                        ? `Selecionado: ${currentStepData.options?.find((option) => option.value === selectedBellHouseGrade)?.text || 'grau definido'}`
                        : 'Selecione um grau para avançar'}
                    </span>
                    <button
                      type="button"
                      disabled={!selectedBellHouseGrade}
                      onClick={() => {
                        if (!selectedBellHouseGrade) return
                        setBellTreatmentTimingOpen(true)
                      }}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-colors',
                        selectedBellHouseGrade
                          ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                      )}
                    >
                      Seguir
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {isBellHouseStep && bellTreatmentTimingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => setBellTreatmentTimingOpen(false)}
                  />
                  <div className="relative w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => setBellTreatmentTimingOpen(false)}
                      className="absolute right-3 top-3 rounded-full p-1 text-slate-500 transition-colors hover:bg-amber-100"
                      aria-label="Fechar orientação antes do tratamento"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h4 className="mb-3 text-base font-extrabold text-slate-900 sm:text-lg">
                      Antes do tratamento
                    </h4>
                    <p className="text-sm font-semibold leading-relaxed text-slate-800 sm:text-base">
                      O tratamento da Paralisia de Bell deve ser iniciado o mais precocemente possível,
                      idealmente nas primeiras <strong>72 horas</strong> do início dos sintomas, para melhorar o prognóstico.
                    </p>
                    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setBellTreatmentTimingOpen(false)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedBellHouseGrade) return
                          setBellTreatmentTimingOpen(false)
                          handleAnswer('bell_tratamento_clinico', selectedBellHouseGrade)
                        }}
                        className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-700"
                      >
                        Seguir para tratamento clínico
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isBellDynamicDocumentStep && !flowchart.finalSteps.includes(currentStep) && (
                <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        {isBellPrescriptionStep ? 'Relatório e prescrição' : isBellReferralStep ? 'Relatório e encaminhamento' : 'Relatório clínico'}
                      </p>
                      <h4 className="mt-1 text-lg font-extrabold text-slate-950">
                        {isBellPrescriptionStep ? 'Relatório, prescrição e cuidados - Paralisia de Bell' : currentStepData.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={copyBellDocumentText}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors',
                        bellDocumentCopied ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {bellDocumentCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                      {bellDocumentCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900">
                    {currentBellDocumentText}
                  </div>
                </div>
              )}

              {(isPneumoniaPhysicalExamStep || isInfluenzaPhysicalExamStep || isTVPPhysicalExamStep || isTEPPhysicalExamStep) && (
                <div className="mb-8 space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
                    <div className="bg-sky-950 px-5 py-5 text-white sm:px-6">
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <Stethoscope className="h-6 w-6" />
                        </span>
                        <div>
                          <h3 className="text-xl font-extrabold">
                            {isTEPPhysicalExamStep
                              ? 'Sinais vitais e exame físico na suspeita de TEP'
                              : isTVPPhysicalExamStep
                              ? 'Sinais vitais e exame físico antes do checklist clínico de TVP'
                              : isPneumoniaPhysicalExamStep
                                ? 'Sinais vitais e exame físico antes do CRB-65'
                                : 'Sinais vitais e exame físico antes da classificação de SRAG'}
                          </h3>
                          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-sky-100">
                            Registre primeiro os sinais vitais completos e, em seguida, estado geral e sistemas examinados. Descreva especialmente padrão respiratório, ausculta pulmonar, perfusão, nível de consciência e sinais de esforço respiratório.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 border-b border-sky-100 bg-sky-50 p-4 text-xs text-sky-950 sm:grid-cols-3 sm:p-5">
                      <div className="rounded-xl border border-sky-200 bg-white p-3">
                        <strong className="block">Respiratório</strong>
                        Estertores, redução do murmúrio vesicular, sopro tubário, tiragens e uso de musculatura acessória.
                      </div>
                      <div className="rounded-xl border border-sky-200 bg-white p-3">
                        <strong className="block">Perfusão e gravidade</strong>
                        Cianose, enchimento capilar, hidratação, estado geral e repercussão hemodinâmica.
                      </div>
                      <div className="rounded-xl border border-sky-200 bg-white p-3">
                        <strong className="block">Neurológico</strong>
                        Glasgow, confusão, desorientação, sonolência ou outras alterações do sensório.
                      </div>
                    </div>
                  </div>

                  {(isPneumoniaPhysicalExamStep || isInfluenzaPhysicalExamStep || isTVPPhysicalExamStep || isTEPPhysicalExamStep) && (
                    <div className="overflow-hidden rounded-2xl border border-sky-300 bg-white shadow-sm ring-1 ring-sky-100">
                      <div className="border-b border-sky-200 bg-sky-50 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                            <Activity className="h-5 w-5" />
                          </span>
                          <div>
                            <h4 className="text-lg font-extrabold text-slate-950">Sinais vitais obrigatórios</h4>
                            <p className="text-sm text-slate-600">
                              {isTEPPhysicalExamStep
                                ? 'Avalie choque, hipoxemia, taquicardia e repercussão de ventrículo direito. A instabilidade muda imediatamente a estratégia diagnóstica e terapêutica.'
                                : isTVPPhysicalExamStep
                                ? 'Esses dados entram no relatório médico e antecedem o checklist clínico de TVP.'
                                : isInfluenzaPhysicalExamStep
                                  ? 'Esses dados entram no resumo médico e orientam a classificação de SRAG.'
                                  : 'Registre os dados antes de iniciar o CRB-65.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-5 p-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Temperatura (°C)
                          </label>
                          <div className="relative">
                            <Thermometer className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="number"
                              value={currentRespiratoryVitalSigns.temperature ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('temperature', parseOptionalNumber(event.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 38.5"
                              step="0.1"
                              min="30"
                              max="45"
                            />
                          </div>
                          {classifyTemperature(currentRespiratoryVitalSigns.temperature)}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Há quantos dias de febre?
                          </label>
                          <div className="relative">
                            <Timer className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="number"
                              value={currentRespiratoryVitalSigns.feverDays ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('feverDays', parseOptionalNumber(event.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 3"
                              min="0"
                              max="30"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Pressão arterial (mmHg)
                          </label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="text"
                              value={currentRespiratoryVitalSigns.bloodPressure ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('bloodPressure', formatBloodPressureInput(event.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 120/80"
                              inputMode="numeric"
                              maxLength={7}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {classifyBloodPressure(currentRespiratoryVitalSigns.bloodPressure)}
                            {calculateMeanArterialPressure(currentRespiratoryVitalSigns.bloodPressure) != null && vitalBadge(`PAM ≈ ${calculateMeanArterialPressure(currentRespiratoryVitalSigns.bloodPressure)} mmHg`, 'blue-dark')}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Frequência cardíaca (bpm)
                          </label>
                          <div className="relative">
                            <Heart className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="number"
                              value={currentRespiratoryVitalSigns.heartRate ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('heartRate', parseOptionalNumber(event.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 96"
                              min="30"
                              max="220"
                            />
                          </div>
                          {classifyHeartRate(currentRespiratoryVitalSigns.heartRate)}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Frequência respiratória (irpm)
                          </label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="number"
                              value={currentRespiratoryVitalSigns.respiratoryRate ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('respiratoryRate', parseOptionalNumber(event.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 24"
                              min="5"
                              max="80"
                            />
                          </div>
                          {classifyRespiratoryRate(currentRespiratoryVitalSigns.respiratoryRate)}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Saturação de O2 (SpO2 %)
                          </label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="number"
                              value={currentRespiratoryVitalSigns.oxygenSaturation ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('oxygenSaturation', parseOptionalNumber(event.target.value))}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 94"
                              min="50"
                              max="100"
                            />
                          </div>
                          {classifyOxygenSaturation(currentRespiratoryVitalSigns.oxygenSaturation)}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                            Glicemia capilar (mg/dL)
                          </label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="text"
                              value={currentRespiratoryVitalSigns.glucose ?? ''}
                              onChange={(event) => updateCurrentRespiratoryVitalSign('glucose', event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 font-medium text-slate-800 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                              placeholder="Ex: 95 ou LO/HI"
                            />
                          </div>
                          {classifyGlucoseValue(currentRespiratoryVitalSigns.glucose)}
                        </div>
                      </div>
                    </div>
                  )}

                  <PhysicalExamForm
                    value={isTEPPhysicalExamStep ? tepPhysicalExam : isTVPPhysicalExamStep ? tvpPhysicalExam : isInfluenzaPhysicalExamStep ? influenzaPhysicalExam : pneumoniaPhysicalExam}
                    onChange={isTEPPhysicalExamStep ? setTEPPhysicalExam : isTVPPhysicalExamStep ? setTVPPhysicalExam : isInfluenzaPhysicalExamStep ? setInfluenzaPhysicalExam : setPneumoniaPhysicalExam}
                  />

                  <div className="flex justify-end rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <motion.button
                      type="button"
                      onClick={() => handleAnswer(
                        isTEPPhysicalExamStep
                          ? 'tep_instabilidade'
                          : isTVPPhysicalExamStep
                          ? 'avaliacao_clinica'
                          : isInfluenzaPhysicalExamStep
                            ? 'influenza_sinais_gravidade'
                            : 'pac_crb65_triagem',
                        'exame_fisico_registrado'
                      )}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-6 py-3 font-bold text-white transition-colors hover:bg-sky-800 sm:w-auto"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isTEPPhysicalExamStep
                        ? 'Salvar exame e avaliar estabilidade'
                        : isTVPPhysicalExamStep
                        ? 'Salvar exame e abrir checklist clínico'
                        : isInfluenzaPhysicalExamStep
                          ? 'Salvar exame e avaliar gravidade'
                          : 'Salvar exame e iniciar CRB-65'}
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              )}

              {isTEPAssessmentStep && (
                <div className="mb-8">
                  <TEPAssessment
                    key={currentStepData.id}
                    stepId={currentStepData.id}
                    savedAnswer={currentStepData.id === 'tep_tratamento' ? answers.tep_categoria : answers[currentStepData.id]}
                    patientAge={patient.age}
                    vitalSigns={tepVitalSigns}
                    onContinue={handleAnswer}
                  />
                </div>
              )}

              {currentStepData.content && !isBellSideSelection && !isBellPhysicalExamStep && !isBellCriteriaStep && !isBellSupportStep && !isBellRedFlagsStep && !isBellHouseStep && !isBellTreatmentStep && !isBellDynamicDocumentStep && !isTVPPhysicalExamStep && !isTEPPhysicalExamStep && !isTVPClinicalEvaluation && !isTVPWellsScore && !isTVPContraCheck && !isTVPTreatmentInitial && !isAVCCincinnatiStep && !isDpocSinaisGravidade && !isDpocAnthonisen && !isInfluenzaPhysicalExamStep && !isPneumoniaPhysicalExamStep && !isPneumoniaPsiStep && !isPneumoniaCurbStep && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  {isTVPWaitingForVascularStep && (
                    <div className={clsx(
                      'mb-4 rounded-xl border p-4 text-sm leading-relaxed',
                      hasAbsoluteContraindication
                        ? 'border-red-300 bg-red-100 text-red-950'
                        : selectedTherapies.length > 0
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                          : 'border-amber-300 bg-amber-100 text-amber-950'
                    )}>
                      <p className="font-extrabold uppercase tracking-wide">
                        {hasAbsoluteContraindication
                          ? 'Contraindicação absoluta confirmada: não anticoagular'
                          : selectedTherapies.length > 0
                            ? 'Anticoagulação iniciada: manter e monitorar'
                            : 'Conduta antitrombótica pendente de definição vascular'}
                      </p>
                      <p className="mt-1">
                        {hasAbsoluteContraindication
                          ? 'Documentar o motivo, manter internação monitorizada e discutir com prioridade filtro de veia cava ou outra intervenção apropriada.'
                          : selectedTherapies.length > 0
                            ? `Esquema registrado: ${tvpReferralTherapies.map((item) => item.text).join('; ')}. Vigiar sangramento e manter até nova orientação.`
                            : 'Não iniciar ou suspender tratamento por conta própria nesta etapa; individualizar a conduta e manter vigilância até avaliação especializada.'}
                      </p>
                    </div>
                  )}
                  <div
                    className="prose prose-sm max-w-none"
                    onClick={(event) => {
                      const target = event.target as HTMLElement
                      const pocusDetails = target.closest<HTMLDetailsElement>('[data-pac-pocus-details="true"]')
                      if (pocusDetails?.open) {
                        setKeepPneumoniaPocusDetailsOpen(true)
                      }
                      if (target.closest('[data-influenza-request-exams="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setInfluenzaExamRequestOpen(true)
                      }
                      if (target.closest('[data-pac-rx-info="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaRxInfoOpen(true)
                      }
                      if (target.closest('[data-pac-rx-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaRxImageOpen(true)
                      }
                      if (target.closest('[data-pac-ct-info="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaCtInfoOpen(true)
                      }
                      if (target.closest('[data-pac-ct-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaReferenceImage('ct')
                      }
                      if (target.closest('[data-pac-pocus-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaReferenceImage('pocus')
                      }
                      if (target.closest('[data-pac-lus-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaReferenceImage('lus')
                      }
                      if (target.closest('[data-pac-blue-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaReferenceImage('blue')
                      }
                      if (target.closest('[data-pac-blue-algorithm-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPneumoniaReferenceImage('blueAlgorithm')
                      }
                      if (target.closest('[data-tvp-pocus-points-image="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setTVPPocusPointsImageOpen(true)
                      }
                      if (target.closest('[data-pep-hiv-guide="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setPepHivGuideOpen(true)
                      }
                      if (target.closest('[data-ansiedade-guide="true"]')) {
                        event.preventDefault()
                        event.stopPropagation()
                        setAnsiedadeGuideOpen(true)
                      }
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
                  </div>
                  {isBellCriteriaStep && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setBellCranioOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                        title="Ver imagem do VII par craniano"
                      >
                        <Info className="h-4 w-4" />
                        VII par craniano
                      </button>
                    </div>
                  )}
                  {isAsthmaStartStep && (
                    <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <h5 className="text-sm font-extrabold uppercase tracking-wide text-cyan-900">
                            Referência rápida de ausculta
                          </h5>
                          <p className="text-sm text-cyan-900">
                            Sibilância costuma soar como um chiado agudo, musical, predominante na expiração. Abra a referência sonora para ouvir o áudio e revisar rapidamente o que procurar na ausculta.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAsthmaSoundInfoOpen(true)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-700 text-xs font-extrabold text-white">
                            i
                          </span>
                          Ouvir e entender a sibilância
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {influenzaExamRequestOpen && isInfluenzaViralPanelStep && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-emerald-800 to-cyan-800 px-5 py-4 text-white">
                      <div>
                        <h4 className="text-lg font-extrabold">Solicitação de exames - Influenza / SRAG</h4>
                        <p className="mt-1 text-sm text-emerald-50">Selecione os exames indicados conforme gravidade, suspeitas associadas e disponibilidade do serviço.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInfluenzaExamRequestOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"
                        title="Fechar"
                        aria-label="Fechar solicitação de exames"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-slate-950">{influenzaSelectedExams.length} exame(s) selecionado(s)</p>
                          <p className="mt-1 text-xs text-slate-600">A coleta não deve atrasar oseltamivir, suporte respiratório ou antibioticoterapia quando indicada.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setInfluenzaSelectedExams(influenzaDefaultRequestedExams)}
                            className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-50"
                          >
                            Marcar pacote sugerido
                          </button>
                          <button
                            type="button"
                            onClick={() => setInfluenzaSelectedExams([])}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        {influenzaExamRequestGroups.map((group) => (
                          <section key={group.title} className={clsx('rounded-2xl border p-4', group.tone)}>
                            <h5 className="font-extrabold text-slate-950">{group.title}</h5>
                            <div className="mt-3 space-y-2">
                              {group.items.map((exam) => {
                                const checked = influenzaSelectedExams.includes(exam)
                                return (
                                  <label key={exam} className={clsx('flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors', checked ? 'border-white bg-white text-slate-950 shadow-sm' : 'border-transparent text-slate-700 hover:bg-white/60')}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleSelection(setInfluenzaSelectedExams, exam)}
                                      className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600"
                                    />
                                    <span>{exam}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setInfluenzaExamRequestOpen(false)}
                        className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                      >
                        Confirmar solicitação
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isPneumoniaWardDestinationStep && (
                <div className={clsx(
                  'mb-6 rounded-2xl border p-5',
                  effectivePneumoniaDripScore >= 4
                    ? 'border-violet-300 bg-violet-50 text-violet-950'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                )}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-extrabold">
                        {effectivePneumoniaDripScore >= 4
                          ? 'DRIP positivo: risco de patógenos resistentes'
                          : 'DRIP negativo: baixo risco de patógenos resistentes'}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed">
                        {effectivePneumoniaDripScore >= 4
                          ? 'Avaliar cobertura ampliada para MRSA/Pseudomonas conforme culturas prévias, epidemiologia local, função renal e protocolo institucional. Considerar piperacilina-tazobactam, cefepime ou meropenem, com associação apropriada para PAC grave e posterior descalonamento.'
                          : 'Na ausência de outros fatores de resistência, considerar esquema habitual para PAC internada, como ceftriaxona associada a azitromicina ou claritromicina, ajustando a alergias, função renal e protocolo institucional.'}
                      </p>
                    </div>
                    <span className={clsx(
                      'shrink-0 rounded-xl px-4 py-2 text-sm font-black',
                      effectivePneumoniaDripScore >= 4 ? 'bg-violet-700 text-white' : 'bg-white text-emerald-800'
                    )}>
                      DRIP {effectivePneumoniaDripScore}
                    </span>
                  </div>
                </div>
              )}

              {isTVPVascularReferralStep && !flowchart.finalSteps.includes(currentStep) && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Documento de encaminhamento</p>
                    <h4 className="mt-1 text-lg font-extrabold">Avaliação pela Cirurgia Vascular</h4>
                  </div>

                  <div className="space-y-6 p-5 text-sm leading-relaxed text-slate-800 sm:p-6">
                    <div>
                      <p className="font-semibold">Prezado(a) Cirurgião(ã) Vascular,</p>
                      <p className="mt-2">Encaminho paciente com diagnóstico ou suspeita de Trombose Venosa Profunda (TVP) para avaliação especializada.</p>
                    </div>

                    <section>
                      <h5 className="border-b border-slate-200 pb-2 font-extrabold uppercase text-slate-950">Resumo clínico</h5>
                      <dl className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3"><dt className="font-bold">Início dos sintomas</dt><dd>Não informado no fluxo. Atendimento em {new Date(patient.admission.date).toLocaleDateString('pt-BR')} às {patient.admission.time || '____'}.</dd></div>
                        <div className="rounded-lg bg-slate-50 p-3"><dt className="font-bold">Membro acometido</dt><dd>{selectedTVPLeg === 'left' ? 'Membro inferior esquerdo' : selectedTVPLeg === 'right' ? 'Membro inferior direito' : selectedTVPLeg === 'other' ? 'Outra localização selecionada' : 'Não informado'}</dd></div>
                        <div className="rounded-lg bg-slate-50 p-3 md:col-span-2"><dt className="font-bold">Sintomas e achados</dt><dd>{tvpReferralSymptoms.length > 0 ? tvpReferralSymptoms.join('; ') : 'Não informados no fluxo.'}</dd></div>
                        <div className="rounded-lg bg-slate-50 p-3 md:col-span-2"><dt className="font-bold">Fatores de risco identificados</dt><dd>{tvpReferralRiskFactors.length > 0 ? Array.from(new Set(tvpReferralRiskFactors)).join('; ') : 'Não identificados ou não informados.'}</dd></div>
                      </dl>
                    </section>

                    <section>
                      <h5 className="border-b border-slate-200 pb-2 font-extrabold uppercase text-slate-950">Exame físico</h5>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {([
                          ['Edema', tvpReferralHasEdema],
                          ['Assimetria entre os membros', tvpReferralHasAsymmetry],
                          ['Dor à palpação do trajeto venoso', tvpReferralHasVenousPain],
                          ['Perfusão distal preservada', tvpReferralHasPreservedPulses],
                          ['Sinais de isquemia do membro', tvpReferralHasIschemia]
                        ] as Array<[string, boolean]>).map(([label, checked]) => (
                          <div key={String(label)} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                            <span className="font-semibold">{String(label)}</span>
                            <span className={clsx('rounded-full px-2.5 py-1 text-xs font-bold', checked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')}>
                              {checked ? 'Sim' : 'Não registrado'}
                            </span>
                          </div>
                        ))}
                        <div className="rounded-lg border border-slate-200 p-3 md:col-span-2"><strong>Pulsos arteriais:</strong> {tvpReferralHasPreservedPulses ? 'femoral, poplíteo, tibial posterior e pedioso palpáveis e simétricos.' : 'não informados no fluxo.'}</div>
                      </div>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <h5 className="border-b border-slate-200 pb-2 font-extrabold uppercase text-slate-950">Estratificação clínica</h5>
                        <div className="mt-3 rounded-lg bg-blue-50 p-4 text-blue-950">
                          <p><strong>Escore de Wells:</strong> {wellsScoreTotal} ponto{wellsScoreTotal === 1 ? '' : 's'}.</p>
                          <p><strong>Probabilidade clínica:</strong> {wellsRisk === 'moderada' ? 'intermediária' : wellsRisk}.</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="border-b border-slate-200 pb-2 font-extrabold uppercase text-slate-950">Exames complementares</h5>
                        <div className="mt-3 rounded-lg bg-blue-50 p-4 text-blue-950">
                          <p><strong>D-dímero:</strong> {tvpReferralDdimer}.</p>
                          <p className="mt-1"><strong>Ultrassonografia:</strong> {tvpReferralUltrasound}</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h5 className="border-b border-slate-200 pb-2 font-extrabold uppercase text-slate-950">Extensão da trombose</h5>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['Distal', 'Poplítea', 'Femoropoplítea', 'Iliofemoral', 'Bilateral', 'Outro'].map((location) => {
                          const selected = location === 'Iliofemoral' && selectedClinicalFindings.some((item) => /iliofemoral|raiz da coxa/i.test(item))
                          return <span key={location} className={clsx('rounded-lg border px-3 py-2 font-semibold', selected ? 'border-red-300 bg-red-50 text-red-800' : 'border-slate-200 bg-white text-slate-500')}>{selected ? 'Selecionado: ' : ''}{location}</span>
                        })}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Completar a extensão após varredura venosa completa, quando ainda não definida.</p>
                    </section>

                    <section>
                      <h5 className="border-b border-slate-200 pb-2 font-extrabold uppercase text-slate-950">Tratamento instituído</h5>
                      <div className="mt-3 rounded-lg border border-slate-200 p-4">
                        <p><strong>Anticoagulação iniciada:</strong> {tvpReferralTherapies.length > 0 ? 'Sim' : 'Não registrada'}.</p>
                        <p className="mt-1"><strong>Medicamento e dose:</strong> {tvpReferralTherapies.length > 0 ? tvpReferralTherapies.map((item) => item.text).join('; ') : '____________________________________'}.</p>
                        <p className="mt-1"><strong>Horário da primeira dose:</strong> ____________________.</p>
                      </div>
                    </section>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                      Solicito avaliação da Cirurgia Vascular para definição da necessidade de abordagem especializada, incluindo terapia endovascular, trombólise dirigida por cateter, trombectomia venosa ou outras intervenções quando indicadas, especialmente em TVP extensa, iliofemoral, progressão clínica ou sinais de comprometimento do membro.
                    </div>

                    <div className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
                      <p><strong>Médico(a):</strong><br />____________________________</p>
                      <p><strong>CRM:</strong><br />____________________________</p>
                      <p><strong>Data/Hora:</strong><br />{new Date().toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              )}

              {isBellTreatmentStep && (
                <div className="mb-6 space-y-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Conduta conforme gravidade</p>
                    <h4 className="mt-1 text-xl font-extrabold text-slate-950">House-Brackmann {bellSelectedHouseLabel}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-blue-950">
                      {bellIsNormalFunction
                        ? 'Função facial normal: não há indicação de corticoide ou antiviral para Paralisia de Bell.'
                        : ['house_ii', 'house_iii'].includes(bellSelectedHouseValue)
                          ? 'Disfunção leve a moderada: corticosteroide é o tratamento principal; antiviral geralmente não é necessário.'
                          : bellSelectedHouseValue === 'house_iv'
                            ? 'Disfunção moderadamente grave: corticosteroide é o tratamento principal e o antiviral associado pode ser considerado dentro de 72 horas.'
                            : 'Disfunção grave ou paralisia completa: corticosteroide é o tratamento principal e há maior justificativa para oferecer antiviral associado dentro de 72 horas.'}
                    </p>
                  </div>

                  {!bellIsNormalFunction && (
                    <div className="grid gap-5 lg:grid-cols-2">
                      <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <h5 className="font-extrabold text-slate-950">1. Janela terapêutica e corticoide</h5>
                          <p className="mt-1 text-sm text-slate-600">Registre o tempo desde o início da paresia/paralisia.</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            { value: true, label: 'Até 72 horas' },
                            { value: false, label: 'Mais de 72 horas' }
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                setBellWithin72Hours(item.value)
                                if (!item.value) setBellAntiviralChoice('none')
                              }}
                              className={clsx(
                                'rounded-xl border px-4 py-3 text-sm font-bold transition-colors',
                                bellWithin72Hours === item.value
                                  ? 'border-blue-500 bg-blue-600 text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <label className={clsx('flex cursor-pointer items-start gap-3 rounded-xl border p-4', bellUseCorticosteroid ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white')}>
                          <input
                            type="checkbox"
                            checked={bellUseCorticosteroid}
                            disabled={bellAntiviralChoice !== 'none'}
                            onChange={(event) => setBellUseCorticosteroid(event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                          />
                          <span className="text-sm text-slate-800">
                            <strong className="block text-slate-950">Corticosteroide</strong>
                            Prednisona 60 mg/dia por 5 dias, seguida de redução de 10 mg/dia até completar 10 dias.
                          </span>
                        </label>
                        {bellWithin72Hours === false && (
                          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                            Após 72 horas, o benefício do início do tratamento é menos estabelecido. Individualize e registre a decisão clínica.
                          </p>
                        )}
                      </section>

                      <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <h5 className="font-extrabold text-slate-950">2. Antiviral associado</h5>
                          <p className="mt-1 text-sm text-slate-600">Nunca utilizar isoladamente. O benefício adicional é pequeno e mais plausível nos graus IV–VI.</p>
                        </div>
                        {!bellAntiviralMayBenefit ? (
                          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">House-Brackmann II–III: antiviral não indicado rotineiramente neste protocolo.</div>
                        ) : bellWithin72Hours !== true ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Selecione “Até 72 horas” para liberar as opções antivirais.</div>
                        ) : (
                          <div className="grid gap-2">
                            {[
                              { value: 'none', label: 'Não associar antiviral' },
                              { value: 'valaciclovir', label: 'Valaciclovir 1.000 mg 8/8h por 7 dias' },
                              { value: 'aciclovir', label: 'Aciclovir 400 mg 5x/dia por 10 dias' },
                              { value: 'famciclovir', label: 'Famciclovir 500 mg 8/8h por 7 dias' }
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                  setBellAntiviralChoice(item.value as BellAntiviralChoice)
                                  if (item.value !== 'none') setBellUseCorticosteroid(true)
                                }}
                                className={clsx('rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-colors', bellAntiviralChoice === item.value ? 'border-violet-500 bg-violet-50 text-violet-950' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300')}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {bellAntiviralStronglyConsider && bellWithin72Hours === true && bellAntiviralChoice === 'none' && (
                          <p className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs font-semibold text-violet-900">Grau V–VI: considerar fortemente a associação após discutir o pequeno benefício potencial, riscos e preferências do paciente.</p>
                        )}
                      </section>
                    </div>
                  )}

                  <section className={clsx('rounded-xl border p-4', bellHasIncompleteEyeClosure ? 'border-red-300 bg-red-50' : 'border-cyan-200 bg-cyan-50')}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={bellUseEyeCare}
                        onChange={(event) => setBellUseEyeCare(event.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-cyan-700"
                      />
                      <div>
                        <h5 className="font-extrabold text-slate-950">Proteção ocular</h5>
                        <p className="mt-1 text-sm leading-relaxed text-slate-800">
                          Lágrimas artificiais durante o dia, pomada lubrificante e oclusão palpebral cuidadosa à noite, além de proteção contra vento e poeira.
                          {bellHasIncompleteEyeClosure && ' O fechamento ocular incompleto torna esta medida prioritária para prevenir abrasão, ceratite e úlcera de córnea.'}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-red-800">Dor ocular, hiperemia, fotofobia ou alteração visual exigem avaliação oftalmológica.</p>
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-end border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      disabled={!bellIsNormalFunction && bellWithin72Hours === null}
                      onClick={handleGenerateBellTreatmentPrescription}
                      className={clsx('inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors', bellIsNormalFunction || bellWithin72Hours !== null ? 'bg-blue-700 text-white hover:bg-blue-800' : 'cursor-not-allowed bg-slate-200 text-slate-500')}
                    >
                      <Pill className="h-4 w-4" />
                      {bellIsNormalFunction ? 'Registrar conduta e continuar' : 'Confirmar conduta e gerar prescrição'}
                    </button>
                  </div>
                </div>
              )}

              {isAVCCincinnatiStep && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-blue-900 flex items-center gap-2">
                        <span>Como fazer o Cincinnati</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setCincinnatiInfoOpen(true)}
                        className="w-7 h-7 rounded-full border border-blue-300 bg-white text-blue-700 inline-flex items-center justify-center hover:bg-blue-100 transition-colors"
                        title="Abrir explicação e vídeo"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                      <li><strong>Face:</strong> pedir para sorrir e observar assimetria</li>
                      <li><strong>Braço:</strong> elevar ambos por 10 segundos e avaliar queda unilateral</li>
                      <li><strong>Fala:</strong> repetir frase simples e avaliar disartria/afasia</li>
                      <li><strong>Tempo:</strong> registrar última vez visto bem</li>
                    </ul>
                  </div>
                </div>
              )}

              {isGasometryFlow && currentStepData.id === 'coleta_parametros' && (
                <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {gasometryFieldConfig.map((field) => {
                      const value = gasometryDraft[field.key]
                      const parsed = gasometryValidation.parsed[field.key]
                      const error = gasometryValidation.errors[field.key]
                      const feedback = getGasometryFieldFeedback(field.key, parsed)
                      const toneClass = error
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : feedback.tone === 'red'
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : feedback.tone === 'amber'
                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                            : feedback.tone === 'emerald'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-slate-300 bg-slate-50 text-slate-600'
                      return (
                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                              {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>} {field.required && <span className="text-red-600">*</span>}
                            </label>
                            <button
                              type="button"
                              onClick={() => setGasometryInfoOpen(prev => prev === field.key ? null : field.key)}
                              className="w-6 h-6 rounded-full border border-blue-300 bg-blue-50 text-blue-700 inline-flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Como esse valor é usado no cálculo"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setGasometryDraft(prev => ({ ...prev, [field.key]: normalizeGasometryInput(field.key, e.target.value) }))}
                            onBlur={(e) => setGasometryDraft(prev => ({ ...prev, [field.key]: normalizeGasometryInput(field.key, e.target.value, true) }))}
                            className={clsx('mt-1 w-full rounded-xl border px-3 py-2.5 focus:ring-2 outline-none', toneClass, 'focus:ring-slate-300')}
                            placeholder={`${field.min} – ${field.max}`}
                          />
                          <div className={clsx('mt-2 inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold', toneClass)}>
                            {error ? error : feedback.text}
                          </div>
                          {gasometryInfoOpen === field.key && (
                            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-900 space-y-1">
                              {gasometryFieldInfo[field.key].map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (!requiredGasometryReady) return
                        const payload = Object.entries(gasometryValidation.parsed).reduce((acc, [key, value]) => {
                          if (value !== null) acc[key] = value
                          return acc
                        }, {} as Record<string, number>)
                        handleAnswer('avaliar_ph', JSON.stringify(payload))
                      }}
                      disabled={!requiredGasometryReady}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all',
                        requiredGasometryReady
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Aplicar valores e continuar
                    </motion.button>
                  </div>
                </div>
              )}

              {isAsthmaFlow && currentStepData.id === 'asma_avaliacao_inicial' && (
                <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {asthmaInitialFieldConfig.map((field) => {
                      const value = asthmaInitialDraft[field.key]
                      const parsed = asthmaInitialValidation.parsed[field.key]
                      const error = asthmaInitialValidation.errors[field.key]
                      const feedback = getAsthmaFieldFeedback(field.key, parsed)
                      const toneClass = error
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : parsed === null
                          ? 'border-slate-300 bg-slate-50 text-slate-600'
                          : getFeedbackToneClass(feedback.tone)
                      return (
                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                              {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>} {field.required && <span className="text-red-600">*</span>}
                            </label>
                            <div className="relative group">
                              <div className="w-6 h-6 rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 inline-flex items-center justify-center">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                              <div className="absolute z-20 right-0 mt-2 w-72 hidden group-hover:block rounded-lg border border-cyan-200 bg-white p-2.5 shadow-xl text-xs text-slate-700 space-y-1">
                                {asthmaInitialInfo[field.key].map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setAsthmaInitialDraft(prev => ({ ...prev, [field.key]: e.target.value.replace(',', '.') }))}
                            className={clsx('mt-1 w-full rounded-xl border px-3 py-2.5 focus:ring-2 outline-none', toneClass, 'focus:ring-slate-300')}
                            placeholder={`${field.min} – ${field.max}`}
                          />
                          <div className={clsx('mt-2 inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold', toneClass)}>
                            {error ? error : feedback.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    {[
                      { key: 'usoMusculatura', label: 'Uso de musculatura acessória' },
                      { key: 'incapazFrases', label: 'Incapaz de falar frases completas' },
                      { key: 'falaPalavras', label: 'Fala apenas palavras' },
                      { key: 'cianose', label: 'Cianose' },
                      { key: 'confusao', label: 'Confusão/Agitação' },
                      { key: 'exaustao', label: 'Exaustão respiratória' },
                      { key: 'toraxSilente', label: 'Tórax silencioso' },
                      { key: 'sonolencia', label: 'Sonolência/rebaixamento' }
                    ].map((flag) => (
                      <label key={flag.key} className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <input
                          type="checkbox"
                          checked={asthmaFlags[flag.key as keyof typeof asthmaFlags]}
                          onChange={(e) => setAsthmaFlags(prev => ({ ...prev, [flag.key]: e.target.checked }))}
                        />
                        <span>{flag.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (!requiredAsthmaInitialReady) return
                        const values = Object.entries(asthmaInitialValidation.parsed).reduce((acc, [key, value]) => {
                          if (value !== null) acc[key] = value
                          return acc
                        }, {} as Record<string, number>)
                        handleAnswer('asma_classificacao_gravidade', JSON.stringify({ values, flags: asthmaFlags }))
                      }}
                      disabled={!requiredAsthmaInitialReady}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all',
                        requiredAsthmaInitialReady ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Aplicar avaliação e continuar
                    </motion.button>
                  </div>
                </div>
              )}

              {isAsthmaFlow && currentStepData.id === 'asma_reavaliacao_1h' && (
                <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    {asthmaReevalFieldConfig.map((field) => {
                      const value = asthmaReevalDraft[field.key]
                      const parsed = asthmaReevalValidation.parsed[field.key]
                      const error = asthmaReevalValidation.errors[field.key]
                      const feedback = getAsthmaFieldFeedback(field.key, parsed)
                      const toneClass = error
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : parsed === null
                          ? 'border-slate-300 bg-slate-50 text-slate-600'
                          : getFeedbackToneClass(feedback.tone)
                      return (
                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                              {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>} {field.required && <span className="text-red-600">*</span>}
                            </label>
                            <div className="relative group">
                              <div className="w-6 h-6 rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 inline-flex items-center justify-center">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                              <div className="absolute z-20 right-0 mt-2 w-72 hidden group-hover:block rounded-lg border border-cyan-200 bg-white p-2.5 shadow-xl text-xs text-slate-700 space-y-1">
                                {asthmaReevalInfo[field.key].map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setAsthmaReevalDraft(prev => ({ ...prev, [field.key]: e.target.value.replace(',', '.') }))}
                            className={clsx('mt-1 w-full rounded-xl border px-3 py-2.5 focus:ring-2 outline-none', toneClass, 'focus:ring-slate-300')}
                            placeholder={`${field.min} – ${field.max}`}
                          />
                          <div className={clsx('mt-2 inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold', toneClass)}>
                            {error ? error : feedback.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={asthmaReevalFlags.melhoraClinica}
                        onChange={(e) => setAsthmaReevalFlags(prev => ({ ...prev, melhoraClinica: e.target.checked }))}
                      />
                      <span>Melhora clínica global após 1 hora</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={asthmaReevalFlags.necessidadeBroncoRepetido}
                        onChange={(e) => setAsthmaReevalFlags(prev => ({ ...prev, necessidadeBroncoRepetido: e.target.checked }))}
                      />
                      <span>Necessidade repetida de broncodilatador</span>
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (!requiredAsthmaReevalReady) return
                        const values = Object.entries(asthmaReevalValidation.parsed).reduce((acc, [key, value]) => {
                          if (value !== null) acc[key] = value
                          return acc
                        }, {} as Record<string, number>)
                        handleAnswer('asma_decisao_1h', JSON.stringify({ values, flags: asthmaReevalFlags }))
                      }}
                      disabled={!requiredAsthmaReevalReady}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all',
                        requiredAsthmaReevalReady ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Aplicar reavaliação e continuar
                    </motion.button>
                  </div>
                </div>
              )}

              {isDpocSinaisGravidade && (
                <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Checklist: Sinais de Gravidade
                    </h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700">
                      {dpocSinaisGravidade.length} sinal(is)
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200 mb-6">
                    <p className="text-xs text-red-800 font-semibold mb-3">Marque as opções caso o paciente apresente:</p>
                    <div className="space-y-1.5">
                      {dpocSinaisGravidadeItems.map((item) => {
                        const checked = dpocSinaisGravidade.includes(item)
                        return (
                          <label
                            key={item}
                            className={clsx(
                              'flex items-start gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                              checked ? 'bg-white shadow-sm ring-1 ring-red-300' : 'hover:bg-red-100/50'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelection(setDpocSinaisGravidade, item)}
                              className="mt-1 flex-shrink-0 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                            />
                            <span className={clsx('text-sm', checked ? 'font-medium text-red-900' : 'text-slate-700')}>
                              {item}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const hasSeverity = dpocSinaisGravidade.length > 0
                        const nextStep = hasSeverity ? 'medidas_iniciais_graves' : 'tratamento_inicial_leve'
                        handleOptionSelect({ text: hasSeverity ? 'Prosseguir (Quadro Grave)' : 'Prosseguir (Leve/Moderado)', nextStep: nextStep, value: hasSeverity ? 'grave' : 'leve' })
                      }}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all text-white',
                        dpocSinaisGravidade.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                      )}
                    >
                      {dpocSinaisGravidade.length > 0 ? 'Prosseguir (Quadro Grave)' : 'Prosseguir (Leve/Moderado)'}
                    </motion.button>
                  </div>
                </div>
              )}

              {isDpocAnthonisen && (
                <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Critérios de Anthonisen
                    </h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                      {dpocAnthonisen.length} critério(s)
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 mb-4">
                    <div className="space-y-1.5">
                      {dpocAnthonisenItems.map((item) => {
                        const checked = dpocAnthonisen.includes(item)
                        return (
                          <label
                            key={item}
                            className={clsx(
                              'flex items-start gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                              checked ? 'bg-white shadow-sm ring-1 ring-amber-300' : 'hover:bg-amber-100/50'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelection(setDpocAnthonisen, item)}
                              className="mt-1 flex-shrink-0 w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                            />
                            <span className={clsx('text-sm', checked ? 'font-medium text-amber-900' : 'text-slate-700')}>
                              {item}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {(() => {
                    const count = dpocAnthonisen.length
                    const type = count === 3 ? 'Tipo I (Grave)' : count === 2 ? 'Tipo II (Moderado)' : count === 1 ? 'Tipo III (Leve)' : 'Nenhum'
                    const hasPurulence = dpocAnthonisen.includes('Escarro purulento')
                    const requiresAtb = count === 3 || (count === 2 && hasPurulence)

                    return (
                      <div className="space-y-4">
                        <div className={clsx(
                          'p-3 rounded-lg border-l-4 text-sm',
                          requiresAtb ? 'bg-red-50 border-red-500 text-red-800' : 'bg-blue-50 border-blue-500 text-blue-800'
                        )}>
                          <strong>Classificação:</strong> {type}.<br/>
                          {requiresAtb ? 'Indicação clara de Antibioticoterapia.' : 'Sem indicação formal de Antibiótico pelos critérios.'}
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const nextAtb = isDpocAnthonisenAmbulatorial ? 'iniciar_atb' : 'iniciar_atb_hospitalar'
                              const nextNoAtb = isDpocAnthonisenAmbulatorial ? 'houve_melhora_clinica' : 'paciente_estabilizado'
                              handleOptionSelect({ text: requiresAtb ? 'Iniciar Antibioticoterapia' : 'Não iniciar ATB / Prosseguir', nextStep: requiresAtb ? nextAtb : nextNoAtb, value: requiresAtb ? 'sim' : 'nao' })
                            }}
                            className={clsx(
                              'px-5 py-2.5 rounded-xl font-semibold transition-all text-white',
                              requiresAtb ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-600 hover:bg-slate-700'
                            )}
                          >
                            {requiresAtb ? 'Iniciar Antibioticoterapia' : 'Não iniciar ATB / Prosseguir'}
                          </motion.button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {isInfluenzaSeverityStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                      Checklist de sinais de gravidade
                    </h4>
                    <span className={clsx(
                      'rounded-lg px-2 py-1 text-xs font-semibold border',
                      influenzaSeveritySigns.length > 0
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    )}>
                      {influenzaSeveritySigns.length} marcado(s)
                    </span>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-red-50 p-4">
                    <p className="mb-3 text-xs font-semibold text-amber-900">
                      Marque os sinais presentes. Se houver qualquer item, o quadro segue como SRAG.
                    </p>
                    <div className="space-y-1.5">
                      {INFLUENZA_SEVERITY_SIGNS.map((item) => {
                        const checked = influenzaSeveritySigns.includes(item)
                        return (
                          <label
                            key={item}
                            className={clsx(
                              'flex items-start gap-2 rounded-lg p-2 transition-colors cursor-pointer',
                              checked ? 'bg-white shadow-sm ring-1 ring-amber-300' : 'hover:bg-white/70'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelection(setInfluenzaSeveritySigns, item)}
                              className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className={clsx('text-sm', checked ? 'font-medium text-amber-950' : 'text-slate-700')}>{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-4 text-sm',
                    influenzaSeveritySigns.length > 0 ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  )}>
                    {influenzaSeveritySigns.length > 0
                      ? 'Sinais de gravidade presentes: classificar como síndrome respiratória aguda grave (SRAG) e definir nível de internação.'
                      : influenzaSeverityIsReassessment
                        ? 'A reavaliação não confirmou critérios de SRAG: seguir para conduta ambulatorial, mantendo tratamento e orientações conforme os fatores previamente registrados.'
                        : 'Sem sinais de gravidade neste momento: seguir avaliação de fatores de risco e sinais de piora clínica.'}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(
                        influenzaSeveritySigns.length > 0
                          ? 'influenza_criterios_uti'
                          : influenzaSeverityIsReassessment
                            ? influenzaHasAmbulatoryOseltamivirIndication
                              ? 'influenza_ambulatorial_oseltamivir'
                              : 'influenza_ambulatorial_sintomaticos'
                            : 'influenza_fatores_risco',
                        influenzaSeveritySigns.length > 0
                          ? 'srag'
                          : influenzaSeverityIsReassessment
                            ? influenzaHasAmbulatoryOseltamivirIndication
                              ? 'srag_nao_confirmada_ambulatorial_oseltamivir'
                              : 'srag_nao_confirmada_ambulatorial_sintomaticos'
                            : 'sindrome_gripal'
                      )}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        influenzaSeveritySigns.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      {influenzaSeveritySigns.length > 0
                        ? 'Classificar como SRAG'
                        : influenzaSeverityIsReassessment
                          ? influenzaHasAmbulatoryOseltamivirIndication
                            ? 'Seguir para conduta ambulatorial com oseltamivir'
                            : 'Seguir para conduta ambulatorial sintomática'
                          : 'Seguir como síndrome gripal'}
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaCrbStep && (
                <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-blue-950">Etapa 1 - CRB-65</h4>
                      <p className="text-sm text-blue-900">Primeiro score de triagem: pode ir para casa ou precisa avaliação hospitalar?</p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-900">
                      {pneumoniaCrbScore} ponto(s)
                      <div className="text-xs font-semibold">{pneumoniaCrbInterpretation}</div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {pneumoniaCrbItems.map((item) => {
                      const checked = pneumoniaCrbCriteria.includes(item)
                      return (
                        <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelection(setPneumoniaCrbCriteria, item)}
                            className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{item}</span>
                          <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+1</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer('pac_solicitacao_exames', `crb65_${pneumoniaCrbScore}`)}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Solicitar exames
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaExamRequestStep && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-800 p-5 text-white">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-base font-extrabold uppercase tracking-wide">Etapa 2 - Solicitação de exames</h4>
                        <p className="mt-1 text-sm text-sky-100">Marque os exames solicitados antes de aplicar o CURB-65. O checklist será registrado no prontuário.</p>
                      </div>
                      <div className="rounded-xl bg-white/15 px-4 py-3 text-sm font-bold">
                        {pneumoniaSelectedExams.length} exame(s)
                        <div className="text-xs font-semibold text-sky-100">selecionado(s)</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
                      <p className="font-bold">Pacote laboratorial inicial mais utilizado no pronto-socorro</p>
                      <p className="mt-1">Hemograma completo, ureia, creatinina, sódio, potássio, glicemia e PCR. Acrescentar lactato se suspeita de sepse/gravidade e gasometria arterial se hipoxemia ou desconforto respiratório.</p>
                      <button
                        type="button"
                        onClick={() => setPneumoniaSelectedExams(Array.from(new Set([...pneumoniaSelectedExams, ...pneumoniaInitialLabPackage])))}
                        className="mt-3 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-800"
                      >
                        Marcar pacote inicial
                      </button>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {pneumoniaExamGroups.map((group) => {
                        const selectedCount = group.items.filter((item) => pneumoniaSelectedExams.includes(item)).length
                        return (
                          <div key={group.key} className={clsx('rounded-2xl border p-4', group.tone)}>
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <h5 className="font-extrabold">{group.title}</h5>
                                <p className="mt-1 text-xs leading-relaxed opacity-80">{group.description}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700">
                                {selectedCount}/{group.items.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {group.items.map((item) => {
                                const checked = pneumoniaSelectedExams.includes(item)
                                return (
                                  <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-xl p-2 text-sm transition-colors', checked ? 'bg-white shadow-sm' : 'hover:bg-white/70')}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleSelection(setPneumoniaSelectedExams, item)}
                                      className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600"
                                    />
                                    <span>{item}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onClick={() => setPneumoniaSelectedExams([])}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Limpar seleção
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer('pac_resultados_exames', 'exames_solicitados')}
                        className="rounded-xl bg-cyan-700 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-cyan-800"
                      >
                        Registrar resultados
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {isPneumoniaLabResultsStep && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-sky-900 to-cyan-800 p-5 text-white">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-base font-extrabold uppercase tracking-wide">Resultados dos exames iniciais</h4>
                        <p className="mt-1 text-sm text-sky-100">Preencha os resultados já disponíveis. Campos pendentes podem permanecer em branco.</p>
                      </div>
                      <div className="rounded-xl bg-white/15 px-4 py-3 text-sm font-bold">
                        {Object.values(pneumoniaLabResults).filter((value) => value.trim()).length}/{pneumoniaResultExams.length}
                        <div className="text-xs font-semibold text-sky-100">resultado(s) registrado(s)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    {pneumoniaResultExams.length === 0 ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                        Nenhum exame básico ou de gravidade foi selecionado. Volte à etapa anterior para revisar a solicitação ou prossiga para confirmar o CURB-65 com os dados clínicos disponíveis.
                      </div>
                    ) : (
                      pneumoniaExamGroups
                        .filter((group) => ['basicos', 'gravidade'].includes(group.key))
                        .map((group) => {
                          const exams = group.items.filter((exam) => pneumoniaResultExams.includes(exam))
                          if (exams.length === 0) return null
                          return (
                            <section key={group.key} className={clsx('rounded-2xl border p-4', group.tone)}>
                              <div className="mb-4">
                                <h5 className="font-extrabold">{group.title}</h5>
                                <p className="mt-1 text-xs opacity-80">Informe os valores liberados pelo laboratório.</p>
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                {exams.map((exam) => {
                                  const config = pneumoniaLabResultConfig[exam]
                                  return (
                                    <label key={exam} className="rounded-xl border border-white/80 bg-white p-3 shadow-sm">
                                      <span className="mb-2 block text-sm font-bold text-slate-900">{exam}</span>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          inputMode={config.inputMode || 'text'}
                                          value={pneumoniaLabResults[exam] || ''}
                                          onChange={(event) => setPneumoniaLabResults((previous) => ({ ...previous, [exam]: event.target.value }))}
                                          placeholder={config.placeholder}
                                          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                        />
                                        {config.unit && <span className="shrink-0 text-xs font-bold text-slate-600">{config.unit}</span>}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            </section>
                          )
                        })
                    )}

                    <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h5 className="font-extrabold text-cyan-950">CURB-65 calculado automaticamente</h5>
                          <p className="mt-1 text-xs text-cyan-800">Resultado definitivo com exames, sinais vitais, exame físico e idade já registrados.</p>
                        </div>
                        <span className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-black text-cyan-900 shadow-sm">
                          {Object.values(pneumoniaAutomaticCurbValues).filter(Boolean).length} ponto(s)
                          <span className="mt-0.5 block text-xs font-semibold">
                            {calculatePneumoniaCurb65(pneumoniaAutomaticCurbValues).disposition}
                          </span>
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {pneumoniaCurbItems.map((item) => (
                          <div key={item.key} className={clsx('flex items-center justify-between rounded-lg border p-2 text-sm', pneumoniaAutomaticCurbValues[item.key] ? 'border-cyan-300 bg-white font-semibold text-cyan-950' : 'border-cyan-100 bg-cyan-50/50 text-slate-600')}>
                            <span>
                              <span className="block">{item.label}</span>
                              <span className={clsx('mt-0.5 block text-xs font-medium', pneumoniaAutomaticCurbValues[item.key] ? 'text-cyan-700' : 'text-slate-500')}>
                                {pneumoniaAutomaticCurbDetails[item.key]}
                              </span>
                            </span>
                            <span className={clsx('rounded-full px-2 py-0.5 text-xs font-bold', pneumoniaAutomaticCurbValues[item.key] ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-500')}>
                              {pneumoniaAutomaticCurbValues[item.key] ? 'Selecionado' : 'Não'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePneumoniaLabsAndAutomaticCurb}
                        className={clsx(
                          'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                          calculatePneumoniaCurb65(pneumoniaAutomaticCurbValues).score <= 1
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-cyan-700 hover:bg-cyan-800'
                        )}
                      >
                        {calculatePneumoniaCurb65(pneumoniaAutomaticCurbValues).score <= 1
                          ? 'Salvar CURB-65 e seguir para manejo ambulatorial'
                          : 'Salvar CURB-65 e prosseguir para ATS/IDSA'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {isPneumoniaCurbProtocolStep && (
                <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-cyan-950">Etapa 3 - CURB-65</h4>
                      <p className="text-sm text-cyan-900">Após laboratório: risco inicial de mortalidade e necessidade de internação.</p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-cyan-900">
                      CURB-65 {pneumoniaCurbResult.score}
                      <div className="text-xs font-semibold">{pneumoniaCurbResult.disposition}</div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {pneumoniaCurbItems.map((item) => {
                      const checked = pneumoniaCurbValues[item.key]
                      return (
                        <label key={item.key} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-cyan-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setPneumoniaCurbValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="mt-1 h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span>{item.label}</span>
                          <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+1</span>
                        </label>
                      )
                    })}
                  </div>
                  <p className="mt-3 rounded-lg border border-cyan-200 bg-white p-3 text-xs font-semibold text-cyan-900">
                    Critérios pré-preenchidos a partir dos resultados, sinais vitais, exame físico e idade. Revise e ajuste manualmente se necessário antes de confirmar o escore.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(
                        pneumoniaCurbResult.score <= 1 ? 'pac_conduta_ambulatorial' : 'pac_ats_idsa_gravidade',
                        `curb65_${pneumoniaCurbResult.score}`
                      )}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        pneumoniaCurbResult.score <= 1 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-600 hover:bg-cyan-700'
                      )}
                    >
                      {pneumoniaCurbResult.score <= 1 ? 'Seguir para manejo ambulatorial' : 'Prosseguir para ATS/IDSA'}
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaAtsIdsaStep && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-rose-950">Etapa 3 - ATS/IDSA</h4>
                      <p className="text-sm text-rose-900">Score central para definir necessidade de UTI.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl px-4 py-3 text-sm font-bold',
                      pneumoniaAtsIdsaSevere
                        ? 'bg-red-600 text-white'
                        : pneumoniaAtsIdsaMinorCriteria.length === 2
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-white text-rose-900'
                    )}>
                      {pneumoniaAtsIdsaSevere
                        ? 'Indicação de UTI'
                        : pneumoniaAtsIdsaMinorCriteria.length === 2
                          ? 'Indicação de enfermaria'
                          : 'Sem destino automático'}
                      <div className="text-xs font-semibold">{pneumoniaAtsIdsaMajorCriteria.length} maior(es), {pneumoniaAtsIdsaMinorCriteria.length} menor(es)</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-900">Critérios maiores</p>
                      <div className="space-y-1.5">
                        {pneumoniaAtsIdsaMajorItems.map((item) => {
                          const checked = pneumoniaAtsIdsaMajorCriteria.includes(item)
                          return (
                            <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-rose-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSelection(setPneumoniaAtsIdsaMajorCriteria, item)} className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
                              <span>{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-900">Critérios menores</p>
                      <div className="space-y-1.5">
                        {pneumoniaAtsIdsaMinorItems.map((item) => {
                          const checked = pneumoniaAtsIdsaMinorCriteria.includes(item)
                          return (
                            <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-rose-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSelection(setPneumoniaAtsIdsaMinorCriteria, item)} className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
                              <span>{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm font-semibold',
                    pneumoniaAtsIdsaSevere
                      ? 'border-red-200 bg-red-100 text-red-950'
                      : pneumoniaAtsIdsaMinorCriteria.length === 2
                        ? 'border-amber-200 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-white text-slate-700'
                  )}>
                    {pneumoniaAtsIdsaSevere
                      ? 'Três ou mais critérios menores, ou ao menos um critério maior: encaminhar diretamente para UTI.'
                      : pneumoniaAtsIdsaMinorCriteria.length === 2
                        ? 'Dois critérios menores: encaminhar diretamente para internação em enfermaria.'
                        : pneumoniaCurbIndicatesHospitalization
                          ? 'CURB-65 já indicou internação hospitalar; com zero ou um critério menor no ATS/IDSA e nenhum critério maior, seguir para enfermaria.'
                        : 'Com zero ou um critério menor e nenhum critério maior, definir o destino conforme os demais escores e o julgamento clínico.'}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(
                        pneumoniaAtsIdsaNextStep,
                        pneumoniaAtsIdsaSevere
                          ? 'ats_idsa_uti'
                          : pneumoniaAtsIdsaMinorCriteria.length === 2
                            ? 'ats_idsa_enfermaria'
                            : pneumoniaCurbIndicatesHospitalization
                              ? 'ats_idsa_enfermaria_por_curb65'
                            : 'ats_idsa_definir_destino'
                      )}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        pneumoniaAtsIdsaSevere
                          ? 'bg-red-600 hover:bg-red-700'
                          : pneumoniaAtsIdsaMinorCriteria.length === 2
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                      )}
                    >
                      {pneumoniaAtsIdsaActionLabel}
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaDripStep && (
                <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-violet-950">Etapa 4 - DRIP Score</h4>
                      <p className="text-sm text-violet-900">Após decidir internação: precisa ampliar cobertura para MRSA/Pseudomonas?</p>
                    </div>
                    <div className={clsx('rounded-xl px-4 py-3 text-sm font-bold', pneumoniaDripScore >= 4 ? 'bg-violet-700 text-white' : 'bg-white text-violet-900')}>
                      DRIP {pneumoniaDripScore}
                      <div className="text-xs font-semibold">{pneumoniaDripInterpretation}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-900">Fatores maiores (+2)</p>
                      <div className="space-y-1.5">
                        {pneumoniaDripMajorItems.map((item) => {
                          const checked = pneumoniaDripMajorCriteria.includes(item)
                          return (
                            <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-violet-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSelection(setPneumoniaDripMajorCriteria, item)} className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500" />
                              <span>{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-900">Fatores menores (+1)</p>
                      <div className="space-y-1.5">
                        {pneumoniaDripMinorItems.map((item) => {
                          const checked = pneumoniaDripMinorCriteria.includes(item)
                          return (
                            <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-violet-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSelection(setPneumoniaDripMinorCriteria, item)} className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500" />
                              <span>{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-violet-200 bg-white p-3 text-sm text-violet-950">
                    {pneumoniaDripScore >= 4
                      ? 'Considerar cobertura ampliada conforme cenário: piperacilina-tazobactam, cefepime ou meropenem; avaliar MRSA conforme cultura/epidemiologia local.'
                      : 'Baixo risco pelo DRIP: esquema habitual de PAC, como ceftriaxona + azitromicina, se compatível com o cenário clínico.'}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(currentStepData.id === 'pac_drip_uti' ? 'pac_smartcop_uti' : 'pac_smartcop_enfermaria', `drip_${pneumoniaDripScore}`)}
                      className="rounded-xl bg-violet-700 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-violet-800"
                    >
                      Prosseguir para SMART-COP
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaSmartCopStep && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-orange-950">Etapa 5 - SMART-COP</h4>
                      <p className="text-sm text-orange-900">Risco de ventilação mecânica, vasopressor e suporte intensivo.</p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-orange-900">
                      {pneumoniaSmartCopScore} ponto(s)
                      <div className="text-xs font-semibold">{pneumoniaSmartCopInterpretation}</div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {pneumoniaSmartCopItems.map((item) => {
                      const checked = pneumoniaSmartCopCriteria.includes(item.label)
                      return (
                        <label key={item.label} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-orange-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                          <input type="checkbox" checked={checked} onChange={() => toggleSelection(setPneumoniaSmartCopCriteria, item.label)} className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500" />
                          <span>{item.label}</span>
                          <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+{item.points}</span>
                        </label>
                      )
                    })}
                  </div>
                  <details className="mt-4 rounded-xl border border-orange-200 bg-white p-4 text-sm text-slate-800">
                    <summary className="cursor-pointer font-bold text-orange-950">Ferramentas complementares de prognóstico</summary>
                    <p className="mt-3"><strong>PSI/PORT:</strong> mortalidade, auditoria, pesquisa e discussão de caso; pouco útil para decisão imediata no PS.</p>
                    <p className="mt-2"><strong>SCAP, SIPF e SOAR:</strong> complementares para risco de VM/choque/mortalidade, especialmente idosos e triagem rápida.</p>
                    <p className="mt-2"><strong>SOFA:</strong> se sepse/choque/UTI, avaliar disfunção orgânica.</p>
                    <p className="mt-2"><strong>SAPS 3:</strong> se UTI, predição de mortalidade hospitalar e indicadores de qualidade.</p>
                  </details>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(currentStepData.id === 'pac_smartcop_uti' ? 'pac_cuidados_aguarda_uti' : 'pac_cuidados_aguarda_enfermaria', `smartcop_${pneumoniaSmartCopScore}`)}
                      className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-orange-700"
                    >
                      Seguir para cuidados enquanto aguarda leito
                    </motion.button>
                  </div>
                </div>
              )}

              {false && isPneumoniaIntroStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">Calculadoras complementares de PAC</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        PSI e CURB-65 seguem nas próximas etapas. Aqui ficam os escores rápidos para triagem, UTI e risco de germes resistentes.
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
                      Apoio à decisão clínica
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-blue-950">CRB-65</h5>
                          <p className="text-xs text-blue-900">Sem laboratório. Máximo 4 pontos.</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2 text-right text-sm font-bold text-blue-900">
                          {pneumoniaCrbScore} ponto(s)
                          <div className="text-xs font-semibold">{pneumoniaCrbInterpretation}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {pneumoniaCrbItems.map((item) => {
                          const checked = pneumoniaCrbCriteria.includes(item)
                          return (
                            <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setPneumoniaCrbCriteria, item)}
                                className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{item}</span>
                              <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+1</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-rose-950">ATS/IDSA - PAC grave</h5>
                          <p className="text-xs text-rose-900">1 maior ou 3 menores define PAC grave.</p>
                        </div>
                        <div className={clsx('rounded-lg px-3 py-2 text-right text-sm font-bold', pneumoniaAtsIdsaSevere ? 'bg-red-600 text-white' : 'bg-white text-rose-900')}>
                          {pneumoniaAtsIdsaSevere ? 'PAC grave' : 'Sem PAC grave'}
                          <div className="text-xs font-semibold">{pneumoniaAtsIdsaMajorCriteria.length} maior(es), {pneumoniaAtsIdsaMinorCriteria.length} menor(es)</div>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-900">Maiores</p>
                          <div className="space-y-1.5">
                            {pneumoniaAtsIdsaMajorItems.map((item) => {
                              const checked = pneumoniaAtsIdsaMajorCriteria.includes(item)
                              return (
                                <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-rose-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelection(setPneumoniaAtsIdsaMajorCriteria, item)}
                                    className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                                  />
                                  <span>{item}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-900">Menores</p>
                          <div className="space-y-1.5">
                            {pneumoniaAtsIdsaMinorItems.map((item) => {
                              const checked = pneumoniaAtsIdsaMinorCriteria.includes(item)
                              return (
                                <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-rose-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelection(setPneumoniaAtsIdsaMinorCriteria, item)}
                                    className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                                  />
                                  <span>{item}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-orange-950">SMART-COP</h5>
                          <p className="text-xs text-orange-900">Risco de ventilação mecânica, vasopressor ou UTI.</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2 text-right text-sm font-bold text-orange-900">
                          {pneumoniaSmartCopScore} ponto(s)
                          <div className="text-xs font-semibold">{pneumoniaSmartCopInterpretation}</div>
                        </div>
                      </div>
                      <div className="grid gap-1.5 md:grid-cols-2">
                        {pneumoniaSmartCopItems.map((item) => {
                          const checked = pneumoniaSmartCopCriteria.includes(item.label)
                          return (
                            <label key={item.label} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-orange-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setPneumoniaSmartCopCriteria, item.label)}
                                className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span>{item.label}</span>
                              <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+{item.points}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-violet-950">DRIP Score</h5>
                          <p className="text-xs text-violet-900">Risco de patógenos resistentes. Complementar aos fatores ATS/IDSA e epidemiologia local.</p>
                        </div>
                        <div className={clsx('rounded-lg px-3 py-2 text-right text-sm font-bold', pneumoniaDripScore >= 4 ? 'bg-violet-700 text-white' : 'bg-white text-violet-900')}>
                          DRIP {pneumoniaDripScore}
                          <div className="text-xs font-semibold">{pneumoniaDripInterpretation}</div>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-900">Fatores maiores (+2)</p>
                          <div className="space-y-1.5">
                            {pneumoniaDripMajorItems.map((item) => {
                              const checked = pneumoniaDripMajorCriteria.includes(item)
                              return (
                                <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-violet-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelection(setPneumoniaDripMajorCriteria, item)}
                                    className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                                  />
                                  <span>{item}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-900">Fatores menores (+1)</p>
                          <div className="space-y-1.5">
                            {pneumoniaDripMinorItems.map((item) => {
                              const checked = pneumoniaDripMinorCriteria.includes(item)
                              return (
                                <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-violet-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelection(setPneumoniaDripMinorCriteria, item)}
                                    className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                                  />
                                  <span>{item}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-red-950">SCAP</h5>
                          <p className="text-xs text-red-900">Prediz ventilação mecânica, choque séptico e mortalidade hospitalar.</p>
                        </div>
                        <div className={clsx('rounded-lg px-3 py-2 text-right text-sm font-bold', pneumoniaScapScore >= 10 ? 'bg-red-600 text-white' : 'bg-white text-red-900')}>
                          {pneumoniaScapScore} ponto(s)
                          <div className="text-xs font-semibold">{pneumoniaScapInterpretation}</div>
                        </div>
                      </div>
                      <div className="grid gap-1.5 md:grid-cols-2">
                        {pneumoniaScapItems.map((item) => {
                          const checked = pneumoniaScapCriteria.includes(item.label)
                          return (
                            <label key={item.label} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-red-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setPneumoniaScapCriteria, item.label)}
                                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                              />
                              <span>{item.label}</span>
                              <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+{item.points}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-teal-950">SIPF</h5>
                          <p className="text-xs text-teal-900">Combina Shock Index (FC/PAS) e PaO2/FiO2.</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2 text-right text-sm font-bold text-teal-900">
                          SI {pneumoniaSipfShockIndexLabel}
                          <div className="text-xs font-semibold">{pneumoniaSipfInterpretation}</div>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          { key: 'fc', label: 'FC', unit: 'bpm' },
                          { key: 'pas', label: 'PAS', unit: 'mmHg' },
                          { key: 'pf', label: 'PaO2/FiO2', unit: '' }
                        ].map((field) => (
                          <label key={field.key} className="text-sm font-semibold text-teal-950">
                            {field.label}
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={pneumoniaSipfValues[field.key as keyof typeof pneumoniaSipfValues]}
                                onChange={(event) => setPneumoniaSipfValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                                className="w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-teal-200"
                              />
                              {field.unit ? <span className="text-xs text-teal-800">{field.unit}</span> : null}
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-teal-900">
                        Alerta se Shock Index ≥0,9 ou PaO2/FiO2 ≤250. Use como triagem rápida junto da avaliação clínica.
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-emerald-950">SOAR</h5>
                          <p className="text-xs text-emerald-900">Saturation, Orientation, Age, Respiratory Rate.</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2 text-right text-sm font-bold text-emerald-900">
                          {pneumoniaSoarScore} ponto(s)
                          <div className="text-xs font-semibold">{pneumoniaSoarInterpretation}</div>
                        </div>
                      </div>
                      <div className="grid gap-1.5 md:grid-cols-2">
                        {pneumoniaSoarItems.map((item) => {
                          const checked = pneumoniaSoarCriteria.includes(item)
                          return (
                            <label key={item} className={clsx('flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm', checked ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-700 hover:bg-white/70')}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setPneumoniaSoarCriteria, item)}
                                className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{item}</span>
                              <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+1</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isPneumoniaPsiStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">Calculadora PSI</h4>
                      <p className="text-sm text-slate-600">PSI é preferencial para definir ambulatório, enfermaria ou UTI na PAC.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      pneumoniaPsiResult.score < 71 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                        pneumoniaPsiResult.score <= 130 ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                          'border-red-200 bg-red-50 text-red-800'
                    )}>
                      {pneumoniaPsiResult.score} pts · {pneumoniaPsiResult.group}
                      <div className="text-xs font-semibold">{pneumoniaPsiResult.disposition}</div>
                    </div>
                  </div>

                  <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <label className="text-sm font-semibold text-slate-800">
                      Idade para pontuação demográfica
                    </label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={typeof pneumoniaPsiValues.idade === 'number' || typeof pneumoniaPsiValues.idade === 'string' ? pneumoniaPsiValues.idade : ''}
                        onChange={(e) => setPneumoniaPsiValues(prev => ({ ...prev, idade: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="w-full sm:w-40 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                      />
                      <p className="text-xs text-sky-900">Homens: n. idade. Mulheres: n. idade - 10.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {pneumoniaPsiSections.map((section) => (
                      <div key={section.title} className={clsx('rounded-xl border p-4', section.tone)}>
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-800">{section.title}</h5>
                        <div className="space-y-1.5">
                          {section.items.map((item) => {
                            const checked = pneumoniaPsiValues[item.key] === true
                            return (
                              <label key={item.key} className={clsx(
                                'flex cursor-pointer items-start justify-between gap-3 rounded-lg p-2 text-sm transition-colors',
                                checked ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/70'
                              )}>
                                <span className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => setPneumoniaPsiValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                  />
                                  <span className={checked ? 'font-medium text-slate-950' : 'text-slate-700'}>{item.label}</span>
                                </span>
                                <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">{item.points}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(pneumoniaPsiResult.nextStep, pneumoniaPsiResult.value)}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        pneumoniaPsiResult.score < 71 ? 'bg-emerald-600 hover:bg-emerald-700' :
                          pneumoniaPsiResult.score <= 130 ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-red-600 hover:bg-red-700'
                      )}
                    >
                      Aplicar PSI e definir destino
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaCurbStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">Calculadora CURB-65</h4>
                      <p className="text-sm text-slate-600">Use quando o PSI não puder ser aplicado.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      pneumoniaCurbResult.score <= 1 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                        pneumoniaCurbResult.score === 2 ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                          'border-red-200 bg-red-50 text-red-800'
                    )}>
                      CURB-65 {pneumoniaCurbResult.score}
                      <div className="text-xs font-semibold">{pneumoniaCurbResult.disposition}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="space-y-1.5">
                      {pneumoniaCurbItems.map((item) => {
                        const checked = pneumoniaCurbValues[item.key]
                        return (
                          <label key={item.key} className={clsx(
                            'flex cursor-pointer items-start gap-2 rounded-lg p-2 transition-colors',
                            checked ? 'bg-white shadow-sm ring-1 ring-blue-300' : 'hover:bg-white/70'
                          )}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => setPneumoniaCurbValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={clsx('text-sm', checked ? 'font-medium text-blue-950' : 'text-slate-700')}>{item.label}</span>
                            <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">+1</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(pneumoniaCurbResult.nextStep, pneumoniaCurbResult.value)}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        pneumoniaCurbResult.score <= 1 ? 'bg-emerald-600 hover:bg-emerald-700' :
                          pneumoniaCurbResult.score === 2 ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-red-600 hover:bg-red-700'
                      )}
                    >
                      Aplicar CURB-65 e definir destino
                    </motion.button>
                  </div>
                </div>
              )}

              {isAnaphylaxisCriteriaStep && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 space-y-2">
                    <h4 className="text-base font-extrabold text-red-950">Marque os critérios presentes</h4>
                    <p className="text-sm leading-relaxed text-slate-700">
                      A presença de <strong>qualquer um dos três critérios</strong> abaixo já define anafilaxia provável e deve levar à adrenalina IM imediata.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ANAPHYLAXIS_DIAGNOSTIC_CRITERIA.map((criterion) => {
                      const checked = selectedAnaphylaxisCriteria.includes(criterion.key)
                      return (
                        <div
                          key={criterion.key}
                          className={clsx(
                            'flex gap-3 rounded-xl border p-4 transition-colors',
                            checked ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-red-200'
                          )}
                        >
                          <label className="flex flex-1 cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAnaphylaxisCriterion(criterion.key)}
                              className="mt-1 h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <span>
                              <span className={clsx('block text-sm font-bold', checked ? 'text-red-950' : 'text-slate-900')}>
                                {criterion.label}
                              </span>
                              <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                                {criterion.detail}
                              </span>
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setAnaphylaxisCriteriaInfo(criterion.info)}
                            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 transition-colors hover:bg-blue-50"
                            title="Ver imagem de referência"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <motion.button
                      type="button"
                      onClick={() => openAnaphylaxisEmergencyAllocation('ana_adrenalina_im', 'anafilaxia')}
                      disabled={selectedAnaphylaxisCriteria.length === 0}
                      className={clsx(
                        'rounded-xl px-5 py-3 text-left font-semibold transition-colors',
                        selectedAnaphylaxisCriteria.length > 0
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'cursor-not-allowed bg-slate-200 text-slate-500'
                      )}
                      whileHover={selectedAnaphylaxisCriteria.length > 0 ? { scale: 1.01 } : {}}
                      whileTap={selectedAnaphylaxisCriteria.length > 0 ? { scale: 0.99 } : {}}
                    >
                      Anafilaxia provável: iniciar adrenalina IM
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleAnswer('ana_sem_criterios_observar', 'sem_criterios')}
                      disabled={selectedAnaphylaxisCriteria.length > 0}
                      className={clsx(
                        'rounded-xl border px-5 py-3 text-left font-semibold transition-colors',
                        selectedAnaphylaxisCriteria.length > 0
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                      whileHover={selectedAnaphylaxisCriteria.length === 0 ? { scale: 1.01 } : {}}
                      whileTap={selectedAnaphylaxisCriteria.length === 0 ? { scale: 0.99 } : {}}
                    >
                      Sem critérios diagnósticos no momento
                    </motion.button>
                  </div>
                </div>
              )}

              {isAnaphylaxisAdrenalineStep && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-red-900">Dose de adrenalina IM</h4>
                      <p className="text-sm text-red-900">Apresentação 1:1000 = 1 mg/mL. Aplicar IM no vasto lateral da coxa.</p>
                    </div>
                    <div className="rounded-xl border border-red-300 bg-white px-4 py-3 text-red-900">
                      <div className="text-xs font-bold uppercase tracking-wide">{anaphylaxisAdrenalineDose.label}</div>
                      <div className="text-2xl font-extrabold">{anaphylaxisAdrenalineDose.doseMg} mg</div>
                      <div className="text-sm font-semibold">{anaphylaxisAdrenalineDose.volumeMl} mL de 1 mg/mL</div>
                    </div>
                  </div>
                  <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h5 className="text-sm font-extrabold uppercase tracking-wide text-red-900">Prescrição sugerida</h5>
                      <p className="text-sm text-slate-700">Abra o texto rápido para copiar a prescrição da adrenalina IM.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnaphylaxisAdrenalinePrescriptionOpen((prev) => !prev)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      <Clipboard className="h-4 w-4" />
                      Prescrição sugerida
                    </button>
                  </div>
                  {anaphylaxisAdrenalinePrescriptionOpen && (
                    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <p className="text-base font-semibold leading-relaxed text-slate-900">
                          {getAnaphylaxisAdrenalinePrescriptionText()}
                        </p>
                        <button
                          type="button"
                          onClick={copyAnaphylaxisAdrenalinePrescriptionText}
                          className={clsx(
                            'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                            anaphylaxisAdrenalinePrescriptionCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          )}
                        >
                          {anaphylaxisAdrenalinePrescriptionCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                          {anaphylaxisAdrenalinePrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-950">
                      <h5 className="mb-2 font-extrabold uppercase tracking-wide">Regra utilizada</h5>
                      <p>{anaphylaxisAdrenalineDose.rule}</p>
                      <p className="mt-2">Repetir até 3 doses a cada 5-15 minutos se resposta insuficiente.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                      <h5 className="mb-2 font-extrabold uppercase tracking-wide">ABCDE primário</h5>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>A: verificar obstrução de via aérea, estridor e edema laríngeo.</li>
                        <li>B: checar SaO2; se &lt; 94%, ofertar oxigênio suplementar.</li>
                        <li>C: monitorar pressão arterial, perfusão e necessidade de fluidos.</li>
                        <li>D: avaliar consciência, agitação ou letargia.</li>
                        <li>E: buscar urticária/angioedema, lembrando que pele pode estar ausente na hipotensão.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {isAnaphylaxisAdjunctStep && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-orange-900">Tratamento adjunto após adrenalina</h4>
                      <p className="text-sm text-orange-900">Selecione as manifestações presentes. A reavaliação deve ocorrer em 5-10 minutos.</p>
                    </div>
                    <span className="rounded-lg border border-orange-200 bg-white px-2 py-1 text-xs font-semibold text-orange-800">
                      {selectedAnaphylaxisAdjuncts.length} selecionado(s)
                    </span>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    {anaphylaxisAdjunctOrder.map((key) => {
                      const card = ANAPHYLAXIS_ADJUNCT_CARDS[key]
                      const checked = selectedAnaphylaxisAdjuncts.includes(key)
                      const tone = card.color === 'red'
                        ? 'border-red-200 bg-red-50 text-red-950'
                        : card.color === 'orange'
                          ? 'border-orange-200 bg-orange-50 text-orange-950'
                          : card.color === 'yellow'
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-950'
                            : card.color === 'green'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                              : 'border-blue-200 bg-blue-50 text-blue-950'
                      return (
                        <label key={key} className={clsx(
                          'cursor-pointer rounded-xl border p-4 transition-all',
                          checked ? `${tone} shadow-sm ring-2 ring-white` : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200'
                        )}>
                          <div className="mb-2 flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedAnaphylaxisAdjuncts(prev => prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key])
                                setAnaphylaxisAdjunctPrescriptionPreview(null)
                                setAnaphylaxisAdjunctPrescriptionCopied(false)
                              }}
                              className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                            />
                            <div>
                              <h5 className="text-sm font-extrabold uppercase tracking-wide">{card.title}</h5>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                {card.bullets.map((bullet) => (
                                  <li key={bullet}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 rounded-xl border border-orange-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h5 className="text-sm font-extrabold uppercase tracking-wide text-orange-900">Sugestão de prescrição</h5>
                      <p className="text-sm text-slate-700">
                        A prescrição será montada conforme as manifestações selecionadas acima.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAnaphylaxisAdjunctPrescription}
                      disabled={selectedAnaphylaxisAdjuncts.length === 0}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        selectedAnaphylaxisAdjuncts.length > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'cursor-not-allowed bg-slate-200 text-slate-500'
                      )}
                    >
                      <Clipboard className="h-4 w-4" />
                      Sugestão de prescrição
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer('ana_reavaliacao_5_10', 'adjunto_aplicado')}
                      className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-orange-700"
                    >
                      Reavaliar em 5-10 minutos
                    </motion.button>
                  </div>
                </div>
              )}

              {isPancreatitisBisapStep && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-orange-900">BISAP</h4>
                      <p className="text-sm text-orange-900">Identificação precoce de paciente sob risco de pancreatite grave nas primeiras 24h.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      pancreatitisBisapResult.highRisk ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-white text-amber-800'
                    )}>
                      BISAP {pancreatitisBisapResult.score}
                      <div className="text-xs font-semibold">{pancreatitisBisapResult.label}</div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {pancreatitisBisapItems.map((item) => {
                      const checked = pancreatitisBisapValues[item.key]
                      return (
                        <label key={item.key} className={clsx(
                          'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                          checked ? 'border-orange-300 bg-white text-orange-950 shadow-sm' : 'border-orange-100 bg-white/70 text-slate-700 hover:bg-white'
                        )}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setPancreatitisBisapValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span>{item.label}</span>
                          <span className="ml-auto rounded-md bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">+1</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm',
                    pancreatitisBisapResult.highRisk ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-white text-amber-900'
                  )}>
                    {pancreatitisBisapResult.note}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer('pan_marshall_atlanta', 'bisap_aplicado')}
                      className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-orange-700"
                    >
                      Seguir para Marshall / Atlanta
                    </motion.button>
                  </div>
                </div>
              )}

              {isPancreatitisMarshallStep && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/50 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-red-900">Marshall Modificado / Atlanta 2012</h4>
                      <p className="text-sm text-red-900">Marshall &gt;= 2 define falência orgânica. A duração da disfunção define moderada vs grave.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      pancreatitisMarshallResult.severity === 'grave' ? 'border-red-300 bg-red-100 text-red-900' :
                        pancreatitisMarshallResult.severity === 'moderada' ? 'border-orange-200 bg-orange-50 text-orange-900' :
                          'border-yellow-200 bg-white text-yellow-900'
                    )}>
                      {pancreatitisMarshallResult.title}
                      <div className="text-xs font-semibold">Marshall máximo: {pancreatitisMarshallResult.maxScore}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {pancreatitisMarshallSystems.map((system) => (
                      <div key={system.key} className="rounded-xl border border-slate-200 bg-white p-4">
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-800">{system.title}</h5>
                        <div className="space-y-2">
                          {system.options.map((label, score) => (
                            <label key={label} className={clsx(
                              'flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm',
                              pancreatitisMarshallValues[system.key] === score ? 'border-red-200 bg-red-50 text-red-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                            )}>
                              <input
                                type="radio"
                                name={`marshall-${system.key}`}
                                checked={pancreatitisMarshallValues[system.key] === score}
                                onChange={() => setPancreatitisMarshallValues(prev => ({ ...prev, [system.key]: score }))}
                                className="h-4 w-4 border-red-300 text-red-600 focus:ring-red-500"
                              />
                              <span>{label}</span>
                              <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700">{score}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-orange-200 bg-white p-3 text-sm text-orange-950">
                      <input
                        type="checkbox"
                        checked={pancreatitisMarshallValues.transientOrganFailure}
                        onChange={(e) => setPancreatitisMarshallValues(prev => ({ ...prev, transientOrganFailure: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>Disfunção orgânica transitória (até 48h) presente</span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-950">
                      <input
                        type="checkbox"
                        checked={pancreatitisMarshallValues.persistentOrganFailure}
                        onChange={(e) => setPancreatitisMarshallValues(prev => ({ ...prev, persistentOrganFailure: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Disfunção orgânica sustentada por mais de 48h</span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-amber-200 bg-white p-3 text-sm text-amber-950 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={pancreatitisMarshallValues.localOrSystemicComplication}
                        onChange={(e) => setPancreatitisMarshallValues(prev => ({ ...prev, localOrSystemicComplication: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Complicações locais ou sistêmicas presentes</span>
                    </label>
                  </div>

                  <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h5 className="text-xs font-bold uppercase tracking-wide text-red-900">Critérios para UTI</h5>
                      <span className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">
                        {pancreatitisIcuCriteria.length} marcado(s)
                      </span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {PANCREATITIS_ICU_CRITERIA.map((item) => {
                        const checked = pancreatitisIcuCriteria.includes(item)
                        return (
                          <label key={item} className={clsx(
                            'flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm',
                            checked ? 'border-red-200 bg-red-50 text-red-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                          )}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelection(setPancreatitisIcuCriteria, item)}
                              className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                            />
                            <span>{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const target = pancreatitisIcuCriteria.length > 0 ? 'pan_uti' : pancreatitisMarshallResult.nextStep
                        const value = pancreatitisIcuCriteria.length > 0 ? 'uti' : pancreatitisMarshallResult.value
                        handleAnswer(target, value)
                      }}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        pancreatitisIcuCriteria.length > 0 || pancreatitisMarshallResult.severity === 'grave'
                          ? 'bg-red-600 hover:bg-red-700'
                          : pancreatitisMarshallResult.severity === 'moderada'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                      )}
                    >
                      Aplicar classificação
                    </motion.button>
                  </div>
                </div>
              )}

              {isCholangitisDiagnosisStep && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-900">Tokyo 2018 - Diagnóstico</h4>
                      <p className="text-sm text-emerald-900">Caso suspeito = A + B ou C. Caso confirmado = A + B + C.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      cholangitisDiagnosisResult.status === 'confirmado' ? 'border-emerald-300 bg-emerald-100 text-emerald-900' :
                        cholangitisDiagnosisResult.status === 'suspeito' ? 'border-amber-200 bg-white text-amber-900' :
                          'border-slate-200 bg-white text-slate-700'
                    )}>
                      {cholangitisDiagnosisResult.label}
                      <div className="text-xs font-semibold">
                        A {cholangitisDiagnosisResult.hasA ? 'sim' : 'não'} / B {cholangitisDiagnosisResult.hasB ? 'sim' : 'não'} / C {cholangitisDiagnosisResult.hasC ? 'sim' : 'não'}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    {(['A', 'B', 'C'] as const).map((group) => (
                      <div key={group} className="rounded-xl border border-emerald-100 bg-white p-4">
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-900">
                          {group === 'A' ? 'A - Inflamação sistêmica' : group === 'B' ? 'B - Colestase' : 'C - Imagem'}
                        </h5>
                        <div className="space-y-2">
                          {CHOLANGITIS_DIAGNOSIS_ITEMS.filter(item => item.group === group).map((item) => {
                            const checked = cholangitisDiagnosisValues[item.key]
                            return (
                              <label key={item.key} className={clsx(
                                'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                                checked ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                              )}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => setCholangitisDiagnosisValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                  className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{item.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm',
                    cholangitisDiagnosisResult.status === 'insuficiente' ? 'border-slate-200 bg-white text-slate-800' : 'border-emerald-200 bg-white text-emerald-900'
                  )}>
                    {cholangitisDiagnosisResult.note}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (cholangitisDiagnosisResult.status === 'insuficiente') {
                          handleAnswer('colangite_sem_criterios', 'criterios_insuficientes')
                          return
                        }
                        handleAnswer('colangite_tokyo_gravidade', cholangitisDiagnosisResult.status)
                      }}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        cholangitisDiagnosisResult.status === 'insuficiente'
                          ? 'bg-slate-600 hover:bg-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      {cholangitisDiagnosisResult.status === 'insuficiente' ? 'Encerrar e reavaliar' : 'Classificar gravidade'}
                    </motion.button>
                  </div>
                </div>
              )}

              {isCholangitisSeverityStep && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-amber-900">Tokyo 2018 - Gravidade</h4>
                      <p className="text-sm text-amber-900">Marque critérios moderados e sinais de disfunção orgânica.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      cholangitisSeverityResult.severity === 'grave' ? 'border-red-300 bg-red-100 text-red-900' :
                        cholangitisSeverityResult.severity === 'moderada' ? 'border-amber-300 bg-white text-amber-900' :
                          'border-emerald-200 bg-white text-emerald-900'
                    )}>
                      {cholangitisSeverityResult.title}
                      <div className="text-xs font-semibold">{cholangitisSeverityResult.tokyo}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-amber-200 bg-white p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-900">Critérios para Tokyo II</h5>
                      <div className="space-y-2">
                        {CHOLANGITIS_MODERATE_CRITERIA.map((item) => {
                          const checked = cholangitisSeverityValues[item.key]
                          return (
                            <label key={item.key} className={clsx(
                              'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                              checked ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                            )}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setCholangitisSeverityValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-white p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-red-900">Critérios para Tokyo III</h5>
                      <div className="space-y-2">
                        {CHOLANGITIS_SEVERE_CRITERIA.map((item) => {
                          const checked = cholangitisSeverityValues[item.key]
                          return (
                            <label key={item.key} className={clsx(
                              'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                              checked ? 'border-red-300 bg-red-50 text-red-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                            )}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setCholangitisSeverityValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm',
                    cholangitisSeverityResult.severity === 'grave' ? 'border-red-200 bg-red-50 text-red-900' :
                      cholangitisSeverityResult.severity === 'moderada' ? 'border-amber-200 bg-white text-amber-900' :
                        'border-emerald-200 bg-white text-emerald-900'
                  )}>
                    {cholangitisSeverityResult.note}
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-800">Opções de antibiótico por gravidade</h5>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {getCholangitisAntibioticOptions(cholangitisSeverityResult.severity).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(cholangitisSeverityResult.nextStep, cholangitisSeverityResult.value)}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        cholangitisSeverityResult.severity === 'grave'
                          ? 'bg-red-600 hover:bg-red-700'
                          : cholangitisSeverityResult.severity === 'moderada'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      Aplicar classificação
                    </motion.button>
                  </div>
                </div>
              )}

              {isCholecystitisSeverityStep && (
                <div className="mb-6 rounded-2xl border border-lime-200 bg-lime-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-lime-900">Tokyo 2018 - Gravidade</h4>
                      <p className="text-sm text-lime-900">Marque critérios moderados e sinais de disfunção orgânica.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      cholecystitisSeverityResult.severity === 'grave' ? 'border-red-300 bg-red-100 text-red-900' :
                        cholecystitisSeverityResult.severity === 'moderada' ? 'border-amber-300 bg-white text-amber-900' :
                          'border-lime-200 bg-white text-lime-900'
                    )}>
                      {cholecystitisSeverityResult.title}
                      <div className="text-xs font-semibold">{cholecystitisSeverityResult.tokyo}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-amber-200 bg-white p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-900">Critérios para Tokyo II</h5>
                      <div className="space-y-2">
                        {CHOLECYSTITIS_MODERATE_CRITERIA.map((item) => {
                          const checked = cholecystitisSeverityValues[item.key]
                          return (
                            <label key={item.key} className={clsx(
                              'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                              checked ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                            )}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setCholecystitisSeverityValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-white p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-red-900">Critérios para Tokyo III</h5>
                      <div className="space-y-2">
                        {CHOLECYSTITIS_SEVERE_CRITERIA.map((item) => {
                          const checked = cholecystitisSeverityValues[item.key]
                          return (
                            <label key={item.key} className={clsx(
                              'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                              checked ? 'border-red-300 bg-red-50 text-red-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                            )}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setCholecystitisSeverityValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                              />
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm',
                    cholecystitisSeverityResult.severity === 'grave' ? 'border-red-200 bg-red-50 text-red-900' :
                      cholecystitisSeverityResult.severity === 'moderada' ? 'border-amber-200 bg-white text-amber-900' :
                        'border-lime-200 bg-white text-lime-900'
                  )}>
                    {cholecystitisSeverityResult.note}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(cholecystitisSeverityResult.nextStep, cholecystitisSeverityResult.value)}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        cholecystitisSeverityResult.severity === 'grave'
                          ? 'bg-red-600 hover:bg-red-700'
                          : cholecystitisSeverityResult.severity === 'moderada'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-lime-600 hover:bg-lime-700'
                      )}
                    >
                      Aplicar classificação
                    </motion.button>
                  </div>
                </div>
              )}

              {isAppendicitisAlvaradoStep && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-rose-900">Escore de Alvarado</h4>
                      <p className="text-sm text-rose-900">Baixo risco 0-3, risco moderado 4-6, alto risco 7-10 pontos.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      appendicitisAlvaradoResult.risk === 'alto' ? 'border-red-300 bg-red-100 text-red-900' :
                        appendicitisAlvaradoResult.risk === 'moderado' ? 'border-amber-300 bg-white text-amber-900' :
                          'border-emerald-200 bg-white text-emerald-900'
                    )}>
                      Alvarado {appendicitisAlvaradoResult.score}
                      <div className="text-xs font-semibold">{appendicitisAlvaradoResult.title}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {(['Sintomas', 'Sinais', 'Laboratório'] as const).map((group) => (
                      <div key={group} className="rounded-xl border border-rose-100 bg-white p-4">
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-rose-900">{group}</h5>
                        <div className="space-y-2">
                          {APPENDICITIS_ALVARADO_ITEMS.filter(item => item.group === group).map((item) => {
                            const checked = appendicitisAlvaradoValues[item.key]
                            return (
                              <label key={item.key} className={clsx(
                                'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                                checked ? 'border-rose-300 bg-rose-50 text-rose-950 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                              )}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => setAppendicitisAlvaradoValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                  className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                                />
                                <span>{item.label}</span>
                                <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-bold text-rose-800">+{item.points}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm',
                    appendicitisAlvaradoResult.risk === 'alto' ? 'border-red-200 bg-red-50 text-red-900' :
                      appendicitisAlvaradoResult.risk === 'moderado' ? 'border-amber-200 bg-white text-amber-900' :
                        'border-emerald-200 bg-white text-emerald-900'
                  )}>
                    {appendicitisAlvaradoResult.note}
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-800">Imagem e observações</h5>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      <li>Preferir TC de abdome e pelve com contraste quando disponível, especialmente para detectar apendicite complicada e diagnósticos diferenciais.</li>
                      <li>USG de abdome é opção em gestantes e crianças; USG normal não exclui o diagnóstico se suspeita clínica persistir.</li>
                      <li>Em mulheres em idade reprodutiva, beta-hCG é obrigatório para diferencial e escolha de imagem.</li>
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(appendicitisAlvaradoResult.nextStep, appendicitisAlvaradoResult.value)}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        appendicitisAlvaradoResult.risk === 'alto'
                          ? 'bg-red-600 hover:bg-red-700'
                          : appendicitisAlvaradoResult.risk === 'moderado'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      Aplicar escore
                    </motion.button>
                  </div>
                </div>
              )}

              {isLombalgiaRiskStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">Sinais de Alarme na Lombalgia</h4>
                      <p className="text-sm text-slate-700">Marque os achados presentes para definir imagem, internação ou tratamento conservador.</p>
                    </div>
                    <div className={clsx(
                      'rounded-xl border px-4 py-3 text-sm font-bold',
                      lombalgiaDispositionResult.category === 'cauda' ? 'border-red-300 bg-red-100 text-red-900' :
                        lombalgiaDispositionResult.category === 'fratura' ? 'border-yellow-300 bg-yellow-50 text-yellow-900' :
                          lombalgiaDispositionResult.category === 'conservador' ? 'border-emerald-200 bg-white text-emerald-900' :
                            'border-amber-200 bg-white text-amber-900'
                    )}>
                      {lombalgiaDispositionResult.title}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {[
                      { key: 'cauda' as const, title: 'Síndrome da cauda equina', tone: 'red' },
                      { key: 'neoplasia' as const, title: 'Câncer / neoplasia', tone: 'amber' },
                      { key: 'infeccao' as const, title: 'Infecção espinhal', tone: 'orange' },
                      { key: 'fratura' as const, title: 'Fratura vertebral', tone: 'yellow' }
                    ].map((group) => (
                      <div key={group.key} className={clsx(
                        'rounded-xl border bg-white p-4',
                        group.tone === 'red' ? 'border-red-200' :
                          group.tone === 'amber' ? 'border-amber-200' :
                            group.tone === 'orange' ? 'border-orange-200' : 'border-yellow-200'
                      )}>
                        <h5 className={clsx(
                          'mb-3 text-xs font-bold uppercase tracking-wide',
                          group.tone === 'red' ? 'text-red-900' :
                            group.tone === 'amber' ? 'text-amber-900' :
                              group.tone === 'orange' ? 'text-orange-900' : 'text-yellow-900'
                        )}>
                          {group.title}
                        </h5>
                        <div className="space-y-2">
                          {LOMBALGIA_RISK_ITEMS.filter(item => item.group === group.key).map((item) => {
                            const checked = lombalgiaRiskValues[item.key]
                            return (
                              <label key={item.key} className={clsx(
                                'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                                checked ? (
                                  group.tone === 'red' ? 'border-red-300 bg-red-50 text-red-950' :
                                    group.tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-950' :
                                      group.tone === 'orange' ? 'border-orange-300 bg-orange-50 text-orange-950' :
                                        'border-yellow-300 bg-yellow-50 text-yellow-950'
                                ) : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                              )}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => setLombalgiaRiskValues(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                                />
                                <span>{item.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm',
                    lombalgiaDispositionResult.category === 'cauda' ? 'border-red-200 bg-red-50 text-red-900' :
                      lombalgiaDispositionResult.category === 'conservador' ? 'border-emerald-200 bg-white text-emerald-900' :
                        'border-amber-200 bg-white text-amber-900'
                  )}>
                    {lombalgiaDispositionResult.note}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(lombalgiaDispositionResult.nextStep, lombalgiaDispositionResult.value)}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        lombalgiaDispositionResult.category === 'cauda'
                          ? 'bg-red-600 hover:bg-red-700'
                          : lombalgiaDispositionResult.category === 'conservador'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-amber-600 hover:bg-amber-700'
                      )}
                    >
                      Aplicar conduta
                    </motion.button>
                  </div>
                </div>
              )}

              {isInfluenzaRiskStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                      Fatores de risco e piora clínica
                    </h4>
                    <span className={clsx(
                      'rounded-lg px-2 py-1 text-xs font-semibold border',
                      influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    )}>
                      {influenzaRiskFactors.length + influenzaWorseningSigns.length} marcado(s)
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-sky-900">Fatores de risco</h5>
                      <div className="space-y-1.5">
                        {INFLUENZA_RISK_FACTORS.map((item) => {
                          const checked = influenzaRiskFactors.includes(item)
                          return (
                            <label
                              key={item}
                              className={clsx(
                                'flex items-start gap-2 rounded-lg p-2 transition-colors cursor-pointer',
                                checked ? 'bg-white shadow-sm ring-1 ring-sky-300' : 'hover:bg-white/70'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setInfluenzaRiskFactors, item)}
                                className="mt-1 h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                              />
                              <span className={clsx('text-sm', checked ? 'font-medium text-sky-950' : 'text-slate-700')}>{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-violet-900">Sinais de piora clínica</h5>
                      <div className="space-y-1.5">
                        {INFLUENZA_WORSENING_SIGNS.map((item) => {
                          const checked = influenzaWorseningSigns.includes(item)
                          return (
                            <label
                              key={item}
                              className={clsx(
                                'flex items-start gap-2 rounded-lg p-2 transition-colors cursor-pointer',
                                checked ? 'bg-white shadow-sm ring-1 ring-violet-300' : 'hover:bg-white/70'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setInfluenzaWorseningSigns, item)}
                                className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                              />
                              <span className={clsx('text-sm', checked ? 'font-medium text-violet-950' : 'text-slate-700')}>{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-4 text-sm',
                    influenzaWorseningSuggestsSRAG
                      ? 'border-red-200 bg-red-50 text-red-900'
                      : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  )}>
                    {influenzaWorseningSuggestsSRAG
                      ? 'Há sinal de piora com potencial de gravidade: reavaliar como possível SRAG antes de decidir alta ambulatorial.'
                      : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                      ? 'Há indicação de oseltamivir em manejo ambulatorial, com retorno precoce e vigilância mais estreita.'
                      : 'Sem fator de risco ou piora clínica registrados: seguir com manejo sintomático ambulatorial.'}
                  </div>

                  {influenzaWorseningSuggestsSRAG ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-950">
                      <h5 className="font-bold text-red-950">Antes da alta, reclassificar gravidade</h5>
                      <p className="mt-2">
                        Alteração do estado mental ou desidratação relevante pode representar deterioração sistêmica. O fluxo deve voltar para SRAG para decidir internação, enfermaria ou UTI conforme sinais clínicos.
                      </p>
                    </div>
                  ) : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0 ? (
                    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-sky-950">
                      <h5 className="font-bold text-sky-950">Quando pedir exame de imagem?</h5>
                      <p className="mt-2">
                        Não é necessário solicitar radiografia de rotina para toda síndrome gripal. Solicite radiografia de tórax quando houver suspeita de acometimento pulmonar ou complicação, como dispneia, taquipneia, saturação &lt;95%, dor torácica, ausculta pulmonar alterada, febre persistente por vários dias, piora clínica após melhora inicial ou imunossupressão com sintomas respiratórios mais intensos.
                      </p>
                      <p className="mt-2">
                        Considere tomografia quando o RX for inconclusivo com forte suspeita clínica, houver hipoxemia desproporcional ao RX, suspeita de complicações, imunossupressão, caso grave/internado ou suspeita de tromboembolismo pulmonar.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(
                        influenzaWorseningSuggestsSRAG
                          ? 'influenza_sinais_gravidade'
                          : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                          ? 'influenza_ambulatorial_oseltamivir'
                          : 'influenza_ambulatorial_sintomaticos',
                        influenzaWorseningSuggestsSRAG
                          ? 'reavaliar_srag_por_piora'
                          : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                          ? 'ambulatorial_oseltamivir'
                          : 'ambulatorial_sintomaticos'
                      )}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        influenzaWorseningSuggestsSRAG
                          ? 'bg-red-600 hover:bg-red-700'
                          : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      {influenzaWorseningSuggestsSRAG
                        ? 'Reavaliar como possível SRAG'
                        : influenzaRiskFactors.length > 0 || influenzaWorseningSigns.length > 0
                        ? 'Indicar oseltamivir ambulatorial'
                        : 'Seguir com tratamento sintomático'}
                    </motion.button>
                  </div>
                </div>
              )}

              {isInfluenzaICUStep && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                      Critérios de UTI
                    </h4>
                    <span className={clsx(
                      'rounded-lg px-2 py-1 text-xs font-semibold border',
                      influenzaICUCriteria.length > 0
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-orange-200 bg-orange-50 text-orange-700'
                    )}>
                      {influenzaICUCriteria.length} marcado(s)
                    </span>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4">
                    <p className="mb-3 text-xs font-semibold text-rose-900">
                      Marque os critérios presentes para definir necessidade de unidade intensiva.
                    </p>
                    <div className="space-y-1.5">
                      {INFLUENZA_ICU_CRITERIA.map((item) => {
                        const checked = influenzaICUCriteria.includes(item)
                        return (
                          <div
                            key={item}
                            className={clsx(
                              'flex items-start justify-between gap-3 rounded-lg p-2 transition-colors',
                              checked ? 'bg-white shadow-sm ring-1 ring-rose-300' : 'hover:bg-white/70'
                            )}
                          >
                            <label className="flex flex-1 cursor-pointer items-start gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelection(setInfluenzaICUCriteria, item)}
                                className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                              />
                              <span className={clsx('text-sm', checked ? 'font-medium text-rose-950' : 'text-slate-700')}>{item}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setInfluenzaICUInfoOpen(item)}
                              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-700 shadow-sm transition-colors hover:bg-rose-50"
                              title={`Ver explicação sobre ${item}`}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className={clsx(
                    'mt-4 rounded-xl border p-4 text-sm',
                    influenzaICUCriteria.length > 0 ? 'border-red-200 bg-red-50 text-red-900' : 'border-orange-200 bg-orange-50 text-orange-900'
                  )}>
                    {influenzaICUCriteria.length > 0
                      ? 'Critério(s) de UTI presentes: priorizar internação em unidade intensiva.'
                      : 'Sem critério imediato de UTI marcado: seguir com internação em enfermaria, mantendo reavaliação clínica.'}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(
                        influenzaICUCriteria.length > 0 ? 'influenza_painel_viral_uti' : 'influenza_painel_viral_enfermaria',
                        influenzaICUCriteria.length > 0 ? 'uti' : 'enfermaria'
                      )}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 font-semibold text-white transition-colors',
                        influenzaICUCriteria.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                      )}
                    >
                      {influenzaICUCriteria.length > 0 ? 'Indicar UTI' : 'Indicar enfermaria'}
                    </motion.button>
                  </div>
                </div>
              )}

              {isPneumoniaAmbulatoryPrescriptionStep && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-900">Antibioticoterapia Ambulatorial</h4>
                      <p className="text-sm text-emerald-900">Marque comorbidades, fatores de risco ou uso de antibiótico nos últimos 3 meses para ajustar o esquema.</p>
                    </div>
                    <span className={clsx(
                      'rounded-lg border px-2 py-1 text-xs font-semibold',
                      hasPneumoniaComorbidityOrRecentAtb ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-white text-emerald-700'
                    )}>
                      {hasPneumoniaComorbidityOrRecentAtb ? 'Beta-lactâmico + macrolídeo' : 'Previamente hígido'}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {PNEUMONIA_COMORBIDITIES_FOR_AMBULATORY_ATB.map((item) => {
                      const checked = pneumoniaComorbidities.includes(item)
                      return (
                        <label key={item} className={clsx(
                          'flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm',
                          checked ? 'border-amber-200 bg-white text-amber-950 shadow-sm' : 'border-emerald-100 bg-white/70 text-slate-700 hover:bg-white'
                        )}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelection(setPneumoniaComorbidities, item)}
                            className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span>{item}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-200 bg-white p-4 text-sm text-emerald-950">
                      <p className="font-bold">Sem comorbidades / sem antibiótico recente</p>
                      <p className="mt-1">Amoxicilina 1 g VO de 8/8h por 7 dias, conforme perfil clínico e protocolo local.</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-white p-4 text-sm text-amber-950">
                      <p className="font-bold">Com comorbidades ou antibiótico recente</p>
                      <p className="mt-1">Amoxicilina + clavulanato 875/125 mg VO 12/12h por 7 dias + azitromicina 500 mg VO 1x/dia por 5 dias, ajustando a alergias e função renal.</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-900">
                    <p className="font-bold">Orientações de retorno</p>
                    <p className="mt-1">Retornar imediatamente em piora da dispneia, queda de saturação, confusão, hipotensão, febre persistente, vômitos/intolerância oral, prostração importante, dor torácica, cianose, síncope ou ausência de melhora clínica. Reavaliar em 48 a 72 horas ou antes se piora.</p>
                  </div>
                  {isPneumoniaAmbulatoryConductStep && (
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleOpenPneumoniaPrescription}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                          pneumoniaPrescriptionGenerated || hasPneumoniaPrescriptionSet(getPersistedPneumoniaPrescriptions(), hasPneumoniaComorbidityOrRecentAtb)
                            ? 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        )}
                      >
                        {pneumoniaPrescriptionGenerated || hasPneumoniaPrescriptionSet(getPersistedPneumoniaPrescriptions(), hasPneumoniaComorbidityOrRecentAtb) ? 'Prescrição' : 'Gerar prescrição'}
                      </button>
                      <motion.button
                        type="button"
                        onClick={() => handleAnswer('pac_destino_ambulatorial', 'conduta_ambulatorial_definida')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Finalizar manejo ambulatorial
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {flowchart.id === 'pneumonia' && ['pac_psi_intermediario', 'pac_psi_alto', 'pac_curb_intermediario', 'pac_curb_alto', 'pac_estabilizacao_seguir_sepse', 'pac_internacao_limitacao'].includes(currentStepData.id) && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-rose-900">Risco de MRSA/Pseudomonas ou germe resistente</h4>
                      <p className="text-sm text-rose-900">Use fatores ATS/IDSA como base e DRIP como ferramenta complementar para decidir ampliação de cobertura.</p>
                    </div>
                    <span className={clsx(
                      'rounded-lg border px-2 py-1 text-xs font-semibold',
                      pneumoniaPseudomonasRisk.length > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700'
                    )}>
                      {pneumoniaPseudomonasRisk.length > 0 ? 'Com risco' : 'Sem risco marcado'}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {PNEUMONIA_PSEUDOMONAS_RISK_FACTORS.map((item) => {
                      const checked = pneumoniaPseudomonasRisk.includes(item)
                      return (
                        <label key={item} className={clsx(
                          'flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm',
                          checked ? 'border-red-200 bg-white text-red-950 shadow-sm' : 'border-rose-100 bg-white/70 text-slate-700 hover:bg-white'
                        )}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelection(setPneumoniaPseudomonasRisk, item)}
                            className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                          />
                          <span>{item}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className={clsx(
                    'mt-4 rounded-xl border p-3 text-sm leading-relaxed',
                    pneumoniaPseudomonasRisk.length > 0 ? 'border-red-200 bg-white text-red-900' : 'border-slate-200 bg-white text-slate-700'
                  )}>
                    {pneumoniaPseudomonasRisk.length > 0 ? (
                      <div className="space-y-2">
                        <p><strong>DRIP/risco resistente:</strong> se a soma dos fatores sugerir DRIP ≥4 ou houver fatores fortes para MRSA/Pseudomonas, avaliar ampliação de cobertura conforme protocolo institucional, culturas e epidemiologia local.</p>
                        <p><strong>Esquema sugerido para risco de Pseudomonas:</strong> piperacilina-tazobactam + macrolídeo ou levofloxacino, conforme perfil clínico e protocolo local.</p>
                        <p><strong>Piperacilina-tazobactam na pneumonia grave:</strong> ClCr &gt;40 mL/min: 4,5 g EV 6/6h; ClCr 20-40 mL/min: 3,375 g EV 6/6h; ClCr &lt;20 mL/min: 2,25 g EV 6/6h; hemodiálise: 2,25 g EV 8/8h + 0,75 g pós-HD.</p>
                        <p><strong>Associação:</strong> azitromicina 500 mg 1x/dia por 5 dias, claritromicina 500 mg 12/12h ou levofloxacino conforme avaliação médica.</p>
                        <p><strong>MRSA:</strong> quando houver risco específico ou cultura prévia, considerar cobertura anti-MRSA conforme protocolo local.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p><strong>Esquema sugerido sem risco de Pseudomonas:</strong> ceftriaxona associada a azitromicina ou claritromicina.</p>
                        <p><strong>Ceftriaxona:</strong> casos leves: 1 g EV/IM 1x/dia. Casos moderados em diante: 1 g 12/12h ou 2 g 1x/dia; a literatura não evidencia superioridade clara de um esquema sobre o outro.</p>
                        <p><strong>Macrolídeo:</strong> azitromicina 500 mg 1x/dia por 5 dias ou claritromicina 500 mg 12/12h. Azitromicina não requer ajuste de função renal. Claritromicina requer ajuste: se ClCr &lt;30 mL/min, usar 50% da dose, ou seja, 250 mg 12/12h.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isTVPClinicalEvaluation && (
                <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200">
                  {tvpSelectedLegLabel && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
                      Membro selecionado: {tvpSelectedLegLabel}
                    </div>
                  )}

                  <div className="mb-6 p-4 rounded-xl border-l-4 border-l-red-600 bg-gradient-to-r from-red-50 to-white border border-red-100 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h5 className="text-sm font-extrabold text-red-800 uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Emergência Vascular: Flegmasia Cerulea Dolens (FCD)
                      </h5>
                      <button
                        type="button"
                        onClick={() => setFlegmasiaGalleryOpen(true)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-red-300 bg-white text-red-700 hover:bg-red-100 transition-colors"
                        title="Ver imagens de referência"
                        aria-label="Ver imagens de referência da flegmasia"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-red-900 leading-relaxed font-medium">
                      É uma forma rara e gravíssima de trombose venosa profunda (TVP) ileofemoral, caracterizada por obstrução maciça do retorno venoso, resultando em edema intenso, dor extrema e cianose (coloração azulada) do membro, com alto risco de gangrena venosa, amputação e óbito (25% a 40%). É uma emergência vascular imediata.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Checklist Clínico Inicial
                    </h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                      {selectedClinicalFindings.length} marcado(s)
                    </span>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    {[
                      { title: 'Sinais e sintomas clássicos', items: tvpClassicSigns },
                      { title: 'Achados ao exame físico', items: tvpPhysicalExamFindings },
                      { title: 'Sinais de alerta (maior suspeita/gravidade)', items: tvpAlertSigns }
                    ].map((section, index) => (
                      <div key={section.title} className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-xl border border-blue-200">
                        <button
                          type="button"
                          onClick={() => toggleSection(`tvp_clinical_${index}`)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">{section.title}</h4>
                          <ChevronRight className={clsx('w-4 h-4 text-blue-700 transition-transform', isSectionOpen(`tvp_clinical_${index}`, index <= 1) ? 'rotate-90' : '')} />
                        </button>
                        {isSectionOpen(`tvp_clinical_${index}`, index <= 1) && (
                        <div className="space-y-1.5 mt-3">
                          {section.items.map((item) => {
                            const checked = selectedClinicalFindings.includes(item)
                            return (
                              <label
                                key={item}
                                className={clsx(
                                  'flex items-start gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                                  checked ? 'bg-white border border-blue-200' : 'hover:bg-white/70'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedClinicalFindings(prev => [...prev, item])
                                    } else {
                                      setSelectedClinicalFindings(prev => prev.filter(entry => entry !== item))
                                    }
                                  }}
                                />
                                <span className="text-sm text-slate-700 leading-snug flex-1">{item}</span>
                                {item.toLowerCase().includes('flegmasia') && checked && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault()
                                      event.stopPropagation()
                                      setFlegmasiaGalleryOpen(true)
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-100 transition-colors"
                                    title="Ver imagens de referência da flegmasia"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {item.toLowerCase().includes('cacifo') && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault()
                                      event.stopPropagation()
                                      setTVPCacifoImageOpen(true)
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300 bg-white text-cyan-700 transition-colors hover:bg-cyan-100"
                                    title="Ver imagem de edema com cacifo"
                                    aria-label="Ver imagem de edema com cacifo"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </label>
                            )
                          })}
                        </div>
                        )}
                      </div>
                    ))}
                    <div className="lg:col-span-2">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_clinical_other')}
                        className="w-full flex items-center justify-between text-left mb-2"
                      >
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Outros achados
                        </label>
                        <ChevronRight className={clsx('w-4 h-4 text-slate-600 transition-transform', isSectionOpen('tvp_clinical_other', true) ? 'rotate-90' : '')} />
                      </button>
                      {isSectionOpen('tvp_clinical_other', true) && (
                        <textarea
                          value={otherClinicalFinding}
                          onChange={(e) => setOtherClinicalFinding(e.target.value)}
                          className="w-full min-h-20 p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                          placeholder="Descreva outros achados clínicos relevantes"
                        />
                      )}
                    </div>
                  </div>
                  {hasTVPAlertSignSelected && (
                    <div className="mt-4 rounded-xl border-l-4 border-l-red-700 border border-red-200 bg-red-50 p-4">
                      <h5 className="text-sm font-extrabold text-red-800 uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Sinal de alerta detectado
                      </h5>
                      <p className="mt-1 text-sm text-red-900">
                        {hasTVPVascularAlertSelected ? (
                          <>
                            Sinal de <strong>urgência vascular</strong> identificado. Manter atenção para gravidade e
                            prosseguir com a estratificação diagnóstica. Após POCUS e D-dímero, o fluxo abrirá
                            obrigatoriamente o manejo de Flegmasia/ameaça ao membro.
                          </>
                        ) : hasTVPRespiratoryAlertSelected ? (
                          <>
                            Atenção para possível <strong>embolia pulmonar associada</strong>. Prosseguir com a
                            estratificação diagnóstica e manter monitorização conforme estabilidade clínica. O manejo
                            de Flegmasia/ameaça ao membro será exibido antes da continuidade assistencial.
                          </>
                        ) : (
                          <>
                            <strong>Maior suspeita/gravidade de TVP</strong>. Prosseguir para Wells, POCUS e D-dímero
                            conforme o caminho do fluxograma; em seguida, abrir obrigatoriamente o manejo de
                            Flegmasia/ameaça ao membro.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isTVPLegSelection && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-emerald-50/30 shadow-sm">
                  <div className="p-5 sm:p-6 lg:p-7">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-800">
                            <Activity className="h-3.5 w-3.5" />
                            Triagem TVP
                          </span>
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                            Etapa inicial
                          </span>
                        </div>

                        <div className="mt-4 max-w-3xl">
                          <h3 className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
                            Suspeita de trombose venosa profunda
                          </h3>
                          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                            Localize o território suspeito antes de avançar para sinais clínicos, alertas de gravidade
                            e estratificação pelo escore de Wells.
                          </p>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {[
                            { label: 'Dor ou edema unilateral', detail: 'padrão mais comum', tone: 'border-cyan-200 bg-cyan-50 text-cyan-900' },
                            { label: 'Comparação entre lados', detail: 'assimetria orienta', tone: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
                            { label: 'Sinais de alerta', detail: 'mudam prioridade', tone: 'border-amber-200 bg-amber-50 text-amber-900' }
                          ].map((item) => (
                            <div key={item.label} className={clsx('rounded-xl border p-3', item.tone)}>
                              <p className="text-xs font-extrabold">{item.label}</p>
                              <p className="mt-1 text-xs opacity-80">{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-white/90 p-4 text-amber-950 shadow-sm">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-extrabold">Atenção à gravidade</p>
                            <p className="mt-1 text-xs leading-relaxed text-amber-900">
                              Edema intenso, cianose, dor progressiva, veias superficiais tensas ou sintomas respiratórios
                              exigem mudança imediata na prioridade.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-950">
                            Definir território suspeito
                          </h4>
                          <p className="mt-1 text-sm text-slate-600">
                            Escolha o lado acometido ou marque outra localização para registrar o início da avaliação.
                          </p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Seleção obrigatória
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                          { side: 'right' as TVPLegSide, label: 'Perna Direita', helper: 'Dor, edema ou alteração no membro inferior direito.' },
                          { side: 'left' as TVPLegSide, label: 'Perna Esquerda', helper: 'Dor, edema ou alteração no membro inferior esquerdo.' }
                        ].map((item) => {
                          const selected = selectedTVPLeg === item.side
                          return (
                            <motion.button
                              key={item.side}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setSelectedTVPLeg(item.side)}
                              className={clsx(
                                'group min-w-0 overflow-hidden rounded-2xl border bg-white p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                                selected
                                  ? 'border-cyan-500 shadow-lg shadow-cyan-100'
                                  : 'border-slate-200 hover:border-cyan-300 hover:shadow-md'
                              )}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="overflow-hidden rounded-xl bg-slate-50">
                                <TVPLegIllustration side={item.side} selected={selected} />
                              </div>
                              <div className="mt-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className={clsx(
                                    'text-sm font-extrabold',
                                    selected ? 'text-cyan-800' : 'text-slate-800'
                                  )}>
                                    {item.label}
                                  </p>
                                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    {item.helper}
                                  </p>
                                </div>
                                <span className={clsx(
                                  'flex h-7 w-7 flex-none items-center justify-center rounded-full border',
                                  selected ? 'border-cyan-500 bg-cyan-600 text-white' : 'border-slate-200 bg-white text-slate-300 group-hover:text-cyan-500'
                                )}>
                                  {selected ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </span>
                              </div>
                            </motion.button>
                          )
                        })}
                        <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 text-left">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-extrabold text-slate-800">Outras localizações</p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                  A trombose venosa também pode acometer membros superiores, veias cerebrais e território abdominal.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setTVPOtherLocationsImageOpen(true)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 transition-colors hover:bg-cyan-100"
                                title="Ver imagem de outras localizações de trombose"
                                aria-label="Ver imagem de outras localizações de trombose"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                              <p className="text-xs leading-relaxed text-cyan-950">
                                Este fluxograma permanece direcionado à investigação de TVP em membros inferiores. Outras apresentações exigem avaliação específica conforme o território afetado.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTVPOtherLocationsImageOpen(true)}
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                          >
                            <Info className="h-4 w-4" />
                            Ver imagem
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-white/85 p-4">
                      <h5 className="text-sm font-extrabold text-slate-900">Mapa rápido de localizações</h5>
                      <div className="mt-3 grid gap-4 text-xs leading-relaxed text-slate-700 md:grid-cols-2">
                        <div>
                          <strong className="mb-1 block text-slate-950">Membros inferiores</strong>
                          <p>Panturrilha, região poplítea, veia femoral e veias ilíacas são os territórios centrais deste fluxo.</p>
                        </div>
                        <div>
                          <strong className="mb-1 block text-slate-950">Outras localizações</strong>
                          <p>Membros superiores, veias cerebrais e território abdominal são menos comuns e pedem investigação direcionada.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
                          <ScanLine className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-extrabold text-blue-950">POCUS vascular para TVP</h5>
                            <button
                              type="button"
                              onClick={() => setTVPPocusPointsImageOpen(true)}
                              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-white text-blue-700 transition-colors hover:bg-blue-100"
                              title="Ver imagem do POCUS de 3 / 4 pontos"
                              aria-label="Ver imagem do POCUS de 3 / 4 pontos"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-blue-900">
                            Protocolo compressivo de 3 / 4 pontos à beira-leito para rastrear TVP proximal. O principal achado é a incapacidade de compressão completa da veia.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTVPPocusInfoOpen(true)}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-xs font-bold text-blue-800 transition-colors hover:bg-blue-100"
                      >
                        <Info className="h-4 w-4" />
                        Ver protocolo
                      </button>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className={clsx(
                        'text-sm font-semibold',
                        selectedTVPLeg ? 'text-emerald-700' : 'text-amber-700'
                      )}>
                        {selectedTVPLeg
                          ? `Selecionado: ${
                              selectedTVPLeg === 'left'
                                ? 'Perna Esquerda'
                                : selectedTVPLeg === 'right'
                                  ? 'Perna Direita'
                                  : ''
                            }`
                          : 'Selecione uma opção para avançar'}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (!selectedTVPLeg) return
                          handleAnswer('tvp_exame_fisico', selectedTVPLeg)
                        }}
                        disabled={!selectedTVPLeg}
                        className={clsx(
                          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-all sm:w-auto',
                          selectedTVPLeg
                            ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                        )}
                        whileHover={selectedTVPLeg ? { scale: 1.01 } : {}}
                        whileTap={selectedTVPLeg ? { scale: 0.99 } : {}}
                      >
                        Confirmar e iniciar avaliação
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {isTVPWellsScore && (
                <div className="mb-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-200">
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Escore de Wells para suspeita de TVP
                        </h4>
                        <button
                          type="button"
                          onClick={() => setWellsInfoOpen(true)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
                          title="Observações práticas do Escore de Wells"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={clsx(
                        'px-4 py-2 rounded-xl border text-sm font-bold',
                        wellsRisk === 'alta'
                          ? 'bg-red-100 border-red-300 text-red-800'
                          : wellsRisk === 'moderada'
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      )}>
                        Pontuação: {wellsScoreTotal} ({wellsRisk.toUpperCase()})
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-xl border border-indigo-200 p-3">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_wells_criteria')}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Critérios de pontuação</span>
                        <ChevronRight className={clsx('w-4 h-4 text-indigo-700 transition-transform', isSectionOpen('tvp_wells_criteria', true) ? 'rotate-90' : '')} />
                      </button>
                    {isSectionOpen('tvp_wells_criteria', true) && (
                    <div className="space-y-2 mt-3">
                      {tvpWellsCriteria.map((criterion) => {
                        const checked = selectedWellsCriteria.includes(criterion.id)
                        return (
                          <label
                            key={criterion.id}
                            className={clsx(
                              'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                              checked ? 'bg-white border-indigo-300' : 'bg-white/70 border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWellsCriteria(prev => [...prev, criterion.id])
                                } else {
                                  setSelectedWellsCriteria(prev => prev.filter(item => item !== criterion.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-sm text-slate-700 leading-relaxed">{criterion.text}</span>
                              {criterion.text.toLowerCase().includes('cacifo') && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setTVPCacifoImageOpen(true)
                                  }}
                                  className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300 bg-white text-cyan-700 align-middle transition-colors hover:bg-cyan-100"
                                  title="Ver imagem de edema com cacifo"
                                  aria-label="Ver imagem de edema com cacifo"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <span className={clsx(
                                'ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-md border',
                                criterion.score > 0
                                  ? 'text-blue-700 border-blue-200 bg-blue-50'
                                  : 'text-red-700 border-red-200 bg-red-50'
                              )}>
                                {criterion.score > 0 ? `+${criterion.score}` : criterion.score}
                              </span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    )}
                    </div>

                    <div className="bg-white/70 rounded-xl border border-indigo-200 p-3">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_wells_interpretation')}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Interpretação e conduta</span>
                        <ChevronRight className={clsx('w-4 h-4 text-indigo-700 transition-transform', isSectionOpen('tvp_wells_interpretation', true) ? 'rotate-90' : '')} />
                      </button>
                    {isSectionOpen('tvp_wells_interpretation', true) && (
                    <>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <div className={clsx(
                        'rounded-xl p-3 border text-sm',
                        wellsRisk === 'baixa' ? 'bg-emerald-100 border-emerald-300' : 'bg-white border-slate-200'
                      )}>
                        <div className="font-bold text-slate-800">Baixa (≤0)</div>
                        <div className="text-slate-600 mt-1">D-dímero de alta sensibilidade; se positivo, USG compressiva.</div>
                      </div>
                      <div className={clsx(
                        'rounded-xl p-3 border text-sm',
                        wellsRisk === 'moderada' ? 'bg-amber-100 border-amber-300' : 'bg-white border-slate-200'
                      )}>
                        <div className="font-bold text-slate-800">Moderada (1–2)</div>
                        <div className="text-slate-600 mt-1">USG direta ou D-dímero de alta sensibilidade seguido de USG se positivo.</div>
                      </div>
                      <div className={clsx(
                        'rounded-xl p-3 border text-sm',
                        wellsRisk === 'alta' ? 'bg-red-100 border-red-300' : 'bg-white border-slate-200'
                      )}>
                        <div className="font-bold text-slate-800">Alta (≥3)</div>
                        <div className="text-slate-600 mt-1">USG compressiva urgente; se negativa e suspeita persistir, repetir em 5–7 dias.</div>
                      </div>
                    </div>

                    <div className="rounded-xl p-3 bg-white border border-slate-200 text-sm text-slate-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Medir panturrilha 10 cm abaixo da tuberosidade tibial e comparar com o lado assintomático.</li>
                        <li>Veias colaterais são veias não varicosas visíveis ou palpáveis.</li>
                        <li>O escore é apoio à decisão e não substitui julgamento clínico.</li>
                      </ul>
                    </div>

                    {hasTVPAlertSignSelected && (
                      <div className="rounded-xl border-l-4 border-l-red-700 border border-red-200 bg-red-50 p-4 text-sm text-red-950">
                        <p className="font-extrabold uppercase tracking-wide">Ramo de alta bloqueado</p>
                        <p className="mt-1">
                          Há sinal de alerta registrado no checklist. O Wells permanece documentado e a investigação
                          seguirá obrigatoriamente por POCUS e D-dímero. Resultados que normalmente permitiriam alta
                          ou exclusão de TVP não liberarão o ramo ambulatorial.
                        </p>
                      </div>
                    )}

                    <motion.button
                      onClick={() => handleAnswer(tvpWellsDestination, tvpWellsDecisionValue)}
                      className={clsx(
                        'w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between',
                        wellsRisk === 'alta'
                          ? 'bg-red-50 border-red-200 hover:border-red-400'
                          : wellsRisk === 'moderada'
                            ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
                            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="font-semibold text-slate-800">
                        {hasTVPAlertSignSelected
                          ? 'Continuar para POCUS e D-dímero obrigatórios'
                          : `Continuar conforme escore: ${wellsRisk === 'baixa' ? 'Probabilidade Baixa' : wellsRisk === 'moderada' ? 'Probabilidade Moderada' : 'Probabilidade Alta'}`}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </motion.button>
                    </>
                    )}
                    </div>
                  </div>
                </div>
              )}

              {isTVPWellsScore && wellsInfoOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
                      <h4 className="font-bold">Escore de Wells — Observações Práticas</h4>
                      <button
                        type="button"
                        onClick={() => setWellsInfoOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 text-sm text-slate-700">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Use fita para medir a panturrilha 10 cm abaixo da tuberosidade tibial; compare com o lado assintomático.</li>
                        <li>“Veias colaterais” referem-se a veias não-varicosas visíveis/palpáveis.</li>
                        <li>O escore é menos validado em gestantes, pacientes em anticoagulação, hospitalizados ou com infecções/traumas extensos; interprete com cautela.</li>
                        <li>Considere D-dímero ajustado à idade em idosos para melhorar especificidade.</li>
                        <li>Reavalie se surgir diagnóstico alternativo plausível (p. ex., ruptura de cisto de Baker, celulite).</li>
                        <li>Documente a pontuação e a via diagnóstica escolhida no prontuário.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {flegmasiaGalleryOpen && (
                <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                      <h4 className="font-bold">Flegmasia Cerulea Dolens - Imagens de Referência</h4>
                      <button
                        type="button"
                        onClick={() => setFlegmasiaGalleryOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="min-h-0 overflow-y-auto p-5">
                      <p className="text-sm text-slate-700 mb-4">
                        Achados visuais típicos: edema importante, cianose e diferença marcante entre os membros.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {flegmasiaReferenceImages.map((imageSrc, index) => (
                          <a
                            key={imageSrc}
                            href={imageSrc}
                            target="_blank"
                            rel="noreferrer"
                            className="group block overflow-hidden rounded-xl border border-slate-200 bg-white p-2"
                            title="Abrir imagem em tamanho original"
                          >
                            <img
                              src={imageSrc}
                              alt={`Imagem de referência de flegmasia ${index + 1}`}
                              className="h-72 w-full rounded-lg object-contain transition-transform group-hover:scale-[1.01]"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tvpWellsIntroOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => {
                      setTVPWellsIntroOpen(false)
                      setPendingTVPWellsOption(null)
                    }}
                  />
                  <div className="relative w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setTVPWellsIntroOpen(false)
                        setPendingTVPWellsOption(null)
                      }}
                      className="absolute top-3 right-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Fechar explicação do Escore de Wells"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-3">
                      Por que aplicar o Escore de Wells para TVP?
                    </h4>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      O Escore de Wells para TVP é uma ferramenta clínica essencial para estratificar a
                      probabilidade pré-teste de trombose venosa profunda em pacientes com dor ou edema
                      de membros inferiores. Ele organiza achados clínicos em um sistema de pontuação
                      simples para classificar o paciente em baixa, moderada ou alta probabilidade.
                    </p>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed mt-3">
                      Aplicar o escore de forma sistemática orienta a sequência diagnóstica: em baixa
                      probabilidade, um D-dímero negativo pode afastar TVP; em probabilidades mais
                      elevadas, prioriza-se ultrassom Doppler de membros inferiores. Isso melhora a
                      acurácia diagnóstica, reduz custos e ajuda a evitar atraso no diagnóstico de uma
                      condição potencialmente grave.
                    </p>
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTVPWellsIntroOpen(false)
                          setPendingTVPWellsOption(null)
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!pendingTVPWellsOption) return
                          setTVPWellsIntroOpen(false)
                          handleAnswer(pendingTVPWellsOption.nextStep, pendingTVPWellsOption.value)
                          setPendingTVPWellsOption(null)
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors"
                      >
                        Aplicar Escore de Wells para TVP
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {anaphylaxisEmergencyAllocationOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => {
                      setAnaphylaxisEmergencyAllocationOpen(false)
                      setPendingAnaphylaxisEmergencyOption(null)
                    }}
                  />
                  <div className="relative w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAnaphylaxisEmergencyAllocationOpen(false)
                        setPendingAnaphylaxisEmergencyOption(null)
                      }}
                      className="absolute top-3 right-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Fechar aviso de alocação do paciente"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mx-auto max-w-md py-4 text-center">
                      <p className="text-lg leading-relaxed text-slate-900">
                        Alocação do Paciente:
                      </p>
                      <p className="mt-2 text-xl font-extrabold uppercase leading-tight text-slate-950">
                        Sala de Emergência
                      </p>
                      <p className="mt-2 text-lg leading-relaxed text-slate-900">
                        Encaminhamento <strong>imediato obrigatório.</strong>
                      </p>
                    </div>
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnaphylaxisEmergencyAllocationOpen(false)
                          setPendingAnaphylaxisEmergencyOption(null)
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!pendingAnaphylaxisEmergencyOption) return
                          setAnaphylaxisEmergencyAllocationOpen(false)
                          handleAnswer(pendingAnaphylaxisEmergencyOption.nextStep, pendingAnaphylaxisEmergencyOption.value)
                          setPendingAnaphylaxisEmergencyOption(null)
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors"
                      >
                        Confirmar e iniciar adrenalina IM
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {anaphylaxisManagementAlertOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => {
                      setAnaphylaxisManagementAlertOpen(false)
                      setPendingAnaphylaxisManagementOption(null)
                    }}
                  />
                  <div className="relative w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAnaphylaxisManagementAlertOpen(false)
                        setPendingAnaphylaxisManagementOption(null)
                      }}
                      className="absolute top-3 right-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Fechar aviso de manejo da anafilaxia"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="py-2 pr-8 text-slate-950">
                      <div className="mb-5 flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">
                          🚨
                        </span>
                        <div>
                          <h4 className="text-xl font-extrabold leading-tight text-slate-950">
                            Atenção — Manejo da Anafilaxia
                          </h4>
                          <p className="mt-1 text-sm text-slate-700">
                            Medidas imediatas antes de selecionar o tratamento adjunto.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-amber-200 bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Monitorização contínua</p>
                          <p className="mt-1 text-sm text-slate-800">Cardíaca + oximetria.</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Acesso venoso</p>
                          <p className="mt-1 text-sm text-slate-800">Imediato.</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Oxigênio</p>
                          <p className="mt-1 text-sm text-slate-800">Se indicado; considerar IOT precoce/cricotireoidostomia.</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Infusão de fluidos</p>
                          <p className="mt-1 text-sm text-slate-800">Se PAS &lt; 90 mmHg ou queda &gt; 30% da PAM.</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-sm leading-relaxed text-red-950">
                          <strong>Hipotensão refratária:</strong> considerar <strong>noradrenalina, vasopressina ou dopamina</strong> conforme protocolo institucional.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnaphylaxisManagementAlertOpen(false)
                          setPendingAnaphylaxisManagementOption(null)
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!pendingAnaphylaxisManagementOption) return
                          setAnaphylaxisManagementAlertOpen(false)
                          handleAnswer(pendingAnaphylaxisManagementOption.nextStep, pendingAnaphylaxisManagementOption.value)
                          setPendingAnaphylaxisManagementOption(null)
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors"
                      >
                        Confirmar e selecionar tratamento adjunto
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tvpConfirmadaOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => {
                      setTVPConfirmadaOpen(false)
                      setPendingTVPConfirmadaOption(null)
                    }}
                  />
                  <div className="relative w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setTVPConfirmadaOpen(false)
                        setPendingTVPConfirmadaOption(null)
                      }}
                      className="absolute top-3 right-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Fechar confirmação"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-3 uppercase">
                      Trombose Confirmada
                    </h4>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                      Anticoagulação indicada.
                    </p>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed mt-3">
                      Antes de avançar, vamos checar possíveis contraindicações.
                    </p>
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTVPConfirmadaOpen(false)
                          setPendingTVPConfirmadaOption(null)
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!pendingTVPConfirmadaOption) return
                          setTVPConfirmadaOpen(false)
                          handleAnswer(pendingTVPConfirmadaOption.nextStep, pendingTVPConfirmadaOption.value)
                          setPendingTVPConfirmadaOption(null)
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors"
                      >
                        Avançar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isTVPTreatmentInitial && tvpAnticoagConsiderationsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => {
                      setTVPAnticoagConsiderationsOpen(false)
                      setTVPNoacInfoOpen(null)
                    }}
                  />
                  <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-amber-200 bg-amber-50 shadow-2xl overflow-hidden flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setTVPAnticoagConsiderationsOpen(false)
                        setTVPNoacInfoOpen(null)
                      }}
                      className="absolute top-3 right-3 rounded-full p-1 text-slate-500 hover:bg-amber-100"
                      aria-label="Fechar considerações da anticoagulação"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="p-6 pb-4">
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1">
                        Considerações Essenciais da Anticoagulação
                      </h4>
                      <p className="text-sm text-slate-700">
                        Resumo prático para orientar escolha terapêutica, duração e perfil dos anticoagulantes na TVP.
                      </p>
                    </div>
                    <div className="px-6 overflow-y-auto pb-4">
                      <div className="grid gap-3">
                        {tvpAnticoagulationConsiderations.map((section) => (
                          <div key={section.id} className="rounded-xl border border-amber-200 bg-amber-100/70 p-4">
                            <h5 className="text-sm font-bold text-amber-950 mb-2">{section.title}</h5>
                            <div className="space-y-2">
                              {section.paragraphs.map((paragraph) => (
                                <p key={paragraph} className="text-sm text-amber-950 leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                            {section.id === 'consideracoes_noac_tvp' && (
                              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                                <h6 className="text-sm font-extrabold text-red-900 mb-1">
                                  NOACs não são para todos
                                </h6>
                                <p className="text-xs text-red-800 mb-3">
                                  Em cenários de trombofilia de alto risco, evitar NOAC e considerar varfarina.
                                </p>
                                <div className="space-y-2">
                                  {tvpNoacHighRiskNotes.map((item) => (
                                    <div key={item.id} className="flex items-start gap-2 rounded-lg border border-red-100 bg-white p-2.5">
                                      <button
                                        type="button"
                                        onClick={() => setTVPNoacInfoOpen(item.id)}
                                        className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border border-red-300 text-red-700 hover:bg-red-100 transition-colors"
                                        title="Ver explicação"
                                      >
                                        <Info className="w-3.5 h-3.5" />
                                      </button>
                                      <div>
                                        <p className="text-sm font-semibold text-red-900 leading-snug">{item.title}</p>
                                        <p className="text-xs text-red-800 mt-0.5">{item.summary}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 pt-4 border-t border-amber-200/80 bg-amber-50/95 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setTVPAnticoagConsiderationsOpen(false)
                          setTVPNoacInfoOpen(null)
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
                      >
                        Entendi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isTVPTreatmentInitial && tvpAnticoagConsiderationsOpen && tvpNoacInfoOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-red-200 bg-white shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-700 to-rose-700 text-white">
                      <h4 className="font-bold">
                        {tvpNoacHighRiskNotes.find((item) => item.id === tvpNoacInfoOpen)?.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setTVPNoacInfoOpen(null)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 overflow-y-auto">
                      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800">
                        {(tvpNoacHighRiskNotes.find((item) => item.id === tvpNoacInfoOpen)?.details ?? []).map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {isBellSideSelection && bellFacialNerveOpen && (
                <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
                  <div className="flex min-h-full items-center justify-center">
                    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-800 to-cyan-700 px-5 py-4 text-white">
                        <div>
                          <h4 className="text-lg font-extrabold">Nervo facial (VII par craniano)</h4>
                          <p className="mt-1 text-sm text-blue-50">
                            Referência visual do trajeto periférico acometido na Paralisia de Bell.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBellFacialNerveOpen(false)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30"
                          title="Fechar"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="bg-slate-50 p-4">
                        <img
                          src="/paralisia%20de%20bell/facial%20nerve.png"
                          alt="Trajeto do nervo facial"
                          className="mx-auto max-h-[58vh] w-full rounded-xl object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isBellSideSelection && pendingBellSide && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4">
                  <div
                    className="absolute inset-0 bg-slate-900/45"
                    onClick={() => setPendingBellSide(null)}
                  />
                  <div className="relative flex max-h-[86vh] w-full max-w-3xl flex-col rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-2xl sm:p-5">
                    <button
                      type="button"
                      onClick={() => setPendingBellSide(null)}
                      className="absolute top-3 right-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Fechar epidemiologia da Paralisia de Bell"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="shrink-0 pr-9">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        {pendingBellSide.label} selecionado
                      </p>
                      <h4 className="mt-1 text-base font-extrabold text-slate-900 sm:text-lg">
                        Epidemiologia da Paralisia de Bell
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        Revise os dados epidemiológicos antes de seguir para os critérios diagnósticos.
                      </p>
                    </div>

                    <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl border border-amber-100 bg-white p-4 sm:p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          {
                            label: 'Incidência',
                            value: '15 a 40 casos por 100.000 habitantes/ano.'
                          },
                          {
                            label: 'Risco global',
                            value: '1 em cada 60 pessoas desenvolverá na vida.'
                          },
                          {
                            label: 'Prevalência',
                            value: 'Causa de 60% a 75% das paralisias faciais periféricas.'
                          },
                          {
                            label: 'Idade',
                            value: 'Pico bimodal: 20-30 anos e 60-70 anos; rara em crianças.'
                          },
                          {
                            label: 'Gênero',
                            value: 'Distribuição idêntica entre homens e mulheres.'
                          },
                          {
                            label: 'Gestantes',
                            value: 'Risco 3x maior no 3º trimestre e na 1ª semana pós-parto.'
                          },
                          {
                            label: 'Comorbidades',
                            value: 'Maior frequência em diabéticos e hipertensos.'
                          }
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <p className="text-xs font-extrabold uppercase tracking-wide text-cyan-700">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setPendingBellSide(null)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const selectedSide = pendingBellSide
                          setPendingBellSide(null)
                          handleAnswer('bell_transicao_central_periferica', selectedSide.value)
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-700"
                      >
                        Seguir
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isBellCriteriaStep && bellCranioOpen && (
                <ZoomableImageModal
                  title="VII par craniano"
                  description="Referência visual do trajeto do nervo facial. Use os controles de lupa para ampliar os detalhes."
                  src="/paralisia%20de%20bell/viiparcraniano.jpeg"
                  alt="VII par craniano"
                  onClose={() => setBellCranioOpen(false)}
                  maxWidthClassName="max-w-7xl"
                />
              )}

              {bellCheekInflationImageOpen && (
                <ZoomableImageModal
                  title="Teste de insuflar bochecha"
                  description="Referência visual para avaliar escape de ar e incapacidade de manter a bochecha insuflada na paralisia facial periférica."
                  src="/bochecha%20bell.jpeg"
                  alt="Teste de insuflar bochecha na Paralisia de Bell"
                  onClose={() => setBellCheekInflationImageOpen(false)}
                  maxWidthClassName="max-w-5xl"
                />
              )}

              {isAVCCincinnatiStep && cincinnatiInfoOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                      <h4 className="font-bold">Como fazer Cincinnati (FAST)</h4>
                      <button
                        type="button"
                        onClick={() => setCincinnatiInfoOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 grid md:grid-cols-2 gap-5">
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                        <ul className="list-disc pl-5 space-y-2">
                          <li><strong>Face:</strong> peça para sorrir e observe assimetria de rima labial.</li>
                          <li><strong>Braço:</strong> peça para elevar os dois braços por 10 segundos e observe queda unilateral.</li>
                          <li><strong>Fala:</strong> peça para repetir frase simples e avalie disartria ou afasia.</li>
                          <li><strong>Tempo:</strong> registre a última vez visto bem e acione protocolo imediatamente.</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                        <video
                          controls
                          autoPlay
                          muted
                          playsInline
                          className="w-full rounded-lg border border-slate-200 bg-black"
                        >
                          <source src="/videos/avc-simulado-legenda.mp4" type="video/mp4" />
                          Seu navegador não suporta vídeo HTML5.
                        </video>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isAsthmaStartStep && asthmaSoundInfoOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4">
                  <div className="flex min-h-full items-start justify-center py-2 sm:items-center">
                    <div className="w-full max-w-3xl max-h-[calc(100vh-2rem)] min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-700 to-blue-700 text-white">
                      <div>
                        <h4 className="font-bold">Sibilância de referência</h4>
                        <p className="mt-1 text-sm text-cyan-50">
                          Exemplo sonoro e leitura prática da ausculta na crise asmática.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAsthmaSoundInfoOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                        <p className="text-sm leading-relaxed text-cyan-950">
                          A sibilância é um som respiratório adventício, agudo e musical, geralmente mais evidente na expiração.
                          Este áudio funciona como referência didática rápida para ajudar a reconhecer o chiado típico da obstrução brônquica.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-800">Áudio de referência</p>
                        <audio controls className="w-full">
                          <source src="/audio/sounds-of-asthma-wheezing-lung-sounds.mp3" type="audio/mpeg" />
                          Seu navegador não suporta áudio HTML5.
                        </audio>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <h5 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-900">
                            O que ouvir
                          </h5>
                          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                            <li>Chiado fino, agudo e com qualidade musical.</li>
                            <li>Predomínio na expiração, podendo surgir também na inspiração em crises mais intensas.</li>
                            <li>Maior valor clínico quando associado a dispneia, tosse e prolongamento expiratório.</li>
                          </ul>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <h5 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-amber-950">
                            Atenção clínica
                          </h5>
                          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-900">
                            <li>Tórax silencioso em paciente cansado não é sinal de melhora; pode indicar obstrução muito grave.</li>
                            <li>Interprete a ausculta junto com fala entrecortada, esforço respiratório, SatO2 e estado mental.</li>
                            <li>O áudio é uma referência educacional e não substitui o exame clínico do paciente real.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              )}

              {influenzaICUInfoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-rose-700 to-red-700 px-5 py-4 text-white">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <Info className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-100">Critério de UTI</p>
                          <h4 className="mt-1 text-lg font-extrabold">{influenzaICUInfoOpen}</h4>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInfluenzaICUInfoOpen(null)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 transition-colors hover:bg-white/25"
                        title="Fechar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                        <p className="text-base leading-relaxed text-slate-800">
                          {INFLUENZA_ICU_CRITERIA_INFO[influenzaICUInfoOpen]}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setInfluenzaICUInfoOpen(null)}
                          className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-800"
                        >
                          Entendi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {influenzaPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm">
                  <div className="mx-auto my-4 flex min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:my-8">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-700 to-sky-700 text-white">
                      <div>
                        <h4 className="font-bold">{influenzaPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-cyan-50">
                          Receituário rápido para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyInfluenzaPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            influenzaPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {influenzaPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {influenzaPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInfluenzaPrescriptionPreview(null)
                            setInfluenzaPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {influenzaPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={copyInfluenzaPrescriptionText}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                          influenzaPrescriptionCopied
                            ? 'bg-emerald-600 text-white'
                            : 'border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
                        )}
                      >
                        {influenzaPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                        {influenzaPrescriptionCopied ? 'Copiado' : 'Copiar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInfluenzaPrescriptionPreview(null)
                          setInfluenzaPrescriptionCopied(false)
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        Fechar e voltar ao fluxo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pneumoniaPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
                      <div>
                        <h4 className="font-bold">{pneumoniaPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-emerald-50">
                          Receituário rápido para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyPneumoniaPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            pneumoniaPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {pneumoniaPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {pneumoniaPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPneumoniaPrescriptionPreview(null)
                            setPneumoniaPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {pneumoniaPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sinusitisPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-700 to-cyan-700 text-white">
                      <div>
                        <h4 className="font-bold">{sinusitisPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-teal-50">
                          Receituário rápido para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copySinusitisPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            sinusitisPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {sinusitisPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {sinusitisPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSinusitisPrescriptionPreview(null)
                            setSinusitisPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {sinusitisPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {faringoamigdalitePrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-sky-700 to-blue-700 text-white">
                      <div>
                        <h4 className="font-bold">{faringoamigdalitePrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-sky-50">
                          Receituário rápido para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyFaringoamigdalitePrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            faringoamigdalitePrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {faringoamigdalitePrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {faringoamigdalitePrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFaringoamigdalitePrescriptionPreview(null)
                            setFaringoamigdalitePrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {faringoamigdalitePrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {monoartritePrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className={clsx(
                      'flex items-center justify-between px-5 py-4 text-white',
                      monoartritePrescriptionPreview.disposition === 'septic'
                        ? 'bg-gradient-to-r from-red-700 to-rose-800'
                        : 'bg-gradient-to-r from-slate-700 to-zinc-800'
                    )}>
                      <div>
                        <h4 className="font-bold">{monoartritePrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-white/85">
                          Conduta rápida para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyMonoartritePrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            monoartritePrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar conduta"
                        >
                          {monoartritePrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {monoartritePrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMonoartritePrescriptionPreview(null)
                            setMonoartritePrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {monoartritePrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {ansiedadePrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
                      <div>
                        <h4 className="font-bold">{ansiedadePrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-blue-50">
                          Conduta rápida para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyAnsiedadePrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            ansiedadePrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar conduta"
                        >
                          {ansiedadePrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {ansiedadePrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAnsiedadePrescriptionPreview(null)
                            setAnsiedadePrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {ansiedadePrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vertigemPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-cyan-700 text-white">
                      <div>
                        <h4 className="font-bold">{vertigemPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-blue-50">
                          Receita rápida para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyVertigemPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            vertigemPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {vertigemPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {vertigemPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVertigemPrescriptionPreview(null)
                            setVertigemPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {vertigemPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cefaleiaPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className={clsx(
                      'flex items-center justify-between px-5 py-4 text-white',
                      cefaleiaPrescriptionPreview.disposition === 'migranea'
                        ? 'bg-gradient-to-r from-rose-700 to-pink-800'
                        : cefaleiaPrescriptionPreview.disposition === 'salvas'
                          ? 'bg-gradient-to-r from-amber-700 to-orange-800'
                          : 'bg-gradient-to-r from-emerald-700 to-teal-800'
                    )}>
                      <div>
                        <h4 className="font-bold">{cefaleiaPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-white/85">
                          Receita rápida para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyCefaleiaPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            cefaleiaPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {cefaleiaPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {cefaleiaPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCefaleiaPrescriptionPreview(null)
                            setCefaleiaPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {cefaleiaPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {agitacaoPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className={clsx(
                      'flex items-center justify-between px-5 py-4 text-white',
                      agitacaoPrescriptionPreview.disposition === 'grave_im'
                        ? 'bg-gradient-to-r from-red-700 to-rose-800'
                        : 'bg-gradient-to-r from-amber-700 to-orange-800'
                    )}>
                      <div>
                        <h4 className="font-bold">{agitacaoPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-white/85">
                          Conduta rápida para visualização durante o fluxo.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyAgitacaoPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            agitacaoPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar conduta"
                        >
                          {agitacaoPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {agitacaoPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAgitacaoPrescriptionPreview(null)
                            setAgitacaoPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {agitacaoPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pepHivPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-700 to-blue-800 text-white">
                      <div>
                        <h4 className="font-bold">{pepHivPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-white/85">
                          Receita de alta e orientações para acompanhamento sorológico.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyPepHivPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            pepHivPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {pepHivPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {pepHivPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPepHivPrescriptionPreview(null)
                            setPepHivPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {pepHivPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {anaphylaxisAdjunctPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-700 to-red-800 text-white">
                      <div>
                        <h4 className="font-bold">{anaphylaxisAdjunctPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-orange-50">
                          Texto montado conforme as manifestações selecionadas no tratamento adjunto.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyAnaphylaxisAdjunctPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            anaphylaxisAdjunctPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {anaphylaxisAdjunctPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {anaphylaxisAdjunctPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAnaphylaxisAdjunctPrescriptionPreview(null)
                            setAnaphylaxisAdjunctPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {anaphylaxisAdjunctPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {anaphylaxisPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-700 to-rose-800 text-white">
                      <div>
                        <h4 className="font-bold">{anaphylaxisPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-red-50">
                          Orientações domiciliares apenas após estabilização e observação.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyAnaphylaxisPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            anaphylaxisPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {anaphylaxisPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {anaphylaxisPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAnaphylaxisPrescriptionPreview(null)
                            setAnaphylaxisPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {anaphylaxisPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pancreatitisPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-700 to-red-700 text-white">
                      <div>
                        <h4 className="font-bold">{pancreatitisPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-orange-50">
                          Conduta hospitalar inicial conforme tabela de suporte.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyPancreatitisPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            pancreatitisPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {pancreatitisPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {pancreatitisPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPancreatitisPrescriptionPreview(null)
                            setPancreatitisPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {pancreatitisPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cholangitisPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
                      <div>
                        <h4 className="font-bold">{cholangitisPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-emerald-50">
                          Antibiótico precoce, suporte e avaliação para drenagem biliar.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyCholangitisPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            cholangitisPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {cholangitisPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {cholangitisPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCholangitisPrescriptionPreview(null)
                            setCholangitisPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {cholangitisPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cholecystitisPrescriptionPreview && (
                <div
                  className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => {
                    setCholecystitisPrescriptionPreview(null)
                    setCholecystitisPrescriptionCopied(false)
                  }}
                >
                  <div
                    className="w-full max-w-3xl max-h-[82vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-3 px-5 py-4 bg-gradient-to-r from-lime-700 to-emerald-700 text-white">
                      <div>
                        <h4 className="font-bold">{cholecystitisPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-lime-50">
                          Dieta zero, hidratação, analgesia, antibiótico e avaliação cirúrgica.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyCholecystitisPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            cholecystitisPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {cholecystitisPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {cholecystitisPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCholecystitisPrescriptionPreview(null)
                            setCholecystitisPrescriptionCopied(false)
                          }}
                          className="w-9 h-9 shrink-0 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Minimizar prescrição"
                          aria-label="Minimizar prescrição"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {cholecystitisPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 bg-white px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCholecystitisPrescriptionPreview(null)
                          setCholecystitisPrescriptionCopied(false)
                        }}
                        className="w-full rounded-xl bg-lime-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-lime-800 sm:w-auto"
                      >
                        Minimizar prescrição e voltar ao fluxo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {cholecystitisSurgeryConsultPreview && (
                <div
                  className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => {
                    setCholecystitisSurgeryConsultPreview(null)
                    setCholecystitisSurgeryConsultCopied(false)
                  }}
                >
                  <div
                    className="w-full max-w-3xl max-h-[82vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-3 px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                      <div>
                        <h4 className="font-bold">{cholecystitisSurgeryConsultPreview.title}</h4>
                        <p className="mt-1 text-sm text-slate-100">
                          Modelo copiável para solicitação à Cirurgia Geral.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyCholecystitisSurgeryConsultText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            cholecystitisSurgeryConsultCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar interconsulta"
                        >
                          {cholecystitisSurgeryConsultCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {cholecystitisSurgeryConsultCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCholecystitisSurgeryConsultPreview(null)
                            setCholecystitisSurgeryConsultCopied(false)
                          }}
                          className="w-9 h-9 shrink-0 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Minimizar interconsulta"
                          aria-label="Minimizar interconsulta"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {cholecystitisSurgeryConsultPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 bg-white px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCholecystitisSurgeryConsultPreview(null)
                          setCholecystitisSurgeryConsultCopied(false)
                        }}
                        className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-900 sm:w-auto"
                      >
                        Minimizar interconsulta e voltar ao fluxo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {appendicitisPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-700 to-red-700 text-white">
                      <div>
                        <h4 className="font-bold">{appendicitisPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-rose-50">
                          Dieta zero, hidratação, analgesia, antibiótico e avaliação cirúrgica.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyAppendicitisPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            appendicitisPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {appendicitisPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {appendicitisPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppendicitisPrescriptionPreview(null)
                            setAppendicitisPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {appendicitisPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {lombalgiaPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-700 to-zinc-800 text-white">
                      <div>
                        <h4 className="font-bold">{lombalgiaPrescriptionPreview.title}</h4>
                        <p className="mt-1 text-sm text-slate-100">
                          Analgesia, medidas não farmacológicas e sinais de retorno.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyLombalgiaPrescriptionText}
                          className={clsx(
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            lombalgiaPrescriptionCopied
                              ? 'bg-emerald-500/20 text-emerald-50'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          )}
                          title="Copiar prescrição"
                        >
                          {lombalgiaPrescriptionCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          {lombalgiaPrescriptionCopied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLombalgiaPrescriptionPreview(null)
                            setLombalgiaPrescriptionCopied(false)
                          }}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                          title="Fechar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {lombalgiaPrescriptionPreview.content.map((line, index) => (
                          <p key={`${line}-${index}`} className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tvpPrescriptionPreview && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-cyan-700 text-white">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{tvpPrescriptionPreview.title}</h4>
                        {tvpPrescriptionPreview.therapyId === 'varfarina' && (
                          <button
                            type="button"
                            onClick={() => setVarfarinaDietInfoOpen(true)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/60 bg-white/20 hover:bg-white/30 transition-colors"
                            title="Ver orientações alimentares na varfarina"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTVPPrescriptionPreview(null)
                          setVarfarinaDietInfoOpen(false)
                        }}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                        {tvpPrescriptionPreview.content.map((line) => (
                          <p key={line} className="text-sm text-slate-800 leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setTVPPrescriptionPreview(null)
                            setVarfarinaDietInfoOpen(false)
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tvpPrescriptionPreview?.therapyId === 'varfarina' && varfarinaDietInfoOpen && (
                <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl border border-emerald-200 bg-white shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
                      <h4 className="font-bold">Varfarina e alimentação: orientações essenciais</h4>
                      <button
                        type="button"
                        onClick={() => setVarfarinaDietInfoOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 grid gap-3 overflow-y-auto">
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <h5 className="text-sm font-extrabold text-red-900 mb-2">
                          Interações medicamentosas da varfarina (alto impacto clínico)
                        </h5>
                        <p className="text-xs text-red-800">
                          Esta é uma área crítica: mesmo com INR aparentemente controlado, algumas combinações aumentam sangramento.
                        </p>
                      </div>
                      {varfarinaDrugInteractionSections.map((section) => (
                        <div key={section.id} className="rounded-xl border border-red-200 bg-red-50 p-4">
                          <h5 className="text-sm font-bold text-red-900 mb-2">{section.title}</h5>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-red-900">
                            {section.bullets.map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {varfarinaDietGuidanceSections.map((section) => (
                        <div key={section.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <h5 className="text-sm font-bold text-emerald-900 mb-2">{section.title}</h5>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-emerald-900">
                            {section.bullets.map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isTVPContraCheck && tvpRiskBenefitGuideOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
                      <h4 className="font-bold">Como avaliar o risco benefício: Anticoagular ou Não?</h4>
                      <button
                        type="button"
                        onClick={() => setTVPRiskBenefitGuideOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 space-y-4 text-sm text-slate-800">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="font-bold text-emerald-900">1) PERGUNTE: &quot;EMBOLIZA?&quot;</p>
                        <p className="mt-1 font-semibold">Avalie risco tromboembólico:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-emerald-900">
                          <li>TVP proximal (femoral/iliaca/poplitea).</li>
                          <li>Sintomas importantes (dor/edema extensos, dor toracica, dispneia).</li>
                          <li>Cancer ativo, imobilizacao recente, trombofilia conhecida.</li>
                          <li>Trombo em localizacao de alto risco (ex.: trombo flutuante).</li>
                        </ul>
                        <p className="mt-2"><strong>Conclusao:</strong> se SIM, tende a anticoagular. Se NAO ou incerto, siga para etapa 2.</p>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="font-bold text-amber-900">2) PERGUNTE: &quot;SANGRA?&quot;</p>
                        <p className="mt-1 font-semibold">Avalie risco hemorrágico:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-amber-900">
                          <li>Sangramento ativo (GI, intracraniano, hemoptise significativa).</li>
                          <li>Plaquetas baixas (ex.: &lt; 50 mil).</li>
                          <li>Funcao renal/hepatica ruim (ClCr muito reduzido, INR elevado sem ACO).</li>
                          <li>HAS grave nao controlada (ex.: PAS &gt;= 180 ou PAD &gt;= 110).</li>
                          <li>Sangramento GI recente (ex.: &lt; 4 semanas).</li>
                        </ul>
                        <p className="mt-2"><strong>Classificacao:</strong> absoluta (hemorragia ativa maior, sangramento intracraniano recente, cirurgia neuro/ocular recente, plaquetas muito baixas, risco crítico nao corrigível) e relativa (plaquetopenia moderada, HAS elevada, disfuncao renal/hepatica moderada, sangramento GI remoto).</p>
                        <p className="mt-1"><strong>Conclusao:</strong> se SIM, classificar relativo x absoluto. Se NAO, risco hemorrágico baixo/manejável.</p>
                      </div>

                      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                        <p className="font-bold text-cyan-900">3) COMPARE: &quot;O QUE PESA MAIS?&quot;</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-cyan-900">
                          <li>Emboliza &gt; sangra: anticoagular.</li>
                          <li>Sangra &gt; emboliza: corrigir fator e reavaliar (controlar HAS, otimizar funcao renal, tratar fonte de sangramento, transfusao/plaquetas).</li>
                          <li>Sangramento absoluto: nao anticoagular.</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setTVPRiskBenefitGuideOpen(false)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                        >
                          Entendi, voltar para decisão
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isTVPContraCheck && (
                <div className="mb-6 p-5 bg-red-50 rounded-2xl border border-red-200">
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_treatment_contra')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Checar contraindicações à anticoagulação
                        </h4>
                        <ChevronRight className={clsx('w-4 h-4 text-red-700 transition-transform', isSectionOpen('tvp_treatment_contra', true) ? 'rotate-90' : '')} />
                      </button>
                      {isSectionOpen('tvp_treatment_contra', true) && (
                      <div className="space-y-2">
                        {tvpAnticoagContraindications.map((item) => {
                          const checked = selectedContraindications.includes(item.id)
                          return (
                            <label
                              key={item.id}
                              className={clsx(
                                'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                                checked ? 'bg-white border-red-300' : 'bg-white/70 border-slate-200 hover:border-slate-300'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedContraindications(prev => [...prev, item.id])
                                  } else {
                                    setSelectedContraindications(prev => prev.filter(entry => entry !== item.id))
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <span className="text-sm text-slate-700 leading-relaxed">{item.text}</span>
                                <span className={clsx(
                                  'ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-md border',
                                  item.severity === 'absoluta'
                                    ? 'text-red-700 border-red-200 bg-red-50'
                                    : 'text-amber-700 border-amber-200 bg-amber-50'
                                )}>
                                  {item.severity === 'absoluta' ? 'Absoluta' : 'Relativa'}
                                </span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      )}
                    </div>

                    <div className={clsx(
                      'rounded-xl p-3 border text-sm',
                      hasAbsoluteContraindication
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : hasRelativeContraindication
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    )}>
                      {hasAbsoluteContraindication
                        ? 'Existe contraindicação absoluta à anticoagulação: não anticoagular e solicitar avaliação da Cirurgia Vascular.'
                        : hasRelativeContraindication
                          ? 'Existe contraindicação relativa: avaliar risco-benefício do tratamento antes de decidir.'
                          : 'Sem contraindicações selecionadas: seguir para anticoagulação.'}
                    </div>

                    {hasAbsoluteContraindication && (
                      <motion.button
                        onClick={() => handleAnswer('tvp_aguarda_avaliacao_vascular', 'contraindicacao_absoluta')}
                        className="w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between bg-red-50 border-red-300 hover:border-red-500"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="font-semibold text-slate-800">
                          Existe contraindicação absoluta: solicitar avaliação da Cirurgia Vascular
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </motion.button>
                    )}

                    {!hasAbsoluteContraindication && hasRelativeContraindication && (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-emerald-900">Avaliar risco-benefício do tratamento</p>
                            <button
                              type="button"
                              onClick={() => setTVPRiskBenefitGuideOpen(true)}
                              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                            >
                              Como avaliar o risco benefício?
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <motion.button
                            onClick={() => handleAnswer('tratamento_inicial', 'beneficio_supera_risco')}
                            className="w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between bg-emerald-50 border-emerald-200 hover:border-emerald-400"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <span className="font-semibold text-slate-800">Benefício supera o risco: seguir para anticoagulação</span>
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          </motion.button>

                          <motion.button
                            onClick={() => handleAnswer('tvp_aguarda_avaliacao_vascular', 'risco_supera_beneficio')}
                            className="w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between bg-amber-50 border-amber-300 hover:border-amber-500"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <span className="font-semibold text-slate-800">Risco supera o benefício: solicitar avaliação da Cirurgia Vascular</span>
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {!hasAbsoluteContraindication && !hasRelativeContraindication && (
                      <motion.button
                        onClick={() => handleAnswer('tratamento_inicial', 'sem_contraindicacao_anticoagular')}
                        className="w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between bg-emerald-50 border-emerald-200 hover:border-emerald-400"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="font-semibold text-slate-800">
                          Sem contraindicação relevante: seguir para anticoagulação
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {isTVPTreatmentInitial && (
                <div className="mb-6 p-5 bg-red-50 rounded-2xl border border-red-200">
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_treatment_therapies')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Opções terapêuticas, doses e sugestão de prescrições
                        </h4>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 inline-flex items-center gap-2">
                          {availableSelectedTherapies.length} opção(ões)
                          <ChevronRight className={clsx('w-3 h-3 text-blue-700 transition-transform', isSectionOpen('tvp_treatment_therapies', true) ? 'rotate-90' : '')} />
                        </span>
                      </button>
                      {isSectionOpen('tvp_treatment_therapies', true) && (
                      <div className="space-y-2">
                        {availableTVPTherapeuticOptions.map((item) => {
                          const checked = selectedTherapies.includes(item.id)
                          const canGeneratePrescription = [
                            'rivaroxabana',
                            'apixabana',
                            'dabigatrana',
                            'edoxabana',
                            'enoxaparina',
                            'hnf',
                            'varfarina'
                          ].includes(item.id)
                          return (
                            <label
                              key={item.id}
                              className={clsx(
                                'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                                checked ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTherapies(prev => [...prev, item.id])
                                  } else {
                                    setSelectedTherapies(prev => prev.filter(entry => entry !== item.id))
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    {item.group}
                                  </span>
                                  {canGeneratePrescription && (
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setTVPPrescriptionPreview(buildTVPPrescriptionPreview(item.id))
                                      }}
                                      className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                                    >
                                      Gerar prescrição
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      )}
                    </div>



                    <div className="grid md:grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => handleAnswer('anticoagulacao_iniciada', 'anticoagulacao_iniciada')}
                        disabled={!hasSelectedTherapy}
                        className={clsx(
                          'w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between',
                          !hasSelectedTherapy
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                        )}
                        whileHover={hasSelectedTherapy ? { scale: 1.01 } : {}}
                        whileTap={hasSelectedTherapy ? { scale: 0.99 } : {}}
                      >
                        <span className="font-semibold text-slate-800">Paciente anticoagulado e fluxo finalizado</span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleAnswer('tvp_aguarda_avaliacao_vascular', 'anticoagulado_encaminhado_vascular')}
                        disabled={!hasSelectedTherapy}
                        className={clsx(
                          'w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between',
                          !hasSelectedTherapy
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-50 border-amber-300 hover:border-amber-500'
                        )}
                        whileHover={hasSelectedTherapy ? { scale: 1.01 } : {}}
                        whileTap={hasSelectedTherapy ? { scale: 0.99 } : {}}
                      >
                        <span className="font-semibold text-slate-800">Paciente anticoagulado e encaminhado para avaliação da Cirurgia Vascular</span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {tvpOtherLocationsImageOpen && (
                <ZoomableImageModal
                  title="Outras localizações de trombose venosa"
                  description="Imagem de referência para territórios além dos membros inferiores."
                  src="/outras%20localidades.png"
                  alt="Outras localizações de trombose venosa"
                  onClose={() => setTVPOtherLocationsImageOpen(false)}
                  maxWidthClassName="max-w-6xl"
                />
              )}

              {tvpCacifoImageOpen && (
                <ZoomableImageModal
                  title="Edema com cacifo"
                  description="Referência visual para avaliação do sinal de cacifo no membro edemaciado."
                  src="/cacifo.png"
                  alt="Demonstração de edema com cacifo"
                  onClose={() => setTVPCacifoImageOpen(false)}
                  maxWidthClassName="max-w-5xl"
                />
              )}

              {tvpPocusPointsImageOpen && (
                <ZoomableImageModal
                  title="POCUS vascular para TVP - 3 / 4 pontos"
                  description="Referência visual dos pontos de compressão avaliados no protocolo vascular à beira-leito."
                  src="/pocus%20tvp%203%3A4.png"
                  alt="Protocolo POCUS vascular para TVP de 3 ou 4 pontos"
                  onClose={() => setTVPPocusPointsImageOpen(false)}
                  maxWidthClassName="max-w-6xl"
                />
              )}

              {tvpPocusInfoOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-950">POCUS vascular para TVP: compressão de 3 / 4 pontos</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          Protocolo adotado no pronto-socorro para rastreamento rápido da trombose venosa profunda proximal à beira-leito.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTVPPocusInfoOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                        title="Fechar"
                        aria-label="Fechar protocolo de POCUS vascular"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-5 overflow-y-auto p-5 text-sm leading-relaxed text-slate-700">
                      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <h5 className="font-extrabold text-blue-950">Princípio diagnóstico</h5>
                        <p className="mt-2">
                          O médico treinado realiza ultrassonografia compressiva limitada de 3 pontos (Three-Point Compression POCUS/LCUS) para rastrear TVP proximal. A incapacidade de compressão é o principal sinal diagnóstico.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-emerald-200 bg-white p-4">
                            <p className="font-bold text-emerald-900">Veia normal</p>
                            <p className="mt-1">Ao pressionar com o transdutor, a veia colaba completamente.</p>
                            <div className="mt-3 flex items-center justify-center gap-8 rounded-lg bg-emerald-50 p-3 font-mono text-emerald-950">
                              <span>Antes: O</span>
                              <span>Depois: |</span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-red-200 bg-white p-4">
                            <p className="font-bold text-red-900">Veia trombosada</p>
                            <p className="mt-1">Mesmo após a compressão, a veia não colaba.</p>
                            <div className="mt-3 flex items-center justify-center gap-8 rounded-lg bg-red-50 p-3 font-mono text-red-950">
                              <span>Antes: O</span>
                              <span>Depois: O</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h5 className="font-extrabold text-cyan-950">Protocolo adotado: compressão de 3 pontos</h5>
                            <p className="mt-1 text-cyan-900">Tempo habitual: 2–5 minutos, realizado à beira-leito por emergencista ou intensivista treinado.</p>
                          </div>
                          <span className="w-fit rounded-full bg-cyan-700 px-3 py-1 text-xs font-bold text-white">POCUS inicial</span>
                        </div>
                        <ol className="mt-4 grid gap-3 md:grid-cols-3">
                          <li className="rounded-lg border border-cyan-200 bg-white p-3">
                            <strong className="block text-cyan-950">1. Veia femoral comum</strong>
                            <span className="mt-1 block">Avaliar na região inguinal, incluindo a junção safeno-femoral.</span>
                          </li>
                          <li className="rounded-lg border border-cyan-200 bg-white p-3">
                            <strong className="block text-cyan-950">2. Bifurcação femoral</strong>
                            <span className="mt-1 block">Avaliar a origem da veia femoral profunda e o início da veia femoral.</span>
                          </li>
                          <li className="rounded-lg border border-cyan-200 bg-white p-3">
                            <strong className="block text-cyan-950">3. Veia poplítea</strong>
                            <span className="mt-1 block">Comprimir na fossa poplítea e acompanhar até a trifurcação.</span>
                          </li>
                        </ol>
                        <p className="mt-3 font-semibold text-cyan-950">Em cada ponto: colabamento completo indica compressibilidade preservada; ausência de colabamento deve ser considerada TVP até prova em contrário.</p>
                      </section>

                      <section className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <h5 className="font-extrabold text-emerald-950">Vantagens no pronto-socorro</h5>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>Exame rápido, reprodutível e realizado à beira-leito.</li>
                            <li>Excelente desempenho para TVP proximal quando integrado ao Wells e ao D-dímero.</li>
                            <li>Adequado para decisão clínica imediata.</li>
                          </ul>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <h5 className="font-extrabold text-amber-950">Limitações do protocolo de 3 pontos</h5>
                          <p className="mt-2">Não avalia adequadamente TVP distal, veias tibiais, fibulares, musculares da panturrilha, ilíacas ou tromboses muito proximais.</p>
                          <p className="mt-2 font-semibold">POCUS negativo não exclui completamente TVP quando a probabilidade clínica é moderada ou alta.</p>
                        </div>
                      </section>

                      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                          <h5 className="font-extrabold text-slate-950">Comparação prática dos métodos</h5>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[680px] text-left text-sm">
                            <thead className="bg-slate-100 text-slate-950">
                              <tr>
                                <th className="px-4 py-3 font-extrabold">Característica</th>
                                <th className="px-4 py-3 font-extrabold">Compressão de 3 pontos</th>
                                <th className="px-4 py-3 font-extrabold">Varredura completa</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr><td className="px-4 py-3 font-semibold">Tempo</td><td className="px-4 py-3">2–5 minutos</td><td className="px-4 py-3">20–40 minutos</td></tr>
                              <tr><td className="px-4 py-3 font-semibold">Local</td><td className="px-4 py-3">Beira-leito</td><td className="px-4 py-3">Serviço de imagem/laboratório vascular</td></tr>
                              <tr><td className="px-4 py-3 font-semibold">Operador</td><td className="px-4 py-3">Emergencista ou intensivista treinado</td><td className="px-4 py-3">Radiologista, angiologista ou cirurgião vascular</td></tr>
                              <tr><td className="px-4 py-3 font-semibold">TVP proximal</td><td className="px-4 py-3 text-emerald-800">Excelente</td><td className="px-4 py-3 text-emerald-800">Excelente</td></tr>
                              <tr><td className="px-4 py-3 font-semibold">TVP distal</td><td className="px-4 py-3 text-amber-800">Limitada</td><td className="px-4 py-3 text-emerald-800">Excelente</td></tr>
                              <tr><td className="px-4 py-3 font-semibold">Toda a anatomia</td><td className="px-4 py-3">Não</td><td className="px-4 py-3">Sim</td></tr>
                              <tr><td className="px-4 py-3 font-semibold">Decisão imediata</td><td className="px-4 py-3 font-semibold text-blue-800">Método inicial do fluxo</td><td className="px-4 py-3">Exame complementar/confirmatório</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h5 className="font-extrabold text-slate-950">Integração com o escore de Wells</h5>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <p className="font-bold text-slate-950">Suspeita clínica</p>
                            <p className="mt-1">Aplicar Wells e definir a probabilidade pré-teste.</p>
                          </div>
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                            <p className="font-bold text-emerald-950">POCUS positivo</p>
                            <p className="mt-1">Veia não compressível: TVP proximal confirmada no contexto clínico e início da conduta correspondente.</p>
                          </div>
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="font-bold text-amber-950">POCUS negativo</p>
                            <p className="mt-1">Se a probabilidade clínica continuar alta, solicitar Doppler vascular formal ou repetir ultrassom em 5-7 dias.</p>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                        <h5 className="font-extrabold text-violet-950">Quando solicitar varredura venosa completa?</h5>
                        <p className="mt-2">A ultrassonografia por varredura completa (Whole-Leg Compression Ultrasound/Duplex Venoso) avalia todo o sistema venoso profundo, utiliza Doppler colorido e espectral e define melhor TVP distal, extensão do trombo e apresentações atípicas.</p>
                        <p className="mt-2 text-violet-950"><strong>Territórios avaliados:</strong> veias ilíacas quando acessíveis, femoral comum, femoral, femoral profunda, poplítea, tronco tibioperoneiro, tibiais anteriores e posteriores, fibulares e veias musculares do gastrocnêmio e sóleo.</p>
                        <ul className="mt-3 grid gap-2 md:grid-cols-2">
                          <li className="rounded-lg border border-violet-200 bg-white p-3">POCUS negativo com probabilidade clínica moderada ou alta.</li>
                          <li className="rounded-lg border border-violet-200 bg-white p-3">Suspeita de TVP distal ou trombose iliofemoral.</li>
                          <li className="rounded-lg border border-violet-200 bg-white p-3">POCUS inconclusivo ou tecnicamente limitado.</li>
                          <li className="rounded-lg border border-violet-200 bg-white p-3">Necessidade de mapear toda a extensão antes de intervenção.</li>
                        </ul>
                        <p className="mt-3 text-violet-950">A varredura completa costuma exigir operador especializado, serviço de imagem e cerca de 20–40 minutos. Se houver suspeita de trombose ilíaca não esclarecida, considerar também angio-TC venosa ou angio-RM conforme o contexto.</p>
                      </section>

                      <section className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                        <h5 className="font-extrabold text-rose-950">Mensagem prática</h5>
                        <p className="mt-2">
                          Neste fluxo, o exame inicial é o POCUS compressivo de 3 pontos. Veia não compressível confirma forte suspeita de TVP proximal; resultado negativo exige correlação com Wells e, quando a probabilidade permanecer moderada ou alta, varredura completa ou ultrassonografia seriada.
                        </p>
                      </section>
                    </div>

                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setTVPPocusInfoOpen(false)}
                        className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isGasometryFlow && gasometryStepNarrative && currentStepData.id !== 'coleta_parametros' && (
                <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <h4 className="text-sm font-bold text-indigo-800 mb-1">Interpretação automática com os valores já informados</h4>
                  <p className="text-sm text-indigo-900">{gasometryStepNarrative}</p>
                </div>
              )}

              {isAsthmaFlow && asthmaStepNarrative && currentStepData.id !== 'asma_avaliacao_inicial' && currentStepData.id !== 'asma_reavaliacao_1h' && (
                <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                  <h4 className="text-sm font-bold text-cyan-800 mb-1">Interpretação automática com os valores já informados</h4>
                  <p className="text-sm text-cyan-900">{asthmaStepNarrative}</p>
                </div>
              )}

              {/* Opções */}
              {(() => {
                const displayedOptions =
                  isGasometryFlow && gasometryStepOptions !== null
                    ? gasometryStepOptions
                    : isAsthmaFlow && asthmaStepOptions !== null
                      ? asthmaStepOptions
                      : isBellTreatmentStep
                          ? currentStepData.options?.filter((option) => option.value !== 'prescricao')
                        : flowchart.id === 'pneumonia' && currentStepData.id === 'pac_destino_protocolo' && (pneumoniaAtsIdsaSevere || pneumoniaCurbIndicatesHospitalization)
                          ? currentStepData.options?.filter((option) => option.value !== 'ambulatorio')
                          : currentStepData.options
                if (!(displayedOptions && displayedOptions.length > 0) || isTVPLegSelection || isTVPPhysicalExamStep || isTEPAssessmentStep || isBellSideSelection || isBellPhysicalExamStep || isBellCriteriaStep || isBellSupportStep || isBellRedFlagsStep || isBellHouseStep || isBellTreatmentStep || isBellDynamicDocumentStep || isTVPWellsScore || isTVPContraCheck || isTVPTreatmentInitial || isDpocSinaisGravidade || isDpocAnthonisen || isInfluenzaSeverityStep || isInfluenzaRiskStep || isInfluenzaICUStep || isAnaphylaxisCriteriaStep || isAnaphylaxisAdjunctStep || isPancreatitisBisapStep || isPancreatitisMarshallStep || isCholangitisDiagnosisStep || isCholangitisSeverityStep || isCholecystitisSeverityStep || isAppendicitisAlvaradoStep || isLombalgiaRiskStep) return null
                return (
                <div className="grid gap-4">
                  {displayedOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={clsx(
                        "w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group backdrop-blur-sm",
                        option.critical 
                          ? "bg-red-50/90 border-red-200/50 hover:border-red-400 hover:bg-red-100/90 shadow-sm"
                          : option.requiresImmediateAction
                          ? "bg-orange-50/90 border-orange-200/50 hover:border-orange-400 hover:bg-orange-100/90 shadow-sm"
                          : "bg-white/70 dark:bg-slate-800/70 border-white/40 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-glass-hover hover:bg-white/90 dark:hover:bg-slate-800/90"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                          <span className={clsx(
                            "text-lg font-semibold block mb-1",
                            option.critical ? "text-red-900" : 
                            option.requiresImmediateAction ? "text-orange-900" : "text-slate-800"
                          )}>
                            {option.text}
                          </span>
                          {option.description && (
                            <span className={clsx(
                              "text-sm block",
                              option.critical ? "text-red-700" : "text-slate-500"
                            )}>
                              {option.description}
                            </span>
                          )}
                        </div>
                        
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ml-4",
                          option.critical 
                            ? "bg-red-100 text-red-600 group-hover:bg-red-200" 
                            : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                        )}>
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Background decoration for critical options */}
                      {option.critical && (
                        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500 opacity-5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                      )}
                      
                      {option.critical && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-red-100">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Requer Atenção Imediata</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
                )
              })()}

              {isGasometryFlow && gasometryStepOptions !== null && gasometryStepOptions.length === 0 && currentStepData.id !== 'coleta_parametros' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Nenhum critério foi atendido com os valores atuais para esta etapa. Revise os parâmetros em Coleta de Parâmetros.
                </div>
              )}

              {isAsthmaFlow && asthmaStepOptions !== null && asthmaStepOptions.length === 0 && currentStepData.id !== 'asma_avaliacao_inicial' && currentStepData.id !== 'asma_reavaliacao_1h' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Nenhum critério foi atendido com os valores atuais para esta etapa. Revise os parâmetros de avaliação da asma.
                </div>
              )}

              {isInfluenzaAmbulatoryFinalStep && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-cyan-900">
                          Prescrição ambulatorial da influenza
                        </h4>
                        <p className="mt-1 text-sm text-cyan-900">
                          Gere a prescrição para visualizar, copiar e também deixar registrada no receituário do dashboard antes de finalizar.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenInfluenzaPrescription}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                          hasInfluenzaPrescriptionForCurrentStep
                            ? 'border border-cyan-300 bg-white text-cyan-800 hover:bg-cyan-100'
                            : 'bg-cyan-600 text-white hover:bg-cyan-700'
                        )}
                      >
                        {hasInfluenzaPrescriptionForCurrentStep ? 'Ver prescrição' : 'Gerar prescrição'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">Orientações registradas</h4>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                        <strong>Cuidados domiciliares</strong>
                        <p className="mt-1">Hidratação, alimentação conforme tolerância, repouso relativo, controle de febre/dor e higiene nasal.</p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                        <strong>Retorno imediato</strong>
                        <p className="mt-1">Dispneia, queda de saturação, confusão, sonolência excessiva, desidratação, vômitos persistentes, febre persistente ou piora do estado geral.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <motion.button
                      type="button"
                      disabled={!hasInfluenzaPrescriptionForCurrentStep}
                      onClick={() => handleAnswer(
                        currentStepData.id === 'influenza_ambulatorial_oseltamivir'
                          ? 'influenza_ambulatorial_oseltamivir_concluido'
                          : 'influenza_ambulatorial_sintomaticos_concluido',
                        currentStepData.id === 'influenza_ambulatorial_oseltamivir'
                          ? 'alta_ambulatorial_oseltamivir_prescrita'
                          : 'alta_ambulatorial_sintomatica_prescrita'
                      )}
                      className={clsx(
                        'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors sm:w-auto',
                        hasInfluenzaPrescriptionForCurrentStep
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'cursor-not-allowed bg-slate-200 text-slate-500'
                      )}
                      whileHover={hasInfluenzaPrescriptionForCurrentStep ? { scale: 1.02 } : {}}
                      whileTap={hasInfluenzaPrescriptionForCurrentStep ? { scale: 0.98 } : {}}
                    >
                      Finalizar atendimento ambulatorial
                      <CheckCircle className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              )}

              {isSinusitisPrescriptionFinalStep && (
                <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-teal-900">
                        Prescrição da rinossinusite
                      </h4>
                      <p className="mt-1 text-sm text-teal-900">
                        Gera a receita conforme a classificação atual e registra no receituário do dashboard.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenSinusitisPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        sinusitisPrescriptionGeneratedSteps[currentStepData.id] || hasSinusitisPrescriptionSet(getPersistedSinusitisPrescriptions(), sinusitisCurrentEtiology)
                          ? 'border border-teal-300 bg-white text-teal-800 hover:bg-teal-100'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      )}
                    >
                      {sinusitisPrescriptionGeneratedSteps[currentStepData.id] || hasSinusitisPrescriptionSet(getPersistedSinusitisPrescriptions(), sinusitisCurrentEtiology) ? 'Prescrição' : 'Gerar prescrição'}
                    </button>
                  </div>
                </div>
              )}

              {isFaringoamigdalitePrescriptionFinalStep && (
                <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-sky-900">
                        Prescrição da faringoamigdalite
                      </h4>
                      <p className="mt-1 text-sm text-sky-900">
                        Gera a receita conforme a faixa do Centor Modificado e registra no receituário do dashboard.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenFaringoamigdalitePrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        faringoamigdalitePrescriptionGeneratedSteps[currentStepData.id] || hasFaringoamigdalitePrescriptionSet(getPersistedFaringoamigdalitePrescriptions(), faringoamigdaliteCurrentDisposition)
                          ? 'border border-sky-300 bg-white text-sky-800 hover:bg-sky-100'
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      )}
                    >
                      {faringoamigdalitePrescriptionGeneratedSteps[currentStepData.id] || hasFaringoamigdalitePrescriptionSet(getPersistedFaringoamigdalitePrescriptions(), faringoamigdaliteCurrentDisposition) ? 'Prescrição' : 'Gerar prescrição'}
                    </button>
                  </div>
                </div>
              )}

              {isMonoartritePrescriptionFinalStep && (
                <div className={clsx(
                  'mt-6 rounded-2xl border p-5',
                  monoartriteCurrentDisposition === 'septic'
                    ? 'border-red-200 bg-red-50'
                    : 'border-slate-200 bg-slate-50'
                )}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className={clsx(
                        'text-sm font-bold uppercase tracking-wide',
                        monoartriteCurrentDisposition === 'septic' ? 'text-red-900' : 'text-slate-900'
                      )}>
                        {monoartriteCurrentDisposition === 'septic' ? 'Conduta da artrite séptica' : 'Prescrição da gota'}
                      </h4>
                      <p className={clsx('mt-1 text-sm', monoartriteCurrentDisposition === 'septic' ? 'text-red-900' : 'text-slate-800')}>
                        {monoartriteCurrentDisposition === 'septic'
                          ? 'Gera a conduta inicial com antibiótico EV e registra no receituário do dashboard.'
                          : 'Gera a prescrição prática para crise de gota e registra no receituário do dashboard.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenMonoartritePrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        monoartritePrescriptionGeneratedSteps[currentStepData.id] || hasMonoartritePrescriptionSet(getPersistedMonoartritePrescriptions(), monoartriteCurrentDisposition)
                          ? monoartriteCurrentDisposition === 'septic'
                            ? 'border border-red-300 bg-white text-red-800 hover:bg-red-100'
                            : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                          : monoartriteCurrentDisposition === 'septic'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-slate-700 text-white hover:bg-slate-800'
                      )}
                    >
                      {monoartritePrescriptionGeneratedSteps[currentStepData.id] || hasMonoartritePrescriptionSet(getPersistedMonoartritePrescriptions(), monoartriteCurrentDisposition) ? 'Conduta' : 'Gerar conduta'}
                    </button>
                  </div>
                </div>
              )}

              {isAnsiedadeMedicationStep && (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-blue-900">
                        Conduta medicamentosa da ansiedade
                      </h4>
                      <p className="mt-1 text-sm text-blue-900">
                        Gera a conduta medicamentosa, registra no receituário do dashboard e permite copiar para uso rápido.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAnsiedadePrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        ansiedadePrescriptionGenerated || hasAnsiedadePrescriptionSet(getPersistedAnsiedadePrescriptions())
                          ? 'border border-blue-300 bg-white text-blue-800 hover:bg-blue-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {ansiedadePrescriptionGenerated || hasAnsiedadePrescriptionSet(getPersistedAnsiedadePrescriptions()) ? 'Conduta' : 'Gerar conduta'}
                    </button>
                  </div>
                </div>
              )}

              {ansiedadeGuideOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-950">Guia rápido - Crise de ansiedade</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          Roteiro prático para diferenciar ataque de pânico de causas orgânicas e conduzir o manejo inicial.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnsiedadeGuideOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                        title="Fechar"
                        aria-label="Fechar guia rápido de crise de ansiedade"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-5 overflow-y-auto p-5 text-sm leading-relaxed text-slate-700">
                      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
                        <h5 className="font-extrabold">Antes de chamar de ansiedade</h5>
                        <p className="mt-2">
                          Ataque de pânico pode cursar com taquicardia, dispneia, dor torácica, tremores, náusea, parestesias, medo de morrer, despersonalização ou desrealização. A prioridade no pronto-socorro é reconhecer o padrão e excluir sinais de causa orgânica grave.
                        </p>
                      </section>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
                          <h5 className="font-extrabold">Sinais de alerta orgânico</h5>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {ANSIEDADE_ORGANIC_RED_FLAGS.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </section>
                        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                          <h5 className="font-extrabold">1ª linha: não medicamentosa</h5>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {ANSIEDADE_NON_PHARMACOLOGICAL_STEPS.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </section>
                      </div>

                      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                        <div className="bg-amber-100 px-4 py-3 font-extrabold text-slate-950">
                          2ª linha: benzodiazepínico em dose baixa e reavaliação
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[720px] text-left">
                            <thead className="bg-slate-100 text-slate-900">
                              <tr>
                                <th className="px-4 py-3 font-bold">Opção</th>
                                <th className="px-4 py-3 font-bold">Dose</th>
                                <th className="px-4 py-3 font-bold">Observação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr>
                                <td className="px-4 py-3 font-bold">Clonazepam</td>
                                <td className="px-4 py-3">0,25 a 0,5 mg VO</td>
                                <td className="px-4 py-3">Reavaliar resposta, sedação e segurança respiratória.</td>
                              </tr>
                              {getAnsiedadeMedicationAlternatives().map((item) => (
                                <tr key={item}>
                                  <td className="px-4 py-3 font-bold">Alternativa</td>
                                  <td className="px-4 py-3" colSpan={2}>{item}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
                        <h5 className="font-extrabold">Quando acionar saúde mental</h5>
                        <p className="mt-2">
                          Solicitar avaliação psicológica/psiquiátrica se houver recorrência importante, sofrimento funcional, risco psicossocial, ideação suicida, psicose, intoxicação, risco de auto/heteroagressão ou se o serviço estiver disponível para seguimento no pronto-socorro.
                        </p>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {isVertigemPrescriptionFinalStep && (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-blue-900">
                        Receita da síndrome vertiginosa
                      </h4>
                      <p className="mt-1 text-sm text-blue-900">
                        Gera a receita sintomática e registra no receituário do dashboard. As manobras/imagens podem ser adicionadas depois no bloco visual do fluxo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenVertigemPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        vertigemPrescriptionGeneratedSteps[currentStepData.id] || hasVertigemPrescriptionSet(getPersistedVertigemPrescriptions(), vertigemCurrentDisposition)
                          ? 'border border-blue-300 bg-white text-blue-800 hover:bg-blue-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {vertigemPrescriptionGeneratedSteps[currentStepData.id] || hasVertigemPrescriptionSet(getPersistedVertigemPrescriptions(), vertigemCurrentDisposition) ? 'Receita' : 'Gerar receita'}
                    </button>
                  </div>
                </div>
              )}

              {isCefaleiaPrescriptionFinalStep && (
                <div className={clsx(
                  'mt-6 rounded-2xl border p-5',
                  cefaleiaCurrentDisposition === 'migranea'
                    ? 'border-rose-200 bg-rose-50'
                    : cefaleiaCurrentDisposition === 'salvas'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-emerald-200 bg-emerald-50'
                )}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className={clsx(
                        'text-sm font-bold uppercase tracking-wide',
                        cefaleiaCurrentDisposition === 'migranea'
                          ? 'text-rose-900'
                          : cefaleiaCurrentDisposition === 'salvas'
                            ? 'text-amber-950'
                            : 'text-emerald-900'
                      )}>
                        Receita da cefaleia primária
                      </h4>
                      <p className={clsx(
                        'mt-1 text-sm',
                        cefaleiaCurrentDisposition === 'migranea'
                          ? 'text-rose-900'
                          : cefaleiaCurrentDisposition === 'salvas'
                            ? 'text-amber-950'
                            : 'text-emerald-900'
                      )}>
                        Gera a receita conforme o fenótipo atual e registra no receituário do dashboard. Não usar opioides.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCefaleiaPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        cefaleiaPrescriptionGeneratedSteps[currentStepData.id] || hasCefaleiaPrescriptionSet(getPersistedCefaleiaPrescriptions(), cefaleiaCurrentDisposition)
                          ? cefaleiaCurrentDisposition === 'migranea'
                            ? 'border border-rose-300 bg-white text-rose-800 hover:bg-rose-100'
                            : cefaleiaCurrentDisposition === 'salvas'
                              ? 'border border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
                              : 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100'
                          : cefaleiaCurrentDisposition === 'migranea'
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : cefaleiaCurrentDisposition === 'salvas'
                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      )}
                    >
                      {cefaleiaPrescriptionGeneratedSteps[currentStepData.id] || hasCefaleiaPrescriptionSet(getPersistedCefaleiaPrescriptions(), cefaleiaCurrentDisposition) ? 'Receita' : 'Gerar receita'}
                    </button>
                  </div>
                </div>
              )}

              {isAgitacaoPrescriptionFinalStep && (
                <div className={clsx(
                  'mt-6 rounded-2xl border p-5',
                  agitacaoCurrentDisposition === 'grave_im'
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                )}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className={clsx(
                        'text-sm font-bold uppercase tracking-wide',
                        agitacaoCurrentDisposition === 'grave_im' ? 'text-red-900' : 'text-amber-950'
                      )}>
                        Conduta da agitação psicomotora
                      </h4>
                      <p className={clsx('mt-1 text-sm', agitacaoCurrentDisposition === 'grave_im' ? 'text-red-900' : 'text-amber-950')}>
                        Gera a conduta medicamentosa e registra no receituário do dashboard. Monitorar sedação, sinais vitais e causa clínica.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAgitacaoPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        agitacaoPrescriptionGeneratedSteps[currentStepData.id] || hasAgitacaoPrescriptionSet(getPersistedAgitacaoPrescriptions(), agitacaoCurrentDisposition)
                          ? agitacaoCurrentDisposition === 'grave_im'
                            ? 'border border-red-300 bg-white text-red-800 hover:bg-red-100'
                            : 'border border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
                          : agitacaoCurrentDisposition === 'grave_im'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                      )}
                    >
                      {agitacaoPrescriptionGeneratedSteps[currentStepData.id] || hasAgitacaoPrescriptionSet(getPersistedAgitacaoPrescriptions(), agitacaoCurrentDisposition) ? 'Conduta' : 'Gerar conduta'}
                    </button>
                  </div>
                </div>
              )}

              {isPepHivPrescriptionFinalStep && (
                <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-cyan-950">
                        Receita de PEP ao HIV
                      </h4>
                      <p className="mt-1 text-sm text-cyan-950">
                        Gera TDF/3TC + dolutegravir por 28 dias, antiemético se necessário e orientações de acompanhamento sorológico.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenPepHivPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        pepHivPrescriptionGenerated || hasPepHivPrescriptionSet(getPersistedPepHivPrescriptions())
                          ? 'border border-cyan-300 bg-white text-cyan-900 hover:bg-cyan-100'
                          : 'bg-cyan-700 text-white hover:bg-cyan-800'
                      )}
                    >
                      {pepHivPrescriptionGenerated || hasPepHivPrescriptionSet(getPersistedPepHivPrescriptions()) ? 'Receita' : 'Gerar receita'}
                    </button>
                  </div>
                </div>
              )}

              {pepHivGuideOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                  <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-950">Guia rápido - PEP ao HIV</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          Referência prática para decisão, prescrição e acompanhamento no pronto-socorro.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPepHivGuideOpen(false)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                        title="Fechar"
                        aria-label="Fechar guia rápido de PEP ao HIV"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-5 overflow-y-auto p-5 text-sm leading-relaxed text-slate-700">
                      <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
                        <h5 className="font-extrabold">Decisão em 5 perguntas</h5>
                        <ol className="mt-2 list-decimal space-y-1 pl-5">
                          <li>Houve material biológico com risco?</li>
                          <li>Houve tipo de exposição com risco?</li>
                          <li>O atendimento ocorreu em até 72 horas?</li>
                          <li>A pessoa exposta tem teste de HIV negativo/não reagente?</li>
                          <li>A fonte é positiva, reagente, desconhecida ou teve risco nos últimos 30 dias?</li>
                        </ol>
                      </section>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
                          <h5 className="font-extrabold">Materiais com risco</h5>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {PEP_HIV_RISK_MATERIALS.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </section>
                        <section className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-950">
                          <h5 className="font-extrabold">Exposições com risco</h5>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {PEP_HIV_RISK_EXPOSURES.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </section>
                      </div>

                      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                        <div className="bg-yellow-100 px-4 py-3 font-extrabold text-slate-950">
                          Esquemas de PEP - iniciar no máximo até 72h após exposição
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-slate-100 text-slate-900">
                              <tr>
                                <th className="px-4 py-3 font-bold">Situação</th>
                                <th className="px-4 py-3 font-bold">Esquema</th>
                                <th className="px-4 py-3 font-bold">Posologia</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr>
                                <td className="px-4 py-3 font-bold">Preferencial</td>
                                <td className="px-4 py-3">Tenofovir/lamivudina + dolutegravir</td>
                                <td className="px-4 py-3">TDF/3TC 300/300 mg VO 1x/dia + DTG 50 mg VO 1x/dia por 28 dias.</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 font-bold">Se impossibilidade de tenofovir</td>
                                <td className="px-4 py-3">Zidovudina/lamivudina + dolutegravir</td>
                                <td className="px-4 py-3">AZT/3TC 300/150 mg VO 12/12h + DTG 50 mg VO 1x/dia por 28 dias.</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 font-bold">Se impossibilidade de dolutegravir</td>
                                <td className="px-4 py-3">Tenofovir/lamivudina + darunavir/ritonavir</td>
                                <td className="px-4 py-3">TDF/3TC 1x/dia + DRV 800 mg + RTV 100 mg VO 1x/dia por 28 dias.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                        <h5 className="font-extrabold">Orientações essenciais</h5>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {PEP_HIV_FOLLOW_UP_ORIENTATIONS.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {isAnaphylaxisDischargeStep && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-red-900">
                        Orientações pós-anafilaxia
                      </h4>
                      <p className="mt-1 text-sm text-red-900">
                        Gerar prescrição de alta apenas após estabilização e observação mínima.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAnaphylaxisPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        anaphylaxisPrescriptionGenerated || hasAnaphylaxisDischargePrescriptionSet(getPersistedAnaphylaxisPrescriptions())
                          ? 'border border-red-300 bg-white text-red-800 hover:bg-red-100'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      )}
                    >
                      {anaphylaxisPrescriptionGenerated || hasAnaphylaxisDischargePrescriptionSet(getPersistedAnaphylaxisPrescriptions()) ? 'Prescrição' : 'Gerar prescrição'}
                    </button>
                  </div>
                </div>
              )}

              {isPancreatitisTreatmentFinalStep && (
                <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-orange-900">
                          Prescrição hospitalar da pancreatite
                        </h4>
                        <p className="mt-1 text-sm text-orange-900">
                          Suporte inicial: dieta, hidratação por metas, analgesia e antiemético. Antibiótico somente se infecção sobreposta.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenPancreatitisPrescription}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                          pancreatitisPrescriptionGenerated || hasPancreatitisPrescriptionSet(getPersistedPancreatitisPrescriptions())
                            ? 'border border-orange-300 bg-white text-orange-800 hover:bg-orange-100'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        )}
                      >
                        {pancreatitisPrescriptionGenerated || hasPancreatitisPrescriptionSet(getPersistedPancreatitisPrescriptions()) ? 'Prescrição' : 'Gerar prescrição'}
                      </button>
                    </div>
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-950">
                      <input
                        type="checkbox"
                        checked={pancreatitisIncludeAntibiotic}
                        onChange={(e) => setPancreatitisIncludeAntibiotic(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Incluir antibiótico por evidência de infecção sobreposta/necrose infectada</span>
                    </label>
                  </div>
                </div>
              )}

              {isCholangitisTreatmentFinalStep && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-900">
                          Prescrição hospitalar da colangite/coledocolitíase
                        </h4>
                        <p className="mt-1 text-sm text-emerald-900">
                          Dieta zero, hidratação, antibiótico precoce, analgesia e avaliação para drenagem/CPRE.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenCholangitisPrescription}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                          cholangitisPrescriptionGenerated || hasCholangitisPrescriptionSet(getPersistedCholangitisPrescriptions())
                            ? 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        )}
                      >
                        {cholangitisPrescriptionGenerated || hasCholangitisPrescriptionSet(getPersistedCholangitisPrescriptions()) ? 'Prescrição' : 'Gerar prescrição'}
                      </button>
                    </div>

                    {currentStepData?.id === 'colangite_moderada' && (
                      <div className="rounded-xl border border-emerald-200 bg-white p-4">
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-900">Esquema antibiótico sugerido</h5>
                        <div className="grid gap-2 md:grid-cols-2">
                          {[
                            { value: 'cefepime_metronidazole' as const, label: 'Cefepime + Metronidazol' },
                            { value: 'piperacillin_tazobactam' as const, label: 'Piperacilina + Tazobactam' }
                          ].map((option) => (
                            <label key={option.value} className={clsx(
                              'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm',
                              cholangitisAntibioticScheme === option.value ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                            )}>
                              <input
                                type="radio"
                                name="cholangitis-antibiotic"
                                checked={cholangitisAntibioticScheme === option.value}
                                onChange={() => setCholangitisAntibioticScheme(option.value)}
                                className="h-4 w-4 border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isCholecystitisTreatmentFinalStep && (
                <div className="mt-6 rounded-2xl border border-lime-200 bg-lime-50 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-lime-900">
                          Prescrição hospitalar da colecistite
                        </h4>
                        <p className="mt-1 text-sm text-lime-900">
                          Dieta zero, hidratação EV, analgesia, antibiótico e avaliação da cirurgia geral.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleOpenCholecystitisPrescription}
                          className={clsx(
                            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                            cholecystitisPrescriptionGenerated || hasCholecystitisPrescriptionSet(getPersistedCholecystitisPrescriptions())
                              ? 'border border-lime-300 bg-white text-lime-800 hover:bg-lime-100'
                              : 'bg-lime-600 text-white hover:bg-lime-700'
                          )}
                        >
                          {cholecystitisPrescriptionGenerated || hasCholecystitisPrescriptionSet(getPersistedCholecystitisPrescriptions()) ? 'Prescrição' : 'Gerar prescrição'}
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenCholecystitisSurgeryConsult}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-lime-300 bg-white px-4 py-2.5 text-sm font-semibold text-lime-800 transition-colors hover:bg-lime-100"
                        >
                          Interconsulta
                        </button>
                      </div>
                    </div>

                    {currentStepData?.id === 'cole_grave' && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-red-900">
                          Critérios para avaliação de UTI
                        </h5>
                        <p className="text-sm font-semibold text-red-950">
                          Todo paciente com Colecistite Aguda Grau III (Tokyo Guidelines) ou necessidade de suporte avançado de órgãos deve ser considerado para avaliação e internação em UTI.
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
                            <li>PAS &lt; 90 mmHg, PAM &lt; 65 mmHg ou necessidade de vasopressor.</li>
                            <li>VM invasiva, VNI contínua, CNAF, hipoxemia importante ou PaO₂/FiO₂ &lt; 300.</li>
                            <li>Rebaixamento do nível de consciência, delirium séptico ou Glasgow reduzido.</li>
                            <li>IRA significativa ou creatinina &gt; 2 mg/dL.</li>
                          </ul>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
                            <li>INR &gt; 1,5 não relacionado a anticoagulantes.</li>
                            <li>Plaquetas &lt; 100.000/mm³.</li>
                            <li>Sepse, choque séptico ou lactato elevado com disfunção orgânica.</li>
                            <li>Gangrena, perfuração, empiema, colecistite enfisematosa, peritonite biliar ou abscesso perivesicular.</li>
                          </ul>
                        </div>
                        <p className="mt-3 text-xs text-red-800">
                          Paciente frágil, cardiopata grave, cirrótico avançado, oncológico ou imunossuprimido pode demandar monitorização intensiva mesmo antes de disfunção orgânica estabelecida.
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl border border-lime-200 bg-white p-4">
                      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-lime-900">
                        Opções de antibiótico conforme classificação de Tokyo
                      </h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        {(['Monoterapia', 'Associação'] as const).map((group) => {
                          const options = getCholecystitisAntibioticChoices(currentStepData?.id).filter((option) => option.group === group)
                          if (options.length === 0) return null

                          return (
                            <div key={group} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">{group}</p>
                              <div className="space-y-2">
                                {options.map((option) => (
                                  <label key={option.value} className={clsx(
                                    'flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm',
                                    cholecystitisAntibioticScheme === option.value ? 'border-lime-300 bg-lime-50 text-lime-950' : 'border-slate-100 bg-white text-slate-700 hover:bg-lime-50'
                                  )}>
                                    <input
                                      type="radio"
                                      name="cholecystitis-antibiotic"
                                      checked={cholecystitisAntibioticScheme === option.value}
                                      onChange={() => setCholecystitisAntibioticScheme(option.value)}
                                      className="mt-1 h-4 w-4 border-lime-300 text-lime-600 focus:ring-lime-500"
                                    />
                                    <span>{option.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <p className="mt-3 text-xs text-slate-600">
                        Escolher um dos esquemas conforme alergias, função renal, perfil de susceptibilidade microbiológica, culturas e protocolo institucional.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isAppendicitisTreatmentFinalStep && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-rose-900">
                          Prescrição hospitalar da apendicite
                        </h4>
                        <p className="mt-1 text-sm text-rose-900">
                          {currentStepData?.id === 'apend_baixo_risco'
                            ? 'Baixo risco: sintomáticos, sinais de alarme e retorno.'
                            : 'Dieta zero, hidratação EV, analgesia, antiemético e antibiótico quando houver suspeita/indicação cirúrgica.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAppendicitisPrescription}
                        className={clsx(
                          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                          appendicitisPrescriptionGenerated || hasAppendicitisPrescriptionSet(getPersistedAppendicitisPrescriptions())
                            ? 'border border-rose-300 bg-white text-rose-800 hover:bg-rose-100'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        )}
                      >
                        {appendicitisPrescriptionGenerated || hasAppendicitisPrescriptionSet(getPersistedAppendicitisPrescriptions()) ? 'Prescrição' : 'Gerar prescrição'}
                      </button>
                    </div>

                    {currentStepData?.id !== 'apend_baixo_risco' && (
                    <div className="rounded-xl border border-rose-200 bg-white p-4">
                      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wide text-rose-900">Esquema antibiótico sugerido</h5>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-rose-900">
                          <input
                            type="checkbox"
                            checked={appendicitisIncludeAntibiotics}
                            onChange={(e) => setAppendicitisIncludeAntibiotics(e.target.checked)}
                            className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span>Incluir antibiótico venoso</span>
                        </label>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {[
                          { value: 'ceftriaxone_metronidazole' as const, label: 'Ceftriaxona + Metronidazol' },
                          { value: 'ciprofloxacin_metronidazole' as const, label: 'Ciprofloxacino + Metronidazol' },
                          { value: 'ampicillin_sulbactam' as const, label: 'Amoxicilina + Sulbactam' },
                          { value: 'piperacillin_tazobactam' as const, label: 'Piperacilina + Tazobactam' }
                        ].map((option) => (
                          <label key={option.value} className={clsx(
                            'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm',
                            appendicitisAntibioticScheme === option.value ? 'border-rose-300 bg-rose-50 text-rose-950' : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white',
                            !appendicitisIncludeAntibiotics && 'opacity-50'
                          )}>
                            <input
                              type="radio"
                              name="appendicitis-antibiotic"
                              checked={appendicitisAntibioticScheme === option.value}
                              disabled={!appendicitisIncludeAntibiotics}
                              onChange={() => setAppendicitisAntibioticScheme(option.value)}
                              className="h-4 w-4 border-rose-300 text-rose-600 focus:ring-rose-500"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {getAppendicitisAntibioticOptions().map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    )}
                  </div>
                </div>
              )}

              {isAnaphylaxisRepeatAdrenalineFinalStep && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-red-900">
                          Como prescrever?
                        </h4>
                        <p className="mt-1 text-sm text-red-900">
                          Prescrição rápida para repetir adrenalina IM em paciente sem resposta clínica.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnaphylaxisRepeatPrescriptionOpen((prev) => !prev)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        <Clipboard className="h-4 w-4" />
                        Como prescrever?
                      </button>
                    </div>

                    {anaphylaxisRepeatPrescriptionOpen && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <p className="text-base font-semibold leading-relaxed text-slate-900">
                            {getAnaphylaxisRepeatPrescriptionText()}
                          </p>
                          <button
                            type="button"
                            onClick={copyAnaphylaxisRepeatPrescriptionText}
                            className={clsx(
                              'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                              anaphylaxisRepeatPrescriptionCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            )}
                          >
                            {anaphylaxisRepeatPrescriptionCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                            {anaphylaxisRepeatPrescriptionCopied ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLombalgiaConservativeFinalStep && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                        Prescrição para lombalgia sem red flags
                      </h4>
                      <p className="mt-1 text-sm text-slate-700">
                        AINE como primeira linha, relaxante se contratura e opioide fraco apenas se dor intensa refratária.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenLombalgiaPrescription}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        lombalgiaPrescriptionGenerated || hasLombalgiaPrescriptionSet(getPersistedLombalgiaPrescriptions())
                          ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                          : 'bg-slate-800 text-white hover:bg-slate-900'
                      )}
                    >
                      {lombalgiaPrescriptionGenerated || hasLombalgiaPrescriptionSet(getPersistedLombalgiaPrescriptions()) ? 'Prescrição' : 'Gerar prescrição'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step Final */}
              {flowchart.finalSteps.includes(currentStep) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "mt-6 rounded-2xl p-6",
                    isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                      ? 'border border-amber-200 bg-amber-50'
                      : 'border border-green-200 bg-green-50'
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={clsx(
                      "flex h-16 w-16 items-center justify-center rounded-full",
                      isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                        ? 'bg-amber-100'
                        : 'bg-green-100'
                    )}>
                      {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto') ? (
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className={clsx(
                        "text-xl font-bold",
                        isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'text-amber-800'
                          : 'text-green-800'
                      )}>
                        {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'Distúrbio Misto Identificado'
                          : 'Fluxograma Concluído'}
                      </h3>
                    </div>
                    {flowchart.id === 'anafilaxia' && ['ana_observacao_alta', 'ana_internacao_via_aerea_choque'].includes(currentStep) && (
                      <figure className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <img
                          src={currentStep === 'ana_observacao_alta' ? '/alta-apos-melhora.png' : '/paciente-critico.png'}
                          alt={currentStep === 'ana_observacao_alta' ? 'Alta após melhora clínica da anafilaxia' : 'Paciente crítico em manejo avançado'}
                          className="h-44 w-full object-contain sm:h-52"
                        />
                      </figure>
                    )}
                    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Relatório clínico</p>
                          <h4 className="mt-1 text-lg font-extrabold text-slate-950">{flowchart.id === 'paralisia_bell' ? 'Relatório clínico - Paralisia de Bell' : clinicalSummaryData.finalTitle}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={copyFinalClinicalReportText}
                          className={clsx(
                            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors',
                            clinicalSummaryCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          )}
                        >
                          {clinicalSummaryCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                          {clinicalSummaryCopied ? 'Copiado' : 'Copiar resumo'}
                        </button>
                      </div>
                      <div className="whitespace-pre-line p-5 text-sm leading-8 text-slate-800">
                        {finalClinicalReportText}
                      </div>
                    </div>
                    {flowchart.id === 'tvp' && currentStep === 'tvp_internacao_investigar_tep' && onSwitchFlowchart && (
                      <div className="w-full rounded-2xl border border-red-300 bg-red-50 p-5 text-left shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-extrabold uppercase tracking-wide text-red-900">
                              Continuar investigação de embolia pulmonar
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-red-800">
                              Os dados de identificação, admissão e sinais vitais deste paciente serão mantidos. Não será necessário preencher um novo cadastro.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSwitchFlowchart('tep')}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-red-800"
                          >
                            Iniciar fluxograma de TEP
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={onComplete}
                      className={clsx(
                        "mt-4 flex items-center space-x-2 rounded-xl px-8 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl",
                        isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto') ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      <span>Finalizar Atendimento</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {rabiesBiteImageOpen && (
          <ZoomableImageModal
            title="Referência visual - mordedura"
            description="Imagem de apoio para classificar o animal agressor como observável ou não observável durante a avaliação da exposição."
            src="/mordedura.jpeg"
            alt="Imagem de referência sobre mordedura"
            onClose={() => setRabiesBiteImageOpen(false)}
            maxWidthClassName="max-w-5xl"
          />
        )}

        {anaphylaxisCriteriaInfo && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <h4 className="text-base font-extrabold text-slate-950">{anaphylaxisCriteriaInfo.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{anaphylaxisCriteriaInfo.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnaphylaxisCriteriaInfo(null)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  title="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {anaphylaxisCriteriaInfo.images.map((image) => (
                    <figure key={image.src} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-44 w-full bg-slate-50 object-contain p-2"
                      />
                      <figcaption className="border-t border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                        {image.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {pneumoniaRxInfoOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-950">Radiografia de Tórax (RX de Tórax)</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Exame tradicional na avaliação da PAC, amplamente disponível, rápido e útil para confirmar infiltrado pulmonar compatível com infecção.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPneumoniaRxInfoOpen(false)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  title="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-slate-700">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <p>
                    A radiografia de tórax é o exame de imagem mais tradicional na avaliação da pneumonia adquirida na comunidade (PAC), sendo amplamente disponível, de rápida execução e útil para confirmar a presença de infiltrado pulmonar compatível com infecção.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-950">Está indicada principalmente nos seguintes cenários:</h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Suspeita clínica de pneumonia adquirida na comunidade.</li>
                    <li>Avaliação inicial de pacientes com sintomas respiratórios moderados ou graves, especialmente quando há necessidade de confirmação diagnóstica.</li>
                    <li>Estratificação de gravidade e investigação de complicações, como derrame pleural ou acometimento multilobar.</li>
                    <li>Pacientes hospitalizados com suspeita de PAC.</li>
                    <li>Casos em que o diagnóstico diferencial é relevante, incluindo insuficiência cardíaca, atelectasia, neoplasias ou outras doenças pulmonares.</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-slate-950">Limitações do RX de Tórax</h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Menor sensibilidade quando comparado ao ultrassom pulmonar (POCUS) e à tomografia computadorizada.</li>
                    <li>Pode não detectar pneumonias pequenas, periféricas, basais ou retrocardíacas.</li>
                    <li>Exames realizados em leito (AP portátil) apresentam menor qualidade diagnóstica.</li>
                    <li>Um RX inicial normal não exclui completamente pneumonia, especialmente nas fases precoces da doença.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h5 className="font-bold text-amber-950">Conceito-chave</h5>
                  <p className="mt-1">O RX de tórax continua sendo o exame de imagem inicial mais utilizado na PAC, porém um resultado normal não exclui pneumonia quando a suspeita clínica é elevada. Nesses casos, o POCUS pulmonar ou a TC de tórax podem ser necessários para esclarecimento diagnóstico.</p>
                </div>
              </div>
              <div className="border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setPneumoniaRxInfoOpen(false)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 sm:w-auto"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {pneumoniaRxImageOpen && (
          <ZoomableImageModal
            title="RX de Tórax"
            src="/rx.jpeg"
            alt="Imagem de referência de RX de tórax"
            onClose={() => setPneumoniaRxImageOpen(false)}
            maxWidthClassName="max-w-5xl"
          />
        )}

        {pneumoniaCtInfoOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-950">TC de Tórax</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Exame reservado para esclarecer dúvidas diagnósticas, identificar complicações e investigar diagnósticos alternativos na PAC.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPneumoniaCtInfoOpen(false)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                  title="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-slate-700">
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p>
                    A tomografia computadorizada (TC) de tórax não deve ser realizada rotineiramente em todos os pacientes com pneumonia adquirida na comunidade (PAC). Seu principal papel é esclarecer dúvidas diagnósticas, identificar complicações e investigar diagnósticos alternativos.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-950">Está indicada principalmente nos seguintes cenários:</h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Suspeita clínica de pneumonia com radiografia ou POCUS inconclusivos, especialmente quando a probabilidade clínica permanece elevada.</li>
                    <li>Discordância entre quadro clínico e imagem inicial, como hipoxemia importante ou sepse sem infiltrado evidente.</li>
                    <li>Falha terapêutica, definida como ausência de melhora clínica ou piora após 48-72 horas de tratamento adequado.</li>
                    <li>Suspeita de pneumonia complicada, incluindo derrame pleural complicado ou empiema, abscesso pulmonar e pneumonia necrotizante.</li>
                    <li>Pacientes imunossuprimidos, nos quais infecções oportunistas e diagnósticos diferenciais são mais frequentes.</li>
                    <li>Suspeita de diagnósticos alternativos, como tromboembolismo pulmonar, neoplasia pulmonar, doença intersticial pulmonar, atelectasia ou hemorragia alveolar.</li>
                    <li>Pneumonia recorrente no mesmo local anatômico, sugerindo lesão obstrutiva endobrônquica.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h5 className="font-bold text-amber-950">Conceito-chave</h5>
                  <p className="mt-1">A TC é o exame de imagem mais sensível para pneumonia, porém seu uso deve ser direcionado, pois raramente modifica a conduta em pacientes com PAC típica e confirmação adequada por radiografia ou POCUS. Baseado em recomendações da American Thoracic Society, Infectious Diseases Society of America, European Respiratory Society e Sociedade Brasileira de Pneumologia e Tisiologia.</p>
                </div>
              </div>
              <div className="border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setPneumoniaCtInfoOpen(false)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 sm:w-auto"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {pneumoniaReferenceImage && (
          <ZoomableImageModal
            title={PNEUMONIA_REFERENCE_IMAGES[pneumoniaReferenceImage].title}
            src={PNEUMONIA_REFERENCE_IMAGES[pneumoniaReferenceImage].src}
            alt={PNEUMONIA_REFERENCE_IMAGES[pneumoniaReferenceImage].alt}
            onClose={() => setPneumoniaReferenceImage(null)}
            maxWidthClassName="max-w-5xl"
          />
        )}

        {/* Removed redundant bottom navigation */}
      </div>
    </div>
  )
}

export default EmergencyFlowchart 

/*teste*/
