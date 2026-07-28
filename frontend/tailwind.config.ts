import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0b0d17",
          card: "rgba(18, 22, 41, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(25, 31, 58, 0.85)",
        },
        quantum: {
          cyan: "#00f0ff",
          purple: "#9d4edd",
          magenta: "#ff007f",
          green: "#00ff9d",
          gold: "#ffb700",
          red: "#ff3b30",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        title: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        lg: "20px",
        md: "14px",
        sm: "8px",
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        cyan: "0 0 20px rgba(0, 240, 255, 0.35)",
        purple: "0 0 20px rgba(157, 78, 221, 0.35)",
        green: "0 0 20px rgba(0, 255, 157, 0.35)",
        gold: "0 0 20px rgba(255, 183, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
