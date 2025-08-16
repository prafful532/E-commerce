const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { getExchangeRate } = require('../utils/currency');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

/**
 * @route   POST /api/payment/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const { items, shippingAddress, currency = 'INR' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];
    const exchangeRate = await getExchangeRate();

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}` 
        });
      }

      const itemPrice = currency === 'USD' ? product.price.usd : product.price.inr;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: {
          usd: product.price.usd,
          inr: product.price.inr
        },
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: product.image
      });
    }

    // Add shipping and tax
    const shippingPrice = totalAmount > (currency === 'USD' ? 50 : 4000) ? 0 : (currency === 'USD' ? 10 : 800);
    const taxPrice = Math.round(totalAmount * 0.18); // 18% GST for India
    const finalAmount = totalAmount + shippingPrice + taxPrice;

    // Create order in database
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount: {
        usd: currency === 'USD' ? finalAmount : Math.round(finalAmount / exchangeRate),
        inr: currency === 'INR' ? finalAmount : Math.round(finalAmount * exchangeRate)
      },
      shippingPrice: {
        usd: currency === 'USD' ? shippingPrice : Math.round(shippingPrice / exchangeRate),
        inr: currency === 'INR' ? shippingPrice : Math.round(shippingPrice * exchangeRate)
      },
      taxPrice: {
        usd: currency === 'USD' ? taxPrice : Math.round(taxPrice / exchangeRate),
        inr: currency === 'INR' ? taxPrice : Math.round(taxPrice * exchangeRate)
      },
      currency,
      exchangeRate,
      paymentMethod: 'razorpay'
    });

    await order.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount.inr * 100), // Amount in paise
      currency: 'INR',
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });

    // Update order with Razorpay order ID
    order.paymentResult = {
      id: razorpayOrder.id,
      status: 'created'
    };
    await order.save();

    res.json({
      success: true,
      data: {
        order,
        razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key'
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id 
    } = req.body;

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret');
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update order status
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'processing';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: new Date().toISOString()
    };

    await order.save();

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body, 'utf8')
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        console.log('Webhook signature verification failed');
        return res.status(400).json({ message: 'Invalid signature' });
      }
    }

    const event = JSON.parse(req.body);
    
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({ 'paymentResult.id': payment.order_id });
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'processing';
      order.paymentResult.status = 'captured';
      await order.save();
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
};

const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({ 'paymentResult.id': payment.order_id });
    if (order) {
      order.status = 'cancelled';
      order.paymentResult.status = 'failed';
      await order.save();
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

/**
 * @route   GET /api/payment/orders
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .populate('items.product', 'title image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user.id })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/**
 * @route   GET /api/payment/orders/:id
 * @desc    Get specific order details
 * @access  Private
 */
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('items.product', 'title image brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

/**
 * @route   POST /api/payment/refund
 * @desc    Initiate refund
 * @access  Private
 */
router.post('/refund', auth, async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order is not paid' });
    }

    if (order.status === 'delivered') {
      // Check if within refund window (e.g., 30 days)
      const deliveryDate = new Date(order.deliveredAt);
      const currentDate = new Date();
      const daysDiff = Math.ceil((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 30) {
        return res.status(400).json({ message: 'Refund period has expired' });
      }
    }

    // Create refund with Razorpay
    const refund = await razorpay.payments.refund(order.paymentResult.id, {
      amount: Math.round(order.totalAmount.inr * 100), // Amount in paise
      notes: {
        reason: reason || 'Customer request',
        order_id: orderId
      }
    });

    // Update order
    order.status = 'refunded';
    order.refundAmount = order.totalAmount;
    order.refundedAt = new Date();
    order.cancellationReason = reason;

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: { refund, order }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

module.exports = router;
