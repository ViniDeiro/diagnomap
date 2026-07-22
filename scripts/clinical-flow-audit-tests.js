/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const flowSource = fs.readFileSync(path.join(root, 'src/data/emergencyFlowcharts.ts'), 'utf8')
const gecaSource = fs.readFileSync(path.join(root, 'src/data/gecaFlowchart.ts'), 'utf8')
const dengueSource = fs.readFileSync(path.join(root, 'src/components/DengueFlowchartComplete.tsx'), 'utf8')
const emergencyComponentSource = fs.readFileSync(path.join(root, 'src/components/EmergencyFlowchart.tsx'), 'utf8')
const abcdeComponentSource = fs.readFileSync(path.join(root, 'src/components/ABCDEChecklist.tsx'), 'utf8')
const selectorSource = fs.readFileSync(path.join(root, 'src/components/EmergencySelector.tsx'), 'utf8')
const avcComponentSource = fs.readFileSync(path.join(root, 'src/components/AVCFlowchartInteractive.tsx'), 'utf8')
const reportSource = fs.readFileSync(path.join(root, 'src/components/ReportViewer.tsx'), 'utf8')
const avcLogicSource = fs.readFileSync(path.join(root, 'src/lib/avc.ts'), 'utf8')
const hypertensionComponentSource = fs.readFileSync(path.join(root, 'src/components/HypertensionFlowchartInteractive.tsx'), 'utf8')
const rabiesComponentSource = fs.readFileSync(path.join(root, 'src/components/RabiesExposureFlowchartInteractive.tsx'), 'utf8')
const rabiesNotificationSource = fs.readFileSync(path.join(root, 'src/components/RabiesNotificationForm.tsx'), 'utf8')
const hypertensionLogicSource = fs.readFileSync(path.join(root, 'src/lib/hypertension.ts'), 'utf8')
const universalAssessmentSource = fs.readFileSync(path.join(root, 'src/components/UniversalClinicalAssessment.tsx'), 'utf8')
const physicalExamSource = fs.readFileSync(path.join(root, 'src/components/PhysicalExamForm.tsx'), 'utf8')
const universalCareTransitionSource = fs.readFileSync(path.join(root, 'src/components/UniversalCareTransition.tsx'), 'utf8')
const clinicalScalesSource = fs.readFileSync(path.join(root, 'src/components/ClinicalScaleCalculators.tsx'), 'utf8')
const anaphylaxisLogicSource = fs.readFileSync(path.join(root, 'src/lib/anaphylaxis.ts'), 'utf8')
const clinicalSummarySource = fs.readFileSync(path.join(root, 'src/lib/clinicalSummary.ts'), 'utf8')

