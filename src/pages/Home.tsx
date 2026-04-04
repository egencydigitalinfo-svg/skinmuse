'use client'

import { Link } from 'react-router-dom';
import { ArrowBigLeft, ArrowBigRight, ArrowRight, ArrowUpAZ, ArrowUpRight } from 'lucide-react';
import { FiCopy } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { Cat } from '@/types/category';
import { skinType } from '@/types/skintype';

const API_BASE = import.meta.env.VITE_API_URL || "https://backendskinmuse.vercel.app/api";



const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [hotSaleProducts, setHotSaleProducts] = useState<Product[]>([]);
  const [skinTypes, setSkinTypes] = useState<skinType[]>([]);
  const [brands, setBrands] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [banner, setBanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredBrands, setFeaturedBrands] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(true);
  const [promoImage, setPromoImage] = useState<any[]>([]);

  // OPTIONAL: show only once per session
  useEffect(() => {
    const isClosed = sessionStorage.getItem("popupClosed");
    if (isClosed) setShowPopup(false);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("popupClosed", "true");
  };

  const [copied, setCopied] = useState(false);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);

  };



  // Fetch featured brands from backend
  useEffect(() => {
    const fetchFeaturedBrands = async () => {
      try {
        const res = await axios.get(`${API_BASE}/brands`);
        const featured = (res.data.brands || []).filter(brand => brand.isFeatured);
        setFeaturedBrands(featured);
      } catch (error) {
        console.error("❌ Error loading featured brands:", error);
        setFeaturedBrands([]);
      }
    };
    fetchFeaturedBrands();
  }, []);

  useEffect(() => {
    const fetchPromoImage = async () => {
      try {
        const res = await axios.get(`${API_BASE}/images`);
        // Use the first image from the array
        const images = res.data || [];
        setPromoImage(images);
      } catch (error) {
        console.error("❌ Error loading images:", error);
        setPromoImage([]);
      }
    };

    fetchPromoImage();
  }, []);


  // === FETCH EXISTING DATA ===
  const fetchData = async () => {
    try {
      const [promoRes] = await Promise.all([
        axios.get(`${API_BASE}/promocodes`),
      ]);
      setPromoCodes(promoRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const res = await fetch("https://backendskinmuse.vercel.app/api/hero-banners");
        const data = await res.json();
        setHeroBanners(data || []);
      } catch (err) {
        console.error("❌ Error fetching hero banners:", err);
        setHeroBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBanners();
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("https://backendskinmuse.vercel.app/api/banners");
        const data = await res.json();
        setBanner(data || []);
      } catch (err) {
        console.error("❌ Error fetching hero banners:", err);
        setBanner([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const [categories, setCategories] = useState<Cat[]>([]);
  useEffect(() => {
    axios.get("https://backendskinmuse.vercel.app/api/category")
      .then((res) => setCategories(res.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, []);


  // ✅ Fetch data from backend
  useEffect(() => {
    const fetchSkinTypes = async () => {
      try {
        const res = await fetch(`https://backendskinmuse.vercel.app/api/skinType`);
        const data = await res.json();
        setSkinTypes(data);
      } catch (error) {
        console.error("❌ Failed to fetch skin types:", error);
      }
    };

    fetchSkinTypes();
  }, []);


  // ✅ Move these ABOVE the conditional return
  const categorySwiperRef = useRef(null);
  const brandSwiperRef = useRef(null);
  const shouldReduceMotion = useReducedMotion?.() || false;

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };


  // Fetch brands from backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API_BASE}/brands`);
        // Ensure we have an array
        const brandData = Array.isArray(res.data) ? res.data : res.data.brands || [];
        setBrands(brandData);
      } catch (error) {
        console.error('❌ Error loading brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products/highlights`);
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




  // ✅ Now it’s safe to conditionally return
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
      </div>
    );

const parentCategories = categories.filter(cat => !cat.parent_id);
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden text-white">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 7000,
            disableOnInteraction: false,
          }}
          className="w-full h-[70vh] sm:h-[75vh] md:h-[90vh] lg:h-[95vh]"
        >
          {heroBanners.map((banner) => (
            <SwiperSlide key={banner._id}>
              <Link to={`/products?category=${banner.link}`}>
                <div
                  className="relative w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />

              </Link>
            </SwiperSlide>
          ))}

        </Swiper>
      </section>


      {/* === Featured Brands Section === */}
      <section className="py-10 sm:py-10">
        <div className="container">
          <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-10">
            Featured Brands
          </h2>


          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.1 }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              show: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1, duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            {brands && brands.length > 0 ? (
              brands
                .filter((brand) => brand.isFeatured) // ✅ only brands with featured flag
                .slice(0, 12)
                .map((brand, index) => (
                  <motion.div
                    key={brand._id || index}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Link
                      key={brand._id || brand.id}
                      to={`/products?brand=${brand._id || brand.id}`}
                    >
                      <div className="flex items-center justify-center h-32 sm:h-36 bg-white">
                        <img
                          src={brand.logo || "/placeholder.png"}
                          alt={brand.name}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {brand.discount && (
                        <div className="bg-red-600 text-white text-center py-2 text-sm sm:text-base font-semibold uppercase tracking-wide">
                          {brand.discount}% Off
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No discounted brands available
              </p>
            )}
          </motion.div>
        </div>
      </section>
      <section className="bg-background">
        <div className="container">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
          >
            {featuredBrands && featuredBrands.length > 0 ? (
              featuredBrands.map((brand) => (
                <SwiperSlide key={brand._id}>
                  <Link
                    key={brand._id || brand.id}
                    to={`/products?brand=${brand._id || brand.id}`}
                  >
                    <div className="bg-background rounded-lg shadow hover:shadow-lg transition duration-300 overflow-hidden">
                      <div className="relative">
                        <img
                          src={brand.featuredImage || "/placeholder.svg"}
                          alt={brand.name}
                          className="w-full h-48 sm:h-56 object-cover rounded-t-lg"
                        />
                        <span className="absolute bottom-3 right-3 bg-background rounded-full p-2 shadow">
                          <ArrowUpRight />
                        </span>
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold mb-1">{brand.name}</h3>
                        {brand.discount && (
                          <p className="text-sm text-gray-500">FLAT {brand.discount}% OFF</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No featured brands available
              </p>
            )}
          </Swiper>
        </div>
      </section>

      {/* <section className="py-10 sm:py-10">
        <div className="container">
          <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-10">
            Shop by Category
          </h2>

          <div
            onMouseEnter={() => categorySwiperRef.current?.autoplay?.stop()}
            onMouseLeave={() => categorySwiperRef.current?.autoplay?.start()}
          >
            <Swiper
              modules={[Autoplay]}
              spaceBetween={12}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 2 },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={800}
              allowTouchMove={true}
              className="rounded-lg"
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat._id}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.category)}`}
                    className="group relative border-foreground overflow-hidden rounded-lg aspect-[5/3] sm:aspect-[5/2] bg-card block"
                  >
                    <img
                      src={cat.image || "/images/placeholder.png"}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 to-foreground/60 z-10" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-background text-center px-2">
                      <h3 className="text-2xl sm:text-4xl font-serif font-bold mb-1 sm:mb-2">
                        {cat.title}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section> */}

      

      <section className="py-10 sm:py-10">
        <div className="container">
          <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-10">
            Shop by Category
          </h2>

          <div
            onMouseEnter={() => categorySwiperRef.current?.autoplay?.stop()}
            onMouseLeave={() => categorySwiperRef.current?.autoplay?.start()}
          >
            <Swiper
              modules={[Autoplay]}
              spaceBetween={12}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 2 },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={800}
              allowTouchMove={true}
              className="rounded-lg"
            >
              {parentCategories.map((cat) => (
                <SwiperSlide key={cat._id}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.category)}`}
                    className="group relative border-foreground overflow-hidden rounded-lg aspect-[5/3] sm:aspect-[5/2] bg-card block"
                  >
                    <img
                      src={cat.image || "/images/placeholder.png"}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 to-foreground/60 z-10" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-background text-center px-2">
                      <h3 className="text-2xl sm:text-4xl font-serif font-bold mb-1 sm:mb-2">
                        {cat.title}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>


      {/* === SHOP BY BRAND === */}
      {/* <section>
        <div className="container">
          <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-5">
            Shop by Brand
          </h2>
          <div
            onMouseEnter={() => brandSwiperRef.current?.autoplay?.stop()}
            onMouseLeave={() => brandSwiperRef.current?.autoplay?.start()}
          >
            <Swiper
              modules={[Autoplay]}
              spaceBetween={12}
              slidesPerView={1}

              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 2 },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={800}
              allowTouchMove={true}
              className="rounded-lg"
            >
              {["makeup", "skincare", "haircare", "bath&body"].map((cat) => (
                <SwiperSlide key={cat}>
                  <Link
                    to={`/brands?category=${cat}`}
                    className="group bg-background/90 text-foreground border border-foreground rounded-2xl p-2 sm:p-8 hover:shadow-xl transition-all block"
                  >
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-2xl sm:text-3xl font-bold font-serif mb-2 sm:mb-3 capitalize">
                        {cat.replace("&", " & ")} Brands
                      </h3>
                      <p className=" text-xs sm:text-sm uppercase tracking-wider mb-6 sm:mb-8">
                        View All Brands
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                        {Array.isArray(brands)
                          ? brands
                            .filter((b) => b.category === cat)
                            .slice(0, 4)
                            .map((brand) => (
                              <Link
                                key={brand._id || brand.id}
                                to={`/products?brand=${brand._id || brand.id}`}
                                className="relative flex flex-col items-center gap-2 sm:gap-3 group-hover:scale-105 transition-transform"
                              >
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted/30 rounded-full flex items-center justify-center overflow-hidden shadow-xl">
                                  <img
                                    src={brand.logo || "/images/placeholder-brand.png"}
                                    alt={brand.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {brand.discount && (
                                  <span className="absolute -top-2 right-[0.5rem] bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shadow-md animate-shake">
                                    Upto {brand.discount}%
                                  </span>
                                )}
                                <span className="text-xs sm:text-sm font-medium text-center">
                                  {brand.name}
                                </span>
                              </Link>
                            ))
                          : null}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section> */}

      <section className="pb-10 overflow-hidden">
        <div className="container">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}

          >
            <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-14">
              Find Your Skin Type
            </h2>
          </motion.div>

          <Swiper
            modules={[Autoplay]}
            slidesPerView={3.5}
            centeredSlides={true}
            loop={true}
            loopedSlides={skinTypes.length}
            speed={800}
            allowTouchMove={true}
            grabCursor={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            freeMode={true}
            freeModeMomentum={false}
            breakpoints={{
              0: { slidesPerView: 1.6, spaceBetween: 20 },
              640: { slidesPerView: 2.4, spaceBetween: 30 },
              1024: { slidesPerView: 3.5, spaceBetween: 40 },
            }}
            className="!overflow-visible"
          >
            {skinTypes.concat(skinTypes).map((type, index) => (
              <SwiperSlide key={index} className="flex justify-center">
                {({ isActive }) => (
                  <motion.div
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView={shouldReduceMotion ? undefined : "show"}
                    viewport={{ once: false, amount: 0.1 }}
                    variants={fadeUpVariants}
                    className="flex flex-col items-center"
                  >
                    <Link
                      to={`/products?skinType=${type.skinTypes}`}
                      className={`group flex flex-col items-center gap-3 transition-transform duration-700 ${isActive ? "scale-110" : "scale-90 opacity-80"
                        }`}
                    >
                      <img
                        src={type.image}
                        alt={type.title}
                        className={`
    w-[7rem] h-[7rem] 
    md:w-[12rem] md:h-[12rem] 
    lg:w-[12rem] lg:h-[12rem] 
    object-cover rounded-full 
    transition-all duration-700 
    ${isActive ? "shadow-lg shadow-red-200 scale-105" : "hover:scale-105"}
  `}
                      />

                      <span
                        className={`font-serif font-semibold text-sm sm:text-base transition-colors duration-300 ${isActive ? "text-foreground" : "text-foreground/60"
                          }`}
                      >
                        {type.title}
                      </span>
                    </Link>
                  </motion.div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>





      {/* === Featured Products Section === */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-8 sm:py-8">
          <div className="container">
            <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-10">
              Featured Products
            </h2>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.12, duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              {/* Featured Products */}
              {featuredProducts && featuredProducts.length > 0 && featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div key={product._id} variants={fadeUpVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}

            </motion.div>

            <div className="text-center mt-10 sm:mt-12">
              <Button asChild size="lg" className='sm:size-md md:size-lg bg-foreground text-white hover:bg-foreground/90 transition-all duration-300 shadow-md'>
                <Link to="/products?filter=featured">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}







      {/* === Trending Products Section === */}
      {trendingProducts && trendingProducts.length > 0 && (
        <section className="pb-10 sm:pb-10">
          <div className="container">
            <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-10">
              Trending Products
            </h2>


            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.12, duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              {/* Trending Products */}
              {trendingProducts && trendingProducts.length > 0 && trendingProducts.slice(0, 8).map((product, index) => (
                <motion.div key={product._id} variants={fadeUpVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-10 sm:mt-10">
              <Button asChild size="lg" className='sm:size-md md:size-lg bg-foreground text-white hover:bg-foreground/90 transition-all duration-300 shadow-md'>
                <Link to="/products?filter=trending">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

      )}


      {/* === Banner Before Hot Sale === */}
      {banner.map((banner) => (
        <motion.section
          key={banner._id}
          className="relative cursor-pointer"
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        // onClick={() => (window.location.href = `/products?category=${banner.link}`)}
        >
          <Link to={banner.link}>
            <motion.img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
              whileInView={{ scale: 1, opacity: 1 }}
              whileHover={{ opacity: 0.9 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

          </Link>
          {/* Optional title overlay
          <div className="absolute inset-0 bg-black/30 flex items-end p-6 rounded-xl">
            <h2 className="text-white text-2xl font-semibold drop-shadow-lg">
              {banner.title}
            </h2>
          </div> */}
        </motion.section>
      ))}

      {/* === Hot Sale Products Section === */}
      {hotSaleProducts && hotSaleProducts.length > 0 && (
        <section className="py-10 sm:py-10">
          <div className="container">
            <div className="flex flex-col items-center space-y-4 sm:space-y-6">
              <h2 className="text-3xl md:text-4xl text-foreground font-bold font-serif text-center mb-10">
                Hot Sale Products
              </h2>
            </div>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.12, duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              {/* Hot Sale Products */}
              {hotSaleProducts && hotSaleProducts.length > 0 && hotSaleProducts.slice(0, 8).map((product, index) => (
                <motion.div key={product._id} variants={fadeUpVariants}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-10 sm:mt-12">
              <Button asChild size="lg" className='sm:size-md md:size-lg bg-foreground text-white hover:bg-foreground/90 transition-all duration-300 shadow-md'>
                <Link to="/products?filter=hotsale">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}



      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white w-[92%] max-w-[420px] p-7 rounded-3xl shadow-2xl relative animate-popupFade">

            {/* Modern Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 flex items-center justify-center h-9 w-9 rounded-full 
             bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition shadow-sm"
            >
              ✕
            </button>

            {/* Image Section */}
            <div className="w-full mb-5">
              <img
                src={promoImage && promoImage.length > 0 ? promoImage[0].imageUrl : "placeholder.svg"}
                alt={promoImage && promoImage.length > 0 ? promoImage[0].title : "Popup"}
                className="w-full h-44 object-cover rounded-2xl shadow-md"
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">
              Welcome to <span className="text-foreground font-bold">SkinMuse</span>
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              Unlock exclusive offers and enjoy a premium shopping experience.
            </p>

            {/* Promo Code Section */}
            {promoCodes && promoCodes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-foreground">Your Promo Code</h3>

                {/* Promo Code Box */}
                <div
                  className="bg-gray-100 border border-gray-200 p-4 rounded-xl 
             text-foreground font-mono text-xl tracking-wide shadow-inner 
             flex items-center justify-between"
                >
                  <span>{promoCodes[0].code}</span>

                  <button
                    onClick={() => copyCode(promoCodes[0].code)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    <FiCopy className="text-xl" />
                  </button>
                </div>

                {/* Copied Text */}
                {copied && (
                  <p className="text-green-600 text-sm mt-2">Copied!</p>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={closePopup}
              className="bg-foreground text-white w-full py-3 rounded-xl text-lg font-medium
             hover:bg-foreground/90 transition shadow-md"
            >
              Continue
            </button>

          </div>
        </div>
      )}



    </div>
  );
};

export default Home;
