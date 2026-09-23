const TILES = [
  { key: 'scan', icon: '🔍', label: 'tab_scan', color: '#e8f5e9' },
  { key: 'weather', icon: '🌦️', label: 'tab_weather', color: '#e3f2fd' },
  { key: 'prices', icon: '💰', label: 'tab_prices', color: '#fff8e1' },
  { key: 'fertilizer', icon: '🧮', label: 'tab_fertilizer', color: '#f1f8e9' },
  { key: 'cattle', icon: '🐄', label: 'tab_cattle', color: '#fff3e0' },
  { key: 'schemes', icon: '🏛️', label: 'tab_schemes', color: '#f3e5f5' },
  { key: 'diary', icon: '📒', label: 'tab_diary', color: '#e0f2f1' },
  { key: 'history', icon: '🕘', label: 'tab_history', color: '#eceff1' }
]

export default function HomeScreen({ t, onOpen }) {
  return (
    <div className="home">
      <div className="tiles">
        {TILES.map((tile) => (
          <button key={tile.key} className="tile" style={{ background: tile.color }}
                  onClick={() => onOpen(tile.key)}>
            <span className="tile-icon" aria-hidden>{tile.icon}</span>
            <span className="tile-label">{t(tile.label)}</span>
          </button>
        ))}
      </div>
      <p className="home-credit">🌱 शेतकरी मित्र · by Adesh</p>
    </div>
  )
}
