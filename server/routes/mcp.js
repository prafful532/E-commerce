const express = require('express');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { convertProductPrices } = require('../utils/currency');

const router = express.Router();

/**
 * MCP Route: Enhanced AI Chat - Get user context
 * GET /api/mcp/user-context
 */
router.get('/user-context', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'title category price')
      .populate('cart.product', 'title category price');

    const recentOrders = await Order.find({ user: req.user.id })
      .populate('items.product', 'title category')
      .sort({ createdAt: -1 })
      .limit(5);

    // Analyze user preferences
    const preferences = {
      favoriteCategories: [],
      priceRange: { min: 0, max: 1000 },
      recentActivity: []
    };

    // Extract favorite categories from wishlist and orders
    const categoryCount = {};
    
    user.wishlist.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          categoryCount[item.product.category] = (categoryCount[item.product.category] || 0) + 1;
        }
      });
    });

    preferences.favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        },
        preferences,
        stats: {
          wishlistCount: user.wishlist.length,
          cartCount: user.cart.length,
          orderCount: recentOrders.length
        }
      }
    });

  } catch (error) {
    console.error('MCP User Context Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user context' 
    });
  }
});

/**
 * MCP Route: AI-powered product recommendations
 * GET /api/mcp/ai-recommendations
 */
router.get('/ai-recommendations', auth, async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    const user = await User.findById(req.user.id).populate('wishlist');
    
    let filter = { isActive: true };
    
    // AI-like recommendation logic
    if (user.wishlist.length > 0) {
      const categories = [...new Set(user.wishlist.map(item => item.category))];
      const brands = [...new Set(user.wishlist.map(item => item.brand))];
      
      if (query) {
        // Combine user preferences with search query
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $in: categories } },
          { brand: { $in: brands } }
        ];
      } else {
        filter.$or = [
          { category: { $in: categories } },
          { brand: { $in: brands } }
        ];
      }
    } else if (query) {
      filter.$text = { $search: query };
    }

    // Exclude products already in wishlist
    if (user.wishlist.length > 0) {
      filter._id = { $nin: user.wishlist.map(item => item._id) };
    }

    const recommendations = await Product.find(filter)
      .select('title description price category brand image stock rating isNewProduct isTrending')
      .sort({ 
        rating: -1, 
        isTrending: -1, 
        isNewProduct: -1,
        createdAt: -1 
      })
      .limit(parseInt(limit));

    const recommendationsWithPrices = await Promise.all(
      recommendations.map(product => convertProductPrices(product.toObject()))
    );

    res.json({
      success: true,
      count: recommendationsWithPrices.length,
      data: recommendationsWithPrices,
      context: {
        basedOn: user.wishlist.length > 0 ? 'user_preferences' : 'trending',
        query: query || null
      }
    });

  } catch (error) {
    console.error('MCP AI Recommendations Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get AI recommendations' 
    });
  }
});

/**
 * MCP Route: Smart search with context
 * GET /api/mcp/smart-search
 */
router.get('/smart-search', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice, 
      inStock = true, 
      limit = 10,
      intent // 'buy', 'compare', 'browse'
    } = req.query;

    let searchFilter = { isActive: true };
    let sortCriteria = {};

    // Text search with fuzzy matching
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      searchFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: searchTerms } },
        { features: { $elemMatch: { $regex: query, $options: 'i' } } }
      ];
    }

    // Category filter
    if (category) {
      searchFilter.category = category;
    }

    // Price filter (assuming INR prices for search)
    if (minPrice || maxPrice) {
      searchFilter['price.inr'] = {};
      if (minPrice) searchFilter['price.inr'].$gte = parseFloat(minPrice);
      if (maxPrice) searchFilter['price.inr'].$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      searchFilter.stock = { $gt: 0 };
    }

    // Intent-based sorting
    switch (intent) {
      case 'buy':
        sortCriteria = { rating: -1, 'price.inr': 1 }; // Best rated, lowest price first
        break;
      case 'compare':
        sortCriteria = { rating: -1, createdAt: -1 }; // Best rated, newest first
        break;
      case 'browse':
      default:
        sortCriteria = { isTrending: -1, rating: -1, createdAt: -1 };
        break;
    }

    const products = await Product.find(searchFilter)
      .select('title description price originalPrice category brand image stock rating isNewProduct isTrending features')
      .sort(sortCriteria)
      .limit(parseInt(limit));

    // Convert prices for all products
    const productsWithPrices = await Promise.all(
      products.map(product => convertProductPrices(product.toObject()))
    );

    // Add search insights
    const insights = {
      totalFound: productsWithPrices.length,
      priceRange: {
        min: Math.min(...productsWithPrices.map(p => p.price.inr)),
        max: Math.max(...productsWithPrices.map(p => p.price.inr))
      },
      categories: [...new Set(productsWithPrices.map(p => p.category))],
      brands: [...new Set(productsWithPrices.map(p => p.brand))]
    };

    res.json({
      success: true,
      count: productsWithPrices.length,
      data: productsWithPrices,
      insights,
      searchContext: {
        query,
        intent: intent || 'browse',
        filters: { category, minPrice, maxPrice, inStock }
      }
    });

  } catch (error) {
    console.error('MCP Smart Search Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to perform smart search' 
    });
  }
});
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

    // Add notification
    user.notifications.push({
      type: 'system',
      title: 'Added to Cart',
      message: `${product.title} has been added to your cart via AI assistant.`,
      read: false
    });
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
    
    // Add notification
    user.notifications.push({
      type: 'system',
      title: 'Added to Wishlist',
      message: `${product.title} has been added to your wishlist via AI assistant.`,
      read: false
    });
    
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
