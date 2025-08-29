import express from 'express'
import Product from '../models/Product.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', category = '' } = req.query
    const p = Math.max(parseInt(page), 1)
    const ps = Math.max(parseInt(pageSize), 1)

    const filter = { }
    if (category) filter.category = category
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ]
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ created_at: -1 }).skip((p - 1) * ps).limit(ps),
      Product.countDocuments(filter)
    ])

    res.json({ data: items, total })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    await Product.findByIdAndUpdate(id, { ...updates }, { new: true })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

export default router
