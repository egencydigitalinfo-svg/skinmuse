import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation(); // include search

  useEffect(() => {
    // Scroll top for non-admin routes, including query changes
    if (!pathname.startsWith("/admin")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, search]); // <-- add search here

  return null;
};

export default ScrollToTop;
