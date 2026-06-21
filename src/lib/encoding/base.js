const enc = new TextEncoder()
const dec = new TextDecoder()

export const toBytes = (s) => (s instanceof Uint8Array ? s : enc.encode(s))
export const fromBytes = (b) =>
  dec.decode(b instanceof Uint8Array ? b : new Uint8Array(b))

export function hexEncode(input) {
  let out = ''
  for (const x of toBytes(input)) out += x.toString(16).padStart(2, '0')
  return out
}

export function hexDecode(hex) {
  const clean = hex.replace(/0x/gi, '').replace(/\s+/g, '')
  if (clean.length % 2) throw new Error('hex length must be even')
  const b = new Uint8Array(clean.length / 2)
  for (let i = 0; i < b.length; i++) {
    const byte = parseInt(clean.substr(i * 2, 2), 16)
    if (Number.isNaN(byte)) throw new Error('invalid hex digit')
    b[i] = byte
  }
  return fromBytes(b)
}

function bigEncode(bytes, alphabet) {
  const base = alphabet.length
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++
  const digits = [0]
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i]
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8
      digits[j] = carry % base
      carry = (carry / base) | 0
    }
    while (carry > 0) {
      digits.push(carry % base)
      carry = (carry / base) | 0
    }
  }
  return alphabet[0].repeat(zeros) + digits.reverse().map((d) => alphabet[d]).join('')
}

function bigDecode(str, alphabet) {
  const base = alphabet.length
  const map = Object.fromEntries([...alphabet].map((c, i) => [c, i]))
  let zeros = 0
  while (zeros < str.length && str[zeros] === alphabet[0]) zeros++
  const bytes = [0]
  for (let i = zeros; i < str.length; i++) {
    const val = map[str[i]]
    if (val === undefined) throw new Error('invalid character: ' + str[i])
    let carry = val
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * base
      bytes[j] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  const out = new Uint8Array(zeros + bytes.length)
  for (let i = 0; i < bytes.length; i++) out[zeros + bytes.length - 1 - i] = bytes[i]
  return out
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export const base58Encode = (s) => bigEncode(toBytes(s), B58)
export const base58Decode = (s) => fromBytes(bigDecode(s.trim(), B58))

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
export const base62Encode = (s) => bigEncode(toBytes(s), B62)
export const base62Decode = (s) => fromBytes(bigDecode(s.trim(), B62))

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function b64enc(bytes, alphabet, pad) {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0)
    out += alphabet[(n >> 18) & 63] + alphabet[(n >> 12) & 63]
    out += i + 1 < bytes.length ? alphabet[(n >> 6) & 63] : pad ? '=' : ''
    out += i + 2 < bytes.length ? alphabet[n & 63] : pad ? '=' : ''
  }
  return out
}

function b64dec(str, alphabet) {
  const map = Object.fromEntries([...alphabet].map((c, i) => [c, i]))
  const clean = str.replace(/=+$/, '').replace(/\s+/g, '')
  const out = []
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = map[clean[i]], c1 = map[clean[i + 1]]
    const c2 = map[clean[i + 2]], c3 = map[clean[i + 3]]
    if (c0 === undefined || c1 === undefined) throw new Error('invalid base64')
    const n = (c0 << 18) | (c1 << 12) | ((c2 || 0) << 6) | (c3 || 0)
    out.push((n >> 16) & 255)
    if (c2 !== undefined) out.push((n >> 8) & 255)
    if (c3 !== undefined) out.push(n & 255)
  }
  return new Uint8Array(out)
}

export const base64Encode = (s) => b64enc(toBytes(s), B64, true)
export const base64Decode = (s) => fromBytes(b64dec(s, B64))

const B64URL = B64.slice(0, 62) + '-_'
export const base64urlEncode = (s) => b64enc(toBytes(s), B64URL, false)
export const base64urlDecode = (s) =>
  fromBytes(b64dec(s.replace(/-/g, '+').replace(/_/g, '/'), B64))

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Encode(input) {
  let bits = 0, value = 0, out = ''
  for (const byte of toBytes(input)) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  while (out.length % 8) out += '='
  return out
}

