"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingBag, Truck } from "lucide-react";
import { Matrices } from "@/components/matrices";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Product { _id: string; name: string; }
interface User { _id: string; name: string; role: string; }
interface Order { _id: string; status: string; createdAt: string; userId: string; totalPrice:number; }

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("skinmuse_superadmin_token") ||
                    localStorage.getItem("skinmuse_admin_token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [prodRes, userRes, orderRes] = await Promise.all([
        axios.get("https://skinmusebackend-delta.vercel.app/api/products", { headers }),
        axios.get("https://skinmusebackend-delta.vercel.app/api/auth/users", { headers }),
        axios.get("https://skinmusebackend-delta.vercel.app/api/orders", { headers }),
      ]);

      const productList = Array.isArray(prodRes.data.products)
        ? prodRes.data.products
        : Array.isArray(prodRes.data)
          ? prodRes.data
          : [];

      const userList = Array.isArray(userRes.data.users)
        ? userRes.data.users
        : Array.isArray(userRes.data)
          ? userRes.data
          : [];

      const orderList = Array.isArray(orderRes.data.orders)
        ? orderRes.data.orders
        : Array.isArray(orderRes.data)
          ? orderRes.data
          : [];

      // Sort orders by date descending
      orderList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setProducts(productList);
      setUsers(user?.role === "superAdmin" ? userList : userList.filter(u => u.role === "customer"));
      setOrders(orderList);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Stats
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const shippedOrders = orders.filter(o => o.status === "shipped").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;

  const getOrdersPerDay = (orders: Order[]) => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const date = new Date(o.createdAt).toISOString().split("T")[0];
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, orders: count }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      <Matrices
        orders={orders}
        users={users}
        stats={{ totalOrders, pendingOrders, shippedOrders, deliveredOrders }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Orders Per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getOrdersPerDay(orders)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
