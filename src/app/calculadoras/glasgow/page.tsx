'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Brain,
  Calculator,
  CheckCircle2,
  Copy,
  Eye,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react'
import Header from '@/components/Header'

type GlasgowCategory = 'eye' | 'verbal' | 'motor'

type GlasgowOption = {
  value: number
  label: string
  helper: string
}

const glasgowOptions: Record<GlasgowCategory, { title: string; abbreviation: string; icon: React.ElementType; options: GlasgowOption[] }> = {
  eye: {
    title: 'Melhor resposta ocular',
    abbreviation: 'O',
    icon: Eye,
    options: [
      { value: 4, label: 'Abertura ocular espontânea', helper: 'Olhos abrem sem necessidade de chamado ou estímulo.' },
      { value: 3, label: 'Abertura ocular ao chamado', helper: 'Abre os olhos ao comando verbal ou chamado.' },
      { value: 2, label: 'Abertura ocular em resposta à dor', helper: 'Abre os olhos apenas após estímulo doloroso adequado.' },
      { value: 1, label: 'Sem abertura ocular', helper: 'Não há abertura ocular observável.' }
    ]
  },
  verbal: {
    title: 'Melhor resposta verbal',
    abbreviation: 'V',
    icon: MessageCircle,
    options: [
      { value: 5, label: 'Orientado', helper: 'Responde adequadamente sobre pessoa, lugar, tempo e situação.' },
      { value: 4, label: 'Confuso/desorientado', helper: 'Conversa, mas apresenta desorientação ou confusão.' },
      { value: 3, label: 'Palavras inapropriadas', helper: 'Emite palavras isoladas ou inadequadas ao contexto.' },
      { value: 2, label: 'Sons incompreensíveis', helper: 'Gemidos ou sons sem palavras compreensíveis.' },
      { value: 1, label: 'Sem resposta verbal', helper: 'Não há resposta verbal observável.' }
    ]
  },
  motor: {
    title: 'Melhor resposta motora',
    abbreviation: 'M',
    icon: Zap,
    options: [
      { value: 6, label: 'Obedece a comandos', helper: 'Realiza comando motor simples solicitado.' },
      { value: 5, label: 'Localiza o estímulo doloroso', helper: 'Move a mão em direção ao local do estímulo.' },
      { value: 4, label: 'Reação inespecífica em resposta à dor', helper: 'Retirada/flexão não direcionada ao estímulo.' },
      { value: 3, label: 'Flexão anormal à dor/decorticação', helper: 'Flexão anormal dos membros diante do estímulo.' },
      { value: 2, label: 'Extensão à dor/descerebração', helper: 'Extensão anormal dos membros diante do estímulo.' },
      { value: 1, label: 'Sem resposta motora', helper: 'Não há resposta motora observável.' }
    ]
  }
}

const interferenceFactors = [
  'Intubação, traqueostomia ou afasia',
  'Sedação, bloqueio neuromuscular ou intoxicação',
  'Edema palpebral, trauma ocular ou curativo ocular',
  'Déficit motor focal, lesão medular ou imobilização',
  'Barreira de idioma, surdez ou alteração prévia de comunicação'
]

const stimulationSteps = [
  { title: 'Checar', text: 'Identifique fatores que interferem na comunicação, abertura ocular ou resposta motora.' },
  { title: 'Observar', text: 'Observe abertura dos olhos, fala espontânea e movimentos dos lados direito e esquerdo.' },
  { title: 'Estimular', text: 'Solicite comandos verbais; se necessário, use estímulo físico adequado e documente.' },
  { title: 'Avaliar', text: 'Classifique sempre a melhor resposta observada em cada componente.' }
]

const categoryOrder: GlasgowCategory[] = ['eye', 'verbal', 'motor']

const getSeverity = (score: number | null) => {
  if (score == null) {
    return {
      label: 'Incompleto',
      tone: 'border-slate-200 bg-white text-slate-700',
      detail: 'Selecione as três respostas para calcular a escala.'
    }
  }
  if (score <= 8) {
    return {
      label: 'Comprometimento grave',
      tone: 'border-red-200 bg-red-50 text-red-800',
      detail: 'Pontuação compatível com rebaixamento importante. Avaliar via aérea, ventilação e suporte imediato.'
    }
  }
  if (score <= 12) {
    return {
      label: 'Comprometimento moderado',
      tone: 'border-amber-200 bg-amber-50 text-amber-800',
      detail: 'Requer vigilância clínica, reavaliações seriadas e investigação conforme contexto.'
    }
  }
  return {
    label: 'Comprometimento leve',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    detail: 'Manter avaliação neurológica seriada e correlacionar com mecanismo e evolução clínica.'
  }
}

