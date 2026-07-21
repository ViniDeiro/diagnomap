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
const abcdeComponentSource = fs.readFileSync(path.join(root, 'src/components/ABCDEChecklist.tsx'), 'utf8')
const selectorSource = fs.readFileSync(path.join(root, 'src/components/EmergencySelector.tsx'), 'utf8')
const avcComponentSource = fs.readFileSync(path.join(root, 'src/components/AVCFlowchartInteractive.tsx'), 'utf8')
const reportSource = fs.readFileSync(path.join(root, 'src/components/ReportViewer.tsx'), 'utf8')
const avcLogicSource = fs.readFileSync(path.join(root, 'src/lib/avc.ts'), 'utf8')
const hypertensionComponentSource = fs.readFileSync(path.join(root, 'src/components/HypertensionFlowchartInteractive.tsx'), 'utf8')
const hypertensionLogicSource = fs.readFileSync(path.join(root, 'src/lib/hypertension.ts'), 'utf8')
const universalAssessmentSource = fs.readFileSync(path.join(root, 'src/components/UniversalClinicalAssessment.tsx'), 'utf8')
const clinicalScalesSource = fs.readFileSync(path.join(root, 'src/components/ClinicalScaleCalculators.tsx'), 'utf8')
const anaphylaxisLogicSource = fs.readFileSync(path.join(root, 'src/lib/anaphylaxis.ts'), 'utf8')

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

const { anaphylaxisFlowchart, asthmaFlowchart, avcFlowchart, hypertensionFlowchart, tvpFlowchart } = moduleBox.exports

const compiledAVCLogic = ts.transpileModule(avcLogicSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const avcLogicModule = { exports: {} }
vm.runInNewContext(compiledAVCLogic, { module: avcLogicModule, exports: avcLogicModule.exports }, { filename: 'avc.compiled.js' })
const { evaluateAVCThrombectomy, calculateAVCThrombolyticDose } = avcLogicModule.exports

const compiledHypertensionLogic = ts.transpileModule(hypertensionLogicSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const hypertensionLogicModule = { exports: {} }
vm.runInNewContext(compiledHypertensionLogic, { module: hypertensionLogicModule, exports: hypertensionLogicModule.exports }, { filename: 'hypertension.compiled.js' })
const { classifyHypertensionRoute, HYPERTENSION_SCENARIO_TARGETS } = hypertensionLogicModule.exports

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
validateLinks(tvpFlowchart)
validateLinks(avcFlowchart)
validateLinks(hypertensionFlowchart)

const anaphylaxisReachable = reachable(anaphylaxisFlowchart)
for (const required of [
  'ana_adrenalina_im',
  'ana_repetir_adrenalina_internacao',
  'ana_via_aerea_avancada',
  'ana_internacao_via_aerea_choque',
  'ana_observacao_alta',
  'ana_observacao_prolongada'
]) assert.ok(anaphylaxisReachable.has(required), `Anafilaxia: caminho obrigatório não alcançável (${required})`)

for (const marker of [
  'ANAPHYLAXIS_AIRWAY_THREATS', 'ANAPHYLAXIS_AIRWAY_ACTIONS', 'ANAPHYLAXIS_POCUS_ACTIONS',
  'CICO ou obstrução completa', 'Capnografia contínua com onda', 'sinaisAmeacaSelecionados',
  'medidasViaAereaSelecionadas', 'medidasPocusSelecionadas'
]) assert.match(emergencyComponentSource, new RegExp(marker), `Anafilaxia: tela de via aérea sem marcador obrigatório (${marker})`)

assert.match(reportSource, /Via Aérea Avançada e POCUS/)

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
  'avc_desfecho_trombectomia', 'avc_cuidados_sem_reperfusao', 'avc_hemorragico_destino', 'avc_aguardo_uti'
]) assert.ok(avcReachable.has(required), `AVC: caminho obrigatório não alcançável (${required})`)

