'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowLeft, Calculator, CheckCircle2, RotateCcw } from 'lucide-react'
import Header from '@/components/Header'

type WellsCriterion = {
  id: string
  label: string
  points: number
}

const wellsCriteria: WellsCriterion[] = [
  { id: 'cancer_ativo', label: 'Câncer ativo (tratamento em curso, paliativo ou nos últimos 6 meses)', points: 1 },
  { id: 'paresia_imobilizacao', label: 'Paralisia/paresia ou imobilização recente de membro inferior', points: 1 },
  { id: 'acamado_cirurgia', label: 'Acamado por mais de 3 dias ou cirurgia de grande porte nas últimas 12 semanas', points: 1 },
  { id: 'dor_venosa_profunda', label: 'Dor à palpação no trajeto do sistema venoso profundo', points: 1 },
  { id: 'edema_total_mi', label: 'Edema de todo o membro inferior', points: 1 },
  { id: 'panturrilha_maior_3cm', label: 'Diferença de circunferência da panturrilha maior que 3 cm', points: 1 },
  { id: 'edema_cacifo', label: 'Edema com cacifo limitado ao membro sintomático', points: 1 },
  { id: 'veias_colaterais', label: 'Veias colaterais superficiais não varicosas', points: 1 },
  { id: 'tvp_previa', label: 'História prévia de TVP documentada', points: 1 },
  { id: 'diagnostico_alternativo', label: 'Diagnóstico alternativo pelo menos tão provável quanto TVP', points: -2 }
]

const formatScore = (score: number) => (score > 0 ? `+${score}` : String(score))

export default function WellsCalculatorPage() {
  const [answers, setAnswers] = useState<Record<string, boolean>>(
    wellsCriteria.reduce((acc, item) => ({ ...acc, [item.id]: false }), {} as Record<string, boolean>)
  )
  const [reviewConfirmed, setReviewConfirmed] = useState(false)

  const score = useMemo(
    () => wellsCriteria.reduce((sum, item) => sum + (answers[item.id] ? item.points : 0), 0),
    [answers]
  )

  const interpretation = useMemo(() => {
    if (score <= 0) {
      return {
        risk: 'Baixa probabilidade',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        next: 'Considerar D-dímero e estratégia de exclusão diagnóstica conforme protocolo local.'
      }
    }
    if (score <= 2) {
      return {
        risk: 'Probabilidade intermediária',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
        next: 'Indicar ultrassonografia venosa compressiva ou D-dímero conforme disponibilidade e contexto clínico.'
      }
    }
    return {
      risk: 'Alta probabilidade',
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      next: 'Priorizar ultrassonografia venosa compressiva imediata e avaliação para anticoagulação, se indicado.'
    }
  }, [score])

  const canFinalize = reviewConfirmed

  const toggleCriterion = (id: string) => {
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resetAll = () => {
    setAnswers(wellsCriteria.reduce((acc, item) => ({ ...acc, [item.id]: false }), {} as Record<string, boolean>))
    setReviewConfirmed(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar para página inicial</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                <Calculator className="w-4 h-4" />
                <span>Calculadora isolada</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-800">Escore de Wells para TVP</h1>
              <p className="mt-2 text-slate-600">
                Marque os critérios presentes. O escore e a interpretação são atualizados em tempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar cálculo</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Critérios clínicos</h2>
              <div className="space-y-3">
                {wellsCriteria.map((criterion) => (
                  <label
                    key={criterion.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      answers[criterion.id] ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={answers[criterion.id]}
                      onChange={() => toggleCriterion(criterion.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-slate-800">{criterion.label}</p>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">Pontuação: {formatScore(criterion.points)}</p>
                    </div>
                  </label>
                ))}
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50">
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  onChange={(e) => setReviewConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Confirmo que revisei todos os critérios clínicos aplicáveis antes de registrar o resultado.
                </span>
              </label>
              {!canFinalize && (
                <p className="mt-2 text-sm text-amber-700">
                  Confirme a revisão para validação final do cálculo.
                </p>
              )}
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 h-fit">
              <h2 className="text-lg font-bold text-slate-800">Resultado imediato</h2>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 text-center">
                <p className="text-sm text-slate-500">Escore total</p>
                <p className="mt-1 text-4xl font-extrabold text-slate-800">{score}</p>
              </div>

              <div className={`mt-4 rounded-2xl border p-4 ${interpretation.bg}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${interpretation.color}`} />
                  <p className={`font-semibold ${interpretation.color}`}>{interpretation.risk}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{interpretation.next}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Activity className="w-4 h-4" />
                  <p className="font-semibold">Faixas usadas</p>
                </div>
                <ul className="mt-2 text-sm text-slate-600 space-y-1">
                  <li>≤ 0 pontos: baixa probabilidade</li>
                  <li>1–2 pontos: probabilidade intermediária</li>
                  <li>≥ 3 pontos: alta probabilidade</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
