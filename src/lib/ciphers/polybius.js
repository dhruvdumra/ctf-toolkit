function square5(keyword = '') {
  const seen = new Set()
  let sq = ''
  const cleaned = (keyword + 'ABCDEFGHIKLMNOPQRSTUVWXYZ').toUpperCase().replace(/J/g, 'I')
  for (const c of cleaned) {
    if (c >= 'A' && c <= 'Z' && !seen.has(c)) { seen.add(c); sq += c }
  }
  return sq
}

const onlyLetters = (s) => s.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')

export function polybiusEncrypt(text, keyword = '') {
  const sq = square5(keyword)
  return onlyLetters(text).split('').map((c) => {
    const i = sq.indexOf(c)
    return `${Math.floor(i / 5) + 1}${(i % 5) + 1}`
  }).join(' ')
}

export function polybiusDecrypt(text, keyword = '') {
  const sq = square5(keyword)
  return text.trim().split(/\s+/).filter(Boolean).map((pair) => {
    const r = +pair[0] - 1, c = +pair[1] - 1
    return sq[r * 5 + c] || ''
  }).join('')
}

export function bifidEncrypt(text, keyword = '', period = 5) {
  const sq = square5(keyword)
  const letters = onlyLetters(text)
  const rows = [], cols = []
  for (const c of letters) {
    const i = sq.indexOf(c)
    rows.push(Math.floor(i / 5)); cols.push(i % 5)
  }
  let out = ''
  for (let start = 0; start < letters.length; start += period) {
    const r = rows.slice(start, start + period)
    const c = cols.slice(start, start + period)
    const seq = [...r, ...c]
    for (let k = 0; k < seq.length; k += 2) out += sq[seq[k] * 5 + seq[k + 1]]
  }
  return out
}

export function bifidDecrypt(text, keyword = '', period = 5) {
  const sq = square5(keyword)
  const letters = onlyLetters(text)
  let out = ''
  for (let start = 0; start < letters.length; start += period) {
    const block = letters.slice(start, start + period)
    const coords = []
    for (const c of block) {
      const i = sq.indexOf(c)
      coords.push(Math.floor(i / 5), i % 5)
    }
    const half = coords.length / 2
    const rows = coords.slice(0, half)
    const cols = coords.slice(half)
    for (let k = 0; k < block.length; k++) out += sq[rows[k] * 5 + cols[k]]
  }
  return out
}

const TRI = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.'

function triSquare(keyword = '') {
  const seen = new Set()
  let sq = ''
  for (const c of (keyword.toUpperCase().replace(/[^A-Z]/g, '') + TRI)) {
    if (!seen.has(c)) { seen.add(c); sq += c }
  }
  return sq.slice(0, 27)
}

export function trifidEncrypt(text, keyword = '', period = 5) {
  const sq = triSquare(keyword)
  const letters = text.toUpperCase().replace(/[^A-Z.]/g, '')
  const a = [], b = [], c = []
  for (const ch of letters) {
    const i = sq.indexOf(ch)
    a.push(Math.floor(i / 9)); b.push(Math.floor((i % 9) / 3)); c.push(i % 3)
  }
  let out = ''
  for (let start = 0; start < letters.length; start += period) {
    const seq = [...a.slice(start, start + period), ...b.slice(start, start + period), ...c.slice(start, start + period)]
    for (let k = 0; k < seq.length; k += 3) out += sq[seq[k] * 9 + seq[k + 1] * 3 + seq[k + 2]]
  }
  return out
}

export function trifidDecrypt(text, keyword = '', period = 5) {
  const sq = triSquare(keyword)
  const letters = text.toUpperCase().replace(/[^A-Z.]/g, '')
  let out = ''
  for (let start = 0; start < letters.length; start += period) {
    const block = letters.slice(start, start + period)
    const digits = []
    for (const ch of block) {
      const i = sq.indexOf(ch)
      digits.push(Math.floor(i / 9), Math.floor((i % 9) / 3), i % 3)
    }
    const third = digits.length / 3
    const a = digits.slice(0, third), b = digits.slice(third, 2 * third), c = digits.slice(2 * third)
    for (let k = 0; k < block.length; k++) out += sq[a[k] * 9 + b[k] * 3 + c[k]]
  }
  return out
}

const ADFGX = 'ADFGX'
const ADFGVX = 'ADFGVX'

function fractionate(text, square, symbols, size) {
  const letters = size === 5
    ? text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')
    : text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  let frac = ''
  for (const c of letters) {
    const i = square.indexOf(c)
    if (i < 0) continue
    frac += symbols[Math.floor(i / size)] + symbols[i % size]
  }
  return frac
}

function columnar(frac, key) {
  const cols = key.length
  const grid = Array.from({ length: cols }, () => [])
  ;[...frac].forEach((ch, i) => grid[i % cols].push(ch))
  const order = [...key].map((c, i) => ({ c, i })).sort((a, b) => (a.c === b.c ? a.i - b.i : a.c < b.c ? -1 : 1))
  return order.map((o) => grid[o.i].join('')).join(' ')
}

function adfgEncrypt(text, keyword, transKey, symbols, size) {
  const square = size === 5 ? square5(keyword) : adfgvxSquare(keyword)
  const frac = fractionate(text, square, symbols, size)
  return columnar(frac, transKey.toUpperCase())
}

function adfgvxSquare(keyword = '') {
  const seen = new Set()
  let sq = ''
  const full = (keyword + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').toUpperCase()
  for (const c of full) {
    if (/[A-Z0-9]/.test(c) && !seen.has(c)) { seen.add(c); sq += c }
  }
  return sq
}

export const adfgxEncrypt = (text, keyword = 'PHQGM', transKey = 'KEY') =>
  adfgEncrypt(text, keyword, transKey, ADFGX, 5)
export const adfgvxEncrypt = (text, keyword = 'PHQGM', transKey = 'KEY') =>
  adfgEncrypt(text, keyword, transKey, ADFGVX, 6)
