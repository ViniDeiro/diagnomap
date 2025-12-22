"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, MapPin } from 'lucide-react'
import { signUpDoctor, signInDoctor } from '@/services/doctorRepo'
import { supabase } from '@/services/supabaseClient'

type Municipality = { id: number; name: string; uf?: string }

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('')
  const [municipalityId, setMunicipalityId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMunicipalities = async () => {
      const { data, error } = await supabase.from('municipalities').select('id,name,uf').order('name', { ascending: true })
      if (!error && data) {
        const rows = data as Municipality[]
        setMunicipalities(rows)
        const distinctUfs = Array.from(new Set(rows.map(r => (r.uf || '').trim()).filter(Boolean))).sort()
        setUfs(distinctUfs)
      }
    }
    loadMunicipalities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUpDoctor(email, password, {
        name,
        municipality_id: municipalityId ?? null,
        status: 'active'
      })
      try {
        await signInDoctor(email, password)
      } catch {}
      router.push('/')
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Cadastro</h1>
        </div>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <UserPlus className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent py-3 outline-none"
                placeholder="Nome completo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <Mail className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 outline-none"
                placeholder="exemplo@hospital.gov.br"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <Lock className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-3 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado (UF)</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
                <MapPin className="w-5 h-5 text-slate-400 mr-2" />
                <select
                  value={selectedUf}
                  onChange={(e) => {
                    const uf = e.target.value
                    setSelectedUf(uf)
                    setMunicipalityId(null)
                  }}
                  className="w-full bg-transparent py-3 outline-none"
                >
                  <option value="">Selecione...</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Município</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
                <MapPin className="w-5 h-5 text-slate-400 mr-2" />
                <select
                  value={municipalityId ?? ''}
                  onChange={(e) => setMunicipalityId(Number(e.target.value) || null)}
                  className="w-full bg-transparent py-3 outline-none"
                  disabled={!selectedUf}
                >
                  <option value="">{selectedUf ? 'Selecione...' : 'Escolha o estado primeiro'}</option>
                  {municipalities
                    .filter(m => (m.uf || '').trim() === selectedUf)
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Já tem conta? {' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
        </div>
      </div>
    </div>
  )
}
