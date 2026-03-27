"use client";

import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import axios from "axios";
import { Product } from "@/types/product";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";


const API_BASE = "https://backendskinmuse.vercel.app/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [hotSaleProducts, setHotSaleProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedLitre, setSelectedLitre] = useState<string | null>(null);


  // Fetch single product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  
  // Select first variant by default
useEffect(() => {
  if (product) {
    if (product.colors && product.colors.length > 0) {
      // pick the first color with stock > 0
      const firstAvailableColor = product.colors.find((c: any) => c.stock > 0);
      setSelectedColor(firstAvailableColor ? firstAvailableColor.hex : null);
    }

    if (product.litres && product.litres.length > 0) {
      // pick the first litre with stock > 0
      const firstAvailableLitre = product.litres.find((l: any) => l.stock > 0);
      setSelectedLitre(firstAvailableLitre ? firstAvailableLitre.amount.trim() : null);
    }
  }
}, [product]);


  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products`);
        const allProducts = res.data || [];

        // Filter products by flags
        setFeaturedProducts(allProducts.filter(p => p.isFeatured));
        setTrendingProducts(allProducts.filter(p => p.isTrending));
        setHotSaleProducts(allProducts.filter(p => p.isHotSale));

        console.log("Featured:", allProducts.filter(p => p.isFeatured));
        console.log("Trending:", allProducts.filter(p => p.isTrending));
        console.log("HotSale:", allProducts.filter(p => p.isHotSale));
      } catch (error) {
        console.error("❌ Error fetching highlights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);


  const hasColorStock = product?.colors?.some(c => c.stock > 0) ?? false;
  const hasLitreStock = product?.litres?.some(l => l.stock > 0) ?? false;
  const isOutOfStock = (!product?.stock || product?.stock === 0) && !hasColorStock && !hasLitreStock;


  // Fetch suggested products based on brand or category
  useEffect(() => {
    const fetchSuggested = async () => {
      if (!product) return;
      try {
        const res = await axios.get(`${API_BASE}/products`);
        const related = res.data
          .filter(
            (p: any) =>
              p._id !== product._id &&
              (p.brandId?._id === product.brandId?._id || p.category === product.category)
          )
          .slice(0, 4);
        setSuggestedProducts(related);
      } catch (err) {
        console.error("Error fetching suggested products:", err);
        setSuggestedProducts([]);
      }
    };
    fetchSuggested();
  }, [product]);

  if (loading) return <div className="container py-20 text-center">Loading...</div>;
  if (!product)
    return (
      <div className="container py-20 text-center bg-background text-secondary">
        <h2 className="text-3xl font-serif mb-6">Product Not Found</h2>
        <Button asChild className="bg-background text-foreground hover:bg-secondary/90">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );

  const brand = product.brandId; // already populated from backend
  const skinTypes = Array.isArray(product.skinType) ? product.skinType : [product.skinType];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-8 bg-background text-foreground hover:bg-foreground hover:border hover:text-background hover:border-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Product Section */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/10" />
            {/* Discount Badge */}
            {(product.discount || brand?.discount) && (
              <Badge className="absolute bg-primary text-background top-1 right-1 text-sm px-3 py-1">
                {product.discount || brand.discount}% OFF
              </Badge>
            )}

            {/* Small Thumbnails */}
            <div className="flex gap-2 mt-2 absolute bottom-4 left-4">
              {product.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={`w-16 h-16 object-cover border-2 rounded cursor-pointer transition-all ${img === product.images[0] ? "border-foreground" : "border-transparent"}`}
                  onClick={() => {
                    const newImages = [...product.images];
                    [newImages[0], newImages[idx]] = [newImages[idx], newImages[0]]; // Swap clicked image to main
                    setProduct({ ...product, images: newImages });
                  }}
                />
              ))}
            </div>
            {/* ✅ Sold Out Badge */}
            {(
              (!product.stock || product.stock === 0) &&
              (!product.colors || product.colors.every(c => c.stock === 0)) &&
              (!product.litres || product.litres.every(l => l.stock === 0))
            ) && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white text-lg font-bold px-6 py-3 shadow-lg">
                    SOLD OUT
                  </span>
                </div>
              )}


          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Brand Info */}
            {brand && (
              <div className="flex items-center gap-3">
                <Link
                  to={`/products?brand=${brand._id}`}
                  className="text-sm text-foreground/90 hover:text-background underline-offset-4 hover:underline transition-all"
                >
                  {brand.name}
                </Link>
                {brand.discount && (
                  <Badge variant="destructive" className="text-xs">
                    {brand.discount}% Off
                  </Badge>
                )}
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Average Rating */}
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-lg font-semibold text-foreground">
                {(
                  product.reviews && product.reviews.length > 0
                    ? product.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
                    product.reviews.length
                    : 0
                ).toFixed(1)}{" "}
                / 5

              </span>
              <span className="text-sm text-foreground/60">
                ({product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize text-background">
                {product.category}
              </Badge>
              {skinTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="capitalize border-foreground text-foreground"
                >
                  {type}
                </Badge>
              ))}
              {product.isFeatured && (
                <Badge className="bg-background text-foreground border border-foreground hover:bg-foreground hover:text-background">Featured</Badge>
              )}
              {product.isTrending && (
                <Badge className="bg-pink-500 text-white">Trending</Badge>
              )}
              {product.isHotSale && (
                <Badge className="bg-orange-600 text-white">Hot Sale</Badge>
              )}
            </div>


            {/* Price Section with Discount */}
            <div className="flex items-center gap-4">


              {/* Price Display Based on Selected Variant */}
              <div className="flex flex-col">
                {(() => {
                  let selectedPrice = product.price; // default to base price

                  // If a color variant is selected, override price
                  if (selectedColor && product.colors?.length) {
                    const colorVariant = product.colors.find((c: any) => c.hex === selectedColor);
                    if (colorVariant?.price) selectedPrice = colorVariant.price;
                  }

                  // If a litre variant is selected, override price
                  if (selectedLitre && product.litres?.length) {
                    const litreVariant = product.litres.find((l: any) => l.amount.trim() === selectedLitre);
                    if (litreVariant?.price) selectedPrice = litreVariant.price;
                  }

                  const discount = product.discount || brand?.discount || 0;
                  const discountedPrice = selectedPrice - (selectedPrice * discount) / 100;

                  return discount > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-foreground">
                        Rs {discountedPrice.toFixed(0)}
                      </p>
                      <p className="text-lg line-through text-primary">
                        Rs {selectedPrice.toFixed(0)}
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-semibold text-primary">
                      Rs {selectedPrice.toFixed(0)}
                    </p>
                  );
                })()}
              </div>

            </div>

            {/* Description */}
            <p className="text-base leading-relaxed text-foreground/90 max-w-xl">
              {product.description}
            </p>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mt-2">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Key Ingredients:</h3>
                <ul className="list-disc list-inside text-foreground/80 space-y-1">
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}



            {product.category === "makeup" && product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Choose Color:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.hex ? "border-background scale-110" : "border-gray-300"
                        }`}
                    >
                      {/* Optional: show stock */}
                      {color.stock === 0 && <span className="absolute text-xs text-red-500">✕</span>}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="mt-1 text-sm mt-3 text-foreground">Selected Color: <span className="bg-background" style={{ color: selectedColor }}>{selectedColor}</span></p>
                )}
              </div>
            )}



            {product.litres && product.litres.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Choose ML:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.litres.map((litre, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedLitre(litre.amount.trim())}

                      className={`px-3 py-1 rounded-lg border-2 transition-all ${selectedLitre === litre.amount.trim()
                        ? "border-foreground bg-foreground/10"
                        : "border-gray-300"
                        }`}
                      disabled={litre.stock === 0}
                    >
                      {litre.amount} {litre.stock === 0 && "(Out of Stock)"}
                    </button>
                  ))}
                </div>
                {selectedLitre && (
                  <p className="mt-2 text-sm text-foreground">
                    Selected ML: <span className="font-medium">{selectedLitre}</span>
                  </p>
                )}
              </div>
            )}


            <div className="flex items-center gap-4">
              {/* 🛒 Add to Cart Button */}
              <Button
                size="lg"
                onClick={() => {
                  // ✅ Check required options
                  if (product.litres && product.litres.length > 0 && !selectedLitre) {
                    toast.error("Please select a litre before adding to cart");
                    return;
                  }
                  if (product.colors && product.colors.length > 0 && !selectedColor) {
                    toast.error("Please select a color before adding to cart");
                    return;
                  }

                  addToCart(product, selectedColor ?? undefined, selectedLitre ?? undefined);
                }}
                disabled={isOutOfStock}
                className={`flex-1 shadow-md md:shadow-lg transition-all duration-300 rounded-xl font-medium tracking-wide ${!isOutOfStock
                  ? "bg-secondary text-background hover:bg-secondary/90 hover:scale-[1.02]"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>



              {/* 💖 Wishlist Icon */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                className="relative flex items-center justify-center"
              >
                <Heart
                  onClick={() =>
                    isInWishlist(product._id, selectedColor)
                      ? removeFromWishlist(product._id, selectedColor)
                      : addToWishlist(product, selectedColor)
                  }
                  className={`h-8 w-8 cursor-pointer transition-all duration-300 ${isInWishlist(product._id, selectedColor)
                    ? "text-red-500 fill-red-500 drop-shadow-sm"
                    : "text-muted-foreground hover:text-red-500"
                    }`}
                />
                {isInWishlist(product._id, selectedColor) && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 shadow">
                    ♥
                  </span>
                )}
              </motion.div>
            </div>
            {/* ⭐ Customer Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-20"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                    Customer Reviews
                  </h2>

                  {/* Average Rating */}
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="text-lg font-semibold text-foreground">
                      {(
                        product.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
                        product.reviews.length
                      ).toFixed(1)}{" "}
                      / 5
                    </span>
                    <span className="text-sm text-foreground/60">
                      ({product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>

                {/* Reviews Section */}
                {product.reviews.length > 1 ? (
                  // 🔁 Use Swiper for many reviews
                  <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={true}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    breakpoints={{
                      640: { slidesPerView: 1 },
                      768: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                    }}
                    className="pb-10"
                  >
                    {product.reviews.map((review: any, idx: number) => (
                      <SwiperSlide key={idx}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="border border-foreground/10 rounded-2xl p-6 bg-background/70 shadow-sm hover:shadow-md h-full"
                        >
                          {/* Header */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-full bg-secondary text-background flex items-center justify-center font-semibold uppercase">
                              {review.userName ? review.userName.charAt(0) : "A"}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-foreground">
                                {review.userName || "Anonymous"}
                              </h4>
                              <p className="text-xs text-foreground/60">Verified Buyer</p>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-yellow-400 text-sm ${i < review.rating ? "opacity-100" : "opacity-30"}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Comment */}
                          <p className="text-foreground/80 leading-relaxed italic">
                            “{review.comment || "No comment provided."}”
                          </p>

                          {review.date && (
                            <p className="text-xs text-foreground/50 mt-3">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          )}
                        </motion.div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  // 🧱 Simple Grid for few reviews
                  <div className="grid gap-6 md:grid-cols-2">
                    {product.reviews.map((review: any, idx: number) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="border border-foreground/10 rounded-2xl p-6 bg-background/70 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 rounded-full bg-secondary text-background flex items-center justify-center font-semibold uppercase">
                            {review.userName ? review.userName.charAt(0) : "A"}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-foreground">
                              {review.userName || "Anonymous"}
                            </h4>
                            <p className="text-xs text-foreground/60">Verified Buyer</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-yellow-400 text-sm ${i < review.rating ? "opacity-100" : "opacity-30"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground/80 leading-relaxed italic">
                          “{review.comment || "No comment provided."}”
                        </p>
                        {review.date && (
                          <p className="text-xs text-foreground/50 mt-3">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}





          </motion.div>

        </div>


        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-10 text-center">
              You May Also Like
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {suggestedProducts.map((item, index) => (
                <div key={item._id} className="snap-center min-w-[250px] md:min-w-0">
                  <ProductCard product={item} index={index} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
