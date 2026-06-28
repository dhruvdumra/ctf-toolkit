function modpow(base, exp, mod) {
  base %= mod
  let result = 1n
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod
    exp >>= 1n
    base = (base * base) % mod
  }
  return result
}

function egcd(a, b) {
  if (b === 0n) return [a, 1n, 0n]
  const [g, x, y] = egcd(b, a % b)
  return [g, y, x - (a / b) * y]
}

function modinv(a, m) {
  const [g, x] = egcd(((a % m) + m) % m, m)
  if (g !== 1n) throw new Error('no modular inverse (e and phi not coprime)')
  return ((x % m) + m) % m
}

function randBits(bits) {
  let n = 0n
  for (let i = 0; i < bits; i += 30) {
    n = (n << 30n) | BigInt(Math.floor(Math.random() * (1 << 30)))
  }
  n |= 1n
  n |= 1n << BigInt(bits - 1)
  return n
}

function isProbablePrime(n, rounds = 12) {
  if (n < 2n) return false
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
    if (n % p === 0n) return n === p
  }
  let d = n - 1n
  let r = 0n
  while ((d & 1n) === 0n) { d >>= 1n; r++ }
  witness: for (let i = 0; i < rounds; i++) {
    const a = 2n + (randBits(16) % (n - 4n))
    let x = modpow(a, d, n)
    if (x === 1n || x === n - 1n) continue
    for (let j = 0n; j < r - 1n; j++) {
      x = (x * x) % n
      if (x === n - 1n) continue witness
    }
    return false
  }
  return true
}

function randomPrime(bits) {
  for (;;) {
    const c = randBits(bits)
    if (isProbablePrime(c)) return c
  }
}

export function generateKeypair(bits = 256) {
  const half = Math.max(8, bits >> 1)
  let p = randomPrime(half)
  let q = randomPrime(half)
  while (q === p) q = randomPrime(half)
  const n = p * q
  const phi = (p - 1n) * (q - 1n)
  const e = 65537n
  const d = modinv(e, phi)
  return { n: n.toString(), e: e.toString(), d: d.toString(), p: p.toString(), q: q.toString() }
}

export function rsaEncryptNum(m, e, n) {
  return modpow(BigInt(m), BigInt(e), BigInt(n)).toString()
}

export function rsaDecryptNum(c, d, n) {
  return modpow(BigInt(c), BigInt(d), BigInt(n)).toString()
}

function textToInt(text) {
  let n = 0n
  for (const b of new TextEncoder().encode(text)) n = (n << 8n) | BigInt(b)
  return n
}

function intToText(n) {
  const bytes = []
  while (n > 0n) { bytes.unshift(Number(n & 0xffn)); n >>= 8n }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

export function rsaEncryptText(text, e, n) {
  const m = textToInt(text)
  if (m >= BigInt(n)) throw new Error('message too long for this key size')
  return modpow(m, BigInt(e), BigInt(n)).toString()
}

export function rsaDecryptText(c, d, n) {
  return intToText(modpow(BigInt(c), BigInt(d), BigInt(n)))
}

export function factor(n) {
  n = BigInt(n)
  for (const small of [2n, 3n, 5n, 7n, 11n, 13n]) {
    if (n % small === 0n) return [small, n / small]
  }
  let a = sqrtBig(n)
  if (a * a < n) a += 1n
  for (let i = 0n; i < 1000000n; i++) {
    const b2 = (a + i) * (a + i) - n
    const b = sqrtBig(b2)
    if (b * b === b2) return [a + i - b, a + i + b].sort((x, y) => (x < y ? -1 : 1))
  }
  throw new Error('could not factor n (too large for this method)')
}

export function breakKey(n, e) {
  const [p, q] = factor(n)
  const phi = (p - 1n) * (q - 1n)
  const d = modinv(BigInt(e), phi)
  return { p: p.toString(), q: q.toString(), d: d.toString() }
}

function sqrtBig(value) {
  if (value < 0n) throw new Error('sqrt of negative')
  if (value < 2n) return value
  let x = value, y = (x + 1n) / 2n
  while (y < x) { x = y; y = (x + value / x) / 2n }
  return x
}
