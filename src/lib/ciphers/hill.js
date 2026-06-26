function keyMatrix(key) {
  const letters = key.toUpperCase().replace(/[^A-Z]/g, '')
  const size = Math.sqrt(letters.length)
  if (!Number.isInteger(size)) throw new Error('key length must be a perfect square (4 or 9 letters)')
  const m = []
  for (let r = 0; r < size; r++) {
    m.push([])
    for (let c = 0; c < size; c++) m[r].push(letters.charCodeAt(r * size + c) - 65)
  }
  return m
}

function modInv(a, m) {
  a = ((a % m) + m) % m
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x
  throw new Error('matrix is not invertible mod 26')
}

function determinant(m) {
  const n = m.length
  if (n === 1) return m[0][0]
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0]
  let det = 0
  for (let c = 0; c < n; c++) {
    det += (c % 2 ? -1 : 1) * m[0][c] * determinant(minor(m, 0, c))
  }
  return det
}

function minor(m, row, col) {
  return m.filter((_, r) => r !== row).map((r) => r.filter((_, c) => c !== col))
}

function inverseMatrix(m) {
  const n = m.length
  const det = ((determinant(m) % 26) + 26) % 26
  const detInv = modInv(det, 26)
  const adj = []
  for (let r = 0; r < n; r++) {
    adj.push([])
    for (let c = 0; c < n; c++) {
      const cof = ((c + r) % 2 ? -1 : 1) * determinant(minor(m, r, c))
      adj[r].push((((cof % 26) + 26) % 26))
    }
  }
  const inv = []
  for (let r = 0; r < n; r++) {
    inv.push([])
    for (let c = 0; c < n; c++) inv[r].push((adj[c][r] * detInv) % 26)
  }
  return inv
}

function apply(matrix, text) {
  const n = matrix.length
  let letters = text.toUpperCase().replace(/[^A-Z]/g, '')
  while (letters.length % n) letters += 'X'
  let out = ''
  for (let i = 0; i < letters.length; i += n) {
    const block = []
    for (let j = 0; j < n; j++) block.push(letters.charCodeAt(i + j) - 65)
    for (let r = 0; r < n; r++) {
      let sum = 0
      for (let c = 0; c < n; c++) sum += matrix[r][c] * block[c]
      out += String.fromCharCode((((sum % 26) + 26) % 26) + 65)
    }
  }
  return out
}

export function hillEncrypt(text, key = 'GYBNQKURP') {
  return apply(keyMatrix(key), text)
}

export function hillDecrypt(text, key = 'GYBNQKURP') {
  return apply(inverseMatrix(keyMatrix(key)), text)
}
