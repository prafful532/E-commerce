import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true, unique: true },
  full_name: { type: String },
  avatar_url: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  phone: { type: String },
  address: { type: Object },
  password_hash: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: true })

export default mongoose.model('Profile', ProfileSchema)
