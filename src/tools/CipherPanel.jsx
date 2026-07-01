import { useEffect, useMemo, useState } from 'react'
import TextIO from '../components/TextIO.jsx'
import ResultCard from '../components/ResultCard.jsx'
import { CIPHERS, cipherById } from '../lib/ciphers/index.js'

export default function CipherPanel() {
  const [id, setId] = useState('caesar')
  const [dir, setDir] = useState('encrypt')
  const [input, setInput] = useState('')
  const [params, setParams] = useState({})
  const [bruteOut, setBruteOut] = useState(null)

  const cipher = useMemo(() => cipherById(id), [id])

  useEffect(() => {
    const next = {}
    for (const p of cipher.params) next[p.name] = p.default
    setParams(next)
    setBruteOut(null)
  }, [cipher])

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' }
    try {
      const fn = dir === 'encrypt' ? cipher.encrypt : cipher.decrypt
      return { output: fn(input, params), error: '' }
    } catch (e) {
      return { output: '', error: e.message }
    }
  }, [cipher, dir, input, params])

  const groups = [...new Set(CIPHERS.map((c) => c.group))]

  return (
    <div className="pane">
      <h1 className="pane__title">Ciphers</h1>
      <p className="pane__sub">{CIPHERS.length} classical ciphers — substitution, polyalphabetic, transposition.</p>

      <div className="row">
        <label className="field">
          Cipher
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {CIPHERS.filter((c) => c.group === g).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          Direction
          <select value={dir} onChange={(e) => setDir(e.target.value)}>
            <option value="encrypt">Encrypt</option>
            <option value="decrypt">Decrypt</option>
          </select>
        </label>
        {cipher.params.map((p) => (
          <label className="field" key={p.name}>
            {p.label}
            <input
              type={p.type === 'number' ? 'number' : 'text'}
              value={params[p.name] ?? ''}
              onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
            />
          </label>
        ))}
        {cipher.brute && (
          <label className="field">
            &nbsp;
            <button className="btn" onClick={() => setBruteOut(cipher.brute(input))} disabled={!input}>
              Brute-force
            </button>
          </label>
        )}
      </div>

      <TextIO
        input={input}
        setInput={setInput}
        output={output}
        error={error}
        inputLabel={dir === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
        outputLabel={dir === 'encrypt' ? 'Ciphertext' : 'Plaintext'}
              onSwap={() => { setInput(output); setDir(dir === 'encrypt' ? 'decrypt' : 'encrypt') }}
/>

      {bruteOut && (
        <div style={{ marginTop: 18 }}>
          <h2 className="pane__title" style={{ fontSize: 15 }}>
            Brute force ({bruteOut.length} candidates)
          </h2>
          {bruteOut.slice(0, 60).map((r, i) => (
            <ResultCard key={i} label={r.label} value={r.text} />
          ))}
        </div>
      )}
    </div>
  )
}
