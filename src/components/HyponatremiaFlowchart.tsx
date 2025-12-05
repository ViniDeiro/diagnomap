"use client"
import React, { useMemo, useState } from "react"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import { Activity, AlertTriangle, Brain, ClipboardList, Clock, Droplet, FlaskConical, Syringe, CheckCircle2, ArrowLeft, ChevronLeft, RotateCcw, Zap } from "lucide-react"
import { Patient } from "@/types/patient"

type Severity = "leve" | "moderada" | "grave" | "normal"

// Estilos compartilhados para inputs e checkboxes (disponíveis em todo o módulo)
const inputClass = "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
const checkboxClass = "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"

function badge(label: string, tone: "green" | "yellow" | "red" | "blue") {
  const map: Record<typeof tone, string> = {
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  }
  return <span className={`inline-block text-xs px-2 py-1 rounded border ${map[tone]}`}>{label}</span>
}

function classifyNa(na?: number): Severity {
  if (na == null || Number.isNaN(na)) return "normal"
  if (na < 120) return "grave"
  if (na >= 120 && na <= 129) return "moderada"
  if (na >= 130 && na <= 134) return "leve"
  return "normal"
}

function severityBadge(na?: number) {
  const sev = classifyNa(na)
  if (sev === "grave") return badge("Grave (<120)", "red")
  if (sev === "moderada") return badge("Moderada (120–129)", "yellow")
  if (sev === "leve") return badge("Leve (130–134)", "green")
  return badge("Normal (≥135)", "blue")
}

