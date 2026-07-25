import { jsPDF } from 'jspdf'
import type { EmergencyPatient } from '@/types/emergency'
import type { RabiesNotificationData } from '@/components/RabiesNotificationForm'

const TEMPLATE_PAGES = [
  '/forms/ficha-sinan-raiva-pagina-1.png',
  '/forms/ficha-sinan-raiva-pagina-2.png'
]

type PdfActionData = {
  patient: EmergencyPatient
  notification?: RabiesNotificationData
}

const clean = (value?: string | number) => value == null ? '' : String(value).trim()
const date = (value?: string | Date) => {
  if (!value) return ''
  const parsed = value instanceof Date ? value : new Date(`${value}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? clean(value as string) : parsed.toLocaleDateString('pt-BR')
}

const loadImage = async (src: string) => {
  const response = await fetch(src)
  if (!response.ok) throw new Error('Não foi possível carregar o modelo oficial da ficha SINAN.')
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

const choiceCode = (value: string | undefined, map: Record<string, string>) => map[value || ''] || ''

export const createRabiesSinanPdf = async ({ patient, notification = {} }: PdfActionData) => {
  const [pageOne, pageTwo] = await Promise.all(TEMPLATE_PAGES.map(loadImage))
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const text = (value: string | number | undefined, x: number, y: number, width = 80, size = 7) => {
    const content = clean(value)
    if (!content) return
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(size)
    pdf.setTextColor(0, 45, 105)
    pdf.text(pdf.splitTextToSize(content, width), x, y)
  }
  const mark = (selected: boolean, x: number, y: number) => {
    if (!selected) return
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(0, 45, 105)
    pdf.text('X', x, y)
  }

  pdf.addImage(pageOne, 'PNG', 0, 0, 210, 297)
  text(notification.notificationNumber, 169, 15.5, 28, 8)
  text(date(notification.notificationDate), 162, 38.8, 31)
  text(notification.notifyingState, 20.5, 48.8, 7)
  text(notification.notifyingCity, 31, 48.8, 130)
  text(notification.notifyingUnit, 20, 59.3, 101)
  text(notification.notifyingUnitCode, 124, 59.3, 31)
  text(date(notification.attendanceDate), 163, 59.3, 31)
  text(patient.name, 20, 70.2, 135, 7.5)
  text(date(patient.birthDate), 164, 70.2, 31)
  text(patient.age, 25, 80.2, 10)
  text(choiceCode(patient.gender?.toLowerCase(), { masculino: 'M', male: 'M', m: 'M', feminino: 'F', female: 'F', f: 'F' }) || 'I', 85, 80.2, 8)
  text(choiceCode(notification.raceColor, { white: '1', black: '2', yellow: '3', brown: '4', indigenous: '5', ignored: '9' }), 196, 80.2, 6)
  text(notification.education, 196, 91.2, 7)
  text(notification.susCard, 24, 102.1, 56)
  text(notification.motherName, 86, 102.1, 106)
  text(notification.residenceState, 20, 112.7, 7)
  text(notification.residenceCity, 31, 112.7, 82)
  text(notification.district, 153, 112.7, 39)
  text(notification.neighborhood, 20, 122.7, 45)
  text(notification.street, 72, 122.7, 92)
  text(notification.addressNumber, 20, 132.8, 16)
  text(notification.complement, 41, 132.8, 99)
  text(notification.referencePoint, 80, 142.9, 77)
  text(notification.postalCode, 165, 142.9, 28)
  text(notification.phone, 21, 153.1, 48)
  text(choiceCode(notification.zone, { urban: '1', rural: '2', periurban: '3', ignored: '9' }), 120, 153.1, 6)
  text(notification.occupation, 22, 164.1, 171)

  const exposures = notification.exposureTypes || []
  mark(exposures.includes('indirect'), 68.8, 174.1)
  mark(exposures.includes('scratch'), 96.3, 174.1)
  mark(exposures.includes('lick'), 120.6, 174.1)
  mark(exposures.includes('bite'), 145.7, 174.1)
  mark(exposures.includes('other'), 169.8, 174.1)
  const locations = notification.exposureLocations || []
  mark(locations.includes('mucosa'), 68, 184.3)
  mark(locations.includes('head_neck'), 83.8, 184.3)
  mark(locations.includes('hands_feet'), 110, 184.3)
  mark(locations.includes('trunk'), 127.2, 184.3)
  mark(locations.includes('upper_limbs'), 166.8, 184.3)
  mark(locations.includes('lower_limbs'), 191, 184.3)
  text(choiceCode(notification.woundCount, { single: '1', multiple: '2', none: '3', ignored: '9' }), 74, 194.2, 6)
  const wounds = notification.woundTypes || []
  mark(wounds.includes('deep'), 127.8, 194.2)
  mark(wounds.includes('superficial'), 153.7, 194.2)
  mark(wounds.includes('lacerating'), 176.4, 194.2)
  text(date(notification.exposureDate), 24, 204.6, 34)
  text(choiceCode(notification.previousRabiesTreatment, { yes: '1', no: '2', ignored: '9' }), 127, 204.6, 6)
  mark((notification.previousTreatmentType || []).includes('pre_exposure'), 127.1, 204.6)
  mark((notification.previousTreatmentType || []).includes('post_exposure'), 174.3, 204.6)
  text(choiceCode(notification.previousCompletion, { within_90: '1', after_90: '2' }), 109, 214.8, 6)
  text(notification.previousDoses, 187, 214.8, 8)
  text(choiceCode(notification.animalSpecies, { dog: '1', cat: '2', bat: '3', primate: '4', fox: '5', economic: '6', other: '7' }), 196, 224.8, 6)
  if (notification.animalSpecies === 'other') text(notification.otherAnimalSpecies, 165, 222.8, 28, 6)
  text(choiceCode(notification.animalCondition, { healthy: '1', suspect: '2', rabid: '3', dead_missing: '4' }), 106, 234.8, 6)
  text(choiceCode(notification.animalObservable, { yes: '1', no: '2' }), 196, 234.8, 6)
  text(choiceCode(notification.treatmentIndicated, { pre_exposure: '1', dispensed: '2', animal_observation: '3', observation_vaccine: '4', vaccine: '5', serum_vaccine: '6', reexposure: '7' }), 197, 250.8, 6)
  text(notification.vaccineManufacturer, 135, 264.8, 48, 6)
  text(notification.vaccineLot, 23, 275.8, 84)
  text(date(notification.vaccineExpiration), 168, 275.8, 31)

  pdf.addPage('a4', 'portrait')
  pdf.addImage(pageTwo, 'PNG', 0, 0, 210, 297)
  ;(notification.vaccineDates || []).slice(0, 5).forEach((item, index) => text(date(item), 25 + index * 31.5, 28.8, 26, 6.5))
  text(choiceCode(notification.animalFinalCondition, { negative_clinical: '1', negative_lab: '2', positive_clinical: '3', positive_lab: '4', dead_no_diagnosis: '5', ignored: '9' }), 197, 40.8, 6)
  text(choiceCode(notification.treatmentInterrupted, { yes: '1', no: '2' }), 74, 55.8, 6)
  text(choiceCode(notification.interruptionReason, { service_indication: '1', abandonment: '2', transfer: '3' }), 196, 55.8, 6)
  text(choiceCode(notification.patientSearchedAfterAbandonment, { yes: '1', no: '2' }), 145, 70.8, 6)
  text(choiceCode(notification.vaccineAdverseEvent, { yes: '1', no: '2', ignored: '9' }), 199, 70.8, 6)
  text(choiceCode(notification.serumIndicated, { yes: '1', no: '2', ignored: '9' }), 74, 77.8, 6)
  text(notification.serumWeightKg || patient.weight, 88, 77.8, 18)
  text(notification.serumAmountMl, 128, 77.8, 22)
  text(choiceCode(notification.serumType, { heterologous: '1', homologous: '2' }), 196, 77.8, 6)
  text(choiceCode(notification.serumInfiltration, { yes: '1', no: '2' }), 64, 92.8, 6)
  text(choiceCode(notification.serumInfiltrationExtent, { total: '1', partial: '2' }), 102, 92.8, 6)
  text(notification.serumManufacturer, 166, 92.8, 30, 6)
  text(notification.serumBatch, 24, 107.8, 45)
  text(choiceCode(notification.serumAdverseEvent, { yes: '1', no: '2', ignored: '9' }), 128, 107.8, 6)
  text(date(notification.closureDate), 145, 107.8, 31)
  text(notification.observations, 13, 120.5, 184, 6.5)
  text(notification.investigatorUnit, 25, 191.2, 135)
  text(notification.notifyingUnitCode, 176, 191.2, 22)
  text(notification.investigatorName, 25, 202.8, 66)
  text(notification.investigatorRole, 99, 202.8, 64)

  return pdf
}

const filenameFor = (patient: EmergencyPatient) => {
  const slug = patient.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
  return `ficha-sinan-raiva-${slug || 'paciente'}.pdf`
}

export const saveRabiesSinanPdf = async (data: PdfActionData) => {
  const pdf = await createRabiesSinanPdf(data)
  pdf.save(filenameFor(data.patient))
}

export const printRabiesSinanPdf = async (data: PdfActionData) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) throw new Error('Permita pop-ups para abrir a impressão da ficha SINAN.')
  try {
    const pdf = await createRabiesSinanPdf(data)
    const url = URL.createObjectURL(pdf.output('blob'))
    printWindow.location.href = url
    window.setTimeout(() => printWindow.print(), 900)
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    printWindow.close()
    throw error
  }
}
