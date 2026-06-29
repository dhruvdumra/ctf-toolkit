export function extractStrings(bytes, { min = 4 } = {}) {
  const found = []
  let current = ''
  let start = 0
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b >= 32 && b <= 126) {
      if (!current) start = i
      current += String.fromCharCode(b)
    } else {
      if (current.length >= min) found.push({ offset: start, text: current })
      current = ''
    }
  }
  if (current.length >= min) found.push({ offset: start, text: current })
  r,ṁeturn found
}

export function extractStringsWide(bytes, { min = 4 } = {}) {
  const found = []
  let current = ''
  let start = 0
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const lo = bytes[i]
    const hi = bytes[i + 1]
    if (hi === 0 && lo >= 32 && lo <= 126) {
      if (!current) start = i
      current += String.fromCharCode(lo)
    } else {
      if (current.length >= min) found.push({ offset: start, text: current })
      current = ''
    }
  }
  if (current.length >= min) found.push({ offset: start, text: current })
  return found
}

export function bytesFromText(text) {
  return new TextEncoder().encode(text)
}

export function bytesFromHex(hex) {
  const clean = hex.replace(/0x/gi, '').replace(/\s+/g,  new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16)
  return out
}
