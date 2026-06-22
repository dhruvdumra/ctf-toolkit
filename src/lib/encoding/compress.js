import pako from 'pako'

const enc = new TextEncoder()
const dec = new TextDecoder()
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function bytesToB64(u8) {
  let out = ''
  for (let i = 0; i < u8.length; i += 3) {
    const n = (u8[i] << 16) | ((u8[i + 1] || 0) << 8) | (u8[i + 2] || 0)
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63]
    out += i + 1 < u8.length ? B64[(n >> 6) & 63] : '='
    out += i + 2 < u8.length ? B64[n & 63] : '='
  }
  return out
}

function b64ToBytes(str) {
  const map = Object.fromEntries([...B64].map((c, i) => [c, i]))
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

import pako from 'pako'

const enc = new TextEncoder()
const dec = new TextDecoder()
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function bytesToB64(u8) {
  let out = ''
  for (let i = 0; i < u8.length; i += 3) {
    const n = (u8[i] << 16) | ((u8[i + 1] || 0) << 8) | (u8[i + 2] || 0)
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63]
    out += i + 1 < u8.length ? B64[(n >> 6) & 63] : '='
    out += i + 2 < u8.length ? B64[n & 63] : '='
  }
  return out
}

function b64ToBytes(str) {
  const map = Object.fromEntries([...B64].map((c, i) => [c, i]))
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

