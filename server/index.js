import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import mongoose from 'mongoose'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import profileRoutes from './routes/profiles.js'
import orderRoutes from './routes/orders.js'
import paymentRoutes from './routes/payment.js'
import Profile from './models/Profile.js'
import bcrypt from 'bcryptjs'
import { eventsHandler } from './events.js'
import { broadcast } from './events.js'


const app = express()
const PORT = process.env.PORT || 5000
const mongoUri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

// Respond to Vite client ping to avoid fetch failures in some environments
app.get('/__vite_ping', (_req, res) => {
  res.status(200).set('Cache-Control', 'no-store').end()
})

if (!mongoUri) {
  console.error('MONGODB_URI not set')
  process.exit(1)
}

async function start() {
  try {
    const connOptions = dbName ? { dbName } : undefined
    await mongoose.connect(mongoUri, connOptions)
    console.log('Connected to MongoDB')

    // Seed admin user if not exists
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    if (email && password) {
      const existing = await Profile.findOne({ email })
      if (!existing) {
        const hash = await bcrypt.hash(password, 10)
        await Profile.create({ email, full_name: 'Administrator', role: 'admin', password_hash: hash })
        console.log('Admin user seeded')
      }
    }

    app.get('/api/health', (_req, res) => {
      res.json({ ok: true })
    })

    app.get('/api/events', eventsHandler)

    app.use('/api/auth', authRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/profiles', profileRoutes)
    app.use('/api/orders', orderRoutes)
    app.use('/api/payment', paymentRoutes)
    app.use('/api/activity', (await import('./routes/activity.js')).default)
    app.use('/api/admin', (await import('./routes/admin.js')).default)

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()
