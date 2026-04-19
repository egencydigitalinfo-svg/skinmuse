import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Heart, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import logoIcon from "@/assets/icon.png";
import axios from "axios";

const API_BASE = "https://skinmusebackend-delta.vercel.app/api";

const Header = () => {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]); // ✅ Dynamic categories
  const inputRef = useRef(null);

  // ── Fetch Announcements ──────────────────────────────────────────
  useEffect(() => {
    axios
      .get("https://backendskinmuse.vercel.app/api/announcements")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.announcements || [];
        const sorted = data.filter((a) => a.isActive).sort((a, b) => a.order - b.order);
        setAnnouncements(sorted);
        if (sorted.length) setCurrentIndex(0);
      })
      .catch((err) => console.error("Announcements error", err));
  }, []);

  // ── Fetch Categories from API ────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API_BASE}/category`)
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        // Sirf main categories (jin ka koi parent nahi)
        const mainCats = all.filter((cat) => !cat.parent_id);
        setCategories(mainCats);
      })
      .catch((err) => console.error("Category fetch error", err));
  }, []);

  // ── Announcement Ticker ──────────────────────────────────────────
  useEffect(() => {
    if (!announcements.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements]);

  // ── Search Popup Side Effects ────────────────────────────────────
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setSearchValue("");
    }
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  // ── Menu Items: Dynamic Categories + Static Links ────────────────
  const staticMenuItems = [
    { name: "All Brands", link: "/brands" },
    { name: "Blogs", link: "/blogs" },
    { name: "About", link: "/about" },
    { name: "Contact Us", link: "/contact" },
  ];

  const menuItems = [
    // ✅ _id use ho raha hai taake Products page filter sahi kaam kare
    ...categories.map((cat) => ({
      name: cat.title,
      link: `/products?category=${cat._id}`,
    })),
    ...staticMenuItems,
  ];

  return (
    <>
      {/* ===== SEARCH POPUP OVERLAY ===== */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-white/70 transition"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="w-[85%] max-w-2xl border-b-2 border-white flex items-center gap-4 pb-2"
          >
            <Search className="h-5 w-5 md:h-6 md:w-6 text-white/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-white placeholder:text-white/40 text-2xl outline-none w-full py-3"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="text-white/50 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>

          <p className="mt-5 text-white/30 text-sm tracking-wide">
            Press Enter to search &nbsp;·&nbsp; Esc to close
          </p>
        </div>
      )}

      {/* ===== MAIN HEADER ===== */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary backdrop-blur-md shadow-lg transition-all">

        {/* Announcement Bar */}
        {announcements.length > 0 && (
          <div className="py-2 overflow-hidden bg-secondary text-background w-full">
            <div className="flex whitespace-nowrap">
              {[0, 1].map((track) => (
                <div
                  key={track}
                  className="flex animate-marquee"
                  style={{ animationDuration: "40s" }}
                >
                  {Array(4).fill(0).map((_, i) => (
                    <span key={i} className="px-[100px]">
                      {announcements[currentIndex]?.message}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Bar */}
        {/* <div className="container flex h-16 items-center justify-between"> */}
        <div className="container px-3 md:px-6 flex h-14 md:h-16 items-center justify-between">
          <Link to="/" className="transition-opacity hover:opacity-80">
            <img
              src={logoIcon}
              alt="SKIN MUSE"
              className="h-[140px] w-[140px] md:h-[10rem] md:w-[10rem] drop-shadow-md"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className="text-sm font-medium text-background hover:text-background/80 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-background hover:text-background/80 hover:scale-110 transition"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-background hover:text-background/80 hover:scale-110 transition" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-semibold bg-secondary text-background rounded-full shadow-md">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-background hover:text-background/80 hover:scale-110 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-semibold bg-secondary text-background rounded-full shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-background hover:text-background/80"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary backdrop-blur-md border-t border-white/10">
            <nav className="flex flex-col items-center py-4 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.link}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium text-background hover:text-background/80 transition"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;