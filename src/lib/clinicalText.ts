export const formatChiefComplaintWithDuration = (
  complaint?: string | null,
  duration?: string | null,
  fallback = 'motivo do atendimento não informado'
) => {
  const cleanComplaint = complaint?.trim().replace(/[.;,]+$/, '') || fallback
  const cleanDuration = duration?.trim().replace(/[.;,]+$/, '')
  if (!cleanDuration) return cleanComplaint

  const complaintLower = cleanComplaint.toLocaleLowerCase('pt-BR')
  const durationLower = cleanDuration.toLocaleLowerCase('pt-BR')
  if (complaintLower.includes(durationLower)) return cleanComplaint

  if (/^(há|desde|com\s+(?:início|evolução|duração)|início\s+)/i.test(cleanDuration)) {
    const joinedDuration = /^Há\b/.test(cleanDuration)
      ? `há${cleanDuration.slice(2)}`
      : cleanDuration.charAt(0).toLocaleLowerCase('pt-BR') + cleanDuration.slice(1)
    return `${cleanComplaint} ${joinedDuration}`
  }

  return `${cleanComplaint} há ${cleanDuration}`
}
