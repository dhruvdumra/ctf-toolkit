import { useMemo, useState } from 'react'
import TextIO from '../components/TextIO.jsx'
import ResultCard from '../components/ResultCard.jsx'
import * as xor from '../lib/crypto/xor.js'
import { symEncrypt, symDecrypt, SYM_ALGOS, SYM_MODES } from '../lib/crypto/symmetric.js'
import * as rsa from '../lib/crypto/rsa.js'

function XorTool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [dir, setDir] = useState('encrypt')
  const [brute, setBrute] = useState(null)

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' }
    try {
      return {
        output: dir === 'encrypt' ? xor.xorEncrypt(input, key) : xor.xorDecrypt(input, key),
        error: '',
      }
    } catch (e) {
      return { output: '', error: e.message }
    }
  }, [input, key, dir])

  return (
    <div>
      <div className="row">
        <label className="field">
          Direction
          <select value={dir} onChange={(e) => setDir(e.target.value)}>
            <option value="encrypt">Encrypt (text → hex)</option>
            <option value="decrypt">Decrypt (hex → text)</option>
          </select>
        </label>
        <label className="field">
          Key
          <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="key" />
        </label>
        <label className="field">
          &nbsp;
          <button className="btn" disabled={!input} onClick={() => setBrute(xor.xorBruteSingle(input))}>
            Brute single-byte
          </button>
        </label>
      </div>
      <TextIO input={input} setInput={setInput} output={output} error={error} />
      {brute && (
        <div style={{ marginTop: 16 }}>
          <h3 className="pane__sub">Top single-byte keys</h3>
          {brute.map((r, i) => (
            <ResultCard key={i} label={`key 0x${r.key.toString(16).padStart(2, '0')} '${r.keyChar}' (score ${r.score.toFixed(1)})`} value={r.text} />
          ))}
        </div>
      )}
    </div>
  )
}

function SymTool() {
  const [algo, setAlgo] = useState('AES')
  const [mode, setMode] = useState('CBC')
  const [key, setKey] = useState('0123456789abcdef')
  const [iv, setIv] = useState('0123456789abcdef')
  const [dir, setDir] = useState('encrypt')
  const [input, setInput] = useState('')

  const stream = algo === 'RC4' || algo === 'Rabbit'
  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' }
    try {
      return {
        output: dir === 'encrypt'
          ? symEncrypt(algo, input, key, { mode, iv })
          : symDecrypt(algo, input, key, { mode, iv }),
        error: '',
      }
    } catch (e) {
      return { output: '', error: e.message }
    }
  }, [algo, mode, key, iv, dir, input])

  return (
    <div>
      <div className="row">
        <label className="field">
          Cipher
          <select value={algo} onChange={(e) => setAlgo(e.target.value)}>
            {SYM_ALGOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        {!stream && (
          <label className="field">
            Mode
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {SYM_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        )}
        <label className="field">
          Key
          <input type="text" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        {!stream && mode !== 'ECB' && (
          <label className="field">
            IV
            <input type="text" value={iv} onChange={(e) => setIv(e.target.value)} />
          </label>
        )}
        <label className="field">
          Direction
          <select value={dir} onChange={(e) => setDir(e.target.value)}>
            <option value="encrypt">Encrypt</option>
            <option value="decrypt">Decrypt</option>
          </select>
        </label>
      </div>
      <TextIO
        input={input}
        setInput={setInput}
        output={output}
        error={error}
        inputLabel={dir === 'encrypt' ? 'Plaintext' : 'Base64 ciphertext'}
        outputLabel={dir === 'encrypt' ? 'Base64 ciphertext' : 'Plaintext'}
      />
    </div>
  )
}

function RsaTool() {
  const [bits, setBits] = useState(256)
  const [keys, setKeys] = useState(null)
  const [msg, setMsg] = useState('')
  const [nIn, setNIn] = useState('')
  const [eIn, setEIn] = useState('65537')
  const [broken, setBroken] = useState(null)
  const [err, setErr] = useState('')

  const gen = () => {
    try { setKeys(rsa.generateKeypair(+bits)); setErr('') } catch (e) { setErr(e.message) }
  }
  const enc = useMemo(() => {
    if (!keys || !msg) return ''
    try { return rsa.rsaEncryptText(msg, keys.e, keys.n) } catch (e) { return 'error: ' + e.message }
  }, [keys, msg])
  const dec = useMemo(() => {
    if (!keys || !enc || enc.startsWith('error')) return ''
    try { return rsa.rsaDecryptText(enc, keys.d, keys.n) } catch (e) { return 'error: ' + e.message }
  }, [keys, enc])

  return (
    <div>
      <div className="row">
        <label className="field">
          Key size (bits)
          <select value={bits} onChange={(e) => setBits(e.target.value)}>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
            <option value={512}>512</option>
          </select>
        </label>
        <label className="field">
          &nbsp;
          <button className="btn" onClick={gen}>Generate keypair</button>
        </label>
      </div>
      {err && <div className="error">{err}</div>}
      {keys && (
        <>
          <ResultCard label="n (modulus)" value={keys.n} />
          <ResultCard label="e / d" value={`e = ${keys.e}\nd = ${keys.d}`} />
          <label className="field" style={{ width: '100%', marginTop: 10 }}>
            Message
            <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="short message" />
          </label>
          {enc && <ResultCard label="encrypted (c)" value={enc} />}
          {dec && <ResultCard label="decrypted" value={dec} />}
        </>
      )}

      <h3 className="pane__sub" style={{ marginTop: 24 }}>Break a small key (factor n)</h3>
      <div className="row">
        <label className="field">
          n
          <input type="text" value={nIn} onChange={(e) => setNIn(e.target.value)} placeholder="modulus" />
        </label>
        <label className="field">
          e
          <input type="text" value={eIn} onChange={(e) => setEIn(e.target.value)} />
        </label>
        <label className="field">
          &nbsp;
          <button className="btn" disabled={!nIn} onClick={() => {
            try { setBroken(rsa.breakKey(nIn, eIn)); setErr('') } catch (e) { setErr(e.message); setBroken(null) }
          }}>Factor</button>
        </label>
      </div>
      {broken && <ResultCard label="recovered p, q, d" value={`p = ${broken.p}\nq = ${broken.q}\nd = ${broken.d}`} />}
    </div>
  )
}

const TOOLS = { XOR: XorTool, Symmetric: SymTool, RSA: RsaTool }

export default function CryptoPanel() {
  const [tab, setTab] = useState('XOR')
  const Tool = TOOLS[tab]
  return (
    <div className="pane">
      <h1 className="pane__title">Crypto</h1>
      <p className="pane__sub">XOR, block/stream ciphers, and textbook RSA.</p>
      <div className="row">
        {Object.keys(TOOLS).map((t) => (
          <button
            key={t}
            className={'btn' + (tab === t ? ' active' : '')}
            onClick={() => setTab(t)}
            style={tab === t ? { borderColor: 'var(--muted)', color: '#fff' } : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      <Tool />
    </div>
  )
}
 