import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../lib/api';
import bus from '../lib/events';
import { useWishlist } from '../contexts/WishlistContext';

const Category: React.FC = () => {
  const { category: categoryName } = useParams<{ category: string }>();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [categoryProducts, setProducts] = React.useState<any[]>([])
  const [categoryTitle, setCategoryTitle] = React.useState<string>('')

  const load = React.useCallback(() => {
    if (!categoryName) return
    api.get('/products', { params: { page: 1, pageSize: 200, is_active: true, category: categoryName } }).then(r => {
      const mapped = (r.data.data || []).map((p:any)=>({
        id: String(p.id), title: p.title, description: p.description || '',
        image: p.image_url || (p.images && p.images[0]) || 'https://via.placeholder.com/600x600?text=Product',
        brand: p.brand || 'Brand', price: Number(p.price_inr), originalPrice: p.original_price_inr ? Number(p.original_price_inr) : undefined,
        rating: { rate: Number(p.rating_average||0), count: Number(p.rating_count||0) }, category: p.category || 'general'
      }))
      setProducts(mapped)
      setCategoryTitle(categoryName)
    })
  }, [categoryName])

  React.useEffect(()=>{ load() }, [load])
  React.useEffect(()=> bus.on('products.updated', load), [load])

  if (!categoryName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Category not found</h1>
          <Link to="/collections" className="text-blue-600 hover:underline">Browse all collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to="/collections" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Collections</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 dark:text-white capitalize">{categoryTitle}</span></li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Discover our premium {category.name.toLowerCase()} collection
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
        </div>

        {/* Products Count */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            {categoryProducts.length} products in {categoryTitle}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                
                <button
                  onClick={() => addToWishlist(product)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <FiHeart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>

                {product.originalPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </div>
                )}

                {product.isNew && (
                  <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    NEW
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <div className="flex items-center">
                    <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                      {product.rating.rate}
                    </span>
                  </div>
                </div>

                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center space-x-2 mb-3">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-500 line-through text-sm">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {product.features.slice(0, 2).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/product/${product.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {categoryProducts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              No products found in this category
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back soon for new arrivals!
            </p>
            <Link
              to="/collections"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
