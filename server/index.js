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

    // Seed knowledge base from products (first run)
    try {
      const { default: Doc } = await import('./models/Doc.js')
      const { default: Product } = await import('./models/Product.js')
      const count = await Doc.countDocuments({})
      if (count === 0) {
        const prods = await Product.find({ is_active: true }).limit(100).lean()
        await Doc.insertMany(prods.map(p => ({ title: p.title, text: `${p.title}\nCategory: ${p.category || ''}\nDescription: ${p.description || ''}\nPrice (INR): ${p.price_inr ?? ''}\nSKU: ${p.sku || ''}`, source: 'product' })))
        console.log('Seeded knowledge base from products')
      }
    } catch (_) {}

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
    app.use('/api/chat', (await import('./routes/chat.js')).default)
    app.use('/api/knowledge', (await import('./routes/knowledge.js')).default)
    app.use('/api/mcp', (await import('./routes/mcp.js')).default)
    app.use('/api/activity', (await import('./routes/activity.js')).default)
    app.use('/api/admin', (await import('./routes/admin.js')).default)

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()
