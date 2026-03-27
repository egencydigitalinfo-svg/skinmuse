import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import axios from 'axios';
import { SkinType, ProductCategory } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, XCircle, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backendskinmuse.vercel.app/api';

const Products = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [products, setProducts] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;
  const skinTypeParam = searchParams.get('skinType') as SkinType | null;
  const brandParam = searchParams.get('brand');
  const filterParam = searchParams.get('filter');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(10000);


  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(categoryParam || 'all');
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType | 'all'>(skinTypeParam || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string | 'all'>(brandParam || 'all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'featured' | 'trending' | 'hotsale'>(
    (filterParam as any) || 'all'
  );
  const [minPrice, setMinPrice] = useState<number>(minPriceParam ? Number(minPriceParam) : 0);
  const [maxProductPrice, setMaxProductPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0); // will set after fetching products

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products`);
        const data = res.data;

        const productArray = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];

        setProducts(productArray);

        if (productArray.length > 0) {
          const maxPriceValue = Math.max(...productArray.map(p => p.price || 0));
          setMaxProductPrice(maxPriceValue); // store absolute max
          setMaxPrice(maxPriceValue);        // initialize filter
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Responsive listener
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const normalize = (str = "") =>
    str.toLowerCase()
      .replace(/&/g, "and")
      .replace(/\s+/g, "")
      .replace(/-/g, "");

const CATEGORY_MAP: Record<string, string> = {
  // 🔥 BATH & BODY — all possible searches
  "bathandbody": "bath&body",
  "bath and body": "bath&body",
  "bath & body": "bath&body",
  "bathbody": "bath&body",
  "bath-body": "bath&body",
  "bathnbody": "bath&body",
  "bath n body": "bath&body",
  "bath n' body": "bath&body",
  "bathn'body": "bath&body",
  "bath n-body": "bath&body",
  "bath-n-body": "bath&body",
  "bath &body": "bath&body",
  "bath& body": "bath&body",
  "bath  body": "bath&body",
  "bathbodycare": "bath&body",
  "bodycare": "bath&body",
  "body care": "bath&body",
  "bathcare": "bath&body",
  "bath care": "bath&body",
  "body & bath": "bath&body",
  "bodyandbath": "bath&body",
  "bathandbodyworks": "bath&body",
  "bath body": "bath&body",
  "bathand body": "bath&body",
  "bath andbody": "bath&body",

  // 🔥 SKINCARE — all possible searches
  "skincare": "skincare",
  "skin care": "skincare",
  "skin-care": "skincare",
  "skin_care": "skincare",
  "skincarer": "skincare",
  "skin": "skincare",           // users often just type "skin"
  "skncare": "skincare",
  "skincre": "skincare",
  "skincar": "skincare",
  "facecare": "skincare",
  "face care": "skincare",
  "facialcare": "skincare",
  "facial care": "skincare",

  // 🔥 HAIRCARE — all possible searches
  "haircare": "haircare",
  "hair care": "haircare",
  "hair-care": "haircare",
  "hair_care": "haircare",
  "haircar": "haircare",
  "hairecare": "haircare",
  "hairproducts": "haircare",
  "hair products": "haircare",
  "hair product": "haircare",
  "hair": "haircare",           // users often type just "hair"
  "hairtreatment": "haircare",
  "hair treatment": "haircare",
  "hairtreatments": "haircare",
  "hair-treatments": "haircare",

  // 🔥 MAKEUP — all possible searches
  "makeup": "makeup",
  "make up": "makeup",
  "make-up": "makeup",
  "make_up": "makeup",
  "mkup": "makeup",
  "makeu": "makeup",
  "cosmetics": "makeup",
  "cosmetic": "makeup",
  "beauty": "makeup",
  "beautyproducts": "makeup",
  "beauty products": "makeup",
  "beauty product": "makeup",

  // 🔥 COMMON MISSPELLINGS for categories
  "bathndbody": "bath&body",
  "bathnndbody": "bath&body",
  "bath anb body": "bath&body",
  "bath &boddy": "bath&body",
  "skin-car": "skincare",
  "skn-care": "skincare",
  "skn care": "skincare",
  "hair-car": "haircare",
  "hair car": "haircare",
  "makep": "makeup",
  "makeupp": "makeup",
};


useEffect(() => {
  const normalized = normalize(searchQuery);

  // If search looks like a category, auto-select it
  if (CATEGORY_MAP[normalized]) {
    const cat = CATEGORY_MAP[normalized];
    setSelectedCategory(cat);
    updateParam("category", cat);
  }
}, [searchQuery]);


  useEffect(() => {
    // Sync search query immediately
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);

    // Sync category
    const urlCategory = searchParams.get("category") || "all";
    setSelectedCategory(urlCategory);

    // Sync filter
    const urlFilter = searchParams.get("filter") || "all";
    setSelectedFilter(urlFilter);

    // Sync brand
    const urlBrand = searchParams.get("brand") || "all";
    setSelectedBrand(urlBrand);

    // Sync skin type
    const urlSkin = searchParams.get("skinType") || "all";
    setSelectedSkinType(urlSkin);

    // Sync price
    const urlMin = Number(searchParams.get("minPrice")) || 0;
    const urlMax = Number(searchParams.get("maxPrice")) || maxProductPrice;

    setMinPrice(urlMin);
    setMaxPrice(urlMax);

  }, [searchParams, maxProductPrice]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products`);
        const data = res.data;

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.warn("Unexpected product format:", data);
          setProducts([]);
        }
      } catch (err) {
        console.error("❌ Error loading products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const [brands, setBrands] = useState<{ _id: string; name: string; category: string }[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API_BASE}/brands`);
        if (Array.isArray(res.data)) setBrands(res.data);
        else if (res.data?.brands && Array.isArray(res.data.brands)) setBrands(res.data.brands);
        else setBrands([]);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };
    fetchBrands();
  }, []);

