import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#ffd500",
          black: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(3px)" },
        },
        shine: {
          "0%": { transform: "translate3d(-100%, 0, 0) skewX(-18deg)" },
          "100%": { transform: "translate3d(300%, 0, 0) skewX(-18deg)" },
        },
      },
      animation: {
        "bounce-soft": "bounce-soft 1.8s ease-in-out infinite",
        shine: "shine 4s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
