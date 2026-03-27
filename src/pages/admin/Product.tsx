"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { Brand } from "@/types/brand";

const AdminProducts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [preLoading, setPreLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // === Fetch Products & Brands ===
  const fetchData = async () => {
    try {
      setPreLoading(true);

      const [productsRes, brandsRes] = await Promise.all([
        axios.get("https://backendskinmuse.vercel.app/api/products"),
        axios.get("https://backendskinmuse.vercel.app/api/brands"),
      ]);

      const productList: Product[] = Array.isArray(productsRes.data)
        ? productsRes.data
        : Array.isArray(productsRes.data.products)
          ? productsRes.data.products
          : [];

      const brandList: Brand[] = Array.isArray(brandsRes.data)
        ? brandsRes.data
        : Array.isArray(brandsRes.data.brands)
          ? brandsRes.data.brands
          : [];

      const sortedProducts = productList.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setProducts(sortedProducts);
      setAllProducts(sortedProducts);
      setBrands(brandList);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch products or brands",
        variant: "destructive",
      });
    } finally {
      setPreLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === Search filter ===
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts(allProducts);
      return;
    }
    const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProducts(filtered);
  }, [searchQuery, allProducts]);

  const handleCategoryFilter = (category: string) => {
    if (category === selectedCategory) {
      fetchData();
      setSelectedCategory("");
    } else {
      const filtered = products.filter((p) => p.category === category);
      setProducts(filtered);
      setSelectedCategory(category);
      setSearchQuery("");
    }
  };

  // === Delete Product ===
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      setLoading(id);
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.delete(`https://backendskinmuse.vercel.app/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Deleted!", description: "Product deleted successfully" });
      fetchData();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEditClick = (product: Product) => {
    navigate(`/admin/editProduct/${product._id}`);
  };

  if (preLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading Products data...
          </p>
        </div>
      </div>
    );
  }

  const getBrandName = (brandId: string) => {
    const brand = brands.find((b) => b._id === brandId);
    return brand ? brand.name : "Unknown Brand";
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Products</h1>
        <Button
          className="bg-foreground text-background hover:bg-foreground"
          onClick={() => navigate("/admin/addProduct")}
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border-0 bg-muted-foreground/10 focus:border-foreground focus:bg-background transition-colors"
            />
          </div>
          {selectedCategory && (
            <Badge className="flex items-center gap-1 text-sm px-2 py-1">
              <span>{selectedCategory}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleCategoryFilter(selectedCategory)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Product List <span className="text-sm">({products.length} products)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product._id}
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                {/* === Image Preview (multiple support) === */}
                {product.images && product.images.length > 0 ? (
                  <div className="relative w-full h-48 bg-white">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-contain"
                    />
                    {product.images.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Images className="w-3 h-3" />
                        +{product.images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        Brand: {getBrandName(product.brandId)}
                      </p>
                    </div>
                    <Badge>{product.category}</Badge>
                  </div>

                  {/* Colors */}
                  {product.category === "makeup" && product.colors?.length > 0 && (
                    <div>
                      <span className="font-medium">Colors:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.colors.map((color, idx) => (
                          <Badge
                            key={idx}
                            style={{ backgroundColor: color.hex }}
                            className="text-white text-sm px-2 py-1 flex items-center gap-1"
                          >
                            {color.name} ({color.stock})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {product.litres?.length > 0 && (
                    <div>

                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.litres.map((ml, idx) => (
                          <p
                            key={idx}
                            className="text-foreground text-sm"
                          >

                            <span className="font-medium font-semibold">ML: </span> {ml.amount} ({ml.stock})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock */}
                  <p className="mt-1">
                    <span className="font-medium">Stock:</span>{" "}
                    {(
                      (product.colors?.reduce((sum, c) => sum + c.stock, 0) ?? 0) +
                      (product.litres?.reduce((sum, l) => sum + l.stock, 0) ?? 0) ||
                      product.stock
                    ) > 0 ? (
                      <span className="text-green-600">
                        In Stock (
                        {(product.colors?.reduce((sum, c) => sum + c.stock, 0) ?? 0) +
                          (product.litres?.reduce((sum, l) => sum + l.stock, 0) ?? 0) ||
                          product.stock}
                        )
                      </span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </p>



                  {/* Description */}
                  <p className="text-sm text-gray-700 line-clamp-3">{product.description}</p>

                  {/* PRICE SECTION */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium font-semibold">Price:</span>

                    {(() => {
                      // main product price
                      let prices = [product.price];

                      // litre prices
                      if (product.litres && product.litres.length > 0) {
                        product.litres.forEach(l => {
                          if (l.price) prices.push(l.price);
                        });
                      }

                      // color prices
                      if (product.colors && product.colors.length > 0) {
                        product.colors.forEach(c => {
                          if (c.price) prices.push(c.price);
                        });
                      }

                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);

                      return (
                        <span className="text-gray-800 font-semibold">
                          {minPrice === maxPrice
                            ? `Rs ${minPrice}`
                            : `Rs ${maxPrice}`}
                        </span>
                      );
                    })()}

                    {/* DISCOUNT BADGE */}
                    {product.discount > 0 && (
                      <Badge variant="secondary" className="text-sm">
                        {product.discount}% Off
                      </Badge>
                    )}
                  </div>


                  {/* Flags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant={product.isTrending ? "destructive" : "outline"}
                      className="text-xs px-2 py-1"
                    >
                      Trending: {product.isTrending ? "True" : "False"}
                    </Badge>
                    <Badge
                      variant={product.isHotSale ? "destructive" : "outline"}
                      className="text-xs px-2 py-1"
                    >
                      Hot Sale: {product.isHotSale ? "True" : "False"}
                    </Badge>
                    <Badge
                      variant={product.isFeatured ? "destructive" : "outline"}
                      className="text-xs px-2 py-1"
                    >
                      Featured: {product.isFeatured ? "True" : "False"}
                    </Badge>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-foreground text-background hover:bg-foreground"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 border border-foreground hover:bg-foreground hover:text-background"
                      onClick={() => handleDelete(product._id)}
                      disabled={loading === product._id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {loading === product._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
