"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brand } from "@/types/brand";
import { P } from "node_modules/framer-motion/dist/types.d-BJcRxCew";

type ImageWithPreview = {
  file?: File;
  preview: string;
  isExisting?: boolean;
};

export default function EditProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brandId: "",
    stock: "",
    discount: "",
    skinTypes: [] as string[],
    ingredients: "",
    productType: "",
    colors: [] as { name: string; hex: string; stock: string,price: number }[],
    litres: [] as { amount: string; stock: string, price: number }[], // added litres
    isTrending: false,
    isFeatured: false,
    isHotSale: false,
  });

  const [allImages, setAllImages] = useState<ImageWithPreview[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const categories = ["makeup", "skincare", "haircare", "bath&body"];
  const skinTypesOptions = ["dry", "oily", "combination", "acne"];

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("https://backendskinmuse.vercel.app/api/brands");
        if (Array.isArray(res.data)) setBrands(res.data);
        else if (res.data?.brands && Array.isArray(res.data.brands)) setBrands(res.data.brands);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch brands!");
      }
    };
    fetchBrands();
  }, []);

  // Fetch product data
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoadingData(true);
        const res = await axios.get(`https://backendskinmuse.vercel.app/api/products/${productId}`);
        const product = res.data;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "",
          brandId: product.brandId || "",
          stock: product.stock?.toString() || "",
          discount: product.discount?.toString() || "0",
          skinTypes: product.skinType || [],
          ingredients: product.ingredients ? product.ingredients.join("\n") : "",
          productType: product.productType || "",
          colors: product.colors
            ? product.colors.map((c: any) => ({
              name: c.name,
              hex: c.hex,
              stock: c.stock?.toString() || "0",
              price: c.price || 0,
            }))
            : [],
          litres: product.litres
            ? product.litres.map((l: any) => ({ amount: l.amount, stock: l.stock?.toString() || "0", price: l.price || 0 }))
            : [],
          isTrending: product.isTrending,
          isFeatured: product.isFeatured,
          isHotSale: product.isHotSale,
        });

        if (product.images && product.images.length > 0) {
          setAllImages(
            product.images.map((url: string) => ({
              preview: url,
              isExisting: true,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch product data!");
      } finally {
        setLoadingData(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const ingredientsArray = formData.ingredients.split("\n").map((i) => i.trim()).filter(Boolean);
      data.append("ingredients", JSON.stringify(ingredientsArray));
      data.append("productType", formData.productType);

      if (formData.category === "makeup" && formData.colors.length > 0) {
        const colorsToSend = formData.colors.map((c) => ({
          name: c.name,
          hex: c.hex,
          stock: parseInt(c.stock || "0"),
          price: c.price,
        }));
        data.append("colors", JSON.stringify(colorsToSend));
      } else if (formData.litres.length > 0) {
        const litresToSend = formData.litres.map((l) => ({
          amount: l.amount,
          stock: parseInt(l.stock || "0"),
          price: l.price,
        }));
        data.append("litres", JSON.stringify(litresToSend));
      } else {
        data.append("stock", formData.stock);
      }

      // Only new files
      allImages.forEach((img) => {
        if (img.file) data.append("images", img.file);
      });

      const existingImages = allImages.filter((img) => img.isExisting).map((img) => img.preview);
      data.append("existingImages", JSON.stringify(existingImages));

      data.append("isTrending", formData.isTrending ? "true" : "false");
      data.append("isHotSale", formData.isHotSale ? "true" : "false");
      data.append("isFeatured", formData.isFeatured ? "true" : "false");

      await axios.put(`https://backendskinmuse.vercel.app/api/products/${productId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Product updated successfully!");
      navigate("/admin/products", { state: { updated: true } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
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
                <Input type="number" name="discount" value={formData.discount} onChange={handleChange} min={0} max={100} />
              </div>
            </div>

            {/* Category & Skin Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent className="bg-background text-foreground">
                    {categories.map((cat) => (
                      <SelectItem className="data-[highlighted]:bg-foreground" key={cat} value={cat}>{cat}</SelectItem>
                    ))}
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

           {/* Optional Litre Variant */}
                        {["skincare", "haircare", "bath&body", "makeup"].includes(formData.category) && (
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.litres.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({
                                                    ...formData,
                                                    litres: formData.litres.length ? formData.litres : [{ amount: "", stock: "0", price: 0 }],
                                                });
                                            } else {
                                                setFormData({ ...formData, litres: [] });
                                            }
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
                                            <Input
                                                placeholder="ml (e.g., 0.5, 1)"
                                                value={litre.amount}
                                                onChange={(e) => {
                                                    const newLitres = [...formData.litres];
                                                    newLitres[idx].amount = e.target.value;
                                                    setFormData({ ...formData, litres: newLitres });
                                                }}
                                                className="w-24"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Stock"
                                                value={litre.stock}
                                                onChange={(e) => {
                                                    const newLitres = [...formData.litres];
                                                    newLitres[idx].stock = e.target.value;
                                                    setFormData({ ...formData, litres: newLitres });
                                                }}
                                                className="w-20"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                value={litre.price}
                                                onChange={(e) => {
                                                    const newLitres = [...formData.litres];
                                                    newLitres[idx].price = Number(e.target.value);
                                                    setFormData({ ...formData, litres: newLitres });
                                                }}
                                                className="w-20"
                                            />

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="bg-foreground text-background hover:bg-foreground"
                                                onClick={() => {
                                                    const newLitres = formData.litres.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, litres: newLitres });
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                litres: [...formData.litres, { amount: "", stock: "0", price: 0 }],
                                            })
                                        }
                                        className="bg-foreground text-background hover:bg-foreground"
                                    >
                                        Add ml Variant
                                    </Button>
                                </div>
                            </div>
                        )}

        
                        {formData.category === "makeup" && (
                            <div>
                                <Label>Colors & Stock</Label>
                                <div className="space-y-2">
                                    {formData.colors.map((color, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            {/* Color Name */}
                                            <Input
                                                placeholder="Color Name"
                                                value={color.name}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].name = e.target.value;
                                                    setFormData({ ...formData, colors: newColors });
                                                }}
                                                className="flex-1"
                                            />
                                            {/* Color Picker */}
                                            <Input
                                                type="color"
                                                value={color.hex}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].hex = e.target.value;
                                                    setFormData({ ...formData, colors: newColors });
                                                }}
                                                className="w-12 h-8 p-0"
                                            />
                                            {/* Stock */}
                                            <Input
                                                type="number"
                                                placeholder="Stock"
                                                value={color.stock}
                                                onChange={(e) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].stock = e.target.value;
                                                    setFormData({ ...formData, colors: newColors });
                                                }}
                                                className="w-20"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                value={color.price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newColors = [...formData.colors];
                                                    newColors[idx].price = Number(e.target.value);
                                                    setFormData({ ...formData, colors: newColors });
                                                }}
                                                className="w-20"
                                            />

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="bg-foreground text-background hover:bg-foreground"
                                                onClick={() => {
                                                    const newColors = formData.colors.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, colors: newColors });
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                colors: [...formData.colors, { name: "", hex: "#000000", stock: "0", price: 0 }],
                                            })
                                        }
                                        className="bg-foreground text-background hover:bg-foreground"
                                    >
                                        Add Color
                                    </Button>
                                </div>
                            </div>
                        )}


            {/* Brand */}
            <div>
              <Label>Brand</Label>
              <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                <SelectContent className="bg-background max-h-60 overflow-y-auto">
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
              <Textarea name="ingredients" value={formData.ingredients} onChange={handleChange} rows={4} />
            </div>

            {/* Images */}
            <div>
              <Label>Product Images</Label>
              <Input type="file" multiple accept="image/*" onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const newImgs = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
                setAllImages((prev) => [...prev, ...newImgs]);
              }} />
              <div className="mt-2 flex flex-wrap gap-2">
                {allImages.map((img, idx) => (
                  <div key={idx} className="relative h-24 w-24 border rounded overflow-hidden">
                    <img src={img.preview} alt={`Preview ${idx + 1}`} className="h-full w-full object-contain" />
                    <button type="button" onClick={() => {
                      setAllImages((prev) => {
                        if (!prev[idx].isExisting && prev[idx].file) URL.revokeObjectURL(prev[idx].preview);
                        return prev.filter((_, i) => i !== idx);
                      });
                    }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isTrending} onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })} />
                Trending
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isHotSale} onChange={(e) => setFormData({ ...formData, isHotSale: e.target.checked })} />
                Hot Sale
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                Featured
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-foreground text-background hover:bg-foreground">
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
