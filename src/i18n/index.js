import en from './en.json'
import mr from './mr.json'
import hi from './hi.json'

export const LANGUAGES = [
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' }
]

const DICTS = { en, mr, hi }
const STORAGE_KEY = 'sm_lang'
const DEFAULT_LANG = 'mr'

export function getSavedLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && DICTS[saved]) return saved
  } catch (_) { /* storage may be unavailable */ }
  return DEFAULT_LANG
}

export function saveLang(code) {
  try { localStorage.setItem(STORAGE_KEY, code) } catch (_) { /* ignore */ }
}

// Returns a translate function `t(key)` for the given language,
// falling back to English then to the raw key.
export function makeT(lang) {
  const dict = DICTS[lang] || DICTS[DEFAULT_LANG]
  return (key) => dict[key] ?? DICTS.en[key] ?? key
}
