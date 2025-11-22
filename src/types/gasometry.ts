export type GasometryType = 'arterial' | 'venous_central' | 'venous_peripheral'

export interface GasometryData {
    ph: number
    pco2: number
    po2: number
    hco3: number
    be: number
    sato2: number
}

export interface GasometryResult {
    acidBase: string
    compensation: string
    oxygenation: string
    anionGap?: number
    details: string[]
}
