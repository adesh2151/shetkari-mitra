import { useMemo, useState } from 'react'
import { getSavedLang, saveLang, makeT } from './i18n'
import LanguageSwitcher from './components/LanguageSwitcher'
import ScanScreen from './components/ScanScreen'
import HistoryScreen from './components/HistoryScreen'

export default function App() {
  const [lang, setLang] = useState(getSavedLang())
  const [tab, setTab] = useState('scan')
  const t = useMemo(() => makeT(lang), [lang])

  function changeLang(code) {
    setLang(code)
    saveLang(code)
    document.documentElement.lang = code
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon" aria-hidden>🌱</span>
          <div>
            <h1>{t('appName')}</h1>
            <p className="tagline">{t('tagline')}</p>
          </div>
        </div>
        <LanguageSwitcher lang={lang} onChange={changeLang} />
      </header>

      <main className="app-main">
        {tab === 'scan' ? <ScanScreen lang={lang} t={t} /> : <HistoryScreen lang={lang} t={t} />}
      </main>

      <nav className="tabbar">
        <button className={'tab' + (tab === 'scan' ? ' active' : '')} onClick={() => setTab('scan')}>
          <span aria-hidden>🔍</span>{t('tab_scan')}
        </button>
        <button className={'tab' + (tab === 'history' ? ' active' : '')} onClick={() => setTab('history')}>
          <span aria-hidden>🕘</span>{t('tab_history')}
        </button>
      </nav>
    </div>
  )
}
