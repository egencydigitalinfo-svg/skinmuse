import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingBag, Menu, X, LogOut, Layout, Newspaper, Paperclip, Currency, PinIcon, Clipboard, ClipboardListIcon, BarChart4, TypeIcon, Speaker, Code } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext"; // 👈 import auth context

export default function AdminLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // 👈 use logout function

  const links = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: "/admin/products", label: "Products", icon: <Package className="h-5 w-5" /> },
    { to: "/admin/blogs", label: "Blogs", icon: <Newspaper className="h-5 w-5" /> },
    { to: "/admin/brands", label: "Brands", icon: <ClipboardListIcon className="h-5 w-5" /> },
    { to: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingBag className="h-5 w-5" /> },
    { to: "/admin/banners", label: "Banners", icon: <Layout className="h-5 w-5" /> },
    { to: "/admin/category", label: "Categories", icon: <BarChart4 className="h-5 w-5" /> },
    { to: "/admin/skintype", label: "SkinTypes", icon: <TypeIcon className="h-5 w-5" /> },
    { to: "/admin/announcementBar", label: "Announcements", icon: <Speaker className="h-5 w-5" /> },
    { to: "/admin/promoCode", label: "Promo Codes", icon: <Code className="h-5 w-5" /> },
    { to: "/admin/reviews", label: "Reviews Management", icon: <Paperclip className="h-5 w-5" /> },


  ];

  const handleLogout = () => {
    logout(); // clear user + token
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop + mobile drawer) */}
      <div
        className={`
          ${showSidebar ? "fixed inset-0 z-50 flex" : "hidden"}
          lg:flex lg:relative lg:w-64 lg:flex-shrink-0
        `}
      >
        {/* Overlay (mobile only) */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>

        {/* Sidebar content */}
        <aside className="relative z-50 w-64 bg-white shadow-lg lg:shadow-none lg:border-r">
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h4 className="font-bold text-lg">Admin Panel</h4>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {links.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowSidebar(false)} // close on mobile
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                        ? "bg-secondary text-white"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-secondary"
                        }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (mobile only) */}
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm lg:hidden">
          <h1 className="font-bold text-lg">Admin</h1>
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
