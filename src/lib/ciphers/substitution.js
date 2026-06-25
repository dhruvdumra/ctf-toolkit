const baseOf = (c) => (c <= 'Z' ? 65 : 97)

export const atbash = (s) =>
  s.replace(/[a-z]/gi, (c) => {
    const base = baseOf(c)
    return String.fromCharCode(25 - (c.charCodeAt(0) - base) + base)
  })

function keyAlphabet(keyword) {
  const seen = new Set()
  let alpha = ''
  for (const c of (keyword + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').toUpperCase()) {
    if (c >= 'A' && c <= 'Z' && !seen.has(c)) { seen.add(c); alpha += c }
  }
  return alpha
}

export function substEncrypt(text, key) {
  const cipher = keyAlphabet(key)
  return text.replace(/[a-z]/gi, (c) => {
    const m = cipher[c.toUpperCase().charCodeAt(0) - 65]
    return baseOf(c) === 97 ? m.toLowerCase() : m
  })
}
export function substDecrypt(text, key) {
  const cipher = keyAlphabet(key)
  return text.replace(/[a-z]/gi, (c) => {
    const idx = cipher.indexOf(c.toUpperCase())
    if (idx < 0) return c
    const m = String.fromCharCode(65 + idx)
    return baseOf(c) === 97 ? m.toLowerCase() : m
  })
}

const ENG = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'
export function frequencySolve(text) {
  const counts = {}
  for (const c of text.toUpperCase()) if (c >= 'A' && c <= 'Z') counts[c] = (counts[c] || 0) + 1
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).map((e) => e[0])
  const map = {}
  ranked.forEach((c, i) => { map[c] = ENG[i] || c })
  const guess = text.replace(/[a-z]/gi, (c) => {
    const g = map[c.toUpperCase()] || c.toUpperCase()
    return baseOf(c) === 97 ? g.toLowerCase() : g
  })
  return { map, guess }
}
