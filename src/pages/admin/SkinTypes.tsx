"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { skinType } from "@/types/skintype";

const SkinTypes: React.FC = () => {
  const [skinTypes, setSkinTypes] = useState<skinType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [preLoading, setPreLoading] = useState(true);
  const navigate = useNavigate();

  // === Fetch skinTypes ===
  const fetchSkinTypes = async () => {
    try {
      setPreLoading(true);
      const res = await axios.get("https://skinmusebackend-delta.vercel.app/api/skinType");
      const catList = Array.isArray(res.data)
        ? res.data
        : [];
      // Sort by name or date (optional)
      const sorted = catList.sort((a, b) => a.title.localeCompare(b.title));
      setSkinTypes(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch SkinTypes");
    } finally {
      setPreLoading(false);
    }
  };

  useEffect(() => {
    fetchSkinTypes();
  }, []);

  // === Delete Brand ===
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      setLoading(id);
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.delete(`https://skinmusebackend-delta.vercel.app/api/skinType/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("SkinType deleted successfully");
      fetchSkinTypes();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete SkinType");
    } finally {
      setLoading(null);
    }
  };

  // === Filter by Search ===
  const filteredSkinTypes = skinTypes.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
    const handleEditClick = (skinType: skinType) => {
      navigate(`/admin/editSkinType/${skinType._id}`);
    };
  

  if (preLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading SkinTypes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Manage SkinTypes
        </h1>
        <Button className=" bg-foreground text-background hover:bg-foreground" onClick={() => navigate("/admin/SkinTypeAdd")}>
          <Plus className="h-4 w-4" /> Add SkinType
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search SkinTypes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-foreground bg-muted-background/50 focus:bg-background transition-colors"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="text-gray-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Brand List */}
      <Card>
        <CardHeader>
          <CardTitle>
            SkinTypes List <span className="text-sm">({filteredSkinTypes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkinTypes.map((skinType) => (
              <Card
                key={skinType._id}
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                {/* Logo */}
                {skinType.image ? (
                  <img
                    src={skinType.image}
                    alt={skinType.title}
                    className="w-full h-full object-contain bg-background"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {skinType.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        SkinType: {skinType.skinTypes}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-foreground"
                     onClick={() => handleEditClick(skinType)}
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 bg-foreground text-background"
                      onClick={() => handleDelete(skinType._id)}
                      disabled={loading === skinType._id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {loading === skinType._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkinTypes;
