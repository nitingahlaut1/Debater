import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: "#0f172a",
        surfaceHover: "#1e293b",
        debaterA: {
          light: "#38bdf8",
          DEFAULT: "#0284c7",
          dark: "#0369a1",
          glow: "rgba(14, 165, 233, 0.35)",
        },
        debaterB: {
          light: "#fb7185",
          DEFAULT: "#e11d48",
          dark: "#be123c",
          glow: "rgba(244, 63, 94, 0.35)",
        },
        judge: {
          light: "#fde047",
          DEFAULT: "#eab308",
          dark: "#ca8a04",
          glow: "rgba(234, 179, 8, 0.35)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "arena-grid": "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-cyan": "glowCyan 2s ease-in-out infinite alternate",
        "glow-rose": "glowRose 2s ease-in-out infinite alternate",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        glowCyan: {
          "0%": { boxShadow: "0 0 15px rgba(14, 165, 233, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(14, 165, 233, 0.6)" },
        },
        glowRose: {
          "0%": { boxShadow: "0 0 15px rgba(244, 63, 94, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(244, 63, 94, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
