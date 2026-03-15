const assert = require('node:assert/strict')

const winterStatus = (hco3, pco2) => {
  const expected = 1.5 * hco3 + 8
  const low = expected - 2
  const high = expected + 2
  if (pco2 < low) return 'met_acid_plus_resp_alk'
  if (pco2 > high) return 'met_acid_plus_resp_acid'
  return 'met_acid_compensated'
}

const anionGapStatus = (na, cl, hco3, albumin) => {
  const ag = na - (hco3 + cl)
  const corrected = Number.isFinite(albumin) ? ag + (4 - albumin) * 2.5 : ag
  if (corrected <= 12) return { type: 'hyperchloremic', ag: corrected }
  const delta = (corrected - 10) / (24 - hco3)
  if (delta > 2) return { type: 'high_ag_plus_met_alk', ag: corrected, delta }
  if (delta < 1) return { type: 'high_ag_plus_normal_ag_acidosis', ag: corrected, delta }
  return { type: 'high_ag_isolated', ag: corrected, delta }
}

const normalPhStatus = (hco3, pco2) => {
  const normalHco3 = hco3 >= 22 && hco3 <= 26
  const normalPco2 = pco2 >= 35 && pco2 <= 45
  return normalHco3 && normalPco2 ? 'normal' : 'mixed'
}

const metabolicAlkalosisStatus = (hco3, pco2) => {
  const expected = hco3 + 15
  return pco2 >= expected - 2 && pco2 <= expected + 2 ? 'compensated' : 'mixed'
}

const respiratoryAlkalosisStatus = (pco2, hco3) => {
  const delta = (40 - pco2) / 10
  const acute = 24 - 2 * delta
  const chronic = 24 - 5 * delta
  const acuteMatch = hco3 >= acute - 2 && hco3 <= acute + 2
  const chronicMatch = hco3 >= chronic - 2 && hco3 <= chronic + 2
  if (chronicMatch) return 'chronic'
  if (acuteMatch) return 'acute'
  return 'mixed'
}

assert.equal(winterStatus(10, 22), 'met_acid_compensated')
assert.equal(winterStatus(10, 15), 'met_acid_plus_resp_alk')
assert.equal(winterStatus(10, 30), 'met_acid_plus_resp_acid')

assert.equal(anionGapStatus(140, 118, 12, Number.NaN).type, 'hyperchloremic')
assert.equal(anionGapStatus(140, 98, 10, Number.NaN).type, 'high_ag_isolated')
assert.equal(anionGapStatus(140, 98, 20, Number.NaN).type, 'high_ag_plus_met_alk')
assert.equal(anionGapStatus(140, 110, 14, Number.NaN).type, 'high_ag_plus_normal_ag_acidosis')

assert.equal(normalPhStatus(24, 40), 'normal')
assert.equal(normalPhStatus(20, 32), 'mixed')

assert.equal(metabolicAlkalosisStatus(30, 45), 'compensated')
assert.equal(metabolicAlkalosisStatus(30, 36), 'mixed')

assert.equal(respiratoryAlkalosisStatus(30, 19), 'chronic')
assert.equal(respiratoryAlkalosisStatus(30, 24), 'acute')
assert.equal(respiratoryAlkalosisStatus(30, 26), 'mixed')

console.log('Gasometry formula tests passed')
