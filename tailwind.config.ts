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
          DEFAULT: "var(--bg)",
          2: "var(--bg-2)",
          3: "var(--bg-3)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        border: {
          DEFAULT: "var(--border)",
          2: "var(--border-2)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          2: "var(--accent-2)",
          glow: "var(--accent-glow)",
        },
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        info: "var(--info)",
        node: {
          text: "var(--node-text)",
          image: "var(--node-image)",
          video: "var(--node-video)",
          llm: "var(--node-llm)",
          crop: "var(--node-crop)",
          extract: "var(--node-extract)",
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