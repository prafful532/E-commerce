const express = require('express');
const Product = require('../models/Product');
const { convertProductPrices } = require('../utils/currency');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      trending,
      new: isNew
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let filter = { isActive: true };
    let sort = {};

    // Apply filters
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) {
      filter.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      filter['price.inr'] = {};
      if (minPrice) filter['price.inr'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.inr'].$lte = parseFloat(maxPrice);
    }
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    if (isNew === 'true') filter.isNewProduct = true;

    // Apply sorting
    if (sortBy === 'price') {
      sort['price.inr'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('title price originalPrice category brand image rating stock isNewProduct isTrending isFeatured')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find({ category, isActive: true })
        .select('title price originalPrice brand image rating stock isNewProduct isTrending')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments({ category, isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        products,
        category,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({ message: 'Failed to fetch category products' });
  }
});

module.exports = router;
