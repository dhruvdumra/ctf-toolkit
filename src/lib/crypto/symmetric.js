import CryptoJS from 'crypto-js'

const MODES = {
  ECB: CryptoJS.mode.ECB,
  CBC: CryptoJS.mode.CBC,
  CFB: CryptoJS.mode.CFB,
  OFB: CryptoJS.mode.OFB,
  CTR: CryptoJS.mode.CTR,
}

const ALGOS = {
    AES: CryptoJS.AES,
DES: CryptoJS.DES,
  TripleDES: CryptoJS.TripleDES,
  RC4: CryptoJS.RC4,
  Rabbit: CryptoJS.Rabbit,
}

export const SYM_ALGOS = Object.keys(ALGOS)
export const SYM_MODES = Object.keys(MODES)

const isStream = (algo) => algo === 'RC4' || algo === 'Rabbit'

function buildOpts(algo, mode, iv) {
  if (isStream(algo)) return {}
  const opts = { mode: MODES[mode] || CryptoJS.mode.CBC }
  opts.padding = mode === 'CTR' || mode === 'CFB' || mode === 'OFB'
    ? CryptoJS.pad.NoPadding
    : CryptoJS.pad.Pkcs7
  if (mode !== 'ECB') opts.iv = CryptoJS.enc.Utf8.parse(iv || '0000000000000000')
  return opts
}

export function symEncrypt(algo, text, key, { mode = 'CBC', iv = '', output = 'base64' } = {}) {
  const cipher = ALGOS[algo]
  if (!cipher) throw new Error('unknown cipher: ' + algo)
  const keyWA = CryptoJS.enc.Utf8.parse(key)
  const result = cipher.encrypt(text, keyWA, buildOpts(algo, mode, iv))
  const ct = result.ciphertext
  return output === 'hex' ? ct.toString(CryptoJS.enc.Hex) : ct.toString(CryptoJS.enc.Base64)
}

export function symDecrypt(algo, data, key, { mode = 'CBC', iv = '', input = 'base64' } = {}) {
  const cipher = ALGOS[algo]
  if (!cipher) throw new Error('unknown cipher: ' + algo)
  const keyWA = CryptoJS.enc.Utf8.parse(key)
  const ctWA = input === 'hex'
    ? CryptoJS.enc.Hex.parse(data)
    : CryptoJS.enc.Base64.parse(data)
  const params = CryptoJS.lib.CipherParams.create({ ciphertext: ctWA })
  const out = cipher.decrypt(params, keyWA, buildOpts(algo, mode, iv))
  const text = out.toString(CryptoJS.enc.Utf8)
  if (!text && data) throw new Error('decrypt failed (wrong key, mode, or IV)')
  return text
}
