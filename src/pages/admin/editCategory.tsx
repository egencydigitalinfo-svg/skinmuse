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
  const { categoryId } = useParams<{ categoryId: string }>();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    parent_id: "none",
  });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ✅ Fetch parent categories FIRST
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://skinmusebackend-delta.vercel.app/api/category"
        );
        setParentCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      try {
        setLoading(true);
        const token =
          localStorage.getItem("skinmuse_admin_token") ||
          localStorage.getItem("skinmuse_superadmin_token") ||
          "";
        const { data } = await axios.get(
          `https://skinmusebackend-delta.vercel.app/api/category/${categoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched category data:", data); // 👈 Check console to see exact field names

        setFormData({
          name: data.title || data.name || "",         // ✅ handle both field names
          category: data.category || "",
          parent_id: data.parent_id || "none",          // ✅ fallback to "none" if null/undefined
        });
        setExistingImage(data.image || null);
        setDataLoaded(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load category details!");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBgImage(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.name);
      data.append("category", formData.category);
      if (formData.parent_id && formData.parent_id !== "none") {
        data.append("parent_id", formData.parent_id);
      }
      if (bgImage) data.append("image", bgImage);

      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";

      await axios.put(
        `https://skinmusebackend-delta.vercel.app/api/category/${categoryId}`,
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

  // ✅ Don't render form until data is loaded to avoid Select defaultValue issue
  if (loading && !dataLoaded) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center text-muted-foreground">
        Loading category...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category title"
                required
              />
            </div>

            {/* Parent Category */}
            {dataLoaded && (  // ✅ Only render Select after data is loaded
              <div>
                <Label>Parent Category (Optional)</Label>
                <Select
                  key={formData.parent_id}  // ✅ Force re-render when value changes
                  value={formData.parent_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Parent (Optional)" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-white dark:bg-gray-900 text-black dark:text-white border shadow-lg z-[9999]"
                    position="popper"
                  >
                    <SelectItem value="none">
                      No Parent
                    </SelectItem>
                    {parentCategories
                      .filter((cat) => cat._id !== categoryId) // ✅ Exclude self
                      .map((cat) => (
                        <SelectItem
                          key={cat._id}
                          value={cat._id}
                        >
                          {cat.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Current Image */}
            {existingImage && !previewUrl && (
              <div>
                <Label>Current Image</Label>
                <div className="mt-2 flex justify-center">
                  <img
                    src={existingImage}
                    alt="Current category"
                    className="w-80 h-52 object-cover rounded-md border"
                  />
                </div>
              </div>
            )}

            {/* Upload New Image */}
            <div>
              <Label>Replace Background Image (optional)</Label>
              <Input type="file" accept="image/*" onChange={handleBgImageChange} />
              {previewUrl && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-80 h-52 object-cover rounded-md border"
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