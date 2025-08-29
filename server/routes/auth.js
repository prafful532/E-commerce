import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Profile from '../models/Profile.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const exists = await Profile.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const profile = await Profile.create({ email, full_name, role: 'user' })
    profile.password_hash = hash
    await profile.save()

    const secret = process.env.JWT_SECRET || 'prafful'
    const token = jwt.sign({ id: profile._id, email: profile.email, role: profile.role }, secret, { expiresIn: '7d' })

    res.json({ token, user: { id: profile._id, email: profile.email, full_name: profile.full_name, role: profile.role } })
  } catch (e) {
    res.status(500).json({ error: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const secret = process.env.JWT_SECRET || 'prafful'

    const profile = await Profile.findOne({ email })
    if (!profile || !profile.password_hash) return res.status(400).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, profile.password_hash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: profile._id, email: profile.email, role: profile.role }, secret, { expiresIn: '7d' })
    res.json({ token, user: { id: profile._id, email: profile.email, full_name: profile.full_name || 'User', role: profile.role } })
  } catch (e) {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  const profile = await Profile.findById(req.user.id)
  if (!profile) return res.status(404).json({ error: 'User not found' })
  res.json({ user: { id: profile._id, email: profile.email, full_name: profile.full_name, role: profile.role } })
})

export default router
