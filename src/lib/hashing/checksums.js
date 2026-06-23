const bytes = (s) => new TextEncoder().encode(s)

export function crc8(input) {
  let crc = 0
  for (const b of bytes(input)) {
    crc ^= b
    for (let k = 0; k < 8; k++) crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff
  }
  return crc.toString(16).padStart(2, '0')
}
toString(16).padStart(4, '0')
}

export function crc16xmodem(input) {
  let crc = 0
  for (const b of bytes(input)) {
    crc ^= b << 8
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? ((crc << 
export function crc16(input) {
  let crc = 0xffff
  for (const b of bytes(input)) {
    crc ^= b << 8
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.toString(16).padStart(4, '0')
}

export function crc32(input) {
  let crc = ~0
  for (const b of bytes(input)) {
    crc ^= b
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return ((~crc) >>> 0).toString(16).padStart(8, '0')
}

export function crc32c(input) {
  let crc = ~0
  for (const b of bytes(input)) {
    crc ^= b
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0x82f63b78 & -(crc & 1))
  }
  return ((~crc) >>> 0).toString(16).padStart(8, '0')
}

export function adler32(input) {
  let a = 1, b = 0
  for (const byte of bytes(input)) { a = (a + byte) % 65521; b = (b + a) % 65521 }
  return (((b << 16) | a) >>> 0).toString(16).padStart(8, '0')
}

export function fletcher16(input) {
  let s1 = 0, s2 = 0
  for (const b of bytes(input)) { s1 = (s1 + b) % 255; s2 = (s2 + s1) % 255 }
  return ((s2 << 8) | s1).toString(16).padStart(4, '0')
}

export function fletcher32(input) {
  const b = bytes(input)
  let s1 = 0, s2 = 0
  for (let i = 0; i < b.length; i += 2) {
    const w = b[i] | ((b[i + 1] || 0) << 8)
    s1 = (s1 + w) % 65535
    s2 = (s2 + s1) % 65535
  }
  return (((s2 * 65536) + s1) >>> 0).toString(16).padStart(8, '0')
}

export function bsdSum(input) {
  let cs = 0
  for (const b of bytes(input)) { cs = ((cs >> 1) | ((cs & 1) << 15)) & 0xffff; cs = (cs + b) & 0xffff }
  return cs.toString(16).padStart(4, '0')
}

export function sysvSum(input) {
  let s = 0
  for (const b of bytes(input)) s += b
  const r = (s & 0xffff) + ((s >> 16) & 0xffff)
  return (((r & 0xffff) + (r >> 16)) & 0xffff).toString(16).padStart(4, '0')
}

export function luhn(input) {
  const digits = input.replace(/\D/g, '').split('').map(Number)
  if (!digits.length) return 'no digits'
  let sum = 0, alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i]
    if (alt) { d *= 2; if (d > 9) d -= 9 }
    sum += d
    alt = !alt
  }
  return sum % 10 === 0 ? 'valid' : 'invalid'
}

const FN = {
  crc8, crc16, crc16xmodem, crc32, crc32c, adler32,
  fletcher16, fletcher32, bsdSum, sysvSum, luhn,
}

export const CHECKSUM_ALGOS = Object.keys(FN)
export function checksum(algo, text) {
  const f = FN[algo]
  if (!f) throw new Error('unknown checksum: ' + algo)
  return f(text)
}
