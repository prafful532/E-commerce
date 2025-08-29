import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: false, index: true },
  total_amount_usd: { type: Number, required: true },
  total_amount_inr: { type: Number, required: true },
  status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'], default: 'Placed', index: true },
  payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  shipping_address: { type: Object },
  items: [{
    product_id: { type: String },
    quantity: { type: Number, default: 1 },
    size: { type: String },
    color: { type: String },
    price: { type: Number }
  }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('Order', OrderSchema)
