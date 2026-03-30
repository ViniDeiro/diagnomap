const assert = require('node:assert/strict')

const criteria = [
  { id: 'cancer_ativo', points: 1 },
  { id: 'paresia_imobilizacao', points: 1 },
  { id: 'acamado_cirurgia', points: 1 },
  { id: 'dor_venosa_profunda', points: 1 },
  { id: 'edema_total_mi', points: 1 },
  { id: 'panturrilha_maior_3cm', points: 1 },
  { id: 'edema_cacifo', points: 1 },
  { id: 'veias_colaterais', points: 1 },
  { id: 'tvp_previa', points: 1 },
  { id: 'diagnostico_alternativo', points: -2 }
]

const calculateScore = (answers) =>
  criteria.reduce((sum, criterion) => sum + (answers[criterion.id] ? criterion.points : 0), 0)

const interpretScore = (score) => {
  if (score <= 0) return 'baixa'
  if (score <= 2) return 'intermediaria'
  return 'alta'
}

const canFinalize = (reviewConfirmed) => reviewConfirmed

const lowRiskAnswers = {
  cancer_ativo: false,
  paresia_imobilizacao: false,
  acamado_cirurgia: false,
  dor_venosa_profunda: false,
  edema_total_mi: false,
  panturrilha_maior_3cm: false,
  edema_cacifo: false,
  veias_colaterais: false,
  tvp_previa: false,
  diagnostico_alternativo: true
}

const moderateRiskAnswers = {
  cancer_ativo: true,
  paresia_imobilizacao: false,
  acamado_cirurgia: false,
  dor_venosa_profunda: true,
  edema_total_mi: false,
  panturrilha_maior_3cm: false,
  edema_cacifo: false,
  veias_colaterais: false,
  tvp_previa: false,
  diagnostico_alternativo: false
}

const highRiskAnswers = {
  cancer_ativo: true,
  paresia_imobilizacao: true,
  acamado_cirurgia: true,
  dor_venosa_profunda: true,
  edema_total_mi: false,
  panturrilha_maior_3cm: false,
  edema_cacifo: false,
  veias_colaterais: false,
  tvp_previa: false,
  diagnostico_alternativo: false
}

assert.equal(calculateScore(lowRiskAnswers), -2)
assert.equal(interpretScore(calculateScore(lowRiskAnswers)), 'baixa')
assert.equal(calculateScore(moderateRiskAnswers), 2)
assert.equal(interpretScore(calculateScore(moderateRiskAnswers)), 'intermediaria')
assert.equal(calculateScore(highRiskAnswers), 4)
assert.equal(interpretScore(calculateScore(highRiskAnswers)), 'alta')
assert.equal(canFinalize(false), false)
assert.equal(canFinalize(true), true)

console.log('Wells usability tests passed')
