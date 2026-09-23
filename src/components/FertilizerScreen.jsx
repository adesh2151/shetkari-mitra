import { useState } from 'react'
import fert from '../data/fertilizer.json'

const ACRE_TO_HA = 0.4047

// Nitrogen (urea) split schedule per crop: {d: days after sowing, p: fraction of N}.
// P, K and FYM all go in at basal (day 0).
const SCHED = {
  rice: [{ d: 0, p: 0.5 }, { d: 25, p: 0.25 }, { d: 45, p: 0.25 }],
  wheat: [{ d: 0, p: 0.5 }, { d: 25, p: 0.25 }, { d: 45, p: 0.25 }],
  maize: [{ d: 0, p: 0.4 }, { d: 30, p: 0.3 }, { d: 50, p: 0.3 }],
  sorghum: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  bajra: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  soybean: [{ d: 0, p: 1 }], groundnut: [{ d: 0, p: 1 }], tur: [{ d: 0, p: 1 }],
  gram: [{ d: 0, p: 1 }], moong: [{ d: 0, p: 1 }], urad: [{ d: 0, p: 1 }],
  cotton: [{ d: 0, p: 0.34 }, { d: 40, p: 0.33 }, { d: 80, p: 0.33 }],
  onion: [{ d: 0, p: 0.4 }, { d: 30, p: 0.3 }, { d: 50, p: 0.3 }],
  potato: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  tomato: [{ d: 0, p: 0.4 }, { d: 30, p: 0.3 }, { d: 55, p: 0.3 }],
  chilli: [{ d: 0, p: 0.4 }, { d: 30, p: 0.3 }, { d: 60, p: 0.3 }],
  brinjal: [{ d: 0, p: 0.4 }, { d: 30, p: 0.3 }, { d: 60, p: 0.3 }],
  okra: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  cabbage: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  cauliflower: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  sugarcane: [{ d: 0, p: 0.25 }, { d: 45, p: 0.25 }, { d: 90, p: 0.25 }, { d: 135, p: 0.25 }],
  turmeric: [{ d: 0, p: 0.3 }, { d: 45, p: 0.35 }, { d: 90, p: 0.35 }],
  sunflower: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }],
  mustard: [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }]
}
const DEFAULT_SCHED = [{ d: 0, p: 0.5 }, { d: 30, p: 0.5 }]

// Adjust dose by soil-test level: low soil -> more, high soil -> less.
const SOIL_MULT = { low: 1.25, medium: 1.0, high: 0.6 }

export default function FertilizerScreen({ lang, t }) {
  const [cropId, setCropId] = useState(fert.crops[0].id)
  const [area, setArea] = useState('1')
  const [unit, setUnit] = useState('acre')
  const [useSoil, setUseSoil] = useState(false)
  const [soil, setSoil] = useState({ n: 'medium', p: 'medium', k: 'medium' })

  const crop = fert.crops.find((c) => c.id === cropId)
  const ha = (Number(area) || 0) * (unit === 'acre' ? ACRE_TO_HA : 1)
  const mult = useSoil ? soil : { n: 'medium', p: 'medium', k: 'medium' }

  const npk = {
    n: Math.round(crop.n * ha * SOIL_MULT[mult.n]),
    p: Math.round(crop.p * ha * SOIL_MULT[mult.p]),
    k: Math.round(crop.k * ha * SOIL_MULT[mult.k]),
    fym: +(crop.fym * ha).toFixed(1)
  }
  // Straight-fertiliser equivalents (Urea 46% N, DAP 18% N + 46% P, MOP 60% K).
  const dap = Math.round(npk.p / 0.46)
  const ureaFromDap = dap * 0.18
  const urea = Math.max(0, Math.round((npk.n - ureaFromDap) / 0.46))
  const mop = Math.round(npk.k / 0.60)

  const stages = SCHED[cropId] || DEFAULT_SCHED
  const schedule = stages.map((s) => ({
    day: s.d,
    urea: Math.round(urea * s.p),
    basal: s.d === 0
  }))

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

      <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={useSoil} onChange={(e) => setUseSoil(e.target.checked)} style={{ width: 'auto' }} />
        {t('use_soil_card')}
      </label>
      {useSoil && (
        <div className="soil-grid">
          {['n', 'p', 'k'].map((k) => (
            <div key={k}>
              <span className="soil-label">{k.toUpperCase()}</span>
              <select className="select" value={soil[k]} onChange={(e) => setSoil({ ...soil, [k]: e.target.value })}>
                <option value="low">{t('soil_low')}</option>
                <option value="medium">{t('soil_medium')}</option>
                <option value="high">{t('soil_high')}</option>
              </select>
            </div>
          ))}
        </div>
      )}

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

      <div className="fert-result">
        <h3>📅 {t('schedule_title')}</h3>
        <ul className="sched-list">
          {schedule.map((s, i) => (
            <li key={i} className="sched-item">
              <span className="sched-when">{s.basal ? t('basal') : `${s.day} ${t('days_after')}`}</span>
              <span className="sched-dose">
                {t('urea')}: <b>{s.urea} kg</b>
                {s.basal && ` + ${t('dap')}: ${dap} kg + ${t('mop')}: ${mop} kg + ${t('fym')}: ${npk.fym} ${t('tonnes')}`}
              </span>
            </li>
          ))}
        </ul>
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
