"use client";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import React, { useState } from "react";

interface Order {
  createdAt: string;
  totalPrice: number;
  status: string;
}

interface User {
  _id: string;
  name: string;
  role: string;
}

interface MatricesProps {
  orders: Order[];
  users: User[];
  stats: {
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
  };
}

const Matrices = ({ orders, users, stats }: MatricesProps) => {
  const [range, setRange] = useState<"weekly" | "monthly" | "yearly">("weekly");

  /* ===== DATA GROUPING HELPERS ===== */
  const groupByWeek = () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const bookingsGrouped: Record<string, number> = {};
    const revenueGrouped: Record<string, number> = {};
    orders.forEach((o) => {
      const day = weekDays[new Date(o.createdAt).getDay()];
      bookingsGrouped[day] = (bookingsGrouped[day] || 0) + 1;
      revenueGrouped[day] = (revenueGrouped[day] || 0) + o.totalPrice;
    });
    return weekDays.map((d) => ({
      name: d,
      bookings: bookingsGrouped[d] || 0,
      revenue: revenueGrouped[d] || 0,
    }));
  };

  const groupByMonth = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const bookingsGrouped: Record<string, number> = {};
    const revenueGrouped: Record<string, number> = {};
    orders.forEach((o) => {
      const month = months[new Date(o.createdAt).getMonth()];
      bookingsGrouped[month] = (bookingsGrouped[month] || 0) + 1;
      revenueGrouped[month] = (revenueGrouped[month] || 0) + o.totalPrice;
    });
    return months.map((m) => ({
      name: m,
      bookings: bookingsGrouped[m] || 0,
      revenue: revenueGrouped[m] || 0,
    }));
  };

  const groupByYear = () => {
    const bookingsGrouped: Record<string, number> = {};
    const revenueGrouped: Record<string, number> = {};
    orders.forEach((o) => {
      const year = new Date(o.createdAt).getFullYear().toString();
      bookingsGrouped[year] = (bookingsGrouped[year] || 0) + 1;
      revenueGrouped[year] = (revenueGrouped[year] || 0) + o.totalPrice;
    });
    return Object.keys(bookingsGrouped).map((y) => ({
      name: y,
      bookings: bookingsGrouped[y],
      revenue: revenueGrouped[y],
    }));
  };

  const chartData =
    range === "weekly"
      ? groupByWeek()
      : range === "monthly"
      ? groupByMonth()
      : groupByYear();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-8">
      {/* ===== Metrics ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard title="Total Users" value={users.length} color="indigo" />
        <MetricCard title="Total Orders" value={orders.length} color="gray" />
        <MetricCard title="Delivered" value={stats.deliveredOrders} color="green" />
        <MetricCard title="Shipped" value={stats.shippedOrders} color="blue" />
        <MetricCard title="Pending" value={stats.pendingOrders} color="yellow" />
        <MetricCard
          title="Revenue"
          value={`Rs ${totalRevenue.toFixed(0).toLocaleString()}`}
          color="emerald"
        />
      </div>

      {/* ===== Toggle (Weekly / Monthly / Yearly) ===== */}
      <div className="flex gap-3 justify-end">
        {["weekly", "monthly", "yearly"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r as any)}
            className={`px-4 py-1 rounded-lg text-sm font-medium border ${
              range === r
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300"
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={`Orders (${range})`}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6366F1" }}
              />
              <CartesianGrid stroke="#374151" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Revenue (${range})`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
              <CartesianGrid stroke="#374151" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

/* ===== Metric Card Component ===== */
function MetricCard({
  title,
  value,
  color = "indigo",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow flex flex-col items-start">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </span>
      <span
        className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}
      >
        {value}
      </span>
    </div>
  );
}

/* ===== Chart Card Wrapper ===== */
function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow p-5 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

export { Matrices };
