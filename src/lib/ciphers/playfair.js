function buildSquare(keyword) {
  const seen = new Set()
  let square = ''
  const cleaned = (keyword + 'ABCDEFGHIKLMNOPQRSTUVWXYZ').toUpperCase().replace(/J/g, 'I')
  for (const c of cleaned) {
    if (c >= 'A' && c <= 'Z' && !seen.has(c)) { seen.add(c); square += c }
  }
  return square
}

function position(square, ch) {
  const i = square.indexOf(ch)
  return [Math.floor(i / 5), i % 5]
}

function digraphs(text) {
  const letters = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')
  const pairs = []
  let i = 0
  while (i < letters.length) {
    let a = letters[i]
    let b = letters[i + 1]
    if (!b) { pairs.push(a + 'X'); break }
    if (a === b) { pairs.push(a + 'X'); i += 1 } else { pairs.push(a + b); i += 2 }
  }
  return pairs
}

function transform(text, keyword, dir) {
  const square = buildSquare(keyword)
  const shift = dir === 'encrypt' ? 1 : 4
  let out = ''
  for (const pair of digraphs(text)) {
    const [r1, c1] = position(square, pair[0])
    const [r2, c2] = position(square, pair[1])
    if (r1 === r2) {
      out += square[r1 * 5 + (c1 + shift) % 5] + square[r2 * 5 + (c2 + shift) % 5]
    } else if (c1 === c2) {
      out += square[((r1 + shift) % 5) * 5 + c1] + square[((r2 + shift) % 5) * 5 + c2]
    } else {
      out += square[r1 * 5 + c2] + square[r2 * 5 + c1]
    }
  }
  return out
}

export const playfairEncrypt = (text, keyword = 'PLAYFAIR') => transform(text, keyword, 'encrypt')
export const playfairDecrypt = (text, keyword = 'PLAYFAIR') => transform(text, keyword, 'decrypt')
