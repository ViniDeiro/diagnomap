'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/services/supabaseClient'

type AllergySelectorProps = {
  value: string[]
  onChange: (next: string[]) => void
  municipalityName?: string
  municipalityId?: number
  placeholder?: string
  allowedNames?: string[] // restringe por fluxograma (ex.: ['paracetamol', 'dipirona'])
}

export default function AllergySelector({ value, onChange, municipalityName = 'Mogi das Cruzes', municipalityId, placeholder = 'Buscar medicamento...', allowedNames }: AllergySelectorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  useEffect(() => {
    let cancelled = false
    async function loadOptions() {
      setLoading(true)
      setError(null)
      try {
        let names: string[] = []

        // Primeiro: se municipalityId foi fornecido, usar diretamente
        if (typeof municipalityId === 'number') {
          const { data: items, error: remErr } = await supabase
            .from('remune_municipal')
            .select('medicine_id, medicines:medicine_id (id, name)')
            .eq('municipality_id', municipalityId)
            .order('medicine_id', { ascending: true })
            .limit(1000)
          if (remErr) throw remErr
          names = (items || [])
            .map((row: any) => row.medicines?.name as string)
            .filter(Boolean)
        } else {
          // Caso contrário: tentar descobrir pelo nome da municipalidade
          const { data: muni, error: muniErr } = await supabase
            .from('municipalities')
            .select('id, name')
            .ilike('name', municipalityName)
            .limit(1)

          if (!muniErr && Array.isArray(muni) && muni.length > 0) {
            const municipality_id = muni[0].id as number
            const { data: items, error: remErr } = await supabase
              .from('remune_municipal')
              .select('medicine_id, medicines:medicine_id (id, name)')
              .eq('municipality_id', municipality_id)
              .order('medicine_id', { ascending: true })
              .limit(1000)

            if (remErr) throw remErr
            names = (items || [])
              .map((row: any) => row.medicines?.name as string)
              .filter(Boolean)
          } else {
            // Fallback: usar a lista geral de medicamentos
            const { data: meds, error: medsErr } = await supabase
              .from('medicines')
              .select('name')
              .order('name', { ascending: true })
              .limit(1000)
            if (medsErr) throw medsErr
            names = (meds || []).map((m: any) => m.name as string).filter(Boolean)
          }
        }

        // Remover duplicatas e ordenar
        const unique = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
        if (!cancelled) setOptions(unique)
      } catch (err: any) {
        if (!cancelled) setError('Não foi possível carregar a lista de medicamentos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOptions()
    return () => { cancelled = true }
  }, [municipalityId, municipalityName])

  const filtered = useMemo(() => {
    const base = (() => {
      if (!allowedNames || allowedNames.length === 0) return options
      const allowed = allowedNames.map(a => a.toLowerCase())
      return options.filter(n => {
        const name = n.toLowerCase()
        return allowed.some(a => name.includes(a))
      })
    })()
    if (!query) return base
    const q = query.toLowerCase()
    return base.filter(n => n.toLowerCase().includes(q))
  }, [options, query, allowedNames])

  const toggle = (name: string) => {
    const exists = value.includes(name)
    const next = exists ? value.filter(v => v !== name) : [...value, name]
    onChange(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => {
        const next = Math.min((prev < 0 ? -1 : prev) + 1, filtered.length - 1)
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => {
        const next = Math.max((prev < 0 ? filtered.length : prev) - 1, 0)
        return next
      })
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        e.preventDefault()
        toggle(filtered[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="allergy-listbox"
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `allergy-opt-${highlightedIndex}` : undefined}
          aria-describedby="allergy-combobox-help"
          className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800"
          placeholder={placeholder}
        />
      </div>

      <p id="allergy-combobox-help" className="sr-only">Use setas para navegar e Enter para selecionar múltiplas opções.</p>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full border border-slate-200 rounded-xl bg-white shadow-lg">
          {loading && (
            <div className="p-3 text-sm text-slate-500" aria-live="polite">Carregando medicamentos...</div>
          )}
          {error && (
            <div className="p-3 text-sm text-red-600" role="alert">{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="p-3 text-sm text-slate-500">Nenhum medicamento encontrado</div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul
              id="allergy-listbox"
              role="listbox"
              aria-multiselectable="true"
              className="max-h-56 overflow-auto divide-y divide-slate-100"
            >
              {filtered.map((name, i) => {
                const selected = value.includes(name)
                const highlighted = i === highlightedIndex
                return (
                  <li
                    id={`allergy-opt-${i}`}
                    key={name}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onMouseDown={(e) => { e.preventDefault(); toggle(name) }}
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer ${highlighted ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <span className={selected ? 'text-red-700 font-medium' : 'text-slate-800'}>
                      {name}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
