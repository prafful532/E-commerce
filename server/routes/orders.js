import Order from '../models/Order.js'
import Profile from '../models/Profile.js'
import { broadcast } from '../events.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status = '' } = req.query
    const p = Math.max(parseInt(page), 1)
    const ps = Math.max(parseInt(pageSize), 1)

    const filter = { }
    if (status) filter.status = status

    const [raw, total] = await Promise.all([
      Order.find(filter).sort({ created_at: -1 }).skip((p - 1) * ps).limit(ps).lean(),
      Order.countDocuments(filter)
    ])

    const userIds = raw.map(o => o.user_id)
    const profiles = await Profile.find({ _id: { $in: userIds } }).lean()
    const map = new Map(profiles.map(p => [String(p._id), p]))

    const data = raw.map(o => {
      const prof = map.get(String(o.user_id))
      return {
        id: String(o._id),
        ...o,
        profiles: prof ? { full_name: prof.full_name, email: prof.email } : undefined
      }
    })

    res.json({ data, total })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get orders for the currently authenticated user
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    const orders = await Order.find({ user_id: userId }).sort({ created_at: -1 }).lean()
    const data = orders.map(o => ({
      id: String(o._id),
      created_at: o.created_at,
      status: o.status,
      payment_status: o.payment_status,
      total_amount_inr: o.total_amount_inr,
      total_amount_usd: o.total_amount_usd,
      items: o.items || [],
      shipping_address: o.shipping_address || null
    }))
    res.json({ data })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch my orders' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    await Order.findByIdAndUpdate(id, { ...updates }, { new: true })
    broadcast('orders.updated', { id })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
