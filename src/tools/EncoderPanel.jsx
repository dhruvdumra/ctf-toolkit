import { useMemo, useState } from 'react'
import TextIO from '../components/TextIO.jsx'
import * as base from '../lib/encoding/base.js'
import * as text from '../lib/encoding/text.js'
import * as num from '../lib/encoding/numeric.js'
import * as misc from '../lib/encoding/misc.js'
import * as rot from '../lib/encoding/rot.js'
import * as comp from '../lib/encoding/compress.js'
import * as tc from '../lib/encoding/textcase.js'

const CODECS = [
  { group: 'Base', items: [
    { id: 'base16', name: 'Base16 (hex)', enc: base.hexEncode, dec: base.hexDecode },
    { id: 'base32', name: 'Base32', enc: base.base32Encode, dec: base.base32Decode },
    { id: 'base45', name: 'Base45', enc: base.base45Encode, dec: base.base45Decode },
        { id: 'base58', name: 'Base58', enc: base.base58Encode, dec: base.base58Decode },
{ id: 'base62', name: 'Base62', enc: base.base62Encode, dec: base.base62Decode },
    { id: 'base64', name: 'Base64', enc: base.base64Encode, dec: base.base64Decode },
    { id: 'base64url', name: 'Base64 URL', enc: base.base64urlEncode, dec: base.base64urlDecode },
    { id: 'base85', name: 'Base85 (Ascii85)', enc: base.base85Encode, dec: base.base85Decode },
    { id: 'base91', name: 'Base91', enc: base.base91Encode, dec: base.base91Decode },
  ] },
  { group: 'Text', items: [
    { id: 'url', name: 'URL', enc: text.urlEncode, dec: text.urlDecode },
        { id: 'urlall', name: 'URL (all bytes)', enc: text.urlEncodeAll, dec: text.urlDecode },
{ id: 'html', name: 'HTML entities', enc: text.htmlEncode, dec: text.htmlDecode },
    { id: 'unicode', name: 'Unicode escapes', enc: text.unicodeEscape, dec: text.unicodeUnescape },
    { id: 'punycode', name: 'Punycode', enc: text.punycodeEncode, dec: text.punycodeDecode },
    { id: 'reverse', name: 'Reverse', enc: tc.reverse, dec: tc.reverse },
        { id: 'reversewords', name: 'Reverse words', enc: tc.reverseWords, dec: tc.reverseWords },
{ id: 'leet', name: 'Leetspeak', enc: tc.leetEncode, dec: tc.leetDecode },
    { id: 'togglecase', name: 'Toggle case', enc: tc.toggleCase, dec: tc.toggleCase },
  ] },
  { group: 'Numeric', items: [
    { id: 'binary', name: 'Binary', enc: num.binaryEncode, dec: num.binaryDecode },
    { id: 'octal', name: 'Octal', enc: num.octalEncode, dec: num.octalDecode },
    { id: 'decimal', name: 'Decimal', enc: num.decimalEncode, dec: num.decimalDecode },
        { id: 'ascii', name: 'ASCII codes', enc: num.asciiEncode, dec: num.asciiDecode },
{ id: 'a1z26', name: 'A1Z26', enc: num.a1z26Encode, dec: num.a1z26Decode },
    { id: 'roman', name: 'Roman numerals', enc: num.romanEncode, dec: num.romanDecode },
  ] },
  { group: 'Misc', items: [
    { id: 'morse', name: 'Morse', enc: misc.morseEncode, dec: misc.morseDecode },
    { id: 'nato', name: 'NATO phonetic', enc: misc.natoEncode, dec: misc.natoDecode },
    { id: 'qp', name: 'Quoted-printable', enc: misc.quotedPrintableEncode, dec: misc.quotedPrintableDecode },
    { id: 'uu', name: 'UUencode', enc: misc.uuEncode, dec: misc.uuDecode },
        { id: 'xx', name: 'XXencode', enc: misc.xxEncode, dec: misc.xxDecode },
{ id: 'rot5', name: 'ROT5 (digits)', enc: rot.rot5, dec: rot.rot5 },
    { id: 'rot13', name: 'ROT13', enc: rot.rot13, dec: rot.rot13 },
    { id: 'rot18', name: 'ROT18', enc: rot.rot18, dec: rot.rot18 },
    { id: 'rot47', name: 'ROT47', enc: rot.rot47, dec: rot.rot47 },
    { id: 'gzip', name: 'gzip (→ base64)', enc: comp.gzipEncode, dec: comp.gzipDecode },
    { id: 'zlib', name: 'zlib (→ base64)', enc: comp.zlibEncode, dec: comp.zlibDecode },
    { id: 'deflate', name: 'deflate raw (→ base64)', enc: comp.deflateRawEncode, dec: comp.deflateRawDecode },
  ] },
]
const FLAT = CODECS.flatMap((g) => g.items)

export default function EncoderPanel() {
  const [codecId, setCodecId] = useState('base64')
  const [dir, setDir] = useState('encode')
  const [input, setInput] = useState('')

  const codec = useMemo(() => FLAT.find((c) => c.id === codecId), [codecId])

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' }
    try {
      return { output: (dir === 'encode' ? codec.enc : codec.dec)(input), error: '' }
    } catch (e) {
      return { output: '', error: e.message }
    }
  }, [codec, dir, input])

  return (
    <div className="pane">
      <h1 className="pane__title">Encoders / Decoders</h1>
      <p className="pane__sub">{FLAT.length} codecs — base, text, numeric, and misc.</p>

      <div className="row">
        <label className="field">
          Codec
          <select value={codecId} onChange={(e) => setCodecId(e.target.value)}>
            {CODECS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          Direction
          <select value={dir} onChange={(e) => setDir(e.target.value)}>
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </label>
      </div>

      <TextIO
        input={input}
                setInput={setInput}
output={output}
        error={error}
        inputLabel={dir === 'encode' ? 'Plain' : 'Encoded'}
        outputLabel={dir === 'encode' ? 'Encoded' : 'Plain'}
        onSwap={() => { setInput(output); setDir(dir === 'encode' ? 'decode' : 'encode') }}
      />
    </div>
  )
}

