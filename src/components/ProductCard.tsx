import { Link } from "react-router-dom";
import { ShoppingBag, Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { items, addToWishlist, removeFromWishlist } = useWishlist(); // ✅ use `items` (from context)
  const brand = product.brand;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const hasColorStock =
    product.colors && product.colors.some((c) => c.stock > 0);
  const hasLitreStock =
    product.litres && product.litres.some((l) => l.stock > 0);

  const isOutOfStock =
    (!product.stock || product.stock <= 0) &&
    !hasColorStock &&
    !hasLitreStock;

  const totalStock =
    (product.stock || 0) +
    (product.colors
      ? product.colors.reduce((sum, c) => sum + c.stock, 0)
      : 0) +
    (product.litres
      ? product.litres.reduce((sum, l) => sum + l.stock, 0)
      : 0);


  // ✅ Check if product is in wishlist
  const isInWishlist = items.some(
    (item) => item.product._id === product._id
  );

  // ✅ Toggle wishlist add/remove
  const toggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.4),
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.02 }}
      className={`h-full border border-foreground/20 bg-background/10 shadow-sm hover:shadow-lg hover:border-foreground/40 transition-all ${isOutOfStock ? "opacity-70" : ""
        }`}
    >
      <Card className="group overflow-hidden flex flex-col h-full bg-background text-foreground border-none rounded-2xl relative">
        {/* === PRODUCT IMAGE === */}
        <div className="relative">
          <Link to={`/product/${product._id}`}>
            <div className="aspect-square overflow-hidden rounded-t-2xl bg-foreground/10 relative">
              <motion.img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.08 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: index * 0.12,
                }}
              />

              {/* Stock */}
              <p className="mt-1 text-sm sm:text-base">
                <span className="font-medium">Stock:</span>{" "}
                {isOutOfStock ? (
                  <span className="text-red-600">Out of Stock</span>
                ) : (
                  <span className="text-green-600">
                    In Stock ({totalStock})
                  </span>
                )}
              </p>

              {/* Litres list */}
              {product.litres && product.litres.length > 0 && (
                <div className="mt-1 text-xs sm:text-sm text-foreground/70">
                  <span className="font-medium">Litres:</span>{" "}
                  {product.litres.map((l, i) => (
                    <span key={i} className="mr-2">
                      {l.name} ({l.stock})
                    </span>
                  ))}
                </div>
              )}

            </div>
          </Link>

          {/* ❤️ Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 left-2 sm:top-3 sm:left-3  rounded-full"
          >
            <Heart
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${isInWishlist ? "fill-red-500 text-red-500" : "text-foreground"
                }`}
            />
          </button>

          {/* Discount Badge */}
          {product.discount && !isOutOfStock && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-ring text-background text-[10px] sm:text-xs md:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full shadow-md"
            >
              {product.discount}% OFF
            </motion.span>
          )}
        </div>

        {/* === CONTENT === */}
        <CardContent className="p-4 sm:p-5 flex flex-col flex-grow">
          {brand && (
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="foreground"
                className="text-xs sm:text-sm text-foreground"
              >
                {brand.name}
              </Badge>
            </div>
          )}

          <Link to={`/product/${product._id}`}>
            <h3 className="font-serif font-semibold text-base sm:text-lg md:text-xl mb-2 group-hover:text-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>



          <p className="text-xs sm:text-sm text-foreground/70 mb-3 sm:mb-4 flex-grow">
            {product.description.length > 50
              ? product.description.slice(0, 50) + "..."
              : product.description}
          </p>

          {/* Variant-wise price calculation */}
          {(() => {
            let allPrices: number[] = [];

            // Base product price
            if (product.price) allPrices.push(product.price);

            // Color variants
            if (product.colors && product.colors.length > 0) {
              product.colors.forEach((c: any) => {
                if (c.price) allPrices.push(c.price);
              });
            }

            // Litre variants
            if (product.litres && product.litres.length > 0) {
              product.litres.forEach((l: any) => {
                if (l.price) allPrices.push(l.price);
              });
            }

            // Determine min and max price
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);

            // Discount
            const discount = product.discount || 0;
            const discountedMin = minPrice - (minPrice * discount) / 100;
            const discountedMax = maxPrice - (maxPrice * discount) / 100;

            return (
              <div className="flex flex-col gap-1 mt-1">
                {discount > 0 && (
                  <p className="text-xs sm:text-sm text-foreground/50 line-through">
                    Rs {minPrice.toFixed(0)}
                  
                  </p>
                )}
                <p className="text-lg sm:text-xl font-semibold text-accent">
                  Rs {discountedMin.toFixed(0)}
               
                </p>
              </div>
            );
          })()}

        </CardContent>

        {/* === FOOTER === */}
        <CardFooter className="p-4 sm:p-5 pt-0 mt-auto">
          <Button
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addToCart(product)}
            className={`w-full text-xs sm:text-sm md:text-base ${isOutOfStock
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-foreground/90 text-background hover:bg-foreground hover:shadow-md"
              } transition-all`}
          >
            {isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
