"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ProductUploadForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        brandId: "",
        stock: "",
        skinTypes: [] as string[],
        discount: "",
        ingredients: ""
    });

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // ✅ preview
    const [brands, setBrands] = useState<{ _id: string; name: string; category: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const categories = ["makeup", "skincare", "haircare", "bath&body"];
    const skinTypesOptions = ["dry", "oily", "combination", "acne"];

    // Generate image preview
    useEffect(() => {
        if (!image) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(image);
        setPreviewUrl(objectUrl);

        // Cleanup
        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    // Fetch brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axios.get("https://backendskinmuse.vercel.app/api/brands");
                if (Array.isArray(res.data)) setBrands(res.data);
                else if (res.data?.brands && Array.isArray(res.data.brands)) setBrands(res.data.brands);
                else setBrands([]);
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch brands!");
            }
        };
        fetchBrands();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!image) {
            toast.error("Please select an image!");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();

            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("category", formData.category);
            data.append("stock", formData.stock);
            data.append("brandId", formData.brandId);
            data.append("discount", formData.discount);
            data.append("skinTypes", JSON.stringify(formData.skinTypes));

            const ingredientsArray = formData.ingredients
                .split("\n")
                .map((i) => i.trim())
                .filter(Boolean);
            data.append("ingredients", JSON.stringify(ingredientsArray));

            data.append("image", image);

            await axios.post("https://backendskinmuse.vercel.app/api/products", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("✅ Product uploaded successfully!");
            setFormData({
                name: "",
                description: "",
                price: "",
                category: "",
                brandId: "",
                stock: "",
                skinTypes: [],
                discount: "",
                ingredients: ""
            });
            setImage(null);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to upload product!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Upload New Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Product Name */}
                        <div>
                            <Label>Product Name</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        {/* Description */}
                        <div>
                            <Label>Description</Label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} required />
                        </div>

                        {/* Price, Stock & Discount */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Price</Label>
                                <Input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label>Stock</Label>
                                <Input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label>Discount (%)</Label>
                                <Input type="number" name="discount" value={formData.discount} onChange={handleChange} min={0} max={100} placeholder="0" />
                            </div>
                        </div>

                        {/* Category & Skin Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Category</Label>
                                <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Skin Type</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {skinTypesOptions.map((type) => (
                                        <label key={type} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                value={type}
                                                checked={formData.skinTypes.includes(type)}
                                                onChange={(e) => {
                                                    const { checked, value } = e.target;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        skinTypes: checked
                                                            ? [...prev.skinTypes, value]
                                                            : prev.skinTypes.filter((t) => t !== value),
                                                    }));
                                                }}
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Brand */}
                        <div>
                            <Label>Brand</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                                <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand._id} value={brand._id}>
                                            {brand.name} ({brand.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <Label>Ingredients (one per line)</Label>
                            <Textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                placeholder="Enter one ingredient per line"
                                rows={4}
                            />
                        </div>

                        {/* Image */}
                        <div>
                            <Label>Product Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                required
                            />
                            {/* ✅ Image preview */}
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="mt-2 max-h-48 object-contain border rounded"
                                />
                            )}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Uploading..." : "Upload Product"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
