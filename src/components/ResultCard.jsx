export default function ResultCard({ label, value, bad = false, mono = true }) {
  const copy = () => navigator.clipboard?.writeText(value)
  return (
    <div className={'result' + (bad ? ' bad' : '')}>
      <div className="result__head">
        <span className="result__label">{label}</span>
        {!bad && <button className="btn" onClick={copy}>copy</button>}
      </div>
      <div className="result__value" style={mono ? undefined : { fontFamily: 'var(--sans)' }}>
        {value}
      </div>
    </div>
  )
}
