// Weather via Open-Meteo — completely free, NO API key required.
// Works anywhere in India (and beyond).

const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'

// Find lat/lon for a place name (city/village/taluka).
export async function geocode(name) {
  const url = `${GEOCODE}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('geocode failed')
  const data = await res.json()
  const r = data.results?.[0]
  if (!r) throw new Error('not found')
  return { lat: r.latitude, lon: r.longitude, name: [r.name, r.admin1].filter(Boolean).join(', ') }
}

// Search places with suggestions. Supports BOTH a 6-digit PIN code and a
// place name, and returns each match's PIN + district + state so the user can
// tell duplicates apart. Uses India Post API (free, no key) first, then
// falls back to Open-Meteo geocoding.
const POST_PIN = 'https://api.postalpincode.in/pincode'
const POST_NAME = 'https://api.postalpincode.in/postoffice'

export async function searchPlaces(query) {
  const q = (query || '').trim()
  if (!q) return []

  // 6-digit PIN -> India Post (reliable for PIN). Resolve one coord for the area.
  if (/^\d{6}$/.test(q)) {
    try {
      const res = await fetch(`${POST_PIN}/${q}`)
      const data = await res.json()
      const offices = data?.[0]?.Status === 'Success' ? (data[0].PostOffice || []) : []
      if (offices.length) {
        const first = offices[0]
        // One geocode for the town/district — used for all offices in this PIN.
        let coord = null
        for (const name of [first.Block, first.District, first.State]) {
          if (!name) continue
          try { coord = await geocode(`${name}, ${first.State}`); break } catch (_) { /* next */ }
        }
        const seen = new Set(); const out = []
        for (const p of offices) {
          const key = `${p.Name}|${p.District}`
          if (seen.has(key)) continue
          seen.add(key)
          out.push({
            id: `${p.Pincode}-${p.Name}`, name: p.District || p.Name,
            district: p.District, state: p.State, pin: p.Pincode,
            lat: coord?.lat, lon: coord?.lon,
            label: `${p.Name}`, sub: `${p.District}, ${p.State} · ${p.Pincode}`
          })
          if (out.length >= 8) break
        }
        return out
      }
    } catch (_) { /* fall through */ }
    return []
  }

  // City / village name -> Open-Meteo geocoding = REAL towns with coordinates,
  // not postal sub-localities. This is what makes city search specific & reliable.
  try {
    const res = await fetch(`${GEOCODE}?name=${encodeURIComponent(q)}&count=10&language=en&format=json`)
    const data = await res.json()
    const results = data.results || []
    // Prefer Indian results, keep original order otherwise.
    results.sort((a, b) => (a.country_code === 'IN' ? -1 : 0) - (b.country_code === 'IN' ? -1 : 0))
    return results.slice(0, 8).map((r, i) => ({
      id: `g-${i}-${r.id}`, name: r.name, district: r.admin2 || '', state: r.admin1 || '',
      pin: '', lat: r.latitude, lon: r.longitude,
      label: r.name, sub: [r.admin2, r.admin1, r.country].filter(Boolean).join(', ')
    }))
  } catch (_) { return [] }
}

// Turn a selected suggestion into coordinates, with fallbacks so it never
// dead-ends on "not found".
export async function resolveCoords(sel) {
  if (sel.lat != null && sel.lon != null) return { lat: sel.lat, lon: sel.lon }
  for (const name of [sel.name, sel.district, sel.state].filter(Boolean)) {
    try { const g = await geocode(`${name}, ${sel.state || ''}`); return { lat: g.lat, lon: g.lon } }
    catch (_) { /* try next */ }
  }
  throw new Error('not found')
}

// Try the device GPS first; caller can fall back to geocode().
export function getGeoPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no geolocation'))
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => reject(e),
      { timeout: 8000, maximumAge: 600000 }
    )
  })
}

export async function getForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 5
  })
  const res = await fetch(`${FORECAST}?${params}`)
  if (!res.ok) throw new Error('forecast failed')
  return res.json()
}

// Irrigation data: evapotranspiration (crop water demand) + rainfall + soil moisture.
export async function getIrrigationData(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    daily: 'et0_fao_evapotranspiration,precipitation_sum,precipitation_probability_max',
    hourly: 'soil_moisture_3_to_9cm',
    timezone: 'auto', forecast_days: 3
  })
  const res = await fetch(`${FORECAST}?${params}`)
  if (!res.ok) throw new Error('irrigation fetch failed')
  const data = await res.json()
  const et0 = data.daily?.et0_fao_evapotranspiration?.[0] ?? 0
  const rain = data.daily?.precipitation_sum?.[0] ?? 0
  const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 0
  // Latest available soil-moisture reading (m3/m3).
  const sm = data.hourly?.soil_moisture_3_to_9cm
  const soil = Array.isArray(sm) ? sm.find((v) => v != null) ?? null : null
  const net = Math.max(0, et0 - rain) // mm of water the crop needs beyond rain
  return { et0, rain, rainProb, soil, net }
}

// WMO weather codes -> simple icon + key for translation.
export function weatherInfo(code) {
  if (code === 0) return { icon: '☀️', key: 'w_clear' }
  if (code <= 2) return { icon: '🌤️', key: 'w_partly' }
  if (code === 3) return { icon: '☁️', key: 'w_cloudy' }
  if (code <= 48) return { icon: '🌫️', key: 'w_fog' }
  if (code <= 67) return { icon: '🌧️', key: 'w_rain' }
  if (code <= 77) return { icon: '🌨️', key: 'w_snow' }
  if (code <= 82) return { icon: '🌧️', key: 'w_showers' }
  if (code <= 99) return { icon: '⛈️', key: 'w_storm' }
  return { icon: '🌡️', key: 'w_unknown' }
}

// Simple, safe farming advice keys based on the forecast (avoid losses).
export function farmAdvice(current, daily) {
  const tips = []
  const rainToday = daily?.precipitation_probability_max?.[0] ?? 0
  const rainSum = daily?.precipitation_sum?.[0] ?? 0
  const tmax = daily?.temperature_2m_max?.[0] ?? current?.temperature_2m ?? 0
  const wind = current?.wind_speed_10m ?? 0

  if (rainToday >= 60 || rainSum >= 5) tips.push('adv_no_spray')
  if (rainToday >= 60) tips.push('adv_hold_irrigation')
  if (rainToday < 20 && tmax >= 35) tips.push('adv_irrigate_evening')
  if (wind >= 25) tips.push('adv_windy_no_spray')
  if (tmax >= 40) tips.push('adv_heat_stress')
  if (tips.length === 0) tips.push('adv_good_day')
  return tips
}
