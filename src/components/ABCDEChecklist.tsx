'use client'

import { CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

export type ABCDEItem = {
  id: string
  letter: 'A' | 'B' | 'C' | 'D' | 'E'
  title: string
  description: string
}

export const DEFAULT_ABCDE_ITEMS: ReadonlyArray<ABCDEItem> = [
  { id: 'airway', letter: 'A', title: 'Via aérea', description: 'Confirmar permeabilidade e reconhecer precocemente risco de obstrução.' },
  { id: 'breathing', letter: 'B', title: 'Respiração', description: 'Avaliar frequência, esforço ventilatório, ausculta e saturação de oxigênio.' },
  { id: 'circulation', letter: 'C', title: 'Circulação', description: 'Verificar pulsos, pressão arterial, perfusão periférica e sinais de choque.' },
  { id: 'disability', letter: 'D', title: 'Estado neurológico', description: 'Registrar consciência, pupilas e glicemia capilar quando indicada.' },
  { id: 'exposure', letter: 'E', title: 'Exposição e exame', description: 'Examinar integralmente, medir temperatura e procurar achados associados.' }
]

type ABCDEChecklistProps = {
  value: string[]
  onChange: (value: string[]) => void
  items?: ReadonlyArray<ABCDEItem>
  title?: string
  subtitle?: string
  tone?: 'blue' | 'red'
  compact?: boolean
}

const tones = {
  blue: {
    shell: 'border-blue-200',
    header: 'border-blue-100 bg-blue-50',
    title: 'text-blue-950',
    subtitle: 'text-blue-800',
    badge: 'bg-blue-600',
    selected: 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100',
    idle: 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40',
    check: 'text-blue-600',
    progress: 'from-blue-600 to-cyan-500'
  },
  red: {
    shell: 'border-red-200',
    header: 'border-red-100 bg-red-50',
    title: 'text-red-950',
    subtitle: 'text-red-800',
    badge: 'bg-red-600',
    selected: 'border-red-500 bg-red-50 shadow-sm ring-2 ring-red-100',
    idle: 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/40',
    check: 'text-red-600',
    progress: 'from-red-600 to-rose-500'
  }
} as const

export default function ABCDEChecklist({
  value,
  onChange,
  items = DEFAULT_ABCDE_ITEMS,
  title = 'Avaliação e manejo inicial — ABCDE',
  subtitle = 'Marque cada domínio assim que ele for avaliado e conduzido.',
  tone = 'blue',
  compact = false
}: ABCDEChecklistProps) {
  const palette = tones[tone]
  const percent = items.length > 0 ? Math.round((value.length / items.length) * 100) : 0

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])
  }

  return (
    <section className={clsx('overflow-hidden rounded-2xl border bg-white shadow-sm', palette.shell)}>
      <div className={clsx('border-b px-5 py-4', palette.header)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={clsx('font-extrabold', palette.title)}>{title}</h3>
            <p className={clsx('mt-1 text-sm', palette.subtitle)}>{subtitle}</p>
          </div>
          <div className="min-w-[150px] rounded-xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
              <span>{value.length} de {items.length}</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-300', palette.progress)}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={clsx('grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5', compact && 'lg:grid-cols-5')}>
        {items.map((item) => {
          const selected = value.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(item.id)}
              className={clsx(
                'rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                selected ? palette.selected : palette.idle
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={clsx('flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black text-white', palette.badge)}>
                  {item.letter}
                </span>
                <CheckCircle className={clsx('h-5 w-5', selected ? palette.check : 'text-slate-300')} />
              </span>
              <strong className="mt-3 block text-sm text-slate-950">{item.title}</strong>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">{item.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
