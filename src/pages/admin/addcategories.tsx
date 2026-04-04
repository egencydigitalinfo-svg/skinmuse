"use client";

import { useState, useEffect } from "react";
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

export default function CategoryUploadForm() {
    const [formData, setFormData] = useState({
        name: "",
        parent_id: "none",
    });

    const [bgImage, setBgImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [parentCategories, setParentCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(
                    "https://backendskinmuse.vercel.app/api/category"
                );

                // ✅ Only show categories where parent_id is null (top-level/main categories)
                const topLevelOnly = res.data.filter(
                    (cat: any) => cat.parent_id === null || cat.parent_id === undefined
                );

                setParentCategories(topLevelOnly);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setBgImage(file);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // console.log("formData state:", formData);
        //  console.log("parent_id value:", formData.parent_id);
        if (!bgImage) {
            toast.error("Please select an image!");
            return;
        }

        if (!formData.name.trim()) {
            toast.error("Please enter a category name!");
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append("name", formData.name);
            data.append("image", bgImage);

            // ✅ Only append parent_id if a parent is selected
            if (formData.parent_id !== "none") {
                data.append("parent_id", formData.parent_id);
            }

            const token =
                localStorage.getItem("skinmuse_admin_token") ||
                localStorage.getItem("skinmuse_superadmin_token") ||
                "";

            await axios.post(
                "https://backendskinmuse.vercel.app/api/category",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("✅ Category Added Successfully!");

            // ✅ Reset form
            setFormData({ name: "", parent_id: "none" });
            setBgImage(null);
            setPreviewUrl(null);

            // console.log("FormData parent_id:", data.get("parent_id"));
            // ✅ Refresh parent list so new top-level categories appear instantly
            const res = await axios.get(
                "https://backendskinmuse.vercel.app/api/category"
            );
            const topLevelOnly = res.data.filter(
                (cat: any) => cat.parent_id === null || cat.parent_id === undefined
            );
            setParentCategories(topLevelOnly);

        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || "Error adding category";
            toast.error(`❌ ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                        Add Category / SubCategory
                    </CardTitle>
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
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        {/* Parent Category — only top-level categories shown */}
                        <div>
                            <Label>Parent Category (Optional)</Label>
                            <Select
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
                                    <SelectItem value="none">No Parent (Main Category)</SelectItem>
                                    {parentCategories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Leave as "No Parent" to create a main category. Select a parent to create a subcategory.
                            </p>
                        </div>

                        {/* Image */}
                        <div>
                            <Label>Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleBgImageChange}
                            />
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    className="mt-2 w-full h-40 object-cover border rounded-md"
                                />
                            )}
                        </div>

                        {/* Submit */}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Uploading..." : "Add Category"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}