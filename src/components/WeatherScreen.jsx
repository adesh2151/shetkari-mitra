import { useEffect, useRef, useState } from 'react'
import {
  searchPlaces, resolveCoords, getGeoPosition, getForecast, weatherInfo, farmAdvice
} from '../services/weather'

export default function WeatherScreen({ t }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [place, setPlace] = useState('')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [data, setData] = useState(null)
  const debounce = useRef(null)

  async function loadByCoords(lat, lon, name) {
    setLoading(true); setError(''); setSuggestions([])
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
      .catch(() => { setLoading(false); setError('') })
  }, [])

  function onQueryChange(e) {
    const v = e.target.value
    setQuery(v)
    clearTimeout(debounce.current)
    const isPin = /^\d{6}$/.test(v.trim())
    if (v.trim().length < 3 && !isPin) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => {
      const list = await searchPlaces(v)
      setSuggestions(list)
    }, 350)
  }

  async function pick(sel) {
    setQuery(sel.label)
    setSuggestions([])
    setLoading(true)
    try {
      const { lat, lon } = await resolveCoords(sel)
      const label = sel.pin ? `${sel.label} · ${sel.pin}` : `${sel.label}, ${sel.state}`
      await loadByCoords(lat, lon, label)
    } catch (_) {
      setLoading(false); setError(t('place_not_found'))
    }
  }

  const cur = data?.current
  const daily = data?.daily
  const curW = cur ? weatherInfo(cur.weather_code) : null
  const advice = cur && daily ? farmAdvice(cur, daily) : []

  const alerts = []
  if (daily) {
    if ((daily.precipitation_probability_max?.[0] ?? 0) >= 70) alerts.push('alert_heavy_rain')
    if ((daily.temperature_2m_max?.[0] ?? 0) >= 42) alerts.push('alert_heat')
  }

  return (
    <div className="weather">
      <div className="search-wrap">
        <input value={query} onChange={onQueryChange} placeholder={t('search_place_pin')} />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s) => (
              <li key={s.id} onClick={() => pick(s)}>
                <span className="sg-name">{s.label}</span>
                <span className="sg-sub">{s.sub}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <div className="spinner-row"><span className="spinner" />{t('loading')}</div>}
      {error && <p className="error-text">{error}</p>}

      {alerts.map((a) => <div className="alert-banner" key={a}>⚠️ {t(a)}</div>)}

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
          <p className="source-note">📚 {t('data_source')}: Open-Meteo · India Post (PIN)</p>
        </>
      )}
    </div>
  )
}
