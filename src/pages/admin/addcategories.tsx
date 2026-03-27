"use client";

import { useState } from "react";
import axios from "axios";
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
import { toast } from "sonner";

export default function CategoryUploadForm() {
    const [formData, setFormData] = useState({
        name: "",
        category: ""
    });
    const [bgImage, setBgImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const categories = ["makeup", "skincare", "haircare", "bath&body"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        if (!bgImage) {
            toast.error("Please select a bg image!");
            return;
        }

        if (!formData.name || !formData.category) {
            toast.error("Please fill in all required fields!");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            data.append("image", bgImage);
            const token =
                localStorage.getItem("skinmuse_admin_token") ||
                localStorage.getItem("skinmuse_superadmin_token") ||
                "";

            await axios.post("https://backendskinmuse.vercel.app/api/category", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // 👈 your user’s JWT token
                },
            });
            toast.success("✅ Category added successfully!");
            setFormData({ name: "", category: "" });
            setBgImage(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to Add Category!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                        Add Category
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Brand Name */}
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
                                        <SelectItem className="data-[highlighted]:bg-foreground data-[highlighted]:text-background" key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* bgImage Upload */}
                        <div>
                            <Label>Background Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleBgImageChange}
                                required
                            />
                            {previewUrl && (
                                <div className="mt-2 flex justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="Bg Preview"
                                        className="w-full h-full object-cover border"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <Button type="submit" disabled={loading} className="w-full bg-foreground text-background hover:bg-foreground">
                            {loading ? "Uploading..." : "Add Category"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
