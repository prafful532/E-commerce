const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'title price originalPrice image category brand rating stock isActive');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out inactive products
    const activeWishlistItems = user.wishlist.filter(item => item.isActive);

    res.json({
      success: true,
      data: { wishlist: activeWishlistItems }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

/**
 * @route   POST /api/wishlist/add
 * @desc    Add item to wishlist
 * @access  Private
 */
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    // Populate the wishlist for response
    await user.populate('wishlist', 'title price originalPrice image category brand rating stock');

    res.json({
      success: true,
      message: 'Item added to wishlist',
      data: { wishlist: user.wishlist }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add item to wishlist' });
  }
});

/**
 * @route   DELETE /api/wishlist/remove
 * @desc    Remove item from wishlist
 * @access  Private
 */
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    
    const productIndex = user.wishlist.indexOf(productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    user.wishlist.splice(productIndex, 1);
    await user.save();
    await user.populate('wishlist', 'title price originalPrice image category brand rating stock');

    res.json({
      success: true,
      message: 'Item removed from wishlist',
      data: { wishlist: user.wishlist }
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove item from wishlist' });
  }
});

/**
 * @route   DELETE /api/wishlist/clear
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = [];
    await user.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: { wishlist: [] }
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Failed to clear wishlist' });
  }
});

/**
 * @route   POST /api/wishlist/move-to-cart
 * @desc    Move item from wishlist to cart
 * @access  Private
 */
router.post('/move-to-cart', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if product is in wishlist
    const wishlistIndex = user.wishlist.indexOf(productId);
    if (wishlistIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    // Check if item already exists in cart
    const existingCartItem = user.cart.find(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `Cannot add more items. Maximum available: ${product.stock}` 
        });
      }
      existingCartItem.quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        size,
        color
      });
    }

    // Remove from wishlist
    user.wishlist.splice(wishlistIndex, 1);
    
    await user.save();

    // Populate for response
    await user.populate('wishlist', 'title price originalPrice image category brand rating stock');
    await user.populate('cart.product', 'title price image stock');

    res.json({
      success: true,
      message: 'Item moved from wishlist to cart',
      data: { 
        wishlist: user.wishlist,
        cart: user.cart
      }
    });

  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ message: 'Failed to move item to cart' });
  }
});

module.exports = router;
