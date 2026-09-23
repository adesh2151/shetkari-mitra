import { useState } from 'react'
import guide from '../data/cropguide.json'

export default function CropGuideScreen({ lang, t }) {
  const [id, setId] = useState(guide[0].id)
  const crop = guide.find((c) => c.id === id)

  const rows = [
    { icon: '📖', label: t('cg_about'), key: 'about' },
    { icon: '🪨', label: t('cg_soil'), key: 'soil' },
    { icon: '🌡️', label: t('cg_climate'), key: 'climate' },
    { icon: '💧', label: t('cg_water'), key: 'water' },
    { icon: '📏', label: t('cg_spacing'), key: 'spacing' },
    { icon: '📅', label: t('cg_duration'), key: 'duration' }
  ]

  return (
    <div className="cropguide">
      <label className="field-label">{t('select_crop')}</label>
      <select className="select" value={id} onChange={(e) => setId(e.target.value)}>
        {guide.map((c) => <option key={c.id} value={c.id}>{c.name[lang] || c.name.en}</option>)}
      </select>

      <div className="fert-result" style={{ marginTop: 14 }}>
        <h3>{crop.name[lang] || crop.name.en}</h3>
        {rows.map((r) => (
          <div key={r.key} className="cg-row">
            <div className="cg-label">{r.icon} {r.label}</div>
            <div className="cg-val">{crop[r.key]?.[lang] || crop[r.key]?.en}</div>
          </div>
        ))}
      </div>
      <p className="disclaimer">{t('safety_verify')}</p>
    </div>
  )
}
