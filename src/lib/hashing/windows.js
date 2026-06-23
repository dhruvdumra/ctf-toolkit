import { md4 } from 'hash-wasm'
import CryptoJS from 'crypto-js'

export async function ntlm(password) {
  const u16 = new Uint8Array(password.length * 2)
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i)
    u16[i * 2] = c & 0xff
    u16[i * 2 + 1] = (c >> 8) & 0xff
  }
  return (await md4(u16)).toUpperCase()
}

function strToKey(seven) {
  const k = [
    seven[0] >> 1,
        ((seven[0] & 0x01) << 6) | (seven[1] >> 2),
((seven[1] & 0x03) << 5) | (seven[2] >> 3),
    ((seven[2] & 0x07) << 4) | (seven[3] >> 4),
    ((seven[3] & 0x0f) << 3) | (seven[4] >> 5),
    ((seven[4] & 0x1f) << 2) | (seven[5] >> 6),
    ((seven[5] & 0x3f) << 1) | (seven[6] >> 7),
    seven[6] & 0x7f,
  ]
  return k.map((b) => (b << 1) & 0xff)
}

const toWA = (arr) =>
  CryptoJS.enc.Hex.parse(arr.map((b) => b.toString(16).padStart(2, '0')).join(''))

function desBlock(keyBytes, dataBytes) {
  const out = CryptoJS.DES.encrypt(toWA(dataBytes), toWA(keyBytes), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  })
  return out.ciphertext.toString(CryptoJS.enc.Hex)
}

export function lm(password) {
  const pw = password.toUpperCase().slice(0, 14)
  const buf = new Array(14).fill(0)
  for (let i = 0; i < pw.length; i++) buf[i] = pw.charCodeAt(i) & 0xff
  const KGS = [0x4b, 0x47, 0x53, 0x21, 0x40, 0x23, 0x24, 0x25]
  const h1 = desBlock(strToKey(buf.slice(0, 7)), KGS)
  const h2 = desBlock(strToKey(buf.slice(7, 14)), KGS)
  return (h1 + h2).toUpperCase()
}

export async function ntlmFull(password) {
  return `${lm(password)}:${await ntlm(password)}`
}
