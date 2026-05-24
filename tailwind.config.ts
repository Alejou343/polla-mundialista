import type { Config } from "tailwindcss";

const cesped = "#0E7C3A";
const trofeo = "#F4C430";
const cancha = "#D32F2F";
const cielo = "#1E88E5";
const carbon = "#1A1A1A";
const marfil = "#FAF7F0";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cesped,
        trofeo,
        cancha,
        cielo,
        carbon,
        marfil,
        primary: cesped,
        accent: trofeo,
        error: cancha,
        info: cielo,
        ivory: marfil,
      },
      fontFamily: {
        headline: ["var(--font-bebas)", "Impact", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "knockout-gradient":
          "linear-gradient(135deg, #0E7C3A 0%, #F4C430 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
