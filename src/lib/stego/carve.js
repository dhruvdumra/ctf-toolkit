import { SIGNATURES } from '../../data/magic-bytes.js'

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

function indexOfSeq(haystack, needle, from) {
  outer: for (let i = from; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer
    return i
  }
  return -1
}

export function carve(bytes) {
  const hits = []
  for (const sig of SIGNATURES) {
    const needle = hexToBytes(sig.hex)
    let from = 0
    for (;;) {
      const at = indexOfSeq(bytes, needle, from)
      if (at < 0) break
      hits.push({ ext: sig.ext, mime: sig.mime, offset: at, embedded: at > 0 })
      from = at + 1
    }
  }
  return hits.sort((a, b) => a.offset - b.offset)
}

export function embeddedAfter(bytes, headerExt) {
  const all = carve(bytes)
  const first = all.find((h) => h.ext === headerExt && h.offset === 0)
  if (!first) return all.filter((h) => h.offset > 0)
  return all.filter((h) => h.offset > 0)
}

export function hexDump(bytes, { offset = 0, length = 256 } = {}) {
  const end = Math.min(bytes.length, offset + length)
  const lines = []
  for (let i = offset; i < end; i += 16) {
    const slice = bytes.slice(i, Math.min(i + 16, end))
    const hex = [...slice].map((b) => b.toString(16).padStart(2, '0')).join(' ')
    const ascii = [...slice].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('')
    lines.push(`${i.toString(16).padStart(8, '0')}  ${hex.padEnd(47)}  ${ascii}`)
  }
  return lines.join('\n')
}
