import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "./pages/Home";
import Brands from "./pages/Brands";
import AdminProducts from "./pages/admin/Product";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ProductUploadForm from "./pages/addproduct";
import BrandUploadForm from "./pages/admin/addbrands";
import AdminRoute from "./pages/adminRoutes";
import AdminLayout from "./pages/admin/AdminLaoyout";
import Dashboard from "./pages/admin/Dashboard";
import AddProducts from "./pages/admin/addProduct";
import EditProduct from "./pages/admin/editProduct";
import Users from "./pages/admin/Users";
import ReviewsPage from "./pages/admin/Reviews";
import OrdersPage from "./pages/admin/Orders";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import BannerManager from "./pages/admin/Banners";
import BlogsForAdmin from "./pages/admin/BlogsForAdmin";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetails";
import EditBrandForm from "./pages/admin/editBrand";
import AdminBrands from "./pages/admin/Brands";
import ScrollTopButton from "./components/scrollButton";

const queryClient = new QueryClient();

import { FaWhatsapp } from "react-icons/fa";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import CategoryUploadForm from "./pages/admin/addcategories";
import AdminCategories from "./pages/admin/Categories";
import SkinTypeUploadForm from "./pages/admin/addskintype";
import SkinTypes from "./pages/admin/SkinTypes";
import EditCategoryForm from "./pages/admin/editCategory";
import SkinTypeEditForm from "./pages/admin/editSkinType";
import AdminAnnouncementManager from "./pages/admin/AdminAnnouncementManager";
import AdminPromoMinPage from "./pages/admin/AdminPromoPage";
import WelComeAfterOrder from "./pages/Welcome";
import TermsAndConditions from "./pages/TermsAndConditions";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/create" element={<ProductUploadForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/welcome" element={<WelComeAfterOrder />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="addProduct" element={<AddProducts />} />
              <Route path="editProduct/:productId" element={<EditProduct />} />
              <Route path="users" element={<Users />} />
              <Route path="brandCreate" element={<BrandUploadForm />} />
              <Route path="editBrand/:brandId" element={<EditBrandForm />} />
              <Route path="banners" element={<BannerManager />} />
              <Route path="category" element={<AdminCategories />} />
              <Route path="categoryAdd" element={<CategoryUploadForm />} />
              <Route path="editCategory/:categoryId" element={<EditCategoryForm />} />
              <Route path="skinType" element={<SkinTypes />} />
              <Route path="skinTypeAdd" element={<SkinTypeUploadForm />} />
              <Route path="editSkinType/:skinTypeId" element={<SkinTypeEditForm />} />
              <Route path="announcementBar" element={<AdminAnnouncementManager />}/>
              <Route path="promoCode" element={<AdminPromoMinPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="blogs" element={<BlogsForAdmin />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="Brands" element={<AdminBrands />} />
            </Route>
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ScrollTopButton />}
      

      {/* WhatsApp Floating Icon */}
      {!isAdminRoute && (
        <a
          href="https://wa.me/+923045077740"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50"
        >
          <FaWhatsapp size={24} />
        </a>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AppContent />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
