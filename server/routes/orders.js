import express from 'express'
import Order from '../models/Order.js'
import Profile from '../models/Profile.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status = '' } = req.query
    const p = Math.max(parseInt(page), 1)
    const ps = Math.max(parseInt(pageSize), 1)

    const filter = { }
    if (status) filter.status = status

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ created_at: -1 }).skip((p - 1) * ps).limit(ps).lean(),
      Order.countDocuments(filter)
    ])

    const userIds = items.map(o => o.user_id)
    const profiles = await Profile.find({ _id: { $in: userIds } }).lean()
    const map = new Map(profiles.map(p => [String(p._id), p]))

    const data = items.map(o => ({
      ...o,
      profiles: map.get(String(o.user_id)) ? { full_name: map.get(String(o.user_id)).full_name, email: map.get(String(o.user_id)).email } : undefined
    }))

    res.json({ data, total })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    await Order.findByIdAndUpdate(id, { ...updates }, { new: true })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
