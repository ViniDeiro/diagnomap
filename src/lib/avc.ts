export type AVCTimeWindow = 'ate_45h' | '45_6h' | '6_9h' | '9_24h' | 'mais_24h' | 'desconhecida'
export type AVCVesselTerritory = 'grande_anterior' | 'm2_dominante' | 'medio_distal' | 'basilar' | 'sem_ogv'
export type AVCThrombectomyRecommendation = 'forte' | 'considerar' | 'sem_beneficio' | 'dados_insuficientes'
export type AVCThrombolytic = 'tenecteplase' | 'alteplase'

export const parseAVCBloodPressure = (value?: string | null) => {
  if (!value) return null
  const match = value.trim().match(/^(\d{2,3})\s*[\/xX]\s*(\d{2,3})$/)
  if (!match) return null
  const systolic = Number(match[1])
  const diastolic = Number(match[2])
  if (systolic <= 0 || diastolic <= 0) return null
  return { systolic, diastolic }
}

export const isAVCBloodPressureWithinThrombolysisLimit = (value?: string | null) => {
  const pressure = parseAVCBloodPressure(value)
  return Boolean(pressure && pressure.systolic <= 185 && pressure.diastolic <= 110)
}

export type AVCThrombectomyInput = {
  vesselTerritory?: AVCVesselTerritory
  timeWindow?: AVCTimeWindow
  aspects?: number
  pcAspects?: number
  premorbidRankin?: number
  nihss?: number
}

export const evaluateAVCThrombectomy = ({
  vesselTerritory,
  timeWindow,
  aspects,
  pcAspects,
  premorbidRankin,
  nihss = 0
}: AVCThrombectomyInput): AVCThrombectomyRecommendation => {
  if (!vesselTerritory || vesselTerritory === 'sem_ogv') return 'sem_beneficio'
  if (!timeWindow || timeWindow === 'mais_24h') return 'dados_insuficientes'
  if (vesselTerritory === 'medio_distal') return 'sem_beneficio'

  if (vesselTerritory === 'm2_dominante') {
    if (aspects == null) return 'dados_insuficientes'
    const early = timeWindow === 'ate_45h' || timeWindow === '45_6h'
    return early && aspects >= 6 && (premorbidRankin ?? 9) <= 1 ? 'considerar' : 'dados_insuficientes'
  }

  if (vesselTerritory === 'basilar') {
    if (pcAspects == null || pcAspects < 6 || (premorbidRankin ?? 9) >= 2) return 'dados_insuficientes'
    return nihss >= 10 ? 'forte' : nihss >= 6 ? 'considerar' : 'dados_insuficientes'
  }

  if (vesselTerritory === 'grande_anterior') {
    if (aspects == null) return 'dados_insuficientes'
    const rankin = premorbidRankin ?? 9
    if (rankin > 4) return 'dados_insuficientes'
    const early = timeWindow === 'ate_45h' || timeWindow === '45_6h'
    if (early) {
      if (aspects >= 6) return rankin <= 1 ? 'forte' : rankin <= 4 ? 'considerar' : 'dados_insuficientes'
      if (aspects >= 3) return rankin <= 1 ? 'forte' : 'dados_insuficientes'
      return rankin <= 1 ? 'considerar' : 'dados_insuficientes'
    }
    if (timeWindow === '6_9h' || timeWindow === '9_24h' || timeWindow === 'desconhecida') {
      return aspects >= 3 && rankin <= 1 ? 'forte' : 'dados_insuficientes'
    }
  }

  return 'dados_insuficientes'
}

export const calculateAVCThrombolyticDose = (weight?: number, thrombolytic?: AVCThrombolytic): string => {
  if (!weight || weight <= 0 || !thrombolytic) return ''
  if (thrombolytic === 'tenecteplase') {
    const total = Math.min(25, weight * 0.25)
    return `Tenecteplase: ${total.toFixed(1).replace('.', ',')} mg EV em bolus único (máximo 25 mg).`
  }
  const total = Math.min(90, weight * 0.9)
  const bolus = total * 0.1
  return `Alteplase: ${total.toFixed(1).replace('.', ',')} mg no total; ${bolus.toFixed(1).replace('.', ',')} mg em bolus e ${(total - bolus).toFixed(1).replace('.', ',')} mg em 60 minutos.`
}
