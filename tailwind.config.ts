import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: "#023E8A",
          DEFAULT: "#0077B6",
          mid: "#0096C7",
          light: "#00B4D8",
        },
        turquoise: "#00B4D8",
        sky: "#48CAE4",
        foam: "#ADE8F4",
        sand: "#F0F8FF",
        "sand-warm": "#FAFCFF",
        "bg-base": "var(--bg-base)",
        "bg-card": "var(--bg-card)",
        "bg-sidebar": "var(--bg-sidebar)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,119,182,0.06), 0 4px 16px rgba(0,119,182,0.04)",
        "card-hover": "0 4px 20px rgba(0,119,182,0.14)",
        ocean: "0 4px 16px rgba(0,119,182,0.3)",
        "ocean-sm": "0 2px 8px rgba(0,150,199,0.25)",
        turquoise: "0 4px 16px rgba(0,180,216,0.3)",
      },
      backgroundImage: {
        "grad-ocean": "linear-gradient(135deg, #023E8A 0%, #0096C7 60%, #00B4D8 100%)",
        "grad-sky": "linear-gradient(135deg, #0096C7 0%, #48CAE4 100%)",
        "grad-foam": "linear-gradient(135deg, #48CAE4 0%, #ADE8F4 100%)",
        "grad-sidebar": "linear-gradient(180deg, #023E8A 0%, #0077B6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
