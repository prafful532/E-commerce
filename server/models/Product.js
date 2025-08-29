import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String },
  price_usd: { type: Number, required: true },
  price_inr: { type: Number, required: true },
  original_price_usd: { type: Number },
  original_price_inr: { type: Number },
  category: { type: String, index: true },
  brand: { type: String },
  image_url: { type: String },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  features: [{ type: String }],
  stock: { type: Number, default: 0 },
  rating_average: { type: Number, default: 0 },
  rating_count: { type: Number, default: 0 },
  is_new: { type: Boolean, default: false },
  is_trending: { type: Boolean, default: false },
  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true, index: true },
  sku: { type: String, index: true },
  tags: [{ type: String }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('Product', ProductSchema)
