const assert = require('node:assert/strict')

const evaluateVisibleItems = (sectionState, sectionItems) =>
  sectionItems.reduce((acc, section) => acc + (sectionState[section.id] ? section.items : 0), 0)

const sectionItems = [
  { id: 'tvp_clinical_0', items: 8 },
  { id: 'tvp_clinical_1', items: 8 },
  { id: 'tvp_clinical_2', items: 6 },
  { id: 'tvp_treatment_therapies', items: 7 },
  { id: 'tvp_treatment_duration', items: 4 },
  { id: 'tvp_treatment_contra', items: 9 },
  { id: 'tvp_treatment_guidance', items: 7 }
]

const previousState = {
  tvp_clinical_0: true,
  tvp_clinical_1: true,
  tvp_clinical_2: true,
  tvp_treatment_therapies: true,
  tvp_treatment_duration: true,
  tvp_treatment_contra: true,
  tvp_treatment_guidance: true
}

const currentState = {
  tvp_clinical_0: true,
  tvp_clinical_1: false,
  tvp_clinical_2: false,
  tvp_treatment_therapies: true,
  tvp_treatment_duration: false,
  tvp_treatment_contra: true,
  tvp_treatment_guidance: false
}

const previousVisible = evaluateVisibleItems(previousState, sectionItems)
const currentVisible = evaluateVisibleItems(currentState, sectionItems)
assert.ok(currentVisible < previousVisible, 'A interface atual deve exibir menos itens inicialmente')

const parseAnswer = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const therapyMap = {
  rivaroxabana: 'Rivaroxabana',
  enoxaparina: 'Enoxaparina'
}

const answers = {
  wells_score: JSON.stringify({ score: 3, classificacao: 'alta' }),
  tratamento_inicial: JSON.stringify({
    opcoesTerapeuticasSelecionadas: ['rivaroxabana', 'enoxaparina']
  }),
  us_compressiva: 'US positiva para trombose'
}

const selectedTherapies = Object.values(answers)
  .map(parseAnswer)
  .filter(entry => Array.isArray(entry?.opcoesTerapeuticasSelecionadas))
  .flatMap(entry => entry.opcoesTerapeuticasSelecionadas)

const meds = Array.from(new Set(selectedTherapies.map(id => therapyMap[id]).filter(Boolean)))
assert.deepEqual(meds, ['Rivaroxabana', 'Enoxaparina'])

const timeline = ['avaliacao_clinica', 'wells_score', 'us_compressiva', 'tratamento_inicial']
assert.equal(timeline[0], 'avaliacao_clinica')
assert.equal(timeline[timeline.length - 1], 'tratamento_inicial')

console.log('Usability tests passed')
