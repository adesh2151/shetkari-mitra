import { useEffect, useRef, useState } from 'react'
import { searchPlaces, resolveCoords, getGeoPosition, getIrrigationData } from '../services/weather'

export default function IrrigationScreen({ t }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [place, setPlace] = useState('')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [data, setData] = useState(null)
  const debounce = useRef(null)

  async function load(lat, lon, name) {
    setLoading(true); setError(''); setSuggestions([])
    try {
      setData(await getIrrigationData(lat, lon))
      if (name) setPlace(name)
    } catch (_) { setError(t('weather_error')) } finally { setLoading(false) }
  }

  useEffect(() => {
    getGeoPosition().then((p) => load(p.lat, p.lon, t('your_location')))
      .catch(() => { setLoading(false); setError('') })
  }, [])

  function onQuery(e) {
    const v = e.target.value; setQuery(v)
    clearTimeout(debounce.current)
    if (v.trim().length < 3 && !/^\d{6}$/.test(v.trim())) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => setSuggestions(await searchPlaces(v)), 350)
  }

  async function pick(sel) {
    setQuery(sel.label); setSuggestions([]); setLoading(true)
    try {
      const { lat, lon } = await resolveCoords(sel)
      await load(lat, lon, sel.pin ? `${sel.label} · ${sel.pin}` : `${sel.label}, ${sel.state}`)
    } catch (_) { setLoading(false); setError(t('place_not_found')) }
  }

  const advice = data ? (data.net <= 0 ? 'irr_skip' : data.net < 3 ? 'irr_light' : 'irr_full') : null

  return (
    <div className="irrigation">
      <p className="hint">{t('irrigation_hint')}</p>
      <div className="search-wrap">
        <input value={query} onChange={onQuery} placeholder={t('search_place_pin')} />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s) => (
              <li key={s.id} onClick={() => pick(s)}>
                <span className="sg-name">{s.label}</span><span className="sg-sub">{s.sub}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <div className="spinner-row"><span className="spinner" />{t('loading')}</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && data && (
        <>
          <div className="wn-place" style={{ marginBottom: 10 }}>📍 {place}</div>
          <div className={'advice-box ' + (advice === 'irr_skip' ? '' : 'warn')}>
            <h3>💧 {t('today_advice')}</h3>
            <p style={{ fontSize: 18, fontWeight: 700, margin: '4px 0' }}>{t(advice)}</p>
          </div>
          <div className="npk-row" style={{ marginTop: 12 }}>
            <div className="npk"><span>{t('crop_water_need')}</span><b>{data.et0.toFixed(1)}</b>mm</div>
            <div className="npk"><span>{t('expected_rain')}</span><b>{data.rain.toFixed(1)}</b>mm</div>
            <div className="npk"><span>{t('net_need')}</span><b>{data.net.toFixed(1)}</b>mm</div>
          </div>
          {data.soil != null && (
            <p className="hint" style={{ marginTop: 12 }}>🌱 {t('soil_moisture')}: {(data.soil * 100).toFixed(0)}%</p>
          )}
          <p className="disclaimer">{t('irrigation_disclaimer')}</p>
          <p className="source-note">📚 {t('data_source')}: Open-Meteo (evapotranspiration & soil moisture)</p>
        </>
      )}
    </div>
  )
}
