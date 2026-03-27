import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "@/types/product";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  totalItems: number;
  clearCartList: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, selectedColor?: string, selectedLitre?: string) => {
    setItems((prev) => {
      const current = Array.isArray(prev) ? prev : [];

     
      // Determine current stock dynamically based on variant
      let availableStock = product.stock;

      // Check both color and litre independently
      if (selectedColor && product.colors) {
        const colorObj = product.colors.find((c) => c.hex === selectedColor);
        if (colorObj) availableStock = colorObj.stock;
      }

      if (selectedLitre && product.litres) {
        const litreObj = product.litres.find((l) => l.amount === selectedLitre);
        if (litreObj) availableStock = Math.min(availableStock, litreObj.stock);
      }


      const discountedPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      // Check if item already exists (color + litre)
      const existing = current.find(
        (item) =>
          item.product._id === product._id &&
          item.selectedColor === selectedColor &&
          item.selectedLitre === selectedLitre
      );

      if (existing) {
        if (existing.quantity >= availableStock) {
          toast.error(`Only ${availableStock} item(s) available for this selection`);
          return current;
        }
        toast.success("Quantity updated");
        return current.map((item) =>
          item.product._id === product._id &&
            item.selectedColor === selectedColor &&
            item.selectedLitre === selectedLitre
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (availableStock < 1) {
        toast.error("Out of stock for this selection");
        return current;
      }

      toast.success("Added to cart");
      return [
        ...current,
        {
          product,
          quantity: 1,
          stock: availableStock,
          selectedColor,
          selectedLitre,
          price: discountedPrice,
        },
      ];
    });
  };

const removeFromCart = (productId: string, selectedColor?: string, selectedLitre?: string) => {
  setItems((prev) =>
    prev.filter(
      (item) =>
        !(
          item.product._id === productId &&
          item.selectedColor === selectedColor &&
          item.selectedLitre === selectedLitre
        )
    )
  );
  toast.success("Removed from cart");
};



  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedLitre?: string
  ) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (
            item.product._id !== productId ||
            item.selectedColor !== selectedColor ||
            item.selectedLitre !== selectedLitre
          )
            return item;

          // Determine current stock dynamically based on variant
          let availableStock = item.product.stock;

          if (selectedColor && item.product.colors) {
            const colorObj = item.product.colors.find((c) => c.hex === selectedColor);
            if (colorObj) availableStock = colorObj.stock;
          } else if (selectedLitre && item.product.litres) {
            const litreObj = item.product.litres.find((l) => l.amount === selectedLitre);
            if (litreObj) availableStock = litreObj.stock;
          }

          if (quantity <= 0) {
            toast.info("Item removed from cart");
            return null;
          }

          if (quantity > availableStock) {
            toast.error(`Only ${availableStock} available for this selection`);
            return item;
          }

          return { ...item, quantity, stock: availableStock };
        })
        .filter(Boolean) as CartItem[]
    );
  };


  // 🧹 Clear entire wishlist
  const clearCartList = () => {
    setItems([]);
    toast.success("Wishlist cleared");
  };


  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price || item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCartList, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
