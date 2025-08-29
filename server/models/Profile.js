import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true, unique: true },
  full_name: { type: String },
  avatar_url: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  phone: { type: String },
  address: { type: Object },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('Profile', ProfileSchema)
