import { useEffect, useState } from 'react'
import { getHistory, clearHistory } from '../store/history'

export default function HistoryScreen({ lang, t }) {
  const [items, setItems] = useState([])

  useEffect(() => { setItems(getHistory()) }, [])

  function onClear() {
    clearHistory()
    setItems([])
  }

  if (items.length === 0) {
    return <div className="empty">{t('history_empty')}</div>
  }

  return (
    <div className="history">
      <div className="history-head">
        <h2>{t('history_title')}</h2>
        <button className="btn ghost small" onClick={onClear}>🗑️ {t('clear_history')}</button>
      </div>
      <ul className="history-list">
        {items.map((it) => (
          <li key={it.id} className="history-item">
            {it.thumb && <img src={it.thumb} alt="" className="history-thumb" />}
            <div className="history-info">
              <span className="history-name">{it.name}</span>
              <span className="history-meta">
                {Math.round((it.confidence || 0) * 100)}% · {new Date(it.at).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
