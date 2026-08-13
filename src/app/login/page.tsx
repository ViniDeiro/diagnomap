"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock } from 'lucide-react'
import { getCurrentDoctor, signInDoctor } from '@/services/doctorRepo'
import { supabase } from '@/services/supabaseClient'
import MedicalResponsibilityTerm, { MedicalTermDoctorInfo } from '@/components/MedicalResponsibilityTerm'
import ConfidentialityTerm from '@/components/ConfidentialityTerm'
import {
  CONFIDENTIALITY_TERM_VERSION,
  ConfidentialitySignature,
  ConfidentialitySigner,
  persistConfidentialityAgreement
} from '@/lib/confidentialityTerm'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingTermDoctor, setPendingTermDoctor] = useState<MedicalTermDoctorInfo | null>(null)
  const [pendingConfidentialitySigner, setPendingConfidentialitySigner] = useState<ConfidentialitySigner | null>(null)
  const [termLoading, setTermLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const signed = await signInDoctor(email, password)
      const confidentialityTerm = (signed.user?.user_metadata?.confidentiality_term || {}) as Record<string, unknown>
      if (confidentialityTerm.acceptedAt && !confidentialityTerm.agreementId) {
        const doctor = await getCurrentDoctor()
        setPendingConfidentialitySigner({
          name: doctor?.name || signed.user?.user_metadata?.name || signed.user?.email || '',
          crm: doctor?.crm || '',
          email: signed.user?.email || email,
          cpf: doctor?.cpf || null,
          unit: doctor?.unit || null,
          company: doctor?.company || null
        })
        return
      }
      const accepted = Boolean(signed.user?.user_metadata?.medical_responsibility_term?.acceptedAt)
      if (!accepted) {
        const doctor = await getCurrentDoctor()
        setPendingTermDoctor({
          name: doctor?.name || signed.user?.user_metadata?.name || signed.user?.email || '',
          crmUf: doctor?.crm || null,
          email: signed.user?.email || email
        })
        return
      }
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handlePersistPendingConfidentialityTerm = async (signature: ConfidentialitySignature) => {
    setError(null)
    setTermLoading(true)
    try {
      const { data: userResult } = await supabase.auth.getUser()
      if (!userResult.user) throw new Error('Sessão não encontrada. Entre novamente para concluir o cadastro.')
      const doctor = await getCurrentDoctor()
      if (!doctor?.id) throw new Error('Perfil médico não encontrado para vincular o documento.')
      const agreement = await persistConfidentialityAgreement(userResult.user.id, doctor.id, signature)
      const currentMetadata = userResult.user.user_metadata || {}
      await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          confidentiality_term: {
            version: CONFIDENTIALITY_TERM_VERSION,
            acceptedAt: signature.signedAt,
            signature: signature.signatureName,
            agreementId: agreement.id,
            pdfSha256: agreement.pdf_sha256
          }
        }
      })
      setPendingConfidentialitySigner(null)
      const acceptedResponsibility = Boolean(currentMetadata.medical_responsibility_term && (currentMetadata.medical_responsibility_term as Record<string, unknown>).acceptedAt)
      if (!acceptedResponsibility) {
        setPendingTermDoctor({
          name: doctor.name,
          crmUf: doctor.crm || null,
          cpf: doctor.cpf || null,
          unit: doctor.unit || null,
          company: doctor.company || null,
          email: doctor.email || signature.email
        })
        return
      }
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao concluir o registro do termo de confidencialidade')
    } finally {
      setTermLoading(false)
    }
  }

  const handleAcceptTerm = async () => {
    if (!pendingTermDoctor) return
    setError(null)
    setTermLoading(true)
    try {
      const acceptedAt = new Date().toISOString()
      const termPayload = {
        version: '2026-05-25',
        acceptedAt,
        signature: pendingTermDoctor.name,
        name: pendingTermDoctor.name,
        crmUf: pendingTermDoctor.crmUf || null,
        cpf: pendingTermDoctor.cpf || null,
        unit: pendingTermDoctor.unit || null,
        company: pendingTermDoctor.company || null,
        email: pendingTermDoctor.email || null
      }
      const { data: userRes } = await supabase.auth.getUser()
      const currentMetadata = userRes.user?.user_metadata || {}
      await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          medical_responsibility_term: termPayload
        }
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('medical_responsibility_term', JSON.stringify(termPayload))
      }
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar aceite do termo')
    } finally {
      setTermLoading(false)
    }
  }

  if (pendingTermDoctor) {
    return (
      <MedicalResponsibilityTerm
        doctor={pendingTermDoctor}
        loading={termLoading}
        onAccept={handleAcceptTerm}
      />
    )
  }

  if (pendingConfidentialitySigner) {
    return (
      <ConfidentialityTerm
        signer={pendingConfidentialitySigner}
        loading={termLoading}
        error={error}
        onSign={handlePersistPendingConfidentialityTerm}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Entrar</h1>
        </div>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Não tem conta? {' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Cadastre-se</Link>
        </div>
      </div>
    </div>
  )
}
