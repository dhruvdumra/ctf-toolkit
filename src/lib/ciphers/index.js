import * as caesar from './caesar.js'
import * as vig from './vigenere.js'
import * as sub from './substitution.js'
import * as aff from './affine.js'
import * as tr from './transposition.js'
import * as pf from './playfair.js'
import * as poly from './polybius.js'
import * as bacon from './bacon.js'
import * as hill from './hill.js'
import * as cm from './classical-misc.js'

export const CIPHERS = [
  {
    id: 'caesar', name: 'Caesar', group: 'Substitution',
    params: [{ name: 'key', label: 'Shift', type: 'number', default: 3 }],
    encrypt: (t, p) => caesar.encrypt(t, +p.key),
        decrypt: (t, p) => caesar.decrypt(t, +p.key),
brute: (t) => caesar.brute(t).map((r) => ({ label: `shift ${r.shift}`, text: r.text })),
  },
  {
    id: 'rot13', name: 'ROT13', group: 'Substitution', params: [],
    encrypt: (t) => caesar.rot13(t),
    decrypt: (t) => caesar.rot13(t),
  },
  {
    id: 'atbash', name: 'Atbash', group: 'Substitution', params: [],
    encrypt: (t) => sub.atbash(t),
    decrypt: (t) => sub.atbash(t),
  },
  {
    id: 'affine', name: 'Affine', group: 'Substitution',
    params: [
      { name: 'a', label: 'a (coprime 26)', type: 'number', default: 5 },
      { name: 'b', label: 'b', type: 'number', default: 8 },
    ],
        encrypt: (t, p) => aff.affineEncrypt(t, +p.a, +p.b),
decrypt: (t, p) => aff.affineDecrypt(t, +p.a, +p.b),
    brute: (t) => aff.affineBrute(t).map((r) => ({ label: `a=${r.a} b=${r.b}`, text: r.text })),
  },
  {
    id: 'substitution', name: 'Keyword Substitution', group: 'Substitution',
    params: [{ name: 'key', label: 'Keyword', type: 'text', default: 'CIPHER' }],
        encrypt: (t, p) => sub.substEncrypt(t, p.key),
decrypt: (t, p) => sub.substDecrypt(t, p.key),
  },
  {
    id: 'bacon', name: 'Baconian', group: 'Substitution', params: [],
    encrypt: (t) => bacon.baconEncrypt(t),
    decrypt: (t) => bacon.baconDecrypt(t),
  },
  {
    id: 'vigenere', name: 'Vigenère', group: 'Polyalphabetic',
        params: [{ name: 'key', label: 'Key', type: 'text', default: 'KEY' }],
encrypt: (t, p) => vig.vigenereEncrypt(t, p.key),
    decrypt: (t, p) => vig.vigenereDecrypt(t, p.key),
  },
  {
    id: 'autokey', name: 'Autokey', group: 'Polyalphabetic',
    params: [{ name: 'key', label: 'Key', type: 'text', default: 'KEY' }],
        encrypt: (t, p) => vig.autokeyEncrypt(t, p.key),
decrypt: (t, p) => vig.autokeyDecrypt(t, p.key),
  },
  {
    id: 'beaufort', name: 'Beaufort', group: 'Polyalphabetic',
    params: [{ name: 'key', label: 'Key', type: 'text', default: 'KEY' }],
    encrypt: (t, p) => vig.beaufortEncrypt(t, p.key),
    decrypt: (t, p) => vig.beaufortDecrypt(t, p.key),
  },
  {
    id: 'gronsfeld', name: 'Gronsfeld', group: 'Polyalphabetic',
    params: [{ name: 'key', label: 'Digits', type: 'text', default: '31415' }],
        encrypt: (t, p) => vig.gronsfeldEncrypt(t, p.key),
decrypt: (t, p) => vig.gronsfeldDecrypt(t, p.key),
  },
  {
    id: 'playfair', name: 'Playfair', group: 'Polygraphic',
    params: [{ name: 'key', label: 'Keyword', type: 'text', default: 'PLAYFAIR' }],
    encrypt: (t, p) => pf.playfairEncrypt(t, p.key),
    decrypt: (t, p) => pf.playfairDecrypt(t, p.key),
  },
  {
        id: 'hill', name: 'Hill', group: 'Polygraphic',
params: [{ name: 'key', label: 'Key (4 or 9 letters)', type: 'text', default: 'GYBNQKURP' }],
    encrypt: (t, p) => hill.hillEncrypt(t, p.key),
    decrypt: (t, p) => hill.hillDecrypt(t, p.key),
  },
  {
        id: 'polybius', name: 'Polybius Square', group: 'Polygraphic',
params: [{ name: 'key', label: 'Keyword', type: 'text', default: '' }],
    encrypt: (t, p) => poly.polybiusEncrypt(t, p.key),
    decrypt: (t, p) => poly.polybiusDecrypt(t, p.key),
  },
  {
    id: 'bifid', name: 'Bifid', group: 'Polygraphic',
    params: [
      { name: 'key', label: 'Keyword', type: 'text', default: '' },
      { name: 'period', label: 'Period', type: 'number', default: 5 },
    ],
    encrypt: (t, p) => poly.bifidEncrypt(t, p.key, +p.period),
    decrypt: (t, p) => poly.bifidDecrypt(t, p.key, +p.period),
  },
  {
    id: 'trifid', name: 'Trifid', group: 'Polygraphic',
    params: [
      { name: 'key', label: 'Keyword', type: 'text', default: '' },
      { name: 'period', label: 'Period', type: 'number', default: 5 },
    ],
    encrypt: (t, p) => poly.trifidEncrypt(t, p.key, +p.period),
    decrypt: (t, p) => poly.trifidDecrypt(t, p.key, +p.period),
  },
  {
    id: 'railfence', name: 'Rail Fence', group: 'Transposition',
    params: [{ name: 'rails', label: 'Rails', type: 'number', default: 3 }],
    encrypt: (t, p) => tr.railEncrypt(t, +p.rails),
    decrypt: (t, p) => tr.railDecrypt(t, +p.rails),
  },
  {
    id: 'columnar', name: 'Columnar', group: 'Transposition',
    params: [{ name: 'key', label: 'Keyword', type: 'text', default: 'ZEBRA' }],
    encrypt: (t, p) => tr.columnarEncrypt(t, p.key),
    decrypt: (t, p) => tr.columnarDecrypt(t, p.key),
  },
  {
    id: 'scytale', name: 'Scytale', group: 'Transposition',
    params: [{ name: 'diameter', label: 'Diameter', type: 'number', default: 4 }],
    encrypt: (t, p) => tr.scytaleEncrypt(t, +p.diameter),
    decrypt: (t, p) => tr.scytaleDecrypt(t, +p.diameter),
  },
  {
    id: 'tap', name: 'Tap Code', group: 'Other', params: [],
    encrypt: (t) => cm.tapEncrypt(t),
    decrypt: (t) => cm.tapDecrypt(t),
  },
  {
    id: 'nihilist', name: 'Nihilist', group: 'Other',
    params: [
      { name: 'square', label: 'Square keyword', type: 'text', default: 'ZEBRAS' },
      { name: 'key', label: 'Key', type: 'text', default: 'RUSSIAN' },
    ],
    encrypt: (t, p) => cm.nihilistEncrypt(t, p.square, p.key),
    decrypt: (t, p) => cm.nihilistDecrypt(t, p.square, p.key),
  },
]

export const cipherById = (id) => CIPHERS.find((c) => c.id === id)
