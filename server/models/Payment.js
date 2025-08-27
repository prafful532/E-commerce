const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    usd: {
      type: Number,
      required: true
    },
    inr: {
      type: Number,
      required: true
    }
  },
  currency: {
    type: String,
    enum: ['USD', 'INR'],
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['razorpay', 'upi', 'card', 'qr_code'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  qrCode: {
    data: String,
    expiresAt: Date
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);