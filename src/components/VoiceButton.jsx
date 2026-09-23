import { useRef, useState } from 'react'
import { voiceSupported, listen, speak } from '../services/voice'

// Spoken keyword -> screen. Matching is case-insensitive substring,
// across Marathi / Hindi / English so farmers can just say the feature.
const KEYWORDS = [
  { screen: 'scan',       words: ['रोग', 'फोटो', 'स्कॅन', 'स्कैन', 'बीमारी', 'disease', 'scan', 'photo'] },
  { screen: 'weather',    words: ['हवामान', 'पाऊस', 'मौसम', 'बारिश', 'weather', 'rain'] },
  { screen: 'prices',     words: ['भाव', 'बाजार', 'दर', 'कीमत', 'price', 'market', 'mandi'] },
  { screen: 'schemes',    words: ['योजना', 'अनुदान', 'सरकार', 'scheme', 'subsidy'] },
  { screen: 'news',       words: ['बातम्या', 'बातमी', 'समाचार', 'शासन निर्णय', 'news'] },
  { screen: 'fertilizer', words: ['खत', 'खाद', 'fertilizer', 'npk'] },
  { screen: 'irrigation', words: ['पाणी', 'सिंचन', 'पानी', 'सिंचाई', 'water', 'irrigation'] },
  { screen: 'advisor',    words: ['कोणते पीक', 'सल्ला', 'सलाह', 'advisor', 'grow'] },
  { screen: 'cattle',     words: ['जनावर', 'गाय', 'दूध', 'पशु', 'cattle', 'dairy'] },
  { screen: 'pests',      words: ['कीड', 'कीट', 'pest'] },
  { screen: 'cropguide',  words: ['मार्गदर्शक', 'फसल', 'guide'] },
  { screen: 'directory',  words: ['संपर्क', 'हेल्पलाईन', 'फोन', 'helpline', 'contact'] },
  { screen: 'diary',      words: ['नोंद', 'जमाखर्च', 'डायरी', 'diary'] },
  { screen: 'safety',     words: ['सुरक्षा', 'safety'] }
]

function matchScreen(text) {
  const q = (text || '').toLowerCase()
  for (const k of KEYWORDS) {
    if (k.words.some((w) => q.includes(w.toLowerCase()))) return k.screen
  }
  return null
}

export default function VoiceButton({ lang, t, onOpen }) {
  const [status, setStatus] = useState('idle') // idle | listening | msg
  const [msg, setMsg] = useState('')
  const recRef = useRef(null)
  const hideTimer = useRef(null)

  function flash(text) {
    setMsg(text)
    setStatus('msg')
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setStatus('idle'), 4000)
  }

  function start() {
    // Not supported (many Android WebViews / older browsers) — say so instead
    // of failing silently.
    if (!voiceSupported()) {
      flash(t('voice_unsupported'))
      speak(t('voice_unsupported'), lang)
      return
    }
    clearTimeout(hideTimer.current)
    setMsg('')
    setStatus('listening')
    recRef.current = listen(lang, {
      onResult: (text, alts) => {
        const screen = alts.map(matchScreen).find(Boolean)
        if (screen) {
          setStatus('idle')
          speak(t('voice_opening') + ' ' + t('tab_' + screen), lang)
          onOpen(screen)
        } else {
          flash('“' + text + '” — ' + t('voice_notfound'))
          speak(t('voice_notfound'), lang)
        }
      },
      onError: (err) => {
        const m =
          err === 'not-allowed' || err === 'service-not-allowed' || err === 'audio-capture'
            ? t('voice_denied')
            : err === 'no-speech'
              ? t('voice_notfound')
              : err === 'unsupported'
                ? t('voice_unsupported')
                : t('voice_error')
        flash(m)
      },
      onEnd: () => setStatus((s) => (s === 'listening' ? 'idle' : s))
    })
  }

  const showBubble = status === 'listening' || (status === 'msg' && msg)

  return (
    <div className="voice-wrap">
      {showBubble && (
        <div className="voice-bubble">
          {status === 'listening' ? t('voice_listening') : msg}
        </div>
      )}
      <button
        className={'voice-fab' + (status === 'listening' ? ' on' : '')}
        onClick={start}
        aria-label={t('voice_search')}
      >
        🎤
      </button>
    </div>
  )
}
