import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          DEFAULT: "#E50914", // Classic Netflix Red
          hover: "#B20710",
          glow: "rgba(229, 9, 20, 0.5)",
        },
        surface: {
          DEFAULT: "#070709", // Deep Space Black
          light: "#101218",   // Card Background
          lighter: "#1A1D24", // Hover Background
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Bebas Neue", "Oswald", "sans-serif"],
      },
      backgroundImage: {
        'nexus-gradient': "radial-gradient(circle at top center, rgba(229, 9, 20, 0.15) 0%, transparent 70%)",
        'glass-gradient': "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        'brand-glow': "0 0 40px -10px rgba(229, 9, 20, 0.5)",
        'inner-glass': "inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)', // Super smooth "expo" feel
        'bounce-nexus': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'subtle-float': 'float 8s ease-in-out infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