for (const obsolete of ['avaliacao_multiprofissional_sala_vermelha', 'avaliar_tc_cranio_sem_contraste', 'tempo_sintomas_menor_8h']) {
  assert.equal(avcReachable.has(obsolete), false, `AVC: árvore simplificada antiga ainda alcançável (${obsolete})`)
}

for (const marker of [
  'abs_anticoagulante', 'pressureReadyForThrombolysis', 'tenecteplase', 'alteplase',
  'grande_anterior', 'm2_dominante', 'medio_distal', 'basilar', 'pcAspects', 'premorbidRankin',
  'avc_complicacao_trombolise', 'AVC_CASE_ANSWER_KEY', 'ABCDEChecklist', 'abcdeDomains',
  'Dashboard', 'Reiniciar', 'UNIVERSAL_ASSESSMENT_ANSWER_KEY',
  'Teste AVEI \\(Escala de Cincinnati\\)', 'Atendimento de AVC finalizado',
  'Abrir relatório completo', 'Concluir e ir ao dashboard', 'showCompletion',
  'Aguardando UTI / unidade neurocrítica', 'utiChecklist', 'utiRequestedAt', 'proceedToIcu'
]) assert.match(avcComponentSource, new RegExp(marker), `AVC: implementação interativa sem marcador obrigatório (${marker})`)

const avcFinishImplementation = avcComponentSource.match(/const finish = \(outcome: string\) => \{[\s\S]*?\n  \}/)?.[0] || ''
assert.ok(avcFinishImplementation, 'AVC: função de finalização não localizada')
assert.doesNotMatch(avcFinishImplementation, /onComplete\(\)/, 'AVC: finalização clínica ainda redireciona imediatamente ao dashboard')

assert.match(reportSource, /flowId === 'avc'/)
assert.match(reportSource, /parseAVCCase/)
assert.match(reportSource, /Destino intensivo e segurança da transferência/)

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

const hypertensionReachable = reachable(hypertensionFlowchart)
for (const required of [
  'hipertensao_confirmacao', 'hipertensao_lesao_orgao', 'hipertensao_observacao',
  'hipertensao_classificacao_sem_loa', 'hipertensao_emergencia_preparo',
  'hipertensao_emergencia_cenario', 'hipertensao_emergencia_plano',
  'hipertensao_alta_sem_loa', 'hipertensao_cronica_alta'
]) assert.ok(hypertensionReachable.has(required), `Hipertensão: caminho obrigatório não alcançável (${required})`)

const hypertensionCases = [
  [{ systolic: 180, diastolic: 100, hasSymptoms: true, hasAcuteOrganDamage: true, hasSituationalTrigger: false }, 'emergency'],
  [{ systolic: 170, diastolic: 110, hasSymptoms: true, hasAcuteOrganDamage: true, hasSituationalTrigger: false }, 'emergency'],
  [{ systolic: 180, diastolic: 110, hasSymptoms: true, hasAcuteOrganDamage: false, hasSituationalTrigger: false }, 'important_elevation'],
  [{ systolic: 180, diastolic: 110, hasSymptoms: true, hasAcuteOrganDamage: false, hasSituationalTrigger: true }, 'pseudocrisis'],
  [{ systolic: 179, diastolic: 109, hasSymptoms: true, hasAcuteOrganDamage: false, hasSituationalTrigger: false }, 'chronic'],
  [{ systolic: 200, diastolic: 120, hasSymptoms: false, hasAcuteOrganDamage: false, hasSituationalTrigger: false }, 'chronic']
]
for (const [input, expected] of hypertensionCases) {
  assert.equal(classifyHypertensionRoute(input), expected, `Hipertensão: classificação divergente para ${JSON.stringify(input)}`)
}
for (const scenario of ['aortic_syndrome', 'encephalopathy', 'ischemic_stroke_lysis', 'ischemic_stroke_no_lysis', 'intracerebral_hemorrhage', 'subarachnoid_hemorrhage', 'catecholamine_crisis', 'acute_coronary_syndrome', 'pulmonary_edema', 'pregnancy_emergency', 'other']) {
  assert.ok(HYPERTENSION_SCENARIO_TARGETS[scenario]?.length, `Hipertensão: meta ausente para ${scenario}`)
}
for (const marker of ['HYPERTENSION_CASE_ANSWER_KEY', 'pressureAfterRest', 'organDamage', 'selectedIVAgent', 'selectedOralPlan', 'HYPERTENSION_SCENARIO_TARGETS']) {
  assert.match(hypertensionComponentSource, new RegExp(marker), `Hipertensão: implementação interativa sem marcador obrigatório (${marker})`)
}
assert.match(reportSource, /flowId === 'hipertensao'/)
assert.match(reportSource, /parseHypertensionCase/)

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

