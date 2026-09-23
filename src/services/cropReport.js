// Price history for the Crop Report — accumulated daily by the GitHub Action
// (scraper/prices_log.py -> public/prices-history.json). Read live from raw
// GitHub so new days show without redeploying; bundled copy as fallback.
const HIST_RAW =
  'https://raw.githubusercontent.com/adesh2151/shetkari-mitra/master/public/prices-history.json'

export async function getPriceHistory() {
  try {
    const r = await fetch(HIST_RAW + '?t=' + Date.now(), { cache: 'no-store' })
    if (r.ok) { const d = await r.json(); if (d && typeof d === 'object') return d }
  } catch (_) { /* offline */ }
  try {
    const r = await fetch(import.meta.env.BASE_URL + 'prices-history.json', { cache: 'no-store' })
    if (r.ok) { const d = await r.json(); if (d && typeof d === 'object') return d }
  } catch (_) { /* ignore */ }
  return {}
}
