const express = require('express');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const { convertProductPrices } = require('../utils/currency');

const router = express.Router();

/**
 * MCP Route: Add product to cart via chatbot
 * POST /api/mcp/cart/add
 */
router.post('/cart/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if item already exists in cart
    const existingCartItem = user.cart.find(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        size,
        color
      });
    }

    await user.save();

    // Convert prices for response
    const productWithPrices = await convertProductPrices(product.toObject());

    res.json({
      success: true,
      message: `Added ${product.title} to cart`,
      data: {
        product: productWithPrices,
        quantity,
        size,
        color,
        cartTotal: user.cart.length
      }
    });

  } catch (error) {
    console.error('MCP Cart Add Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add product to cart' 
    });
  }
});

/**
 * MCP Route: Add product to wishlist via chatbot
 * POST /api/mcp/wishlist/add
 */
router.post('/wishlist/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product already in wishlist' 
      });
    }

    user.wishlist.push(productId);
    await user.save();

    // Convert prices for response
    const productWithPrices = await convertProductPrices(product.toObject());

    res.json({
      success: true,
      message: `Added ${product.title} to wishlist`,
      data: {
        product: productWithPrices,
        wishlistTotal: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('MCP Wishlist Add Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add product to wishlist' 
    });
  }
});

/**
 * MCP Route: Search products for chatbot suggestions
 * GET /api/mcp/products/search
 */
router.get('/products/search', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice, 
      inStock = true, 
      limit = 5 
    } = req.query;

    let searchFilter = {};

    // Text search
    if (query) {
      searchFilter.$text = { $search: query };
    }

    // Category filter
    if (category) {
      searchFilter.category = category;
    }

    // Price filter (assuming USD prices for search)
    if (minPrice || maxPrice) {
      searchFilter['price.usd'] = {};
      if (minPrice) searchFilter['price.usd'].$gte = parseFloat(minPrice);
      if (maxPrice) searchFilter['price.usd'].$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      searchFilter.stock = { $gt: 0 };
    }

    // Active products only
    searchFilter.isActive = true;

    const products = await Product.find(searchFilter)
      .select('title description price category brand image stock rating isNewProduct isTrending')
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    // Convert prices for all products
    const productsWithPrices = await Promise.all(
      products.map(product => convertProductPrices(product.toObject()))
    );

    res.json({
      success: true,
      count: productsWithPrices.length,
      data: productsWithPrices
    });

  } catch (error) {
    console.error('MCP Product Search Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search products' 
    });
  }
});

/**
 * MCP Route: Check product availability
 * GET /api/mcp/products/:id/availability
 */
router.get('/products/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1, size, color } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const isAvailable = product.stock >= parseInt(quantity) && product.isActive;
    const hasSize = !size || product.sizes.includes(size);
    const hasColor = !color || product.colors.includes(color);

    const productWithPrices = await convertProductPrices(product.toObject());

    res.json({
      success: true,
      data: {
        product: productWithPrices,
        availability: {
          inStock: isAvailable,
          hasRequestedSize: hasSize,
          hasRequestedColor: hasColor,
          availableQuantity: product.stock,
          availableSizes: product.sizes,
          availableColors: product.colors
        }
      }
    });

  } catch (error) {
    console.error('MCP Availability Check Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check product availability' 
    });
  }
});

/**
 * MCP Route: Get personalized recommendations
 * GET /api/mcp/recommendations
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { limit = 5, category } = req.query;
    
    const user = await User.findById(req.user.id).populate('wishlist');
    
    let filter = { isActive: true };
    
    // If user has wishlist, get similar products
    if (user.wishlist.length > 0) {
      const categories = [...new Set(user.wishlist.map(item => item.category))];
      if (!category && categories.length > 0) {
        filter.category = { $in: categories };
      }
    }
    
    if (category) {
      filter.category = category;
    }

    // Exclude products already in wishlist
    if (user.wishlist.length > 0) {
      filter._id = { $nin: user.wishlist.map(item => item._id) };
    }

    const recommendations = await Product.find(filter)
      .select('title description price category brand image stock rating isNewProduct isTrending')
      .sort({ rating: -1, isTrending: -1, createdAt: -1 })
      .limit(parseInt(limit));

    const recommendationsWithPrices = await Promise.all(
      recommendations.map(product => convertProductPrices(product.toObject()))
    );

    res.json({
      success: true,
      count: recommendationsWithPrices.length,
      data: recommendationsWithPrices
    });

  } catch (error) {
    console.error('MCP Recommendations Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get recommendations' 
    });
  }
});

module.exports = router;
