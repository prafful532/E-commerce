import React, { useState } from 'react';
import { FiHelpCircle, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const QuickHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        title="Quick Help"
      >
        <FiHelpCircle className="h-5 w-5" />
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Help Guide
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    🔐 Admin Access
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Click the "Admin Login" button (bottom left)</li>
                    <li>Or use Login: admin@modernstore.com / admin123</li>
                    <li>Then navigate to /admin or use the navbar menu</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    🤖 Chatbot Features
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Search products: "find headphones"</li>
                    <li>Add to cart/wishlist directly from chat</li>
                    <li>Get recommendations and check availability</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    💰 Payment & Currency
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All prices shown in USD and INR</li>
                    <li>Razorpay integration for Indian market</li>
                    <li>Demo mode when database is offline</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200 text-xs">
                    <strong>Note:</strong> Currently in demo mode. Full functionality requires MongoDB connection.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickHelp;
