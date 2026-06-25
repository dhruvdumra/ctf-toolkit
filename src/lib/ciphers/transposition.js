function railPattern(len, rails) {
  const pat = []
  let r = 0, dir = 1
  for (let i = 0; i < len; i++) {
    pat.push(r)
    if (r === 0) dir = 1
    else if (r === rails - 1) dir = -1
    r += dir
  }
  return pat
}

export function railEncrypt(text, rails = 3) {
  if (rails < 2) return text
  const rows = Array.from({ length: rails }, () => [])
  railPattern(text.length, rails).forEach((r, i) => rows[r].push(text[i]))
  return rows.map((x) => x.join('')).join('')
}

export function railDecrypt(text, rails = 3) {
  if (rails < 2) return text
  const pat = railPattern(text.length, rails)
  const counts = Array(rails).fill(0)
  pat.forEach((p) => counts[p]++)
  const railChars = []
  let pos = 0
  for (let r = 0; r < rails; r++) { railChars[r] = text.slice(pos, pos + counts[r]).split(''); pos += counts[r] }
  const ptr = Array(rails).fill(0)
  return pat.map((p) => railChars[p][ptr[p]++]).join('')
}

function keyRank(key) {
  return [...key]
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (a.c === b.c ? a.i - b.i : a.c < b.c ? -1 : 1))
    .map((o) => o.i)
}

export function columnarEncrypt(text, key) {
  const cols = key.length
  if (!cols) throw new Error('key required')
  const colData = Array.from({ length: cols }, () => [])
  ;[...text].forEach((ch, idx) => colData[idx % cols].push(ch))
  return keyRank(key).map((c) => colData[c].join('')).join('')
}

export function columnarDecrypt(text, key) {
  const cols = key.length
  if (!cols) throw new Error('key required')
  const len = text.length
  const base = Math.floor(len / cols), extra = len % cols
  const height = (c) => base + (c < extra ? 1 : 0)
  const colData = Array(cols)
  let pos = 0
  for (const c of keyRank(key)) { const h = height(c); colData[c] = text.slice(pos, pos + h).split(''); pos += h }
  let out = ''
  for (let r = 0; r < Math.ceil(len / cols); r++) for (let c = 0; c < cols; c++) {
    if (colData[c][r] !== undefined) out += colData[c][r]
  }
  return out
}

export function scytaleEncrypt(text, diameter = 4) {
  if (diameter < 2) return text
  const rows = Math.ceil(text.length / diameter)
  let out = ''
  for (let c = 0; c < diameter; c++) for (let r = 0; r < rows; r++) {
    const i = r * diameter + c
    if (i < text.length) out += text[i]
  }
  return out
}

export function scytaleDecrypt(text, diameter = 4) {
  if (diameter < 2) return text
  const rows = Math.ceil(text.length / diameter)
  const order = []
  for (let c = 0; c < diameter; c++) for (let r = 0; r < rows; r++) {
    const i = r * diameter + c
    if (i < text.length) order.push(i)
  }
  const out = Array(text.length)
  order.forEach((orig, k) => { out[orig] = text[k] })
  return out.join('')
}
