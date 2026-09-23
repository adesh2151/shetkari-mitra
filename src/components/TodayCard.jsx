import { useEffect, useState } from 'react'
import { getLocation } from '../store/location'
import { getForecast, weatherInfo, farmAdvice } from '../services/weather'
import { getNews } from '../services/news'
import { speak } from '../services/voice'

// Home's daily hook: "आजचे काम" — today's tasks from live weather advice
// (reuses farmAdvice) plus a count of new GRs/schemes. Everything is tap-through.
export default function TodayCard({ lang, t, onOpen }) {
  const [wx, setWx] = useState(null)
  const [tips, setTips] = useState([])
  const [newCount, setNewCount] = useState(0)
  const loc = getLocation()

  useEffect(() => {
    let alive = true
    if (loc) {
      getForecast(loc.lat, loc.lon)
        .then((fc) => { if (alive) { setWx(fc); setTips(farmAdvice(fc.current, fc.daily)) } })
        .catch(() => {})
    }
    getNews()
      .then((items) => { if (alive) setNewCount(items.filter((n) => n.isNew).length) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const cur = wx?.current
  const info = cur ? weatherInfo(cur.weather_code) : null

  const lines = tips.map((k) => t(k))
  if (newCount > 0) lines.push(newCount + ' ' + t('today_new_schemes'))

  function readAloud() {
    speak(t('today_title') + '. ' + lines.join('. '), lang)
  }

  return (
    <div className="today-card">
      <div className="today-head">
        <h2>🌾 {t('today_title')}</h2>
        {lines.length > 0 && (
          <button className="today-tts" onClick={readAloud} aria-label={t('read_aloud')}>🔊</button>
        )}
      </div>

      {!loc && (
        <button className="today-set" onClick={() => onOpen('weather')}>
          📍 {t('today_set_location')}
        </button>
      )}

      {loc && cur && (
        <button className="today-wx" onClick={() => onOpen('weather')}>
          <span className="tw-icon" aria-hidden>{info?.icon}</span>
          <span className="tw-temp">{Math.round(cur.temperature_2m)}°</span>
          <span className="tw-place">{loc.label}</span>
        </button>
      )}

      <ul className="today-list">
        {loc && lines.length === 0 && <li>{t('today_loading')}</li>}
        {lines.map((line, i) => {
          const isScheme = i >= tips.length
          return (
            <li key={i} onClick={() => onOpen(isScheme ? 'news' : 'weather')}>
              <span aria-hidden>{isScheme ? '📜' : '✅'}</span> {line}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