export default function GlasgowCalculatorPage() {
  const [scores, setScores] = useState<Record<GlasgowCategory, number | null>>({
    eye: null,
    verbal: null,
    motor: null
  })
  const [checkedFactors, setCheckedFactors] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const total = useMemo(() => {
    if (scores.eye == null || scores.verbal == null || scores.motor == null) return null
    return scores.eye + scores.verbal + scores.motor
  }, [scores])

  const severity = useMemo(() => getSeverity(total), [total])
  const notation = `ECG ${total ?? '--'} (${scores.eye ?? '-'}O + ${scores.verbal ?? '-'}V + ${scores.motor ?? '-'}M)`

  const resetAll = () => {
    setScores({ eye: null, verbal: null, motor: null })
    setCheckedFactors([])
    setCopied(false)
  }

  const copyResult = async () => {
    const selectedFactors = checkedFactors.length > 0 ? checkedFactors.join('; ') : 'sem fatores interferentes registrados'
    const text = `Escala de Coma de Glasgow: ${notation}. Interpretação: ${severity.label}. Fatores interferentes: ${selectedFactors}.`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const toggleFactor = (factor: string) => {
    setCheckedFactors(prev => prev.includes(factor) ? prev.filter(item => item !== factor) : [...prev, factor])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/?view=dashboard" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Voltar ao dashboard</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                <Calculator className="h-4 w-4" />
                <span>Calculadora isolada</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Escala de Coma de Glasgow</h1>
              <p className="mt-2 text-slate-600">
                Selecione a melhor resposta ocular, verbal e motora observada. O resultado é calculado em tempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Limpar cálculo</span>
            </button>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            {stimulationSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  {index === 0 ? <ShieldAlert className="h-5 w-5" /> : index === 1 ? <Eye className="h-5 w-5" /> : index === 2 ? <Sparkles className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="space-y-5">
              {categoryOrder.map((category) => {
                const config = glasgowOptions[category]
                const Icon = config.icon
                return (
                  <div key={category} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">{config.title}</h2>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Componente {config.abbreviation}</p>
                        </div>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-bold text-slate-700">
                        {scores[category] ?? '-'} ponto(s)
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {config.options.map((option) => {
                        const selected = scores[category] === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setScores(prev => ({ ...prev, [category]: option.value }))}
                            className={`flex min-h-[92px] items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                              selected ? 'border-cyan-400 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30'
                            }`}
                          >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                              selected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {option.value}
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-slate-900">{option.label}</span>
                              <span className="mt-1 block text-xs leading-relaxed text-slate-600">{option.helper}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  <h2 className="text-base font-extrabold">Fatores que interferem na avaliação</h2>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {interferenceFactors.map((factor) => (
                    <label key={factor} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition-colors hover:border-amber-200 hover:bg-amber-50/40">
                      <input
                        type="checkbox"
                        checked={checkedFactors.includes(factor)}
                        onChange={() => toggleFactor(factor)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>{factor}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 xl:sticky xl:top-6">
              <div className="flex items-center gap-2 text-slate-800">
                <Brain className="h-5 w-5 text-blue-700" />
                <h2 className="text-lg font-bold">Resultado</h2>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-sm font-semibold text-slate-500">Pontuação total</p>
                <p className="mt-1 text-5xl font-extrabold text-slate-900">{total ?? '--'}</p>
                <p className="mt-2 text-sm font-bold text-slate-600">{notation}</p>
              </div>

              <div className={`mt-4 rounded-2xl border p-4 ${severity.tone}`}>
                <p className="font-extrabold">{severity.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{severity.detail}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold text-slate-900">Faixas usuais</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  <li>13 a 15: leve</li>
                  <li>9 a 12: moderado</li>
                  <li>3 a 8: grave</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={copyResult}
                disabled={total == null}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-colors ${
                  total == null ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Resultado copiado' : 'Copiar resultado'}
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
