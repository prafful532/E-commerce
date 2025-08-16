const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    usd: {
      type: Number,
      required: true
    },
    inr: {
      type: Number,
      required: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  image: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod', 'wallet']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  totalAmount: {
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
  exchangeRate: {
    type: Number,
    default: 83 // USD to INR rate
  },
  shippingPrice: {
    usd: {
      type: Number,
      default: 0
    },
    inr: {
      type: Number,
      default: 0
    }
  },
  taxPrice: {
    usd: {
      type: Number,
      default: 0
    },
    inr: {
      type: Number,
      default: 0
    }
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingNumber: String,
  orderNotes: String,
  cancellationReason: String,
  refundAmount: {
    usd: Number,
    inr: Number
  },
  refundedAt: Date
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentResult.id': 1 });

module.exports = mongoose.model('Order', orderSchema);
