import { useRef, useState } from 'react'
import { voiceSupported, listen, speak } from '../services/voice'

// Spoken (or typed) keyword -> screen. Case-insensitive substring match,
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
  const [status, setStatus] = useState('idle') // idle | listening | msg | typing
  const [msg, setMsg] = useState('')
  const [text, setText] = useState('')
  const hideTimer = useRef(null)

  function flash(m) {
    setMsg(m)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => { setMsg(''); setStatus('idle') }, 4000)
  }

  function go(query) {
    const screen = matchScreen(query)
    if (screen) {
      setStatus('idle'); setText(''); setMsg('')
      speak(t('voice_opening') + ' ' + t('tab_' + screen), lang)
      onOpen(screen)
      return true
    }
    return false
  }

  function onMic() {
    // iPhone / iOS Chrome + older WebViews: no Web Speech recognition.
    // Fall back to a text box the user can fill with the keyboard's own
    // dictation mic — still "speak, minimal typing".
    if (!voiceSupported()) {
      setStatus((s) => (s === 'typing' ? 'idle' : 'typing'))
      setMsg('')
      return
    }
    clearTimeout(hideTimer.current)
    setMsg(''); setStatus('listening')
    listen(lang, {
      onResult: (heard, alts) => {
        if (!alts.some(go)) { setStatus('msg'); flash('“' + heard + '” — ' + t('voice_notfound')); speak(t('voice_notfound'), lang) }
      },
      onError: (err) => {
        setStatus('msg')
        flash(err === 'no-speech' ? t('voice_notfound')
          : (err === 'not-allowed' || err === 'service-not-allowed' || err === 'audio-capture') ? t('voice_denied')
          : t('voice_error'))
      },
      onEnd: () => setStatus((s) => (s === 'listening' ? 'idle' : s))
    })
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    if (!go(text)) flash('“' + text.trim() + '” — ' + t('voice_notfound'))
  }

  return (
    <div className="voice-wrap">
      {status === 'typing' && (
        <form className="voice-form" onSubmit={onSubmit}>
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('voice_type_hint')}
            aria-label={t('voice_search')}
          />
          <button type="submit" aria-label={t('voice_search')}>➜</button>
        </form>
      )}

      {(status === 'listening' || msg) && (
        <div className="voice-bubble">
          {status === 'listening' ? t('voice_listening') : msg}
        </div>
      )}

      <button
        className={'voice-fab' + (status === 'listening' ? ' on' : '')}
        onClick={onMic}
        aria-label={t('voice_search')}
      >
        🎤
      </button>
    </div>
  )
}
