"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

export default function EditCategoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { categoryId } = useParams();

  const categories = ["makeup", "skincare", "haircare", "bath&body"];

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("skinmuse_admin_token") ||
          localStorage.getItem("skinmuse_superadmin_token") ||
          "";
        const { data } = await axios.get(
          `https://backendskinmuse.vercel.app/api/category/${categoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormData({ name: data.title, category: data.category });
        setExistingImage(data.image);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load category details!");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchCategory();
  }, [categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBgImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    } else {
      setPreviewUrl(null);
    }
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
      data.append("name", formData.name);
      data.append("category", formData.category);

      if (bgImage) data.append("image", bgImage); // optional image update

      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";

      await axios.put(
        `https://backendskinmuse.vercel.app/api/category/${categoryId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Category updated successfully!");
      setPreviewUrl(null);
      setBgImage(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update category!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <Label>Title</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="data-[highlighted]:bg-foreground data-[highlighted]:text-background"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Image */}
            {existingImage && !previewUrl && (
              <div>
                <Label>Current Image</Label>
                <div className="mt-2 flex justify-center">
                  <img
                    src={existingImage}
                    alt="Current category"
                    width={400}
                    height={250}
                    className="rounded-md object-cover border"
                  />
                </div>
              </div>
            )}

            {/* Upload New Image */}
            <div>
              <Label>Replace Background Image (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleBgImageChange}
              />
              {previewUrl && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover border rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
