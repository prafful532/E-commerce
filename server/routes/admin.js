import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Profile from '../models/Profile.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = express.Router()

// Seed safeguard at runtime if needed
async function ensureAdminSeed() {
  const email = process.env.ADMIN_EMAIL || 'sharmaprafful721@gmail.com'
  const password = process.env.ADMIN_PASSWORD || 'prafful_213'
  let admin = await Profile.findOne({ email })
  if (!admin) {
    const hash = await bcrypt.hash(password, 10)
    admin = await Profile.create({ email, full_name: 'Administrator', role: 'admin', password_hash: hash })
  }
  return admin
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const expectedEmail = process.env.ADMIN_EMAIL || 'sharmaprafful721@gmail.com'
    if (!email || !password || email !== expectedEmail) return res.status(401).json({ error: 'Invalid credentials' })

    await ensureAdminSeed()
    const admin = await Profile.findOne({ email: expectedEmail })
    if (!admin || admin.role !== 'admin' || !admin.password_hash) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, admin.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const secret = process.env.JWT_SECRET || 'prafful'
    const token = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, secret, { expiresIn: '7d' })
    res.json({ success: true, token, message: 'Admin login successful' })
  } catch (e) {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/dashboard', adminAuth, async (_req, res) => {
  try {
    const [users, products, orders] = await Promise.all([
      Profile.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({})
    ])
    const revenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total_amount_inr' } } }])
    const totalRevenue = revenueAgg?.[0]?.total || 0
    res.json({ success: true, data: { users, products, orders, totalRevenue } })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dashboard' })
  }
})

router.get('/users', adminAuth, async (_req, res) => {
  try {
    const users = await Profile.find({}, { email: 1, full_name: 1, created_at: 1, address: 1, role: 1 }).sort({ created_at: -1 }).lean()
    res.json({ success: true, data: users })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.post('/products', adminAuth, async (req, res) => {
  try {
    const body = req.body || {}
    const prod = await Product.create(body)
    res.json({ success: true, data: prod })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    const prod = await Product.findByIdAndUpdate(id, body, { new: true })
    res.json({ success: true, data: prod })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    await Product.findByIdAndDelete(id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

router.get('/orders', adminAuth, async (_req, res) => {
  try {
    const orders = await Order.find({}).sort({ created_at: -1 }).lean()
    const userIds = orders.map(o => o.user_id).filter(Boolean)
    const profiles = await Profile.find({ _id: { $in: userIds } }, { full_name: 1, email: 1 }).lean()
    const map = new Map(profiles.map(p => [String(p._id), p]))
    const data = orders.map(o => ({
      id: String(o._id),
      user: o.user_id ? map.get(String(o.user_id)) : null,
      items: o.items || [],
      shipping_address: o.shipping_address,
      payment_status: o.payment_status,
      status: o.status,
      total_amount_inr: o.total_amount_inr,
      created_at: o.created_at
    }))
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

const ALLOWED_STATUSES = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    await Order.findByIdAndUpdate(id, { status, updated_at: new Date().toISOString() })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router
