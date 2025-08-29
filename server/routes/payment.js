import express from 'express'
import crypto from 'crypto'
import Order from '../models/Order.js'
import { requireAuth } from '../middleware/auth.js'
import QRCode from 'qrcode'
import Razorpay from 'razorpay'
import Stripe from 'stripe'

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
    if (!orderId) {
      return res.json({ success: false, error: 'orderId required' })
    }

    const inr = Math.max(0, Math.round(Number(amount) || 0))
    const pa = (vpa || process.env.UPI_VPA || process.env.VITE_UPI_VPA || '').trim()
    const pn = (payeeName || process.env.UPI_PAYEE_NAME || process.env.VITE_UPI_PAYEE_NAME || 'Merchant').trim()

    const finalPa = pa || '7878606937@ibl'

    const params = new URLSearchParams({ pa: finalPa, pn, am: String(inr), tn: note || `Order ${orderId}`, cu: 'INR', tr: String(orderId) })
    const upiLink = `upi://pay?${params.toString()}`

    const qrCode = await QRCode.toDataURL(upiLink, { errorCorrectionLevel: 'M', margin: 1, width: 512 })
    const paymentId = 'pay_' + crypto.randomBytes(6).toString('hex')

    res.json({ success: true, data: { qrCode, amount: { inr }, paymentId, upiLink } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to generate QR' })
  }
})

router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount } = req.body || {}
    const inr = Math.max(1, Math.round(Number(amount) || 0))
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) return res.json({ success: false, error: 'Razorpay not configured' })

    const rp = new Razorpay({ key_id, key_secret })
    const order = await rp.orders.create({ amount: inr * 100, currency: 'INR', receipt: 'rcpt_' + Date.now() })
    res.json({ success: true, data: { order, key_id } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create Razorpay order' })
  }
})

router.post('/stripe/checkout', async (req, res) => {
  try {
    const { amount, successUrl, cancelUrl } = req.body || {}
    const inr = Math.max(1, Math.round(Number(amount) || 0))
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) return res.json({ success: false, error: 'Stripe not configured' })

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })
    const origin = req.headers.origin || 'http://localhost:5173'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: 'Store Order' },
            unit_amount: inr * 100,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${origin}/checkout?paid=1`,
      cancel_url: cancelUrl || `${origin}/checkout?canceled=1`,
    })

    res.json({ success: true, data: { url: session.url } })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create Stripe session' })
  }
})

export default router
