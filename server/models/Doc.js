import mongoose from 'mongoose'

const DocSchema = new mongoose.Schema({
  title: { type: String },
  text: { type: String, required: true },
  source: { type: String },
  embedding: { type: [Number], index: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export default mongoose.model('Doc', DocSchema)
