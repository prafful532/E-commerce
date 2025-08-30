import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, options?: { size?: string; color?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, quantity = 1, options: { size?: string; color?: string } = {}) => {
    const existingItem = items.find(item =>
      String(item.id) === String(product.id) && 
      item.size === options.size && 
      item.color === options.color
    );

    if (existingItem) {
      setItems(items.map(item =>
        String(item.id) === String(product.id) && item.size === options.size && item.color === options.color
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: String(product.id),
        title: product.title,
        price: Number(product.price),
        image: product.image,
        quantity,
        size: options.size,
        color: options.color,
      };
      setItems([...items, newItem]);
    }

    toast.success('Added to cart!');
  };

  const removeFromCart = (id: string) => {
    setItems(items.filter(item => String(item.id) !== String(id)));
    toast.success('Removed from cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(items.map(item =>
      String(item.id) === String(id) ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};
