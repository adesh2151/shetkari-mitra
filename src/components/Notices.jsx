import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const SEEN_VERSION = 'sm_seen_version'
const SEEN_ANN = 'sm_seen_ann'
const base = import.meta.env.BASE_URL

function pick(obj, lang) {
  if (!obj) return ''
  return obj[lang] || obj.en || ''
}

async function fetchFresh(name) {
  try {
    const res = await fetch(`${base}${name}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch (_) {
    return null // offline — skip silently
  }
}

function readLS(key) {
  try { return localStorage.getItem(key) } catch (_) { return null }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, val) } catch (_) { /* ignore */ }
}

export default function Notices({ lang, t }) {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [whatsNew, setWhatsNew] = useState(null) // {changes: []}
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchFresh('version.json').then((v) => {
      if (cancelled || !v?.version) return
      const seen = readLS(SEEN_VERSION)
      // Show "what's new" only on an actual change, and not on very first run.
      if (seen && seen !== v.version && v.changes) {
        setWhatsNew({ version: v.version, changes: v.changes[lang] || v.changes.en || [] })
      }
      writeLS(SEEN_VERSION, v.version)
    })

    fetchFresh('announcement.json').then((a) => {
      if (cancelled || !a?.active) return
      if (readLS(SEEN_ANN) === a.id) return
      setAnnouncement(a)
    })

    return () => { cancelled = true }
  }, [lang])

  function dismissAnnouncement() {
    if (announcement) writeLS(SEEN_ANN, announcement.id)
    setAnnouncement(null)
  }

  return (
    <>
      {needRefresh && (
        <div className="update-bar">
          <span>🔄 {t('update_ready')}</span>
          <button onClick={() => updateServiceWorker(true)}>{t('reload_now')}</button>
        </div>
      )}

      {announcement && (
        <div className={'announce announce-' + (announcement.type || 'info')}>
          <div className="announce-body">
            <strong>{pick(announcement.title, lang)}</strong>
            <p>{pick(announcement.message, lang)}</p>
          </div>
          <button className="announce-close" onClick={dismissAnnouncement} aria-label={t('close')}>✕</button>
        </div>
      )}

      {whatsNew && (
        <div className="modal-overlay" onClick={() => setWhatsNew(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>✨ {t('whats_new')}</h2>
            <p className="modal-version">{t('version')} {whatsNew.version}</p>
            <ul className="whats-new-list">
              {whatsNew.changes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
            <button className="btn primary" onClick={() => setWhatsNew(null)}>{t('close')}</button>
          </div>
        </div>
      )}
    </>
  )
}
