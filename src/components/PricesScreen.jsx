import { useEffect, useState } from 'react'
import { getMandiPrices } from '../services/prices'
import commodities from '../data/commodities.json'

// Common commodities for quick filter; users can also type any crop.
const QUICK = ['', 'Onion', 'Tomato', 'Potato', 'Soyabean', 'Cotton', 'Wheat', 'Bengal Gram(Gram)(Whole)', 'Arhar (Tur/Red Gram)(Whole)']
const SHORT = { 'Bengal Gram(Gram)(Whole)': 'Gram', 'Arhar (Tur/Red Gram)(Whole)': 'Tur', 'Soyabean': 'Soybean' }

export default function PricesScreen({ lang, t }) {
  // Translate a commodity name coming from the (English-only) government API.
  const trName = (name) => (commodities[name]?.[lang]) || name
  const chipLabel = (c) => c ? (commodities[c]?.[lang] || SHORT[c] || c) : t('all')
  const [commodity, setCommodity] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  async function load(c) {
    setLoading(true); setError('')
    try {
      const data = await getMandiPrices({ commodity: c, limit: 40 })
      setRows(data)
      if (data.length === 0) setError(t('no_prices'))
    } catch (_) {
      setError(t('prices_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load('') }, [])

  function onSearch(e) {
    e?.preventDefault()
    setCommodity(query.trim())
    load(query.trim())
  }

  return (
    <div className="prices">
      <p className="hint">{t('prices_hint')}</p>
      <form className="search-row" onSubmit={onSearch}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search_crop')} />
        <button className="btn primary small" type="submit">{t('search')}</button>
      </form>

      <div className="chips">
        {QUICK.map((c) => (
          <button key={c || 'all'} className={'chip' + (commodity === c ? ' active' : '')}
                  onClick={() => { setCommodity(c); setQuery(c); load(c) }}>
            {chipLabel(c)}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-row"><span className="spinner" />{t('loading')}</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && rows.length > 0 && (
        <ul className="price-list">
          {rows.map((r, i) => (
            <li key={i} className="price-item">
              <div className="price-top">
                <span className="price-name">{trName(r.commodity)}{r.variety ? ` (${r.variety})` : ''}</span>
                <span className="price-modal">₹{r.modal}<small>/{t('quintal')}</small></span>
              </div>
              <div className="price-meta">
                📍 {r.market}, {r.district} · {t('range')}: ₹{r.min}–₹{r.max} · {r.date}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="source-note">📚 {t('data_source')}: Agmarknet — Government of India (data.gov.in)</p>
    </div>
  )
}
