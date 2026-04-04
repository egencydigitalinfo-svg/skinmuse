"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useParams } from "react-router-dom";

export default function SkinTypeEditForm() {
  const [formData, setFormData] = useState({
    name: "",
    skinType: "",
  });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {skinTypeId} = useParams();

  const skinTypes = ["oily", "dry", "acne", "combination"];

  // 🔹 Fetch existing skin type details
  useEffect(() => {
    const fetchSkinType = async () => {
      try {
        const res = await axios.get(`https://skinmusebackend-delta.vercel.app/api/skinType`);
        const found = res.data.find((item: any) => item._id === skinTypeId);
        if (found) {
          setFormData({
            name: found.title || "",
            skinType: found.skinTypes || "",
          });
          setPreviewUrl(found.image || null);
        }
      } catch (error) {
        toast.error("Failed to fetch skin type details!");
      }
    };
    fetchSkinType();
  }, [skinTypeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBgImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  };

  // 🔹 Handle Submit (PUT update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.skinType) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (bgImage) data.append("image", bgImage);

      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";

      await axios.put(`https://skinmusebackend-delta.vercel.app/api/skinType/${skinTypeId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Skin Type updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update Skin Type!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Skin Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Skin Type Select */}
            <div>
              <Label>Skin Type</Label>
              <Select
                value={formData.skinType}
                onValueChange={(value) =>
                  setFormData({ ...formData, skinType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skin type" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  {skinTypes.map((cat) => (
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

            {/* Image Upload */}
            <div>
              <Label>Background Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImage}
              />
              {previewUrl && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover border"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground"
            >
              {loading ? "Updating..." : "Update Skin Type"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
