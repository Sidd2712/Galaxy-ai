import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0c0c0f",
          2: "#111116",
          3: "#16161d",
        },
        surface: {
          DEFAULT: "#1a1a23",
          2: "#22222e",
        },
        border: {
          DEFAULT: "#2a2a38",
          2: "#333345",
        },
        accent: {
          DEFAULT: "#7c6af7",
          2: "#a594ff",
          glow: "rgba(124,106,247,0.25)",
        },
        text: {
          DEFAULT: "#e8e8f0",
          2: "#9898b0",
          3: "#5a5a72",
        },
        success: "#3ddc97",
        danger: "#ff5f7a",
        warning: "#f5c842",
        info: "#4da6ff",
        node: {
          text: "#7c6af7",
          image: "#ff8c42",
          video: "#4da6ff",
          llm: "#3ddc97",
          crop: "#f5c842",
          extract: "#ff6eb4",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "node-glow": {
          "0%, 100%": { boxShadow: "0 0 16px rgba(245,200,66,0.3), 0 0 32px rgba(245,200,66,0.15)" },
          "50%": { boxShadow: "0 0 28px rgba(245,200,66,0.5), 0 0 56px rgba(245,200,66,0.25)" },
        },
        "edge-flow": {
          from: { strokeDashoffset: "18" },
          to: { strokeDashoffset: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.7)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "node-glow": "node-glow 1.2s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1s infinite",
        "slide-in": "slide-in 0.2s ease",
        "fade-in": "fade-in 0.2s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
