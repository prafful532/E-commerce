# ModernStore - E-commerce Platform with MCP-Powered Chatbot

A full-stack e-commerce platform built with React, TypeScript, Express.js, and MongoDB, featuring an AI-powered chatbot with MCP (Model Context Protocol) capabilities, Razorpay payment integration, and Indian currency support.

## 🚀 Features

### Frontend Features
- **Modern React TypeScript Application** with Vite
- **Responsive Design** with Tailwind CSS and dark mode support
- **Shopping Cart & Wishlist** functionality
- **Product Search & Filtering** by category, price, brand
- **3D Product Visualization** with React Three Fiber
- **User Authentication** (Login/Register)
- **Admin Panel** for product and order management
- **Payment Integration** with Razorpay for Indian market

### Backend Features
- **Express.js REST API** with MongoDB
- **JWT Authentication** with role-based access control
- **MCP Server Integration** for chatbot operations
- **Payment Gateway** (Razorpay) with webhook support
- **Currency Conversion** (USD to INR) with live exchange rates
- **File Upload** support for product images
- **Email Notifications** for orders and updates

### AI-Powered Chatbot with MCP Features
- **Product Search** - Find products by name, category, or description
- **Add to Cart** - Directly add products to cart through chat
- **Add to Wishlist** - Save products for later through chat
- **Stock Checking** - Real-time availability verification
- **Product Recommendations** - Personalized suggestions based on user preferences
- **Order Support** - Help with shipping, returns, and policies

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Three Fiber** for 3D components
- **React Hot Toast** for notifications
- **React Icons** for UI icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Razorpay** for payment processing
- **Bcrypt** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for logging

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Razorpay account (for payment testing)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd modernstore
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Set Up Environment Variables

Create `server/.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/modernstore

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Environment
NODE_ENV=development
```

### 4. Seed the Database
```bash
cd server
npm run seed
```

This will create:
- Sample products with Indian pricing
- Admin user: `admin@modernstore.com` / `admin123`
- Demo user: `user@example.com` / `user123`

### 5. Start the Development Servers
```bash
# From the root directory
npm run dev
```

This will start:
- Frontend server at `http://localhost:5173`
- Backend server at `http://localhost:5000`

## Key Features Walkthrough

### 1. MCP-Powered Chatbot
The chatbot uses Model Context Protocol to provide intelligent shopping assistance:

- **Natural Language Processing**: Understands user queries like "find wireless headphones under ₹5000"
- **Product Operations**: Can add items to cart/wishlist directly from chat
- **Real-time Inventory**: Checks stock availability before recommendations
- **Personalized Suggestions**: Learns from user's wishlist and browsing history

**Usage Examples:**
```
User: "Show me some wireless headphones"
Bot: [Shows available headphones with Add to Cart/Wishlist buttons]

User: "Are there any red shoes in size 9?"
Bot: [Checks inventory and shows available options]

User: "Recommend something similar to my wishlist"
Bot: [Provides personalized recommendations]
```

### 2. Currency Integration
- **Dual Currency Support**: All prices shown in both USD and INR
- **Live Exchange Rates**: Fetched from external API with fallback
- **Regional Pricing**: Optimized for Indian market
- **Payment Processing**: Razorpay integration for seamless Indian payments

### 3. Admin Panel
Access at `/admin` with admin credentials:

- **Dashboard**: Overview of sales, users, and inventory
- **Product Management**: CRUD operations with bulk upload
- **Order Management**: Status updates and tracking
- **User Management**: Customer data and activity
- **Analytics**: Sales reports and performance metrics

### 4. Payment Flow
1. **Cart Review**: Items with INR pricing and GST calculation
2. **Checkout**: Shipping address and payment method selection
3. **Razorpay Integration**: Secure payment processing
4. **Order Confirmation**: Email notifications and tracking

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get category products

### MCP Operations
- `POST /api/mcp/cart/add` - Add to cart via chatbot
- `POST /api/mcp/wishlist/add` - Add to wishlist via chatbot
- `GET /api/mcp/products/search` - Search products for bot
- `GET /api/mcp/recommendations` - Get personalized recommendations

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/orders` - Get user orders

### Admin (Protected)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/products` - Admin product management
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

##  Advanced Features

### 1. Currency Conversion System
```javascript
// Automatic USD to INR conversion
const convertedProduct = await convertProductPrices(product);
// Result: { price: { usd: 299.99, inr: 24999 } }
```

### 2. MCP Server Integration
```javascript
// Chatbot can directly interact with backend
const response = await fetch('/api/mcp/cart/add', {
  method: 'POST',
  body: JSON.stringify({ productId, quantity: 1 })
});
```

### 3. Real-time Stock Management
- Inventory updates on every purchase
- Low stock alerts for admin
- Out-of-stock prevention in chatbot

### 4. Security Features
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (configurable)

##  Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
1. Set production environment variables
2. Update CORS settings for production domain
3. Configure MongoDB connection string
4. Set up Razorpay webhook endpoints

### Environment-Specific Configuration
```env
# Production
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
FRONTEND_URL=https://your-domain.com
RAZORPAY_KEY_ID=rzp_live_your_key_id
```

##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Razorpay** for payment gateway integration
- **MongoDB** for database services
- **Vercel/Netlify** for hosting platforms
- **Pexels** for product images
- **React Community** for excellent libraries

##  Support

For support, email  or join our Discord community.

---

**Built with  for the Indian e-commerce market**
