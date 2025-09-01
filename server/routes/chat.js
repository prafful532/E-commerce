import express from 'express'
import { z } from 'zod'
import Product from '../models/Product.js'

let OpenAIClient = null
try {
  const mod = await import('openai')
  OpenAIClient = mod.default || mod.OpenAI || mod
} catch (_) {}

const router = express.Router()

async function searchProducts({ query, maxPrice, category, limit = 5 }) {
  const filter = { is_active: true }
  if (query) filter.title = { $regex: query, $options: 'i' }
  if (category) filter.category = { $regex: category, $options: 'i' }

  const products = await Product.find(filter).limit(Math.max(1, Math.min(20, limit))).lean()
  const list = products
    .filter((p) => maxPrice == null || (p.price_inr != null && p.price_inr <= maxPrice))
    .map((p) => ({
      id: String(p._id),
      title: p.title,
      sku: p.sku || null,
      price_inr: p.price_inr,
      price_usd: p.price_usd,
      stock: p.stock ?? 0,
      category: p.category || null,
      image: p.image_url || (Array.isArray(p.images) ? p.images[0] : null),
    }))
  return list.slice(0, limit)
}

async function checkAvailability({ sku, title }) {
  let product = null
  if (sku) product = await Product.findOne({ sku }).lean()
  if (!product && title) product = await Product.findOne({ title: { $regex: title, $options: 'i' } }).lean()
  if (!product) return null
  return {
    id: String(product._id),
    title: product.title,
    sku: product.sku || null,
    stock: product.stock ?? 0,
    price_inr: product.price_inr,
    price_usd: product.price_usd,
    category: product.category || null,
  }
}

const SearchSchema = z.object({
  query: z.string().optional(),
  maxPrice: z.number().optional(),
  category: z.string().optional(),
  limit: z.number().optional(),
})
const AvailabilitySchema = z.object({ sku: z.string().optional(), title: z.string().optional() })

router.post('/', async (req, res) => {
  try {
    const { messages = [] } = req.body || {}

    const apiKey = process.env.OPENAI_API_KEY

    // If OpenAI not configured, do a simple rule-based response using DB
    if (!apiKey || !OpenAIClient) {
      const last = messages[messages.length - 1]?.content || ''
      const m = /under\s*₹?\s*(\d+)/i.exec(last) || /below\s*(\d+)/i.exec(last)
      if (m) {
        const max = Number(m[1])
        const results = await searchProducts({ query: '', maxPrice: max, limit: 5 })
        if (results.length) {
          const lines = results.map((r) => `• ${r.title} — ₹${(r.price_inr || 0).toLocaleString()} (stock: ${r.stock})`).join('\n')
          return res.json({ reply: `Here are some options under ₹${max.toLocaleString()}:\n${lines}`, toolResults: [{ name: 'searchProducts', data: results }] })
        }
        return res.json({ reply: `I couldn't find items under ₹${max}. Try a higher budget or a different category.`, toolResults: [] })
      }
      const skuMatch = /sku\s*[:#-]?\s*([a-z0-9\-]+)/i.exec(last)
      const titleMatch = skuMatch ? null : /(?:have|stock|available)\s+([^?]+)\??/i.exec(last)
      const data = await checkAvailability({ sku: skuMatch?.[1], title: titleMatch?.[1] })
      if (data) {
        return res.json({ reply: `${data.title} — ${data.stock > 0 ? 'In stock' : 'Out of stock'}${data.price_inr ? `, ₹${data.price_inr.toLocaleString()}` : ''}.`, toolResults: [{ name: 'checkAvailability', data }] })
      }
      return res.json({ reply: 'Ask me about availability (by SKU or name) or say "earphones under ₹1500". Configure OPENAI_API_KEY for richer answers.', toolResults: [] })
    }

    const openai = new OpenAIClient({ apiKey })

    // Retrieve store knowledge for grounding (RAG-lite)
    let contextText = ''
    try {
      const { default: Doc } = await import('../models/Doc.js')
      const last = String(messages[messages.length - 1]?.content || '')
      const keywords = last.split(/\s+/).slice(0, 6).map((w)=>w.replace(/[^\w]/g,'')).filter(Boolean).join('|')
      if (keywords) {
        const docs = await Doc.find({ text: { $regex: keywords, $options: 'i' } }).limit(5).lean()
        contextText = docs.map(d => d.text).join('\n---\n').slice(0, 4000)
      }
    } catch (_) {}

    const system = {
      role: 'system',
      content: `You are an ecommerce assistant for ${process.env.STORE_NAME || 'our store'}. Be concise and factual. Use tools to check stock and prices from the database. Currency default is INR. Never invent stock or price.`,
    }

    const preContext = contextText ? [{ role: 'system', content: `Store knowledge to reference:\n${contextText}` }] : []

    const tools = [
      {
        type: 'function',
        function: {
          name: 'searchProducts',
          description: 'Search products by text, category, or max price (INR)',
          parameters: {
            type: 'object',
            properties: { query: { type: 'string' }, maxPrice: { type: 'number' }, category: { type: 'string' }, limit: { type: 'number' } },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'checkAvailability',
          description: 'Check a single product availability/price by SKU or title',
          parameters: { type: 'object', properties: { sku: { type: 'string' }, title: { type: 'string' } } },
        },
      },
    ]

    const first = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [system, ...messages], tools, tool_choice: 'auto', temperature: 0.2 })
    const msg = first.choices?.[0]?.message || {}

    if (msg.tool_calls && msg.tool_calls.length) {
      const toolResults = []
      for (const call of msg.tool_calls) {
        if (call.function?.name === 'searchProducts') {
          const args = JSON.parse(call.function.arguments || '{}')
          const parsed = SearchSchema.safeParse(args)
          const data = parsed.success ? await searchProducts(parsed.data) : []
          toolResults.push({ id: call.id, name: call.function.name, data })
        }
        if (call.function?.name === 'checkAvailability') {
          const args = JSON.parse(call.function.arguments || '{}')
          const parsed = AvailabilitySchema.safeParse(args)
          const data = parsed.success ? await checkAvailability(parsed.data) : null
          toolResults.push({ id: call.id, name: call.function.name, data })
        }
      }
      const toolMessages = toolResults.map((t) => ({ role: 'tool', tool_call_id: t.id, name: t.name, content: JSON.stringify(t.data) }))
      const second = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [system, ...messages, msg, ...toolMessages], temperature: 0.2 })
      return res.json({ reply: second.choices?.[0]?.message?.content || '', toolResults })
    }

    return res.json({ reply: msg.content || '', toolResults: [] })
  } catch (e) {
    console.error('Chat error', e)
    return res.status(500).json({ error: 'Chat error' })
  }
})

export default router
