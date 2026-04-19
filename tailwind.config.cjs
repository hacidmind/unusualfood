/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryBlue: "#f97316",
        primaryBlack: "#0f0d0a",
        secondaryRed: "#ef4444",
        secondaryGreen: "#16a34a",
      },
      boxShadow: {
        panel: "0 8px 32px rgba(0, 0, 0, 0.6)",
        glow: "0 0 24px rgba(249, 115, 22, 0.35)",
        "glow-sm": "0 0 12px rgba(249, 115, 22, 0.2)",
      },
    }
  },
  plugins: []
};
