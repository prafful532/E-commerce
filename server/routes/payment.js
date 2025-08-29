import express from 'express'
import crypto from 'crypto'
import Order from '../models/Order.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/create-order', async (req, res) => {
  try {
    const { items = [], shippingAddress = {}, currency = 'INR', totalUsd, totalInr } = req.body || {}

    const order = await Order.create({
      user_id: req.user?.id || undefined,
      total_amount_usd: totalUsd ?? 0,
      total_amount_inr: totalInr ?? 0,
      status: 'pending',
      payment_status: 'pending',
      shipping_address: shippingAddress,
    })

    res.json({ success: true, data: { order: { _id: String(order._id) } } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create order' })
  }
})

router.post('/generate-qr', async (req, res) => {
  try {
    const { orderId, amount = 0, currency = 'INR' } = req.body || {}
    if (!orderId) return res.status(400).json({ success: false, error: 'orderId required' })

    const paymentId = 'pay_' + crypto.randomBytes(6).toString('hex')
    const inr = Math.round(amount)

    const info = `ORDER:${orderId}|AMOUNT:${inr}|CUR:${currency}`
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' fill='black'>${info}</text><rect x='24' y='24' width='64' height='64' fill='black'/><rect x='424' y='24' width='64' height='64' fill='black'/><rect x='24' y='424' width='64' height='64' fill='black'/><rect x='424' y='424' width='64' height='64' fill='black'/></svg>`
    const qrCode = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

    res.json({ success: true, data: { qrCode, amount: { inr }, paymentId } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to generate QR' })
  }
})

export default router
