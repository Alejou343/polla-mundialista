import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#e6f3ea",
          100: "#bfe0c9",
          500: "#0E7C3A",
          600: "#02561c",
          700: "#015816",
          800: "#014611",
          900: "#06110b",
          950: "#040a06",
        },
        trophy: {
          50: "#fef9c3",
          100: "#fef08a",
          200: "#fde047",
          300: "#facc15",
          400: "#fbbf24",
          500: "#eab308",
          600: "#d97706",
          700: "#854d0e",
          800: "#4a2010",
        },
        stadium: {
          DEFAULT: "#0d1117",
          50: "#141414",
          100: "#111111",
          200: "#0b0d12",
          300: "#0a0a0a",
          400: "#080808",
          500: "#050505",
          900: "#000000",
        },
        ivory: {
          DEFAULT: "#FAF7F0",
          100: "#fef3c7",
          200: "#e2e8f0",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#94a3b8",
          soft: "#cbd5e1",
          border: "#334155",
        },
        success: {
          DEFAULT: "#16a34a",
          light: "#34d399",
          soft: "#6ee7b7",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          soft: "#fca5a5",
        },
        warning: {
          DEFAULT: "#d97706",
          light: "#fb923c",
          soft: "#fdba74",
        },
        info: {
          DEFAULT: "#1E88E5",
          light: "#38bdf8",
          soft: "#7dd3fc",
        },
        medal: {
          gold: "#fde047",
          silver: "#cbd5e1",
          bronze: "#cd7f32",
          bronzeDark: "#a0522d",
        },
        // Aliases retro-compat con la paleta anterior (irán saliendo a medida que migremos)
        cesped: "#0E7C3A",
        trofeo: "#fde047",
        cancha: "#ef4444",
        cielo: "#1E88E5",
        carbon: "#FAF7F0",
        marfil: "#0d1117",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "ui-sans-serif", "sans-serif"],
        headline: ["var(--font-oswald)", "var(--font-bebas)", "ui-sans-serif", "sans-serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      boxShadow: {
        trophy: "0 0 0 1px rgba(253,224,71,0.25), 0 8px 24px -8px rgba(253,224,71,0.35)",
        trophyGlow: "0 0 32px -4px rgba(250,204,21,0.45)",
        card: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px -12px rgba(0,0,0,0.6)",
        cardHover: "inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 40px -16px rgba(0,0,0,0.8)",
        ring: "0 0 0 2px rgba(253,224,71,0.4)",
        live: "0 0 0 2px rgba(56,189,248,0.35), 0 0 24px -6px rgba(56,189,248,0.5)",
      },
      backgroundImage: {
        "pitch-stripes":
          "linear-gradient(90deg, #015816 0px, #015816 48px, #014611 48px, #014611 96px)",
        "stadium-spotlight":
          "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.28), transparent 60%)",
        "trophy-halo": "radial-gradient(circle at 88% 12%, rgba(250,204,21,0.16), transparent 55%)",
        sheen: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        "card-top-glow": "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
        "image-fade": "linear-gradient(180deg, transparent 42%, rgba(4,8,18,0.6))",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        livePing: {
          "75%, 100%": {
            transform: "scale(2.4)",
            opacity: "0",
          },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "live-ping": "livePing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
