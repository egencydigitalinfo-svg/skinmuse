"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ProductUploadForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",        // stores _id
        subCategoryId: "",
        brandId: "",
        stock: "",
        skinTypes: [] as string[],
        discount: "",
        ingredients: "",
        productType: "",
        colors: [] as { name: string; hex: string; stock: string; price: number }[],
        litres: [] as { amount: string; stock: string; price: number }[],
    });

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [brands, setBrands] = useState<{ _id: string; name: string; category: string }[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [mainCategories, setMainCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const skinTypesOptions = ["dry", "oily", "combination", "acne"];

    // ✅ Helper — selected category ka title get karo _id se
    const getSelectedCategoryTitle = (): string => {
        const found = mainCategories.find((cat) => cat._id === formData.category);
        return found ? found.title.toLowerCase() : "";
    };

    useEffect(() => {
        const urls = images.map((img) => URL.createObjectURL(img));
        setPreviews(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [images]);

    // ✅ Fetch brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axios.get("https://skinmusebackend-delta.vercel.app/api/brands");
                if (Array.isArray(res.data)) setBrands(res.data);
                else if (res.data?.brands) setBrands(res.data.brands);
                else setBrands([]);
            } catch {
                toast.error("Failed to fetch brands!");
            }
        };
        fetchBrands();
    }, []);

    // ✅ Fetch all categories once
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("https://skinmusebackend-delta.vercel.app/api/category");
                const all = res.data;
                setAllCategories(all);

                // ✅ Only top-level categories (parent_id is null or undefined)
                const topLevel = all.filter(
                    (cat: any) => cat.parent_id === null || cat.parent_id === undefined
                );
                setMainCategories(topLevel);
            } catch {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ When main category changes → filter subcategories by parent_id
    const handleCategoryChange = (value: string) => {
        // reset dependent fields when category changes
        setFormData({ ...formData, category: value, subCategoryId: "", colors: [], litres: [] });

        // ✅ Filter subcategories where parent_id._id === selected category _id
        const subs = allCategories.filter(
            (cat: any) =>
                cat.parent_id?._id === value ||
                cat.parent_id === value
        );
        setSubCategories(subs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            toast.error("Please select at least one image!");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();

            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("category", formData.category);
            data.append("brandId", formData.brandId);
            data.append("discount", formData.discount);
            data.append("skinTypes", JSON.stringify(formData.skinTypes));

            if (formData.subCategoryId) {
                data.append("subcategory", formData.subCategoryId);
            }

            const ingredientsArray = formData.ingredients
                .split("\n")
                .map((i) => i.trim())
                .filter(Boolean);
            data.append("ingredients", JSON.stringify(ingredientsArray));

            images.forEach((img) => data.append("images", img));

            // ✅ title se check karo — _id se nahi
            const categoryTitle = getSelectedCategoryTitle();

            if (categoryTitle === "makeup" && formData.colors.length > 0) {
                const colorsToSend = formData.colors.map((c) => ({
                    name: c.name,
                    hex: c.hex,
                    stock: parseInt(c.stock || "0"),
                    price: parseFloat(String(c.price) || formData.price),
                }));
                data.append("colors", JSON.stringify(colorsToSend));
            }

            if (formData.litres.length > 0) {
                const litresToSend = formData.litres.map((l) => ({
                    amount: l.amount,
                    stock: parseInt(l.stock || "0"),
                    price: parseFloat(String(l.price) || formData.price),
                }));
                data.append("litres", JSON.stringify(litresToSend));
            } else {
                data.append("stock", formData.stock);
            }

            await axios.post("https://skinmusebackend-delta.vercel.app/api/products", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("✅ Product uploaded successfully!");

            setFormData({
                name: "", description: "", price: "", category: "",
                subCategoryId: "", brandId: "", stock: "", skinTypes: [],
                discount: "", ingredients: "", productType: "", colors: [], litres: [],
            });
            setImages([]);
            setPreviews([]);
            setSubCategories([]);

        } catch (err: any) {
            console.error(err);
            toast.error("❌ Failed to upload product!");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Render mein use karne ke liye title nikalo
    const categoryTitle = getSelectedCategoryTitle();

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

                        {/* ✅ Category + Subcategory side by side */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* ✅ Main Category — API se top-level only */}
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent className="bg-background text-foreground">
                                        {mainCategories.map((cat) => (
                                            <SelectItem
                                                className="data-[highlighted]:bg-foreground"
                                                key={cat._id}
                                                value={cat._id}
                                            >
                                                {cat.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* ✅ SubCategory — only shows when subcategories exist */}
                            {subCategories.length > 0 && (
                                <div>
                                    <Label>Sub Category</Label>
                                    <Select
                                        value={formData.subCategoryId}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, subCategoryId: value })
                                        }
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Sub Category" /></SelectTrigger>
                                        <SelectContent
                                            className="bg-white dark:bg-gray-900 text-black dark:text-white border shadow-lg z-[9999]"
                                            position="popper"
                                        >
                                            {subCategories.map((sub) => (
                                                <SelectItem
                                                    key={sub._id}
                                                    value={sub._id}
                                                    className="data-[highlighted]:bg-gray-800 dark:data-[highlighted]:bg-gray-800"
                                                >
                                                    {sub.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Skin Type */}
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

                        {/* ✅ ml Variants — category select hone ke baad show ho (sab categories pe) */}
                        {formData.category && (
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.litres.length > 0}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                litres: e.target.checked
                                                    ? (formData.litres.length ? formData.litres : [{ amount: "", stock: "0", price: 0 }])
                                                    : [],
                                            });
                                        }}
                                    />
                                    <span>Add ml Variants (Optional)</span>
                                </label>
                            </div>
                        )}

                        {formData.litres.length > 0 && (
                            <div>
                                <Label>ml & Stock</Label>
                                <div className="space-y-2">
                                    {formData.litres.map((litre, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <Input placeholder="ml (e.g., 0.5, 1)" value={litre.amount}
                                                onChange={(e) => {
                                                    const newLitres = [...formData.litres];
                                                    newLitres[idx].amount = e.target.value;
                                                    setFormData({ ...formData, litres: newLitres });
                                                }} className="w-24" />
                                            <Input type="number" placeholder="Stock" value={litre.stock}
                                                onChange={(e) => {
                                                    const newLitres = [...formData.litres];
                                                    newLitres[idx].stock = e.target.value;
                                                    setFormData({ ...formData, litres: newLitres });
                                                }} className="w-20" />
                                            <Input type="number" placeholder="Price" value={litre.price}
                                                onChange={(e) => {
                                                    const newLitres = [...formData.litres];
                                                    newLitres[idx].price = Number(e.target.value);
                                                    setFormData({ ...formData, litres: newLitres });
                                                }} className="w-20" />
                                            <Button type="button" variant="destructive" size="sm"
                                                className="bg-foreground text-background hover:bg-foreground"
                                                onClick={() => setFormData({ ...formData, litres: formData.litres.filter((_, i) => i !== idx) })}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button"
                                        onClick={() => setFormData({ ...formData, litres: [...formData.litres, { amount: "", stock: "0", price: 0 }] })}
                                        className="bg-foreground text-background hover:bg-foreground">
                                        Add ml Variant
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ✅ Colors — categoryTitle === "makeup" check (title se, _id se nahi) */}
                        {categoryTitle === "makeup" && (
                            <div>
                                <Label>Colors & Stock</Label>
                                <div className="space-y-2">
                                    {formData.colors.map((color, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <Input placeholder="Color Name" value={color.name}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].name = e.target.value;
                                                    setFormData({ ...formData, colors: newColors });
                                                }} className="flex-1" />
                                            <Input type="color" value={color.hex}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].hex = e.target.value;
                                                    setFormData({ ...formData, colors: newColors });
                                                }} className="w-12 h-8 p-0" />
                                            <Input type="number" placeholder="Stock" value={color.stock}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].stock = e.target.value;
                                                    setFormData({ ...formData, colors: newColors });
                                                }} className="w-20" />
                                            <Input type="number" placeholder="Price" value={color.price}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].price = Number(e.target.value);
                                                    setFormData({ ...formData, colors: newColors });
                                                }} className="w-20" />
                                            <Button type="button" variant="destructive" size="sm"
                                                className="bg-foreground text-background hover:bg-foreground"
                                                onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== idx) })}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button"
                                        onClick={() => setFormData({ ...formData, colors: [...formData.colors, { name: "", hex: "#000000", stock: "0", price: 0 }] })}
                                        className="bg-foreground text-background hover:bg-foreground">
                                        Add Color
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Brand */}
                        <div>
                            <Label>Brand</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                                <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                                <SelectContent className="bg-background max-h-60 overflow-y-auto" position="popper">
                                    {brands.map((brand) => (
                                        <SelectItem className="data-[highlighted]:bg-foreground" key={brand._id} value={brand._id}>
                                            {brand.name} ({brand.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <Label>Ingredients (one per line)</Label>
                            <Textarea name="ingredients" value={formData.ingredients} onChange={handleChange}
                                placeholder="Enter one ingredient per line" rows={4} />
                        </div>

                        {/* Images */}
                        <div>
                            <Label>Product Images</Label>
                            <Input type="file" accept="image/*" multiple
                                onChange={(e) => setImages(Array.from(e.target.files || []))} required />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {previews.map((url, idx) => (
                                    <div key={idx} className="relative h-24 w-24 border rounded overflow-hidden">
                                        <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-contain" />
                                        <button type="button"
                                            onClick={() => {
                                                setImages((prev) => prev.filter((_, i) => i !== idx));
                                                setPreviews((prev) => prev.filter((_, i) => i !== idx));
                                            }}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button className="bg-foreground text-background hover:bg-foreground w-full" type="submit" disabled={loading}>
                            {loading ? "Uploading..." : "Upload Product"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}