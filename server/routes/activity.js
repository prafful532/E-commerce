import express from 'express'
import { broadcast } from '../events.js'

const router = express.Router()

router.post('/', (req, res) => {
  const { type, payload } = req.body || {}
  if (!type) return res.status(400).json({ error: 'type required' })
  broadcast(type, payload || {})
  res.json({ ok: true })
})

export default router
