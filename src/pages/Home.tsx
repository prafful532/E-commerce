import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Product3D from '../components/Product3D';
import api from '../lib/api';
import bus from '../lib/events';

const mapProduct = (p: any) => ({
  id: String(p.id),
  title: p.title,
  price: Number(p.price_inr),
  originalPrice: p.original_price_inr ? Number(p.original_price_inr) : undefined,
  image: p.image_url || (p.images && p.images[0]) || 'https://via.placeholder.com/600x600?text=Product',
  rating: { rate: Number(p.rating_average || 0), count: Number(p.rating_count || 0) },
})

const Home: React.FC = () => {
  const [featuredProducts, setFeatured] = React.useState<any[]>([])
  const [trendingProducts, setTrending] = React.useState<any[]>([])
  const [newProducts, setNew] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])

  const load = React.useCallback(() => {
    api.get('/products', { params: { is_active: true, is_featured: true, page: 1, pageSize: 8 } }).then(r=> setFeatured((r.data.data||[]).map(mapProduct)))
    api.get('/products', { params: { is_active: true, is_trending: true, page: 1, pageSize: 8 } }).then(r=> setTrending((r.data.data||[]).map(mapProduct)))
    api.get('/products', { params: { is_active: true, is_new: true, page: 1, pageSize: 8 } }).then(r=> setNew((r.data.data||[]).map(mapProduct)))
    api.get('/products/categories').then(r => setCategories(r.data.data || []))
  }, [])

  React.useEffect(() => { load(); }, [load])
  React.useEffect(() => bus.on('products.updated', load), [load])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNCIgZmlsbC1ydWxlPSJub256ZXJvIj48cGF0aCBkPSJtMzYgMzQgNi0yIGMzIDAgNSAzIDUgNnMtMiA2LTUgNmwtNi0yem0yNSA1Yy0zIDAtNC0xLTUtNGgtMmMxIDMgMiA0IDUgNGgyek0xIDFoNHY0SDF6bTM2IDBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Discover
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Modern Living
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Experience the future of shopping with our curated collection of premium products, 
              featuring cutting-edge 3D visualization and seamless user experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/collections"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
              >
                Shop Collection
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto">
              <Product3D productType="electronics" color="#3B82F6" />
            </div>
            <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              25% OFF
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our diverse collection of premium products across multiple categories
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category: any, index: number) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="group block bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="aspect-square mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count} products
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiTrendingUp className="mr-3 text-green-500" />
                Trending Now
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                The most popular products our customers love
              </p>
            </div>
            <Link
              to="/collections"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center"
            >
              View All
              <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-600 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.originalPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating.rate)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          ({product.rating.count})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-gray-500 line-through text-sm">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              New Arrivals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fresh products just added to our collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                    <div className="aspect-[4/3] bg-white dark:bg-gray-600 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        NEW
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mt-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                            {product.rating.rate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their shopping experience 
              with our innovative platform and premium products.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 group"
            >
              Start Shopping
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
