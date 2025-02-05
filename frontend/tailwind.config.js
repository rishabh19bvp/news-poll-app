/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        accent: "#ff4500",
        lightbg: "#f8f9fa",
        darkbg: "#121212",
        cardlight: "#ffffff",
        carddark: "#1e1e1e",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};