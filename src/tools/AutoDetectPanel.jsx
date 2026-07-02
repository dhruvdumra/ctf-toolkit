import { useMemo, useState } from 'react'
import ResultCard from '../components/ResultCard.jsx'
import { magicDecode } from '../lib/detect/magic.js'
import { FLAG_REGEX } from '../data/cheatsheets.js'

export default function AutoDetectPanel() {
  const [input, setInput] = useState('')
  const results = useMemo(() => magicDecode(input), [input])

  return (
    <div className="pane">
      <h1 className="pane__title">Auto-detect</h1>
      <p className="pane__sub">Throw encoded data in and see what decodes to something readable.</p>

      <label className="field" style={{ width: '100%' }}>
        Input
        <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
          placeholder="Paste encoded / mystery data…" />
      </label>

      <div style={{ marginTop: 16 }}>
        {!input && <p className="hint">Tries Base64/32/58/85/91, hex, binary, octal, decimal, Morse, ROT13…</p>}
        {input && results.length === 0 && (
          <p className="hint">No codec produced readable output. Try trimming whitespace or a manual decoder.</p>
        )}
        {results.map((r, i) => {
          const flag = r.output.match(FLAG_REGEX)
          return (
            <ResultCard
              key={i}
              label={`${r.name} · ${(r.score * 100).toFixed(0)}% printable${flag ? ' · flag found' : ''}`}
                          value={r.output.length > 400 ? r.output.slice(0, 400) + '…' : r.output}
/>
          )
        })}
      </div>
    </div>
  )
}
