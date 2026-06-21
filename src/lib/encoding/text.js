export const urlEncode = (s) => encodeURIComponent(s)
export const urlDecode = (s) => decodeURIComponent(s.replace(/\+/g, ' '))
export const urlEncodeAll = (s) =>
  [...new TextEncoder().encode(s)]
    .map((b) => '%' + b.toString(16).padStart(2, '0').toUpperCase())
    .join('')

const NAMED = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos' }
const NAMED_REV = Object.fromEntries(Object.entries(NAMED).map(([k, v]) => [v, k]))

export function htmlEncode(s, { numeric = false } = {}) {
  return [...s]
    .map((ch) => {
      if (!numeric && NAMED[ch]) return `&${NAMED[ch]};`
      const cp = ch.codePointAt(0)
      if (cp > 127 || NAMED[ch]) return `&#${cp};`
      return ch
    })
    .join('')
}

export function htmlDecode(s) {
  return s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10)
      return Number.isNaN(cp) ? m : String.fromCodePoint(cp)
    }
    return NAMED_REV[body] ?? m
  })
}

export function unicodeEscape(s) {
  return [...s]
    .map((ch) => {
      const cp = ch.codePointAt(0)
      if (cp > 0xffff) return `\\u{${cp.toString(16)}}`
      if (cp > 127) return '\\u' + cp.toString(16).padStart(4, '0')
      return ch
    })
    .join('')
}

export function unicodeUnescape(s) {
  return s
    .replace(/\\u\{([0-9a-f]+)\}/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

const BASE = 36, TMIN = 1, TMAX = 26, SKEW = 38, DAMP = 700, INITIAL_BIAS = 72,
  INITIAL_N = 128, DELIM = '-'

const adapt = (delta, num, first) => {
  delta = first ? Math.floor(delta / DAMP) : delta >> 1
  delta += Math.floor(delta / num)
  let k = 0
  for (; delta > ((BASE - TMIN) * TMAX) >> 1; k += BASE) delta = Math.floor(delta / (BASE - TMIN))
  return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW))
}
const digitToBasic = (d) => d + 22 + 75 * (d < 26 ? 1 : 0)
const basicToDigit = (cp) => {
  if (cp - 48 < 10) return cp - 22
  if (cp - 65 < 26) return cp - 65
  if (cp - 97 < 26) return cp - 97
  return BASE
}
function punyEncodePart(input) {
  const cps = [...input].map((c) => c.codePointAt(0))
  let n = INITIAL_N, delta = 0, bias = INITIAL_BIAS
  let out = cps.filter((c) => c < 128).map((c) => String.fromCodePoint(c))
  const basicLength = out.length
  const handled = basicLength
  if (basicLength) out.push(DELIM)
  let h = basicLength
  while (h < cps.length) {
    let m = Infinity
    for (const c of cps) if (c >= n && c < m) m = c
    delta += (m - n) * (h + 1)
    n = m
 
   for (const c of cps) {
      if (c < n) delta++
      if (c === n) {
        let q = delta
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
          if (q < t) break
          out.push(String.fromCharCode(digitToBasic(t + ((q - t) % (BASE - t)))))
          q = Math.floor((q - t) / (BASE - t))
        }
        out.push(String.fromCharCode(digitToBasic(q)))
        bias = adapt(delta, h + 1, h === handled)
        delta = 0
        h++
      }
   }
    delta++
    n++
  }
  return out.join('')
}

function punyDecodePart(input) {
  const out = []
  let n = INITIAL_N, bias = INITIAL_BIAS, i = 0
  const last = input.lastIndexOf(DELIM)
  if (last > 0) for (let j = 0; j < last; j++) out.push(input.charCodeAt(j))
  let idx = last > 0 ? last + 1 : 0
  while (idx < input.length) {
    const oldi = i
    for (let k = BASE, w = 1; ; k += BASE) {
      const digit = basicToDigit(input.charCodeAt(idx++))
      if (digit >= BASE) throw new Error('invalid punycode')
      i += digit * w
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
      if (digit < t) break
      w *= BASE - t
    }
    bias = adapt(i - oldi, out.length + 1, oldi === 0)
    n += Math.floor(i / (out.length + 1))
    i %= out.length + 1
    out.splice(i, 0, n)
    i++
  }
  return String.fromCodePoint(...out)
}

const mapParts = (s, fn) =>
  s.split('.').map((p) => (/[^\x00-\x7f]/.test(p) || p.startsWith('xn--') ? fn(p) : p)).join('.')
export const punycodeEncode = (s) =>
  mapParts(s, (p) => (/[^\x00-\x7f]/.test(p) ? 'xn--' + punyEncodePart(p) : p))
export const punycodeDecode = (s) =>
  mapParts(s, (p) => (p.startsWith('xn--') ? punyDecodePart(p.slice(4)) : p))