export function base32Decode(str) {
  const clean = str.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase()
  let bits = 0, value = 0
  const out = []
  for (const ch of clean) {
    const idx = B32.indexOf(ch)
    if (idx < 0) throw new Error('invalid base32 character: ' + ch)
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8 }
  }
  return fromBytes(new Uint8Array(out))
}

const B45 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

export function base45Encode(input) {
  const b = toBytes(input)
  let out = ''
  for (let i = 0; i < b.length; i += 2) {
    if (i + 1 < b.length) {
      const x = (b[i] << 8) + b[i + 1]
      out += B45[x % 45] + B45[Math.floor(x / 45) % 45] + B45[Math.floor(x / 2025)]
    } else {
      out += B45[b[i] % 45] + B45[Math.floor(b[i] / 45)]
    }
  }
  return out
}

export function base45Decode(str) {
  const clean = str.replace(/[\r\n\t]/g, '')
  const idx = (c) => {
    const v = B45.indexOf(c)
    if (v < 0) throw new Error('invalid base45 character: ' + c)
    return v
  }
  const out = []
  for (let i = 0; i < clean.length;) {
    const left = clean.length - i
    if (left >= 3) {
      const x = idx(clean[i]) + idx(clean[i + 1]) * 45 + idx(clean[i + 2]) * 2025
      out.push((x >> 8) & 255, x & 255)
      i += 3
    } else if (left === 2) {
      out.push((idx(clean[i]) + idx(clean[i + 1]) * 45) & 255)
      i += 2
    } else throw new Error('invalid base45 length')
  }
  return fromBytes(new Uint8Array(out))
}
export function base85Encode(input) {
  const b = toBytes(input)
  let out = ''
  for (let i = 0; i < b.length; i += 4) {
    let n = 0, count = 0
    for (let j = 0; j < 4; j++) {
      n = n * 256 + (i + j < b.length ? b[i + j] : 0)
      if (i + j < b.length) count++
    }
    if (count === 4 && n === 0) { out += 'z'; continue }
    const chars = []
    for (let j = 0; j < 5; j++) { chars.unshift(String.fromCharCode((n % 85) + 33)); n = Math.floor(n / 85) }
    out += chars.slice(0, count + 1).join('')
  }
  return out
}

export function base85Decode(str) {
  const s = str.replace(/^<~/, '').replace(/~>$/, '').replace(/\s+/g, '')
  const out = []
  for (let i = 0; i < s.length;) {
    if (s[i] === 'z') { out.push(0, 0, 0, 0); i++; continue }
    let n = 0, count = 0
    for (let j = 0; j < 5; j++) {
      if (i < s.length) {
        const c = s.charCodeAt(i) - 33
        if (c < 0 || c > 84) throw new Error('invalid ascii85 character')
        n = n * 85 + c; count++; i++
      } else n = n * 85 + 84
    }
    const bytes = [
      Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256,
      Math.floor(n / 256) % 256, n % 256,
    ]
    out.push(...bytes.slice(0, count - 1))
  }
  return fromBytes(new Uint8Array(out))
}

const B91 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  '!#$%&()*+,./:;<=>?@[]^_`{|}~"'

export function base91Encode(input) {
  const b = toBytes(input)
  let out = '', n = 0, bits = 0
  for (const byte of b) {
    n |= byte << bits
    bits += 8
    if (bits > 13) {
      let v = n & 8191
      if (v > 88) { n >>= 13; bits -= 13 } else { v = n & 16383; n >>= 14; bits -= 14 }
      out += B91[v % 91] + B91[Math.floor(v / 91)]
    }
  }
  if (bits) {
    out += B91[n % 91]
    if (bits > 7 || n > 90) out += B91[Math.floor(n / 91)]
  }
  return out
}

export function base91Decode(str) {
  const map = Object.fromEntries([...B91].map((c, i) => [c, i]))
  let n = 0, bits = 0, v = -1
  const out = []
  for (const ch of str) {
    if (map[ch] === undefined) continue
    if (v < 0) v = map[ch]
    else {
      v += map[ch] * 91
      n |= v << bits
      bits += (v & 8191) > 88 ? 13 : 14
      while (bits > 7) { out.push(n & 255); n >>= 8; bits -= 8 }
      v = -1
    }
  }
  if (v >= 0) out.push((n | (v << bits)) & 255)
  return fromBytes(new Uint8Array(out))
}
