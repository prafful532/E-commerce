import jwt from 'jsonwebtoken'
import Profile from '../models/Profile.js'

export async function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const secret = process.env.JWT_SECRET || 'prafful'
    const payload = jwt.verify(token, secret)

    const user = await Profile.findById(payload.id)
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })

    req.admin = { id: String(user._id), email: user.email }
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
