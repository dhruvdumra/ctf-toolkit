const enc = new TextEncoder()
const dec = new TextDecoder()
const bytes = (s) => enc.encode(s)

const radixEncode = (s, radix, width, sep = ' ') =>
  [...bytes(s)].map((b) => b.toString(radix).padStart(width, '0')).join(sep)

const radixDecode = (s, radix) => {
  const parts = s.trim().split(/\s+/).filter(Boolean)
  const out = new Uint8Array(parts.length)
  parts.forEach((p, i) => {
    const v = parseInt(p, radix)
    if (Number.isNaN(v) || v > 255) throw new Error('invalid value: ' + p)
    out[i] = v
  })
  return dec.decode(out)
}

export const binaryEncode = (s) => radixEncode(s, 2, 8)
export const binaryDecode = (s) => radixDecode(s.replace(/[^01\s]/g, ''), 2)

export const octalEncode = (s) => radixEncode(s, 8, 3)
export const octalDecode = (s) => radixDecode(s, 8)

export const decimalEncode = (s) => radixEncode(s, 10, 0)
export const decimalDecode = (s) => radixDecode(s, 10)

export const asciiEncode = (s) => [...s].map((c) => c.codePointAt(0)).join(' ')
export const asciiDecode = (s) =>
  s.trim().split(/\s+/).filter(Boolean).map((n) => {
    const v = parseInt(n, 10)
    if (Number.isNaN(v)) throw new Error('invalid code: ' + n)
    return String.fromCodePoint(v)
  }).join('')

export function a1z26Encode(s) {
  return s.toLowerCase().replace(/[a-z]/g, (c) => c.charCodeAt(0) - 96 + ' ').trim()
}
export function a1z26Decode(s) {
  return s.trim().split(/[\s.,;|-]+/).filter(Boolean).map((n) => {
    const v = parseInt(n, 10)
    if (v < 1 || v > 26) throw new Error('A1Z26 value out of range: ' + n)
    return String.fromCharCode(v + 96)
  }).join('')
}
const ROMAN = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], 
[40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]
const ROMAN_VAL = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }

export function romanEncode(s) {
  return s.trim().split(/\s+/).filter(Boolean).map((tok) => {
    let n = parseInt(tok, 10)
    if (Number.isNaN(n) || n < 1 || n > 3999) throw new Error('roman supports 1..3999: ' + tok)
    let out = ''
    for (const [v, sym] of ROMAN) while (n >= v) { out += sym; n -= v }
    return out
  }).join(' ')
}

export function romanDecode(s) {
  return s.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const t = tok.toUpperCase()
    let total = 0
    for (let i = 0; i < t.length; i++) {
      const cur = ROMAN_VAL[t[i]]
      if (cur === undefined) throw new Error('invalid roman numeral: ' + tok)
      const next = ROMAN_VAL[t[i + 1]]
      total += next > cur ? -cur : cur
    }
    return total
  }).join(' ')
}

export function toRadix(s, radix = 16) {
  return s.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const n = parseInt(tok, 10)
    if (Number.isNaN(n)) throw new Error('not a base-10 number: ' + tok)
    return n.toString(radix)
  }).join(' ')
}

export function fromRadix(s, radix = 16) {
  return s.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const n = parseInt(tok, radix)
    if (Number.isNaN(n)) throw new Error(`invalid base-${radix} value: ` + tok)
    return n.toString(10)
  }).join(' ')
}
