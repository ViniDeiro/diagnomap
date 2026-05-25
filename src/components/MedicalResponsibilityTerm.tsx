'use client'

import React, { useState } from 'react'
import { CheckCircle, FileText, ShieldCheck } from 'lucide-react'

export type MedicalTermDoctorInfo = {
  name: string
  crmUf?: string | null
  cpf?: string | null
  unit?: string | null
  company?: string | null
  email?: string | null
}

interface MedicalResponsibilityTermProps {
  doctor: MedicalTermDoctorInfo
  loading?: boolean
  onAccept: () => void
}

const TERM_SECTIONS = [
  {
    title: '1. Do objeto',
    text: 'O presente Termo regula a ciência e responsabilidade do(a) médico(a) quanto à utilização do sistema de apoio à conduta médica, composto por fluxogramas, protocolos clínicos, orientações técnicas e diretrizes assistenciais. O sistema possui caráter orientativo, educativo, técnico e de apoio à decisão clínica, não substituindo atuação médica individualizada, raciocínio clínico, anamnese, exame físico, análise de exames, avaliação específica do paciente ou autonomia técnica.'
  },
  {
    title: '2. Da natureza auxiliar do sistema',
    text: 'Os fluxogramas e protocolos são instrumentos de apoio à tomada de decisão e devem ser utilizados como referência técnica complementar. O uso do sistema não configura determinação automática de diagnóstico, prescrição, solicitação de exames, alta, internação, encaminhamento ou qualquer outra conduta médica. Toda conduta deve considerar queixa principal, história clínica, anamnese, exame físico, sinais vitais, exames, hipóteses diagnósticas, riscos individuais, contraindicações, alergias, comorbidades, evolução clínica, protocolos institucionais, condições da unidade e normas éticas e legais.'
  },
  {
    title: '3. Da responsabilidade médica pela conduta',
    text: 'O(a) médico(a) permanece integralmente responsável pela avaliação clínica, hipóteses diagnósticas, diagnóstico, prescrição, orientação, solicitação de exames, encaminhamento, alta, internação, acompanhamento e demais condutas adotadas. A utilização do sistema não transfere responsabilidade à instituição, empresa contratante, desenvolvedores, responsáveis técnicos ou terceiros.'
  },
  {
    title: '4. Da autonomia técnica do médico',
    text: 'O(a) médico(a) possui autonomia técnica para seguir ou não as orientações sugeridas pelo sistema quando as particularidades do caso concreto indicarem conduta diversa. Divergências devem ser fundamentadas no prontuário. A adesão ao fluxo também não exime avaliação crítica de pertinência, adequação e segurança.'
  },
  {
    title: '5. Do diagnóstico e da prescrição',
    text: 'Diagnóstico e prescrição são atos médicos de responsabilidade do(a) profissional, devendo decorrer da avaliação individualizada, dados clínicos, exames complementares, contraindicações, alergias, interações, protocolos aplicáveis e normas sanitárias. O sistema pode apresentar sugestões e alertas, mas a decisão final cabe exclusivamente ao(à) médico(a).'
  },
  {
    title: '6. Do registro em prontuário',
    text: 'O(a) médico(a) deve registrar adequadamente no prontuário identificação do paciente, anamnese, exame físico, sinais vitais, exames, hipóteses, diagnóstico, tratamento, conduta, orientações, justificativas, evolução, encaminhamentos, alta, internação, retorno e identificação profissional com assinatura e CRM. O uso do sistema não substitui o preenchimento adequado do prontuário.'
  },
  {
    title: '7. Do dever de informação ao paciente',
    text: 'O(a) médico(a) deve prestar informações claras e compreensíveis ao paciente e/ou responsável sobre condição clínica, hipóteses, riscos, benefícios, alternativas, limitações e condutas propostas. O sistema não substitui comunicação, orientação, esclarecimento e obtenção de consentimento quando necessário.'
  },
  {
    title: '8. Do sigilo, confidencialidade e proteção de dados',
    text: 'O(a) médico(a) compromete-se a observar sigilo profissional, confidencialidade e proteção de dados pessoais e sensíveis. É vedado compartilhar login, senha, credenciais, imagens, telas, dados de pacientes ou informações do sistema com terceiros não autorizados. Suspeitas de acesso indevido, falha de segurança ou incidente devem ser comunicadas imediatamente.'
  },
  {
    title: '9. Das limitações do sistema',
    text: 'O sistema pode estar sujeito a limitações técnicas, atualizações, indisponibilidades, falhas de conexão, manutenção, ausência de protocolo ou desatualização pontual. Na indisponibilidade, inconsistência ou ausência de fluxo aplicável, o(a) médico(a) deve adotar a conduta adequada ao caso concreto, sem uso automático, mecânico ou acrítico.'
  },
  {
    title: '10. Da atualização e melhoria contínua',
    text: 'Fluxogramas e protocolos poderão ser atualizados, revisados, substituídos ou descontinuados conforme literatura médica, diretrizes, normas, protocolos assistenciais e necessidades operacionais. O(a) médico(a) deve observar a versão vigente e pode comunicar inconsistências, dúvidas ou sugestões.'
  },
  {
    title: '11. Das obrigações do médico usuário',
    text: 'O(a) médico(a) compromete-se a utilizar o sistema de forma ética, técnica e responsável; avaliar criticamente as orientações; manter autonomia técnica; registrar a assistência no prontuário; justificar adaptações; preservar sigilo; proteger credenciais; não compartilhar dados indevidamente; observar Código de Ética Médica, resoluções, legislação sanitária, LGPD e demais normas aplicáveis.'
  },
  {
    title: '12. Da ciência quanto à inexistência de substituição do ato médico',
    text: 'O(a) médico(a) declara ciência de que o sistema é ferramenta de apoio, não substitui o ato médico, não realiza diagnóstico autônomo, não prescreve de forma autônoma, não substitui anamnese, exame físico, raciocínio clínico ou registro em prontuário, e não afasta responsabilidade ética, civil, administrativa ou penal quando aplicável.'
  },
  {
    title: '13. Da declaração de ciência e responsabilidade',
    text: 'O(a) médico(a) declara que leu, compreendeu e aceita as condições previstas neste Termo, comprometendo-se a utilizar o sistema de forma responsável, técnica, ética e compatível com as boas práticas médicas. Reconhece que uso inadequado, negligente, imprudente, imperito, indevido, acrítico ou incompatível poderá ensejar apuração de responsabilidade.'
  },
  {
    title: '14. Da vigência',
    text: 'O Termo passa a produzir efeitos a partir da data de assinatura e permanece válido enquanto o(a) médico(a) possuir acesso ao sistema ou atuar em unidade na qual a ferramenta seja disponibilizada. A instituição poderá solicitar nova assinatura em caso de atualização relevante, alteração de fluxos, mudança normativa ou revisão das condições de uso.'
  }
]

