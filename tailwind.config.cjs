/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryBlue: "#0D47A1",
        primaryBlack: "#0B0F19",
        secondaryRed: "#C62828",
        secondaryGreen: "#2E7D32"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0, 0, 0, 0.25)"
      }
    }
  },
  plugins: []
};
