import { useEffect, useState } from 'react'
import { getCropMarkets } from '../services/prices'
import { getPriceHistory } from '../services/cropReport'
import { speak } from '../services/voice'

// commodity name must match data.gov.in / Agmarknet exactly.
const CROPS = [
  { mr: 'कांदा', c: 'Onion', e: '🧅' },
  { mr: 'टोमॅटो', c: 'Tomato', e: '🍅' },
  { mr: 'बटाटा', c: 'Potato', e: '🥔' },
  { mr: 'सोयाबीन', c: 'Soyabean', e: '🫘' },
  { mr: 'कापूस', c: 'Cotton', e: '🌱' },
  { mr: 'गहू', c: 'Wheat', e: '🌾' },
  { mr: 'मका', c: 'Maize', e: '🌽' },
  { mr: 'हरभरा', c: 'Bengal Gram(Gram)(Whole)', e: '🟤' }
]

function verdict(series) {
  if (series.length < 3) return null
  const last = series[series.length - 1].p
  const base = series[Math.max(0, series.length - 5)].p
  if (!base) return null
  const chg = ((last - base) / base) * 100
  if (chg >= 5) return { good: true, icon: '📈', key: 'report_sell_good' }
  if (chg <= -5) return { good: false, icon: '📉', key: 'report_hold' }
  return { good: true, icon: '➡️', key: 'report_stable' }
}

function Trend({ series }) {
  const w = 300, h = 90, pad = 8
  const ps = series.map((s) => s.p)
  const min = Math.min(...ps), max = Math.max(...ps), rng = (max - min) || 1
  const pts = series.map((s, i) => {
    const x = pad + (i / (series.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((s.p - min) / rng) * (h - 2 * pad)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <div className="trend-wrap">
      <svg className="trend" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="price trend">
        <polyline points={pts} fill="none" stroke="var(--green)" strokeWidth="2.5" />
      </svg>
      <div className="trend-scale"><span>₹{max.toLocaleString('en-IN')}</span><span>₹{min.toLocaleString('en-IN')}</span></div>
    </div>
  )
}

export default function CropReportScreen({ lang, t }) {
  const [crop, setCrop] = useState(CROPS[0])
  const [markets, setMarkets] = useState(null)
  const [series, setSeries] = useState([])

  useEffect(() => {
    let alive = true
    setMarkets(null)
    getCropMarkets(crop.c).then((m) => { if (alive) setMarkets(m) }).catch(() => { if (alive) setMarkets([]) })
    getPriceHistory().then((h) => { if (alive) setSeries((h[crop.c] || []).slice(-30)) }).catch(() => {})
    return () => { alive = false }
  }, [crop])

  const top = (markets || []).slice(0, 6)
  const maxP = top.length ? Math.max(...top.map((m) => m.modal)) : 0
  const v = verdict(series)

  function readAloud() {
    const parts = [crop.mr]
    if (v) parts.push(t(v.key))
    if (top[0]) parts.push(t('report_best') + ': ' + top[0].market + ', ₹' + top[0].modal)
    speak(parts.join('. '), lang)
  }

  return (
    <div className="report">
      <p className="hint">{t('report_hint')}</p>

      <div className="cropchips">
        {CROPS.map((c) => (
          <button key={c.c} className={'cropchip' + (c.c === crop.c ? ' on' : '')} onClick={() => setCrop(c)}>
            {c.e} {c.mr}
          </button>
        ))}
      </div>

      <div className="scheme-card">
        <div className="report-head">
          <h3>{crop.e} {crop.mr}</h3>
          <button className="today-tts" onClick={readAloud} aria-label={t('read_aloud')}>🔊</button>
        </div>
        {v && <div className={'verdict ' + (v.good ? 'good' : 'warn')}>{v.icon} {t(v.key)}</div>}
        {series.length >= 2 ? <Trend series={series} /> : <p className="muted-note">{t('report_collecting')}</p>}
      </div>

      <h3 className="news-section">{t('report_best_markets')}</h3>
      <div className="scheme-card">
        {markets === null && <p className="hint">{t('loading')}</p>}
        {markets && markets.length === 0 && <p className="hint">{t('report_none')}</p>}
        {top.map((m, i) => (
          <div key={i} className="mkt-row">
            <div className="mkt-name">{m.market}<span>{m.district}</span></div>
            <div className="mkt-bar"><div className="mkt-fill" style={{ width: (maxP ? Math.round((m.modal / maxP) * 100) : 0) + '%' }} /></div>
            <div className="mkt-val">₹{m.modal.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      <p className="disclaimer">📚 {t('report_source')}</p>
    </div>
  )
}
