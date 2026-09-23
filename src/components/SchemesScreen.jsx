import schemes from '../data/schemes.json'

export default function SchemesScreen({ lang, t }) {
  return (
    <div className="schemes">
      <p className="hint">{t('schemes_hint')}</p>
      <ul className="scheme-list">
        {schemes.map((s) => (
          <li key={s.id} className="scheme-card">
            <h3>{s.name[lang] || s.name.en}</h3>
            <p>{s.benefit[lang] || s.benefit.en}</p>
            <a className="scheme-link" href={s.link} target="_blank" rel="noopener">
              {s.link.startsWith('tel:') ? '📞 ' + t('call_now') : '🔗 ' + t('open_official')}
            </a>
          </li>
        ))}
      </ul>
      <p className="disclaimer">{t('schemes_disclaimer')}</p>
    </div>
  )
}
