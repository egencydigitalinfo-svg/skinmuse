import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        calluna: ['Avenir', 'Helvetica', 'Arial', 'sans-serif'], // <-- add this
      },

      colors: {
        border: "#000000",
        input: "#000000",
        ring: "#CE0000", // Red accent ring
        background: "#FFFFFF", // White background
        foreground: "#000000", // Black text
        primary: {
          DEFAULT: "#CE0000", // Red (Header, Footer, Banner)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#000000", // Black
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#FFFFFF", // White product backgrounds
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#CE0000",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
          primary: "#CE0000",
          "primary-foreground": "#FFFFFF",
          accent: "#CE0000",
          "accent-foreground": "#FFFFFF",
          border: "#000000",
          ring: "#CE0000",
        },
      },
      borderRadius: {
        lg: "0px", // Square boxes — no rounded corners
        md: "0px",
        sm: "0px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
