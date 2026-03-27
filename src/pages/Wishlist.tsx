import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { ShoppingCart } from "lucide-react";

const Wishlist = () => {
  const { items, clearWishlist, totalWishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✅ Add all wishlist items to cart
  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      addToCart(item.product, item.selectedColor);
    });
    clearWishlist();
  };

  if (items.length === 0) {
     return (
       <div className="min-h-screen py-20 bg-background text-foreground flex flex-col items-center justify-center text-center">
         <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Your Wishlist</h1>
         <p className="text-lg text-foreground/80 mb-8">Your wishlist is currently empty.</p>
         <Button
           asChild
           size="lg"
           className="bg-foreground text-background hover:bg-foreground/90 transition-all"
         >
           <Link to="/products">Continue Browsing</Link>
         </Button>
       </div>
     );
   }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 mt-20">
        {/* === Header === */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-light tracking-wider">
            Wishlist ({totalWishlistItems})
          </h1>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="default"
              className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
              onClick={handleAddAllToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Move All to Cart
            </Button>

            <Button
              variant="destructive"
              className="text-background hover:bg-foreground bg-foreground"
              onClick={clearWishlist}
            >
              Clear Wishlist
            </Button>
          </div>
        </div>

        {/* === Wishlist Product Grid === */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <ProductCard
              key={item.product._id + (item.selectedColor || "")}
              product={item.product}
              index={index}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wishlist;
