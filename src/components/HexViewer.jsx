export default function HexViewer({ bytes, max = 1024 }) {
  if (!bytes || !bytes.length) return <p className="hint">No data.</p>
  const end = Math.min(bytes.length, max)
  const rows = []
  for (let i = 0; i < end; i += 16) {
    const slice = bytes.slice(i, Math.min(i + 16, end))
    const hex = [...slice].map((b) => b.toString(16).padStart(2, '0')).join(' ')
    const ascii = [...slice]
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('')
    rows.push(
      <div key={i} style={{ display: 'flex', gap: 14, whiteSpace: 'pre' }}>
        <span style={{ color: 'var(--muted)' }}>{i.toString(16).padStart(8, '0')}</span>
        <span>{hex.padEnd(47)}</span>
        <span style={{ color: 'var(--muted)' }}>{ascii}</span>
      </div>
    )
  }
  return (
    <div className="mono" style={{ fontSize: 12, lineHeight: 1.5, overflowX: 'auto' }}>
      {rows}
      {bytes.length > max && (
        <p className="hint">… {bytes.length - max} more bytes</p>
      )}
    </div>
  )
}
