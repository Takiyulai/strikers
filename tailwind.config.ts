import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        club: {
          sky: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#0ea5e9",
            600: "#0284c7",
            700: "#0369a1",
            800: "#075985",
            900: "#0c4a6e",
          },
          green: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
          },
          navy: {
            50: "#f4f6fb",
            100: "#e6ebf5",
            200: "#c8d4e8",
            300: "#9db0d1",
            400: "#6b85b4",
            500: "#4a6699",
            600: "#39507d",
            700: "#2f4166",
            800: "#1b2942",
            900: "#0f1a2e",
            950: "#080f1d",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 26 46 / 0.08), 0 1px 2px -1px rgb(15 26 46 / 0.08)",
        "card-hover":
          "0 10px 25px -5px rgb(15 26 46 / 0.12), 0 8px 10px -6px rgb(15 26 46 / 0.08)",
      },
      backgroundImage: {
        "pitch-gradient":
          "linear-gradient(135deg, #0f1a2e 0%, #0c4a6e 55%, #0369a1 100%)",
        "hero-overlay":
          "linear-gradient(180deg, rgba(8,15,29,0.85) 0%, rgba(8,15,29,0.65) 45%, rgba(8,15,29,0.92) 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;