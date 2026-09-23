import { LANGUAGES } from '../i18n'

export default function LanguageSwitcher({ lang, onChange }) {
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={'lang-btn' + (l.code === lang ? ' active' : '')}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
