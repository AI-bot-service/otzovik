import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0B",
          surface: "#141416",
          elevated: "#1C1C1F",
        },
        border: {
          DEFAULT: "#26262A",
          subtle: "#1C1C1F",
        },
        text: {
          primary: "#FAFAFA",
          muted: "#8A8A94",
          subtle: "#52525B",
        },
        accent: {
          DEFAULT: "#D1FF3C",
          hover: "#BCEC2A",
          muted: "#D1FF3C26",
        },
        positive: "#4ADE80",
        negative: "#F87171",
        neutral: "#A3A3B2",
        status: {
          pending: "#8A8A94",
          running: "#FBBF24",
          completed: "#4ADE80",
          failed: "#F87171",
        },
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        DEFAULT: "6px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 0 0 1px #26262A",
        "card-hover": "0 0 0 1px #3F3F45, 0 4px 24px rgba(0,0,0,0.4)",
        "accent-glow": "0 0 24px rgba(209,255,60,0.15)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-in": "fade-in 250ms ease",
        "slide-up": "slide-up 300ms cubic-bezier(0.4,0,0.2,1)",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
