import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatBot from './components/ChatBot';
import DemoModeIndicator from './components/DemoModeIndicator';
import QuickHelp from './components/QuickHelp';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import InvoiceQR from './pages/InvoiceQR';
import AdminPortal from './pages/AdminPortal';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
                <Navbar />
                <DemoModeIndicator />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/category/:category" element={<Category />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/invoice-qr" element={<InvoiceQR />} />
                    <Route path="/admin/*" element={<AdminPortal />} />
                  </Routes>
                </main>
                <Footer />
                <ChatBot />
                <QuickHelp />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'var(--toast-bg)',
                      color: 'var(--toast-color)',
                    },
                  }}
                />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