assert.match(emergencyComponentSource, /stepId === UNIVERSAL_ASSESSMENT_ANSWER_KEY/, 'Voltar deve preservar sinais vitais e exame físico universais')
assert.match(emergencyComponentSource, /<ABCDEChecklist[\s\S]*items=\{GECA_PLAN_C_ABCDE\}/, 'GECA deve usar o ABCDE reutilizável')
assert.match(emergencyComponentSource, /<ABCDEChecklist[\s\S]*items=\{ANAPHYLAXIS_ABCDE_ITEMS\}/, 'Anafilaxia deve usar o ABCDE reutilizável')
assert.match(emergencyComponentSource, /abcdeSelecionado: selectedAnaphylaxisAbcde/, 'Anafilaxia deve persistir os domínios ABCDE')
assert.match(abcdeComponentSource, /aria-pressed=\{selected\}/, 'ABCDE deve expor estado de seleção acessível')
assert.match(abcdeComponentSource, /value\.length} de \{items\.length\}/, 'ABCDE deve mostrar progresso por domínio')
assert.match(reportSource, /ANAPHYLAXIS_ABCDE_LABELS/, 'Relatório de anafilaxia deve traduzir o ABCDE selecionado')
assert.match(universalAssessmentSource, /GlasgowCalculator/, 'Avaliação universal deve calcular Glasgow dentro do exame neurológico')
assert.match(clinicalScalesSource, /NIHSS guiado/)
assert.match(clinicalScalesSource, /Rankin modificada prévia/)
assert.match(avcComponentSource, /NIHSSCalculator/)
assert.match(avcComponentSource, /ModifiedRankinSelector/)
assert.match(flowSource, /POCUS não disponível: seguir para D-dímero/, 'TVP de baixa probabilidade deve prosseguir sem POCUS')
assert.match(flowSource, /MgSO4 a 10% \(100 mg\/mL\)/, 'Asma deve detalhar diluição do magnésio a 10%')
assert.match(emergencyComponentSource, /ASTHMA_ADULT_DISCHARGE_PRESCRIPTION/)
assert.match(emergencyComponentSource, /data-asthma-copy-discharge/)
assert.match(anaphylaxisLogicSource, /age !== null && age > 12[\s\S]*doseMg: 0\.5/, 'Dose adulta de adrenalina deve prevalecer sobre peso inconsistente')

