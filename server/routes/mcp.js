import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import Product from '../models/Product.js'
import Profile from '../models/Profile.js'

const router = express.Router()

router.get('/user-context', requireAuth, async (req, res) => {
  try {
    const u = await Profile.findById(req.user.id).lean()
    res.json({ success: true, data: { user: { id: String(u._id), email: u.email, name: u.full_name || 'User' }, stats: { wishlistCount: 0 }, preferences: { favoriteCategories: [] } } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed' })
  }
})

router.get('/smart-search', async (req, res) => {
  try {
    const { query = '', category = '', limit = 3 } = req.query
    const filter = { is_active: true }
    if (query) filter.title = { $regex: String(query), $options: 'i' }
    if (category) filter.category = { $regex: String(category), $options: 'i' }
    const items = await Product.find(filter).sort({ created_at: -1 }).limit(Number(limit)||3).lean()
    const data = items.map(p => ({ id: String(p._id), title: p.title, price: { usd: p.price_usd, inr: p.price_inr }, image: p.image_url || (Array.isArray(p.images)?p.images[0]:null), category: p.category || '', stock: p.stock ?? 0 }))
    res.json({ success: true, data, searchContext: { query, category }, insights: { totalFound: data.length, categories: [...new Set(data.map(d=>d.category).filter(Boolean))] } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Search failed' })
  }
})

router.get('/ai-recommendations', async (req, res) => {
  try {
    const { query = '', limit = 3 } = req.query
    const filter = { is_active: true }
    if (query) filter.title = { $regex: String(query), $options: 'i' }
    const items = await Product.find(filter).sort({ rating_count: -1, created_at: -1 }).limit(Number(limit)||3).lean()
    const data = items.map(p => ({ id: String(p._id), title: p.title, price: { usd: p.price_usd, inr: p.price_inr }, image: p.image_url || (Array.isArray(p.images)?p.images[0]:null), category: p.category || '', stock: p.stock ?? 0 }))
    res.json({ success: true, data, context: { basedOn: query ? 'query' : 'trending' } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Recommendation failed' })
  }
})

export default router
