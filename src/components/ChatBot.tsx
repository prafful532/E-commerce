import React, { useState, useContext } from 'react';
import { FiMessageCircle, FiX, FiSend, FiShoppingCart, FiHeart, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  actions?: MessageAction[];
  products?: Product[];
  context?: any;
}

interface MessageAction {
  type: 'add_to_cart' | 'add_to_wishlist' | 'view_product';
  label: string;
  productId?: number;
  data?: any;
}

interface Product {
  id: number;
  title: string;
  price: { usd: number; inr: number };
  image: string;
  category: string;
  stock: number;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI shopping assistant powered by MCP (Model Context Protocol). I can help you find products, add items to your cart or wishlist, get personalized recommendations, and answer questions about our store. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const authContext = useContext(AuthContext);

  // Fetch user context when chat opens
  React.useEffect(() => {
    if (isOpen && authContext?.user && !userContext) {
      fetchUserContext();
    }
  }, [isOpen, authContext?.user]);

  const fetchUserContext = async () => {
    if (!authContext?.token) return;

    try {
      const response = await fetch('/api/mcp/user-context', {
        headers: {
          'Authorization': `Bearer ${authContext.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserContext(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user context:', error);
    }
  };
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await getBotResponse(currentInput);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse.text,
        isBot: true,
        timestamp: new Date(),
        actions: botResponse.actions,
        products: botResponse.products,
        context: botResponse.context,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBotResponse = async (userInput: string): Promise<{ text: string; actions?: MessageAction[]; products?: Product[]; context?: any }> => {
    const input = userInput.toLowerCase();
    
    try {
      // Enhanced AI responses with context awareness
      if (userContext && authContext?.user) {
        // Personalized greeting
        if (input.includes('hello') || input.includes('hi')) {
          const greeting = userContext.user.name ? `Hello ${userContext.user.name}!` : 'Hello!';
          let contextInfo = '';
          
          if (userContext.stats.wishlistCount > 0) {
            contextInfo += ` I see you have ${userContext.stats.wishlistCount} items in your wishlist.`;
          }
          
          if (userContext.preferences.favoriteCategories.length > 0) {
            contextInfo += ` Based on your preferences, you seem to like ${userContext.preferences.favoriteCategories.join(', ')}.`;
          }
          
          return {
            text: `${greeting} Welcome back to ModernStore!${contextInfo} How can I assist you today?`
          };
        }
      }

      // Check for product search queries
      if (input.includes('find') || input.includes('search') || input.includes('looking for') || input.includes('show me')) {
        return await handleSmartSearch(input);
      }
      
      // Check for availability queries
      if (input.includes('available') || input.includes('in stock') || input.includes('stock')) {
        return await handleAvailabilityCheck(input);
      }
      
      // Check for recommendations
      if (input.includes('recommend') || input.includes('suggest') || input.includes('similar')) {
        return await handleAIRecommendations(input);
      }
      
      // Check for personalized queries
      if (input.includes('for me') || input.includes('my style') || input.includes('what should i buy')) {
        return await handlePersonalizedRecommendations();
      }
      
      // Standard responses
      if (input.includes('price') || input.includes('cost')) {
        return {
          text: "I can help you find products within your budget! What's your price range? I can also show you products based on your previous preferences."
        };
      } else if (input.includes('size') || input.includes('sizing')) {
        return {
          text: "For sizing help, I can check what sizes are available for specific products. Just tell me which product you're interested in!"
        };
      } else if (input.includes('delivery') || input.includes('shipping')) {
        return {
          text: "We offer free shipping on orders over ₹4,000! Standard delivery takes 3-5 business days, and express delivery is available for ₹800 (1-2 business days)."
        };
      } else if (input.includes('return') || input.includes('exchange')) {
        return {
          text: "We have a 30-day return policy! Items must be unused and in original packaging. You can initiate returns from your profile page after logging in."
        };
      } else if (input.includes('cart') && input.includes('add')) {
        return {
          text: "I can help you add products to your cart! Just tell me which product you're interested in, and I'll find it for you."
        };
      } else if (input.includes('wishlist') && input.includes('add')) {
        return {
          text: "I can help you add products to your wishlist! Just tell me which product you'd like to save for later."
        };
      } else {
        return {
          text: "I'm your AI shopping assistant! You can ask me to:\n• Find specific products with smart search\n• Get personalized recommendations based on your preferences\n• Check product availability and stock\n• Add products to your cart or wishlist\n• Answer questions about shipping, returns, and policies\n• Help you discover new products you might love\n\nWhat would you like to do?"
        };
      }
    } catch (error) {
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
      };
    }
  };

  const handleSmartSearch = async (query: string): Promise<{ text: string; actions?: MessageAction[]; products?: Product[]; context?: any }> => {
    try {
      // Extract search terms
      let searchQuery = query
        .replace(/find|search|looking for|show me/g, '')
        .trim();

      // Extract category if mentioned
      let category = '';
      if (query.includes('electronic') || query.includes('gadget')) category = 'electronics';
      else if (query.includes('cloth') || query.includes('shirt') || query.includes('jacket')) category = 'clothing';
      else if (query.includes('shoe') || query.includes('sneaker')) category = 'shoes';
      else if (query.includes('accessory') || query.includes('bag') || query.includes('handbag')) category = 'accessories';

      // Determine search intent
      let intent = 'browse';
      if (query.includes('buy') || query.includes('purchase')) intent = 'buy';
      else if (query.includes('compare')) intent = 'compare';

      const response = await fetch(`/api/mcp/smart-search?query=${encodeURIComponent(searchQuery)}&category=${category}&intent=${intent}&limit=3`, {
        headers: authContext?.token ? {
          'Authorization': `Bearer ${authContext.token}`
        } : {}
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const actions: MessageAction[] = data.data.flatMap((product: Product) => [
          {
            type: 'add_to_cart',
            label: `Add ${product.title} to Cart`,
            productId: product.id
          },
          {
            type: 'add_to_wishlist',
            label: `Add ${product.title} to Wishlist`,
            productId: product.id
          }
        ]);

        let contextText = '';
        if (data.insights) {
          contextText = ` Found ${data.insights.totalFound} products in ${data.insights.categories.join(', ')} categories.`;
        }
        return {
          text: `I found ${data.data.length} product(s) for you:${contextText}`,
          actions,
          products: data.data,
          context: data.searchContext
        };
      } else {
        return {
          text: "I couldn't find any products matching your search. Would you like me to suggest some popular items or help you refine your search?"
        };
      }
    } catch (error) {
      // Return demo products for common searches in demo mode
      const demoProducts = [
        {
          id: 1,
          title: 'Premium Wireless Headphones',
          price: { usd: 299.99, inr: 24999 },
          image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
          category: 'electronics',
          stock: 50
        },
        {
          id: 2,
          title: 'Smart Fitness Watch',
          price: { usd: 199.99, inr: 16699 },
          image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
          category: 'electronics',
          stock: 35
        }
      ];

      if (query.includes('headphone') || query.includes('audio') || query.includes('electronic')) {
        const actions: MessageAction[] = demoProducts.flatMap((product: Product) => [
          {
            type: 'add_to_cart',
            label: `Add ${product.title} to Cart`,
            productId: product.id
          },
          {
            type: 'add_to_wishlist',
            label: `Add ${product.title} to Wishlist`,
            productId: product.id
          }
        ]);

        return {
          text: `Here are some products I found (demo mode):`,
          actions,
          products: demoProducts
        };
      }

      return {
        text: "I'm currently in demo mode. Try searching for 'headphones' or 'electronics' to see sample products, or connect to the backend server for full functionality."
      };
    }
  };

  const handleAIRecommendations = async (query: string): Promise<{ text: string; actions?: MessageAction[]; products?: Product[]; context?: any }> => {
    try {
      const token = authContext?.token;
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/mcp/ai-recommendations?query=${encodeURIComponent(query)}&limit=3`, {
        headers
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const actions: MessageAction[] = data.data.flatMap((product: Product) => [
          {
            type: 'add_to_cart',
            label: `Add ${product.title} to Cart`,
            productId: product.id
          },
          {
            type: 'add_to_wishlist',
            label: `Add ${product.title} to Wishlist`,
            productId: product.id
          }
        ]);

        let contextText = '';
        if (data.context) {
          contextText = data.context.basedOn === 'user_preferences' 
            ? ' Based on your preferences and wishlist items:'
            : ' Here are some trending products:';
        }

        return {
          text: `Here are my AI-powered recommendations${contextText}`,
          actions,
          products: data.data,
          context: data.context
        };
      } else {
        return {
          text: "I'd love to give you personalized recommendations! Browse our featured products or tell me what category interests you most."
        };
      }
    } catch (error) {
      return {
        text: "I'm having trouble getting recommendations right now. You can browse our featured products in the meantime!"
      };
    }
  };

  const handlePersonalizedRecommendations = async (): Promise<{ text: string; actions?: MessageAction[]; products?: Product[]; context?: any }> => {
    if (!authContext?.user) {
      return {
        text: "I'd love to give you personalized recommendations! Please log in so I can learn your preferences and suggest products you'll love."
      };
    }

    try {
      const response = await fetch('/api/mcp/ai-recommendations?limit=3', {
        headers: {
          'Authorization': `Bearer ${authContext.token}`
        }
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const actions: MessageAction[] = data.data.flatMap((product: Product) => [
          {
            type: 'add_to_cart',
            label: `Add ${product.title} to Cart`,
            productId: product.id
          },
          {
            type: 'add_to_wishlist',
            label: `Add ${product.title} to Wishlist`,
            productId: product.id
          }
        ]);

        return {
          text: "Based on your shopping history and preferences, here are some products I think you'll love:",
          actions,
          products: data.data
        };
      } else {
        return {
          text: "I'm still learning your preferences! Add some items to your wishlist or make a purchase so I can give you better recommendations."
        };
      }
    } catch (error) {
      return {
        text: "I'm having trouble accessing your preferences right now. Try browsing our featured products!"
      };
    }
  };
  const handleAvailabilityCheck = async (query: string): Promise<{ text: string; actions?: MessageAction[]; products?: Product[] }> => {
    // This is a simplified version - in a real implementation, you'd extract product names from the query
    return {
      text: "To check if a specific product is available, please tell me the exact product name or search for it first, and I'll check the current stock levels for you."
    };
  };


  const handleAction = async (action: MessageAction) => {
    if (!authContext?.user) {
      toast.error('Please log in to use this feature');
      return;
    }

    try {
      if (action.type === 'add_to_cart' && action.productId) {
        const response = await fetch('/api/mcp/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authContext.token}`
          },
          body: JSON.stringify({ productId: action.productId, quantity: 1 })
        });

        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          // Update local cart context
          addToCart(data.data.product, data.data.quantity);
        } else {
          toast.error(data.message);
        }
      } else if (action.type === 'add_to_wishlist' && action.productId) {
        const response = await fetch('/api/mcp/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authContext.token}`
          },
          body: JSON.stringify({ productId: action.productId })
        });

        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          // Update local wishlist context
          addToWishlist(data.data.product);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error('Failed to perform action. Please try again.');
    }
  };

  const formatPrice = (price: { usd: number; inr: number }) => {
    return `₹${price.inr.toLocaleString()} (${price.usd.toFixed(2)} USD)`;
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiMessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Shopping Assistant</h3>
                  <p className="text-xs text-white/80">MCP-Powered</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="max-w-[85%]">
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.isBot
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {message.text}
                    </div>

                    {/* Product Cards */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.products.map((product) => (
                          <div key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                            <div className="flex items-start space-x-3">
                              <img 
                                src={product.image} 
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {product.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatPrice(product.price)}
                                </p>
                                <p className="text-xs text-green-600">
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleAction(action)}
                            className={`px-2 py-1 text-xs rounded ${
                              action.type === 'add_to_cart'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : action.type === 'add_to_wishlist'
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            } transition-colors`}
                          >
                            {action.type === 'add_to_cart' && <FiShoppingCart className="inline h-3 w-3 mr-1" />}
                            {action.type === 'add_to_wishlist' && <FiHeart className="inline h-3 w-3 mr-1" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Context Information */}
                    {message.context && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <em>Search context: {JSON.stringify(message.context)}</em>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder="Ask me anything about products, get recommendations..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
