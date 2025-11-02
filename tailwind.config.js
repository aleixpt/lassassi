/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "murder-black": "#0b0b0d",
        "murder-deep": "#121213",
        "blood-red": "#c62828",
        "muted-gray": "#9aa0a6",
      },
    },
  },
  plugins: [],
}