export default function HyponatremiaFlowchart({ patient, onBack }: { patient?: Patient; onBack?: () => void }) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 13
  const progress = Math.round((currentStep / totalSteps) * 100)

  // Padrão visual alinhado ao fluxograma da Dengue

  function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 blur-xl opacity-30 scale-110 rounded-2xl" style={{ background: color }}></div>
            <div className="relative p-3 rounded-2xl text-white shadow-md border border-white/20" style={{ background: color }}>
              {icon}
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">{title}</h2>
        </div>
        {children}
      </section>
    )
  }

  function StepNav({ prev, next }: { prev?: () => void; next: () => void }) {
    return (
      <div className="mt-6 flex items-center justify-between">
        {prev ? (
          <button
            onClick={prev}
            className="px-4 py-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 text-slate-700 rounded-xl transition-all duration-200 font-medium shadow-sm"
          >
            Anterior
          </button>
        ) : <div />}
        <button
          onClick={next}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 font-medium shadow-sm"
        >
          Próximo
        </button>
      </div>
    )
  }

  // Wrapper animado para transições suaves entre etapas
  // Evita reanimação da caixa em cada digitação; anima apenas quando o step muda
  function StepWrapper({ children, step }: { children: React.ReactNode; step: number }) {
    const controls = useAnimationControls()
    const prevStepRef = React.useRef<number | null>(null)

    React.useEffect(() => {
      if (prevStepRef.current == null) {
        controls.set({ opacity: 1, x: 0 })
        prevStepRef.current = step
        return
      }
      if (prevStepRef.current !== step) {
        prevStepRef.current = step
        controls.set({ opacity: 0, x: 24 })
        controls.start({ opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } })
      }
    }, [step, controls])

    return (
      <motion.div animate={controls}>
        {children}
      </motion.div>
    )
  }

  // Core inputs (numeric + text for stable typing)
  const [na, setNa] = useState<number | undefined>(undefined)
  const [naText, setNaText] = useState<string>('')
  const [osmPlasma, setOsmPlasma] = useState<number | undefined>(undefined)
  const [osmPlasmaText, setOsmPlasmaText] = useState<string>('')
  const [osmUrina, setOsmUrina] = useState<number | undefined>(undefined)
  const [osmUrinaText, setOsmUrinaText] = useState<string>('')
  const [naUrina, setNaUrina] = useState<number | undefined>(undefined)
  const [naUrinaText, setNaUrinaText] = useState<string>('')
  const [glicemia, setGlicemia] = useState<number | undefined>(undefined)
  const [glicemiaText, setGlicemiaText] = useState<string>('')
  const [ureia, setUreia] = useState<number | undefined>(undefined)
  const [ureiaText, setUreiaText] = useState<string>('')
  const [creatinina, setCreatinina] = useState<number | undefined>(undefined)
  const [creatininaText, setCreatininaText] = useState<string>('')
  const [tsh, setTsh] = useState<number | undefined>(undefined)
  const [tshText, setTshText] = useState<string>('')

  // Mantém foco estável enquanto digita, mesmo com re-renderizações
  const [activeInput, setActiveInput] = useState<
    | 'na'
    | 'osmPlasma'
    | 'osmUrina'
    | 'naUrina'
    | 'glicemia'
    | 'ureia'
    | 'creatinina'
    | 'tsh'
    | null
  >(null)
  const naRef = React.useRef<HTMLInputElement | null>(null)
  const osmPlasmaRef = React.useRef<HTMLInputElement | null>(null)
  const osmUrinaRef = React.useRef<HTMLInputElement | null>(null)
  const naUrinaRef = React.useRef<HTMLInputElement | null>(null)
  const glicemiaRef = React.useRef<HTMLInputElement | null>(null)
  const ureiaRef = React.useRef<HTMLInputElement | null>(null)
  const creatininaRef = React.useRef<HTMLInputElement | null>(null)
  const tshRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (!activeInput) return
    const map: Record<Exclude<typeof activeInput, null>, HTMLInputElement | null> = {
      na: naRef.current,
      osmPlasma: osmPlasmaRef.current,
      osmUrina: osmUrinaRef.current,
      naUrina: naUrinaRef.current,
      glicemia: glicemiaRef.current,
      ureia: ureiaRef.current,
      creatinina: creatininaRef.current,
      tsh: tshRef.current,
    }
    const el = map[activeInput]
    if (el && document.activeElement !== el) {
      // Refoca discretamente sem rolar a página
      el.focus({ preventScroll: true })
    }
  }, [activeInput, naText, osmPlasmaText, osmUrinaText, naUrinaText, glicemiaText, ureiaText, creatininaText, tshText])

  // Step 2 — sintomas neurológicos
  const [neuroSymptoms, setNeuroSymptoms] = useState<string[]>([])
  const hasSevereNeuro = useMemo(
    () => neuroSymptoms.some((s) => ["Convulsões", "Coma", "Rebaixamento do nível de consciência", "Sinais de herniação"].includes(s)),
    [neuroSymptoms]
  )

  // Step 3 — duração
  const [duration, setDuration] = useState<"aguda" | "cronica" | undefined>(undefined)

  // Step 5 — volume
  const [volume, setVolume] = useState<"hipovolemica" | "euvolemica" | "hipervolemica" | undefined>(undefined)

  // Step 6 — causas
  const [causes, setCauses] = useState<string[]>([])

  // Step 7 — grupo etário
  const [ageGroup, setAgeGroup] = useState<"adulto" | "pediatrico" | "idoso" | undefined>(undefined)

  // Step 9 — reavaliação 6h
  const [na6h, setNa6h] = useState<number | undefined>(undefined)
  const [na6hText, setNa6hText] = useState<string>('')
  const deltaNa = useMemo(() => {
    if (na == null || na6h == null) return undefined
    if (Number.isNaN(na) || Number.isNaN(na6h)) return undefined
    return na6h - na
  }, [na, na6h])

  // Step 11 — relowering (24h/48h)
  const [na24h, setNa24h] = useState<number | undefined>(undefined)
  const [na24hText, setNa24hText] = useState<string>('')
  const [na48h, setNa48h] = useState<number | undefined>(undefined)
  const [na48hText, setNa48hText] = useState<string>('')
  const deltaNa24h = useMemo(() => {
    if (na == null || na24h == null) return undefined
    if (Number.isNaN(na) || Number.isNaN(na24h)) return undefined
    return na24h - na
  }, [na, na24h])
  const deltaNa48h = useMemo(() => {
    if (na == null || na48h == null) return undefined
    if (Number.isNaN(na) || Number.isNaN(na48h)) return undefined
    return na48h - na
  }, [na, na48h])
  const shouldRelower = (deltaNa24h != null && deltaNa24h > 10) || (deltaNa48h != null && deltaNa48h > 18)

  const severity = useMemo(() => classifyNa(na), [na])

  const condutaInicial = useMemo(() => {
    const lines: string[] = []
    if (hasSevereNeuro || severity === "grave") {
      if (ageGroup === "pediatrico") {
        lines.push("NaCl 3% em bolus de 2 mL/kg (máx. 100 mL) IV, repetir até melhora clínica ou ↑4–6 mEq/L")
      } else {
        lines.push("NaCl 3% 100 mL IV em 10 min, repetir até melhora clínica ou ↑4–6 mEq/L")
      }
      lines.push("Monitorização intensiva neurológica")
    } else if (severity === "moderada") {
      lines.push("Iniciar correção ativa e vigilância neurológica")
      lines.push("Considerar restrição hídrica se SIADH (800–1000 mL/dia)")
      lines.push("Suspender diuréticos / corrigir distúrbios hormonais")
    } else if (severity === "leve") {
      lines.push("Tratar causa e observar")
      lines.push("Restrição hídrica em SIADH")
    }

    if (volume === "hipovolemica") lines.push("Reposição com solução salina isotônica (NaCl 0,9%)")
    if (volume === "euvolemica") lines.push("Restrição hídrica; considerar vaptanos conforme refratariedade")
    if (volume === "hipervolemica") lines.push("Restrição hídrica + diuréticos de alça")

    return lines
  }, [hasSevereNeuro, severity, ageGroup, volume])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Top Bar - Header Actions */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Title */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl blur-md opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-white to-slate-50 rounded-xl flex items-center justify-center border-2 border-slate-200 shadow-lg">
                  <Droplet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">Fluxograma de Hiponatremia</h1>
                {patient ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{patient.name}</span>
                    <span className="text-xs font-medium text-slate-600">{patient.age} anos • {patient.medicalRecord}</span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-600">Protocolo Clínico</span>
                )}
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (onBack) {
                    try { onBack() } catch {}
                  } else {
                    try { (window as any).location.href = '/' } catch {}
                  }
                }}
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 text-slate-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>

              <button
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null}
                className={`group flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 font-medium ${
                  currentStep > 1
                    ? "bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border-amber-300 text-amber-700 shadow-lg hover:shadow-xl"
                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border border-blue-300 text-blue-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Progresso do Fluxograma</h3>
                <p className="text-sm text-slate-600">Protocolo Oficial MS 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                {progress}%
              </span>
            </div>
          </div>
        <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-4 shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-slate-600 h-4 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">

      {/* Etapa 1 */}
      {currentStep === 1 && (
      <StepWrapper step={currentStep}>
      <Section icon={<FlaskConical className="w-5 h-5" />} title="Etapa 1 — Confirmar o diagnóstico e avaliar a gravidade" color="linear-gradient(90deg,#2563eb,#06b6d4)">
        <p className="text-sm text-slate-700 mb-3">Hiponatremia: Na⁺ &lt; 135 mEq/L. Confirme exames e descarte pseudohiponatremia.</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Na⁺ sérico (mEq/L)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 124"
              value={naText}
              ref={naRef}
              onFocus={() => setActiveInput('na')}
              onChange={(e) => {
                const v = e.target.value
                setNaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setNa(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setNa(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
            <div className="mt-1">{severityBadge(na)}</div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Osmolalidade plasmática (mOsm/kg)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 270"
              value={osmPlasmaText}
              ref={osmPlasmaRef}
              onFocus={() => setActiveInput('osmPlasma')}
              onChange={(e) => {
                const v = e.target.value
                setOsmPlasmaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setOsmPlasma(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setOsmPlasma(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Osmolalidade urinária (mOsm/kg)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 500"
              value={osmUrinaText}
              ref={osmUrinaRef}
              onFocus={() => setActiveInput('osmUrina')}
              onChange={(e) => {
                const v = e.target.value
                setOsmUrinaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setOsmUrina(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setOsmUrina(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Na⁺ urinário (mEq/L)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 20"
              value={naUrinaText}
              ref={naUrinaRef}
              onFocus={() => setActiveInput('naUrina')}
              onChange={(e) => {
                const v = e.target.value
                setNaUrinaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setNaUrina(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setNaUrina(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Glicemia (mg/dL)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 110"
              value={glicemiaText}
              ref={glicemiaRef}
              onFocus={() => setActiveInput('glicemia')}
              onChange={(e) => {
                const v = e.target.value
                setGlicemiaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setGlicemia(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setGlicemia(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Ureia (mg/dL)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 30"
              value={ureiaText}
              ref={ureiaRef}
              onFocus={() => setActiveInput('ureia')}
              onChange={(e) => {
                const v = e.target.value
                setUreiaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setUreia(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setUreia(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Creatinina (mg/dL)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 0.9"
              value={creatininaText}
              ref={creatininaRef}
              onFocus={() => setActiveInput('creatinina')}
              onChange={(e) => {
                const v = e.target.value
                setCreatininaText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setCreatinina(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setCreatinina(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">TSH (µIU/mL)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 2.5"
              value={tshText}
              ref={tshRef}
              onFocus={() => setActiveInput('tsh')}
              onChange={(e) => {
                const v = e.target.value
                setTshText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setTsh(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setTsh(Number.isNaN(parsed) ? undefined : parsed)
                setActiveInput(null)
              }}
            />
          </div>
        </div>
        <StepNav next={() => setCurrentStep(2)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 2 */}
      {currentStep === 2 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Brain className="w-5 h-5" />} title="Etapa 2 — Determinar a presença de sintomas neurológicos" color="linear-gradient(90deg,#9333ea,#6366f1)">
        <p className="text-sm text-slate-700 mb-3">Avaliar: cefaleia, náuseas, vômitos, letargia, confusão, convulsões, coma.</p>
        <div className="grid md:grid-cols-2 gap-2">
          {["Cefaleia", "Náuseas/Vômitos", "Letargia", "Confusão", "Convulsões", "Coma", "Rebaixamento do nível de consciência", "Sinais de herniação"].map((sym) => (
            <label key={sym} className="flex items-center space-x-2">
              <input type="checkbox" className={checkboxClass} checked={neuroSymptoms.includes(sym)} onChange={(e) => {
                if (e.target.checked) setNeuroSymptoms((prev) => [...prev, sym])
                else setNeuroSymptoms((prev) => prev.filter((s) => s !== sym))
              }} />
              <span className="text-sm">{sym}</span>
            </label>
          ))}
        </div>
        {hasSevereNeuro && (
          <div className="mt-3 p-3 border border-red-300 bg-red-50 rounded text-sm text-red-800">
            <div className="flex items-center space-x-2 mb-1"><AlertTriangle className="w-4 h-4" /><span>Hiponatremia sintomática grave: requer correção imediata com NaCl 3%.</span></div>
          </div>
        )}
        <StepNav prev={() => setCurrentStep(1)} next={() => setCurrentStep(3)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 3 */}
      {currentStep === 3 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Clock className="w-5 h-5" />} title="Etapa 3 — Classificar quanto à duração" color="linear-gradient(90deg,#475569,#1e293b)">
        <div className="space-y-2">
          {[{ k: "aguda", label: "Aguda (< 48h)" }, { k: "cronica", label: "Crônica (≥ 48h ou desconhecida)" } as const].map((opt) => (
            <label key={opt.k} className="flex items-center space-x-2">
              <input type="radio" className={checkboxClass} name="duration" checked={duration === opt.k} onChange={() => setDuration(opt.k)} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
        <StepNav prev={() => setCurrentStep(2)} next={() => setCurrentStep(4)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 4 */}
      {currentStep === 4 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Activity className="w-5 h-5" />} title="Etapa 4 — Classificar quanto à severidade do sódio" color="linear-gradient(90deg,#10b981,#22c55e)">
        <p className="text-sm text-slate-700">Leve: 130–134 • Moderada: 120–129 • Grave: &lt;120 mEq/L</p>
        <div className="mt-2">{severityBadge(na)}</div>
        <StepNav prev={() => setCurrentStep(3)} next={() => setCurrentStep(5)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 5 */}
      {currentStep === 5 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Droplet className="w-5 h-5" />} title="Etapa 5 — Avaliar o volume extracelular" color="linear-gradient(90deg,#06b6d4,#0ea5e9)">
        <div className="space-y-2">
          {[{ k: "hipovolemica", label: "Hipovolêmica" }, { k: "euvolemica", label: "Euvolêmica" }, { k: "hipervolemica", label: "Hipervolêmica" } as const].map((opt) => (
            <label key={opt.k} className="flex items-center space-x-2">
              <input type="radio" className={checkboxClass} name="volume" checked={volume === opt.k} onChange={() => setVolume(opt.k)} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-700">
          {volume === "hipovolemica" && <p>Reposição com solução salina isotônica (NaCl 0,9%).</p>}
          {volume === "euvolemica" && <p>Restrição hídrica; considerar vaptanos em refratariedade (SIADH).</p>}
          {volume === "hipervolemica" && <p>Restrição hídrica + diuréticos de alça.</p>}
        </div>
        <StepNav prev={() => setCurrentStep(4)} next={() => setCurrentStep(6)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 6 */}
      {currentStep === 6 && (
      <StepWrapper step={currentStep}>
      <Section icon={<ClipboardList className="w-5 h-5" />} title="Etapa 6 — Identificar a causa subjacente provável" color="linear-gradient(90deg,#334155,#64748b)">
        <div className="grid md:grid-cols-2 gap-2">
          {["SIADH", "Perdas renais (diuréticos, insuficiência adrenal)", "Perdas extrarrenais (GI)", "Hipotireoidismo", "Polidipsia psicogênica", "ICC", "Cirrose", "Síndrome nefrótica"].map((c) => (
            <label key={c} className="flex items-center space-x-2">
              <input type="checkbox" className={checkboxClass} checked={causes.includes(c)} onChange={(e) => {
                if (e.target.checked) setCauses((prev) => [...prev, c])
                else setCauses((prev) => prev.filter((x) => x !== c))
              }} />
              <span className="text-sm">{c}</span>
            </label>
          ))}
        </div>
        <StepNav prev={() => setCurrentStep(5)} next={() => setCurrentStep(7)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 7 */}
      {currentStep === 7 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Syringe className="w-5 h-5" />} title="Etapa 7 — Definir o grupo etário e ajustar metas" color="linear-gradient(90deg,#059669,#10b981)">
        <div className="space-y-2">
          {[{ k: "adulto", label: "Adulto" }, { k: "pediatrico", label: "Pediátrico" }, { k: "idoso", label: "Idoso" } as const].map((opt) => (
            <label key={opt.k} className="flex items-center space-x-2">
              <input type="radio" className={checkboxClass} name="ageGroup" checked={ageGroup === opt.k} onChange={() => setAgeGroup(opt.k)} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-600">
          {ageGroup === "adulto" && <p>Meta: máx. 8–10 mEq/L em 24h (ideal 6–8). Correção inicial grave: 4–6 mEq/L nas primeiras 6h.</p>}
          {ageGroup === "pediatrico" && <p>Meta: ≤ 8 mEq/L em 24h (ideal 6). NaCl 3% em bolus 2 mL/kg em sintomas neurológicos graves.</p>}
          {ageGroup === "idoso" && <p>Meta: ≤ 6 mEq/L em 24h. Preferir solução isotônica e monitorar a cada 2–4h.</p>}
        </div>
        <StepNav prev={() => setCurrentStep(6)} next={() => setCurrentStep(8)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 8 — Conduta inicial */}
      {currentStep === 8 && (
      <StepWrapper step={currentStep}>
      <Section icon={<AlertTriangle className="w-5 h-5" />} title="Etapa 8 — Conduta inicial de correção (fase aguda)" color="linear-gradient(90deg,#ef4444,#f59e0b)">
        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
          {condutaInicial.map((l, idx) => (<li key={idx}>{l}</li>))}
          {condutaInicial.length === 0 && (
            <li>Defina severidade, sintomas e volume para ver recomendações.</li>
          )}
        </ul>
        <StepNav prev={() => setCurrentStep(7)} next={() => setCurrentStep(9)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 9 — Reavaliação após 6h */}
      {currentStep === 9 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Clock className="w-5 h-5" />} title="Etapa 9 — Reavaliação após 6 horas" color="linear-gradient(90deg,#f59e0b,#f97316)">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Na⁺ após 6h (mEq/L)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 128"
              value={na6hText}
              onChange={(e) => {
                const v = e.target.value
                setNa6hText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setNa6h(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setNa6h(Number.isNaN(parsed) ? undefined : parsed)
              }}
            />
          </div>
          <div className="md:col-span-2 flex items-center">
            {deltaNa != null && (
              <div className="text-sm">
                <p>Variação (ΔNa): {deltaNa.toFixed(1)} mEq/L.</p>
                {deltaNa < 4 && <p>• Aumento &lt; 4 mEq/L → continuar correção.</p>}
                {deltaNa >= 8 && <p className="text-red-700">• Aumento ≥ 8 mEq/L em 24h → interromper correção e considerar relowering.</p>}
                {deltaNa >= 4 && deltaNa < 8 && <p>• Aumento adequado. Manter monitorização 4–6h.</p>}
              </div>
            )}
          </div>
        </div>
        <StepNav prev={() => setCurrentStep(8)} next={() => setCurrentStep(10)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 10 — Manutenção */}
      {currentStep === 10 && (
      <StepWrapper step={currentStep}>
      <Section icon={<Activity className="w-5 h-5" />} title="Etapa 10 — Fase de manutenção" color="linear-gradient(90deg,#14b8a6,#22d3ee)">
        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>Manter correção gradual até Na⁺ 135 mEq/L.</li>
          <li>Continuar correção de causas persistentes (SIADH, ICC, hipotireoidismo).</li>
          <li>Considerar vaptanos em euvolêmica/hipervolêmica refratária.</li>
          <li>Monitorização: Na⁺ sérico a cada 4–6h na fase inicial.</li>
        </ul>
        <StepNav prev={() => setCurrentStep(9)} next={() => setCurrentStep(11)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 11 — Relowering */}
      {currentStep === 11 && (
      <StepWrapper>
      <Section icon={<AlertTriangle className="w-5 h-5" />} title="Etapa 11 — Fase de relowering (correção excessiva)" color="linear-gradient(90deg,#dc2626,#ef4444)">
        <p className="text-sm text-slate-700 mb-3">Se o Na⁺ aumentar &gt; 10 mEq/L em 24h ou &gt; 18 mEq/L em 48h:</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Na⁺ após 24h (mEq/L)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 136"
              value={na24hText}
              onChange={(e) => {
                const v = e.target.value
                setNa24hText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setNa24h(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setNa24h(Number.isNaN(parsed) ? undefined : parsed)
              }}
            />
            {deltaNa24h != null && (
              <p className="text-xs mt-1 text-slate-600">Δ24h: {deltaNa24h.toFixed(1)} mEq/L</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Na⁺ após 48h (mEq/L)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              placeholder="Ex: 140"
              value={na48hText}
              onChange={(e) => {
                const v = e.target.value
                setNa48hText(v)
                const parsed = parseFloat(v.replace(',', '.'))
                setNa48h(Number.isNaN(parsed) ? undefined : parsed)
              }}
              onBlur={(e) => {
                const v = e.target.value
                const parsed = parseFloat(v.replace(',', '.'))
                setNa48h(Number.isNaN(parsed) ? undefined : parsed)
              }}
            />
            {deltaNa48h != null && (
              <p className="text-xs mt-1 text-slate-600">Δ48h: {deltaNa48h.toFixed(1)} mEq/L</p>
            )}
          </div>
          <div className="md:col-span-1 flex items-center">
            {shouldRelower && (
              <div className="p-3 border border-red-300 bg-red-50 rounded text-sm text-red-800 w-full">
                <p>• Interromper solução hipertônica.</p>
                <p>• Administrar D5W (glicose 5%) e/ou DDAVP (desmopressina 2–4 µg IV).</p>
                <p>• Objetivo: reduzir 4–6 mEq/L e estabilizar o gradiente osmótico.</p>
              </div>
            )}
          </div>
        </div>
        <StepNav prev={() => setCurrentStep(10)} next={() => setCurrentStep(12)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 12 — Monitorização contínua */}
      {currentStep === 12 && (
      <StepWrapper>
      <Section icon={<ClipboardList className="w-5 h-5" />} title="Etapa 12 — Monitorização laboratorial e clínica contínua" color="linear-gradient(90deg,#0ea5e9,#6366f1)">
        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>Sódio sérico e urinário a cada 4–6h (fase aguda).</li>
          <li>Reavaliar eletrólitos, osmolalidade e status de volume.</li>
          <li>Vigilância de sintomas neurológicos: convulsões, confusão, fraqueza.</li>
          <li>Ajustar ritmo de correção conforme resposta e risco de hipercorreção.</li>
        </ul>
        <StepNav prev={() => setCurrentStep(11)} next={() => setCurrentStep(13)} />
      </Section>
      </StepWrapper>
      )}

      {/* Etapa 13 — Alta e seguimento */}
      {currentStep === 13 && (
      <StepWrapper>
      <Section icon={<CheckCircle2 className="w-5 h-5" />} title="Etapa 13 — Alta e seguimento ambulatorial" color="linear-gradient(90deg,#10b981,#84cc16)">
        <p className="text-sm text-slate-700 mb-2">Critérios de alta:</p>
        <Checklist />
        <StepNav prev={() => setCurrentStep(12)} />
      </Section>
      </StepWrapper>
      )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Checklist() {
  const [naStable, setNaStable] = useState(false)
  const [causeTreated, setCauseTreated] = useState(false)
  const [asymptomatic, setAsymptomatic] = useState(false)
  const [followPlan, setFollowPlan] = useState(false)
  const total = [naStable, causeTreated, asymptomatic, followPlan].filter(Boolean).length
  return (
    <div className="space-y-2">
      {[{ state: naStable, set: setNaStable, label: "Sódio ≥ 130 mEq/L estável" },
        { state: causeTreated, set: setCauseTreated, label: "Causa base tratada" },
        { state: asymptomatic, set: setAsymptomatic, label: "Assintomático" },
        { state: followPlan, set: setFollowPlan, label: "Plano de seguimento: controle eletrolítico semanal por 2 semanas" }].map((item) => (
        <label key={item.label} className="flex items-center space-x-2">
          <input type="checkbox" className={checkboxClass} checked={item.state} onChange={(e) => item.set(e.target.checked)} />
          <span className="text-sm">{item.label}</span>
        </label>
      ))}
      <div className="mt-2 text-sm text-slate-700">Critérios atendidos: {total}/4.</div>
    </div>
  )
}
