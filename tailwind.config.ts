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
        brand: "#E50914",
        surface: "#0B0B0F",
        "surface-light": "#14181D",
        "surface-lighter": "#1B2026"
      },
      fontFamily: {
        sans:["Inter", "sans-serif"],
        display: ["Bebas Neue", "Oswald", "sans-serif"],
      },
    },
  },
  plugin:[],
};
export default config;