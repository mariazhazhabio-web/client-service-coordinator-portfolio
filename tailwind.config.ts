import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#eef2f9", 100: "#d6dff0", 200: "#adbfe0", 300: "#7d97c8", 400: "#4f6fae", 500: "#2f4f8f", 600: "#213b73", 700: "#182d5a", 800: "#112144", 900: "#0b1730", 950: "#070f20" },
        gold: { 50: "#fbf7ec", 100: "#f4ead0", 200: "#e9d5a1", 300: "#dcbc6c", 400: "#cfa548", 500: "#b98b30", 600: "#966d25", 700: "#72521e" },
        mist: { 50: "#f8f9fb", 100: "#f1f3f6", 200: "#e4e7ec", 300: "#cfd4dc", 400: "#9aa3b2", 500: "#6b7485", 600: "#4b5363" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      keyframes: { fadeUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "none" } } },
      animation: { "fade-up": "fadeUp .6s ease-out both" },
    },
  },
  plugins: [],
};
export default config;
