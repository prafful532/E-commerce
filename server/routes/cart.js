const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('cart.product', 'title price image stock isActive');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out inactive products
    const activeCartItems = user.cart.filter(item => 
      item.product && item.product.isActive
    );

    res.json({
      success: true,
      data: { cart: activeCartItems }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', auth, async (req, res) => {
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

    await user.save();

    // Populate the cart for response
    await user.populate('cart.product', 'title price image stock');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart: user.cart }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    const user = await User.findById(req.user.id);
    
    const cartItemIndex = user.cart.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity === 0) {
      user.cart.splice(cartItemIndex, 1);
    } else {
      user.cart[cartItemIndex].quantity = quantity;
    }

    await user.save();
    await user.populate('cart.product', 'title price image stock');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: { cart: user.cart }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

/**
 * @route   DELETE /api/cart/remove
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    
    const cartItemIndex = user.cart.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();
    await user.populate('cart.product', 'title price image stock');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: user.cart }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart: [] }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
