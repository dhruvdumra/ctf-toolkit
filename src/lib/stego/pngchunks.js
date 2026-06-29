const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes, start, end) {
  let crc = ~0
  for (let i = start; i < end; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (~crc) >>> 0
}

function readU32(bytes, off) {
  return ((bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3]) >>> 0
}

export function isPng(bytes) {
  return PNG_SIG.every((b, i) => bytes[i] === b)
}

export function parseChunks(bytes) {
  if (!isPng(bytes)) throw new Error('not a PNG (signature mismatch)')
  const chunks = []
  let off = 8
  while (off + 8 <= bytes.length) {
    const length = readU32(bytes, off)
    const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7])
    const dataStart = off + 8
    const dataEnd = dataStart + length
    const stored = readU32(bytes, dataEnd)
    const computed = crc32(bytes, off + 4, dataEnd)
    chunks.push({
      type,
      length,
      offset: off,
      crc: stored.toString(16).padStart(8, '0'),
            crcOk: stored === computed,
critical: type[0] === type[0].toUpperCase(),
    })
    off = dataEnd + 4
    if (type === 'IEND') break
  }
  return chunks
}

export function trailingData(bytes) {
  if (!isPng(bytes)) return null
  let off = 8
  while (off + 8 <= bytes.length) {
    const length = readU32(bytes, off)
    const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7])
    off = off + 8 + length + 4
    if (type === 'IEND') break
  }
  return off < bytes.length ? bytes.slice(off) : null
}
