/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#C6A14A",
        dark: "#0E0E0E",
        matte: "#1A1A1A",
      },
      fontFamily: {
        luxury: ["Playfair Display", "serif"],
        body: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 20px 40px rgba(198,161,74,0.25)",
      },
    },
  },
  plugins: [],
};