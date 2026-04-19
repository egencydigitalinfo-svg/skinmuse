import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import axios from 'axios';
import { SkinType, ProductCategory } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, XCircle, Filter, Search, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://skinmusebackend-delta.vercel.app/api';

// ── Helpers ─────────────────────────────────────────────────────────────────

const normalize = (str = '') =>
  str.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '').replace(/-/g, '');

const extractTitle = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'object') return field.title || '';
  return field;
};

const extractId = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'object') return field._id?.toString() || '';
  return field;
};

// ── Sidebar Component (defined OUTSIDE Products to prevent remount) ──────────

interface SidebarContentProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  setShowFilters: (v: boolean) => void;
  selectedFilter: 'all' | 'featured' | 'trending' | 'hotsale';
  setSelectedFilter: (v: 'all' | 'featured' | 'trending' | 'hotsale') => void;
  minPrice: number;
  maxPrice: number;
  maxAvailablePrice: number;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;
  updateParam: (key: string, value: string) => void;
  updatePriceParam: (min: number, max: number) => void;
  maxProductPrice: number;
  mainCategories: any[];
  allCategories: any[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (v: string) => void;
  expandedCategory: string | null;
  setExpandedCategory: (v: string | null) => void;
  handleCategoryClick: (catId: string) => void;
  handleSubcategoryClick: (subId: string) => void;
  getSubcategories: (categoryId: string) => any[];
  getSubcategoryCount: (sub: any) => number;
  availableSkinTypes: string[];
  selectedSkinType: SkinType | 'all';
  setSelectedSkinType: (v: SkinType | 'all') => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  brands: { _id: string; name: string; category: string }[];
  filteredBrands: { _id: string; name: string; category: string }[];
  brandSearch: string;
  setBrandSearch: (v: string) => void;
  clearAll: () => void;
  scrollToTop: () => void;
}

