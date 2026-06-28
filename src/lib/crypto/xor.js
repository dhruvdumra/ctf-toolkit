const enc = new TextEncoder()
const dec = new TextDecoder()

function hexToBytes(hex) {
  const clean = hex.replace(/0x/gi, '').replace(/\s+/g, '')
  if (clean.length % 2) throw new Error('hex length must be even')
  const b = new Uint8Array(clean.length / 2)
  for (let i = 0; i < b.length; i++) b[i] = parseInt(clean.substr(i * 2, 2), 16)
  return b
}

function bytesToHex(b) {
  let out = ''
  for (const x of b) out += x.toString(16).padStart(2, '0')
  return out
}

function keyToBytes(key, keyHex) {
  if (keyHex) return hexToBytes(key)
  return enc.encode(key)
}

export function xorEncrypt(input, key, { keyHex = false } = {}) {
  const data = enc.encode(input)
  const k = keyToBytes(key, keyHex)
  if (!k.length) throw new Error('key required')
  const out = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ k[i % k.length]
  return bytesToHex(out)
}

export function xorDecrypt(hexInput, key, { keyHex = false } = {}) {
  const data = hexToBytes(hexInput)
  const k = keyToBytes(key, keyHex)
  if (!k.length) throw new Error('key required')
  const out = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ k[i % k.length]
  return dec.decode(out)
}

const FREQ = {
  a: 8.2, b: 1.5, c: 2.8, d: 4.3, e: 12.7, f: 2.2, g: 2.0, h: 6.1, i: 7.0,
    j: 0.15, k: 0.77, l: 4.0, m: 2.4, n: 6.7, o: 7.5, p: 1.9, q: 0.095, r: 6.0,
s: 6.3, t: 9.1, u: 2.8, v: 0.98, w: 2.4, x: 0.15, y: 2.0, z: 0.074,
}

function englishScore(bytes) {
  let s = 0
  for (const b of bytes) {
    if (b === 32) { s += 6; continue }
    const c = String.fromCharCode(b).toLowerCase()
    if (c >= 'a' && c <= 'z') s += FREQ[c] || 0
    else if (b >= 48 && b <= 57) s += 1
    else if (b < 9 || (b > 13 && b < 32) || b > 126) s -= 20
  }
  return s
}

export function xorBruteSingle(hexInput, { top = 12 } = {}) {
  const data = hexToBytes(hexInput)
  const results = []
  for (let key = 0; key < 256; key++) {
    const out = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key
    results.push({
      key,
      keyChar: key >= 32 && key < 127 ? String.fromCharCode(key) : '.',
      score: englishScore(out),
      text: dec.decode(out),
    })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, top)
}

export function guessKeyLength(hexInput, { maxLen = 20 } = {}) {
  const data = hexToBytes(hexInput)
  const scores = []
  for (let len = 1; len <= Math.min(maxLen, data.length >> 1); len++) {
    let total = 0, count = 0
    for (let i = 0; i + len < data.length; i++) {
      total += hamming(data[i], data[i + len])
      count++
    }
    scores.push({ len, distance: count ? total / count / len : Infinity })
  }
  return scores.sort((a, b) => a.distance - b.distance).slice(0, 5)
}

function hamming(a, b) {
  let x = a ^ b, c = 0
  while (x) { c += x & 1; x >>= 1 }
  return c
}
