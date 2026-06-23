const M = 26
const COPRIME = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]

function modInverse(a) {
  a = ((a % M) + M) % M
  for (let x = 1; x < M; x++) if ((a * x) % M === 1) return x
  throw new Error(`a=${a} is not coprime with 26 (use one of ${COPRIME.join(', ')})`)
}

export function affineEncrypt(text, a = 5, b = 8) {
  modInverse(a)
  return text.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97
    const x = c.charCodeAt(0) - base
    return String.fromCharCode((((a * x + b) % M) + M) % M + base)
  })
}

export function affineDecrypt(text, a = 5, b = 8) {
  const ai = modInverse(a)
  return text.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97
    const y = c.charCodeAt(0) - base
    return String.fromCharCode((((ai * (y - b)) % M) + M) % M + base)
  })
}

export function affineBrute(text) {
  const out = []
  for (const a of COPRIME) for (let b = 0; b < M; b++) {
    out.push({ a, b, text: affineDecrypt(text, a, b) })
  }
  return out
}

export { COPRIME }
