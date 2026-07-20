export type IntakeSymptom = {
  id: string
  label: string
  group: 'geral' | 'neurologico' | 'cardiorrespiratorio' | 'gastrointestinal' | 'urinario' | 'pele_exposicao'
  critical?: boolean
}

export type ClinicalRouteDefinition = {
  flowchartId: string
  keywords: string[]
  symptomIds: string[]
  urgency: 'critica' | 'prioritaria' | 'rotina'
  shortDescription: string
}

export type ClinicalRouteSuggestion = {
  flowchartId: string
  score: number
  confidence: 'alta' | 'moderada' | 'possivel'
  urgency: ClinicalRouteDefinition['urgency']
  reasons: string[]
  shortDescription: string
}

export const INTAKE_SYMPTOMS: IntakeSymptom[] = [
  { id: 'febre', label: 'Febre', group: 'geral' },
  { id: 'prostracao', label: 'Prostração ou mal-estar intenso', group: 'geral' },
  { id: 'hipotensao', label: 'Desmaio, choque ou pressão baixa', group: 'geral', critical: true },
  { id: 'confusao', label: 'Confusão ou rebaixamento de consciência', group: 'neurologico', critical: true },
  { id: 'deficit_focal', label: 'Fraqueza de um lado ou fala alterada', group: 'neurologico', critical: true },
  { id: 'cefaleia', label: 'Dor de cabeça', group: 'neurologico' },
  { id: 'vertigem', label: 'Tontura ou vertigem', group: 'neurologico' },
  { id: 'paralisia_facial', label: 'Paralisia facial', group: 'neurologico' },
  { id: 'dor_toracica', label: 'Dor no peito', group: 'cardiorrespiratorio', critical: true },
  { id: 'dispneia', label: 'Falta de ar', group: 'cardiorrespiratorio', critical: true },
  { id: 'chiado', label: 'Chiado ou broncoespasmo', group: 'cardiorrespiratorio' },
  { id: 'palpitacao', label: 'Palpitações', group: 'cardiorrespiratorio' },
  { id: 'pressao_alta', label: 'Pressão muito elevada', group: 'cardiorrespiratorio', critical: true },
  { id: 'edema_perna', label: 'Dor ou inchaço em uma perna', group: 'cardiorrespiratorio' },
  { id: 'dor_abdominal', label: 'Dor abdominal', group: 'gastrointestinal' },
  { id: 'dor_epigastrica', label: 'Dor forte na parte alta do abdome', group: 'gastrointestinal' },
  { id: 'vomitos', label: 'Náuseas ou vômitos', group: 'gastrointestinal' },
  { id: 'diarreia', label: 'Diarreia', group: 'gastrointestinal' },
  { id: 'ictericia', label: 'Pele ou olhos amarelados', group: 'gastrointestinal', critical: true },
  { id: 'disuria', label: 'Dor ou ardência para urinar', group: 'urinario' },
  { id: 'dor_lombar', label: 'Dor lombar', group: 'urinario' },
  { id: 'urticaria', label: 'Urticária, coceira ou edema', group: 'pele_exposicao' },
  { id: 'mordedura', label: 'Mordedura ou contato com animal', group: 'pele_exposicao' },
  { id: 'picada', label: 'Picada de aranha', group: 'pele_exposicao' },
  { id: 'exposicao_hiv', label: 'Exposição com risco para HIV', group: 'pele_exposicao' },
  { id: 'sangramento_nasal', label: 'Sangramento nasal', group: 'pele_exposicao' },
  { id: 'dor_articular', label: 'Articulação única dolorosa ou inchada', group: 'pele_exposicao' },
  { id: 'agitacao', label: 'Agitação ou alteração comportamental', group: 'neurologico', critical: true },
  { id: 'ansiedade', label: 'Ansiedade ou crise de pânico', group: 'geral' }
]

