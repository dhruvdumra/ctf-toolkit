export const SIGNATURES = [
  { ext: 'png', mime: 'image/png', hex: '89504e470d0a1a0a', trailer: '49454e44ae426082' },
    { ext: 'jpg', mime: 'image/jpeg', hex: 'ffd8ff', trailer: 'ffd9' },
{ ext: 'gif', mime: 'image/gif', hex: '474946383961' },
  { ext: 'gif', mime: 'image/gif', hex: '474946383761' },
  { ext: 'bmp', mime: 'image/bmp', hex: '424d' },
  { ext: 'webp', mime: 'image/webp', hex: '52494646' },
  { ext: 'pdf', mime: 'application/pdf', hex: '25504446', trailer: '2525454f46' },
  { ext: 'zip', mime: 'application/zip', hex: '504b0304', trailer: '504b0506' },
  { ext: 'rar', mime: 'application/vnd.rar', hex: '526172211a0700' },
  { ext: 'rar5', mime: 'application/vnd.rar', hex: '526172211a070100' },
  { ext: '7z', mime: 'application/x-7z-compressed', hex: '377abcaf271c' },
  { ext: 'gz', mime: 'application/gzip', hex: '1f8b08' },
  { ext: 'bz2', mime: 'application/x-bzip2', hex: '425a68' },
    { ext: 'xz', mime: 'application/x-xz', hex: 'fd377a585a00' },
{ ext: 'tar', mime: 'application/x-tar', hex: '7573746172' },
  { ext: 'elf', mime: 'application/x-elf', hex: '7f454c46' },
  { ext: 'exe', mime: 'application/x-msdownload', hex: '4d5a' },
  { ext: 'class', mime: 'application/java-vm', hex: 'cafebabe' },
  { ext: 'wav', mime: 'audio/wav', hex: '52494646' },
    { ext: 'mp3', mime: 'audio/mpeg', hex: '494433' },
{ ext: 'flac', mime: 'audio/flac', hex: '664c6143' },
  { ext: 'ogg', mime: 'audio/ogg', hex: '4f676753' },
  { ext: 'sqlite', mime: 'application/x-sqlite3', hex: '53514c69746520666f726d6174203300' },
]

export function matchSignature(hexHead) {
  const h = hexHead.toLowerCase().replace(/\s/g, '')
  return SIGNATURES.filter((s) => h.startsWith(s.hex))
}
