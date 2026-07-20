/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const logicSource = fs.readFileSync(path.join(root, 'src/lib/clinicalRouting.ts'), 'utf8')
const patientFormSource = fs.readFileSync(path.join(root, 'src/components/PatientForm.tsx'), 'utf8')
const navigatorSource = fs.readFileSync(path.join(root, 'src/components/ClinicalIntakeNavigator.tsx'), 'utf8')
const sidebarSource = fs.readFileSync(path.join(root, 'src/components/Sidebar.tsx'), 'utf8')
const pageSource = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8')

const compiled = ts.transpileModule(logicSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const logicModule = { exports: {} }
vm.runInNewContext(compiled, { module: logicModule, exports: logicModule.exports }, { filename: 'clinicalRouting.compiled.js' })
const { recommendClinicalRoutes, normalizeClinicalText } = logicModule.exports

assert.equal(normalizeClinicalText('Pressão MUITO elevada!'), 'pressao muito elevada')
assert.deepEqual(Array.from(recommendClinicalRoutes('', [])), [])

const top = (complaint, symptoms) => recommendClinicalRoutes(complaint, symptoms).map(item => item.flowchartId)

assert.equal(top('Dor no peito em aperto com sudorese fria', ['dor_toracica'])[0], 'iam')
assert.equal(top('Começou com boca torta e fala enrolada', ['deficit_focal'])[0], 'avc')
assert.equal(top('Reação alérgica após medicamento', ['urticaria', 'dispneia'])[0], 'anafilaxia')
assert.equal(top('Febre e pele amarela com dor abdominal', ['febre', 'ictericia', 'dor_abdominal'])[0], 'cholangitis')
assert.equal(top('Pressão muito alta com cefaleia', ['pressao_alta', 'cefaleia'])[0], 'hipertensao')

const thromboembolic = top('Falta de ar súbita e panturrilha inchada', ['dispneia', 'edema_perna'])
assert.equal(thromboembolic[0], 'tep')
assert.ok(thromboembolic.includes('tvp'))

const diarrhea = top('Diarreia aguda com vômitos', ['diarreia', 'vomitos'])
assert.ok(diarrhea.includes('geca'))
assert.ok(diarrhea.includes('diarreia'))

assert.match(patientFormSource, /ClinicalIntakeNavigator/)
assert.doesNotMatch(patientFormSource, /<EmergencySelector/)
assert.match(navigatorSource, /Apoio, não diagnóstico/)
assert.match(navigatorSource, /Já sei qual protocolo usar \/ escolher manualmente/)
assert.match(sidebarSource, /Biblioteca de fluxogramas[\s\S]*view=emergency-selector/)
assert.match(pageSource, /shouldOpenFlowchartLibraryDirectly/)

console.log('Clinical routing tests passed: complaint matching, red flags, manual fallback and sidebar library route.')

