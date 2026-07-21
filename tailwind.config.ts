import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        beige: "#F5F0E8",
        ivory: "#FFFCF7",
        ink: "#111111",
        brass: "#B08D57",
        "brass-light": "#C9A876",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Work Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17,17,17,0.06)",
        card: "0 4px 24px rgba(17,17,17,0.08)",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
