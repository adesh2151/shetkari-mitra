import { useEffect, useState } from 'react'
import cropmeta from '../data/cropmeta.json'
import { getMandiPrices } from '../services/prices'

// Rough Indian cropping seasons by month.
function currentSeason() {
  const m = new Date().getMonth() + 1 // 1-12
  if (m >= 6 && m <= 9) return 'kharif'
  if (m >= 10 || m === 1) return 'rabi'
  return 'summer'
}

const WATER_FIT = {
  // rainfall -> preferred water need (score boost)
  low: { low: 2, medium: 0, high: -2 },
  normal: { low: 1, medium: 2, high: 1 },
  high: { low: -1, medium: 1, high: 2 }
}

export default function AdvisorScreen({ lang, t }) {
  const [season, setSeason] = useState(currentSeason())
  const [rain, setRain] = useState('normal')
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMandiPrices({ limit: 100 })
      .then((rows) => {
        const map = {}
        for (const r of rows) {
          const k = (r.commodity || '').toLowerCase()
          if (r.modal && (!map[k] || r.modal > map[k])) map[k] = r.modal
        }
        setPrices(map)
      })
      .catch(() => setPrices({}))
      .finally(() => setLoading(false))
  }, [])

  const priceFor = (c) => prices[(c || '').toLowerCase()] || 0
  const maxPrice = Math.max(1, ...Object.values(prices))

  const ranked = cropmeta
    .filter((c) => c.seasons.includes(season))
    .map((c) => {
      const price = priceFor(c.commodity)
      const priceScore = price ? (price / maxPrice) * 5 : 1.5 // 0-5
      const waterScore = WATER_FIT[rain][c.water] // -2..2
      return { ...c, price, score: priceScore + waterScore }
    })
    .sort((a, b) => b.score - a.score)

  const seasons = ['kharif', 'rabi', 'summer']
  const rains = ['low', 'normal', 'high']

  return (
    <div className="advisor">
      <p className="hint">{t('advisor_hint')}</p>

      <label className="field-label">{t('season')}</label>
      <div className="chips">
        {seasons.map((s) => (
          <button key={s} className={'chip' + (season === s ? ' active' : '')} onClick={() => setSeason(s)}>
            {t('season_' + s)}
          </button>
        ))}
      </div>

      <label className="field-label">{t('rainfall')}</label>
      <div className="chips">
        {rains.map((r) => (
          <button key={r} className={'chip' + (rain === r ? ' active' : '')} onClick={() => setRain(r)}>
            {t('rain_' + r)}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-row"><span className="spinner" />{t('loading')}</div>}

      <h3 className="section-h">{t('recommended_crops')}</h3>
      <ol className="advisor-list">
        {ranked.map((c, i) => (
          <li key={c.id} className="advisor-item">
            <div className="ai-rank">{i + 1}</div>
            <div className="ai-body">
              <span className="ai-name">{c.name[lang] || c.name.en}</span>
              <span className="ai-meta">
                💧 {t('water_' + c.water)}
                {c.price ? ` · 💰 ₹${c.price}/${t('quintal')}` : ''}
              </span>
            </div>
          </li>
        ))}
      </ol>
      <p className="disclaimer">{t('advisor_disclaimer')}</p>
    </div>
  )
}
