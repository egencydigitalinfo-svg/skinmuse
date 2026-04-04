import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import axios from 'axios';
import { SkinType, ProductCategory } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, XCircle, Filter, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://skinmusebackend-delta.vercel.app/api';

// ── Helpers ─────────────────────────────────────────────────────────────────

const normalize = (str = '') =>
  str.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '').replace(/-/g, '');

/** Extract category/subcategory title from either a populated object or a plain string */
const extractTitle = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'object') return field.title || '';
  return field; // plain string (legacy)
};

/** Extract category/subcategory _id from either a populated object or a plain string */
const extractId = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'object') return field._id?.toString() || '';
  return field; // plain string treated as _id (legacy)
};

// ── Component ────────────────────────────────────────────────────────────────

const Products = () => {
  const [allCategories,  setAllCategories]  = useState<any[]>([]);
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [isDesktop,      setIsDesktop]      = useState(false);
  const [products,       setProducts]       = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam    = searchParams.get('category')    as ProductCategory | null;
  const skinTypeParam    = searchParams.get('skinType')    as SkinType | null;
  const brandParam       = searchParams.get('brand');
  const filterParam      = searchParams.get('filter');
  const subcategoryParam = searchParams.get('subcategory');

  const [maxAvailablePrice, setMaxAvailablePrice] = useState(10000);
  const [maxProductPrice,   setMaxProductPrice]   = useState(0);

  const [selectedCategory,    setSelectedCategory]    = useState<string>(categoryParam || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subcategoryParam || 'all');
  const [selectedSkinType,    setSelectedSkinType]    = useState<SkinType | 'all'>(skinTypeParam || 'all');
  const [selectedBrand,       setSelectedBrand]       = useState<string>(brandParam || 'all');
  const [selectedFilter,      setSelectedFilter]      = useState<'all' | 'featured' | 'trending' | 'hotsale'>((filterParam as any) || 'all');
  const [minPrice,            setMinPrice]            = useState<number>(0);
  const [maxPrice,            setMaxPrice]            = useState<number>(0);
  const [searchQuery,         setSearchQuery]         = useState(searchParams.get('search') || '');
  const [showFilters,         setShowFilters]         = useState(false);
  const [expandedCategory,    setExpandedCategory]    = useState<string | null>(categoryParam || null);

  const [brands, setBrands] = useState<{ _id: string; name: string; category: string }[]>([]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── Fetch products ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res  = await axios.get(`${API_BASE}/products`);
        const data = res.data;
        const arr  = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
        setProducts(arr);
        if (arr.length > 0) {
          const max = Math.max(...arr.map((p: any) => p.price || 0));
          setMaxProductPrice(max);
          setMaxAvailablePrice(max);
          setMaxPrice(max);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Fetch categories ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/category`);
        const all: any[] = Array.isArray(res.data) ? res.data : [];
        setAllCategories(all);
        setMainCategories(all.filter((cat: any) => !cat.parent_id));
      } catch (err) {
        console.error('Category fetch error', err);
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch brands ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API_BASE}/brands`);
        if (Array.isArray(res.data)) setBrands(res.data);
        else if (res.data?.brands && Array.isArray(res.data.brands)) setBrands(res.data.brands);
        else setBrands([]);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      }
    };
    fetchBrands();
  }, []);

  // ── Responsive ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Sync URL → state ───────────────────────────────────────────────────────
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    const urlCat = searchParams.get('category') || 'all';
    setSelectedCategory(urlCat);
    if (urlCat !== 'all') setExpandedCategory(urlCat);
    setSelectedSubcategory(searchParams.get('subcategory') || 'all');
    setSelectedFilter((searchParams.get('filter') || 'all') as any);
    setSelectedBrand(searchParams.get('brand') || 'all');
    setSelectedSkinType((searchParams.get('skinType') || 'all') as SkinType | 'all');
    const urlMin = Number(searchParams.get('minPrice')) || 0;
    const urlMax = Number(searchParams.get('maxPrice')) || maxProductPrice;
    setMinPrice(urlMin);
    if (urlMax > 0) setMaxPrice(urlMax);
  }, [searchParams, maxProductPrice]);

  // ── URL updater ────────────────────────────────────────────────────────────
  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (key !== 'search') { p.delete('search'); setSearchQuery(''); }
    if (value === 'all' || value === '') p.delete(key);
    else p.set(key, value);
    if (selectedCategory    !== 'all' && key !== 'category')    p.set('category',    selectedCategory);
    if (selectedSubcategory !== 'all' && key !== 'subcategory') p.set('subcategory', selectedSubcategory);
    if (selectedBrand       !== 'all' && key !== 'brand')       p.set('brand',       selectedBrand);
    if (selectedFilter      !== 'all' && key !== 'filter')      p.set('filter',      selectedFilter);
    if (selectedSkinType    !== 'all' && key !== 'skinType')    p.set('skinType',    selectedSkinType);
    if (minPrice > 0)                                            p.set('minPrice',    String(minPrice));
    if (maxPrice < maxProductPrice)                              p.set('maxPrice',    String(maxPrice));
    setSearchParams(p);
  };

  const updatePriceParam = (min: number, max: number) => {
    const p = new URLSearchParams(searchParams);
    p.delete('search'); setSearchQuery('');
    if (selectedCategory    !== 'all') p.set('category',    selectedCategory);
    if (selectedSubcategory !== 'all') p.set('subcategory', selectedSubcategory);
    if (selectedBrand       !== 'all') p.set('brand',       selectedBrand);
    if (selectedFilter      !== 'all') p.set('filter',      selectedFilter);
    if (selectedSkinType    !== 'all') p.set('skinType',    selectedSkinType);
    if (min > 0)                       p.set('minPrice',    String(min));
    if (max < maxProductPrice)         p.set('maxPrice',    String(max));
    setSearchParams(p);
  };

  // ── Get subcategories for a main category by _id ───────────────────────────
  const getSubcategories = (categoryId: string) =>
    allCategories.filter(
      (cat: any) =>
        cat.parent_id?._id === categoryId ||
        cat.parent_id === categoryId
    );

  // ── Product count per subcategory ──────────────────────────────────────────
  // Backend returns subcategory as { _id, title } object — match by _id directly.
  const getSubcategoryCount = (sub: any): number => {
    return products.filter((p: any) => {
      const pSub = p.subcategory;
      if (!pSub) return false;
      // Populated object (standard backend response)
      if (typeof pSub === 'object') return pSub._id?.toString() === sub._id?.toString();
      // Legacy plain string — could be _id or title
      return pSub === sub._id?.toString() || pSub === sub.title;
    }).length;
  };

  // ── Filtered products ──────────────────────────────────────────────────────
  // selectedCategory    = main category _id (or 'all')  — stored in URL / state
  // selectedSubcategory = subcategory _id (or 'all')    — stored in URL / state
  // product.category    = { _id, title } object         — from backend
  // product.subcategory = { _id, title } object         — from backend
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      // ── Extract ids & titles from populated objects ──
      const productCatId    = extractId(product.category);
      const productCatTitle = extractTitle(product.category);
      const productSubId    = extractId(product.subcategory);
      const productSubTitle = extractTitle(product.subcategory);

      // ── Search ──
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        normalize(productCatTitle).includes(normalize(searchQuery)) ||
        normalize(product.brand?.category || '').includes(normalize(searchQuery)) ||
        productSubTitle.toLowerCase().includes(searchQuery.toLowerCase());

      // ── Category: match by _id (most reliable) ──
      const categoryMatch =
        selectedCategory === 'all' ||
        productCatId === selectedCategory;

      // ── Subcategory: match by _id (most reliable) ──
      const subcategoryMatch =
        selectedSubcategory === 'all' ||
        productSubId === selectedSubcategory;

      // ── Brand ──
      const brandMatch =
        selectedBrand === 'all' ||
        product.brandId === selectedBrand ||
        product.brand?._id === selectedBrand ||
        product.brand?._id?.toString() === selectedBrand;

      // ── Filter flags ──
      const filterMatch =
        selectedFilter === 'all' ||
        (selectedFilter === 'featured' && product.isFeatured) ||
        (selectedFilter === 'trending' && product.isTrending) ||
        (selectedFilter === 'hotsale'  && product.isHotSale);

      // ── Price ──
      const priceMatch = product.price >= minPrice && product.price <= maxPrice;

      // ── Skin type ──
      let skinTypeMatch = true;
      if (selectedSkinType !== 'all' && product.skinType) {
        if (Array.isArray(product.skinType)) {
          skinTypeMatch = product.skinType.some(
            (t: string) => t.toLowerCase() === selectedSkinType
          );
        } else {
          skinTypeMatch = product.skinType.toLowerCase() === selectedSkinType;
        }
      }

      return matchesSearch && categoryMatch && subcategoryMatch && brandMatch && filterMatch && priceMatch && skinTypeMatch;
    });
  }, [
    products, searchQuery,
    selectedCategory, selectedSubcategory,
    selectedBrand, selectedFilter,
    minPrice, maxPrice, selectedSkinType,
  ]);

  // ── Available skin types (scoped to selected category) ────────────────────
  const availableSkinTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      const productCatId = extractId(p.category);
      const catMatch =
        selectedCategory === 'all' || productCatId === selectedCategory;
      if (!catMatch || !p.skinType) return;
      (Array.isArray(p.skinType) ? p.skinType : [p.skinType]).forEach((t: string) => {
        if (t) set.add(t.toLowerCase());
      });
    });
    return Array.from(set);
  }, [products, selectedCategory]);

  // ── Badge label for active subcategory ────────────────────────────────────
  const selectedSubCatObj     = allCategories.find((c) => c._id === selectedSubcategory);
  const subcategoryBadgeLabel = selectedSubCatObj?.title || selectedSubcategory;

  const currentBrand = brands.find((b) => b._id === selectedBrand);

  const getTitle = () => {
    if (selectedFilter === 'featured') return 'Featured Products';
    if (selectedFilter === 'trending') return 'Trending Products';
    if (selectedFilter === 'hotsale')  return 'Hot Selling Products';
    return 'All Products';
  };

  // ── Category accordion toggle ──────────────────────────────────────────────
  const handleCategoryClick = (catId: string) => {
    if (expandedCategory === catId) {
      setExpandedCategory(null);
      setSelectedCategory('all');
      setSelectedSubcategory('all');
      updateParam('category', 'all');
    } else {
      setExpandedCategory(catId);
      setSelectedCategory(catId);
      setSelectedSubcategory('all');
      updateParam('category', catId);
    }
    scrollToTop();
  };

  const handleSubcategoryClick = (subId: string) => {
    const next = selectedSubcategory === subId ? 'all' : subId;
    setSelectedSubcategory(next);
    updateParam('subcategory', next);
    scrollToTop();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background py-12 relative">
      <div className="container">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-1 text-foreground font-bold">
              {getTitle()}
            </h1>
            <p className="text-sm sm:text-base text-foreground/70 font-medium">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
            {currentBrand && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-base px-3 py-1">{currentBrand.name}</Badge>
                <Button size="sm" onClick={() => updateParam('brand', 'all')} className="h-auto p-1 bg-background text-foreground hover:text-white hover:bg-secondary">
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

        {/* ── Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 relative">

          {showFilters && !isDesktop && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />
          )}

          {/* ── Sidebar ── */}
          <motion.aside
            initial={false}
            animate={showFilters ? { x: 0 } : { x: isDesktop ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-muted/40 shadow-2xl overflow-y-auto p-6
              lg:static lg:z-auto lg:w-80 lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-md lg:p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-foreground mb-4 lg:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-background px-6 py-4 border-b border-muted/30 lg:rounded-t-2xl">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Filters</h2>
              <p className="text-xs text-foreground/70 mt-1">Refine by product type, category, skin type, and brand</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setExpandedCategory(null);
                  setSelectedSkinType('all');
                  setSelectedBrand('all');
                  setSelectedFilter('all');
                  setMinPrice(0);
                  setMaxPrice(maxProductPrice);
                  setSearchParams(new URLSearchParams());
                }}
                className="w-full mt-4 bg-foreground text-background text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>

            <div className="p-6 space-y-5 divide-y divide-muted/20">

              {/* Product Type */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Product Type</h3>
                <div className="flex flex-col gap-2">
                  {([
                    { key: 'all',      label: 'All Products' },
                    { key: 'featured', label: 'Featured' },
                    { key: 'trending', label: 'Trending' },
                    { key: 'hotsale',  label: 'Hot Sale' },
                  ] as const).map((f) => (
                    <Button
                      key={f.key}
                      variant={selectedFilter === f.key ? 'default' : 'outline'}
                      onClick={() => { setSelectedFilter(f.key); updateParam('filter', f.key); }}
                      className={`justify-start text-sm ${
                        selectedFilter === f.key
                          ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'
                          : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                      }`}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-4 space-y-4">
                <h3 className="font-extrabold text-xl text-foreground">Price Range</h3>
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>Min: <span className="font-semibold">Rs {minPrice}</span></span>
                  <span>Max: <span className="font-semibold">Rs {maxPrice}</span></span>
                </div>
                <div className="flex flex-col gap-2">
                  <input type="range" min="0" max={maxAvailablePrice} step="10" value={minPrice}
                    onChange={(e) => { const v = Math.min(Number(e.target.value), maxPrice - 10); setMinPrice(v); updatePriceParam(v, maxPrice); }}
                    className="accent-secondary cursor-pointer" />
                  <input type="range" min="0" max={maxAvailablePrice} step="10" value={maxPrice}
                    onChange={(e) => { const v = Math.max(Number(e.target.value), minPrice + 10); setMaxPrice(v); updatePriceParam(minPrice, v); }}
                    className="accent-secondary cursor-pointer" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input type="number" min="0" max={maxAvailablePrice} step="10" value={minPrice}
                    onChange={(e) => { const v = Math.min(Number(e.target.value), maxPrice - 10); setMinPrice(v); updatePriceParam(v, maxPrice); }}
                    className="w-1/2 border bg-background text-foreground border-foreground/40 rounded-md px-3 py-1 text-sm" />
                  <input type="number" min="0" max={maxAvailablePrice} step="10" value={maxPrice}
                    onChange={(e) => { const v = Math.max(Number(e.target.value), minPrice + 10); setMaxPrice(v); updatePriceParam(minPrice, v); }}
                    className="w-1/2 bg-background text-foreground border border-foreground/40 rounded-md px-3 py-1 text-sm" />
                </div>
                <Button variant="outline" size="sm"
                  onClick={() => { setMinPrice(0); setMaxPrice(maxAvailablePrice); updatePriceParam(0, maxAvailablePrice); }}
                  className="w-full bg-foreground text-background hover:bg-foreground mt-2 text-sm">
                  Reset Price Filter
                </Button>
              </div>

              {/* ── Category + Subcategory accordion ── */}
              <div className="pt-4 space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Category</h3>

                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setExpandedCategory(null);
                    updateParam('category', 'all');
                  }}
                  className={`w-full text-sm ${
                    selectedCategory === 'all'
                      ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'
                      : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                  }`}
                >
                  All Types
                </Button>

                <div className="flex flex-col gap-1">
                  {mainCategories.map((cat) => {
                    const subs       = getSubcategories(cat._id);
                    const isExpanded = expandedCategory === cat._id;
                    const isActive   = selectedCategory === cat._id;

                    return (
                      <div key={cat._id}>
                        <Button
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => handleCategoryClick(cat._id)}
                          className={`w-full justify-between text-sm ${
                            isActive
                              ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'
                              : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                          }`}
                        >
                          <span>{cat.title}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </Button>

                        <AnimatePresence initial={false}>
                          {isExpanded && subs.length > 0 && (
                            <motion.div
                              key="subcats"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1 ml-3 flex flex-col gap-1 border-l-2 border-muted/40 pl-3 pb-1">
                                {subs.map((sub) => {
                                  const count     = getSubcategoryCount(sub);
                                  const subActive = selectedSubcategory === sub._id;
                                  return (
                                    <button
                                      key={sub._id}
                                      onClick={() => handleSubcategoryClick(sub._id)}
                                      className={`
                                        flex items-center justify-between w-full text-left text-sm px-3 py-1.5 rounded-md transition-all
                                        ${subActive
                                          ? 'bg-foreground text-background font-medium'
                                          : 'bg-background text-foreground/70 hover:bg-secondary hover:text-white'
                                        }
                                      `}
                                    >
                                      <span>{sub.title}</span>
                                      <span
                                        className={`
                                          text-xs px-2 py-0.5 rounded-full font-medium min-w-[24px] text-center
                                          ${subActive
                                            ? 'bg-background/20 text-background'
                                            : 'bg-muted text-foreground/60'
                                          }
                                        `}
                                      >
                                        {count}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skin Type */}
              <div className="pt-4 space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Skin Type</h3>
                <Button
                  variant={selectedSkinType === 'all' ? 'default' : 'outline'}
                  onClick={() => { setSelectedSkinType('all'); updateParam('skinType', 'all'); scrollToTop(); }}
                  className={`w-full text-sm ${
                    selectedSkinType === 'all'
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
                        onClick={() => { setSelectedSkinType(type as SkinType); updateParam('skinType', type); scrollToTop(); }}
                        className={`text-sm ${
                          selectedSkinType === type
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

              {/* Brand */}
              <div className="pt-4 space-y-3">
                <h3 className="font-extrabold text-xl text-foreground">Brand</h3>
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  <Button
                    variant={selectedBrand === 'all' ? 'default' : 'outline'}
                    onClick={() => { setSelectedBrand('all'); updateParam('brand', 'all'); scrollToTop(); }}
                    className={`justify-start text-sm ${
                      selectedBrand === 'all'
                        ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md transition-all'
                        : 'bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground/50'
                    }`}
                  >
                    All Brands
                  </Button>
                  {brands.map((brand) => (
                    <Button
                      key={brand._id}
                      variant={selectedBrand === brand._id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedBrand(brand._id);
                        updateParam('brand', brand._id);
                        // brand.category is a title string — find matching main cat _id
                        const matchedCat = mainCategories.find(
                          (c) => normalize(c.title) === normalize(brand.category || '')
                        );
                        if (matchedCat) {
                          setSelectedCategory(matchedCat._id);
                          setExpandedCategory(matchedCat._id);
                        }
                        scrollToTop();
                      }}
                      className={`justify-start text-sm ${
                        selectedBrand === brand._id
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

          {/* ── Products section ── */}
          <section>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); updateParam('search', e.target.value); scrollToTop(); }}
                className="pl-9 pr-8 bg-background text-foreground border border-foreground/50 focus:border-foreground placeholder:text-foreground/60 rounded-md transition-all duration-200"
              />
              {searchQuery && (
                <X
                  className="absolute right-3 top-2.5 h-4 w-4 cursor-pointer text-foreground hover:text-foreground/80 transition-colors"
                  onClick={() => { setSearchQuery(''); updateParam('search', ''); }}
                />
              )}
            </div>

            {/* Active subcategory badge */}
            {selectedSubcategory !== 'all' && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {subcategoryBadgeLabel}
                </Badge>
                <Button size="sm" onClick={() => { setSelectedSubcategory('all'); updateParam('subcategory', 'all'); }}
                  className="h-auto p-1 bg-background text-foreground hover:text-white hover:bg-secondary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

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