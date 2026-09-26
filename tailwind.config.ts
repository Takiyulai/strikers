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
        card: "0 1px 2px rgb(15 26 46 / 0.04), 0 10px 32px -18px rgb(15 26 46 / 0.22)",
        "card-hover":
          "0 22px 48px -24px rgb(15 26 46 / 0.32), 0 8px 20px -12px rgb(14 165 233 / 0.18)",
        glow: "0 16px 48px -18px rgb(14 165 233 / 0.6)",
      },
      backgroundImage: {
        "pitch-gradient":
          "linear-gradient(135deg, #080f1d 0%, #0c4a6e 58%, #0284c7 100%)",
        "hero-overlay":
          "linear-gradient(90deg, rgba(8,15,29,0.98) 0%, rgba(8,15,29,0.9) 42%, rgba(8,15,29,0.35) 74%, rgba(8,15,29,0.58) 100%)",
        "dashboard-glow":
          "radial-gradient(circle at 15% 0%, rgba(14,165,233,.1), transparent 34%), radial-gradient(circle at 90% 10%, rgba(34,197,94,.06), transparent 24%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
