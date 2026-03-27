"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const categories = ["makeup", "skincare", "haircare", "bath&body"];

export default function BannerManager() {
  const [bannerType, setBannerType] = useState<"regular" | "hero">("regular");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  const baseURL =
    bannerType === "regular"
      ? "https://backendskinmuse.vercel.app/api/banners"
      : "https://backendskinmuse.vercel.app/api/hero-banners";

  // ✅ Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(baseURL);

      let data: any[] = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data?.banners)) data = res.data.banners;

      setBanners(data || []);
    } catch (err) {
      console.error("❌ Error fetching banners:", err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerType]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setLink("");
    setButtonText("");
    setSelectedCategories([]);
    setImageFile(null);
    setPreviewImage(null); // ✅ reset preview
    setEditingBanner(null);
  };


  // ✅ Create banner
  const handleCreate = async () => {
    if (!title || !imageFile) {
      toast({ title: "Title and image are required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("title", title);
      formData.append("link", link); // include for all banners

      if (bannerType === "regular") {
        formData.append("categories", JSON.stringify(selectedCategories));
      } else {
        formData.append("subtitle", subtitle);
        formData.append("buttonText", buttonText);
      }
      formData.append("image", imageFile);


      const endpoint =
        bannerType === "regular"
          ? `${baseURL}/upload`
          : `${baseURL}/upload`;

      await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "✅ Banner created successfully!" });
      setOpen(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error("❌ Error creating banner:", err);
      toast({ title: "Failed to create banner", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Edit banner
  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setLink(banner.link || "");
    if (bannerType === "regular") {
      setSelectedCategories(banner.categories || []);
    } else {
      setSubtitle(banner.subtitle || "");
      setButtonText(banner.buttonText || "");
    }
    setImageFile(null);
    setPreviewImage(banner.image); // ✅ show current banner image
    setEditOpen(true);
  };


  const openCreateModal = () => {
    resetForm(); // clear all states
    setOpen(true);
  };


  // ✅ Update banner
  const handleUpdate = async () => {
    if (!editingBanner) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("link", link); // for both regular & hero

      if (bannerType === "regular") {
        formData.append("categories", JSON.stringify(selectedCategories));
      } else {
        formData.append("subtitle", subtitle);
        formData.append("buttonText", buttonText);
      }

      if (imageFile) formData.append("image", imageFile);


      await axios.put(`${baseURL}/${editingBanner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "✅ Banner updated successfully!" });
      setEditOpen(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error("❌ Error updating banner:", err);
      toast({ title: "Failed to update banner", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete banner
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await axios.delete(`${baseURL}/${id}`);
      fetchBanners();
      toast({ title: "Banner deleted successfully!" });
    } catch (err) {
      console.error("❌ Error deleting banner:", err);
      toast({ title: "Failed to delete banner", variant: "destructive" });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={bannerType === "regular" ? "default" : "outline"}
          onClick={() => setBannerType("regular")}
        >
          Regular Banners
        </Button>
        <Button
          variant={bannerType === "hero" ? "default" : "outline"}
          onClick={() => setBannerType("hero")}
        >
          Hero Banners
        </Button>
      </div>

      {/* Show the selected section */}
      {bannerType === "regular" ? (
        <BannerSection
          type="regular"
          banners={banners}
          {...{
            title,
            subtitle,
            link,
            buttonText,
            imageFile,
            openCreateModal,
            selectedCategories,
            open,
            editOpen,
            previewImage,
            setPreviewImage,
            handleCreate,
            handleEdit,
            handleUpdate,
            handleDelete,
            setTitle,
            setSubtitle,
            setLink,
            setButtonText,
            setImageFile,
            toggleCategory,
            setOpen,
            setEditOpen,
            saving,
          }}
        />
      ) : (
        <BannerSection
          type="hero"
          banners={banners}
          {...{
            title,
            subtitle,
            link,
            buttonText,
            imageFile,
            openCreateModal,
            selectedCategories,
            open,
            editOpen,
            previewImage,
            setPreviewImage,
            handleCreate,
            handleEdit,
            handleUpdate,
            handleDelete,
            setTitle,
            setSubtitle,
            setLink,
            setButtonText,
            setImageFile,
            toggleCategory,
            setOpen,
            setEditOpen,
            saving,
          }}
        />
      )}

    </div>
  );
}

function BannerSection({
  type,
  banners,
  title,
  subtitle,
  link,
  buttonText,
  imageFile,
  selectedCategories,
  open,
  previewImage,
  setPreviewImage,
  editOpen,
  handleCreate,
  openCreateModal,
  handleEdit,
  handleUpdate,
  handleDelete,
  setTitle,
  setSubtitle,
  setLink,
  setButtonText,
  setImageFile,
  toggleCategory,
  setOpen,
  setEditOpen,
  saving,
}: any) {
  return (
    <div>
      {/* Header + Create Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {type === "hero" ? "Hero Banners" : "Regular Banners"}
          {type === "hero" ? (
            <p className="text-red-500">1516px/660px</p>
          ) :
            <p className="text-red-500">1516px/495px</p>}
        </h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-foreground text-background hover:bg-foreground"
              onClick={openCreateModal} // ✅ ensures form is empty
            >
              Create Banner
            </Button>
          </DialogTrigger>


          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">

            <DialogHeader>
              <DialogTitle>Create {type} Banner</DialogTitle>
              {type === "hero" ? (
                <p className="text-red-500">1516px/660px</p>
              ) : <p className="text-red-500">1516px/485px</p>}
            </DialogHeader>

            <div className="space-y-4">

              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />

              {/* Show link input for all banners */}
              <Label>Link</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} />

              {type === "hero" && (
                <>
                  {/* <Label>Subtitle</Label>
                  <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /> */}

                  {/* <Label>Button Text</Label>
                  <Input
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                  /> */}
                </>
              )}



              <Label>Banner Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />

              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md"
                />
              )}


              <Button
                onClick={handleCreate}
                disabled={saving}
                className="w-full bg-foreground text-background hover:bg-foreground"
              >
                {saving ? "Saving..." : "Save Banner"}
              </Button>
            </div>

          </DialogContent>
        </Dialog>
      </div>

      {/* Show banners */}
      {(!banners || banners.length === 0) && (
        <p className="text-gray-500 text-center py-6">No banners found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner: any) => (
          <Card key={banner._id} className="overflow-hidden">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-40 object-cover"
            />
            <CardContent>
              <h3 className="font-medium">{banner.title}</h3>

              {type === "hero" && (
                <>
                  <p className="text-sm text-gray-600">{banner.subtitle}</p>
                  <p className="text-xs text-gray-500">{banner.link}</p>
                </>
              )}



              <div className="flex gap-2 mt-3">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-foreground text-background hover:bg-foreground" size="sm" onClick={() => handleEdit(banner)}>
                      Edit
                    </Button>
                  </DialogTrigger>

                  {/* ✅ Edit Dialog */}
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit {type} Banner</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Label>Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />

                      {/* Show link input for all banners */}
                      <Label>Link</Label>
                      <Input value={link} onChange={(e) => setLink(e.target.value)} />

                      {type === "hero" && (
                        <>
                          <Label>Subtitle</Label>
                          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />

                          <Label>Button Text</Label>
                          <Input
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                          />
                        </>
                      )}



                      <Label>Banner Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file);
                          if (file) {
                            setPreviewImage(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      )}


                      <Button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="w-full bg-foreground text-background hover:bg-foreground"
                      >
                        {saving ? "Updating..." : "Update Banner"}
                      </Button>
                    </div>

                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="destructive" className="bg-background text-foreground hover:bg-foreground hover:text-background border border-foreground"
                  onClick={() => handleDelete(banner._id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
