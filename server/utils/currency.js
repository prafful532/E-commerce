const axios = require('axios');

// Default exchange rate if API fails
const DEFAULT_USD_TO_INR = 83;

/**
 * Get current USD to INR exchange rate
 * @returns {Promise<number>} Exchange rate
 */
const getExchangeRate = async () => {
  try {
    // Using a free currency API
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    return response.data.rates.INR || DEFAULT_USD_TO_INR;
  } catch (error) {
    console.warn('Failed to fetch exchange rate, using default:', error.message);
    return DEFAULT_USD_TO_INR;
  }
};

/**
 * Convert USD to INR
 * @param {number} usdAmount - Amount in USD
 * @param {number} exchangeRate - Optional exchange rate
 * @returns {Promise<number>} Amount in INR
 */
const convertUSDToINR = async (usdAmount, exchangeRate = null) => {
  const rate = exchangeRate || await getExchangeRate();
  return Math.round(usdAmount * rate * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert INR to USD
 * @param {number} inrAmount - Amount in INR
 * @param {number} exchangeRate - Optional exchange rate
 * @returns {Promise<number>} Amount in USD
 */
const convertINRToUSD = async (inrAmount, exchangeRate = null) => {
  const rate = exchangeRate || await getExchangeRate();
  return Math.round((inrAmount / rate) * 100) / 100; // Round to 2 decimal places
};

/**
 * Format currency based on type
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency type ('USD' or 'INR')
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'INR') => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }
};

/**
 * Convert product prices to include both USD and INR
 * @param {Object} product - Product object
 * @param {number} exchangeRate - Optional exchange rate
 * @returns {Promise<Object>} Product with both currency prices
 */
const convertProductPrices = async (product, exchangeRate = null) => {
  const rate = exchangeRate || await getExchangeRate();
  
  const updatedProduct = { ...product };
  
  // Convert main price
  if (typeof product.price === 'number') {
    updatedProduct.price = {
      usd: product.price,
      inr: await convertUSDToINR(product.price, rate)
    };
  }
  
  // Convert original price if exists
  if (product.originalPrice && typeof product.originalPrice === 'number') {
    updatedProduct.originalPrice = {
      usd: product.originalPrice,
      inr: await convertUSDToINR(product.originalPrice, rate)
    };
  }
  
  return updatedProduct;
};

module.exports = {
  getExchangeRate,
  convertUSDToINR,
  convertINRToUSD,
  formatCurrency,
  convertProductPrices,
  DEFAULT_USD_TO_INR
};
