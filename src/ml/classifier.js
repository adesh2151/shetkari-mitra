import * as tf from '@tensorflow/tfjs'
import diseases from './diseases.json'

// Where the trained model lives once you add it (Phase 2).
// Put model.json + *.bin + labels.json under: public/model/
const MODEL_URL = 'model/model.json'
const LABELS_URL = 'model/labels.json'
const INPUT_SIZE = 224 // change to match your trained model

let model = null
let labels = null
let modelAvailable = null // null = unknown, true/false once checked

// Try to load the model + labels once. If files are missing we fall back
// to demo mode so the whole app still runs end-to-end.
export async function loadModel(onProgress) {
  if (modelAvailable !== null) return modelAvailable
  try {
    if (onProgress) onProgress()
    const res = await fetch(LABELS_URL)
    if (!res.ok) throw new Error('labels missing')
    labels = await res.json()
    model = await tf.loadLayersModel(MODEL_URL)
    modelAvailable = true
  } catch (_) {
    modelAvailable = false // demo mode
  }
  return modelAvailable
}

// Run prediction on an <img> element. Returns { classId, confidence, isDemo }.
export async function classify(imgEl) {
  await loadModel()

  if (!modelAvailable) return demoResult()

  const logits = tf.tidy(() => {
    const img = tf.browser.fromPixels(imgEl)
      .resizeBilinear([INPUT_SIZE, INPUT_SIZE])
      .toFloat()
      .div(255)
      .expandDims(0)
    return model.predict(img)
  })

  const data = await logits.data()
  logits.dispose()

  let bestIdx = 0
  for (let i = 1; i < data.length; i++) if (data[i] > data[bestIdx]) bestIdx = i

  const classId = labels[bestIdx] ?? 'healthy'
  return {
    classId: diseases[classId] ? classId : 'healthy',
    confidence: data[bestIdx],
    isDemo: false
  }
}

// Sample result used until the real model is dropped in.
function demoResult() {
  const ids = Object.keys(diseases)
  const classId = ids[Math.floor(Math.random() * ids.length)]
  return { classId, confidence: 0.6 + Math.random() * 0.35, isDemo: true }
}

// Look up localized info for a class id.
export function getDiseaseInfo(classId) {
  return diseases[classId] || diseases.healthy
}
