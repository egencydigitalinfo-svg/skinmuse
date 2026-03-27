import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Heart, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import logoIcon from "@/assets/icon.png";
import axios from "axios";
import { Input } from "./ui/input";

const Header = () => {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    axios
      .get("https://backendskinmuse.vercel.app/api/announcements")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.announcements || [];

        const active = data.filter((a) => a.isActive);
        const sorted = active.sort((a, b) => a.order - b.order);

        setAnnouncements(sorted);
        if (sorted.length) setCurrentIndex(0);
      })
      .catch((err) => console.error("Announcements error", err));
  }, []);

  useEffect(() => {
    if (!announcements.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setIsMenuOpen(false);
    }
  };

  const menuItems = [
    { name: "Skincare", link: "/products?category=skincare" },
    { name: "Makeup", link: "/products?category=makeup" },
    { name: "Hair Care", link: "/products?category=haircare" },
    { name: "Bath & Body", link: "/products?category=bath%26body" },
    { name: "All Brands", link: "/brands" },
    { name: "Blogs", link: "/blogs" },
    { name: "About", link: "/about" },
    { name: "Contact Us", link: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary backdrop-blur-md shadow-lg transition-all">

      {/* === Announcement Bar === */}
      {announcements.length > 0 && (
        <div className="py-2 overflow-hidden bg-secondary text-background w-full">
          <div className="flex whitespace-nowrap">
            {[0, 1].map((track) => (
              <div
                key={track}
                className="flex animate-marquee"
                style={{ animationDuration: "40s" }}
              >
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="px-[100px]">
                      {announcements[currentIndex]?.message}
                    </span>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === Top Bar (Logo + Links + Icons) === */}
      <div className="container flex h-16 items-center justify-between">

       
          <Link to="/" className="transition-opacity hover:opacity-80">
            <img src={logoIcon} alt="SKIN MUSE" className="h-[12rem] w-[12rem] drop-shadow-md" />
          </Link>
      


        {/* Desktop Links */}
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
          {/* Wishlist */}
          <Link to="/wishlist" className="relative">
            <Heart className="h-6 w-6 text-background hover:text-background/80 hover:scale-110 transition" />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-semibold bg-secondary text-background rounded-full shadow-md">
                {totalWishlistItems}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <ShoppingBag className="h-6 w-6 text-background hover:text-background/80 hover:scale-110 transition" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-semibold bg-secondary text-background rounded-full shadow-md">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Menu Toggle (Mobile) */}
          <button
            className="md:hidden text-background hover:text-background/80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* === Desktop Search Bar === */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex w-2/5 mx-auto mb-3 relative"
      >
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-10 rounded-full bg-background text-foreground border border-secondary shadow-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button type="submit">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60" />
        </button>
      </form>

      {/* === Mobile Menu === */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary backdrop-blur-md border-t border-white/10">
          <nav className="flex flex-col items-center py-4 space-y-4">
            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="w-full px-6 pt-2 relative"
            >
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 rounded-full bg-background text-foreground border border-secondary shadow-sm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60" />
            </form>
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
  );
};

export default Header;
