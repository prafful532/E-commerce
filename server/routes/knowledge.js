import express from 'express'
import express from 'express'
import { adminAuth } from '../middleware/adminAuth.js'
import Doc from '../models/Doc.js'
import Product from '../models/Product.js'

let OpenAIClient = null
try {
  const mod = await import('openai')
  OpenAIClient = mod.default || mod.OpenAI || mod
} catch (_) {}

const router = express.Router()

function cosineSim(a = [], b = []) {
  let dot = 0, na = 0, nb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i] }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

async function embed(text) {
  const key = process.env.OPENAI_API_KEY
  if (!OpenAIClient || !key) return null
  const openai = new OpenAIClient({ apiKey: key })
  const r = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text })
  return r.data?.[0]?.embedding || null
}

router.post('/ingest', adminAuth, async (req, res) => {
  try {
    const { docs = [], includeProducts = true } = req.body || {}
    const payloads = []

    if (Array.isArray(docs)) {
      for (const d of docs) {
        if (!d?.text) continue
        payloads.push({ title: d.title || null, text: String(d.text), source: d.source || 'custom' })
      }
    }

    if (includeProducts) {
      const products = await Product.find({ is_active: true }).lean()
      for (const p of products) {
        const text = `${p.title}\nCategory: ${p.category || ''}\nDescription: ${p.description || ''}\nPrice (INR): ${p.price_inr ?? ''}\nSKU: ${p.sku || ''}`
        payloads.push({ title: p.title, text, source: 'product' })
      }
    }

    const results = []
    for (const p of payloads) {
      const embedding = await embed(p.text)
      const doc = await Doc.create({ ...p, embedding })
      results.push({ id: String(doc._id), title: doc.title, source: doc.source })
    }
    res.json({ success: true, data: results })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Ingest failed' })
  }
})

router.get('/search', async (req, res) => {
  try {
    const { q = '', limit = 5 } = req.query
    if (!q) return res.json({ success: true, data: [] })

    const key = process.env.OPENAI_API_KEY
    if (!OpenAIClient || !key) {
      // fallback keyword search
      const items = await Doc.find({ text: { $regex: q, $options: 'i' } }).limit(Number(limit)||5).lean()
      return res.json({ success: true, data: items.map(i => ({ id: String(i._id), title: i.title, text: i.text.slice(0, 500), source: i.source })) })
    }

    const qEmb = await embed(String(q))
    const all = await Doc.find({}).lean()
    const ranked = all.map(d => ({ d, score: cosineSim(qEmb, d.embedding || []) })).sort((a,b)=>b.score-a.score).slice(0, Math.max(1, Math.min(20, Number(limit)||5)))
    res.json({ success: true, data: ranked.map(r => ({ id: String(r.d._id), title: r.d.title, text: r.d.text, score: r.score, source: r.d.source })) })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Search failed' })
  }
})

export default router
