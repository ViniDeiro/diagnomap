export type RabiesConductInput = {
  initialCare?: string[]
  outcome?: 'none' | 'vaccine' | 'vaccine_serum'
  vaccineRoute?: 'id' | 'im'
  immunoglobulin?: 'sar' | 'ighar'
  previousProphylaxis?: 'none' | 'complete' | 'incomplete_unknown'
  immunosuppressed?: boolean
  observations?: string
}

export const buildRabiesConductText = (data: RabiesConductInput, weight?: number) => {
  const lines: string[] = []

  if ((data.initialCare || []).includes('wash')) {
    lines.push('Lavar abundantemente o ferimento com água corrente e sabão.')
  }

  if (data.outcome === 'none') {
    lines.push('Sem indicação de imunoprofilaxia antirrábica neste percurso; manter acompanhamento e orientações de retorno.')
  }

  if (data.outcome === 'vaccine' || data.outcome === 'vaccine_serum') {
    lines.push('Realizar profilaxia antirrábica com vacina nos dias 0, 3, 7 e 14.')

    if (data.vaccineRoute === 'id') {
      lines.push('Via intradérmica (ID): 0,2 mL por dia, divididos em duas aplicações de 0,1 mL em locais distintos, no antebraço ou na inserção do músculo deltoide.')
    }

    if (data.vaccineRoute === 'im') {
      lines.push('Via intramuscular (IM): administrar o volume integral da apresentação (0,5 mL ou 1,0 mL) no deltoide; em menores de 2 anos, utilizar o vasto lateral da coxa. Não aplicar no glúteo.')
    }
  }

  if (data.outcome === 'vaccine_serum') {
    const dose = weight && data.immunoglobulin
      ? Math.round(weight * (data.immunoglobulin === 'sar' ? 40 : 20))
      : undefined
    const product = data.immunoglobulin === 'sar'
      ? 'soro antirrábico (SAR, 40 UI/kg)'
      : data.immunoglobulin === 'ighar'
        ? 'imunoglobulina humana antirrábica (IGHAR, 20 UI/kg)'
        : 'SAR ou IGHAR, conforme disponibilidade'

    lines.push(`Administrar ${product}${dose ? `: ${dose.toLocaleString('pt-BR')} UI para ${weight} kg` : ''}.`)
    lines.push('Infiltrar o volume indicado dentro e ao redor de todas as lesões identificáveis; se não for possível, aplicar o restante por via IM em sítio distinto da vacina. Administrar no dia 0 ou, se indisponível, até o 7º dia após a primeira dose da vacina.')
  }

  if (data.previousProphylaxis !== 'none' || data.immunosuppressed) {
    lines.push('Confirmar histórico de profilaxia anterior, imunossupressão e eventual esquema de reexposição com a vigilância/protocolo vigente antes de emitir a prescrição definitiva.')
  }

  if (data.observations?.trim()) {
    lines.push(`Informações adicionais: ${data.observations.trim()}`)
  }

  return lines.join('\n')
}
