import { getDiseaseInfo } from '../ml/classifier'

export default function ResultCard({ result, lang, t }) {
  if (!result) return null
  const info = getDiseaseInfo(result.classId)
  const pct = Math.round((result.confidence || 0) * 100)
  const name = info.name?.[lang] || info.name?.en || result.classId

  return (
    <div className={'result-card' + (info.healthy ? ' healthy' : '')}>
      {result.isDemo && <div className="demo-badge">{t('model_missing')}</div>}

      <div className="result-head">
        <h2>{name}</h2>
        <span className="confidence">{t('confidence')}: {pct}%</span>
      </div>

      {info.healthy ? (
        <p className="healthy-msg">{t('healthy_message')}</p>
      ) : (
        <>
          <Section title={t('cause_title')} text={info.cause?.[lang]} />
          <Section title={t('treatment_title')} text={info.treatment?.[lang]} highlight />
          <Section title={t('prevention_title')} text={info.prevention?.[lang]} />
          <div className="safety-badge">🛡️ {t('pesticide_safety_short')}</div>
        </>
      )}

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  )
}

function Section({ title, text, highlight }) {
  if (!text) return null
  return (
    <div className={'result-section' + (highlight ? ' highlight' : '')}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
