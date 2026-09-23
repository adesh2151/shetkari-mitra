import { useRef, useState } from 'react'
import { classify, getDiseaseInfo, GROUPS } from '../ml/classifier'
import { addHistory } from '../store/history'
import { APK_URL } from '../config'
import ResultCard from './ResultCard'

// Downscale the picked image to a small JPEG data URL for history storage.
function makeThumb(imgEl, size = 160) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgEl, 0, 0, size, size)
    return canvas.toDataURL('image/jpeg', 0.6)
  } catch (_) {
    return null
  }
}

export default function ScanScreen({ lang, t }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [group, setGroup] = useState('field')
  const imgRef = useRef(null)
  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setImageUrl(URL.createObjectURL(file))
    e.target.value = '' // allow re-picking the same file
  }

  async function onDetect() {
    if (!imageUrl || !imgRef.current) {
      alert(t('no_image'))
      return
    }
    setBusy(true)
    setResult(null)
    try {
      // Let the image finish decoding before reading pixels.
      if (!imgRef.current.complete) await imgRef.current.decode().catch(() => {})
      const res = await classify(imgRef.current, group)
      setResult(res)

      const info = getDiseaseInfo(res.classId)
      addHistory({
        classId: res.classId,
        name: info.name?.[lang] || info.name?.en,
        confidence: res.confidence,
        thumb: makeThumb(imgRef.current)
      })
    } catch (err) {
      console.error(err)
      alert(t('no_image'))
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setImageUrl(null)
    setResult(null)
  }

  return (
    <div className="scan">
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
      <input ref={galleryInput} type="file" accept="image/*" hidden onChange={onPick} />

      {!imageUrl && (
        <div className="capture-box">
          <select className="select" value={group} onChange={(e) => setGroup(e.target.value)} style={{ marginBottom: 14 }}>
            {GROUPS.map((g) => <option key={g.id} value={g.id}>{t(g.labelKey)}</option>)}
          </select>
          <div className="leaf-icon" aria-hidden>🌿</div>
          <h2>{t('capture_title')}</h2>
          <p className="hint">{t('capture_hint')}</p>
          <button className="btn primary big" onClick={() => cameraInput.current?.click()}>
            📷 {t('btn_camera')}
          </button>
          <button className="btn ghost" onClick={() => galleryInput.current?.click()}>
            🖼️ {t('btn_gallery')}
          </button>
          <p className="apk-hint">{t('scan_supported')}</p>
          <a className="apk-link" href={APK_URL} target="_blank" rel="noopener">
            📥 {t('download_apk')}
          </a>
          <p className="apk-hint">{t('apk_hint')}</p>
        </div>
      )}

      {imageUrl && (
        <div className="preview">
          <img ref={imgRef} src={imageUrl} alt="leaf" className="preview-img" crossOrigin="anonymous" />
          {!result && !busy && (
            <div className="actions">
              <button className="btn primary big" onClick={onDetect}>🔍 {t('btn_detect')}</button>
              <button className="btn ghost" onClick={reset}>↺ {t('btn_retake')}</button>
            </div>
          )}
          {busy && <div className="spinner-row"><span className="spinner" />{t('analyzing')}</div>}
        </div>
      )}

      {result && <ResultCard result={result} lang={lang} t={t} />}
      {result && (
        <button className="btn ghost full" onClick={reset}>↺ {t('btn_retake')}</button>
      )}
    </div>
  )
}
