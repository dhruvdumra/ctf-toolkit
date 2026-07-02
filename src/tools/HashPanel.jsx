import { useEffect, useState } from 'react'
import ResultCard from '../components/ResultCard.jsx'
import { HASH_ALGOS, hash } from '../lib/hashing/hashes.js'
import { CHECKSUM_ALGOS, checksum } from '../lib/hashing/checksums.js'
import { ntlm, lm } from '../lib/hashing/windows.js'
import { identify } from '../lib/hashing/identify.js'

export default function HashPanel() {
  const [input, setInput] = useState('')
  const [digests, setDigests] = useState({})
  const [idInput, setIdInput] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!input) { setDigests({}); return }
    ;(async () => {
      const out = {}
      for (const algo of HASH_ALGOS) {
        try { out[algo] = await hash(algo, input) } catch (e) { out[algo] = 'error: ' + e.message }
      }
      for (const algo of CHECKSUM_ALGOS) out[algo] = checksum(algo, input)
      try { out.ntlm = await ntlm(input) } catch {}
      try { out.lm = lm(input) } catch {}
      if (!cancelled) setDigests(out)
    })()
    return () => { cancelled = true }
  }, [input])

  const order = [...HASH_ALGOS, ...CHECKSUM_ALGOS, 'ntlm', 'lm']
  const candidates = idInput ? identify(idInput) : []

  return (
    <div className="pane">
      <h1 className="pane__title">Hashing</h1>
      <p className="pane__sub">Every digest of your input at once, plus a hash identifier.</p>

      <label className="field" style={{ width: '100%' }}>
        Input
        <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
          placeholder="Text to hash…" />
      </label>

      <div style={{ marginTop: 16 }}>
        {input
          ? order.map((algo) => (
              <ResultCard key={algo} label={algo.toUpperCase()} value={digests[algo] ?? '…'} />
            ))
          : <p className="hint">Type above to compute MD/SHA/SHA3/RIPEMD/Whirlpool/BLAKE2, CRC, Adler, NTLM and LM.</p>}
      </div>

      <h2 className="pane__title" style={{ fontSize: 16, marginTop: 26 }}>Identify a hash</h2>
      <input type="text" style={{ width: '100%' }} value={idInput} spellCheck={false}
        onChange={(e) => setIdInput(e.target.value)} placeholder="Paste an unknown digest…" />
      {candidates.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <ResultCard label="Likely" value={candidates.join('  ·  ')} mono={false} />
        </div>
      )}
    </div>
  )
}
