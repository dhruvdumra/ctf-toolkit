export default function TextIO({
  input,
  setInput,
  output,
  error,
  inputLabel = 'Input',
    outputLabel = 'Output',
onSwap,
  placeholder = 'Type or paste here…',
}) {
  const copy = (t) => navigator.clipboard?.writeText(t)
  return (
    <div className="textio">
      <div className="textio__bar">
        <small>{inputLabel}</small>
        <small className="hint">{input.length} chars</small>
        <div className="spacer" />
        <button className="btn" onClick={() => setInput('')}>Clear</button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
              spellCheck={false}
/>
      <div className="textio__bar">
        <small>{outputLabel}</small>
        <div className="spacer" />
        {onSwap && (
          <button className="btn" onClick={onSwap} disabled={!output || !!error}>
            Use as input
          </button>
        )}
        <button className="btn" onClick={() => copy(output)} disabled={!output}>
          Copy
        </button>
      </div>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <textarea readOnly value={output} spellCheck={false} placeholder="…" />
      )}
    </div>
  )
}
