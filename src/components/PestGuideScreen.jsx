import { useState } from 'react'
import data from '../data/pests.json'

export default function PestGuideScreen({ lang, t }) {
  const crops = []
  const seen = new Set()
  for (const p of data.pests) {
    if (!seen.has(p.crop)) { seen.add(p.crop); crops.push({ id: p.crop, name: p.cropName }) }
  }
  const [crop, setCrop] = useState(crops[0].id)
  const list = data.pests.filter((p) => p.crop === crop)

  return (
    <div className="pests">
      <div className="safety-badge">{t('pesticide_safety_short')}</div>

      <label className="field-label">{t('select_crop')}</label>
      <select className="select" value={crop} onChange={(e) => setCrop(e.target.value)}>
        {crops.map((c) => <option key={c.id} value={c.id}>{c.name[lang] || c.name.en}</option>)}
      </select>

      {list.map((p, i) => (
        <div key={i} className="scheme-card" style={{ borderLeftColor: '#e65100' }}>
          <h3>🐛 {p.pest[lang] || p.pest.en}</h3>
          <p><b>{t('signs')}:</b> {p.symptoms[lang] || p.symptoms.en}</p>
          <p><b>{t('what_to_do')}:</b> {p.control[lang] || p.control.en}</p>
        </div>
      ))}

      <p className="source-note">📚 {t('data_source')}: {data.source.name}</p>
      <p className="disclaimer">{t('safety_verify')}</p>
    </div>
  )
}