const routes: ClinicalRouteDefinition[] = [
  { flowchartId: 'avc', symptomIds: ['deficit_focal', 'confusao', 'paralisia_facial', 'vertigem'], keywords: ['fraqueza de um lado', 'boca torta', 'fala enrolada', 'nao consegue falar', 'perda de forca', 'avc', 'derrame', 'hemiparesia'], urgency: 'critica', shortDescription: 'Déficit neurológico focal de início agudo.' },
  { flowchartId: 'hipertensao', symptomIds: ['pressao_alta', 'cefaleia', 'confusao', 'dor_toracica', 'dispneia'], keywords: ['pressao alta', 'pressao muito alta', 'pa elevada', 'hipertensao', '210/120', '200/120', '180/110'], urgency: 'critica', shortDescription: 'Elevação pressórica com pesquisa de lesão aguda.' },
  { flowchartId: 'iam', symptomIds: ['dor_toracica', 'dispneia', 'prostracao'], keywords: ['dor no peito', 'aperto no peito', 'dor precordial', 'dor irradiando', 'infarto', 'sudorese fria'], urgency: 'critica', shortDescription: 'Dor torácica ou equivalente isquêmico.' },
  { flowchartId: 'tep', symptomIds: ['dispneia', 'dor_toracica', 'edema_perna', 'hipotensao'], keywords: ['falta de ar subita', 'dispneia subita', 'dor pleuritica', 'hemoptise', 'embolia pulmonar'], urgency: 'critica', shortDescription: 'Dispneia/dor torácica com risco tromboembólico.' },
  { flowchartId: 'anafilaxia', symptomIds: ['urticaria', 'dispneia', 'chiado', 'hipotensao'], keywords: ['reacao alergica', 'alergia grave', 'inchaco da lingua', 'edema de labios', 'anafilaxia', 'depois de comer', 'depois de medicamento'], urgency: 'critica', shortDescription: 'Reação sistêmica rápida com ameaça respiratória ou circulatória.' },
  { flowchartId: 'asthma', symptomIds: ['dispneia', 'chiado'], keywords: ['asma', 'chiado no peito', 'broncoespasmo', 'bombinha', 'sibilancia'], urgency: 'prioritaria', shortDescription: 'Broncoespasmo ou exacerbação asmática.' },
  { flowchartId: 'dpoc_exacerbado', symptomIds: ['dispneia', 'chiado'], keywords: ['dpoc', 'enfisema', 'bronquite cronica', 'fumante', 'escarro aumentado'], urgency: 'prioritaria', shortDescription: 'Piora respiratória em paciente com DPOC.' },
  { flowchartId: 'pneumonia', symptomIds: ['febre', 'dispneia', 'prostracao'], keywords: ['tosse com catarro', 'pneumonia', 'dor para respirar', 'escarro', 'crepitacoes'], urgency: 'prioritaria', shortDescription: 'Síndrome respiratória baixa com possível infecção pulmonar.' },
  { flowchartId: 'influenza', symptomIds: ['febre', 'prostracao'], keywords: ['gripe', 'tosse seca', 'dor no corpo', 'coriza', 'sindrome gripal', 'influenza'], urgency: 'rotina', shortDescription: 'Síndrome gripal aguda.' },
  { flowchartId: 'dengue', symptomIds: ['febre', 'cefaleia', 'prostracao', 'dor_abdominal', 'vomitos', 'hipotensao'], keywords: ['dengue', 'dor atras dos olhos', 'dor retro orbitaria', 'mialgia', 'petequias', 'prova do laco'], urgency: 'prioritaria', shortDescription: 'Síndrome febril compatível com arbovirose e sinais de alarme.' },
  { flowchartId: 'cefaleia', symptomIds: ['cefaleia', 'vomitos', 'confusao'], keywords: ['dor de cabeca', 'cefaleia', 'pior dor da vida', 'enxaqueca', 'fotofobia'], urgency: 'prioritaria', shortDescription: 'Cefaleia primária ou secundária com estratificação de alarme.' },
  { flowchartId: 'sindrome_vertiginosa', symptomIds: ['vertigem', 'vomitos', 'deficit_focal'], keywords: ['vertigem', 'tudo girando', 'labirintite', 'desequilibrio', 'nistagmo'], urgency: 'prioritaria', shortDescription: 'Síndrome vestibular com diferenciação central/periférica.' },
  { flowchartId: 'paralisia_bell', symptomIds: ['paralisia_facial'], keywords: ['paralisia facial', 'boca torta', 'nao fecha o olho', 'bell'], urgency: 'prioritaria', shortDescription: 'Paresia facial periférica após exclusão de causa central.' },
  { flowchartId: 'geca', symptomIds: ['diarreia', 'vomitos', 'dor_abdominal', 'febre'], keywords: ['gastroenterite', 'diarreia aguda', 'vomito e diarreia', 'fezes liquidas'], urgency: 'rotina', shortDescription: 'Gastroenterite aguda com avaliação de hidratação.' },
  { flowchartId: 'diarreia', symptomIds: ['diarreia', 'dor_abdominal', 'febre'], keywords: ['diarreia', 'sangue nas fezes', 'muco nas fezes', 'diarreia persistente'], urgency: 'rotina', shortDescription: 'Investigação e manejo direcionado da síndrome diarreica.' },
  { flowchartId: 'appendicitis', symptomIds: ['dor_abdominal', 'vomitos', 'febre'], keywords: ['dor do lado direito', 'fossa iliaca direita', 'apendicite', 'dor migratoria'], urgency: 'prioritaria', shortDescription: 'Dor abdominal com suspeita de apendicite.' },
  { flowchartId: 'cholecystitis', symptomIds: ['dor_abdominal', 'dor_epigastrica', 'vomitos', 'febre'], keywords: ['dor do lado direito em cima', 'hipocondrio direito', 'colecistite', 'murphy', 'vesicula'], urgency: 'prioritaria', shortDescription: 'Dor biliar persistente com inflamação vesicular.' },
  { flowchartId: 'cholangitis', symptomIds: ['dor_abdominal', 'ictericia', 'febre', 'hipotensao', 'confusao'], keywords: ['colangite', 'ictericia com febre', 'pele amarela', 'olhos amarelos', 'obstrucao biliar'], urgency: 'critica', shortDescription: 'Infecção/obstrução biliar com risco de sepse.' },
  { flowchartId: 'pancreatitis', symptomIds: ['dor_epigastrica', 'vomitos'], keywords: ['pancreatite', 'dor em faixa', 'dor para as costas', 'epigastrio', 'lipase'], urgency: 'prioritaria', shortDescription: 'Dor epigástrica intensa sugestiva de pancreatite.' },
  { flowchartId: 'itu', symptomIds: ['disuria', 'febre', 'dor_lombar'], keywords: ['ardencia para urinar', 'dor para urinar', 'infeccao urinaria', 'urina com cheiro', 'polaciuria', 'pielonefrite'], urgency: 'rotina', shortDescription: 'Sintomas urinários baixos ou infecção urinária alta.' },
  { flowchartId: 'lombalgia', symptomIds: ['dor_lombar'], keywords: ['dor lombar', 'lombalgia', 'dor nas costas', 'ciatica'], urgency: 'rotina', shortDescription: 'Dor lombar com pesquisa de sinais de alarme.' },
  { flowchartId: 'tvp', symptomIds: ['edema_perna'], keywords: ['perna inchada', 'panturrilha inchada', 'dor na panturrilha', 'trombose', 'edema unilateral'], urgency: 'prioritaria', shortDescription: 'Dor ou edema unilateral com suspeita de trombose venosa.' },
  { flowchartId: 'monoartrite', symptomIds: ['dor_articular', 'febre'], keywords: ['joelho inchado', 'articulacao inchada', 'monoartrite', 'gota', 'artrite septica'], urgency: 'prioritaria', shortDescription: 'Articulação única inflamada, incluindo exclusão de artrite séptica.' },
  { flowchartId: 'epistaxe', symptomIds: ['sangramento_nasal'], keywords: ['sangramento nasal', 'nariz sangrando', 'epistaxe'], urgency: 'prioritaria', shortDescription: 'Sangramento nasal com controle local e estratificação.' },
  { flowchartId: 'atendimento_antirrabico', symptomIds: ['mordedura'], keywords: ['mordida de cachorro', 'mordida de gato', 'morcego', 'animal desconhecido', 'raiva'], urgency: 'prioritaria', shortDescription: 'Exposição animal com avaliação de profilaxia antirrábica.' },
  { flowchartId: 'picada_aranha', symptomIds: ['picada'], keywords: ['picada de aranha', 'aranha', 'loxosceles', 'armadeira'], urgency: 'prioritaria', shortDescription: 'Acidente por aranha com identificação de gravidade.' },
  { flowchartId: 'pep_hiv', symptomIds: ['exposicao_hiv'], keywords: ['exposicao ao hiv', 'acidente com agulha', 'violencia sexual', 'sexo sem preservativo', 'material biologico'], urgency: 'prioritaria', shortDescription: 'Exposição recente com avaliação de profilaxia pós-exposição.' },
  { flowchartId: 'agitacao_psicomotora', symptomIds: ['agitacao', 'confusao'], keywords: ['agitado', 'agressivo', 'surto', 'agitacao psicomotora', 'risco para terceiros'], urgency: 'critica', shortDescription: 'Agitação com avaliação de segurança e causas orgânicas.' },
  { flowchartId: 'crise_ansiedade', symptomIds: ['ansiedade', 'palpitacao', 'dispneia'], keywords: ['crise de ansiedade', 'panico', 'ansioso', 'formigamento', 'hiperventilando'], urgency: 'rotina', shortDescription: 'Sintomas ansiosos após exclusão de causas orgânicas urgentes.' },
  { flowchartId: 'faringoamigdalite', symptomIds: ['febre'], keywords: ['dor de garganta', 'amigdalite', 'placas na garganta', 'odinofagia'], urgency: 'rotina', shortDescription: 'Dor de garganta com diferenciação viral/bacteriana.' },
  { flowchartId: 'sinusite', symptomIds: ['cefaleia', 'febre'], keywords: ['sinusite', 'dor na face', 'pressao na face', 'secrecao nasal', 'nariz entupido'], urgency: 'rotina', shortDescription: 'Sintomas nasossinusais com avaliação de etiologia.' }
]

