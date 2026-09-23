import { useEffect, useState } from 'react'
import { getMandiPrices } from '../services/prices'

// Common commodities for quick filter; users can also type any crop.
const QUICK = ['', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Cotton', 'Wheat', 'Gram', 'Tur']

export default function PricesScreen({ t }) {
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
            {c || t('all')}
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
                <span className="price-name">{r.commodity}{r.variety ? ` (${r.variety})` : ''}</span>
                <span className="price-modal">₹{r.modal}<small>/{t('quintal')}</small></span>
              </div>
              <div className="price-meta">
                📍 {r.market}, {r.district} · {t('range')}: ₹{r.min}–₹{r.max} · {r.date}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
