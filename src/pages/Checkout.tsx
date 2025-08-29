import React, { useState } from 'react';
import { FiCreditCard, FiTruck, FiLock, FiSmartphone, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    sameAsShipping: true,
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const shippingCost = totalPrice > 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shippingCost + tax;

  const generateQRCode = async () => {
    try {
      const { default: api } = await import('../lib/api')
      const orderRes = await api.post('/payment/create-order', {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        shippingAddress: shippingData,
        currency: 'INR',
        totalUsd: Number(finalTotal.toFixed(2)),
        totalInr: Math.round(finalTotal * 83)
      })

      if (!orderRes.data?.success) {
        toast.error('Failed to create order')
        return
      }

      const orderId = orderRes.data.data.order._id
      const vpa = (import.meta as any).env.VITE_UPI_VPA || undefined
      const payeeName = (import.meta as any).env.VITE_UPI_PAYEE_NAME || undefined
      const qrRes = await api.post('/payment/generate-qr', {
        orderId,
        amount: Math.round(finalTotal * 83),
        currency: 'INR',
        vpa,
        payeeName,
        note: `Checkout order ${orderId}`
      })

      if (qrRes.data?.success) {
        setQrCodeData(qrRes.data.data)
        setShowQRCode(true)
        toast.success('QR Code generated! Scan to pay.')
      } else {
        toast.error('Failed to generate QR code')
      }
    } catch (error) {
      console.error('QR Code generation error:', error)
      toast.error('Failed to generate QR code')
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'qr_code') {
      await generateQRCode();
    } else {
      // Simulate payment processing
      toast.loading('Processing payment...');
      
      setTimeout(() => {
        toast.dismiss();
        toast.success('Order placed successfully!');
        clearCart();
        // In a real app, redirect to order confirmation
      }, 2000);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: FiCreditCard },
    { id: 'razorpay', name: 'Razorpay', icon: FiSmartphone },
    { id: 'upi', name: 'UPI', icon: FiSmartphone },
    { id: 'qr_code', name: 'QR Code Payment', icon: FiDownload },
    { id: 'cod', name: 'Cash on Delivery', icon: FiTruck },
  ];

  if (showQRCode && qrCodeData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Scan QR Code to Pay
            </h2>
            
            <div className="bg-white p-4 rounded-lg inline-block mb-6">
              <img 
                src={qrCodeData.qrCode} 
                alt="Payment QR Code" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="text-lg">
                <span className="text-gray-600 dark:text-gray-400">Amount: </span>
                <span className="font-bold text-green-600">₹{qrCodeData.amount.inr.toLocaleString()}</span>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Payment ID: {qrCodeData.paymentId}
              </div>
              
              <div className="text-sm text-orange-600 dark:text-orange-400">
                ⏰ Expires in 15 minutes
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                How to Pay:
              </h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                <li>1. Open any UPI app (PhonePe, Paytm, Google Pay, etc.)</li>
                <li>2. Scan the QR code above</li>
                <li>3. Verify the amount: ₹{qrCodeData.amount.inr.toLocaleString()}</li>
                <li>4. Complete the payment</li>
                <li>5. Your order will be confirmed automatically</li>
              </ol>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowQRCode(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back to Payment Options
              </button>
              
              <button
                onClick={() => {
                  // Simulate payment verification
                  toast.success('Payment completed successfully!');
                  clearCart();
                  setShowQRCode(false);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                I've Paid
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FiLock className="mr-2 text-green-500" />
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <Icon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Card Details */}
                {(paymentMethod === 'card' || paymentMethod === 'stripe') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        required
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        required
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        required
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* UPI Details */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* QR Code Payment Info */}
                {paymentMethod === 'qr_code' && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      QR Code Payment
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Click "Place Order" to generate a QR code that you can scan with any UPI app to complete your payment.
                    </p>
                  </div>
                )}
                {/* QR Code for UPI */}
                {paymentMethod === 'upi' && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <div className="w-32 h-32 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">QR Code</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Scan this QR code with your UPI app
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Place Order */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {paymentMethod === 'qr_code' ? 'Generate QR Code' : `Place Order - $${finalTotal.toFixed(2)}`}
                </button>
              </motion.div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                        {item.size && ` • Size: ${item.size}`}
                        {item.color && ` • ${item.color}`}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 dark:border-gray-600 mb-4" />

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Amount in INR</span>
                  <span>₹{Math.round(finalTotal * 83).toLocaleString()}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-600" />
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <FiLock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Secure checkout
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
