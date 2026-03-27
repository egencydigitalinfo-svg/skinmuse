
import { Product } from "@/types/product";
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface WishlistItem {
  product: Product;
  selectedColor?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Product, selectedColor?: string) => void;
  removeFromWishlist: (productId: string, selectedColor?: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string, selectedColor?: string) => boolean;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items]);

  // 💖 Add to wishlist (prevents duplicates)
  const addToWishlist = (product: Product, selectedColor?: string) => {
    setItems((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const exists = current.find(
        (item) => item.product._id === product._id && item.selectedColor === selectedColor
      );

      if (exists) {
        toast.info("Already in wishlist");
        return current;
      }

      toast.success("Added to wishlist");
      return [...current, { product, selectedColor }];
    });
  };

  // ❌ Remove from wishlist
  const removeFromWishlist = (productId: string, selectedColor?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.product._id !== productId || item.selectedColor !== selectedColor
      )
    );
    toast.success("Removed from wishlist");
  };

  // 🧹 Clear entire wishlist
  const clearWishlist = () => {
    setItems([]);
    toast.success("Wishlist cleared");
  };

  // 🔍 Check if a product is already in wishlist
  const isInWishlist = (productId: string, selectedColor?: string) => {
    return items.some(
      (item) => item.product._id === productId && item.selectedColor === selectedColor
    );
  };

  const totalWishlistItems = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist, totalWishlistItems }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
