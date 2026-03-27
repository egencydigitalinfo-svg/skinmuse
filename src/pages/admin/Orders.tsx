"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  productId: { _id: string; name: string; price: number };
  quantity: number;
}

interface Order {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  phone?: string;
  province: string;
  paymentScreenshot?: string;
  method: "cod" | "jazzcash" | "easypaisa";
  status: "pending" | "paid" | "shipped" | "delivered" | "awaiting_verification";
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const token =
        localStorage.getItem("skinmuse_superadmin_token") ||
        localStorage.getItem("skinmuse_admin_token") ||
        "";
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get("https://backendskinmuse.vercel.app/api/orders", { headers });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    id: string,
    newStatus: "pending" | "paid" | "shipped" | "delivered"
  ) => {
    try {
      setStatusChange(id);
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";

      await axios.put(
        `https://backendskinmuse.vercel.app/api/orders/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );

      toast({
        title: `Order Updated`,
        description: `Status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }finally {
      setStatusChange(null);
    }
  };


  const handleDeleteOrder = async (id: string) => {
    try {
      setDeletingId(id);
      const token =
        localStorage.getItem("skinmuse_admin_token") ||
        localStorage.getItem("skinmuse_superadmin_token") ||
        "";
      await axios.delete(`https://backendskinmuse.vercel.app/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast({ title: "Order Deleted", description: "Order removed successfully", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // 🔹 Function to export filtered orders
  const exportToExcel = async (status: string) => {
    const ExcelJS = (await import("exceljs")).default;
    const { saveAs } = await import("file-saver");

  // 👇 NEW — export all orders
  const filtered =
    status === "all"
      ? orders
      : orders.filter((o) => o.status === status);

  if (filtered.length === 0) {
    alert(
      status === "all"
        ? "No orders available"
        : `No ${status} orders to export`
    );
    return;
  }

    const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(
    status === "all" ? "All Orders" : `${status} Orders`
  );

    // === Title Row ===
    sheet.mergeCells(1, 1, 1, 4);
    const titleCell = sheet.getCell("A1");
    titleCell.value = `${status.toUpperCase()} ORDERS`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "left" };

    // === Define all fields ===
    const fields = [
      { header: "Order ID", value: (o: any) => o._id },
      { header: "Customer Name", value: (o: any) => `${o.firstName} ${o.lastName}` },
      { header: "Email", value: (o: any) => o.email },
      { header: "Phone", value: (o: any) => o.phone || "-" },
      { header: "City", value: (o: any) => o.city },
      { header: "Address", value: (o: any) => o.address },
      { header: "Zip Code", value: (o: any) => o.zipCode },
      { header: "Payment Method", value: (o: any) => o.method === "cod" ? "Cash On Delivery" : "Online" },
      { header: "Total (Rs)", value: (o: any) => o.totalPrice?.toFixed(0) },
      { header: "Status", value: (o: any) => o.status },
      {
        header: "Created At",
        value: (o: any) => new Date(o.createdAt).toLocaleString(),
      },
      {
        header: "Updated At",
        value: (o: any) => new Date(o.updatedAt).toLocaleString(),
      },
    ];

    // Add dynamic items with size, color, and name
    const maxItems = Math.max(...filtered.map((o) => o.items.length));
    for (let i = 0; i < maxItems; i++) {
      fields.push({
        header: `Item ${i + 1}`,
        value: (o: any) => {
          const item = o.items[i];
          if (!item) return "";
          return `${item.product?.name || item.product} × ${item.quantity || ""} 
(Color: ${item.color || "-"}, Size: ${item.size || "-"})`;
        },
      });
    }

    // === Loop through each order ===
    let currentRow = 3;
    filtered.forEach((order, index) => {
      sheet.mergeCells(currentRow, 1, currentRow, 4);
      const orderTitle = sheet.getCell(currentRow, 1);
      orderTitle.value = `Order ${index + 1}`;
      orderTitle.font = { bold: true, size: 12 };
      orderTitle.alignment = { horizontal: "left" };
      currentRow++;

      for (let i = 0; i < fields.length; i += 4) {
        const group = fields.slice(i, i + 4);

        const headerRow = sheet.addRow(group.map((f) => f.header));
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCE6F1" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        const valueRow = sheet.addRow(group.map((f) => f.value(order)));
        valueRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        currentRow += 2;
      }

      sheet.addRow([]);
      currentRow++;
    });

    // Auto column width
    sheet.columns.forEach((col) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      col.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `${status === "all" ? "All" : status}_Orders.xlsx`
  );
};
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">📦 Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}
      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-6 justify-center sm:justify-start">
        <Button
          onClick={() => exportToExcel("all")}
          variant="outline"
          className="flex-1 sm:flex-none hover:bg-foreground"
        >
          All Orders
        </Button>
        <Button
          onClick={() => exportToExcel("pending")}
          variant="outline"
          className="flex-1 sm:flex-none hover:bg-foreground"
        >
          ⏳ Pending Orders
        </Button>
        <Button
          onClick={() => exportToExcel("shipped")}
          variant="outline"
          className="flex-1 sm:flex-none hover:bg-foreground"
        >
          🚚 Shipped Orders
        </Button>
        <Button
          onClick={() => exportToExcel("delivered")}
          variant="outline"
          className="flex-1 sm:flex-none hover:bg-foreground"
        >
          ✅ Delivered Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((order) => (
            <Card key={order._id} className="shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base truncate">
                  Order #{order._id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Status:</strong>{" "}
                  <Badge variant={
                    order.status === "delivered"
                      ? "default"
                      : order.status === "paid"
                        ? "secondary"
                        : "destructive"
                  } className="uppercase px-2 py-1 text-xs sm:text-sm">
                    {order.status}
                  </Badge>
                </p>
                <p><strong>Total:</strong> Rs {order.totalPrice.toFixed(0)}</p>
                <p><strong>Customer:</strong> {order.firstName} {order.lastName} ({order.email})</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Address:</strong> {order.address}, {order.city}, {order.province}, {order.zipCode}</p>
                <p><strong>Method:</strong> {order.method.toUpperCase()}</p>
                <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                {/* Payment Screenshot Link */}
                {order.paymentScreenshot && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Payment Screenshot:</p>
                    <a
                      href={order.paymentScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Screenshot
                    </a>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2">
                  {order.items.map((item, idx) => (
                    <Badge key={idx} className="bg-gray-100 text-gray-800">
                      {item.productId?.name || "Unknown"} × {item.quantity}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/** Awaiting Verification */}
                  {order.status === "awaiting_verification" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-foreground text-background hover:bg-foreground"
                      disabled={statusChange === order._id}
                      onClick={() => updateOrderStatus(order._id, "paid")} // mark verified
                    >
                      Verify Payment
                    </Button>
                  )}

                  {/** COD orders: pending → shipped */}
                  {order.status === "pending" && order.method === "cod" && (
                    <Button
                      size="sm"
                      variant="outline"
                       disabled={statusChange === order._id}
                      className="bg-foreground text-background hover:bg-foreground"
                      onClick={() => updateOrderStatus(order._id, "shipped")}
                    >
                      Mark Shipped
                    </Button>
                  )}

                  {/** Online payment orders: paid → shipped */}
                  {order.status === "paid" && order.method !== "cod" && (
                    <Button
                      size="sm"
                      variant="outline"
                       disabled={statusChange === order._id}
                      className="bg-foreground text-background hover:bg-foreground"
                      onClick={() => updateOrderStatus(order._id, "shipped")}
                    >
                      Mark Shipped
                    </Button>
                  )}

                  {/** Shipped → delivered */}
                  {order.status === "shipped" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-foreground text-background hover:bg-foreground"
                       disabled={statusChange === order._id}
                      onClick={() => updateOrderStatus(order._id, "delivered")}
                    >
                      Mark Delivered
                    </Button>
                  )}

                  {/** Delete button */}
                  {order.status !== "delivered" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-foreground text-background hover:bg-foreground"
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={deletingId === order._id}
                    >
                      {deletingId === order._id ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>


              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
