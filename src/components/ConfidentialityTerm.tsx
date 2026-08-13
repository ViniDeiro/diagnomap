'use client'

import React, { useMemo, useState } from 'react'
import { CheckCircle2, FileSignature, ShieldCheck } from 'lucide-react'
import {
  CONFIDENTIALITY_TERM_PARAGRAPHS,
  CONFIDENTIALITY_TERM_VERSION,
  ConfidentialitySignature,
  ConfidentialitySigner
} from '@/lib/confidentialityTerm'

type ConfidentialityTermProps = {
  signer: ConfidentialitySigner
  loading?: boolean
  error?: string | null
  onBack?: () => void
  onSign: (signature: ConfidentialitySignature) => void
}

export default function ConfidentialityTerm({ signer, loading, error, onBack, onSign }: ConfidentialityTermProps) {
  const [signatureName, setSignatureName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const normalizedExpectedName = useMemo(() => signer.name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR'), [signer.name])
  const normalizedSignature = signatureName.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
  const signatureMatches = normalizedSignature === normalizedExpectedName

  const submit = () => {
    if (!accepted || !signatureMatches || loading) return
    onSign({
      ...signer,
      signatureName: signatureName.trim().replace(/\s+/g, ' '),
      signedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100">Etapa obrigatória do cadastro</p>
              <h1 className="mt-1 text-2xl font-extrabold">Termo de Confidencialidade</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-50">A conta será criada somente depois da leitura, concordância e assinatura eletrônica deste documento.</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[300px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-800"><FileSignature className="h-4 w-4" />Parte receptora</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Nome completo</dt><dd className="font-bold text-slate-900">{signer.name}</dd></div>
              <div><dt className="font-semibold text-slate-500">CRM/UF</dt><dd className="font-bold text-slate-900">{signer.crm}</dd></div>
              <div><dt className="font-semibold text-slate-500">E-mail</dt><dd className="break-all font-bold text-slate-900">{signer.email}</dd></div>
              <div><dt className="font-semibold text-slate-500">Versão do termo</dt><dd className="font-bold text-slate-900">{CONFIDENTIALITY_TERM_VERSION}</dd></div>
            </dl>
            {onBack && <button type="button" onClick={onBack} disabled={loading} className="mt-6 text-sm font-bold text-slate-600 hover:text-blue-700 disabled:opacity-50">Corrigir dados do cadastro</button>}
          </aside>

          <main className="p-5 sm:p-6">
            <article className="max-h-[50vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">
              <h2 className="text-center text-lg font-extrabold uppercase tracking-wide text-slate-950">Termo de Confidencialidade</h2>
              <div className="mt-5 space-y-4">
                {CONFIDENTIALITY_TERM_PARAGRAPHS.map((paragraph, index) => (
                  <p key={paragraph} className={index === 1 ? 'font-extrabold text-slate-950' : index >= 2 && index <= 4 ? 'pl-4' : ''}>
                    {paragraph.replace('{{NOME}}', signer.name).replace('{{CRM}}', signer.crm)}
                  </p>
                ))}
              </div>
              <div className="mt-6 grid gap-6 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <div><div className="border-t border-slate-500 pt-2 text-center font-bold text-slate-900">SIGA O FLUXO LTDA</div><p className="text-center text-xs">Representante: Dr. Rodrigo Machado</p></div>
                <div><div className="border-t border-slate-500 pt-2 text-center font-bold text-slate-900">PARTE RECEPTORA</div><p className="text-center text-xs">{signer.name} · {signer.crm}</p></div>
              </div>
            </article>

            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <label className="block text-sm font-bold text-blue-950" htmlFor="confidentiality-signature">Digite seu nome completo para assinar</label>
              <input id="confidentiality-signature" type="text" value={signatureName} onChange={(event) => setSignatureName(event.target.value)} disabled={loading} autoComplete="name" className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder={signer.name} />
              {signatureName && !signatureMatches && <p className="mt-2 text-xs font-semibold text-red-700">A assinatura deve corresponder exatamente ao nome completo informado no cadastro.</p>}
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-blue-950">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} disabled={loading} className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-700 focus:ring-blue-500" />
                <span>Declaro que li integralmente, compreendi e aceito o Termo de Confidencialidade, reconhecendo meu nome digitado acima como assinatura eletrônica.</span>
              </label>
            </div>

            <button type="button" onClick={submit} disabled={!accepted || !signatureMatches || loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-700/20 transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
              <CheckCircle2 className="h-5 w-5" />
              {loading ? 'Criando conta e registrando documento...' : 'Assinar termo e concluir cadastro'}
            </button>
          </main>
        </div>
      </div>
    </div>
  )
}
