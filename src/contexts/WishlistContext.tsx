import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setItems(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: any) => {
    const isAlreadyInWishlist = items.some(item => String(item.id) === String(product.id));
    
    if (isAlreadyInWishlist) {
      toast.error('Already in wishlist');
      return;
    }

    const newItem: WishlistItem = {
      id: String(product.id),
      title: product.title,
      price: Number(product.price),
      image: product.image,
      category: product.category,
    };
    
    setItems([...items, newItem]);
    toast.success('Added to wishlist!');
  };

  const removeFromWishlist = (id: string) => {
    setItems(items.filter(item => String(item.id) !== String(id)));
    toast.success('Removed from wishlist');
  };

  const isInWishlist = (id: string) => {
    return items.some(item => String(item.id) === String(id));
  };

  const clearWishlist = () => {
    setItems([]);
    localStorage.removeItem('wishlist');
  };

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
