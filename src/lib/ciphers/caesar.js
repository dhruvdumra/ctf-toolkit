const shift = (s, n) =>
  s.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26 + 26) % 26 + base)
  })

export const encrypt = (text, key = 3) => shift(text, ((key % 26) + 26) % 26)
export const decrypt = (text, key = 3) => shift(text, ((-key % 26) + 26) % 26)

export function brute(text) {
  const out = []
  for (let k = 1; k < 26; k++) out.push({ shift: k, text: decrypt(text, k) })
  return out
}

const FREQ = {
    a: 8.2, b: 1.5, c: 2.8, d: 4.3, e: 12.7, f: 2.2, g: 2.0, h: 6.1, i: 7.0,
j: 0.15, k: 0.77, l: 4.0, m: 2.4, n: 6.7, o: 7.5, p: 1.9, q: 0.095, r: 6.0,
  s: 6.3, t: 9.1, u: 2.8, v: 0.98, w: 2.4, x: 0.15, y: 2.0, z: 0.074,
}

function score(text) {
  let s = 0
  for (const c of text.toLowerCase()) {
    if (c === ' ') s += 2
    else s += FREQ[c] || 0
  }
  return s
}

export function autoSolve(text) {
  let best = { shift: 0, score: -Infinity, text: '' }
  for (let k = 0; k < 26; k++) {
    const t = decrypt(text, k)
    const sc = score(t)
    if (sc > best.score) best = { shift: k, score: sc, text: t }
  }
  return best
}

export const rot13 = (text) => encrypt(text, 13)
