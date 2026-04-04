"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ReviewsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    userName: "",
    email: "",
    city: "",
    rating: "",
    review: "",
  });

  const BACKEND_URL = "https://skinmusebackend-delta.vercel.app";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const token =
          localStorage.getItem("skinmuse_superadmin_token") ||
          localStorage.getItem("skinmuse_admin_token") ||
          "";
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(`${BACKEND_URL}/api/products`, {
          headers: authHeaders,
        });

        const fetchedProducts = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        setProducts(fetchedProducts);

        // Default user info from localStorage
        setNewReview({
          userName: localStorage.getItem("userName"),
          email: localStorage.getItem("userEmail"),
          city: localStorage.getItem("userCity"),
          rating: "",
          review: "",
        });
      } catch (err) {
        console.error("Error fetching products with reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // === Add Review ===
  const handleAddReview = async (productId: string) => {
    if (!newReview.review || !newReview.rating) {
      return toast("Please fill all fields before submitting.");
    }

    try {

      const token =
        localStorage.getItem("skinmuse_superadmin_token") ||
        localStorage.getItem("skinmuse_admin_token") ||
        "";
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${BACKEND_URL}/api/products/reviews`, {
        productId,
        rating: Number(newReview.rating),
        review: newReview.review,
        userName: newReview.userName,
        email: newReview.email,
        city: newReview.city,
      }, { headers: authHeaders });

      const addedReview = res.data?.review;

      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, reviews: [...(p.reviews || []), addedReview] }
            : p
        )
      );

      setNewReview((prev) => ({ ...prev, review: "", rating: "" }));
      setOpenModal(null);
      toast("✅ Review added successfully!");
    } catch (err) {
      console.error("Add review error:", err);
      toast("❌ Failed to add review. Please try again.");
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    try {
      const token =
        localStorage.getItem("skinmuse_superadmin_token") ||
        localStorage.getItem("skinmuse_admin_token") ||
        "";
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(
        `${BACKEND_URL}/api/products/reviews/${productId}/${reviewId}`,
        { headers: authHeaders }
      );

      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, reviews: p.reviews.filter((r: any) => r._id !== reviewId) }
            : p
        )
      );
      toast("✅ Review deleted successfully!");
    } catch (err) {
      console.error("Delete review error:", err);
      toast("❌ Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading product reviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        ⭐ Product Reviews
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <Card key={product._id} className="shadow-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* ✅ Product Image */}
                  {product.images ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg border">
                      No Image
                    </div>
                  )}

                  {/* ✅ Product Info */}
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Total Reviews: {product.reviews?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Add Review Button & Modal */}
                <Dialog
                  open={openModal === product._id}
                  onOpenChange={(open) => setOpenModal(open ? product._id : null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="mt-3 sm:mt-0">
                      + Add Review
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Review for {product.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Your Name</Label>
                        <Input
                          value={newReview.userName}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              userName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newReview.email}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>City</Label>
                        <Input
                          value={newReview.city}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              city: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Rating (1–5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={newReview.rating}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              rating: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Review</Label>
                        <Textarea
                          placeholder="Write your review..."
                          value={newReview.review}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              review: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => handleAddReview(product._id)}
                        className="mt-3"
                      >
                        Submit Review
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent className="space-y-3">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review: any, index: number) => (
                    <div
                      key={review._id || index}
                      className="p-3 border rounded-md bg-gray-50 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          {review.userName || "User"}{" "}
                          <span className="text-sm text-gray-500">
                            ({review.email}, {review.city})
                          </span>
                        </p>
                        <Badge>⭐ {review.rating}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        {review.comment || "No comment"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteReview(product._id, review._id)}
                      >
                        Delete
                      </Button>
                    </div>


                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No reviews yet for this product.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
