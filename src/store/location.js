// Shared last-used location (village / PIN) so the Home "Today" card and the
// Weather screen agree. Stored on the phone only.
const KEY = 'sm_location'

export function getLocation() {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : null
  } catch (_) { return null }
}

export function saveLocation(loc) {
  try {
    if (loc && loc.lat != null && loc.lon != null) {
      localStorage.setItem(KEY, JSON.stringify(loc))
    }
  } catch (_) { /* ignore */ }
}
