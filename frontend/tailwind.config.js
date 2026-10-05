/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F6F5",
        ink: "#1C2321",
        muted: "#5B6664",
        ledger: {
          950: "#0B2B27",
          900: "#0E3630",
          800: "#12433C",
          700: "#17554C",
        },
        brand: {
          DEFAULT: "#0F5D52",
          light: "#E7F0EE",
          dark: "#0B4A41",
        },
        ochre: {
          DEFAULT: "#C97A2B",
          light: "#FBEEDD",
        },
        brick: {
          DEFAULT: "#B3432B",
          light: "#FBEAE5",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      letterSpacing: {
        tag: "0.08em",
      },
    },
  },
  plugins: [],
};
