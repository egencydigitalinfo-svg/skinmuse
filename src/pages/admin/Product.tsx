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

const AdminProducts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [preLoading, setPreLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // === Fetch Products ===
  const fetchData = async () => {
    try {
      setPreLoading(true);
      const productsRes = await axios.get(
        "https://skinmusebackend-delta.vercel.app/api/products"
      );

      const productList: Product[] = Array.isArray(productsRes.data)
        ? productsRes.data
        : Array.isArray(productsRes.data.products)
          ? productsRes.data.products
          : [];

      const sortedProducts = productList.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setProducts(sortedProducts);
      setAllProducts(sortedProducts);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
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
    let filtered = [...allProducts];

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) =>
          (typeof p.category === "object" && p.category !== null
            ? p.category.title
            : p.category) === selectedCategory
      );
    }

    setProducts(filtered);
  }, [searchQuery, selectedCategory, allProducts]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
    setSearchQuery("");
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
      await axios.delete(
        `https://skinmusebackend-delta.vercel.app/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // === Helper: get category title safely ===
  const getCategoryTitle = (category: any): string => {
    if (!category) return "N/A";
    if (typeof category === "object" && category.title) return category.title;
    if (typeof category === "string") return category;
    return "N/A";
  };

  // === Helper: get brand name safely ===
  const getBrandDisplay = (product: Product): string => {
    if (product.brandName) return product.brandName;
    if (product.brand && product.brand.name) return product.brand.name;
    return "No Brand";
  };

  if (preLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading Products data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Manage Products
        </h1>
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
                onClick={() => setSelectedCategory("")}
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
            Product List{" "}
            <span className="text-sm">({products.length} products)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No products found.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  {/* Image Preview */}
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
                  <div className="p-4 flex flex-col flex-grow gap-1">
                    {/* Name + Category */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Brand: {getBrandDisplay(product)}
                        </p>
                        {product.subcategory && (
                          <p className="text-sm text-gray-400">
                            Sub: {typeof product.subcategory === "object"
                              ? product.subcategory.title
                              : product.subcategory}
                          </p>
                        )}
                      </div>
                      <Badge
                        className="cursor-pointer shrink-0"
                        onClick={() =>
                          handleCategoryFilter(getCategoryTitle(product.category))
                        }
                      >
                        {getCategoryTitle(product.category)}
                      </Badge>
                    </div>

                    {/* Colors */}
                    {product.colors?.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Colors:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {product.colors.map((color, idx) => (
                            <Badge
                              key={idx}
                              style={{ backgroundColor: color.hex }}
                              className="text-white text-xs px-2 py-1"
                            >
                              {color.name} ({color.stock})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Litres */}
                    {product.litres?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.litres.map((ml, idx) => (
                          <p key={idx} className="text-foreground text-sm">
                            <span className="font-semibold">ML: </span>
                            {ml.amount} ({ml.stock})
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Stock */}
                    <p className="text-sm">
                      <span className="font-semibold">Stock: </span>
                      {(() => {
                        const total =
                          (product.colors?.reduce((s, c) => s + c.stock, 0) ?? 0) +
                          (product.litres?.reduce((s, l) => s + l.stock, 0) ?? 0) ||
                          product.stock;
                        return total > 0 ? (
                          <span className="text-green-600">In Stock ({total})</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        );
                      })()}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-semibold text-sm">Price:</span>
                      {(() => {
                        const prices = [
                          product.price,
                          ...(product.litres?.map((l) => l.price).filter(Boolean) ?? []),
                          ...(product.colors?.map((c) => c.price).filter(Boolean) ?? []),
                        ];
                        const min = Math.min(...prices);
                        const max = Math.max(...prices);
                        return (
                          <span className="text-gray-800 font-semibold">
                            {min === max ? `Rs ${min}` : `Rs ${min} – Rs ${max}`}
                          </span>
                        );
                      })()}
                      {product.discount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {product.discount}% Off
                        </Badge>
                      )}
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge
                        variant={product.isTrending ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        Trending: {product.isTrending ? "Yes" : "No"}
                      </Badge>
                      <Badge
                        variant={product.isHotSale ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        Hot Sale: {product.isHotSale ? "Yes" : "No"}
                      </Badge>
                      <Badge
                        variant={product.isFeatured ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        Featured: {product.isFeatured ? "Yes" : "No"}
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
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(product._id)}
                        disabled={loading === product._id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {loading === product._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;