import safety from '../data/safety.json'

export default function SafetyScreen({ lang, t }) {
  return (
    <div className="safety">
      <div className="advice-box warn">
        <h3>🚑 {t('emergency')}</h3>
        <p>{t('poison_help')}</p>
        <a className="btn primary" href={safety.helpline.tel}>📞 {safety.helpline.label}</a>
      </div>

      <h3 className="section-h">🛡️ {t('pesticide_safety_title')}</h3>
      <ul className="safety-list">
        {safety.tips.map((tip, i) => (
          <li key={i} className="safety-item">
            <span className="safety-icon">{tip.icon}</span>
            <span>{tip.text[lang] || tip.text.en}</span>
          </li>
        ))}
      </ul>

      <p className="disclaimer">{t('safety_disclaimer')}</p>
    </div>
  )
}
