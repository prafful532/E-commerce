import express from 'express'
import Profile from '../models/Profile.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/me', requireAuth, async (req, res) => {
  try {
    const prof = await Profile.findById(req.user.id).lean()
    if (!prof) return res.status(404).json({ error: 'User not found' })
    const { _id, email, full_name, role, phone, address, avatar_url, created_at } = prof
    res.json({ data: { id: String(_id), email, full_name, role, phone: phone || '', address: address || null, avatar_url: avatar_url || null, created_at } })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', role = '' } = req.query
    const p = Math.max(parseInt(page), 1)
    const ps = Math.max(parseInt(pageSize), 1)

    const filter = { }
    if (role) filter.role = role
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const [raw, total] = await Promise.all([
      Profile.find(filter).sort({ created_at: -1 }).skip((p - 1) * ps).limit(ps).lean(),
      Profile.countDocuments(filter)
    ])
    const items = raw.map(u => ({ id: String(u._id), ...u }))
    res.json({ data: items, total })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    await Profile.findByIdAndUpdate(id, { ...updates }, { new: true })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router
