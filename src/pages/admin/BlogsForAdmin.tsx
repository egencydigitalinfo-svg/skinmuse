"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, User, Eye, Plus, Search, Trash2, Pencil } from "lucide-react";
import AddBlogForm from "@/components/AddBlogForm";
import { toast } from "@/hooks/use-toast";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string[]; // ✅ categories as array
  image: string;
  views: number;
  createdAt: string;
}

const BlogsForAdmin: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);


  const fetchBlogs = async () => {
    try {
      const res = await axios.get("https://skinmusebackend-delta.vercel.app/api/blogs");
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch blogs from API
  useEffect(() => {
    fetchBlogs();
  }, []);

  // ✅ Filter and sort blogs
  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = blogs;

    if (searchQuery) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((blog) =>
        blog.category.includes(selectedCategory)
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "popular":
          return b.views - a.views;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [blogs, searchQuery, selectedCategory, sortBy]);

  // ✅ Unique categories
  const categories = useMemo(() => {
    const allCats = blogs.flatMap((blog) => blog.category);
    return [...new Set(allCats)].sort();
  }, [blogs]);

  // ✅ Add blog to backend
  const handleAddBlog = async (formData: FormData) => {
    try {
      const res = await axios.post(
        "https://skinmusebackend-delta.vercel.app/api/blogs",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setBlogs([res.data.blog, ...blogs]);
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding blog:", err);
    }
  };

  // === Delete Product ===
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.delete(`https://skinmusebackend-delta.vercel.app/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Deleted!", description: "Blog deleted successfully" });
      fetchBlogs();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
  };

  // === Edit Blog ===
  const handleEditBlog = async (id: string, formData: FormData) => {
    try {
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";

      const res = await axios.put(
        `https://skinmusebackend-delta.vercel.app/api/blogs/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({ title: "Updated!", description: "Blog updated successfully" });
      setShowEditForm(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive",
      });
    }
  };


  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading Blogs data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog</h1>
            <p className="text-muted-foreground">
              Discover the latest fashion trends, tips, and insights
            </p>
          </div>

          {!loading && blogs.length > 0 && (
            <Button onClick={() => setShowAddForm(true)} className="flex gap-2 bg-foreground text-background hover:bg-foreground">
              <Plus className="h-4 w-4" />
              Add New Blog
            </Button>
          )}


        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent  className="bg-background text-foreground">
              <SelectItem className="data-[highlighted]:bg-foreground" value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem className="data-[highlighted]:bg-foreground" key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground">
              <SelectItem className="data-[highlighted]:bg-foreground" value="newest">Newest First</SelectItem>
              <SelectItem className="data-[highlighted]:bg-foreground" value="oldest">Oldest First</SelectItem>
              <SelectItem className="data-[highlighted]:bg-foreground" value="popular">Most Popular</SelectItem>
              <SelectItem className="data-[highlighted]:bg-foreground" value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Blog Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add New Blog</h2>
              <AddBlogForm
                onSubmit={handleAddBlog}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {loading ? (
          <p>Loading blogs...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedBlogs.map((blog) => (
              <Card
                key={blog._id}
                className="hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2 flex-wrap">
                      {blog.category.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary">
                    {blog.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {blog.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {blog.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(blog.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(blog._id)}
                        className="mt-3 bg-foreground text-background hover:bg-foreground"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBlog(blog);
                          setShowEditForm(true);
                        }}
                         className="mt-3 bg-background text-foreground hover:bg-foreground"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Blogs */}
        {!loading && blogs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No blogs yet</h3>
            <p className="text-sm mb-4">Be the first to share your thoughts!</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Blog
            </Button>
          </div>
        )}
      </div>

      {showEditForm && editingBlog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Blog</h2>
            <AddBlogForm
              onSubmit={(formData) => handleEditBlog(editingBlog._id, formData)}
              onCancel={() => {
                setShowEditForm(false);
                setEditingBlog(null);
              }}
              existingBlog={editingBlog} // ✅ pass the blog data for pre-fill
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogsForAdmin;
