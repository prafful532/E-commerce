const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Product = require('../models/Product');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modernstore');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    console.log('Seeding products...');
    
    // Clear existing products
    await Product.deleteMany({});
    
    const products = [
      {
        title: "Premium Wireless Headphones",
        description: "Experience premium sound quality with these wireless headphones featuring active noise cancellation, 30-hour battery life, and premium materials.",
        price: { usd: 299.99, inr: 24999 },
        originalPrice: { usd: 399.99, inr: 33299 },
        category: "electronics",
        brand: "AudioTech",
        image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
        images: [
          "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
          "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg",
          "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg"
        ],
        colors: ["Black", "White", "Silver"],
        sizes: ["One Size"],
        features: ["Active Noise Cancellation", "30hr Battery", "Wireless Charging", "Premium Materials"],
        stock: 50,
        rating: { average: 4.8, count: 324 },
        isNewProduct: true,
        isTrending: true,
        isFeatured: true,
        tags: ["wireless", "premium", "noise-cancelling"],
        sku: "ELECTRONICS-HEADPHONES-001",
        reviews: []
      },
      {
        title: "Smart Fitness Watch",
        description: "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.",
        price: { usd: 199.99, inr: 16699 },
        originalPrice: { usd: 249.99, inr: 20899 },
        category: "electronics",
        brand: "FitTech",
        image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
        images: [
          "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
          "https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg"
        ],
        colors: ["Black", "Rose Gold", "Silver"],
        sizes: ["38mm", "42mm"],
        features: ["Heart Rate Monitor", "GPS", "7-day Battery", "Water Resistant"],
        stock: 35,
        rating: { average: 4.6, count: 256 },
        isTrending: true,
        tags: ["fitness", "smartwatch", "health"],
        sku: "ELECTRONICS-WATCH-001",
        reviews: []
      },
      {
        title: "Premium Cotton T-Shirt",
        description: "Ultra-soft premium cotton t-shirt with modern fit and sustainable materials.",
        price: { usd: 29.99, inr: 2499 },
        originalPrice: { usd: 39.99, inr: 3329 },
        category: "clothing",
        brand: "ComfortWear",
        image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
        images: [
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
          "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg"
        ],
        colors: ["White", "Black", "Navy", "Gray"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        features: ["100% Cotton", "Pre-shrunk", "Eco-friendly", "Modern Fit"],
        stock: 100,
        rating: { average: 4.4, count: 189 },
        isNewProduct: true,
        tags: ["cotton", "casual", "sustainable"],
        sku: "CLOTHING-TSHIRT-001",
        reviews: []
      },
      {
        title: "Designer Sneakers",
        description: "Stylish designer sneakers with premium leather upper and comfortable cushioned sole.",
        price: { usd: 149.99, inr: 12499 },
        originalPrice: { usd: 199.99, inr: 16699 },
        category: "shoes",
        brand: "StyleStep",
        image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
        images: [
          "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
          "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
        ],
        colors: ["White", "Black", "Blue"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"],
        features: ["Premium Leather", "Cushioned Sole", "Breathable", "Durable"],
        stock: 75,
        rating: { average: 4.7, count: 298 },
        isTrending: true,
        isFeatured: true,
        tags: ["designer", "leather", "comfort"],
        sku: "SHOES-SNEAKERS-001",
        reviews: []
      },
      {
        title: "Vintage Denim Jacket",
        description: "Classic vintage-style denim jacket with modern comfort and timeless appeal.",
        price: { usd: 89.99, inr: 7499 },
        originalPrice: { usd: 119.99, inr: 9999 },
        category: "clothing",
        brand: "VintageStyle",
        image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
        images: [
          "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
        ],
        colors: ["Blue", "Black", "Light Blue"],
        sizes: ["S", "M", "L", "XL"],
        features: ["100% Cotton Denim", "Vintage Wash", "Classic Fit", "Metal Buttons"],
        stock: 60,
        rating: { average: 4.5, count: 167 },
        tags: ["vintage", "denim", "classic"],
        sku: "CLOTHING-JACKET-001",
        reviews: []
      },
      {
        title: "Leather Handbag",
        description: "Elegant leather handbag with spacious interior and premium craftsmanship.",
        price: { usd: 159.99, inr: 13299 },
        originalPrice: { usd: 199.99, inr: 16699 },
        category: "accessories",
        brand: "LuxLeather",
        image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
        images: [
          "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
        ],
        colors: ["Black", "Brown", "Tan"],
        sizes: ["One Size"],
        features: ["Genuine Leather", "Multiple Compartments", "Adjustable Strap", "Premium Hardware"],
        stock: 30,
        rating: { average: 4.6, count: 143 },
        isNewProduct: true,
        tags: ["leather", "luxury", "handbag"],
        sku: "ACCESSORIES-HANDBAG-001",
        reviews: []
      },
      {
        title: "Sports Running Shoes",
        description: "High-performance running shoes with advanced cushioning and breathable mesh.",
        price: { usd: 129.99, inr: 10799 },
        category: "shoes",
        brand: "RunPro",
        image: "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
        images: [
          "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
          "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"
        ],
        colors: ["Black", "Red", "Blue", "White"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"],
        features: ["Advanced Cushioning", "Breathable Mesh", "Lightweight", "Durable Outsole"],
        stock: 85,
        rating: { average: 4.3, count: 221 },
        tags: ["running", "sports", "performance"],
        sku: "SHOES-RUNNING-001",
        reviews: []
      },
      {
        title: "Wireless Earbuds",
        description: "True wireless earbuds with active noise cancellation and 24-hour battery life.",
        price: { usd: 79.99, inr: 6699 },
        originalPrice: { usd: 99.99, inr: 8299 },
        category: "electronics",
        brand: "SoundTech",
        image: "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg",
        images: [
          "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg",
          "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg"
        ],
        colors: ["White", "Black"],
        sizes: ["One Size"],
        features: ["True Wireless", "Active Noise Cancellation", "24hr Battery", "Water Resistant"],
        stock: 40,
        rating: { average: 4.4, count: 287 },
        isTrending: true,
        tags: ["wireless", "earbuds", "compact"],
        sku: "ELECTRONICS-EARBUDS-001",
        reviews: []
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products seeded successfully`);
    
    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    console.log('Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    const userData = [
      {
        name: "Admin User",
        email: "admin@modernstore.com",
        password: "admin123",
        role: "admin",
        isEmailVerified: true
      },
      {
        name: "John Doe",
        email: "user@example.com",
        password: "user123",
        role: "user",
        isEmailVerified: true,
        phone: "+91-9876543210",
        address: {
          street: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        }
      }
    ];

    // Create users one by one to trigger password hashing middleware
    const createdUsers = [];
    for (const userInfo of userData) {
      const user = new User(userInfo);
      await user.save();
      createdUsers.push(user);
    }

    console.log(`${createdUsers.length} users seeded successfully`);
    
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    await seedUsers();
    await seedProducts();
    
    console.log('Database seeding completed successfully!');
    
    console.log('\n🚀 Demo Accounts:');
    console.log('Admin: admin@modernstore.com / admin123');
    console.log('User: user@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedProducts, seedUsers };
