import { useEffect, useState } from 'react'
import { geocode, getGeoPosition, getForecast, weatherInfo, farmAdvice } from '../services/weather'

export default function WeatherScreen({ t }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [place, setPlace] = useState('')
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)

  async function loadByCoords(lat, lon, name) {
    setLoading(true); setError('')
    try {
      const fc = await getForecast(lat, lon)
      setData(fc)
      if (name) setPlace(name)
    } catch (_) {
      setError(t('weather_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getGeoPosition()
      .then((p) => loadByCoords(p.lat, p.lon, t('your_location')))
      .catch(() => { setLoading(false); setError(''); }) // ask for city instead
  }, [])

  async function search(e) {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError('')
    try {
      const g = await geocode(query.trim())
      await loadByCoords(g.lat, g.lon, g.name)
    } catch (_) {
      setLoading(false); setError(t('place_not_found'))
    }
  }

  const cur = data?.current
  const daily = data?.daily
  const curW = cur ? weatherInfo(cur.weather_code) : null
  const advice = cur && daily ? farmAdvice(cur, daily) : []

  return (
    <div className="weather">
      <form className="search-row" onSubmit={search}>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder={t('search_place')} />
        <button className="btn primary small" type="submit">{t('search')}</button>
      </form>

      {loading && <div className="spinner-row"><span className="spinner" />{t('loading')}</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && cur && (
        <>
          <div className="weather-now">
            <div className="wn-icon">{curW.icon}</div>
            <div>
              <div className="wn-temp">{Math.round(cur.temperature_2m)}°C</div>
              <div className="wn-place">{place}</div>
              <div className="wn-meta">💧 {cur.relative_humidity_2m}% · 💨 {Math.round(cur.wind_speed_10m)} km/h</div>
            </div>
          </div>

          <div className="advice-box">
            <h3>🌾 {t('farm_advice')}</h3>
            <ul>{advice.map((a) => <li key={a}>{t(a)}</li>)}</ul>
          </div>

          <h3 className="section-h">{t('forecast_5day')}</h3>
          <div className="forecast">
            {daily.time.map((day, i) => {
              const w = weatherInfo(daily.weather_code[i])
              return (
                <div key={day} className="fc-day">
                  <span className="fc-date">{new Date(day).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <span className="fc-icon">{w.icon}</span>
                  <span className="fc-temp">{Math.round(daily.temperature_2m_max[i])}° / {Math.round(daily.temperature_2m_min[i])}°</span>
                  <span className="fc-rain">🌧️ {daily.precipitation_probability_max[i] ?? 0}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
