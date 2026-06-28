import * as base from '../encoding/base.js'
import { binaryDecode, octalDecode, decimalDecode } from '../encoding/numeric.js'
import { morseDecode } from '../encoding/misc.js'
import { rot13 } from '../encoding/rot.js'

function printableRatio(s) {
  if (!s) return 0
  let p = 0
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126) || c > 160) p++
  }
  return p / s.length
}

const CANDIDATES = [
  { name: 'Base64', test: (s) => /^[A-Za-z0-9+/]+={0,2}$/.test(s) && s.length % 4 === 0, decode: base.base64Decode },
  { name: 'Base64 (URL-safe)', test: (s) => /^[A-Za-z0-9\-_]+={0,2}$/.test(s) && /[-_]/.test(s), decode: base.base64urlDecode },
    { name: 'Base32', test: (s) => /^[A-Z2-7]+=*$/.test(s), decode: base.base32Decode },
{ name: 'Base58', test: (s) => /^[1-9A-HJ-NP-Za-km-z]+$/.test(s), decode: base.base58Decode },
  { name: 'Base85 (Ascii85)', test: (s) => /^[!-u]+$/.test(s) && s.length > 3, decode: base.base85Decode },
  { name: 'Base91', test: (s) => s.length > 2, decode: base.base91Decode },
  { name: 'Hex', test: (s) => /^[0-9a-f\s]+$/i.test(s) && s.replace(/\s/g, '').length % 2 === 0, decode: base.hexDecode },
  { name: 'Binary', test: (s) => /^[01\s]+$/.test(s), decode: binaryDecode },
  { name: 'Octal', test: (s) => /^[0-7\s]+$/.test(s) && /\s/.test(s), decode: octalDecode },
    { name: 'Decimal bytes', test: (s) => /^[0-9\s]+$/.test(s) && /\s/.test(s), decode: decimalDecode },
{ name: 'Morse', test: (s) => /^[.\-/\s]+$/.test(s) && /[.\-]/.test(s), decode: morseDecode },
  { name: 'ROT13', test: (s) => /[a-z]/i.test(s), decode: rot13 },
]

export function magicDecode(input, { threshold = 0.85 } = {}) {
  const s = input.trim()
  if (!s) return []
  const results = []
  for (const c of CANDIDATES) {
    try {
      if (c.test && !c.test(s)) continue
      const output = c.decode(s)
      if (!output || output === s) continue
      const score = printableRatio(output)
      if (score >= threshold) results.push({ name: c.name, output, score })
    } catch {
      continue
    }
  }
  return results.sort((a, b) => b.score - a.score)
}
