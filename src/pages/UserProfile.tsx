"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, logout, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch only current user's orders
  const fetchOrders = async () => {
    if (!user) return;

    try {
      const res = await axios.get(
        "https://skinmusebackend-delta.vercel.app/api/orders/myorders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("skinmuse_token") || ""
              }`,
          },
        }
      );

      const orderList = Array.isArray(res.data.orders)
        ? res.data.orders
        : Array.isArray(res.data)
          ? res.data
          : [];

      setOrders(orderList);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast({
        title: "Error",
        description: "Failed to fetch your orders",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchOrders();
    }
  }, [user, loading]);

  if (loading) {
    return <p className="text-center py-6">Loading profile...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />; // block if role mismatch
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-8">
        {/* Profile Info */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Name:</p>
              <p>{user.name}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{user.email}</p>
            </div>

            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">
                You have no orders yet.{" "}
                <Link to="/" className="text-brand-orange underline">
                  Start Shopping
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id || order.id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">Order #{order._id || order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                      <ul className="list-disc ml-5 text-sm">
                        {order.items.map((item) => {
                          const product =
                            item.product && typeof item.product === "object"
                              ? item.product
                              : { name: "Unknown Product" };

                          return (
                            <li
                              key={item.product?._id || item.product || Math.random()}
                              className="flex items-center justify-between gap-2"
                            >
                              <span>
                                {product.name} × {item.quantity}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Total: Rs {order.total.toFixed(0).toLocaleString()}
                      </p>

                      {/* Single "Write Review" button per order */}
                      {order.status === "Delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/reviews?orderId=${order._id}`)}
                          className="mt-2"
                        >
                          Write Review
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <p className="font-semibold">Rs {order.total.toFixed(0).toLocaleString()}</p>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Shipped"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
