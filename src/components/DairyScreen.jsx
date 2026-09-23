import { useState } from 'react'
import dairy from '../data/dairy.json'

export default function DairyScreen({ lang, t }) {
  const [animal, setAnimal] = useState('cow')
  const [weight, setWeight] = useState('400')
  const [milk, setMilk] = useState('8')

  const w = Number(weight) || 0
  const m = Number(milk) || 0
  // Standard thumb-rule ration (per day).
  const greenFodder = Math.round(w * 0.06)                 // ~kg green fodder
  const dryFodder = Math.round(w * 0.012 * 10) / 10        // ~kg dry fodder
  const maint = animal === 'buffalo' ? 2.0 : 1.5           // maintenance concentrate
  const perL = animal === 'buffalo' ? 0.5 : 0.4            // concentrate per litre milk
  const concentrate = Math.round((maint + m * perL) * 10) / 10
  const mineral = 50 + Math.round(m) * 3                   // grams/day

  return (
    <div className="dairy">
      <div className="fert-result">
        <h3>🐄 {t('dairy_feed_title')}</h3>

        <div className="type-toggle">
          <button className={animal === 'cow' ? 'active' : ''} onClick={() => setAnimal('cow')}>🐄 {t('cow')}</button>
          <button className={animal === 'buffalo' ? 'active' : ''} onClick={() => setAnimal('buffalo')}>🐃 {t('buffalo')}</button>
        </div>

        <label className="field-label">{t('body_weight_kg')}</label>
        <input className="area-input" type="number" min="0" value={weight}
               onChange={(e) => setWeight(e.target.value)} style={{ width: '100%' }} />

        <label className="field-label">{t('milk_yield_l')}</label>
        <input className="area-input" type="number" min="0" value={milk}
               onChange={(e) => setMilk(e.target.value)} style={{ width: '100%' }} />

        <div className="npk-row" style={{ marginTop: 14 }}>
          <div className="npk"><span>{t('green_fodder')}</span><b>{greenFodder}</b>{t('kg_day')}</div>
          <div className="npk"><span>{t('dry_fodder')}</span><b>{dryFodder}</b>{t('kg_day')}</div>
        </div>
        <div className="npk-row" style={{ marginTop: 10 }}>
          <div className="npk"><span>{t('concentrate')}</span><b>{concentrate}</b>{t('kg_day')}</div>
          <div className="npk"><span>{t('mineral_mix')}</span><b>{mineral}</b>{t('g_day')}</div>
        </div>
      </div>

      <div className="note-box">💡 {t('milk_rate_note')}</div>

      <h3 className="section-h">🩺 {t('care_tips_title')}</h3>
      {dairy.care.map((c) => (
        <div key={c.id} className="scheme-card">
          <h3>{c.title[lang] || c.title.en}</h3>
          <p>{c.text[lang] || c.text.en}</p>
        </div>
      ))}

      <h3 className="section-h">⚠️ {t('diseases_title')}</h3>
      {dairy.diseases.map((d) => (
        <div key={d.id} className="scheme-card" style={{ borderLeftColor: '#e65100' }}>
          <h3>{d.name[lang] || d.name.en}</h3>
          <p><b>{t('signs')}:</b> {d.signs[lang] || d.signs.en}</p>
          {d.action && <p><b>{t('what_to_do')}:</b> {d.action[lang] || d.action.en}</p>}
        </div>
      ))}

      <p className="disclaimer">{t('dairy_disclaimer')}</p>
      <p className="source-note">📚 {t('data_source')}: General ICAR / animal husbandry guidance</p>
    </div>
  )
}
