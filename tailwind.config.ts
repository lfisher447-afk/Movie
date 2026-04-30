import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content:[
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#fff1f2', 100: '#ffe4e6', 400: '#fb7185', DEFAULT: "#E50914", hover: "#B20710", glow: "rgba(229, 9, 20, 0.5)" },
        surface: { DEFAULT: "#070709", light: "#101218", lighter: "#1A1D24", border: "rgba(255,255,255,0.08)" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display:["Bebas Neue", "Oswald", "sans-serif"],
        nexus: ["Bebas Neue", "sans-serif"],
      },
      backgroundImage: {
        'nexus-gradient': "radial-gradient(circle at top center, rgba(229, 9, 20, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        'brand-glow': "0 0 40px -10px rgba(229, 9, 20, 0.5)",
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        reveal: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      }
    },
  },
  plugins:[],
};
export default config;
