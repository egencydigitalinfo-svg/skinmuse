"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function BrandUploadForm() {
  const [formData, setFormData] = useState({ name: "", category: "", description: "" });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["makeup", "skincare", "haircare", "bath&body"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "featured") => {
    const file = e.target.files?.[0] || null;
    if (type === "logo") {
      setLogo(file);
      setLogoPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFeaturedImage(file);
      setFeaturedImagePreview(file ? URL.createObjectURL(file) : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return toast.error("Please fill all required fields!");
    if (!logo) return toast.error("Please select a brand logo!");

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (logo) data.append("logo", logo);
      if (featuredImage) data.append("featuredImage", featuredImage);

      await axios.post("https://backendskinmuse.vercel.app/api/brands", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Brand uploaded successfully!");
      setFormData({ name: "", category: "", description: "" });
      setLogo(null);
      setLogoPreview(null);
      setFeaturedImage(null);
      setFeaturedImagePreview(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to upload brand!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <Card className="shadow-md border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Upload New Brand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
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

            <div className="space-y-3">
              <Label>Brand Logo</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} required />
              {logoPreview && (
                <div className="mt-2 flex justify-center">
                  <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 object-cover rounded-full border" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Featured Image (for homepage slider)</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "featured")} />
              {featuredImagePreview && (
                <div className="mt-2 flex justify-center">
                  <img src={featuredImagePreview} alt="Featured Preview" className="w-48 h-32 object-cover rounded-md border" />
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-foreground text-background">
              {loading ? "Uploading..." : "Upload Brand"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
