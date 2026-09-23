import { useMemo, useState } from 'react'
import { getSavedLang, saveLang, makeT } from './i18n'
import LanguageSwitcher from './components/LanguageSwitcher'
import HomeScreen from './components/HomeScreen'
import ScanScreen from './components/ScanScreen'
import HistoryScreen from './components/HistoryScreen'
import WeatherScreen from './components/WeatherScreen'
import PricesScreen from './components/PricesScreen'
import SchemesScreen from './components/SchemesScreen'
import FertilizerScreen from './components/FertilizerScreen'
import DiaryScreen from './components/DiaryScreen'
import Notices from './components/Notices'

const TITLES = {
  home: 'appName', scan: 'tab_scan', history: 'tab_history', weather: 'tab_weather',
  prices: 'tab_prices', schemes: 'tab_schemes', fertilizer: 'tab_fertilizer', diary: 'tab_diary'
}

export default function App() {
  const [lang, setLang] = useState(getSavedLang())
  const [screen, setScreen] = useState('home')
  const t = useMemo(() => makeT(lang), [lang])

  function changeLang(code) {
    setLang(code); saveLang(code); document.documentElement.lang = code
  }

  function renderScreen() {
    switch (screen) {
      case 'scan': return <ScanScreen lang={lang} t={t} />
      case 'history': return <HistoryScreen lang={lang} t={t} />
      case 'weather': return <WeatherScreen t={t} />
      case 'prices': return <PricesScreen lang={lang} t={t} />
      case 'schemes': return <SchemesScreen lang={lang} t={t} />
      case 'fertilizer': return <FertilizerScreen lang={lang} t={t} />
      case 'diary': return <DiaryScreen t={t} />
      default: return <HomeScreen t={t} onOpen={setScreen} />
    }
  }

  const onHome = screen === 'home'

  return (
    <div className="app">
      <Notices lang={lang} t={t} />
      <header className="app-header">
        <div className="brand">
          {onHome ? (
            <span className="brand-icon" aria-hidden>🌱</span>
          ) : (
            <button className="back-btn" onClick={() => setScreen('home')} aria-label="Back">←</button>
          )}
          <div>
            <h1>{t(TITLES[screen] || 'appName')}</h1>
            {onHome && <p className="tagline">{t('tagline')}</p>}
          </div>
        </div>
        <LanguageSwitcher lang={lang} onChange={changeLang} />
      </header>

      <main className="app-main">{renderScreen()}</main>

      <nav className="tabbar">
        <button className={'tab' + (onHome ? ' active' : '')} onClick={() => setScreen('home')}>
          <span aria-hidden>🏠</span>{t('tab_home')}
        </button>
        <button className={'tab' + (screen === 'scan' ? ' active' : '')} onClick={() => setScreen('scan')}>
          <span aria-hidden>🔍</span>{t('tab_scan')}
        </button>
        <button className={'tab' + (screen === 'prices' ? ' active' : '')} onClick={() => setScreen('prices')}>
          <span aria-hidden>💰</span>{t('tab_prices')}
        </button>
      </nav>
    </div>
  )
}
