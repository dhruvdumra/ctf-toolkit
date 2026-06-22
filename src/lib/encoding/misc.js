import { MORSE, MORSE_REV } from '../../data/morse.js'
import { NATO, NATO_REV } from '../../data/nato.js'

export function morseEncode(s) {
  return [...s.toLowerCase()]
    .map((c) => MORSE[c] ?? (c === ' ' ? '/' : ''))
    .filter(Boolean)
    .join(' ')
}
export function morseDecode(s) {
  return s.trim().split(/\s+/).map((sym) => (sym === '/' ? ' ' : MORSE_REV[sym] ?? '')).join('')
}

export function natoEncode(s) {
  return [...s.toLowerCase()]
    .map((c) => NATO[c] ?? (c === ' ' ? '(space)' : c))
    .join(' ')
}
export function natoDecode(s) {
  return s.trim().split(/\s+/).map((w) => {
    if (w === '(space)') return ' '
    return NATO_REV[w.toLowerCase()] ?? w
  }).join('')
}

export function quotedPrintableEncode(s) {
  const b = new TextEncoder().encode(s)
  let out = ''
  for (const byte of b) {
    if ((byte >= 33 && byte <= 126 && byte !== 61) || byte === 32 || byte === 9) {
      out += String.fromCharCode(byte)
    } else {
      out += '=' + byte.toString(16).toUpperCase().padStart(2, '0')
    }
  }
  return out
}
export function quotedPrintableDecode(s) {
  const cleaned = s.replace(/=\r?\n/g, '')
  const bytes = []
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '=') {
      bytes.push(parseInt(cleaned.substr(i + 1, 2), 16))
      i += 2
    } else bytes.push(cleaned.charCodeAt(i))
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

function chunkEncode(input, name, alphabet, pad) {
  const b = new TextEncoder().encode(input)
  const ch = (v) => alphabet[v & 0x3f]
  const lines = [`begin 644 ${name}`]
  for (let i = 0; i < b.length; i += 45) {
    const slice = b.subarray(i, i + 45)
    let line = alphabet[pad ? slice.length & 0x3f : slice.length]
    for (let j = 0; j < slice.length; j += 3) {
      const b0 = slice[j], b1 = slice[j + 1] || 0, b2 = slice[j + 2] || 0
      line += ch(b0 >> 2) + ch((b0 << 4) | (b1 >> 4)) + ch((b1 << 2) | (b2 >> 6)) + ch(b2)
    }
    lines.push(line)
  }
  lines.push(pad ? '`' : alphabet[0], 'end')
  return lines.join('\n')
}

function chunkDecode(input, alphabet) {
  const val = (c) => {
    const i = alphabet.indexOf(c)
    return i < 0 ? 0 : i
  }
  const out = []
  for (const line of input.split(/\r?\n/)) {
    if (!line || /^begin/i.test(line) || /^end/i.test(line) || line === '`') continue
    const len = val(line[0])
    const acc = []
    for (let i = 1; i < line.length; i += 4) {
      const c0 = val(line[i]), c1 = val(line[i + 1]), c2 = val(line[i + 2]), c3 = val(line[i + 3])
      acc.push((c0 << 2) | (c1 >> 4), ((c1 & 0xf) << 4) | (c2 >> 2), ((c2 & 0x3) << 6) | c3)
    }
    out.push(...acc.slice(0, len))
  }
  return new TextDecoder().decode(new Uint8Array(out))
}

const UU = Array.from({ length: 64 }, (_, i) => String.fromCharCode(i === 0 ? 96 : i + 32))
const XX = '+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')

export const uuEncode = (s, name = 'data') => chunkEncode(s, name, UU, false)
export const uuDecode = (s) => chunkDecode(s, UU)
export const xxEncode = (s, name = 'data') => chunkEncode(s, name, XX, false)
export const xxDecode = (s) => chunkDecode(s, XX)
