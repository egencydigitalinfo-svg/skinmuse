import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <footer className="border-t bg-primary mt-auto">
        <div className="container py-12 px-4 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

            {/* About */}
            <div>
              <h3 className="text-lg font-serif mb-4 text-background font-bold">SKIN MUSE</h3>
              <p className="text-sm text-background">
                Luxury skincare and makeup tailored to your unique skin type.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/products?category=skincare" className="text-background hover:text-background transition-colors">
                    Skincare
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=makeup" className="text-background hover:text-background transition-colors">
                    Makeup
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=bath%26" className="text-background hover:text-background transition-colors">
                    Bath & Body
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=haircare" className="text-background hover:text-background transition-colors">
                    Haircare
                  </Link>
                </li>
              </ul>
            </div>

            {/* Skin Types */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Skin Types</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/products?skinType=dry" className="text-background hover:text-background transition-colors">
                    Dry
                  </Link>
                </li>
                <li>
                  <Link to="/products?skinType=oily" className="text-background hover:text-background transition-colors">
                    Oily
                  </Link>
                </li>
                <li>
                  <Link to="/products?skinType=combination" className="text-background hover:text-background transition-colors">
                    Combination
                  </Link>
                </li>
                <li>
                  <Link to="/products?skinType=acne" className="text-background hover:text-background transition-colors">
                    Acne-Prone
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-background hover:text-background transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-background hover:text-background transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="text-background hover:text-background transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Contact</h4>
              <p className="text-sm text-background">
                <span className="font-semibold">Address:</span><br />
                5B People's Colony 2, Harian Wala Road, Faisalabad
              </p>
              <p className="text-sm text-background mt-2">
                <span className="font-semibold">Phone:</span>{" "}
                <a href="tel:+923045077740" className="hover:text-background transition-colors">
                  +92 304 5077740
                </a>
              </p>
              <p className="text-sm text-background mt-2">
                <span className="font-semibold">Email:</span>{" "}
                <a href="mailto:info@skinmuse.pk" className="hover:text-background transition-colors">
                  info@skinmuse.pk
                </a>
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <a href="https://wa.me/923045077740" target="_blank" rel="noopener noreferrer" className="text-background text-2xl sm:text-xl hover:scale-110 transition-transform">
                  <FaWhatsapp />
                </a>
                <a href="https://www.instagram.com/skinmuse.pk/" target="_blank" rel="noopener noreferrer" className="text-background text-2xl sm:text-xl hover:scale-110 transition-transform">
                  <FaInstagram />
                </a>
              </div>
            </div>

          </div>
        </div>
      </footer>

      <div className="pt-8 pb-8 border-t text-center bg-primary/90 text-sm text-background">
        © {new Date().getFullYear()} SKIN MUSE. All rights reserved. Developed By{" "}
        <Link to={"http://www.egencydigital.com"} target="_blank" className="text-background">
          Egency Digital
        </Link>
      </div>
    </>
  );
};

export default Footer;