export const normalizeClinicalText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9/\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export const recommendClinicalRoutes = (complaint: string, selectedSymptoms: string[]): ClinicalRouteSuggestion[] => {
  const normalizedComplaint = normalizeClinicalText(complaint)
  const symptomSet = new Set(selectedSymptoms)
  const criticalSymptoms = new Set(INTAKE_SYMPTOMS.filter(item => item.critical).map(item => item.id))

  return routes
    .map(route => {
      const matchedSymptoms = route.symptomIds.filter(id => symptomSet.has(id))
      const matchedKeywords = route.keywords.filter(keyword => normalizedComplaint.includes(normalizeClinicalText(keyword)))
      const criticalMatches = matchedSymptoms.filter(id => criticalSymptoms.has(id))
      let score = matchedSymptoms.length * 4 + matchedKeywords.length * 6 + criticalMatches.length * 2
      if (route.flowchartId === 'avc' && symptomSet.has('deficit_focal')) score += 8
      if (route.flowchartId === 'anafilaxia' && symptomSet.has('urticaria') && (symptomSet.has('dispneia') || symptomSet.has('hipotensao'))) score += 8
      if (route.flowchartId === 'tep' && symptomSet.has('edema_perna') && (symptomSet.has('dispneia') || symptomSet.has('dor_toracica'))) score += 7
      if (route.flowchartId === 'cholangitis' && symptomSet.has('ictericia') && symptomSet.has('febre')) score += 7
      if (route.flowchartId === 'hipertensao' && symptomSet.has('pressao_alta')) score += 7

      const reasons = [
        ...matchedKeywords.slice(0, 2).map(keyword => `A queixa contém “${keyword}”`),
        ...matchedSymptoms.slice(0, 3).map(id => `Sintoma selecionado: ${INTAKE_SYMPTOMS.find(item => item.id === id)?.label || id}`)
      ]
      return {
        flowchartId: route.flowchartId,
        score,
        confidence: score >= 18 ? 'alta' as const : score >= 10 ? 'moderada' as const : 'possivel' as const,
        urgency: route.urgency,
        reasons,
        shortDescription: route.shortDescription
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.urgency === 'critica' ? -1 : 1))
    .slice(0, 6)
}

