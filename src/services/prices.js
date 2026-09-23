// Mandi (market) prices via data.gov.in Agmarknet resource.
// Covers ALL commodities across ALL Indian states. Needs a free API key
// (a shared demo key is set in config.js by default).
import { DATA_GOV_API_KEY, MANDI_RESOURCE_ID, DEFAULT_STATE } from '../config'

const BASE = 'https://api.data.gov.in/resource'

// Fetch latest prices. All filters optional — omit for a broad list.
export async function getMandiPrices({ state = DEFAULT_STATE, commodity = '', limit = 30 } = {}) {
  const params = new URLSearchParams({
    'api-key': DATA_GOV_API_KEY,
    format: 'json',
    limit: String(limit),
    offset: '0'
  })
  if (state) params.set('filters[state.keyword]', state)
  if (commodity) params.set('filters[commodity]', commodity)

  const res = await fetch(`${BASE}/${MANDI_RESOURCE_ID}?${params}`)
  if (!res.ok) throw new Error('price fetch failed (' + res.status + ')')
  const data = await res.json()

  // Normalise records (field names vary slightly across the dataset).
  return (data.records || []).map((r) => ({
    commodity: r.commodity,
    variety: r.variety,
    market: r.market,
    district: r.district,
    state: r.state,
    min: Number(r.min_price),
    max: Number(r.max_price),
    modal: Number(r.modal_price),
    date: r.arrival_date
  }))
}
