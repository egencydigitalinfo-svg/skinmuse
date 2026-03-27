import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!visible) return null;

  return (
    <Button
      variant={'outline'}  
      onClick={scrollToTop}
      className="fixed bottom-[100px] right-[33px] p-3 bg-secondary  text-white rounded-full hover:text-white border-secondary shadow-lg hover:bg-primary/90 transition"
      aria-label="Scroll to top"
    >
      <ChevronUp size={24} />
    </Button>
  );
};

export default ScrollTopButton;
