const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { convertProductPrices, getExchangeRate } = require('../utils/currency');

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Admin
 */
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      topProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalAmount.inr' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'title image')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.find({ stock: { $lt: 10 }, isActive: true })
        .select('title stock category')
        .limit(10),
      Product.find({ isActive: true })
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .select('title rating price category')
        .limit(5)
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalUsers,
          totalOrders,
          totalRevenue: revenue
        },
        recentOrders,
        lowStockProducts,
        topProducts
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

/**
 * @route   GET /api/admin/products
 * @desc    Get all products with pagination
 * @access  Admin
 */
router.get('/products', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    let filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('title price category brand stock isActive rating createdAt sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Admin
 */
router.post('/products', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      category,
      brand,
      image,
      images,
      colors,
      sizes,
      features,
      stock,
      tags,
      isNewProduct,
      isTrending,
      isFeatured
    } = req.body;

    // Generate SKU
    const sku = `${category.toUpperCase()}-${Date.now()}`;

    // Get current exchange rate
    const exchangeRate = await getExchangeRate();

    const product = new Product({
      title,
      description,
      price: {
        usd: price,
        inr: Math.round(price * exchangeRate)
      },
      originalPrice: originalPrice ? {
        usd: originalPrice,
        inr: Math.round(originalPrice * exchangeRate)
      } : undefined,
      category,
      brand,
      image,
      images: images || [],
      colors: colors || [],
      sizes: sizes || [],
      features: features || [],
      stock,
      tags: tags || [],
      sku,
      isNewProduct: isNewProduct || false,
      isTrending: isTrending || false,
      isFeatured: isFeatured || false
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If price is being updated, update INR price as well
    if (updateData.price) {
      const exchangeRate = await getExchangeRate();
      updateData.price = {
        usd: updateData.price,
        inr: Math.round(updateData.price * exchangeRate)
      };
    }

    if (updateData.originalPrice) {
      const exchangeRate = await getExchangeRate();
      updateData.originalPrice = {
        usd: updateData.originalPrice,
        inr: Math.round(updateData.originalPrice * exchangeRate)
      };
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product (soft delete)
 * @access  Admin
 */
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with pagination
 * @access  Admin
 */
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    let filter = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('items.product', 'title image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
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
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Admin
 */
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'delivered') {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Admin
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone createdAt isEmailVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Admin
 */
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      salesData,
      categoryData,
      orderStatusData
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            isPaid: true
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            sales: { $sum: "$totalAmount.inr" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalStock: { $sum: "$stock" }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        categoryData,
        orderStatusData
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
