import express from 'express'
import Profile from '../models/Profile.js'

const router = express.Router()

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

    const [items, total] = await Promise.all([
      Profile.find(filter).sort({ created_at: -1 }).skip((p - 1) * ps).limit(ps),
      Profile.countDocuments(filter)
    ])

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
