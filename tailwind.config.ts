import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content:["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#E50914", hover: "#F50914", glow: "rgba(229, 9, 20, 0.4)" },
        surface: { DEFAULT: "#070709", light: "#101218", lighter: "#1A1D24", border: "#252A34" }
      },
      fontFamily: {
        sans:["Inter", "sans-serif"],
        display: ["Bebas Neue", "Oswald", "sans-serif"],
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } }
      }
    },
  },
  plugins:[],
};
export default config;
