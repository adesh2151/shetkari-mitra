import { useEffect, useState } from 'react'
import { getNews } from '../services/news'
import { enableNotify, notify, notifyEnabled } from '../services/notify'

const SEEN_KEY = 'sm_news_notified'

export default function NewsScreen({ t }) {
  const [items, setItems] = useState(null)
  const [notifOn, setNotifOn] = useState(notifyEnabled())

  useEffect(() => {
    let alive = true
    getNews().then((data) => {
      if (!alive) return
      setItems(data)
      // Notify once about new items (deadline/new-scheme reminder).
      const newIds = data.filter((n) => n.isNew).map((n) => n.id).join(',')
      let seen = ''
      try { seen = localStorage.getItem(SEEN_KEY) || '' } catch (_) { /* ignore */ }
      const nw = data.filter((n) => n.isNew).length
      if (nw > 0 && newIds !== seen && notifyEnabled()) {
        notify(t('notify_new_title'), nw + ' ' + t('today_new_schemes'))
        try { localStorage.setItem(SEEN_KEY, newIds) } catch (_) { /* ignore */ }
      }
    })
    return () => { alive = false }
  }, [])

  async function turnOnAlerts() {
    setNotifOn(await enableNotify())
  }

  if (items === null) return <p className="hint">{t('news_loading')}</p>
  if (items.length === 0) return <p className="hint">{t('news_empty')}</p>

  const grs = items.filter((n) => n.category === 'gr')
  const news = items.filter((n) => n.category !== 'gr')

  return (
    <div className="news">
      <p className="hint">{t('news_hint')}</p>

      {!notifOn && (
        <button className="btn-save" onClick={turnOnAlerts}>🔔 {t('notify_enable')}</button>
      )}

      {grs.length > 0 && (
        <>
          <h2 className="news-section">📜 {t('news_gr')}</h2>
          <ul className="scheme-list">
            {grs.map((n) => <NewsItem key={n.id} n={n} t={t} />)}
          </ul>
        </>
      )}

      {news.length > 0 && (
        <>
          <h2 className="news-section">📰 {t('news_latest')}</h2>
          <ul className="scheme-list">
            {news.map((n) => <NewsItem key={n.id} n={n} t={t} />)}
          </ul>
        </>
      )}

      <p className="disclaimer">{t('news_disclaimer')}</p>
    </div>
  )
}

function NewsItem({ n, t }) {
  return (
    <li className="scheme-card">
      <div className="news-meta">
        {n.isNew && <span className="news-new">{t('news_new')}</span>}
        {n.source && <span>{n.source}</span>}
        {n.date && <span>· {n.date}</span>}
        {n.deadline && <span className="news-deadline">⏳ {n.deadline}</span>}
      </div>
      <h3>{n.title}</h3>
      {n.summary && <p>{n.summary}</p>}
      {n.link && (
        <a className="scheme-link" href={n.link} target="_blank" rel="noopener">
          🔗 {t('open_official')}
        </a>
      )}
    </li>
  )
}
