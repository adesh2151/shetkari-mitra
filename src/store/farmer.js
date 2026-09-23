// Farmer's own IDs, saved ON THE PHONE only (for quick copy at the official
// portals). We never fetch or transmit these — govt services are Aadhaar/OTP
// gated with no public API.
const KEY = 'sm_farmer'

export function getFarmer() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {} }
  catch (_) { return {} }
}

export function saveFarmer(f) {
  try { localStorage.setItem(KEY, JSON.stringify(f || {})) } catch (_) { /* ignore */ }
}
