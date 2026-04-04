"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function EditBrandForm() {
  const { brandId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    isFeatured: false,
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const categories = ["makeup", "skincare", "haircare", "bath&body"];

  // Generate previews
  useEffect(() => {
    if (!logo) return;
    const objectUrl = URL.createObjectURL(logo);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logo]);

  useEffect(() => {
    if (!featuredImage) return;
    const objectUrl = URL.createObjectURL(featuredImage);
    setFeaturedImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [featuredImage]);

  // Fetch brand data
  useEffect(() => {
    if (!brandId) return;
    const fetchBrand = async () => {
      try {
        setLoadingData(true);
        const res = await axios.get(`https://skinmusebackend-delta.vercel.app/api/brands/${brandId}`);
        const brand = res.data.brand || res.data;

        setFormData({
          name: brand.name || "",
          category: brand.category || "",
          description: brand.description || "",
          isFeatured: brand.isFeatured || false,
        });

        setLogoPreview(brand.logo || null);
        setFeaturedImagePreview(brand.featuredImage || null);
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to fetch brand details!");
      } finally {
        setLoadingData(false);
      }
    };
    fetchBrand();
  }, [brandId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      if (logo) data.append("logo", logo);
      if (featuredImage) data.append("featuredImage", featuredImage);

      await axios.put(`https://skinmusebackend-delta.vercel.app/api/brands/${brandId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Brand updated successfully!");
      navigate("/admin/brands");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update brand!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-t-transparent border-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <Card className="shadow-md border border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Edit Brand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* isFeatured Toggle */}
            <div className="flex items-center justify-between border rounded-lg p-3">
              <Label className="text-gray-700 dark:text-gray-300">Featured Brand</Label>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Brand Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
              />
              {logoPreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-32 h-32 object-cover rounded-full border"
                  />
                </div>
              )}
            </div>

            {/* Featured Image Upload */}
            <div className="space-y-3">
              <Label>Featured Image (for homepage slider)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
              />
              {featuredImagePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={featuredImagePreview}
                    alt="Featured Preview"
                    className="w-48 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background font-medium"
            >
              {loading ? "Updating..." : "Update Brand"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
