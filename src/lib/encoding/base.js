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

