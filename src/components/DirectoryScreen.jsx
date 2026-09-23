import directory from '../data/directory.json'

export default function DirectoryScreen({ lang, t }) {
  return (
    <div className="directory">
      <p className="hint">{t('directory_hint')}</p>
      <ul className="scheme-list">
        {directory.map((d) => {
          const isTel = d.action.startsWith('tel:')
          return (
            <li key={d.id} className="scheme-card">
              <h3>{d.name[lang] || d.name.en}</h3>
              <p>{d.desc[lang] || d.desc.en}</p>
              <a className="scheme-link" href={d.action} target={isTel ? undefined : '_blank'} rel="noopener">
                {isTel ? '📞 ' : '🔗 '}{d.actionLabel}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
