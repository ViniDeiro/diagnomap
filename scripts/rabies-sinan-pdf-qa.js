/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText
  module._compile(output, filename)
}

global.fetch = async resource => {
  const relative = String(resource).replace(/^\//, '')
  const bytes = fs.readFileSync(path.join(root, 'public', relative))
  return new Response(bytes, { status: 200, headers: { 'content-type': 'image/png' } })
}

global.FileReader = class FileReader {
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buffer => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`
      this.onload?.()
    }).catch(error => {
      this.error = error
      this.onerror?.()
    })
  }
}

const { createRabiesSinanPdf } = require('../src/lib/rabiesSinanPdf.ts')

const patient = {
  id: 'qa', name: 'Maria da Silva Santos', birthDate: new Date('1984-05-12T12:00:00'), age: 42,
  gender: 'Feminino', weight: 68, medicalRecord: 'QA-2026'
}

const notification = {
  notificationNumber: '202600012345', notificationDate: '2026-07-25', attendanceDate: '2026-07-25',
  notifyingState: 'SP', notifyingCity: 'Mogi das Cruzes', notifyingUnit: 'Unidade de Saúde Central', notifyingUnitCode: '1234567',
  motherName: 'Ana da Silva', susCard: '898001234567890', raceColor: 'brown', education: '6', occupation: 'Professora',
  residenceState: 'SP', residenceCity: 'Mogi das Cruzes', district: 'Centro', neighborhood: 'Centro', street: 'Rua das Flores',
  addressNumber: '123', complement: 'Apto 12', referencePoint: 'Próximo à praça', postalCode: '08700-000', phone: '(11) 99999-0000', zone: 'urban',
  exposureTypes: ['bite'], exposureLocations: ['hands_feet'], woundCount: 'single', woundTypes: ['deep'], exposureDate: '2026-07-25',
  previousRabiesTreatment: 'no', animalSpecies: 'dog', animalCondition: 'suspect', animalObservable: 'no', treatmentIndicated: 'serum_vaccine',
  vaccineManufacturer: 'Instituto Butantan', vaccineLot: 'VAC123', vaccineExpiration: '2027-12-31', vaccineDates: ['2026-07-25', '2026-07-28', '2026-08-01', '2026-08-08'],
  serumIndicated: 'yes', serumWeightKg: '68', serumAmountMl: '12', serumType: 'heterologous', serumInfiltration: 'yes', serumInfiltrationExtent: 'total',
  serumManufacturer: 'Instituto Butantan', serumBatch: 'SAR9876', closureDate: '2026-08-08', observations: 'Paciente orientada quanto ao retorno e sinais de alarme.',
  investigatorUnit: 'Mogi das Cruzes / Unidade Central', investigatorName: 'Dr. João Souza', investigatorRole: 'Médico'
}

;(async () => {
  const pdf = await createRabiesSinanPdf({ patient, notification })
  const output = process.argv[2] || path.join(root, 'tmp/pdfs/ficha-sinan-raiva-qa.pdf')
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, Buffer.from(pdf.output('arraybuffer')))
  console.log(output)
})().catch(error => {
  console.error(error)
  process.exitCode = 1
})
