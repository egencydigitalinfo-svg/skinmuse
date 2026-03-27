import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ProductCategory } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backendskinmuse.vercel.app/api';

const Brands = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(
    categoryParam || 'all'
  );

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

  // Filter brands by selected category
  const filteredBrands = useMemo(() => {
    if (!Array.isArray(brands)) return [];
    return brands.filter((b) =>
      selectedCategory === 'all' ? true : b.category === selectedCategory
    );
  }, [brands, selectedCategory]);

  // Render a category section
  const renderBrandSection = (title: string, data: typeof brands) => {
    if (!data.length) return null;
    return (
      <section className="mb-24 bg-background">
        <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center text-foreground font-semibold tracking-tight">
          {title}
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
          {data.map((brand) => (
            <Link key={brand._id} to={`/products?brand=${brand._id}`} className="h-full">
              <Card className="p-8 h-full flex flex-col justify-between rounded-2xl border border-foreground/30 bg-background text-foreground shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                {/* Hover Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-secondary to-white transition-opacity duration-500 rounded-2xl" />

                <div className="flex flex-col items-center text-center relative z-10 flex-grow">
                  {/* Logo */}
                  <div className="w-24 h-24 mb-6 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-secondary/40 bg-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-secondary/60 text-sm">No Logo</span>
                      )}
                    </div>
                  </div>

                  {/* Brand Name */}
                  <h3 className="text-lg md:text-xl font-serif mb-3 text-secondary group-hover:text-secondary/90 transition-colors duration-300">
                    {brand.name}
                  </h3>

                  {/* Description */}
                  <div className="flex-grow flex items-start">
                    <p className="text-sm text-secondary/80 leading-relaxed line-clamp-3">
                      {brand.description || 'No description available.'}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    );
  };


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen py-20 bg-background text-secondary">
      <div className="container max-w-7xl">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4 text-secondary">
            Discover Our Luxury Brands
          </h1>
          <p className="text-lg md:text-xl text-secondary/80 max-w-2xl mx-auto">
            Explore top beauty brands curated exclusively for your skincare, makeup, and self-care journey.
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex justify-center mb-14">
          <div className="flex flex-wrap justify-center gap-3">
            {(['all', 'makeup', 'skincare', 'haircare', 'bath&body'] as const).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat
                    ? 'bg-foreground text-background border border-foreground/50 hover:bg-foreground hover:shadow-md'
                    : 'bg-background text-secondary hover:bg-background hover:text-foreground hover:border-foreground/50'
                  }`}
              >
                {cat === 'all'
                  ? 'All Brands'
                  : cat.charAt(0).toUpperCase() + cat.slice(1).replace('&', '& ')}
              </Button>
            ))}
          </div>
        </div>

        {/* BRAND SECTIONS */}
        {selectedCategory === 'all' || selectedCategory === 'makeup'
          ? renderBrandSection('Makeup Brands', filteredBrands.filter((b) => b.category === 'makeup'))
          : null}

        {selectedCategory === 'all' || selectedCategory === 'skincare'
          ? renderBrandSection('Skincare Brands', filteredBrands.filter((b) => b.category === 'skincare'))
          : null}

        {selectedCategory === 'all' || selectedCategory === 'haircare'
          ? renderBrandSection('Hair Care', filteredBrands.filter((b) => b.category === 'haircare'))
          : null}

        {selectedCategory === 'all' || selectedCategory === 'bath&body'
          ? renderBrandSection('Bath & Body', filteredBrands.filter((b) => b.category === 'bath&body'))
          : null}

        {/* EMPTY STATE */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-24">
            <p className="text-lg text-secondary/70">No brands found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
