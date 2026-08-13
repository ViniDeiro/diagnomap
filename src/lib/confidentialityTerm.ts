import jsPDF from 'jspdf'
import { supabase } from '@/services/supabaseClient'

export const CONFIDENTIALITY_TERM_VERSION = '2026-08-13'
export const CONFIDENTIALITY_BUCKET = 'confidentiality-terms'

export const CONFIDENTIALITY_TERM_PARAGRAPHS = [
  'Pelo presente instrumento, {{NOME}}, CRM nº {{CRM}} ("Parte Receptora"), compromete-se a manter absoluto sigilo sobre todas as informações, documentos, dados, apresentações, materiais, estratégias, modelos de negócio e demais conteúdos compartilhados pela SIGA O FLUXO LTDA, inscrita no CNPJ sob o nº 65.818.915/0001-54, com sede na Avenida Brigadeiro Faria Lima, nº 1811, Jardim Paulistano, São Paulo/SP, CEP 01452-001 ("Parte Reveladora"), inclusive as informações acessadas durante o teste e a avaliação do sistema, seja de forma verbal, escrita, digital ou visual.',
  'A Parte Receptora compromete-se a:',
  'a) utilizar as informações e o acesso ao sistema exclusivamente para realizar testes, avaliar suas funcionalidades e fornecer comentários à Parte Reveladora;',
  'b) não divulgar, reproduzir, compartilhar ou disponibilizar as informações a terceiros sem autorização prévia e expressa da Parte Reveladora;',
  'c) adotar as medidas necessárias para preservar a confidencialidade das informações recebidas.',
  'As informações compartilhadas e o sistema permanecem de propriedade exclusiva da SIGA O FLUXO LTDA, não implicando qualquer cessão de direitos, transferência de tecnologia, propriedade intelectual ou autorização de uso comercial.',
  'A obrigação de confidencialidade permanecerá vigente pelo prazo de 5 (cinco) anos contados da assinatura deste Termo.',
  'O descumprimento das obrigações aqui previstas sujeitará a Parte Receptora à responsabilização por eventuais perdas e danos causados à SIGA O FLUXO LTDA.',
  'Por estarem de acordo, as partes assinam o presente Termo.'
] as const

export type ConfidentialitySigner = {
  name: string
  crm: string
  email: string
  cpf?: string | null
  unit?: string | null
  company?: string | null
}

export type ConfidentialitySignature = ConfidentialitySigner & {
  signatureName: string
  signedAt: string
  userAgent?: string | null
}

export type ConfidentialityAgreementRow = {
  id: string
  auth_user_id: string
  doctor_id: string | null
  full_name: string
  crm: string
  email: string
  term_version: string
  signed_at: string
  signature_name: string
  pdf_path: string
  pdf_sha256: string
  created_at: string
}

function fillTermText(text: string, signer: ConfidentialitySigner) {
  return text.replace('{{NOME}}', signer.name).replace('{{CRM}}', signer.crm)
}

function addWrappedText(pdf: jsPDF, text: string, y: number, options?: { bold?: boolean; indent?: number }) {
  const indent = options?.indent ?? 0
  pdf.setFont('times', options?.bold ? 'bold' : 'normal')
  pdf.setFontSize(10.5)
  const lines = pdf.splitTextToSize(text, 170 - indent) as string[]
  pdf.text(lines, 20 + indent, y, { align: 'justify', maxWidth: 170 - indent, lineHeightFactor: 1.35 })
  return y + (lines.length * 5.1) + 3.2
}

export function buildConfidentialityTermPdf(signature: ConfidentialitySignature): Blob {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  pdf.setProperties({
    title: 'Termo de Confidencialidade - Siga o Fluxo',
    subject: `Termo assinado eletronicamente por ${signature.name}`,
    author: 'SIGA O FLUXO LTDA',
    creator: 'Siga o Fluxo'
  })

  pdf.setFont('times', 'bold')
  pdf.setFontSize(15)
  pdf.text('TERMO DE CONFIDENCIALIDADE', 105, 22, { align: 'center' })

  let y = 36
  CONFIDENTIALITY_TERM_PARAGRAPHS.forEach((paragraph, index) => {
    const text = fillTermText(paragraph, signature)
    y = addWrappedText(pdf, text, y, { bold: index === 1, indent: index >= 2 && index <= 4 ? 4 : 0 })
  })

  y += 4
  pdf.setDrawColor(60)
  pdf.line(20, y, 88, y)
  pdf.line(122, y, 190, y)
  pdf.setFont('times', 'bold')
  pdf.setFontSize(10)
  pdf.text('SIGA O FLUXO LTDA', 54, y + 6, { align: 'center' })
  pdf.text('PARTE RECEPTORA', 156, y + 6, { align: 'center' })
  pdf.setFont('times', 'normal')
  pdf.text('Representante: Dr. Rodrigo Machado', 54, y + 12, { align: 'center' })
  pdf.text(signature.name, 156, y + 12, { align: 'center', maxWidth: 66 })
  pdf.text(`CRM: ${signature.crm}`, 156, y + 17, { align: 'center' })

  const signedDate = new Date(signature.signedAt)
  const auditY = Math.min(276, y + 30)
  pdf.setDrawColor(190)
  pdf.line(20, auditY - 5, 190, auditY - 5)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('REGISTRO DA ASSINATURA ELETRÔNICA', 20, auditY)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.text(`Assinado por: ${signature.signatureName} | E-mail: ${signature.email}`, 20, auditY + 4.5)
  pdf.text(`Data e hora: ${signedDate.toLocaleString('pt-BR')} | Versão do termo: ${CONFIDENTIALITY_TERM_VERSION}`, 20, auditY + 9)
  pdf.text('A assinatura foi confirmada mediante autenticação e declaração expressa de concordância na plataforma.', 20, auditY + 13.5)

  return pdf.output('blob')
}

async function sha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function persistConfidentialityAgreement(
  authUserId: string,
  doctorId: string | null,
  signature: ConfidentialitySignature
): Promise<ConfidentialityAgreementRow> {
  const agreementId = crypto.randomUUID()
  const pdf = buildConfidentialityTermPdf(signature)
  const pdfSha256 = await sha256(pdf)
  const pdfPath = `${authUserId}/${agreementId}.pdf`

  const { error: uploadError } = await supabase.storage
    .from(CONFIDENTIALITY_BUCKET)
    .upload(pdfPath, pdf, { contentType: 'application/pdf', upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('confidentiality_agreements')
    .insert({
      id: agreementId,
      auth_user_id: authUserId,
      doctor_id: doctorId,
      full_name: signature.name,
      crm: signature.crm,
      email: signature.email.toLowerCase(),
      term_version: CONFIDENTIALITY_TERM_VERSION,
      signed_at: signature.signedAt,
      signature_name: signature.signatureName,
      pdf_path: pdfPath,
      pdf_sha256: pdfSha256,
      user_agent: signature.userAgent || null,
      metadata: {
        cpf: signature.cpf || null,
        unit: signature.unit || null,
        company: signature.company || null
      }
    })
    .select('*')
    .single()

  if (error) {
    await supabase.storage.from(CONFIDENTIALITY_BUCKET).remove([pdfPath])
    throw error
  }
  return data as ConfidentialityAgreementRow
}

export async function createConfidentialityPdfDownload(pdfPath: string, fileName: string) {
  const { data, error } = await supabase.storage.from(CONFIDENTIALITY_BUCKET).createSignedUrl(pdfPath, 60, {
    download: fileName
  })
  if (error) throw error
  return data.signedUrl
}
