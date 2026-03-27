import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye, ArrowLeft, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  createdAt:string;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Fetch single blog + all blogs
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://backendskinmuse.vercel.app/api/blogs/${id}`);
        setBlog(res.data.blog);

        const allRes = await axios.get(`https://backendskinmuse.vercel.app/api/blogs`);
        setRelatedBlogs(allRes.data.blogs || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const handleShare = () => {
    if (!blog) return;
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'Blog link has been copied to your clipboard.',
      });
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center bg-background text-secondary justify-center">
        <p>Loading blog...</p>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // ✅ Blog not found
  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="secondary" onClick={() => navigate('/blogs')} className="mb-6 text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>

        {/* Featured Image */}
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="secondary" className='text-white'>{blog.category[0]}</Badge>
            <div className="flex items-center text-sm text-secondary">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(blog.createdAt)}
            </div>
            <div className="flex items-center text-sm text-secondary">
              <User className="h-4 w-4 mr-1" />
              {blog.author}
            </div>
           
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">{blog.title}</h1>
          <p className="text-lg text-secondary mb-6">{blog.excerpt}</p>

          <Button onClick={handleShare} variant="secondary" className='text-white' size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Article Content */}
        <div className="prose prose-gray text-secondary max-w-none"   dangerouslySetInnerHTML={{ __html: blog.content }} />

       {/* Related Articles */}
<div className="mt-12 pt-8 border-t border-border">
  <h3 className="text-2xl font-bold text-secondary mb-6">Related Articles</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {relatedBlogs
      .filter(b => b._id !== blog._id && b.category[0] === blog.category[0])
      .slice(0, 2)
      .map((relatedBlog) => (
        <Link key={relatedBlog._id} to={`/blogs/${relatedBlog._id}`} className="group block">
          <div className="aspect-video overflow-hidden rounded-lg mb-3">
            <img
              src={relatedBlog.image}
              alt={relatedBlog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h4 className="font-semibold text-secondary group-hover:text-primary transition-colors mb-2">
            {relatedBlog.title}
          </h4>
          <p className="text-sm text-secondary line-clamp-2">{relatedBlog.excerpt}</p>
        </Link>
      ))}

    {/* Fallback if no related blogs */}
    {relatedBlogs.filter(b => b._id !== blog._id && b.category[0] === blog.category[0]).length === 0 && (
      <p className="text-secondary">No related articles found.</p>
    )}
  </div>
</div>

      </div>
    </div>
  );
};

export default BlogDetail;
