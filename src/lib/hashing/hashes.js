import {
    md4, md5, sha1, sha224, sha256, sha384, sha512,
sha3, ripemd160, whirlpool, blake2b, blake2s,
} from 'hash-wasm'

export const HASH_ALGOS = [
  'md2', 'md4', 'md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512',
  'sha3-256', 'sha3-512', 'ripemd160', 'whirlpool', 'blake2b', 'blake2s',
]

const MD2_S = [
  41, 46, 67, 201, 162, 216, 124, 1, 61, 54, 84, 161, 236, 240, 6, 19,
    98, 167, 5, 243, 192, 199, 115, 140, 152, 147, 43, 217, 188, 76, 130, 202,
30, 155, 87, 60, 253, 212, 224, 22, 103, 66, 111, 24, 138, 23, 229, 18,
  190, 78, 196, 214, 218, 158, 222, 73, 160, 251, 245, 142, 187, 47, 238, 122,
  169, 104, 121, 145, 21, 178, 7, 63, 148, 194, 16, 137, 11, 34, 95, 33,
  128, 127, 93, 154, 90, 144, 50, 39, 53, 62, 204, 231, 191, 247, 151, 3,
  255, 25, 48, 179, 72, 165, 181, 209, 215, 94, 146, 42, 172, 86, 170, 198,
    79, 184, 56, 210, 150, 164, 125, 182, 118, 252, 107, 226, 156, 116, 4, 241,
69, 157, 112, 89, 100, 113, 135, 32, 134, 91, 207, 101, 230, 45, 168, 2,
  27, 96, 37, 173, 174, 176, 185, 246, 28, 70, 97, 105, 52, 64, 126, 15,
  85, 71, 163, 35, 221, 81, 175, 58, 195, 92, 249, 206, 186, 197, 234, 38,
  44, 83, 13, 110, 133, 40, 132, 9, 211, 223, 205, 244, 65, 129, 77, 82,
  106, 220, 55, 200, 108, 193, 171, 250, 36, 225, 123, 8, 12, 189, 177, 74,
  120, 136, 149, 139, 227, 99, 232, 109, 233, 203, 213, 254, 59, 0, 29, 57,
  242, 239, 183, 14, 102, 88, 208, 228, 166, 119, 114, 248, 235, 117, 75, 10,
  49, 68, 80, 180, 143, 237, 31, 26, 219, 153, 141, 51, 159, 17, 131, 20,
]

export function md2(input) {
  let msg = Array.from(new TextEncoder().encode(input))
  const pad = 16 - (msg.length % 16)
  for (let i = 0; i < pad; i++) msg.push(pad)
  const C = new Array(16).fill(0)
  let L = 0
  for (let i = 0; i < msg.length / 16; i++) {
    for (let j = 0; j < 16; j++) { C[j] ^= MD2_S[msg[i * 16 + j] ^ L]; L = C[j] }
  }
  msg = msg.concat(C)
  const X = new Array(48).fill(0)
  for (let i = 0; i < msg.length / 16; i++) {
    for (let j = 0; j < 16; j++) { X[16 + j] = msg[i * 16 + j]; X[32 + j] = X[16 + j] ^ X[j] }
    let t = 0
    for (let r = 0; r < 18; r++) {
      for (let j = 0; j < 48; j++) { X[j] ^= MD2_S[t]; t = X[j] }
      t = (t + r) % 256
    }
  }
  return X.slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hash(algo, text) {
  switch (algo) {
    case 'md2': return md2(text)
    case 'md4': return md4(text)
    case 'md5': return md5(text)
    case 'sha1': return sha1(text)
    case 'sha224': return sha224(text)
    case 'sha256': return sha256(text)
    case 'sha384': return sha384(text)
    case 'sha512': return sha512(text)
    case 'sha3-256': return sha3(text, 256)
    case 'sha3-512': return sha3(text, 512)
    case 'ripemd160': return ripemd160(text)
    case 'whirlpool': return whirlpool(text)
    case 'blake2b': return blake2b(text)
    case 'blake2s': return blake2s(text)
    default: throw new Error('unknown hash: ' + algo)
  }
}

export async function hashAll(text) {
  const out = {}
  await Promise.all(HASH_ALGOS.map(async (a) => { out[a] = await hash(a, text) }))
  return out
}
