// Simple offline history stored in localStorage. Images are kept as small
// data URLs so results are viewable later without any server.
const KEY = 'sm_history'
const MAX_ITEMS = 30

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (_) {
    return []
  }
}

export function addHistory(entry) {
  try {
    const list = getHistory()
    list.unshift({ ...entry, id: Date.now(), at: new Date().toISOString() })
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)))
  } catch (_) { /* storage full or unavailable — ignore */ }
}

export function clearHistory() {
  try { localStorage.removeItem(KEY) } catch (_) { /* ignore */ }
}
