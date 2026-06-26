const ALPHA = {}
const REV = {}

for (let i = 0; i < 26; i++) {
  const code = i.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B')
  const letter = String.fromCharCode(65 + i)
  ALPHA[letter] = code
  REV[code] = letter
}

export function baconEncrypt(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '').split('').map((c) => ALPHA[c]).join(' ')
}

export function baconDecrypt(text) {
  const groups = text.toUpperCase().replace(/[^AB]/g, '').match(/.{1,5}/g) || []
  return groups.map((g) => REV[g] || '?').join('')
}

export function baconHide(text, cover) {
  const code = text.toUpperCase().replace(/[^A-Z]/g, '').split('').map((c) => ALPHA[c]).join('')
  const letters = [...cover].filter((c) => /[a-z]/i.test(c))
  if (letters.length < code.length) throw new Error('cover text too short to hide the message')
  let bit = 0
  return [...cover].map((c) => {
    if (!/[a-z]/i.test(c) || bit >= code.length) return c
    const b = code[bit++]
    return b === 'A' ? c.toLowerCase() : c.toUpperCase()
  }).join('')
}

export function baconReveal(cover) {
  const bits = [...cover].filter((c) => /[a-z]/i.test(c))
    .map((c) => (c === c.toLowerCase() ? 'A' : 'B')).join('')
  const groups = bits.match(/.{1,5}/g) || []
  return groups.filter((g) => g.length === 5).map((g) => REV[g] || '?').join('')
}
 