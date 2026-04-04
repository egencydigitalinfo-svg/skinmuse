import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Eye, Plus, Search, Filter, ArrowLeft } from 'lucide-react';
import AddBlogForm from '@/components/AddBlogForm';
interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  views: number;
  createdAt: string;
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://skinmusebackend-delta.vercel.app/api/blogs");
        setBlogs(res.data.blogs || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }finally {
        setLoading(false);
      }
    };
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


  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
    </div>
    );

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-8">
          <Link to="/">
            <Button className='bg-foreground text-background hover:bg-foreground' variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Blog</h1>
            <p className="text-foreground">Discover the latest fashion trends, tips, and insights</p>
          </div>

        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
              <Input
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background text-foreground border border-foreground/50 focus:border-foreground focus:ring-0 placeholder:text-foreground rounded-md transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-background text-foreground border border-foreground/50 focus:border-foreground focus:ring-0 rounded-md transition-all duration-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border border-secondary/50">
              <SelectItem value="all" className="data-[highlighted]:bg-foreground hover:bg-foreground hover:text-foreground">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="data-[highlighted]:bg-foreground hover:bg-foreground hover:text-background"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-background text-foreground border border-foreground/50 focus:border-foreground focus:ring-0 rounded-md transition-all duration-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border border-foreground/50">
              <SelectItem value="newest" className="data-[highlighted]:bg-foreground hover:bg-background hover:text-foreground">
                Newest First
              </SelectItem>
              <SelectItem value="oldest" className="data-[highlighted]:bg-foreground hover:bg-background hover:text-foreground">
                Oldest First
              </SelectItem>
              <SelectItem value="popular" className="data-[highlighted]:bg-foreground hover:bg-background hover:text-foreground">
                Most Popular
              </SelectItem>
              <SelectItem value="title" className="data-[highlighted]:bg-foreground hover:bg-background hover:text-foreground">
                Title A-Z
              </SelectItem>
            </SelectContent>
          </Select>

        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-foreground">
            Showing {filteredAndSortedBlogs.length} of {blogs.length} blogs
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </div>
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
          {filteredAndSortedBlogs.map((blog) => (
            <><Link to={`/blogs/${blog._id}`}>
              <Card key={blog._id} className="hover:shadow-lg bg-background text-foreground transition-shadow duration-300 group">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center  justify-between mb-2">
                    <Badge variant="secondary" className='text-white'>{blog.category}</Badge>

                  </div>
                  <CardTitle className=" group-hover:text-secondary transition-colors">
                    {blog.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-secondary ">
                    {blog.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {blog.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(blog.createdAt)}
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full mt-4 bg-secondary/90 text-background hover:bg-secondary/90 hover:shadow-md transition-all">
                    Read More
                  </Button>

                </CardContent>
              </Card>
            </Link>
            </>

          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedBlogs.length === 0 && blogs.length > 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No blogs found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Empty State - No blogs at all */}
        {blogs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No blogs yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;