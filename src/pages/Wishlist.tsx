import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

const Wishlist: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: any) => {
    addToCart(item);
    removeFromWishlist(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FiHeart className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save items you're interested in to your wishlist.
          </p>
          <Link
            to="/collections"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Wishlist</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {item.category}
                </span>
                
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>

                <p className="font-bold text-blue-600 dark:text-blue-400 text-lg mb-4">
                  ${item.price}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-2 h-4 w-4" />
                    Move to Cart
                  </button>
                  
                  <Link
                    to={`/product/${item.id}`}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/collections"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Continue Shopping
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;