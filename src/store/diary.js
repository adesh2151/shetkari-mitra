// Farm income/expense diary — stored on-device (no server, works offline).
const KEY = 'sm_diary'

export function getEntries() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch (_) { return [] }
}

export function addEntry(entry) {
  try {
    const list = getEntries()
    list.unshift({ ...entry, id: Date.now(), at: new Date().toISOString() })
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (_) { /* ignore */ }
}

export function deleteEntry(id) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getEntries().filter((e) => e.id !== id)))
  } catch (_) { /* ignore */ }
}

export function totals() {
  const list = getEntries()
  let income = 0, expense = 0
  for (const e of list) {
    if (e.type === 'income') income += Number(e.amount) || 0
    else expense += Number(e.amount) || 0
  }
  return { income, expense, profit: income - expense }
}
