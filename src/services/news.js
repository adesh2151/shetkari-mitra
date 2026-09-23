// Daily agri news + Government Resolutions (GRs).
// The news.yml GitHub Action refreshes public/news.json on a schedule.
// The app reads the LATEST file live from raw GitHub (so new items show
// without a full Pages rebuild), then falls back to the bundled copy,
// then to the last good cache when offline.

const RAW_URL =
  'https://raw.githubusercontent.com/adesh2151/shetkari-mitra/master/public/news.json'
const CACHE_KEY = 'sm_news_cache'

export async function getNews() {
  // 1) live raw file — fresh, updates without redeploying the app
  try {
    const res = await fetch(RAW_URL + '?t=' + Date.now(), { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) { cacheNews(data); return data }
    }
  } catch (_) { /* offline / blocked — fall through */ }

  // 2) copy bundled into this build
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'news.json', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch (_) { /* ignore */ }

  // 3) last good cache
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (_) { /* ignore */ }

  return []
}

function cacheNews(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch (_) { /* ignore */ }
}
