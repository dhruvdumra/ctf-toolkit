const A = 65
const onlyAlpha = (k) => k.toUpperCase().replace(/[^A-Z]/g, '')
const isLetter = (c) => /[a-z]/i.test(c)
const baseOf = (c) => (c <= 'Z' ? 65 : 97)

function vig(text, key, dec) {
  const k = onlyAlpha(key)
  if (!k) throw new Error('key must contain letters')
  let ki = 0, out = ''
  for (const ch of text) {
    if (isLetter(ch)) {
      const base = baseOf(ch)
      const s = k.charCodeAt(ki % k.length) - A
      const c = ch.charCodeAt(0) - base
      out += String.fromCharCode(((dec ? c - s : c + s) % 26 + 26) % 26 + base)
      ki++
    } else out += ch
  }
  return out
}
export const vigenereEncrypt = (t, k) => vig(t, k, false)
export const vigenereDecrypt = (t, k) => vig(t, k, true)

export function autokeyEncrypt(text, key) {
  const stream = onlyAlpha(key).split('')
  if (!stream.length) throw new Error('key required')
  let ki = 0, out = ''
  for (const ch of text) {
    if (isLetter(ch)) {
      const base = baseOf(ch)
      const p = ch.charCodeAt(0) - base
      const s = stream[ki].charCodeAt(0) - A
      out += String.fromCharCode((p + s) % 26 + base)
      stream.push(String.fromCharCode(p + A))
      ki++
    } else out += ch
  }
  return out
}
export function autokeyDecrypt(text, key) {
  const stream = onlyAlpha(key).split('')
  if (!stream.length) throw new Error('key required')
  let ki = 0, out = ''
  for (const ch of text) {
    if (isLetter(ch)) {
      const base = baseOf(ch)
      const c = ch.charCodeAt(0) - base
      const s = stream[ki].charCodeAt(0) - A
      const p = (c - s + 26) % 26
      out += String.fromCharCode(p + base)
      stream.push(String.fromCharCode(p + A))
      ki++
    } else out += ch
  }
  return out
}

export function beaufort(text, key) {
  const k = onlyAlpha(key)
  if (!k) throw new Error('key required')
  let ki = 0, out = ''
  for (const ch of text) {
    if (isLetter(ch)) {
      const base = baseOf(ch)
      const p = ch.charCodeAt(0) - base
      const s = k.charCodeAt(ki % k.length) - A
      out += String.fromCharCode(((s - p) % 26 + 26) % 26 + base)
      ki++
    } else out += ch
  }
  return out
}
export const beaufortEncrypt = beaufort
export const beaufortDecrypt = beaufort

function gron(text, key, dec) {
  const digits = String(key).replace(/[^0-9]/g, '').split('').map(Number)
  if (!digits.length) throw new Error('numeric key required')
  let ki = 0, out = ''
  for (const ch of text) {
    if (isLetter(ch)) {
      const base = baseOf(ch)
      const s = digits[ki % digits.length]
      const c = ch.charCodeAt(0) - base
      out += String.fromCharCode(((dec ? c - s : c + s) % 26 + 26) % 26 + base)
      ki++
    } else out += ch
  }
  return out
}
export const gronsfeldEncrypt = (t, k) => gron(t, k, false)
export const gronsfeldDecrypt = (t, k) => gron(t, k, true)
