const HEX_LEN = {
  4: ['CRC-16', 'FCS-16'],
  8: ['CRC-32', 'CRC-32C', 'Adler-32', 'FNV-32', 'XOR-32'],
  16: ['CRC-64', 'MySQL323', 'DES(Unix)'],
  32: ['MD2', 'MD4', 'MD5', 'NTLM', 'RIPEMD-128', 'Tiger-128', 'Haval-128', 'LM'],
  40: ['SHA-1', 'RIPEMD-160', 'HAS-160', 'Tiger-160', 'Haval-160', 'MySQL5'],
  48: ['Tiger-192', 'Haval-192'],
  56: ['SHA-224', 'SHA3-224', 'Haval-224'],
    64: ['SHA-256', 'SHA3-256', 'BLAKE2s', 'RIPEMD-256', 'Haval-256', 'GOST', 'Snefru-256'],
96: ['SHA-384', 'SHA3-384'],
  128: ['SHA-512', 'SHA3-512', 'Whirlpool', 'BLAKE2b'],
}

const PREFIX = [
  [/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, ['bcrypt']],
  [/^\$argon2(id|i|d)\$/, ['Argon2']],
  [/^\$6\$/, ['sha512crypt ($6$)']],
    [/^\$5\$/, ['sha256crypt ($5$)']],
[/^\$1\$/, ['md5crypt ($1$)']],
  [/^\$y\$/, ['yescrypt']],
  [/^\$apr1\$/, ['Apache md5 ($apr1$)']],
  [/^\$P\$/, ['phpass (WordPress)']],
  [/^\$H\$/, ['phpass (phpBB3)']],
  [/^\$7\$/, ['scrypt ($7$)']],
  [/^pbkdf2_sha256\$/, ['Django PBKDF2-SHA256']],
  [/^sha1\$/, ['Django SHA-1']],
    [/^[0-9a-f]{32}:[0-9a-f]{32}$/i, ['LM:NTLM pair']],
[/^[0-9a-f]{32}:[^:]+$/i, ['salted MD5 (hash:salt)']],
  [/^\{SSHA\}/, ['Salted SHA (LDAP)']],
  [/^\{SHA\}/, ['SHA-1 (LDAP)']],
  [/^\{MD5\}/, ['MD5 (LDAP)']],
    [/^0x0100[0-9a-f]+$/i, ['MSSQL 2005+']],
[/^0x0200[0-9a-f]+$/i, ['MSSQL 2012+']],
  [/^\*[0-9A-F]{40}$/, ['MySQL 4.1+ (with *)']],
  [/^[0-9a-f]{16}$/i, ['MySQL323 / CRC-64']],
]

export function identify(input) {
  const s = input.trim()
  for (const [re, names] of PREFIX) if (re.test(s)) return names

  if (!/^[0-9a-f]+$/i.test(s)) {
    return ['unrecognized — not a plain hex digest']
  }
  const cands = HEX_LEN[s.length]
  if (!cands) return [`unknown (${s.length} hex chars / ${s.length * 4} bits)`]
  if (s.length === 32 && s === s.toUpperCase()) {
    return ['NTLM', ...cands.filter((c) => c !== 'NTLM')]
  }
  return cands
}
