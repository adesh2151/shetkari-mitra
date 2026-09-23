import { useState } from 'react'
import fert from '../data/fertilizer.json'

const ACRE_TO_HA = 0.4047

export default function FertilizerScreen({ lang, t }) {
  const [cropId, setCropId] = useState(fert.crops[0].id)
  const [area, setArea] = useState('1')
  const [unit, setUnit] = useState('acre')

  const crop = fert.crops.find((c) => c.id === cropId)
  const ha = (Number(area) || 0) * (unit === 'acre' ? ACRE_TO_HA : 1)

  const npk = {
    n: Math.round(crop.n * ha),
    p: Math.round(crop.p * ha),
    k: Math.round(crop.k * ha),
    fym: +(crop.fym * ha).toFixed(1)
  }
  // Straight-fertiliser equivalents (Urea 46% N, DAP 18% N + 46% P, MOP 60% K).
  const dap = Math.round(npk.p / 0.46)
  const ureaFromDap = dap * 0.18
  const urea = Math.max(0, Math.round((npk.n - ureaFromDap) / 0.46))
  const mop = Math.round(npk.k / 0.60)

  return (
    <div className="fert">
      <p className="hint">{t('fert_hint')}</p>

      <label className="field-label">{t('select_crop')}</label>
      <select className="select" value={cropId} onChange={(e) => setCropId(e.target.value)}>
        {fert.crops.map((c) => (
          <option key={c.id} value={c.id}>{c.name[lang] || c.name.en}</option>
        ))}
      </select>

      <label className="field-label">{t('land_area')}</label>
      <div className="area-row">
        <input className="area-input" type="number" min="0" step="0.25"
               value={area} onChange={(e) => setArea(e.target.value)} />
        <select className="select unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="acre">{t('acre')}</option>
          <option value="hectare">{t('hectare')}</option>
        </select>
      </div>

      <div className="fert-result">
        <h3>🧪 {t('chemical_fert')}</h3>
        <div className="npk-row">
          <div className="npk"><span>N</span><b>{npk.n}</b>kg</div>
          <div className="npk"><span>P₂O₅</span><b>{npk.p}</b>kg</div>
          <div className="npk"><span>K₂O</span><b>{npk.k}</b>kg</div>
        </div>
        <p className="fert-straight">
          ≈ {t('urea')}: <b>{urea} kg</b> · {t('dap')}: <b>{dap} kg</b> · {t('mop')}: <b>{mop} kg</b>
        </p>
      </div>

      <div className="fert-result organic">
        <h3>🌿 {t('organic_fert')}</h3>
        <p className="fym-line">{t('fym')}: <b>{npk.fym} {t('tonnes')}</b></p>
        <p>{crop.organic[lang] || crop.organic.en}</p>
      </div>

      <p className="disclaimer">{t('fert_disclaimer')}</p>
    </div>
  )
}
