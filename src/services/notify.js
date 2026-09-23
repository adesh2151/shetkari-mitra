// Local notifications via the browser Notification API — free, no server.
// Used to alert farmers about new schemes/GRs and scheme deadlines.
export async function enableNotify() {
  try {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const p = await Notification.requestPermission()
    return p === 'granted'
  } catch (_) { return false }
}

export function notifyEnabled() {
  try { return 'Notification' in window && Notification.permission === 'granted' }
  catch (_) { return false }
}

export function notify(title, body) {
  try {
    if (notifyEnabled()) {
      new Notification(title, { body, icon: import.meta.env.BASE_URL + 'icons/icon-192.png' })
    }
  } catch (_) { /* ignore */ }
}
