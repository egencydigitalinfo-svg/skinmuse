import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Package } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const { items, addToWishlist, removeFromWishlist } = useWishlist();
  const brand = product.brand;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const hasColorStock = product.colors?.some((c) => c.stock > 0);
  const hasLitreStock = product.litres?.some((l) => l.stock > 0);
  const isOutOfStock =
    (!product.stock || product.stock <= 0) && !hasColorStock && !hasLitreStock;

  const totalStock =
    (product.stock || 0) +
    (product.colors?.reduce((sum, c) => sum + c.stock, 0) || 0) +
    (product.litres?.reduce((sum, l) => sum + l.stock, 0) || 0);

  const isInWishlist = items.some((item) => item.product._id === product._id);

  const toggleWishlist = () => {
    isInWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  // Price calculation across all variants
  const allPrices: number[] = [];
  if (product.price) allPrices.push(product.price);
  product.colors?.forEach((c: any) => c.price && allPrices.push(c.price));
  product.litres?.forEach((l: any) => l.price && allPrices.push(l.price));

  const minPrice = Math.min(...allPrices);
  const discount = product.discount || 0;
  const discountedMin = minPrice - (minPrice * discount) / 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.35),
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group h-full"
    >
      <div
        className={`
          relative flex flex-col h-full rounded-2xl overflow-hidden
          bg-white dark:bg-zinc-900
          border border-zinc-100 dark:border-zinc-800
          shadow-sm hover:shadow-xl hover:shadow-black/8
          transition-all duration-300 ease-out
          hover:-translate-y-1
          ${isOutOfStock ? "opacity-60" : ""}
        `}
      >
        {/* ── IMAGE AREA ── */}
        <div className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-800">
          <Link to={`/product/${product._id}`} className="block aspect-[4/3]">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Top pill row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
            {/* Left: Stock badge */}
            <span
              className={`
                text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none
                ${isOutOfStock
                  ? "bg-red-500/90 text-white"
                  : "bg-emerald-500/90 text-white"
                }
              `}
            >
              {isOutOfStock ? "Out of Stock" : `In Stock · ${totalStock}`}
            </span>

            {/* Right: Discount badge */}
            {discount > 0 && !isOutOfStock && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 pointer-events-none">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={toggleWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`
              absolute bottom-3 right-3
              w-9 h-9 rounded-full flex items-center justify-center
              backdrop-blur-sm border transition-all duration-200
              ${isInWishlist
                ? "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700"
                : "bg-white/80 dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:border-red-200"
              }
            `}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isInWishlist
                  ? "fill-red-500 text-red-500"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            />
          </button>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex flex-col flex-grow p-4 gap-2">

          {/* Brand + rating row */}
          <div className="flex items-center justify-between">
            {brand ? (
              <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 p-2 rounded-full bg-[#fff] border border-zinc-200 dark:border-zinc-700 dark:bg-indigo-900/30">
                {brand.name}
              </span>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              4.8
            </span>
          </div>

          {/* Product name */}
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-sm sm:text-base leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-[#CE0000] dark:group-hover:text-[#CE0000] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 flex-grow">
            {product.description.length > 70
              ? product.description.slice(0, 70) + "…"
              : product.description}
          </p>

          {/* Litres pills */}
          {product.litres && product.litres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {product.litres.map((l, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium"
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mt-1" />

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Price block */}
            <div className="flex flex-col">
              {discount > 0 && (
                <span className="text-[11px] line-through text-zinc-400 leading-none mb-0.5">
                  Rs {minPrice.toFixed(0)}
                </span>
              )}
              <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                Rs {discountedMin.toFixed(0)}
              </span>
            </div>

            {/* Add to Cart button */}
            {/* <button
              disabled={isOutOfStock}
              onClick={() => !isOutOfStock && addToCart(product)}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold
                transition-all duration-200 active:scale-95
                ${isOutOfStock
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-[#CE0000] hover:bg-[#CE0000] text-white shadow-sm hover:shadow-indigo-500/30 hover:shadow-md"
                }
              `}
            >
              {isOutOfStock ? (
                <>
                  <Package className="h-3.5 w-3.5" />
                  Unavailable
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add
                </>
              )}
            </button> */}
            <button
              disabled={isOutOfStock}
              onClick={() => {
                if (isOutOfStock) return;

                if (!added) {
                  addToCart(product);
                  setAdded(true);
                } else {
                  window.location.href = "/cart"; // or use navigate()
                }
              }}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold
                transition-all duration-200 active:scale-95
                ${
                  isOutOfStock
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    : added
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-[#CE0000] text-white hover:shadow-md"
                }
              `}
            >
              {isOutOfStock ? (
                <>
                  <Package className="h-3.5 w-3.5" />
                  Unavailable
                </>
              ) : added ? (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  View Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;