const tvpReachable = reachable(tvpFlowchart)
assert.equal(tvpFlowchart.steps.tvp_exame_fisico, undefined, 'TVP: tela duplicada de sinais vitais e exame físico deve ser removida')
assert.equal(tvpFlowchart.steps.start.options[0]?.nextStep, 'avaliacao_clinica', 'TVP: após selecionar o membro deve seguir para avaliação específica')
assert.match(emergencyComponentSource, /handleAnswer\('avaliacao_clinica', selectedTVPLeg\)/, 'TVP: seletor do membro não pode reabrir exame físico duplicado')
assert.match(emergencyComponentSource, /step === 'tvp_exame_fisico'[\s\S]*return 'avaliacao_clinica'/, 'TVP: atendimentos antigos devem migrar a etapa duplicada')
assert.equal(tvpFlowchart.steps.wells_score.options.find(option => option.value === 'wells_up_to_2')?.nextStep, 'd_dimero_elegibilidade', 'TVP: Wells até 2 pontos deve avaliar a utilidade do D-dímero')
assert.equal(tvpFlowchart.steps.wells_score.options.find(option => option.value === 'wells_above_2')?.nextStep, 'moderada_probabilidade', 'TVP: Wells acima de 2 pontos deve seguir ao Doppler')
assert.equal(tvpFlowchart.steps.d_dimero_elegibilidade.options.find(option => option.value === 'ddimer_limited')?.nextStep, 'solicitar_doppler_venoso', 'TVP: condição que limita D-dímero deve seguir ao Doppler direto')
assert.equal(tvpFlowchart.steps.baixa_probabilidade.options.find(option => option.value === 'ddimer_positive')?.nextStep, 'solicitar_doppler_venoso', 'TVP: D-dímero positivo deve abrir solicitação do Doppler venoso')
assert.equal(tvpFlowchart.steps.moderada_probabilidade.options[0]?.nextStep, 'solicitar_doppler_venoso', 'TVP: Wells moderado/alto deve seguir diretamente à solicitação do Doppler')
assert.equal(tvpFlowchart.steps.solicitar_doppler_venoso.options[0]?.nextStep, 'us_compressiva', 'TVP: após solicitar Doppler deve ser possível registrar o resultado')
assert.equal(tvpFlowchart.steps.us_compressiva.options.find(option => option.value === 'us_positive')?.nextStep, 'classificar_extensao_tvp', 'TVP: Doppler positivo deve exigir classificação proximal/distal')
assert.equal(tvpFlowchart.steps.us_compressiva.options.find(option => option.value === 'us_negative')?.nextStep, 'repetir_us', 'TVP: Doppler negativo deve seguir para ultrassonografia seriada')
assert.equal(tvpFlowchart.steps.classificar_extensao_tvp.options.find(option => option.value === 'proximal')?.nextStep, 'tvp_proximal_confirmada', 'TVP proximal deve abrir o ramo hospitalar')
assert.equal(tvpFlowchart.steps.classificar_extensao_tvp.options.find(option => option.value === 'distal')?.nextStep, 'criterios_ambulatoriais_tvp_distal', 'TVP distal deve checar segurança ambulatorial')
assert.equal(tvpFlowchart.steps.criterios_ambulatoriais_tvp_distal.options.find(option => option.value === 'outpatient_not_safe')?.nextStep, 'tvp_aguarda_avaliacao_vascular', 'TVP distal sem segurança ambulatorial não pode finalizar em alta')
assert.match(emergencyComponentSource, /wellsScoreTotal <= 2 \? 'd_dimero_elegibilidade'/, 'TVP: calculadora interativa deve aplicar o corte Wells até 2')
assert.match(emergencyComponentSource, /tvpConfirmedLocation === 'proximal'[\s\S]*tvp_aguarda_avaliacao_vascular/, 'TVP proximal anticoagulada deve permanecer no ramo hospitalar')
assert.equal(tvpReachable.has('pocus_antes_d_dimero'), false, 'TVP: POCUS não pode anteceder D-dímero no ramo principal')
assert.equal(tvpReachable.has('pocus_resultado_pre_d_dimero'), false, 'TVP: resultado de POCUS não pode ser etapa obrigatória antes do D-dímero')

const inProgressIds = selectorSource.match(/const inProgressFlowchartIds = \[([^\]]*)\]/)?.[1] || ''
const finishedIds = selectorSource.match(/const finishedFlowchartIds = \[([\s\S]*?)\n    \]/)?.[1] || ''
for (const completed of ['asthma', 'dengue', 'anafilaxia', 'avc', 'hipertensao']) {
  assert.doesNotMatch(inProgressIds, new RegExp(`['"]${completed}['"]`), `${completed}: ainda marcado como em andamento`)
  assert.match(finishedIds, new RegExp(`['"]${completed}['"]`), `${completed}: não marcado como finalizado`)
}

console.log('Clinical flow audit tests passed: universal assessment, anaphylaxis, dengue, asthma, AVC, hypertension and TVP routes.')
