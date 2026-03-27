import { useState } from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   

    try {
      setStatus("Sending...");
      const res = await fetch("https://backendskinmuse.vercel.app/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send message. Try again later.");
      }
    } catch (err) {
      console.error(err);
      setStatus("An error occurred. Try again later.");
    }finally {
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl text-secondary font-bold font-serif mb-10 text-center">
          Contact SKIN MUSE
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Info + Map */}
          <div className="space-y-6">
            {/* Phone */}
            <div className="p-3 md:p-2 border border-secondary rounded-lg shadow-lg bg-background/80 hover:shadow-xl transition-shadow">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-secondary font-serif">Phone</h2>
              <a href="tel:+923045077740" className="text-secondary hover:text-secondary transition-colors">
                +92 304 5077740
              </a>
            </div>

            {/* Email */}
            <div className="p-3 md:p-2 border border-secondary rounded-lg shadow-lg bg-background/80 hover:shadow-xl transition-shadow">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-secondary font-serif">Email</h2>
              <a href="mailto:info@skinmuse.pk" className="text-secondary hover:text-secondary transition-colors">
                info@skinmuse.pk
              </a>
            </div>

            {/* Social Media */}
            <div className="p-3 md:p-2 border border-secondary rounded-lg shadow-lg bg-background/80 hover:shadow-xl transition-shadow">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-secondary font-serif">Follow Us</h2>
              <div className="flex items-center mt-2">
                <a href="https://wa.me/923045077740" target="_blank" rel="noopener noreferrer" className="text-foreground text-2xl md:text-3xl hover:scale-110 transition-transform">
                  <FaWhatsapp />
                </a>
                <a href="https://www.instagram.com/skinmuse.pk/" target="_blank" rel="noopener noreferrer" className="text-foreground text-2xl md:text-3xl hover:scale-110 transition-transform">
                  <FaInstagram />
                </a>
              </div>
            </div>

            {/* Address + Map */}
            <div className="p-3 md:p-2 border border-secondary rounded-lg shadow-lg bg-background/80 hover:shadow-xl transition-shadow">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-secondary font-serif">Our Address</h2>
              <p className="text-secondary mb-3 text-sm md:text-base">
                5B People's Colony 2, Harian Wala Road, Faisalabad
              </p>
              <div className="w-full h-56 md:h-64 rounded-lg overflow-hidden border border-secondary shadow-lg">
                <iframe
                  title="SKIN MUSE Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12326.38193582384!2d73.09358988715817!3d31.40657999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392269b262b845fb%3A0xb7025144c404c56!2sSB%20Store!5e1!3m2!1sen!2s!4v1763793883534!5m2!1sen!2s"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="p-6 md:p-3 border border-secondary rounded-lg shadow-lg bg-background/80 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-secondary font-serif">Send Us a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 md:p-3 rounded border border-secondary bg-background text-secondary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary text-sm md:text-base"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 md:p-3 rounded border border-secondary bg-background text-secondary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary text-sm md:text-base"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 md:p-3 rounded border border-secondary bg-background text-secondary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary text-sm md:text-base"
                required
              ></textarea>
              <button
                type="submit"
                disabled={status === "Sending..."}
                className="bg-secondary text-background w-full py-3 md:py-4 rounded font-semibold hover:bg-secondary/90 transition-colors text-sm md:text-base"
              >
                Send Message
              </button>
              {status && <p className="text-xs md:text-sm mt-2 text-secondary">{status}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
