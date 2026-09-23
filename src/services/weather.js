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
