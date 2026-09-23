import { useState } from 'react'
import { getFarmer, saveFarmer } from '../store/farmer'

// Official govt online services (link-out only — no third-party data access).
const SERVICES = [
  { id: 'farmerid', url: 'https://mhfr.agristack.gov.in/farmer-registry-mh/', icon: '🪪',
    label: { en: 'Farmer ID (AgriStack)', mr: 'फार्मर आयडी (अ‍ॅग्रीस्टॅक)', hi: 'फार्मर आईडी (एग्रीस्टैक)' },
    desc: { en: 'Register or check your 11-digit Farmer ID status.', mr: '११-अंकी फार्मर आयडी नोंदणी / स्थिती तपासा.', hi: '11-अंकीय फार्मर आईडी पंजीकरण / स्थिति देखें.' } },
  { id: 'pmkisan', url: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx', icon: '💸',
    label: { en: 'PM-KISAN status', mr: 'पीएम-किसान स्थिती', hi: 'पीएम-किसान स्थिति' },
    desc: { en: 'Check your installment history & payment status.', mr: 'तुमच्या हप्त्यांची स्थिती व इतिहास पहा.', hi: 'अपनी किस्तों की स्थिति व इतिहास देखें.' } },
  { id: 'mahadbt', url: 'https://mahadbt.maharashtra.gov.in', icon: '🏛️',
    label: { en: 'MahaDBT (subsidies)', mr: 'महाडीबीटी (अनुदान)', hi: 'महाडीबीटी (अनुदान)' },
    desc: { en: 'Apply for equipment, seed & scheme subsidies.', mr: 'अवजारे, बियाणे व योजना अनुदानासाठी अर्ज.', hi: 'उपकरण, बीज व योजना अनुदान हेतु आवेदन.' } },
  { id: 'pmfby', url: 'https://pmfby.gov.in', icon: '🛡️',
    label: { en: 'Crop insurance (PMFBY)', mr: 'पीक विमा (PMFBY)', hi: 'फसल बीमा (PMFBY)' },
    desc: { en: 'Enroll & check crop insurance claims.', mr: 'पीक विमा नोंदणी व दावे तपासा.', hi: 'फसल बीमा पंजीकरण व दावे देखें.' } },
  { id: 'agmarknet', url: 'https://agmarknet.gov.in', icon: '📈',
    label: { en: 'Mandi prices (Agmarknet)', mr: 'बाजारभाव (Agmarknet)', hi: 'मंडी भाव (Agmarknet)' },
    desc: { en: 'Official daily market rates.', mr: 'अधिकृत रोजचे बाजारभाव.', hi: 'आधिकारिक दैनिक बाजार भाव.' } },
  { id: 'soil', url: 'https://soilhealth.dac.gov.in', icon: '🧪',
    label: { en: 'Soil Health Card', mr: 'मृदा आरोग्य पत्रिका', hi: 'मृदा स्वास्थ्य कार्ड' },
    desc: { en: 'Your soil test report & fertilizer advice.', mr: 'माती परीक्षण अहवाल व खत सल्ला.', hi: 'मिट्टी जांच रिपोर्ट व खाद सलाह.' } }
]

export default function GovtServicesScreen({ lang, t }) {
  const [f, setF] = useState(getFarmer())
  const [copied, setCopied] = useState('')
  const [saved, setSaved] = useState(false)

  function update(k, v) { setF({ ...f, [k]: v }); setSaved(false) }
  function save() { saveFarmer(f); setSaved(true) }
  function copy(v) {
    try { navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(''), 1500) } catch (_) { /* ignore */ }
  }

  return (
    <div className="govtseva">
      <p className="hint">{t('gs_hint')}</p>

      <div className="scheme-card">
        <h3>🪪 {t('gs_my_details')}</h3>

        <label className="gs-field"><span>{t('gs_farmer_id')}</span>
          <div className="gs-row">
            <input value={f.farmerId || ''} inputMode="numeric" placeholder="00000000000"
                   onChange={(e) => update('farmerId', e.target.value)} />
            {f.farmerId && <button className="gs-copy" onClick={() => copy(f.farmerId)}>{copied === f.farmerId ? '✓' : t('gs_copy')}</button>}
          </div>
        </label>

        <label className="gs-field"><span>{t('gs_pmkisan_id')}</span>
          <div className="gs-row">
            <input value={f.pmkisanId || ''} placeholder="—"
                   onChange={(e) => update('pmkisanId', e.target.value)} />
            {f.pmkisanId && <button className="gs-copy" onClick={() => copy(f.pmkisanId)}>{copied === f.pmkisanId ? '✓' : t('gs_copy')}</button>}
          </div>
        </label>

        <button className="btn-save" onClick={save}>{saved ? '✓ ' + t('gs_save') : t('gs_save')}</button>
        <p className="disclaimer">🔒 {t('gs_security')}</p>
      </div>

      <p className="gs-note">ℹ️ {t('gs_pmkisan_info')}</p>

      <h3 className="news-section">{t('gs_services')}</h3>
      <ul className="scheme-list">
        {SERVICES.map((s) => (
          <li key={s.id} className="scheme-card">
            <h3>{s.icon} {s.label[lang] || s.label.en}</h3>
            <p>{s.desc[lang] || s.desc.en}</p>
            <a className="scheme-link" href={s.url} target="_blank" rel="noopener">🔗 {t('gs_open')}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
