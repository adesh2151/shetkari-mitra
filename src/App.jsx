import { useEffect, useMemo, useState } from 'react'
import { getSavedLang, saveLang, makeT } from './i18n'
import LanguageSwitcher from './components/LanguageSwitcher'
import SplashScreen from './components/SplashScreen'
import HomeScreen from './components/HomeScreen'
import ScanScreen from './components/ScanScreen'
import HistoryScreen from './components/HistoryScreen'
import WeatherScreen from './components/WeatherScreen'
import PricesScreen from './components/PricesScreen'
import SchemesScreen from './components/SchemesScreen'
import NewsScreen from './components/NewsScreen'
import VoiceButton from './components/VoiceButton'
import FertilizerScreen from './components/FertilizerScreen'
import DiaryScreen from './components/DiaryScreen'
import DairyScreen from './components/DairyScreen'
import AdvisorScreen from './components/AdvisorScreen'
import IrrigationScreen from './components/IrrigationScreen'
import CropGuideScreen from './components/CropGuideScreen'
import DirectoryScreen from './components/DirectoryScreen'
import GovtServicesScreen from './components/GovtServicesScreen'
import SafetyScreen from './components/SafetyScreen'
import PestGuideScreen from './components/PestGuideScreen'
import Notices from './components/Notices'

const TITLES = {
  home: 'appName', scan: 'tab_scan', history: 'tab_history', weather: 'tab_weather',
  prices: 'tab_prices', schemes: 'tab_schemes', news: 'tab_news', fertilizer: 'tab_fertilizer',
  diary: 'tab_diary', cattle: 'tab_cattle', advisor: 'tab_advisor', irrigation: 'tab_irrigation',
  cropguide: 'tab_cropguide', directory: 'tab_directory', safety: 'tab_safety', pests: 'tab_pests',
  govtseva: 'tab_govtseva'
}

export default function App() {
  const [lang, setLang] = useState(getSavedLang())
  const [screen, setScreen] = useState('home')
  const [showSplash, setShowSplash] = useState(true)
  const t = useMemo(() => makeT(lang), [lang])

  useEffect(() => {
    const id = setTimeout(() => setShowSplash(false), 1800)
    return () => clearTimeout(id)
  }, [])

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
      case 'news': return <NewsScreen t={t} />
      case 'fertilizer': return <FertilizerScreen lang={lang} t={t} />
      case 'diary': return <DiaryScreen t={t} />
      case 'cattle': return <DairyScreen lang={lang} t={t} />
      case 'advisor': return <AdvisorScreen lang={lang} t={t} />
      case 'irrigation': return <IrrigationScreen t={t} />
      case 'cropguide': return <CropGuideScreen lang={lang} t={t} />
      case 'directory': return <DirectoryScreen lang={lang} t={t} />
      case 'govtseva': return <GovtServicesScreen lang={lang} t={t} />
      case 'safety': return <SafetyScreen lang={lang} t={t} />
      case 'pests': return <PestGuideScreen lang={lang} t={t} />
      default: return <HomeScreen lang={lang} t={t} onOpen={setScreen} />
    }
  }

  const onHome = screen === 'home'

  if (showSplash) return <SplashScreen />

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

      <VoiceButton lang={lang} t={t} onOpen={setScreen} />

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
