"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Brand } from "@/types/brand";
import { useNavigate } from "react-router-dom";

const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [preLoading, setPreLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = "https://skinmusebackend-delta.vercel.app/api";

  // === Fetch Brands ===
  const fetchBrands = async () => {
    try {
      setPreLoading(true);
      const res = await axios.get(`${API_BASE}/brands`);
      const brandList: Brand[] = Array.isArray(res.data.brands)
        ? res.data.brands
        : [];
      const sorted = brandList.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch brands");
    } finally {
      setPreLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // === Delete Brand ===
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      setLoading(id);
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.delete(`${API_BASE}/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Brand deleted successfully");
      fetchBrands();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete brand");
    } finally {
      setLoading(null);
    }
  };

  // === Toggle Featured ===
  const handleToggleFeatured = async (brand: Brand) => {
    try {
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.put(
        `${API_BASE}/brands/${brand._id}`,
        { isFeatured: !brand.isFeatured },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(
        `Brand "${brand.name}" is now ${
          !brand.isFeatured ? "featured ✅" : "not featured ❌"
        }`
      );
      fetchBrands();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update featured status");
    }
  };

  // === Filter by Search ===
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (brand: Brand) => {
    navigate(`/admin/editBrand/${brand._id}`);
  };

  if (preLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading Brands...
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
          Manage Brands
        </h1>
        <Button
          className="bg-foreground text-background hover:bg-foreground"
          onClick={() => navigate("/admin/brandCreate")}
        >
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border-0 bg-muted-foreground/10 focus:bg-background transition-colors"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="bg-foreground text-background hover:bg-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Brand List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Brand List <span className="text-sm">({filteredBrands.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <Card
                key={brand._id}
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                {/* Logo */}
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-48 object-contain bg-white"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Logo
                  </div>
                )}

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Category: {brand.category}
                      </p>
                    </div>

                    {brand.discount && brand.discount > 0 && (
                      <Badge variant="secondary" className="text-sm">
                        {brand.discount}% Off
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {brand.description || "No description provided"}
                  </p>

                  {/* Featured Toggle */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">
                      Featured:
                    </span>
                    <Button
                      size="sm"
                      variant={brand.isFeatured ? "default" : "outline"}
                      className={`${
                        brand.isFeatured
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                      } transition-all`}
                      onClick={() => handleToggleFeatured(brand)}
                    >
                      {brand.isFeatured ? "Yes" : "No"}
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-foreground text-background hover:bg-foreground"
                      onClick={() => handleEditClick(brand)}
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 bg-background text-foreground hover:text-background border hover:bg-foreground border-foreground"
                      onClick={() => handleDelete(brand._id)}
                      disabled={loading === brand._id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {loading === brand._id ? "Deleting..." : "Delete"}
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

export default AdminBrands;