const updateParam = (key: string, value: string | "all") => {
  const newParams = new URLSearchParams(searchParams);

  // ALWAYS remove search when any filter other than search is changed
  if (key !== "search") {
    newParams.delete("search");
    setSearchQuery(""); // clear search state too
  }

  if (value === "all" || value === "") {
    newParams.delete(key);
  } else {
    newParams.set(key, value);
  }

  // Sync other filters ONLY if they are active
  if (selectedCategory !== "all" && key !== "category") newParams.set("category", selectedCategory);
  if (selectedBrand !== "all" && key !== "brand") newParams.set("brand", selectedBrand);
  if (selectedFilter !== "all" && key !== "filter") newParams.set("filter", selectedFilter);
  if (selectedSkinType !== "all" && key !== "skinType") newParams.set("skinType", selectedSkinType);

  // Price only if changed
  if (minPrice > 0) newParams.set("minPrice", String(minPrice));
  if (maxPrice < maxProductPrice) newParams.set("maxPrice", String(maxPrice));

  setSearchParams(newParams);
};
const updatePriceParam = (min: number, max: number) => {
  const newParams = new URLSearchParams(searchParams);

  // Remove search because user is now filtering
  newParams.delete("search");
  setSearchQuery("");

  if (selectedCategory !== "all") newParams.set("category", selectedCategory);
  if (selectedBrand !== "all") newParams.set("brand", selectedBrand);
  if (selectedFilter !== "all") newParams.set("filter", selectedFilter);
  if (selectedSkinType !== "all") newParams.set("skinType", selectedSkinType);

  if (min > 0) newParams.set("minPrice", String(min));
  if (max < maxProductPrice) newParams.set("maxPrice", String(max));

  setSearchParams(newParams);
};

  // ✅ Keep filters synced with URL
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (skinTypeParam) setSelectedSkinType(skinTypeParam);
    if (filterParam) setSelectedFilter(filterParam as any);
    if (!filterParam) setSelectedFilter('all');
  }, [categoryParam, skinTypeParam, filterParam]);

  useEffect(() => {
    if (!Array.isArray(brandList)) return; // ✅ safety check
    if (brandParam) {
      setSelectedBrand(brandParam);
      const brand = Array.isArray(brandList)
        ? brandList.find((b) => b.id === selectedBrand)
        : undefined;

      if (brand) setSelectedCategory(brand.category);
    }
  }, [brandParam, brandList]);

  // ✅ Filter logic with Skin Type
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        normalize(product.category).includes(normalize(searchQuery)) ||
        normalize(product.brand?.category || "").includes(normalize(searchQuery));


      const categoryMatch =
        selectedCategory === "all" ||
        normalize(product.category) === normalize(selectedCategory) ||
        normalize(product.brand?.category) === normalize(selectedCategory);


      const brandMatch =
        selectedBrand === "all" ||
        product.brandId === selectedBrand ||
        product.brand?._id === selectedBrand;

      const filterMatch =
        selectedFilter === "all" ||
        (selectedFilter === "featured" && product.isFeatured) ||
        (selectedFilter === "trending" && product.isTrending) ||
        (selectedFilter === "hotsale" && product.isHotSale);

      const priceMatch = product.price >= minPrice && product.price <= maxPrice;

      // ✅ Skin Type match
      let skinTypeMatch = true;
      if (selectedSkinType !== "all" && product.skinType) {
        if (Array.isArray(product.skinType)) {
          skinTypeMatch = product.skinType.some(
            (type: string) => type.toLowerCase() === selectedSkinType
          );
        } else if (typeof product.skinType === "string") {
          skinTypeMatch = product.skinType.toLowerCase() === selectedSkinType;
        }
      }

      return (
        matchesSearch &&
        categoryMatch &&
        brandMatch &&
        filterMatch &&
        priceMatch &&
        skinTypeMatch
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedFilter,
    minPrice,
    maxPrice,
    selectedSkinType,
  ]);


  const availableSkinTypes = useMemo(() => {
    // Use filteredProducts if you want Skin Types based on other active filters
    const relevantProducts = products.filter((product: any) => {
      // Match category filter
      const categoryMatch =
        selectedCategory === 'all' ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        product.brand?.category?.toLowerCase() === selectedCategory.toLowerCase();

      return categoryMatch;
    });

    const typesSet = new Set<string>();

    relevantProducts.forEach((product: any) => {
      if (!product.skinType) return;

      if (Array.isArray(product.skinType)) {
        product.skinType.forEach((type) => {
          if (type && typeof type === 'string') typesSet.add(type.toLowerCase());
        });
      } else if (typeof product.skinType === 'string') {
        typesSet.add(product.skinType.toLowerCase());
      }
    });

    return Array.from(typesSet);
  }, [products, selectedCategory]);



  const availableBrands = useMemo(() => {
    if (!Array.isArray(brandList)) return [];
    if (selectedCategory === 'all') return brandList;
    return brandList.filter((b: any) => b.category === selectedCategory);
  }, [selectedCategory, brandList]);
  const currentBrand = Array.isArray(brandList)
    ? brandList.find((b: any) => b._id === selectedBrand)
    : undefined;


  const getTitle = () => {
    if (selectedFilter === 'featured') return 'Featured Products';
    if (selectedFilter === 'trending') return 'Trending Products';
    if (selectedFilter === 'hotsale') return 'Hot Selling Products';
    return 'All Products';
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background py-12 relative">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-1 text-foreground font-bold">
              {getTitle()}
            </h1>

            <p className="text-sm sm:text-base text-foreground/70 font-medium">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>


            {currentBrand && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {currentBrand.name}
                </Badge>
                <Button size="sm" onClick={() => updateParam('brand', 'all')} className="h-auto p-1 bg-background text-foreground hover:text-foreground hover:bg-secondary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden flex items-center gap-2 bg-background text-foreground border border-secondary hover:bg-background hover:border-secondary"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>


        {/* Filter + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 relative">
          {/* Sidebar */}
          {/* Sidebar with overlay for mobile */}
          {(showFilters && !isDesktop) && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)} // close when clicking outside
            />
          )}

          <motion.aside
            initial={false}
            animate={showFilters ? { x: 0 } : { x: isDesktop ? 0 : "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-muted/40 shadow-2xl overflow-y-auto p-6 
  lg:static lg:z-auto lg:w-80 lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-md lg:p-0"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >

            {/* Close button (mobile) */}
            <div className="flex items-center justify-between text-foreground mb-4 lg:hidden">
              <h2 className=" text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>



            {/* Sidebar header (desktop) */}
            <div className="lg:block bg-background px-6 py-4 border-b border-muted/30 lg:rounded-t-2xl">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Filters</h2>
              <p className="text-xs text-foreground mt-1">
                Refine by product type, category, skin type, and brand
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSkinType('all');
                  setSelectedBrand('all');
                  setSelectedFilter('all');
                  setMinPrice(0);
                  setMaxPrice(maxPrice);
                  setSearchParams(new URLSearchParams());
                }}
                className="w-50 mt-6 bg-foreground text-background text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>

            {/* Filters content */}
            <div className="p-6 space-y-5 divide-y divide-muted/20">
              {/* === Product Type === */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Product Type</h3>
                <div className="flex flex-col gap-2">
                  {([
                    { key: 'all', label: 'All Products' },
                    { key: 'featured', label: 'Featured' },
                    { key: 'trending', label: 'Trending' },
                    { key: 'hotsale', label: 'Hot Sale' },
                  ] as const).map((f) => (
                    <Button
                      key={f.key}
                      variant={selectedFilter === f.key ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedFilter(f.key);
                        updateParam('filter', f.key);
                      }}
                      className={`justify-start text-sm ${selectedFilter === f.key
                        ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                        : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                        }`}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* === Price Range === */}
              <div className="pt-4 space-y-4">
                <h3 className="font-extrabold text-xl text-foreground">Price Range</h3>

                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>
                    Min: <span className="text-foreground font-semibold">Rs {minPrice}</span>
                  </span>
                  <span>
                    Max: <span className="text-foreground font-semibold">Rs {maxPrice}</span>
                  </span>
                </div>

                <div className="relative flex flex-col gap-2">
                  {/* === Min Slider === */}
                  <input
                    type="range"
                    min="0"
                    max={maxAvailablePrice}
                    step="10"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), maxPrice - 10);
                      setMinPrice(val);
                      updatePriceParam(val, maxPrice);
                    }}
                    className="accent-secondary cursor-pointer"
                  />

                  {/* === Max Slider === */}
                  <input
                    type="range"
                    min="0"
                    max={maxAvailablePrice}
                    step="10"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), minPrice + 10);
                      setMaxPrice(val);
                      updatePriceParam(minPrice, val);
                    }}
                    className="accent-secondary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min="0"
                    max={maxAvailablePrice}
                    step="10"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), maxPrice - 10);
                      setMinPrice(val);
                      updatePriceParam(val, maxPrice);
                    }}
                    className="w-1/2 border bg-background text-foreground border-foreground/40 rounded-md px-3 py-1 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    max={maxAvailablePrice}
                    step="10"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), minPrice + 10);
                      setMaxPrice(val);
                      updatePriceParam(minPrice, val);
                    }}
                    className="w-1/2 bg-background text-foreground border border-foreground/40 rounded-md px-3 py-1 text-sm"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(maxAvailablePrice);
                    updatePriceParam(0, maxAvailablePrice);
                  }}
                  className="w-full bg-foreground text-background hover:bg-foreground mt-2 text-sm"
                >
                  Reset Price Filter
                </Button>
              </div>



              {/* === Category === */}
              <div className="pt-4 space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Category</h3>
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory('all');
                    updateParam('category', 'all');
                  }}
                  className={`w-full text-sm ${selectedCategory === 'all'
                    ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                    : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                    }`}
                >
                  All Types
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {(['skincare', 'makeup', 'haircare', 'bath&body'] as const).map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedCategory(cat);
                        updateParam('category', cat);
                      }}
                      className={`justify-start text-sm ${selectedCategory === cat
                        ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                        : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                        }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* === Skin Type === */}
              <div className="pt-4 space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Skin Type</h3>
                <Button
                  variant={selectedSkinType === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedSkinType('all');
                    updateParam('skinType', 'all');
                    scrollToTop();
                  }}
                  className={`w-full text-sm ${selectedSkinType === 'all'
                    ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                    : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                    }`}
                >
                  All Types
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  {availableSkinTypes.length > 0 ? (
                    availableSkinTypes.map((type) => (
                      <Button
                        key={type}
                        variant={selectedSkinType === type ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedSkinType(type as SkinType);
                          updateParam('skinType', type);
                          scrollToTop();
                        }}
                        className={`text-sm ${selectedSkinType === type
                          ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                          : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                          }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))
                  ) : (
                    <p className="text-foreground/70 text-sm">No skin types available</p>
                  )}
                </div>

              </div>

              {/* === Brand === */}
              <div className="pt-4 space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Brand</h3>
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  <Button
                    variant={selectedBrand === 'all' ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedBrand('all');
                      updateParam('brand', 'all');
                      scrollToTop();
                    }}
                    className={`justify-start text-sm ${selectedBrand === 'all'
                      ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                      : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                      }`}
                  >
                    All Brands
                  </Button>

                  {brands.map((brand) => (
                    <Button
                      key={brand._id} // ✅ use _id consistently
                      variant={selectedBrand === brand._id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedBrand(brand._id);
                        updateParam('brand', brand._id);
                        setSelectedCategory(brand.category); // optional: auto-select category
                        scrollToTop();
                      }}
                      className={`justify-start text-sm ${selectedBrand === brand._id
                        ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'

                        : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                        }`}
                    >
                      {brand.name}
                    </Button>
                  ))}
                </div>
              </div>


            </div>
          </motion.aside>

          {/* Products Section */}
          <section>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateParam("search", e.target.value);
                  scrollToTop();
                }}
                className="pl-9 pr-8 bg-background text-foreground border border-foreground/50 focus:border-foreground focus:foreground placeholder:text-foreground/60 rounded-md transition-all duration-200"
              />
              {searchQuery && (
                <X
                  className="absolute right-3 top-2.5 h-4 w-4 cursor-pointer text-foreground hover:text-foreground/80 transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    updateParam('search', '');
                  }}
                />
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                initial="hidden"
                animate="show"
              >
                {filteredProducts.map((product: any, index: number) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-white border border-muted/40 rounded-xl shadow-sm">
                <p className="text-lg text-muted-foreground">No products found matching your filters.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Products;
