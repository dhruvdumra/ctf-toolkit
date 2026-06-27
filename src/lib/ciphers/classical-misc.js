const TAP = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'

export function tapEncrypt(text) {
  return text.toUpperCase().replace(/K/g, 'C').replace(/[^A-Z]/g, '').split('').map((c) => {
    const i = TAP.indexOf(c)
    const r = Math.floor(i / 5) + 1
    const col = (i % 5) + 1
    return '.'.repeat(r) + ' ' + '.'.repeat(col)
  }).join('  ')
}

export function tapDecrypt(text) {
  return text.trim().split(/\s{2,}/).map((pair) => {
    const [r, c] = pair.trim().split(/\s+/).map((d) => d.length)
    if (!r || !c) return ''
    return TAP[(r - 1) * 5 + (c - 1)] || ''
  }).join('')
}

function nihilistSquare(keyword) {
  const seen = new Set()
  let sq = ''
  const cleaned = (keyword + 'ABCDEFGHIKLMNOPQRSTUVWXYZ').toUpperCase().replace(/J/g, 'I')
  for (const c of cleaned) {
    if (c >= 'A' && c <= 'Z' && !seen.has(c)) { seen.add(c); sq += c }
  }
  return sq
}

function polybiusValue(sq, ch) {
  const i = sq.indexOf(ch)
  return (Math.floor(i / 5) + 1) * 10 + (i % 5) + 1
}

export function nihilistEncrypt(text, squareKey = 'ZEBRAS', key = 'RUSSIAN') {
  const sq = nihilistSquare(squareKey)
  const plain = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')
  const keyLetters = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')
  if (!keyLetters) throw new Error('key required')
  const out = []
  for (let i = 0; i < plain.length; i++) {
    const p = polybiusValue(sq, plain[i])
    const k = polybiusValue(sq, keyLetters[i % keyLetters.length])
    out.push(p + k)
  }
  return out.join(' ')
}

export function nihilistDecrypt(text, squareKey = 'ZEBRAS', key = 'RUSSIAN') {
  const sq = nihilistSquare(squareKey)
  const keyLetters = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')
  const nums = text.trim().split(/\s+/).filter(Boolean).map(Number)
  let out = ''
  for (let i = 0; i < nums.length; i++) {
    const k = polybiusValue(sq, keyLetters[i % keyLetters.length])
    const p = nums[i] - k
    const r = Math.floor(p / 10) - 1
    const c = (p % 10) - 1
    out += sq[r * 5 + c] || '?'
  }
  return out
}
