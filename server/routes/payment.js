import express from 'express'
import crypto from 'crypto'
import Order from '../models/Order.js'
import { requireAuth } from '../middleware/auth.js'
import QRCode from 'qrcode'

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
    const { orderId, amount = 0, currency = 'INR', vpa, payeeName, note } = req.body || {}
    if (!orderId) return res.status(400).json({ success: false, error: 'orderId required' })

    const inr = Math.round(amount)
    const pa = vpa || process.env.UPI_VPA
    const pn = payeeName || process.env.UPI_PAYEE_NAME || 'Merchant'
    if (!pa) return res.status(400).json({ success: false, error: 'UPI VPA not configured' })

    const params = new URLSearchParams({ pa, pn, am: String(inr), tn: note || `Order ${orderId}`, cu: 'INR', tr: String(orderId) })
    const upiLink = `upi://pay?${params.toString()}`

    const qrCode = await QRCode.toDataURL(upiLink, { errorCorrectionLevel: 'M', margin: 1, width: 512 })
    const paymentId = 'pay_' + crypto.randomBytes(6).toString('hex')

    res.json({ success: true, data: { qrCode, amount: { inr }, paymentId, upiLink } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to generate QR' })
  }
})

export default router
