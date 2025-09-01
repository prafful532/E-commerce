import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const secret = process.env.JWT_SECRET || 'prafful'
    const payload = jwt.verify(token, secret)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Populate req.user if a valid token is provided, but do not require it
export function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return next()
    const secret = process.env.JWT_SECRET || 'prafful'
    const payload = jwt.verify(token, secret)
    req.user = payload
  } catch (_e) {
    // ignore invalid tokens in optional auth
  } finally {
    next()
  }
}