const compiledGeca = ts.transpileModule(gecaSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const gecaModule = { exports: {} }
vm.runInNewContext(compiledGeca, { module: gecaModule, exports: gecaModule.exports, require: () => ({}) })
const gecaFlowchart = gecaModule.exports.gecaFlowchart

const compiledClinicalSummary = ts.transpileModule(clinicalSummarySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText
const clinicalSummaryModule = { exports: {} }
vm.runInNewContext(compiledClinicalSummary, {
  module: clinicalSummaryModule,
  exports: clinicalSummaryModule.exports,
  require: request => {
    if (request.includes('emergencyFlowcharts')) return { getFlowchartById: () => null }
    if (request.includes('influenza')) return { getOseltamivirDoseText: () => '' }
    if (request.includes('pneumonia')) return { getPneumoniaSmartCopRisk: () => '' }
    if (request.includes('UniversalClinicalAssessment')) return {
      UNIVERSAL_ASSESSMENT_ANSWER_KEY: '__avaliacao_clinica_inicial',
      parseUniversalClinicalAssessment: raw => raw ? JSON.parse(raw) : null,
      summarizeUniversalPhysicalExam: exam => exam ? [`Neurológico: Glasgow ${exam.neuro?.glasgow ?? 15}`, `Pulmonar: ${exam.pulmonary?.altered || 'sem alteração descrita'}`] : []
    }
    return {}
  },
  console
}, { filename: 'clinicalSummary.compiled.js' })

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

const { anaphylaxisFlowchart, asthmaFlowchart, avcFlowchart, hypertensionFlowchart, tvpFlowchart, influenzaFlowchart, pneumoniaFlowchart, ituFlowchart, atendimentoAntirrabicoFlowchart } = moduleBox.exports

const compiledAVCLogic = ts.transpileModule(avcLogicSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const avcLogicModule = { exports: {} }
vm.runInNewContext(compiledAVCLogic, { module: avcLogicModule, exports: avcLogicModule.exports }, { filename: 'avc.compiled.js' })
const { evaluateAVCThrombectomy, calculateAVCThrombolyticDose, parseAVCBloodPressure, isAVCBloodPressureWithinThrombolysisLimit } = avcLogicModule.exports

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
validateLinks(ituFlowchart)
validateLinks(atendimentoAntirrabicoFlowchart)

const rabiesOption = (step, value) => atendimentoAntirrabicoFlowchart.steps[step].options.find(option => option.value === value)?.nextStep
assert.equal(rabiesOption('raiva_tipo_contato', 'contato_indireto'), 'raiva_indireto_morcego')
assert.equal(rabiesOption('raiva_indireto_morcego', 'morcego'), 'raiva_vacina_soro')
assert.equal(rabiesOption('raiva_indireto_morcego', 'outro_animal'), 'raiva_sem_profilaxia')
assert.equal(rabiesOption('raiva_especie', 'cao_gato'), 'raiva_cao_gato_observavel')
assert.equal(rabiesOption('raiva_especie', 'mamifero_domestico'), 'raiva_gravidade')
assert.equal(rabiesOption('raiva_especie', 'animal_silvestre'), 'raiva_vacina_soro')
assert.equal(rabiesOption('raiva_observacao_10_dias', 'vivo_saudavel'), 'raiva_sem_profilaxia')
assert.equal(rabiesOption('raiva_observacao_10_dias', 'evolucao_suspeita'), 'raiva_gravidade')
assert.equal(rabiesOption('raiva_gravidade', 'leve'), 'raiva_vacina')
assert.equal(rabiesOption('raiva_gravidade', 'grave'), 'raiva_vacina_soro')
for (const marker of [
  'RABIES_CASE_ANSWER_KEY', 'Dashboard', 'Reiniciar', 'Contato indireto',
  'Janela de observação do animal', 'severeSelected', 'Intradérmica', 'Intramuscular',
  'SAR · 40 UI/kg', 'IGHAR · 20 UI/kg', 'Fluxo de mordedura concluído',
  'Abrir relatório completo'
]) assert.ok(rabiesComponentSource.includes(marker), `Mordedura: experiência interativa ausente (${marker})`)
assert.match(emergencyComponentSource, /flowchart\.id === 'atendimento_antirrabico'[\s\S]*RabiesExposureFlowchartInteractive/)
assert.match(reportSource, /parseRabiesCase/)
assert.match(rabiesComponentSource, /stage === 'raiva_vacina' \|\| stage === 'raiva_vacina_soro'[\s\S]*RabiesNotificationForm/)
assert.match(rabiesComponentSource, /isRabiesNotificationCoreComplete\(data\.notification\)/)
for (const marker of [
  'Ficha de investigação SINAN', 'Notificação e atendimento', 'Identificação complementar',
  'Residência e contato', 'Exposição e animal', 'Tratamento atual',
  'Acompanhamento e encerramento', 'isRabiesNotificationCoreComplete'
]) assert.ok(rabiesNotificationSource.includes(marker), `Mordedura: ficha SINAN sem bloco obrigatório (${marker})`)
assert.match(reportSource, /Ficha de investigação antirrábica/)

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

for (const marker of [
  'Crise asmática no pronto-socorro',
  "['Avaliação', 'Gravidade', 'Tratamento', 'Reavaliação', 'Destino']",
  'Classificação objetiva da crise',
  'Achados de gravidade — selecione os presentes',
  'Nova medida após a primeira hora'
]) {
  assert.ok(emergencyComponentSource.includes(marker), `asma: experiência interativa ausente: ${marker}`)
}
assert.match(emergencyComponentSource, /key: 'pfe',[^\n]+required: false/, 'Asma: PFE inicial deve ser opcional')
assert.match(emergencyComponentSource, /key: 'pfeRe',[^\n]+required: false/, 'Asma: PFE da reavaliação deve ser opcional')

const avcReachable = reachable(avcFlowchart)
for (const required of [
  'avc_ativacao', 'avc_glicemia', 'avc_triagem', 'avc_nihss', 'avc_exames', 'avc_imagem',
  'avc_janela', 'avc_imagem_avancada', 'avc_trombolise_seguranca', 'avc_trombolitico',
  'avc_pos_trombolise', 'avc_complicacao_trombolise', 'avc_vaso', 'avc_trombectomia_criterios',
  'avc_desfecho_trombectomia', 'avc_transferencia_reperfusao', 'avc_cuidados_sem_reperfusao', 'avc_hemorragico_destino', 'avc_aguardo_uti'
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
assert.deepEqual({ ...parseAVCBloodPressure('185/110') }, { systolic: 185, diastolic: 110 })
assert.equal(isAVCBloodPressureWithinThrombolysisLimit('185/110'), true, 'AVC: pressão exatamente no limite deve permitir confirmação')
assert.equal(isAVCBloodPressureWithinThrombolysisLimit('186/100'), false, 'AVC: sistólica acima do limite deve bloquear confirmação')
assert.equal(isAVCBloodPressureWithinThrombolysisLimit('180/111'), false, 'AVC: diastólica acima do limite deve bloquear confirmação')
assert.equal(isAVCBloodPressureWithinThrombolysisLimit('pressão normal'), false, 'AVC: formato inválido deve bloquear confirmação')
assert.match(avcComponentSource, /disabled={!pressureWithinThrombolysisLimit}/, 'AVC: confirmação da meta pressórica deve ser bloqueada pelo valor digitado')
for (const marker of ['postThrombolysisBloodPressure', 'postThrombolysisBPManagement', 'PA acima da meta pós-trombólise', 'Plano terapêutico — apresentação acima de 24 horas']) {
  assert.match(avcComponentSource, new RegExp(marker), `AVC: orientação solicitada pelo revisor ausente (${marker})`)
}
assert.match(avcComponentSource, /Imagem vascular\/avançada ou trombectomia indisponível — solicitar transferência/, 'AVC: falta opção explícita de transferência quando o recurso local é insuficiente')
assert.match(avcComponentSource, /destination="transfer" context="avc:centro_reperfusao"/, 'AVC: transferência deve usar a tela universal de espera e passagem do cuidado')
assert.equal(ituFlowchart.steps.itu_bacteriuria_excecoes.options.find(option => option.value === 'grupo_especial')?.nextStep, 'itu_bacteriuria_grupo_especial', 'ITU: bacteriúria em grupo especial deve passar pela orientação específica')
const ituReachable = reachable(ituFlowchart)
for (const required of [
  'itu_cistite_complicadores', 'itu_cistite_antibiotico', 'itu_bacteriuria_excecoes', 'itu_bacteriuria_grupo_especial',
  'itu_pielo_sepse', 'itu_estabilizacao_sepse', 'itu_exames_pielonefrite', 'itu_criterios_internacao',
  'itu_antibiotico_ambulatorial', 'itu_reavaliacao_ambulatorial', 'itu_antibiotico_hospitalar',
  'itu_cuidados_aguarda_enfermaria', 'itu_criterios_alta'
]) assert.ok(ituReachable.has(required), `ITU: caminho clínico obrigatório não alcançável (${required})`)

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
for (const marker of ['HYPERTENSION_CASE_ANSWER_KEY', 'pressureAfterRest', 'organDamage', 'selectedIVAgent', 'selectedOralPlan', 'HYPERTENSION_SCENARIO_TARGETS', 'Dashboard', 'Reiniciar', 'showCompletion', 'Abrir relatório completo', 'Concluir e ir ao dashboard', 'UNIVERSAL_ASSESSMENT_ANSWER_KEY']) {
  assert.match(hypertensionComponentSource, new RegExp(marker), `Hipertensão: implementação interativa sem marcador obrigatório (${marker})`)
}
assert.match(hypertensionComponentSource, /'asymptomatic', 'Assintomático/, 'Hipertensão: opção assintomático ausente')
assert.match(hypertensionComponentSource, /some\(item => item !== 'asymptomatic'\)/, 'Hipertensão: assintomático não deve ser interpretado como sintoma presente')
assert.match(hypertensionComponentSource, /current\.filter\(item => item !== 'asymptomatic'\)/, 'Hipertensão: opção assintomático deve ser mutuamente exclusiva')
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

assert.equal(influenzaFlowchart.steps.start.options[0].nextStep, 'influenza_sinais_gravidade', 'Síndrome gripal: tela antiga de sinais vitais ainda está na rota principal')
assert.equal(pneumoniaFlowchart.steps.pac_inicio.options[0].nextStep, 'pac_crb65_triagem', 'PAC: tela antiga de sinais vitais ainda está na rota principal')
assert.match(emergencyComponentSource, /parseUniversalClinicalAssessment\(answers\[UNIVERSAL_ASSESSMENT_ANSWER_KEY\]\)/, 'PAC: escores não consomem a avaliação clínica universal')

assert.match(emergencyComponentSource, /stepId === UNIVERSAL_ASSESSMENT_ANSWER_KEY/, 'Voltar deve preservar sinais vitais e exame físico universais')
assert.match(emergencyComponentSource, /<ABCDEChecklist[\s\S]*items=\{GECA_PLAN_C_ABCDE\}/, 'GECA deve usar o ABCDE reutilizável')
assert.match(emergencyComponentSource, /<ABCDEChecklist[\s\S]*items=\{ANAPHYLAXIS_ABCDE_ITEMS\}/, 'Anafilaxia deve usar o ABCDE reutilizável')
assert.match(emergencyComponentSource, /abcdeSelecionado: selectedAnaphylaxisAbcde/, 'Anafilaxia deve persistir os domínios ABCDE')
assert.match(abcdeComponentSource, /aria-pressed=\{selected\}/, 'ABCDE deve expor estado de seleção acessível')
assert.match(abcdeComponentSource, /value\.length} de \{items\.length\}/, 'ABCDE deve mostrar progresso por domínio')
assert.match(reportSource, /ANAPHYLAXIS_ABCDE_LABELS/, 'Relatório de anafilaxia deve traduzir o ABCDE selecionado')
assert.match(universalAssessmentSource, /GlasgowCalculator/, 'Avaliação universal deve calcular Glasgow dentro do exame neurológico')
assert.match(universalAssessmentSource, /neurologicalAssessment=\{[\s\S]*<GlasgowCalculator/, 'Glasgow universal deve ser entregue ao bloco neurológico, não ficar solto no início do exame')
assert.match(physicalExamSource, /title="Neurológico"[\s\S]*\{neurologicalAssessment &&/, 'Bloco neurológico deve renderizar a calculadora antes da descrição dos achados')
for (const marker of ['Plano assistencial durante a espera', 'O cuidado continua antes da transferência', 'Vigilância neurológica', 'Perfusão e balanço hídrico', 'Meta orientada pelo órgão acometido', 'Suporte respiratório escalonado']) {
  assert.ok(universalCareTransitionSource.includes(marker), `Transição universal perdeu orientação clínica: ${marker}`)
}
assert.match(avcComponentSource, /context="avc:unidade_neurocritica"/, 'AVC deve receber orientações neurocríticas na tela universal')
assert.match(hypertensionComponentSource, /context="hipertensao:emergencia"/, 'Hipertensão deve receber orientações específicas na tela universal')
assert.match(clinicalScalesSource, /NIHSS guiado/)
assert.match(clinicalScalesSource, /Rankin modificada prévia/)
assert.match(avcComponentSource, /NIHSSCalculator/)
assert.match(avcComponentSource, /ModifiedRankinSelector/)
assert.match(flowSource, /POCUS não disponível: seguir para D-dímero/, 'TVP de baixa probabilidade deve prosseguir sem POCUS')
assert.match(flowSource, /MgSO4 a 10% \(100 mg\/mL\)/, 'Asma deve detalhar diluição do magnésio a 10%')
assert.match(emergencyComponentSource, /ASTHMA_MAGNESIUM_PRESCRIPTION/)
assert.match(emergencyComponentSource, /data-asthma-copy-magnesium/)
assert.match(emergencyComponentSource, /ASTHMA_ADULT_DISCHARGE_PRESCRIPTION/)
assert.match(emergencyComponentSource, /data-asthma-copy-discharge/)
assert.match(anaphylaxisLogicSource, /age !== null && age > 12[\s\S]*doseMg: 0\.5/, 'Dose adulta de adrenalina deve prevalecer sobre peso inconsistente')
assert.match(clinicalSummarySource, /buildDengueClinicalSummary/, 'Dengue deve possuir resumo clínico próprio')
assert.match(clinicalSummarySource, /flowchart\.id === 'dengue'[\s\S]*buildDengueClinicalSummary/, 'Dengue ainda está usando o resumo genérico')
for (const group of ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D']) {
  assert.match(clinicalSummarySource, new RegExp(group), `Resumo da dengue sem narrativa específica para ${group}`)
}
const { buildClinicalSummary } = clinicalSummaryModule.exports
for (const [group, step] of [['A', 'end_group_a'], ['B', 'end_group_b'], ['C', 'group_c'], ['D', 'group_d']]) {
  const summary = buildClinicalSummary({
    id: `dengue-${group}`, name: 'Paciente Teste', age: 40, gender: 'masculino', weight: 70,
    medicalRecord: 'TESTE', selectedFlowchart: 'dengue', generalObservations: '',
    admission: { date: new Date('2026-07-22T10:00:00'), time: '10:00', symptoms: ['Febre', 'Cefaleia'], vitalSigns: {} },
    flowchartState: { currentStep: step, history: ['alarm_check', step], answers: {
      __avaliacao_clinica_inicial: JSON.stringify({ sinaisVitais: { temperature: 39, bloodPressure: '120/80', heartRate: 90, respiratoryRate: 19, oxygenSaturation: 98 }, exameFisico: { neuro: { glasgow: 15 }, pulmonary: { altered: '' } } }),
      alarm_check: JSON.stringify({ grupoC: group === 'C' ? ['dor_abdominal'] : [], grupoD: group === 'D' ? ['choque_taquicardia'] : [] })
    }, progress: 50, group, lastUpdate: new Date() },
    treatment: { prescriptions: [], observations: [] }, status: 'active', createdAt: new Date(), updatedAt: new Date()
  }, { flowchart: { id: 'dengue', name: 'Dengue', description: '', initialStep: 'alarm_check', steps: { [step]: { id: step, title: step, description: '', type: 'result', options: [] } }, finalSteps: [] } })
  assert.match(summary.continuousText, new RegExp(`Grupo ${group}`), `Resumo da dengue não contextualizou o Grupo ${group}`)
  assert.doesNotMatch(summary.continuousText, /feverDays|bloodPressure|continue|Exame físico: Exame físico:/, `Resumo do Grupo ${group} expôs chave técnica ou texto duplicado`)
}

const narrativePatient = (selectedFlowchart, currentStep, history, answers) => ({
  id: `summary-${selectedFlowchart}`, name: 'Paciente Narrativa', age: 58, gender: 'masculino', weight: 72,
  medicalRecord: 'NARRATIVA', selectedFlowchart, generalObservations: '',
  admission: { date: new Date('2026-07-22T10:00:00'), time: '10:00', chiefComplaint: 'Início súbito dos sintomas', symptoms: ['Sintoma principal'], vitalSigns: {} },
  flowchartState: { currentStep, history, answers, progress: 100, lastUpdate: new Date() },
  treatment: { prescriptions: [], observations: [] }, status: 'active', createdAt: new Date(), updatedAt: new Date()
})
const universalAnswer = JSON.stringify({ sinaisVitais: { temperature: 36.8, bloodPressure: '170/100', heartRate: 96, respiratoryRate: 24, oxygenSaturation: 94, glucose: 110 }, exameFisico: { neuro: { glasgow: 15 }, pulmonary: { altered: 'sibilos difusos' } } })
const narrativeCases = [
  {
    id: 'avc', flow: avcFlowchart, step: 'avc_aguardo_uti', history: ['avc_ativacao', 'avc_nihss', 'avc_imagem', 'avc_trombolitico'],
    answers: { __avaliacao_clinica_inicial: universalAnswer, avc_caso_estruturado: JSON.stringify({ symptoms: ['fraqueza em hemicorpo', 'fala alterada'], onsetTime: '09:10', glucose: 110, nihss: 12, premorbidRankin: 1, imagingResult: 'sem_hemorragia', timeWindow: 'ate_45h', receivedThrombolysis: true, thrombolytic: 'tenecteplase', thrombolyticDose: '18 mg EV em bolus', postThrombolysisBloodPressure: '190/108', postThrombolysisBPManagement: ['monitoring', 'nicardipine'], outcome: 'UTI' }) },
    expected: [/NIHSS 12/, /trombólise intravenosa/, /PA de 190\/108/, /nicardipina em infusão titulada/, /UTI ou unidade neurocrítica/]
  },
  {
    id: 'avc', flow: avcFlowchart, step: 'avc_aguardo_uti', history: ['avc_ativacao', 'avc_imagem', 'avc_janela', 'avc_cuidados_sem_reperfusao'],
    answers: { __avaliacao_clinica_inicial: universalAnswer, avc_caso_estruturado: JSON.stringify({ symptoms: ['fraqueza em hemicorpo'], imagingResult: 'sem_hemorragia', timeWindow: 'mais_24h', supportiveCare: ['disfagia', 'pressao', 'antiagregante', 'etiologia'], outcome: 'AVC acima de 24 horas - manejo clínico e prevenção secundária' }) },
    expected: [/apresentação acima de 24 horas/, /ausência de reperfusão foi determinada/, /estratégia antitrombótica/, /investigação etiológica/]
  },
  {
    id: 'anafilaxia', flow: anaphylaxisFlowchart, step: 'ana_observacao_alta', history: ['ana_inicio', 'ana_criterios_wao', 'ana_adrenalina_im', 'ana_estratificar_observacao'],
    answers: { __avaliacao_clinica_inicial: universalAnswer, ana_inicio: JSON.stringify({ achadosSelecionados: ['urticária', 'dispneia'], sistemasAcometidos: ['pele', 'respiratorio'] }), ana_criterios_wao: JSON.stringify({ criteriosSelecionados: ['criterio_1'], diagnosticoProvavel: true }), ana_preparo_imediato: JSON.stringify({ medidasSelecionadas: ['ajuda', 'monitorizacao'], abcdeSelecionado: ['airway', 'breathing', 'circulation'] }) },
    expected: [/Anafilaxia clinicamente provável/, /adrenalina intramuscular/, /alta após período de observação/]
  },
  {
    id: 'asthma', flow: asthmaFlowchart, step: 'asma_alta_final', history: ['asma_avaliacao_inicial', 'asma_tratamento_1h_leve_moderada', 'asma_saba_leve_moderada', 'asma_corticoide_leve_moderada', 'asma_resposta_boa'],
    answers: { __avaliacao_clinica_inicial: universalAnswer, asma_avaliacao_inicial: JSON.stringify({ values: { sato2: 93, fr: 27, fc: 105, pfe: 62 }, flags: { usoMusculatura: true } }), asma_reavaliacao_1h: JSON.stringify({ values: { sato2Re: 97, frRe: 20, pfeRe: 82 }, flags: { melhoraClinica: true } }) },
    expected: [/exacerbação asmática moderada/i, /boa resposta/, /alta do pronto-socorro/]
  },
  {
    id: 'hipertensao', flow: hypertensionFlowchart, step: 'hipertensao_emergencia_plano', history: ['hipertensao_confirmacao', 'hipertensao_lesao_orgao', 'hipertensao_emergencia_cenario'],
    answers: { __avaliacao_clinica_inicial: universalAnswer, hipertensao_caso_estruturado: JSON.stringify({ systolic: 220, diastolic: 130, symptoms: ['dyspnea'], organDamage: ['pulmonary_edema'], route: 'emergency', scenario: 'pulmonary_edema', selectedIVAgent: 'nitroglycerin', disposition: 'CTI' }) },
    expected: [/emergência hipertensiva/i, /edema agudo de pulmão/, /CTI/]
  },
  {
    id: 'geca', flow: gecaFlowchart, step: 'geca_alta_plano_a', history: ['geca_inicio', 'geca_perfil_diarreia', 'geca_classificacao_hidratacao', 'geca_plano_a', 'geca_destino'],
    answers: { __avaliacao_clinica_inicial: universalAnswer, geca_perfil_diarreia: 'aguda_aquosa', geca_classificacao_hidratacao: 'plano_a_sem_desidratacao', geca_destino: JSON.stringify({ decision: 'alta_segura', criteriosAltaLabels: ['hidratado', 'tolerando via oral'] }) },
    expected: [/diarreia aguda aquosa/, /sem sinais de desidratação/, /Plano A/]
  }
]
for (const testCase of narrativeCases) {
  const patient = narrativePatient(testCase.id, testCase.step, testCase.history, testCase.answers)
  const summary = buildClinicalSummary(patient, { flowchart: testCase.flow, currentStep: testCase.step, history: testCase.history, answers: testCase.answers })
  for (const pattern of testCase.expected) assert.match(summary.continuousText, pattern, `${testCase.id}: narrativa não contextualizou ${pattern}`)
  assert.doesNotMatch(summary.continuousText, /avc_caso_estruturado|hipertensao_caso_estruturado|sato2Re|usoMusculatura|decision:/, `${testCase.id}: resumo expôs chave técnica`)
}

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
for (const completed of ['asthma', 'dengue', 'anafilaxia', 'avc', 'hipertensao', 'pep_hiv']) {
  assert.doesNotMatch(inProgressIds, new RegExp(`['"]${completed}['"]`), `${completed}: ainda marcado como em andamento`)
  assert.match(finishedIds, new RegExp(`['"]${completed}['"]`), `${completed}: não marcado como finalizado`)
}

const gecaStepIds = new Set(Object.keys(gecaFlowchart.steps))
const gecaReachable = new Set()
const gecaQueue = [gecaFlowchart.initialStep]
while (gecaQueue.length > 0) {
  const stepId = gecaQueue.shift()
  if (!stepId || gecaReachable.has(stepId)) continue
  assert.ok(gecaStepIds.has(stepId), `GECA: etapa de destino inexistente: ${stepId}`)
  gecaReachable.add(stepId)
  for (const option of gecaFlowchart.steps[stepId].options || []) gecaQueue.push(option.nextStep)
}
assert.equal(gecaReachable.size, gecaStepIds.size, 'GECA: existem telas desconectadas do percurso principal')
const gecaTerminalSteps = [...gecaStepIds].filter(stepId => (gecaFlowchart.steps[stepId].options || []).length === 0)
assert.deepEqual(
  [...gecaTerminalSteps].sort(),
  [...gecaFlowchart.finalSteps].sort(),
  'GECA: toda tela sem saída deve ser um destino final declarado'
)
for (const marker of [
  'Gastroenterite aguda · percurso assistencial',
  "['Confirmação', 'Avaliação', 'Hidratação', 'Investigação', 'Tratamento', 'Destino']",
  'Decisão clínica guiada'
]) {
  assert.ok(emergencyComponentSource.includes(marker), `GECA: experiência fluida ausente: ${marker}`)
}

console.log('Clinical flow audit tests passed: universal assessment, anaphylaxis, dengue, asthma, AVC, hypertension, GECA and TVP routes.')
