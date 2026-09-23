import * as tf from '@tensorflow/tfjs'
import diseases from './diseases.json'

const INPUT_SIZE = 224

// Each group is a separately trained model in its own folder under public/.
// Add a new crop here after training + converting its model.
export const GROUPS = [
  { id: 'field', dir: 'model', labelKey: 'group_field' },        // tomato/potato/grape/chilli
  { id: 'sugarcane', dir: 'model/sugarcane', labelKey: 'group_sugarcane' }
]

const cache = {} // groupId -> { model, labels, available }

function groupById(id) {
  return GROUPS.find((g) => g.id === id) || GROUPS[0]
}

async function loadGroup(groupId, onProgress) {
  if (cache[groupId]) return cache[groupId]
  const g = groupById(groupId)
  const entry = { model: null, labels: null, available: false }
  try {
    if (onProgress) onProgress()
    const res = await fetch(`${g.dir}/labels.json`)
    if (!res.ok) throw new Error('labels missing')
    entry.labels = await res.json()
    entry.model = await tf.loadLayersModel(`${g.dir}/model.json`)
    entry.available = true
  } catch (_) {
    entry.available = false // demo mode for this group
  }
  cache[groupId] = entry
  return entry
}

export async function classify(imgEl, groupId = 'field') {
  const entry = await loadGroup(groupId)
  if (!entry.available) return demoResult(groupId)

  const logits = tf.tidy(() => {
    const img = tf.browser.fromPixels(imgEl)
      .resizeBilinear([INPUT_SIZE, INPUT_SIZE])
      .toFloat().div(255).expandDims(0)
    return entry.model.predict(img)
  })
  const data = await logits.data()
  logits.dispose()

  let best = 0
  for (let i = 1; i < data.length; i++) if (data[i] > data[best]) best = i
  const classId = entry.labels[best] ?? 'healthy'
  return {
    classId: diseases[classId] ? classId : 'healthy',
    confidence: data[best],
    isDemo: false
  }
}

// Sample result until a group's real model is installed.
function demoResult(groupId) {
  const prefix = groupId === 'sugarcane' ? 'sugarcane_' : ''
  const ids = Object.keys(diseases).filter((k) => (prefix ? k.startsWith(prefix) : true))
  const pool = ids.length ? ids : Object.keys(diseases)
  const classId = pool[Math.floor(Math.random() * pool.length)]
  return { classId, confidence: 0.6 + Math.random() * 0.35, isDemo: true }
}

export function getDiseaseInfo(classId) {
  return diseases[classId] || diseases.healthy
}
