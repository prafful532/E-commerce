import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../lib/api';
import bus from '../lib/events';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import Product3D from '../components/Product3D';

const map = (p: any) => ({
  id: String(p.id),
  title: p.title,
  price: Number(p.price_inr),
  originalPrice: p.original_price_inr ? Number(p.original_price_inr) : undefined,
  description: p.description || '',
  category: p.category || 'general',
  images: (p.images && p.images.length ? p.images : [p.image_url]).filter(Boolean),
  colors: p.colors || [],
  sizes: p.sizes || [],
  features: p.features || [],
  brand: p.brand || 'Brand',
  rating: { rate: Number(p.rating_average || 0), count: Number(p.rating_count || 0) }
})

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const load = () => {
    if (!id) return
    api.get(`/products/${id}`).then(r => setProduct(map(r.data.data)))
  }

  useEffect(load, [id])
  useEffect(() => bus.on('products.updated', load), [id])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h1>
          <Link to="/" className="text-blue-600 hover:underline">Return to home</Link>
        </div>
      </div>
    );
  }

  const relatedProducts: any[] = []

  const handleAddToCart = () => {
    addToCart(product, quantity, { size: selectedSize, color: selectedColor });
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to="/collections" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Collections</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to={`/category/${product.category}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 capitalize">{product.category}</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 dark:text-white">{product.title}</span></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">3D View</h3>
              <Product3D productType={product.category} color="#3B82F6" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating.rate) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {product.rating.rate} ({product.rating.count} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Color</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">-</button>
                <span className="w-16 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">+</button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={handleAddToCart} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <FiShoppingCart className="mr-2" />
                Add to Cart
              </button>
              <button onClick={handleAddToWishlist} className={`px-6 py-4 rounded-lg border-2 transition-all ${
                isInWishlist(product.id)
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-500 text-gray-700 dark:text-gray-300 hover:text-red-600'
              }`}>
                <FiHeart className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <FiTruck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Free Shipping</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">On orders over ₹999</p>
              </div>
              <div className="text-center">
                <FiShield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Warranty</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">1 year coverage</p>
              </div>
              <div className="text-center">
                <FiRotateCcw className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Returns</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <img src={relatedProduct.image} alt={relatedProduct.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{relatedProduct.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 dark:text-blue-400">₹{Number(relatedProduct.price).toLocaleString('en-IN')}</span>
                        <div className="flex items-center">
                          <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{relatedProduct.rating.rate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
