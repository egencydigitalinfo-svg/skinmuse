import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const API_BASE = "https://backendskinmuse.vercel.app/api";

const AdminPromoAndMinOrder = () => {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [minOrder, setMinOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>("");



  const [form, setForm] = useState({
    code: "",
    discountPercentage: "",
    expiryDate: "",
    isActive: true,
  });

  // === FETCH EXISTING DATA ===
  // === FETCH ALL DATA ===
  const fetchData = async () => {
    try {
      const [promoRes, minRes, shipRes, imageRes] = await Promise.all([
        axios.get(`${API_BASE}/promocodes`),
        axios.get(`${API_BASE}/minorder`),
        axios.get(`${API_BASE}/shipping`),
        axios.get(`${API_BASE}/images`),
      ]);

      setPromoCodes(promoRes.data || []);
      setMinOrder(minRes.data?.[0] || null);

      if (Array.isArray(shipRes.data) && shipRes.data.length > 0) {
        setShipping({ ...shipRes.data[0], shippingPrice: Number(shipRes.data[0].shippingPrice) });
      } else if (shipRes.data && shipRes.data.shippingPrice != null) {
        setShipping({ ...shipRes.data, shippingPrice: Number(shipRes.data.shippingPrice) });
      }

      setImages(imageRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === IMAGE HANDLERS ===
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(null);
  };

  const handleUploadImage = async () => {
    if (!imageFile && !editingImageId) return toast.error("Select an image");

    try {
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      setUploading(true);
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);
      formData.append("title", imageTitle);

      let res;
      if (editingImageId) {
        res = await axios.put(`${API_BASE}/images/${editingImageId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        });
        setImages((prev) => prev.map((img) => (img._id === editingImageId ? res.data.image : img)));
        toast.success("Image updated successfully!");
      } else {
        res = await axios.post(`${API_BASE}/images/upload-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        });
        setImages((prev) => [res.data.image, ...prev]);
        toast.success("Image uploaded successfully!");
      }


      // Reset states
      setImageFile(null);
      setImagePreview(null);
      setImageTitle("");
      setEditingImageId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload/update image");
    } finally {
      setUploading(false);
    }
  };

  const handleEditImage = (img: any) => {

    setEditingImageId(img._id);
    setImagePreview(img.imageUrl);
    setImageTitle(img.title || "");
  };

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`${API_BASE}/images/${id}`);
      setImages((prev) => prev.filter((img) => img._id !== id));
      toast.success("Image deleted");
      if (editingImageId === id) {
        setEditingImageId(null);
        setImagePreview(null);
        setImageTitle("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
    }
  };

  const handleSaveShipping = async () => {
    if (!shipping || shipping.shippingPrice === "" || shipping.shippingPrice < 0)
      return toast.error("Enter a valid shipping amount");

    try {
      let res;
      if (shipping._id) {
        res = await axios.put(`${API_BASE}/shipping/${shipping._id}`, {
          shippingPrice: shipping.shippingPrice,
        });
      } else {
        res = await axios.post(`${API_BASE}/shipping`, {
          shippingPrice: shipping.shippingPrice,
        });
      }

      toast.success("Shipping amount saved!");
      setShipping(res.data);
    } catch (err) {
      toast.error("Failed to save shipping amount");
    }
  };

  const handleDeleteShipping = async () => {
    if (!shipping?._id) return toast.error("No shipping rule to delete");
    if (!confirm("Delete shipping amount?")) return;

    try {
      await axios.delete(`${API_BASE}/shipping/${shipping._id}`);
      setShipping(null);
      toast.success("Shipping amount deleted");
    } catch {
      toast.error("Failed to delete shipping amount");
    }
  };


  const handleAddPromo = async () => {
    if (!form.code || !form.discountPercentage)
      return toast.error("Please fill all fields");

    try {
      const res = await axios.post(`${API_BASE}/promocodes`, {
        code: form.code,
        discountPercentage: Number(form.discountPercentage),
        expiryDate: form.expiryDate || null,
        isActive: form.isActive,
      });
      toast.success("Promo code added successfully!");
      setForm({ code: "", discountPercentage: "", expiryDate: "", isActive: true });
      setPromoCodes((prev) => [...prev, res.data]);
    } catch (err: any) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to add promo code");
    }
  };


  const handleUpdatePromo = async (id: string, updatedFields: Partial<typeof promoCodes[0]>) => {
    try {
      const { data } = await axios.put(`${API_BASE}/promocodes/${id}`, updatedFields);
      toast.success("Promo updated");
      setPromoCodes((prev) =>
        prev.map((p) => (p._id === id ? data : p))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update promo");
    }
  };



  // === DELETE PROMO CODE ===
  const handleDeletePromo = async (id: string) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      await axios.delete(`${API_BASE}/promocodes/${id}`);
      toast.success("Promo deleted");
      setPromoCodes((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete promo");
    }
  };

  // === UPDATE OR CREATE MIN ORDER ===
  const handleSaveMinOrder = async () => {
    if (!minOrder || minOrder.price === "" || minOrder.price < 0)
      return toast.error("Please set a valid minimum order price");

    try {
      let res;
      if (minOrder._id) {
        // Update existing min order
        res = await axios.put(`${API_BASE}/minorder/${minOrder._id}`, {
          price: minOrder.price,
        });
      } else {
        // Create new
        res = await axios.post(`${API_BASE}/minorder`, {
          price: minOrder.price,
        });
      }
      toast.success("Minimum order saved successfully!");
      setMinOrder(res.data);
    } catch (error) {
      toast.error("Failed to save minimum order");
    }
  };

  // === DELETE MIN ORDER ===
  const handleDeleteMinOrder = async () => {
    if (!minOrder?._id) return toast.error("No min order found to delete");
    if (!window.confirm("Delete minimum order setting?")) return;

    try {
      await axios.delete(`${API_BASE}/minorder/${minOrder._id}`);
      toast.success("Minimum order deleted");
      setMinOrder(null);
    } catch {
      toast.error("Failed to delete min order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading Promos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-16">
      <div className="container max-w-5xl space-y-10">
        <h1 className="text-4xl font-serif font-bold text-center mb-10">
          🛠️ Admin Panel — Promo Codes
        </h1>

        {/* === PROMO CODES MANAGEMENT === */}
        <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">
              Manage Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Add Form */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Promo Code</Label>
                <Input
                  placeholder="e.g. SKINMUSE10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div>
                <Label>Discount Percentage (%)</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={form.discountPercentage}
                  onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                />

              </div>
              <div>
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddPromo}
                  className="w-full bg-foreground text-background"
                >
                  Add Promo
                </Button>
              </div>
            </div>

            {/* Promo List */}
            <div className="border-t border-foreground/20 pt-6">
              <h3 className="font-semibold mb-4 text-lg">Existing Promo Codes</h3>
              {promoCodes.length === 0 ? (
                <p className="text-foreground/50">No promo codes added yet.</p>
              ) : (
                <div className="space-y-4">
                  {promoCodes.map((promo) => (
                    <div
                      key={promo._id}
                      className="flex flex-wrap justify-between items-center p-4 border rounded-xl bg-foreground/5"
                    >
                      <div>
                        <p className="font-semibold text-lg">{promo.code}</p>
                        <p className="text-sm text-foreground/70">
                          Discount: {promo.discountPercentage}% |{" "}
                          <span
                            className={`${promo.isActive ? "text-green-600" : "text-red-500"
                              }`}
                          >
                            {promo.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleUpdatePromo(promo._id, { isActive: !promo.isActive })}
                        >
                          {promo.isActive ? "Deactivate" : "Activate"}
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleDeletePromo(promo._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* === MINIMUM ORDER SECTION === */}
        <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">
              Minimum Order Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Minimum Order Amount (Rs)</Label>
                <Input
                  type="number"
                  placeholder="Enter minimum order amount"
                  value={minOrder?.price || ""}
                  onChange={(e) =>
                    setMinOrder((prev: any) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-end gap-3">
                <Button
                  onClick={handleSaveMinOrder}
                  className="w-full bg-foreground text-background"
                >
                  {minOrder?._id ? "Update" : "Create"}
                </Button>
                {minOrder?._id && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteMinOrder}
                    className="w-full"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SHIPPING SETTINGS === */}
        <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">
              Shipping Amount Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Shipping Amount (Rs)</Label>
                <Input
                  type="number"
                  placeholder="Enter shipping amount"
                  value={shipping?.shippingPrice || ""}
                  onChange={(e) =>
                    setShipping((prev: any) => ({
                      ...prev,
                      shippingPrice: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex items-end gap-3">
                <Button
                  onClick={handleSaveShipping}
                  className="w-full bg-foreground text-background"
                >
                  {shipping?._id ? "Update" : "Create"}
                </Button>

                {shipping?._id && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteShipping}
                    className="w-full"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* --- Image Management --- */}
        <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold">
              {editingImageId ? "Edit Image" : "Upload Image"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Image Title (optional)</Label>
                <Input
                  type="text"
                  placeholder="Image title"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                />
                <Label className="mt-2">Select Image</Label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md mt-2"
                  />
                )}
              </div>
              <div className="flex items-end gap-3">
                <Button
                  onClick={handleUploadImage}
                  className="w-full bg-foreground text-background"
                  disabled={uploading}
                >
                  {uploading ? "Processing..." : editingImageId ? "Update" : "Upload"}
                </Button>
              </div>
            </div>

            {/* Display existing images */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4 text-lg">Existing Images</h3>
              {images.length === 0 ? (
                <p className="text-foreground/50">No images uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div key={img._id} className="border rounded-xl p-2 flex flex-col items-center">
                      <img src={img.imageUrl} alt={img.title} className="w-full h-32 object-cover rounded-md" />
                      <p className="mt-2 text-center text-sm">{img.title}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => handleEditImage(img)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(img._id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminPromoAndMinOrder;
