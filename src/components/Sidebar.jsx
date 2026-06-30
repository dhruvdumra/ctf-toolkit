const TOOLS = [
  {
    group: 'Transform',
    items: [
      { id: 'encode', name: 'Encoders', icon: '·' },
            { id: 'cipher', name: 'Ciphers', icon: '·' },
{ id: 'crypto', name: 'Crypto', icon: '·' },
      { id: 'hash', name: 'Hashing', icon: '·' },
    ],
  },
  {
    group: 'Analyze',
    items: [
      { id: 'detect', name: 'Auto-detect', icon: '·' },
      { id: 'forensics', name: 'Forensics', icon: '·' },
    ],
  },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        Cipher<span>Deck</span>
      </div>
      {TOOLS.map((g) => (
        <div className="sidebar__group" key={g.group}>
          <div className="sidebar__group-label">{g.group}</div>
          {g.items.map((it) => (
            <button
              key={it.id}
              className={'sidebar__item' + (active === it.id ? ' active' : '')}
              onClick={() => onSelect(it.id)}
            >
              <span className="ico">{it.icon}</span>
              {it.name}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
