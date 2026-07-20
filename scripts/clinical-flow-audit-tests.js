/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const flowSource = fs.readFileSync(path.join(root, 'src/data/emergencyFlowcharts.ts'), 'utf8')
const dengueSource = fs.readFileSync(path.join(root, 'src/components/DengueFlowchartComplete.tsx'), 'utf8')
const emergencyComponentSource = fs.readFileSync(path.join(root, 'src/components/EmergencyFlowchart.tsx'), 'utf8')
const selectorSource = fs.readFileSync(path.join(root, 'src/components/EmergencySelector.tsx'), 'utf8')
const avcComponentSource = fs.readFileSync(path.join(root, 'src/components/AVCFlowchartInteractive.tsx'), 'utf8')
const reportSource = fs.readFileSync(path.join(root, 'src/components/ReportViewer.tsx'), 'utf8')
const avcLogicSource = fs.readFileSync(path.join(root, 'src/lib/avc.ts'), 'utf8')

const compiled = ts.transpileModule(flowSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true
  }
}).outputText

const moduleBox = { exports: {} }
vm.runInNewContext(compiled, {
  module: moduleBox,
  exports: moduleBox.exports,
  require: request => request.includes('gecaFlowchart') ? { gecaFlowchart: { id: 'geca', steps: {}, finalSteps: [] } } : {},
  console
}, { filename: 'emergencyFlowcharts.compiled.js' })

const { anaphylaxisFlowchart, asthmaFlowchart, avcFlowchart } = moduleBox.exports

