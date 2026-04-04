"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Cat, ParentCategory } from "@/types/category";
import { useNavigate } from "react-router-dom";

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [preLoading, setPreLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setPreLoading(true);
      const res = await axios.get("https://backendskinmuse.vercel.app/api/category");
      const catList = Array.isArray(res.data) ? res.data : [];
      const sorted = catList.sort((a: Cat, b: Cat) => a.title.localeCompare(b.title));
      setCategories(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    } finally {
      setPreLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      setLoading(id);
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.delete(`https://backendskinmuse.vercel.app/api/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete category");
    } finally {
      setLoading(null);
    }
  };

  const handleEditClick = (cat: Cat) => {
    navigate(`/admin/editCategory/${cat._id}`);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Separate parent categories and build subcategory map
  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const subCategoryMap: Record<string, Cat[]> = {};

  categories.forEach((cat) => {
    if (cat.parent_id) {
      const parentId =
        typeof cat.parent_id === "string"
          ? cat.parent_id
          : (cat.parent_id as ParentCategory)._id;
      if (parentId) {
        if (!subCategoryMap[parentId]) subCategoryMap[parentId] = [];
        subCategoryMap[parentId].push(cat);
      }
    }
  });

  const filteredParents = parentCategories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (preLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-600">Loading Categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Categories</h1>
        <Button
          className="bg-foreground text-background hover:bg-foreground"
          onClick={() => navigate("/admin/categoryAdd")}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Category
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
              placeholder="Search categories..."
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Categories List{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredParents.length} parent{filteredParents.length !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100 text-gray-600 text-left">
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3 w-16">Image</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Subcategories</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((cat) => {
                    const subs = subCategoryMap[cat._id ?? ""] || [];
                    const isExpanded = expandedRows.has(cat._id ?? "");

                    return (
                      <React.Fragment key={cat._id}>
                        {/* Parent Row */}
                        <tr className="border-b hover:bg-gray-50 transition-colors">
                          {/* Expand Toggle */}
                          <td className="px-4 py-3">
                            {subs.length > 0 ? (
                              <button
                                onClick={() => toggleRow(cat._id ?? "")}
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4 inline-block" />
                            )}
                          </td>

                          {/* Image */}
                          <td className="px-4 py-3">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-10 h-10 object-contain rounded border bg-white"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                N/A
                              </div>
                            )}
                          </td>

                          {/* Title */}
                          <td className="px-4 py-3 font-medium text-gray-800">{cat.title}</td>

                          {/* Subcategory count badge */}
                          <td className="px-4 py-3">
                            {subs.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {subs.length} sub{subs.length !== 1 ? "categories" : "category"}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(cat)}
                                className="h-8 px-3"
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(cat._id)}
                                disabled={loading === cat._id}
                                className="h-8 px-3 bg-foreground text-background"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                {loading === cat._id ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Subcategory Expanded Rows */}
                        {isExpanded &&
                          subs.map((sub) => (
                            <tr
                              key={sub._id}
                              className="border-b bg-blue-50/40 hover:bg-blue-50 transition-colors"
                            >
                              {/* Indent indicator */}
                              <td className="px-4 py-2" />
                              <td className="px-4 py-2 pl-8">
                                {sub.image ? (
                                  <img
                                    src={sub.image}
                                    alt={sub.title}
                                    className="w-8 h-8 object-contain rounded border bg-white"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                    N/A
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-600 pl-2">
                                <span className="text-gray-400 mr-2">↳</span>
                                {sub.title}
                              </td>
                              <td className="px-4 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                  subcategory
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditClick(sub)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(sub._id)}
                                    disabled={loading === sub._id}
                                    className="h-7 px-2 text-xs bg-foreground text-background"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    {loading === sub._id ? "Deleting..." : "Delete"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;