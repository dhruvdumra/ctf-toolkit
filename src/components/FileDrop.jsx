import { useRef, useState } from 'react'

export default function FileDrop({ onFile, accept }) {
  const [hover, setHover] = useState(false)
  const ref = useRef(null)

  const read = async (file) => {
    const buf = new Uint8Array(await file.arrayBuffer())
    let text = ''
    try { text = new TextDecoder('utf-', { fatal: false }).decode(buf) } catch {}
    onFile({ name: file.name, bytes: buf, text, size: buf.length })
  }

  return (
    <div
      className="filedrop"
      style={{
        border: '1px dashed var(--line)',
        borderColor: hover ? 'var(--muted)' : 'var(--line)',
        padding: '18px',
        textAlign: 'center',
        color: 'var(--muted)',
        cursor: 'pointer',
        marginBottom: 14,
      }}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setHover(true) }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault()
        setHover(false)
        if (e.dataTransfer.files[0]) read(e.dataTransfer.files[0])
      }}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && read(e.target.files[0])}
      />
      Drop a file here, or click to choose
    </div>
  )
}
