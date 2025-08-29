import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: false, index: true },
  total_amount_usd: { type: Number, required: true },
  total_amount_inr: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending', index: true },
  payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  shipping_address: { type: Object },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('Order', OrderSchema)
