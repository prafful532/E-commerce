export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  images: string[];
  rating: {
    rate: number;
    count: number;
  };
  brand: string;
  colors: string[];
  sizes: string[];
  features: string[];
  reviews: Review[];
  isNew?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    description: "Experience premium sound quality with these wireless headphones featuring active noise cancellation, 30-hour battery life, and premium materials.",
    category: "electronics",
    image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
    images: [
      "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
      "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg",
      "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg"
    ],
    rating: { rate: 4.8, count: 324 },
    brand: "AudioTech",
    colors: ["Black", "White", "Silver"],
    sizes: ["One Size"],
    features: ["Active Noise Cancellation", "30hr Battery", "Wireless Charging", "Premium Materials"],
    isNew: true,
    isTrending: true,
    isFeatured: true,
    reviews: [
      {
        id: 1,
        user: "John D.",
        rating: 5,
        comment: "Amazing sound quality and comfort. Worth every penny!",
        date: "2024-01-15",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
      },
      {
        id: 2,
        user: "Sarah M.",
        rating: 4,
        comment: "Great headphones, battery life is excellent.",
        date: "2024-01-10",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
      }
    ]
  },
  {
    id: 2,
    title: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    description: "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.",
    category: "electronics",
    image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
    images: [
      "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
      "https://images.pexels.com/photos/1682699/pexels-photo-1682699.jpeg"
    ],
    rating: { rate: 4.6, count: 256 },
    brand: "FitTech",
    colors: ["Black", "Rose Gold", "Silver"],
    sizes: ["38mm", "42mm"],
    features: ["Heart Rate Monitor", "GPS", "7-day Battery", "Water Resistant"],
    isTrending: true,
    reviews: [
      {
        id: 1,
        user: "Mike R.",
        rating: 5,
        comment: "Perfect for my daily workouts!",
        date: "2024-01-12",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike"
      }
    ]
  },
  {
    id: 3,
    title: "Premium Cotton T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    description: "Ultra-soft premium cotton t-shirt with modern fit and sustainable materials.",
    category: "clothing",
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    images: [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg"
    ],
    rating: { rate: 4.4, count: 189 },
    brand: "ComfortWear",
    colors: ["White", "Black", "Navy", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    features: ["100% Cotton", "Pre-shrunk", "Eco-friendly", "Modern Fit"],
    isNew: true,
    reviews: [
      {
        id: 1,
        user: "Emma L.",
        rating: 4,
        comment: "Very comfortable and good quality.",
        date: "2024-01-08",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
      }
    ]
  },
  {
    id: 4,
    title: "Designer Sneakers",
    price: 149.99,
    originalPrice: 199.99,
    description: "Stylish designer sneakers with premium leather upper and comfortable cushioned sole.",
    category: "shoes",
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
    images: [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
    ],
    rating: { rate: 4.7, count: 298 },
    brand: "StyleStep",
    colors: ["White", "Black", "Blue"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    features: ["Premium Leather", "Cushioned Sole", "Breathable", "Durable"],
    isTrending: true,
    isFeatured: true,
    reviews: [
      {
        id: 1,
        user: "Alex K.",
        rating: 5,
        comment: "Amazing quality and very comfortable!",
        date: "2024-01-14",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
      }
    ]
  },
  {
    id: 5,
    title: "Vintage Denim Jacket",
    price: 89.99,
    originalPrice: 119.99,
    description: "Classic vintage-style denim jacket with modern comfort and timeless appeal.",
    category: "clothing",
    image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
    images: [
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    rating: { rate: 4.5, count: 167 },
    brand: "VintageStyle",
    colors: ["Blue", "Black", "Light Blue"],
    sizes: ["S", "M", "L", "XL"],
    features: ["100% Cotton Denim", "Vintage Wash", "Classic Fit", "Metal Buttons"],
    reviews: [
      {
        id: 1,
        user: "Lisa T.",
        rating: 4,
        comment: "Love the vintage look and quality!",
        date: "2024-01-11",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa"
      }
    ]
  },
  {
    id: 6,
    title: "Leather Handbag",
    price: 159.99,
    originalPrice: 199.99,
    description: "Elegant leather handbag with spacious interior and premium craftsmanship.",
    category: "accessories",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
    images: [
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    rating: { rate: 4.6, count: 143 },
    brand: "LuxLeather",
    colors: ["Black", "Brown", "Tan"],
    sizes: ["One Size"],
    features: ["Genuine Leather", "Multiple Compartments", "Adjustable Strap", "Premium Hardware"],
    isNew: true,
    reviews: [
      {
        id: 1,
        user: "Rachel P.",
        rating: 5,
        comment: "Beautiful bag, excellent quality!",
        date: "2024-01-09",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rachel"
      }
    ]
  },
  {
    id: 7,
    title: "Sports Running Shoes",
    price: 129.99,
    description: "High-performance running shoes with advanced cushioning and breathable mesh.",
    category: "shoes",
    image: "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
    images: [
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg",
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"
    ],
    rating: { rate: 4.3, count: 221 },
    brand: "RunPro",
    colors: ["Black", "Red", "Blue", "White"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    features: ["Advanced Cushioning", "Breathable Mesh", "Lightweight", "Durable Outsole"],
    reviews: [
      {
        id: 1,
        user: "Tom H.",
        rating: 4,
        comment: "Great for running, very comfortable!",
        date: "2024-01-07",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom"
      }
    ]
  },
  {
    id: 8,
    title: "Wireless Earbuds",
    price: 79.99,
    originalPrice: 99.99,
    description: "True wireless earbuds with active noise cancellation and 24-hour battery life.",
    category: "electronics",
    image: "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg",
    images: [
      "https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg",
      "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg"
    ],
    rating: { rate: 4.4, count: 287 },
    brand: "SoundTech",
    colors: ["White", "Black"],
    sizes: ["One Size"],
    features: ["True Wireless", "Active Noise Cancellation", "24hr Battery", "Water Resistant"],
    isTrending: true,
    reviews: [
      {
        id: 1,
        user: "David M.",
        rating: 4,
        comment: "Good sound quality for the price!",
        date: "2024-01-13",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david"
      }
    ]
  }
];

export const categories = [
  { id: 'electronics', name: 'Electronics', count: 156 },
  { id: 'clothing', name: 'Clothing', count: 243 },
  { id: 'shoes', name: 'Shoes', count: 89 },
  { id: 'accessories', name: 'Accessories', count: 127 },
];

export const brands = [
  'AudioTech', 'FitTech', 'ComfortWear', 'StyleStep', 'VintageStyle', 'LuxLeather', 'RunPro', 'SoundTech'
];