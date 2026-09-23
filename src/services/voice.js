// Free voice: speech-to-text (Web Speech API) + text-to-speech.
// Works in Chrome and Android WebView (Capacitor). No key, no cost.
const LOCALE = { mr: 'mr-IN', hi: 'hi-IN', en: 'en-IN' }

export function voiceSupported() {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// Start listening once. Calls onResult(bestText, allAlternatives).
export function listen(lang, { onResult, onError, onEnd } = {}) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Rec) { onError && onError('unsupported'); return null }
  const rec = new Rec()
  rec.lang = LOCALE[lang] || LOCALE.mr
  rec.interimResults = false
  rec.maxAlternatives = 3
  rec.onresult = (e) => {
    const alts = []
    const r = e.results[0]
    for (let i = 0; i < r.length; i++) alts.push(r[i].transcript)
    onResult && onResult((alts[0] || '').trim(), alts)
  }
  rec.onerror = (e) => onError && onError(e.error)
  rec.onend = () => onEnd && onEnd()
  try { rec.start() } catch (_) { /* already running */ }
  return rec
}

// Read text aloud in the chosen language.
export function speak(text, lang) {
  try {
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = LOCALE[lang] || LOCALE.mr
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  } catch (_) { /* ignore */ }
}
