import React, { useState, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { FiCopy, FiSmartphone, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface QRPaymentProps {
  amount: number;
  orderId: string;
  merchantName: string;
  merchantUPI: string;
  customerName: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({
  amount,
  orderId,
  merchantName,
  merchantUPI,
  customerName,
  onPaymentComplete,
  onCancel
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Convert amount to INR (assuming input is in USD)
  const amountINR = Math.round(amount * 83);

  // Generate UPI payment link
  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: merchantUPI, // Payee Address (UPI ID)
      pn: merchantName, // Payee Name
      am: amountINR.toString(), // Amount
      tn: `Payment for Order ${orderId} - ${customerName}`, // Transaction Note
      cu: 'INR', // Currency
      tr: orderId, // Transaction Reference
    });
    return `upi://pay?${params.toString()}`;
  }, [merchantUPI, merchantName, amountINR, orderId, customerName]);

  // Timer countdown
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('QR Code expired. Please try again.');
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyUPILink = async () => {
    try {
      await navigator.clipboard.writeText(upiLink);
      setCopied(true);
      toast.success('UPI link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy UPI link');
    }
  };

  const handlePaymentComplete = () => {
    toast.success('Payment completed successfully!');
    onPaymentComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scan QR Code to Pay
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg">
          <FiClock className="h-4 w-4" />
          <span className="font-mono font-semibold">
            Expires in {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="bg-white p-6 rounded-lg inline-block shadow-md">
          <QRCodeCanvas 
            value={upiLink} 
            size={256} 
            includeMargin={true}
            level="M"
          />
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Merchant:</span>
            <p className="font-semibold text-gray-900 dark:text-white">{merchantName}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
            <p className="font-semibold text-gray-900 dark:text-white">#{orderId}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Customer:</span>
            <p className="font-semibold text-gray-900 dark:text-white">{customerName}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <p className="font-bold text-green-600 text-lg">
              ₹{amountINR.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
          <FiSmartphone className="h-5 w-5 mr-2" />
          How to Pay:
        </h3>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. Open any UPI app (Paytm, Google Pay, PhonePe, BHIM, etc.)</li>
          <li>2. Tap on "Scan QR Code" or "Pay" option</li>
          <li>3. Scan the QR code above with your phone camera</li>
          <li>4. Verify the amount: ₹{amountINR.toLocaleString()}</li>
          <li>5. Enter your UPI PIN to complete payment</li>
          <li>6. Click "I've Paid" below after successful payment</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href={upiLink}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          <FiSmartphone className="h-4 w-4 mr-2" />
          Open UPI App
        </a>

        <button
          onClick={copyUPILink}
          className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
        >
          <FiCopy className="h-4 w-4 mr-2" />
          {copied ? 'Copied!' : 'Copy UPI Link'}
        </button>

        <button
          onClick={handlePaymentComplete}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <FiCheckCircle className="h-4 w-4 mr-2" />
          I've Paid
        </button>
      </div>

      {/* Back Button */}
      <div className="text-center mt-6">
        <button
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
        >
          ← Back to Payment Options
        </button>
      </div>
    </motion.div>
  );
};

export default QRPayment;