const SidebarContent = ({
  scrollRef,
  setShowFilters,
  selectedFilter,
  setSelectedFilter,
  minPrice,
  maxPrice,
  maxAvailablePrice,
  setMinPrice,
  setMaxPrice,
  updateParam,
  updatePriceParam,
  maxProductPrice,
  mainCategories,
  allCategories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  expandedCategory,
  setExpandedCategory,
  handleCategoryClick,
  handleSubcategoryClick,
  getSubcategories,
  getSubcategoryCount,
  availableSkinTypes,
  selectedSkinType,
  setSelectedSkinType,
  selectedBrand,
  setSelectedBrand,
  brands,
  filteredBrands,
  brandSearch,
  setBrandSearch,
  clearAll,
  scrollToTop,
}: SidebarContentProps) => (
  <div className="flex flex-col h-full">

    {/* ── Sticky header ── */}
    <div className="px-5 py-4 border-b border-foreground/8 sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-foreground/40" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>
        <button
          onClick={() => setShowFilters(false)}
          className="lg:hidden p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-foreground/40 mt-0.5">Refine your results</p>
      <button
        onClick={clearAll}
        className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-foreground/50 hover:text-foreground border border-foreground/10 hover:border-foreground/25 rounded-lg py-2 transition-all duration-150"
      >
        <XCircle className="w-3 h-3" />
        Clear all filters
      </button>
    </div>

    {/* ── Scrollable body — ref attached here ── */}
    <div ref={scrollRef} className="overflow-y-auto flex-1 divide-y divide-foreground/[0.06]">

      {/* Product Type */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-foreground/35 mb-3">
          Product Type
        </p>
        <div className="flex flex-wrap gap-1.5">
          {([
            { key: 'all',      label: 'All' },
            { key: 'featured', label: 'Featured' },
            { key: 'trending', label: 'Trending' },
            { key: 'hotsale',  label: 'Hot Sale' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => { setSelectedFilter(f.key); updateParam('filter', f.key); }}
              className={`px-3.5 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                selectedFilter === f.key
                  ? 'bg-foreground text-background border-foreground font-medium'
                  : 'bg-transparent text-foreground/55 border-foreground/15 hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-foreground/35 mb-3">
          Price Range
        </p>
        <div className="flex justify-between text-xs text-foreground/50 mb-3">
          <span>Rs <span className="font-medium text-foreground">{minPrice.toLocaleString()}</span></span>
          <span>Rs <span className="font-medium text-foreground">{maxPrice.toLocaleString()}</span></span>
        </div>
        <div className="space-y-2">
          <input
            type="range" min="0" max={maxAvailablePrice} step="10" value={minPrice}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), maxPrice - 10);
              setMinPrice(v); updatePriceParam(v, maxPrice);
            }}
            className="w-full h-1 accent-foreground cursor-pointer"
          />
          <input
            type="range" min="0" max={maxAvailablePrice} step="10" value={maxPrice}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), minPrice + 10);
              setMaxPrice(v); updatePriceParam(minPrice, v);
            }}
            className="w-full h-1 accent-foreground cursor-pointer"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="number" min="0" max={maxAvailablePrice} step="10" value={minPrice}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), maxPrice - 10);
              setMinPrice(v); updatePriceParam(v, maxPrice);
            }}
            className="w-1/2 bg-foreground/[0.04] text-foreground text-xs rounded-lg px-3 py-2 border border-foreground/10 focus:border-foreground/30 outline-none transition-colors"
          />
          <input
            type="number" min="0" max={maxAvailablePrice} step="10" value={maxPrice}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), minPrice + 10);
              setMaxPrice(v); updatePriceParam(minPrice, v);
            }}
            className="w-1/2 bg-foreground/[0.04] text-foreground text-xs rounded-lg px-3 py-2 border border-foreground/10 focus:border-foreground/30 outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => { setMinPrice(0); setMaxPrice(maxAvailablePrice); updatePriceParam(0, maxAvailablePrice); }}
          className="mt-2.5 w-full text-[11px] text-foreground/45 hover:text-foreground transition-colors py-1"
        >
          Reset price
        </button>
      </div>

      {/* Category */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-foreground/35 mb-3">
          Category
        </p>

        {/* All Types row */}
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSelectedSubcategory('all');
            setExpandedCategory(null);
            updateParam('category', 'all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
            selectedCategory === 'all'
              ? 'bg-foreground text-background font-medium'
              : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'
          }`}
        >
          <span>All types</span>
        </button>

        {/* Main categories */}
        <div className="flex flex-col gap-0.5">
          {mainCategories.map((cat) => {
            const subs       = getSubcategories(cat._id);
            const isExpanded = expandedCategory === cat._id;
            const isActive   = selectedCategory === cat._id;

            return (
              <div key={cat._id}>
                <button
                  onClick={() => handleCategoryClick(cat._id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-foreground/[0.06] text-foreground font-medium'
                      : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <span>{cat.title}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-foreground/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && subs.length > 0 && (
                    <motion.div
                      key="subcats"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-foreground/10 flex flex-col gap-0.5">
                        {subs.map((sub) => {
                          const count     = getSubcategoryCount(sub);
                          const subActive = selectedSubcategory === sub._id;
                          return (
                            <button
                              key={sub._id}
                              onClick={() => handleSubcategoryClick(sub._id)}
                              className={`flex items-center justify-between w-full text-left text-xs px-3 py-2 rounded-lg transition-all duration-150 ${
                                subActive
                                  ? 'bg-foreground text-background font-medium'
                                  : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                              }`}
                            >
                              <span>{sub.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                subActive
                                  ? 'bg-background/20 text-background'
                                  : 'bg-foreground/8 text-foreground/40'
                              }`}>
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
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-foreground/35 mb-3">
          Skin Type
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => { setSelectedSkinType('all'); updateParam('skinType', 'all'); scrollToTop(); }}
            className={`col-span-2 py-2 text-xs rounded-lg border transition-all duration-150 ${
              selectedSkinType === 'all'
                ? 'bg-foreground text-background border-foreground font-medium'
                : 'bg-transparent text-foreground/55 border-foreground/12 hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            All types
          </button>
          {availableSkinTypes.length > 0 ? (
            availableSkinTypes.map((type) => (
              <button
                key={type}
                onClick={() => { setSelectedSkinType(type as SkinType); updateParam('skinType', type); scrollToTop(); }}
                className={`py-2 text-xs rounded-lg border transition-all duration-150 ${
                  selectedSkinType === type
                    ? 'bg-foreground text-background border-foreground font-medium'
                    : 'bg-transparent text-foreground/55 border-foreground/12 hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))
          ) : (
            <p className="col-span-2 text-xs text-foreground/35 text-center py-2">No skin types available</p>
          )}
        </div>
      </div>

      {/* Brand */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-foreground/35 mb-3">
          Brand
        </p>

        {/* Brand search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/30" />
          <input
            type="text"
            placeholder="Search brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-2 text-xs bg-foreground/[0.04] border border-foreground/10 rounded-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/25 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
          {/* All Brands */}
          <button
            onClick={() => { setSelectedBrand('all'); updateParam('brand', 'all'); scrollToTop(); }}
            className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
              selectedBrand === 'all'
                ? 'bg-foreground/[0.06] text-foreground font-medium'
                : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
              selectedBrand === 'all' ? 'bg-foreground' : 'bg-foreground/20'
            }`} />
            All brands
          </button>

          {filteredBrands.map((brand) => (
            <button
              key={brand._id}
              onClick={() => {
                setSelectedBrand(brand._id);
                updateParam('brand', brand._id);
                scrollToTop();
              }}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                selectedBrand === brand._id
                  ? 'bg-foreground/[0.06] text-foreground font-medium'
                  : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                selectedBrand === brand._id ? 'bg-foreground' : 'bg-foreground/20'
              }`} />
              {brand.name}
            </button>
          ))}

          {filteredBrands.length === 0 && (
            <p className="text-xs text-foreground/30 text-center py-3">No brands found</p>
          )}
        </div>
      </div>

    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

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
  const [brandSearch,         setBrandSearch]         = useState('');

  const [brands, setBrands] = useState<{ _id: string; name: string; category: string }[]>([]);

  // ── KEY FIX: ref for the sidebar scroll container ──────────────────────────
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  // ── KEY FIX: save & restore scroll before/after state updates ─────────────
  const preserveScroll = useCallback((fn: () => void) => {
    const el = sidebarScrollRef.current;
    const savedScroll = el?.scrollTop ?? 0;
    fn();
    // Restore after React re-render
    requestAnimationFrame(() => {
      if (sidebarScrollRef.current) {
        sidebarScrollRef.current.scrollTop = savedScroll;
      }
    });
  }, []);

  const updateParam = useCallback((key: string, value: string) => {
    preserveScroll(() => {
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
    });
  }, [
    preserveScroll, searchParams, selectedCategory, selectedSubcategory,
    selectedBrand, selectedFilter, selectedSkinType, minPrice, maxPrice,
    maxProductPrice, setSearchParams,
  ]);

  const updatePriceParam = useCallback((min: number, max: number) => {
    preserveScroll(() => {
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
    });
  }, [
    preserveScroll, searchParams, selectedCategory, selectedSubcategory,
    selectedBrand, selectedFilter, selectedSkinType, maxProductPrice, setSearchParams,
  ]);

  const getSubcategories = useCallback((categoryId: string) =>
    allCategories.filter(
      (cat: any) =>
        cat.parent_id?._id === categoryId ||
        cat.parent_id === categoryId
    ), [allCategories]);

  const getSubcategoryCount = useCallback((sub: any): number => {
    return products.filter((p: any) => {
      const pSub = p.subcategory;
      if (!pSub) return false;
      if (typeof pSub === 'object') return pSub._id?.toString() === sub._id?.toString();
      return pSub === sub._id?.toString() || pSub === sub.title;
    }).length;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const productCatId    = extractId(product.category);
      const productCatTitle = extractTitle(product.category);
      const productSubId    = extractId(product.subcategory);
      const productSubTitle = extractTitle(product.subcategory);

      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        normalize(productCatTitle).includes(normalize(searchQuery)) ||
        normalize(product.brand?.category || '').includes(normalize(searchQuery)) ||
        productSubTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatch =
        selectedCategory === 'all' ||
        productCatId === selectedCategory;

      const subcategoryMatch =
        selectedSubcategory === 'all' ||
        productSubId === selectedSubcategory;

      const brandMatch =
        selectedBrand === 'all' ||
        product.brandId === selectedBrand ||
        product.brand?._id === selectedBrand ||
        product.brand?._id?.toString() === selectedBrand;

      const filterMatch =
        selectedFilter === 'all' ||
        (selectedFilter === 'featured' && product.isFeatured) ||
        (selectedFilter === 'trending' && product.isTrending) ||
        (selectedFilter === 'hotsale'  && product.isHotSale);

      const priceMatch = product.price >= minPrice && product.price <= maxPrice;

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

  const availableSkinTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      const productCatId = extractId(p.category);
      const catMatch = selectedCategory === 'all' || productCatId === selectedCategory;
      if (!catMatch || !p.skinType) return;
      (Array.isArray(p.skinType) ? p.skinType : [p.skinType]).forEach((t: string) => {
        if (t) set.add(t.toLowerCase());
      });
    });
    return Array.from(set);
  }, [products, selectedCategory]);

  const selectedSubCatObj     = allCategories.find((c) => c._id === selectedSubcategory);
  const subcategoryBadgeLabel = selectedSubCatObj?.title || selectedSubcategory;
  const currentBrand          = brands.find((b) => b._id === selectedBrand);

  const filteredBrands = useMemo(() =>
    brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch]
  );

  const getTitle = () => {
    if (selectedFilter === 'featured') return 'Featured Products';
    if (selectedFilter === 'trending') return 'Trending Products';
    if (selectedFilter === 'hotsale')  return 'Hot Selling Products';
    return 'All Products';
  };

  const handleCategoryClick = useCallback((catId: string) => {
    preserveScroll(() => {
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
    });
    scrollToTop();
  }, [expandedCategory, preserveScroll, updateParam]);

  const handleSubcategoryClick = useCallback((subId: string) => {
    preserveScroll(() => {
      const next = selectedSubcategory === subId ? 'all' : subId;
      setSelectedSubcategory(next);
      updateParam('subcategory', next);
    });
    scrollToTop();
  }, [selectedSubcategory, preserveScroll, updateParam]);

  const clearAll = useCallback(() => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setExpandedCategory(null);
    setSelectedSkinType('all');
    setSelectedBrand('all');
    setSelectedFilter('all');
    setMinPrice(0);
    setMaxPrice(maxProductPrice);
    setSearchParams(new URLSearchParams());
  }, [maxProductPrice, setSearchParams]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background py-12 relative">
      <div className="container">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight mb-1 text-foreground font-bold">
              {getTitle()}
            </h1>
            <p className="text-sm text-foreground/50 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
            {currentBrand && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">{currentBrand.name}</Badge>
                <button
                  onClick={() => updateParam('brand', 'all')}
                  className="p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile filter trigger */}
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground border border-foreground/15 hover:border-foreground/30 rounded-xl px-4 py-2.5 transition-all duration-150"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        {/* ── Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] gap-8 relative">

          {/* Mobile overlay */}
          {showFilters && !isDesktop && (
            <div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* ── Sidebar ── */}
          <motion.aside
            initial={false}
            animate={showFilters ? { x: 0 } : { x: isDesktop ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="
              fixed inset-y-0 left-0 z-50 w-[288px]
              bg-background shadow-2xl overflow-hidden
              lg:static lg:z-auto lg:w-full lg:translate-x-0
              lg:rounded-2xl lg:border lg:border-foreground/[0.08] lg:shadow-none
              lg:overflow-visible lg:max-h-[calc(100vh-6rem)] lg:sticky lg:top-6
            "
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              scrollRef={sidebarScrollRef}
              setShowFilters={setShowFilters}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              minPrice={minPrice}
              maxPrice={maxPrice}
              maxAvailablePrice={maxAvailablePrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              updateParam={updateParam}
              updatePriceParam={updatePriceParam}
              maxProductPrice={maxProductPrice}
              mainCategories={mainCategories}
              allCategories={allCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              expandedCategory={expandedCategory}
              setExpandedCategory={setExpandedCategory}
              handleCategoryClick={handleCategoryClick}
              handleSubcategoryClick={handleSubcategoryClick}
              getSubcategories={getSubcategories}
              getSubcategoryCount={getSubcategoryCount}
              availableSkinTypes={availableSkinTypes}
              selectedSkinType={selectedSkinType}
              setSelectedSkinType={setSelectedSkinType}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              brands={brands}
              filteredBrands={filteredBrands}
              brandSearch={brandSearch}
              setBrandSearch={setBrandSearch}
              clearAll={clearAll}
              scrollToTop={scrollToTop}
            />
          </motion.aside>

          {/* ── Products section ── */}
          <section>

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/35" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); updateParam('search', e.target.value); scrollToTop(); }}
                className="pl-9 pr-8 bg-background text-foreground border border-foreground/15 focus:border-foreground/40 placeholder:text-foreground/35 rounded-xl h-10 transition-colors duration-150"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); updateParam('search', ''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Active subcategory badge */}
            {selectedSubcategory !== 'all' && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-foreground/[0.06] text-foreground px-3 py-1.5 rounded-full font-medium">
                  {subcategoryBadgeLabel}
                </span>
                <button
                  onClick={() => { setSelectedSubcategory('all'); updateParam('subcategory', 'all'); }}
                  className="p-1 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                initial="hidden"
                animate="show"
              >
                {filteredProducts.map((product: any, index: number) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 border border-foreground/8 rounded-2xl">
                <p className="text-sm text-foreground/40">No products found matching your filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-3 text-xs text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Products;