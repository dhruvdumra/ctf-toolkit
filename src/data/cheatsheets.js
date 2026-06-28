export const CHEATSEETS = {
  caesar: 'Try all 25 shifts (brute). ROT13 = shift 13. Watch for "the/and/flag".',
  rot13: 'Self-inverse. Letters only, digits untouched. ROT47 covers all printable ASCII.',
  vigenere: 'Find key length via Kasiski or index of coincidence, then solve each column as a Caesar.',
  autokey: 'Key is the keyword then the plaintext itself, so it never repeats like Vigenere does.',
  beaufort: 'Reciprocal: encrypt and decrypt are the same operation. c = key - plain mod 26.',
  affine: 'a must be coprime with 26 so one of 1,3,5,7,9,11,15,17,19,21,23,25. 12 a times 26 b = 312 keys.',
  substitution: '26! keys, way too many to brute. Use letter frequency, then short words and doubles.',
  playfair: 'Digraphs, I and J share a cell, X splits doubles. Look for no doubled letters in the output.',
  hill: 'Key is a matrix. det must be invertible mod 26. 2x2 needs 4 letters, 3x3 needs 9.',
  bifid: 'Polybius coords are written down then read off in rows, mixing position info across the period.',
  bacon: 'Each letter is 5 A/B symbols. Often hidden in two fonts, cases, or bold/italic.',
  railfence: 'Write in a zigzag over N rails then read row by row. Small key space, just try a few rails.',
  columnar: 'Columns read out in keyword order. Length is a clue to the number of columns.',
  xor: 'Single-byte XOR: brute all 256 keys, score by English frequency. Repeating key: find length with Hamming distance.',
  rsa: 'If n is small, factor it. Low e with no padding leaks. Same n with different e is a common trap.',
  aes: 'ECB leaks patterns (identical blocks). CBC needs the IV. Wrong key just gives garbage, not an error.',
  base64: 'Length is a multiple of 4, "=" padding at the end. Charset A-Z a-z 0-9 + /.',
  base32: 'Charset A-Z 2-7, padded with =. Longer than base64 for the same data.',
  base58: 'No 0 O I l to avoid confusion. Used by Bitcoin addresses and IPFS.',
  hash: 'Identify by hex length: 32 = MD5/NTLM, 40 = SHA1, 64 = SHA256, 128 = SHA512. $2$ = bcrypt.',
  morse: 'Word gap is "/" or 7 units, letter gap is a space. Listen for the rhythm if it is audio.',
  stego: 'Check LSBs, every bit-plane, PNG chunks, strings, and any data after the IEND or EOF marker.',
  png: 'Magic 89 50 4E 47. Chunks are length, type, data, crc. Stuff often hides after IEND.',
  jpeg: 'Starts FF D8, ends FF D9. Data appended after FF D9 is a classic hiding spot.',
  zip: 'Magic 50 4B 03 04. A zip glued onto an image still opens in most archive tools.',
}

export const FLAG_REGEX = /(?:flag|ctf|key|htb|picoctf)\{[^}]+\}/i

export const COMMON_FLAGS = ['flag{', 'CTF{', 'key{', 'HTB{', 'picoCTF{']
