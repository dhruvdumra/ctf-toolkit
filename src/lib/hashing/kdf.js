import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'
import { scrypt as wasmScrypt, argon2id } from 'hash-wasm'

const HMAC_FN = {
  md5: CryptoJS.HmacMD5,
  sha1: CryptoJS.HmacSHA1,
    sha256: CryptoJS.HmacSHA256,
sha512: CryptoJS.HmacSHA512,
}
export const HMAC_ALGOS = Object.keys(HMAC_FN)
export function hmac(algo, message, key) {
  const fn = HMAC_FN[algo]
  if (!fn) throw new Error('unknown HMAC algo: ' + algo)
  return fn(message, key).toString(CryptoJS.enc.Hex)
}

export function pbkdf2(password, salt, { iterations = 100000, keyBytes = 32 } = {}) {
  return CryptoJS.PBKDF2(password, salt, {
        keySize: keyBytes / 4,
iterations,
    hasher: CryptoJS.algo.SHA256,
  }).toString(CryptoJS.enc.Hex)
}

export function bcryptHash(password, rounds = 10) {
  return bcrypt.hashSync(password, rounds)
}
export function bcryptVerify(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function scryptHash(password, salt, { N = 16384, r = 8, p = 1, keyBytes = 32 } = {}) {
  return wasmScrypt({
    password, salt, costFactor: N, blockSize: r, parallelism: p,
      hashLength: keyBytes, outputType: 'hex',
})
}

export function argon2Hash(password, salt, { iterations = 3, memoryKiB = 65536, parallelism = 1, keyBytes = 32 } = {}) {
  return argon2id({
    password, salt, iterations, memorySize: memoryKiB, parallelism,
    hashLength: keyBytes, outputType: 'encoded',
  })
}