export default function MedicalResponsibilityTerm({ doctor, loading, onAccept }: MedicalResponsibilityTermProps) {
  const [checked, setChecked] = useState(false)
  const today = new Date().toLocaleDateString('pt-BR')
  const signature = doctor.name?.trim() || 'Nome não informado'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-700 to-slate-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100">Termo obrigatório</p>
              <h1 className="mt-1 text-2xl font-extrabold">Ciência, responsabilidade e uso do sistema</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-50">
                Revise os dados profissionais e confirme o aceite para liberar o acesso à plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-800">
              <FileText className="h-4 w-4" />
              Identificação
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Nome</dt>
                <dd className="font-bold text-slate-900">{doctor.name || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">CRM/UF</dt>
                <dd className="font-bold text-slate-900">{doctor.crmUf || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">CPF</dt>
                <dd className="font-bold text-slate-900">{doctor.cpf || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Unidade de atuação</dt>
                <dd className="font-bold text-slate-900">{doctor.unit || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Empresa/Contratante</dt>
                <dd className="font-bold text-slate-900">{doctor.company || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Local e data</dt>
                <dd className="font-bold text-slate-900">{today}</dd>
              </div>
            </dl>
          </aside>

          <main className="p-5">
            <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-900">
                Termo de Ciência, Responsabilidade e Uso de Sistema de Apoio à Conduta Médica
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Pelo presente instrumento, o(a) médico(a) acima identificado(a) declara, para todos os fins, que tomou ciência das condições de utilização do sistema de fluxogramas e protocolos clínicos disponibilizado pela instituição.
              </p>

              <div className="mt-5 space-y-5">
                {TERM_SECTIONS.map((section) => (
                  <section key={section.title}>
                    <h3 className="text-sm font-extrabold text-slate-900">{section.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{section.text}</p>
                  </section>
                ))}

                <section>
                  <h3 className="text-sm font-extrabold text-slate-900">15. Assinatura</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    E, por estar ciente e de acordo com os termos acima, o(a) médico(a) assina eletronicamente o presente Termo.
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p><strong>Médico(a):</strong> {doctor.name || 'Não informado'}</p>
                    <p><strong>CRM/UF:</strong> {doctor.crmUf || 'Não informado'}</p>
                    <p><strong>Assinatura eletrônica:</strong> {signature}</p>
                  </div>
                </section>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm leading-relaxed text-blue-950">
                Declaro que li, compreendi e aceito o Termo de Ciência, Responsabilidade e Uso de Sistema de Apoio à Conduta Médica, assinando eletronicamente com meu nome completo.
              </span>
            </label>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!checked || loading}
                onClick={onAccept}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <CheckCircle className="h-4 w-4" />
                {loading ? 'Registrando aceite...' : 'Assinar termo e continuar'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