const compiledAVCLogic = ts.transpileModule(avcLogicSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const avcLogicModule = { exports: {} }
vm.runInNewContext(compiledAVCLogic, { module: avcLogicModule, exports: avcLogicModule.exports }, { filename: 'avc.compiled.js' })
const { evaluateAVCThrombectomy, calculateAVCThrombolyticDose } = avcLogicModule.exports

const validateLinks = flow => {
  assert.ok(flow, 'Fluxograma precisa existir')
  assert.ok(flow.steps[flow.initialStep], `${flow.id}: etapa inicial ausente`)
  for (const step of Object.values(flow.steps)) {
    for (const option of step.options || []) {
      assert.ok(flow.steps[option.nextStep], `${flow.id}: ${step.id} aponta para etapa inexistente ${option.nextStep}`)
    }
  }
  for (const finalStep of flow.finalSteps) {
    assert.ok(flow.steps[finalStep], `${flow.id}: desfecho ${finalStep} ausente`)
  }
}

const reachable = flow => {
  const seen = new Set()
  const queue = [flow.initialStep]
  while (queue.length) {
    const id = queue.shift()
    if (!id || seen.has(id)) continue
    seen.add(id)
    for (const option of flow.steps[id]?.options || []) queue.push(option.nextStep)
  }
  return seen
}

validateLinks(anaphylaxisFlowchart)
validateLinks(asthmaFlowchart)
validateLinks(avcFlowchart)

const anaphylaxisReachable = reachable(anaphylaxisFlowchart)
for (const required of [
  'ana_adrenalina_im',
  'ana_repetir_adrenalina_internacao',
  'ana_internacao_via_aerea_choque',
  'ana_observacao_alta',
  'ana_observacao_prolongada'
]) assert.ok(anaphylaxisReachable.has(required), `Anafilaxia: caminho obrigatório não alcançável (${required})`)

const asthmaReachable = reachable(asthmaFlowchart)
for (const required of [
  'asma_tratamento_1h_leve',
  'asma_tratamento_1h_leve_moderada',
  'asma_checar_anafilaxia',
  'asma_adrenalina_anafilaxia',
  'asma_considerar_magnesio',
  'asma_reavaliacao_1h',
  'asma_alta_final',
  'asma_internacao',
  'asma_uti',
  'asma_intubacao'
]) assert.ok(asthmaReachable.has(required), `Asma: caminho obrigatório não alcançável (${required})`)

for (const obsolete of ['asma_resgate_beta_iv', 'asma_resgate_aminofilina', 'asma_resgate_heliox', 'asma_resgate_vni']) {
  assert.equal(asthmaReachable.has(obsolete), false, `Asma: terapia não rotineira ainda está na rota assistencial (${obsolete})`)
}

const avcReachable = reachable(avcFlowchart)
for (const required of [
  'avc_ativacao', 'avc_glicemia', 'avc_triagem', 'avc_nihss', 'avc_exames', 'avc_imagem',
  'avc_janela', 'avc_imagem_avancada', 'avc_trombolise_seguranca', 'avc_trombolitico',
  'avc_pos_trombolise', 'avc_complicacao_trombolise', 'avc_vaso', 'avc_trombectomia_criterios',
  'avc_desfecho_trombectomia', 'avc_cuidados_sem_reperfusao', 'avc_hemorragico_destino'
]) assert.ok(avcReachable.has(required), `AVC: caminho obrigatório não alcançável (${required})`)

for (const obsolete of ['avaliacao_multiprofissional_sala_vermelha', 'avaliar_tc_cranio_sem_contraste', 'tempo_sintomas_menor_8h']) {
  assert.equal(avcReachable.has(obsolete), false, `AVC: árvore simplificada antiga ainda alcançável (${obsolete})`)
}

for (const marker of [
  'abs_anticoagulante', 'pressureReadyForThrombolysis', 'tenecteplase', 'alteplase',
  'grande_anterior', 'm2_dominante', 'medio_distal', 'basilar', 'pcAspects', 'premorbidRankin',
  'avc_complicacao_trombolise', 'AVC_CASE_ANSWER_KEY'
]) assert.match(avcComponentSource, new RegExp(marker), `AVC: implementação interativa sem marcador obrigatório (${marker})`)

assert.match(reportSource, /flowId === 'avc'/)
assert.match(reportSource, /parseAVCCase/)

const thrombectomyCases = [
  [{ vesselTerritory: 'grande_anterior', timeWindow: 'ate_45h', aspects: 8, premorbidRankin: 1, nihss: 12 }, 'forte'],
  [{ vesselTerritory: 'grande_anterior', timeWindow: 'ate_45h', premorbidRankin: 1, nihss: 12 }, 'dados_insuficientes'],
  [{ vesselTerritory: 'grande_anterior', timeWindow: '9_24h', aspects: 4, premorbidRankin: 1, nihss: 12 }, 'forte'],
  [{ vesselTerritory: 'grande_anterior', timeWindow: '9_24h', aspects: 2, premorbidRankin: 1, nihss: 12 }, 'dados_insuficientes'],
  [{ vesselTerritory: 'm2_dominante', timeWindow: '45_6h', aspects: 7, premorbidRankin: 1, nihss: 8 }, 'considerar'],
  [{ vesselTerritory: 'medio_distal', timeWindow: 'ate_45h', aspects: 9, premorbidRankin: 0, nihss: 8 }, 'sem_beneficio'],
  [{ vesselTerritory: 'basilar', timeWindow: '9_24h', pcAspects: 7, premorbidRankin: 1, nihss: 11 }, 'forte'],
  [{ vesselTerritory: 'basilar', timeWindow: '9_24h', pcAspects: 7, premorbidRankin: 1, nihss: 7 }, 'considerar'],
  [{ vesselTerritory: 'basilar', timeWindow: '9_24h', pcAspects: 5, premorbidRankin: 1, nihss: 15 }, 'dados_insuficientes'],
  [{ vesselTerritory: 'sem_ogv', timeWindow: 'ate_45h', aspects: 10, premorbidRankin: 0, nihss: 18 }, 'sem_beneficio']
]
for (const [input, expected] of thrombectomyCases) {
  assert.equal(evaluateAVCThrombectomy(input), expected, `AVC: matriz de trombectomia divergente para ${JSON.stringify(input)}`)
}
assert.match(calculateAVCThrombolyticDose(72, 'tenecteplase'), /18,0 mg/)
assert.match(calculateAVCThrombolyticDose(72, 'alteplase'), /64,8 mg/)
assert.match(calculateAVCThrombolyticDose(120, 'alteplase'), /90,0 mg/)

assert.match(dengueSource, /Grupo D:[\s\S]*Presença de qualquer sinal de gravidade/)
assert.match(dengueSource, /Grupo C:[\s\S]*Presença apenas de sinais de alarme/)
assert.match(dengueSource, /Infundir ao longo de 1 hora/)
assert.match(dengueSource, /20 mL\/kg em até 20 minutos/)
assert.match(dengueSource, /nextStep: 'd_plasma_expanders'/)
assert.match(dengueSource, /nextStep: 'd_hemo_coag_management'/)

for (const source of [dengueSource, emergencyComponentSource]) {
  assert.match(source, /UNIVERSAL_ASSESSMENT_ANSWER_KEY/)
  assert.match(source, /UniversalClinicalAssessment/)
}

const inProgressIds = selectorSource.match(/const inProgressFlowchartIds = \[([^\]]*)\]/)?.[1] || ''
const finishedIds = selectorSource.match(/const finishedFlowchartIds = \[([\s\S]*?)\n    \]/)?.[1] || ''
for (const completed of ['asthma', 'dengue', 'anafilaxia', 'avc']) {
  assert.doesNotMatch(inProgressIds, new RegExp(`['"]${completed}['"]`), `${completed}: ainda marcado como em andamento`)
  assert.match(finishedIds, new RegExp(`['"]${completed}['"]`), `${completed}: não marcado como finalizado`)
}

console.log('Clinical flow audit tests passed: universal assessment, anaphylaxis, dengue, asthma and AVC routes.')
